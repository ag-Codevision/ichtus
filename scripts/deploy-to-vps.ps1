<#
.SYNOPSIS
    Script de Deploy Automatizado para VPS — Plataforma Glessios
.DESCRIPTION
    Lê os dados de acesso da VPS e do ambiente de produção definidos no arquivo .env
    e executa o empacotamento, envio, configuração e deploy via Docker na VPS.
#>

[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "  🚀 DEPLOY AUTOMATIZADO GLESSIOS — VPS PRODUÇÃO" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan

# 1. Carregar variáveis do arquivo .env
$envPath = Join-Path $PSScriptRoot "..\.env"
if (-not (Test-Path $envPath)) {
    Write-Error "❌ Arquivo .env não encontrado em $envPath"
    exit 1
}

$envVars = @{}
Get-Content $envPath | ForEach-Object {
    $line = $_.Trim()
    if ($line -and -not ($line.StartsWith("#"))) {
        $parts = $line -split "=", 2
        if ($parts.Count -eq 2) {
            $key = $parts[0].Trim()
            $val = $parts[1].Trim().Trim('"').Trim("'")
            $envVars[$key] = $val
        }
    }
}

$vpsHost = $envVars["VPS_HOST"]
$vpsPort = if ($envVars["VPS_PORT"]) { $envVars["VPS_PORT"] } else { "22" }
$vpsUser = if ($envVars["VPS_USER"]) { $envVars["VPS_USER"] } else { "root" }
$vpsKeyPath = $envVars["VPS_SSH_KEY_PATH"]
$vpsDeployPath = if ($envVars["VPS_DEPLOY_PATH"]) { $envVars["VPS_DEPLOY_PATH"] } else { "/var/www/glessios" }

if (-not $vpsHost -or $vpsHost -eq "seu-ip-ou-dominio.com.br") {
    Write-Error "❌ VPS_HOST não configurado ou com valor padrão no .env. Por favor, preencha o IP/domínio da VPS no .env."
    exit 1
}

Write-Host "📋 Configurações detectadas no .env:" -ForegroundColor Yellow
Write-Host "   • Host VPS:     $vpsHost"
Write-Host "   • Porta SSH:    $vpsPort"
Write-Host "   • Usuário:      $vpsUser"
Write-Host "   • Destino VPS:  $vpsDeployPath"
Write-Host "   • Chave SSH:    $vpsKeyPath"
Write-Host ""

# 2. Configurar opções de SSH
$sshArgs = @("-p", $vpsPort, "-o", "StrictHostKeyChecking=no")
if ($vpsKeyPath -and (Test-Path $vpsKeyPath)) {
    $sshArgs += @("-i", $vpsKeyPath)
}

$scpArgs = @("-P", $vpsPort, "-o", "StrictHostKeyChecking=no")
if ($vpsKeyPath -and (Test-Path $vpsKeyPath)) {
    $scpArgs += @("-i", $vpsKeyPath)
}

# 3. Testar conexão SSH
Write-Host "🔌 Testando conexão SSH com $vpsUser@$vpsHost..." -ForegroundColor Cyan
try {
    $testResult = & ssh @sshArgs -o ConnectTimeout=8 "$vpsUser@$vpsHost" "echo 'SSH_CONECTADO_COM_SUCESSO'"
    if ($testResult -notmatch "SSH_CONECTADO_COM_SUCESSO") {
        Write-Error "❌ Falha na autenticação SSH com $vpsHost."
        exit 1
    }
    Write-Host "✅ Conexão SSH bem-sucedida!" -ForegroundColor Green
} catch {
    Write-Error "❌ Não foi possível conectar na VPS ($vpsHost:$vpsPort): $_"
    exit 1
}

# 4. Criar pasta de destino na VPS
Write-Host "📁 Garantindo estrutura de pastas na VPS..." -ForegroundColor Cyan
& ssh @sshArgs "$vpsUser@$vpsHost" "mkdir -p $vpsDeployPath"

# 5. Empacotar arquivos do projeto (excluindo dependências e builds locais)
$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$tempArchive = Join-Path $env:TEMP "glessios-deploy-$(Get-Date -Format yyyyMMddHHmmss).tar.gz"

Write-Host "📦 Empacotando arquivos do projeto para upload..." -ForegroundColor Cyan
Push-Location $projectRoot
try {
    & tar --exclude='.git' `
          --exclude='node_modules' `
          --exclude='.next' `
          --exclude='*.log' `
          --exclude='*.tmp' `
          -czf $tempArchive .
    Write-Host "✅ Pacote criado: $([Math]::Round((Get-Item $tempArchive).Length / 1MB, 2)) MB" -ForegroundColor Green
} finally {
    Pop-Location
}

# 6. Enviar pacote para a VPS
Write-Host "📤 Enviando pacote para $vpsHost:$vpsDeployPath..." -ForegroundColor Cyan
& scp @scpArgs $tempArchive "$vpsUser@$vpsHost`:$vpsDeployPath/deploy.tar.gz"
Remove-Item $tempArchive -Force -ErrorAction SilentlyContinue

# 7. Criar arquivo .env de produção na VPS
Write-Host "⚙️ Configurando variáveis de ambiente de produção na VPS..." -ForegroundColor Cyan
$prodEnvContent = @"
# PRODUÇÃO - AMBIENTE DOCKER GLESSIOS
NODE_ENV=production
PORT=3000

# BANCO DE DADOS POSTGRESQL
POSTGRES_USER=$($envVars["POSTGRES_USER"])
POSTGRES_PASSWORD=$($envVars["POSTGRES_PASSWORD"])
POSTGRES_DB=$($envVars["POSTGRES_DB"])
DATABASE_URL=postgresql://$($envVars["POSTGRES_USER"]):$($envVars["POSTGRES_PASSWORD"])@postgres:5432/$($envVars["POSTGRES_DB"])?schema=public

# AUTENTICAÇÃO NEXTAUTH
NEXTAUTH_URL=$($envVars["PRODUCTION_NEXTAUTH_URL"])
NEXTAUTH_SECRET=$($envVars["PRODUCTION_NEXTAUTH_SECRET"])

# APIS E SERVIÇOS
NVIDIA_API_KEY=$($envVars["NVIDIA_API_KEY"])
NVIDIA_MODEL=$($envVars["NVIDIA_MODEL"])
UNSPLASH_ACCESS_KEY=$($envVars["UNSPLASH_ACCESS_KEY"])
WACLI_API_URL=$($envVars["WACLI_API_URL"])
CRON_SECRET=$($envVars["CRON_SECRET"])
"@

$tempProdEnv = Join-Path $env:TEMP "glessios-prod-env.tmp"
Set-Content -Path $tempProdEnv -Value $prodEnvContent -Encoding UTF8
& scp @scpArgs $tempProdEnv "$vpsUser@$vpsHost`:$vpsDeployPath/.env"
Remove-Item $tempProdEnv -Force -ErrorAction SilentlyContinue

# 8. Descompactar e iniciar deploy na VPS
Write-Host "🏗️ Extraindo arquivos e disparando deploy na VPS..." -ForegroundColor Cyan
$remoteCommands = @"
set -e
cd $vpsDeployPath
tar -xzf deploy.tar.gz
rm -f deploy.tar.gz
chmod +x scripts/deploy.sh
./scripts/deploy.sh
"@

& ssh @sshArgs "$vpsUser@$vpsHost" $remoteCommands

Write-Host ""
Write-Host "=================================================================" -ForegroundColor Green
Write-Host "  🎉 DEPLOY CONCLUÍDO COM SUCESSO!" -ForegroundColor Green
Write-Host "  🌐 Aplicação ativa em: $($envVars['PRODUCTION_NEXTAUTH_URL'])" -ForegroundColor Green
Write-Host "=================================================================" -ForegroundColor Green
