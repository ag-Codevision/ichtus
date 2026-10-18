<#
.SYNOPSIS
    Script de Deploy Automatizado para VPS — Plataforma Icthus
.DESCRIPTION
    Lê os dados de acesso da VPS definidos no arquivo .env
    e executa o empacotamento, envio e deploy via Docker na VPS.
#>

[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "  🚀 DEPLOY AUTOMATIZADO ICTHUS — VPS PRODUÇÃO" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan

# 1. Carregar variáveis do arquivo .env
$envPath = Join-Path $PSScriptRoot "..\.env"
if (-not (Test-Path $envPath)) {
    Write-Error "❌ Arquivo .env não encontrado em $envPath"
    exit 1
}

$envVars = @{}
Get-Content $envPath -Encoding UTF8 | ForEach-Object {
    $line = $_.Trim()
    if ($line -and -not ($line.StartsWith("#"))) {
        $parts = $line.Split("=", 2)
        if ($parts.Count -eq 2) {
            $key = $parts[0].Trim()
            $val = $parts[1].Trim().Trim('"').Trim("'")
            $envVars[$key] = $val
        }
    }
}

$vpsHost = if ($envVars["VPS_HOST"]) { $envVars["VPS_HOST"] } else { "72.62.141.188" }
$vpsPort = if ($envVars["VPS_PORT"]) { $envVars["VPS_PORT"] } else { "22" }
$vpsUser = if ($envVars["VPS_USER"]) { $envVars["VPS_USER"] } else { "root" }
$vpsDeployPath = if ($envVars["VPS_DEPLOY_PATH"]) { $envVars["VPS_DEPLOY_PATH"] } else { "/opt/glessios" }

Write-Host "📋 Configurações detectadas:" -ForegroundColor Yellow
Write-Host "   • Host VPS:     $vpsHost"
Write-Host "   • Porta SSH:    $vpsPort"
Write-Host "   • Usuário:      $vpsUser"
Write-Host "   • Destino VPS:  $vpsDeployPath"
Write-Host ""

# 2. Testar conexão SSH
Write-Host "🔌 Testando conexão SSH com $vpsUser@$vpsHost..." -ForegroundColor Cyan
$testResult = ssh -o StrictHostKeyChecking=no -o ConnectTimeout=8 -p $vpsPort "$vpsUser@$vpsHost" "echo SSH_CONECTADO_COM_SUCESSO"
if ($testResult -notmatch "SSH_CONECTADO_COM_SUCESSO") {
    Write-Error "❌ Falha na autenticação SSH com $vpsHost."
    exit 1
}
Write-Host "✅ Conexão SSH bem-sucedida!" -ForegroundColor Green

# 3. Criar pasta de destino na VPS se não existir
Write-Host "📁 Garantindo estrutura de pastas na VPS..." -ForegroundColor Cyan
ssh -o StrictHostKeyChecking=no -p $vpsPort "$vpsUser@$vpsHost" "mkdir -p $vpsDeployPath"

# 4. Empacotar arquivos do projeto
$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$tempArchive = Join-Path $env:TEMP "icthus-deploy-$(Get-Date -Format yyyyMMddHHmmss).tar.gz"

Write-Host "📦 Empacotando arquivos do projeto para upload..." -ForegroundColor Cyan
Push-Location $projectRoot
try {
    tar --exclude=".git" --exclude="node_modules" --exclude=".next" --exclude="*.log" --exclude="*.tmp" -czf $tempArchive .
    if (-not (Test-Path $tempArchive)) {
        Write-Error "❌ Falha ao criar arquivo de pacote em $tempArchive"
        exit 1
    }
    $sizeMb = [Math]::Round((Get-Item $tempArchive).Length / 1MB, 2)
    Write-Host "✅ Pacote criado com sucesso: $sizeMb MB" -ForegroundColor Green
} finally {
    Pop-Location
}

# 5. Enviar pacote para a VPS
Write-Host "📤 Enviando pacote para $vpsUser@${vpsHost}:$vpsDeployPath..." -ForegroundColor Cyan
scp -o StrictHostKeyChecking=no -P $vpsPort $tempArchive "$vpsUser@${vpsHost}:$vpsDeployPath/deploy.tar.gz"
Remove-Item $tempArchive -Force -ErrorAction SilentlyContinue

# 6. Descompactar e iniciar deploy na VPS
Write-Host "🏗️ Extraindo arquivos e disparando deploy na VPS..." -ForegroundColor Cyan
$remoteScript = "cd $vpsDeployPath && tar -xzf deploy.tar.gz && rm -f deploy.tar.gz && chmod +x scripts/deploy.sh && ./scripts/deploy.sh"
ssh -o StrictHostKeyChecking=no -p $vpsPort "$vpsUser@$vpsHost" $remoteScript

Write-Host ""
Write-Host "=================================================================" -ForegroundColor Green
Write-Host "  🎉 DEPLOY CONCLUÍDO COM SUCESSO!" -ForegroundColor Green
Write-Host "  🌐 Aplicação ativa na VPS: http://$vpsHost" -ForegroundColor Green
Write-Host "=================================================================" -ForegroundColor Green
