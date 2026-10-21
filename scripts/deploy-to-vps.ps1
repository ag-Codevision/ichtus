$ErrorActionPreference = "Stop"

$vpsHost = "72.62.141.188"
$vpsPort = "22"
$vpsUser = "root"
$vpsDeployPath = "/opt/glessios"

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "  DEPLOY AUTOMATIZADO ICTHUS - VPS PRODUCAO & GITHUB BACKUP" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "Configuracoes:" -ForegroundColor Yellow
Write-Host "  - Host VPS:    $vpsHost"
Write-Host "  - Porta:       $vpsPort"
Write-Host "  - Usuario:     $vpsUser"
Write-Host "  - Destino:     $vpsDeployPath"
Write-Host ""

# 0. Sincronizar backup no GitHub antes de subir para a VPS
Write-Host "-----------------------------------------------------------------" -ForegroundColor DarkGray
Write-Host "Sincronizando backup no GitHub (https://github.com/ag-Codevision/ichtus.git)..." -ForegroundColor Cyan
try {
    $currentBranch = (git rev-parse --abbrev-ref HEAD 2>$null)
    if (-not $currentBranch) { $currentBranch = "main" }
    git push origin $currentBranch
    Write-Host "Backup no GitHub atualizado com sucesso na branch '$currentBranch'!" -ForegroundColor Green
} catch {
    Write-Host "Aviso ao sincronizar com GitHub: $_" -ForegroundColor Yellow
}
Write-Host "-----------------------------------------------------------------" -ForegroundColor DarkGray
Write-Host ""

# 1. Testar conexao SSH
Write-Host "Testando conexao SSH com $vpsUser@$vpsHost..." -ForegroundColor Cyan
$testResult = ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 -p $vpsPort "$vpsUser@$vpsHost" "echo SSH_CONECTADO_COM_SUCESSO"
if ($testResult -notmatch "SSH_CONECTADO_COM_SUCESSO") {
    Write-Error "Falha na conexao SSH com $vpsHost."
    exit 1
}
Write-Host "Conexao SSH estabelecida com sucesso!" -ForegroundColor Green

# 2. Criar pasta de destino na VPS se nao existir
Write-Host "Criando diretorio de destino na VPS ($vpsDeployPath)..." -ForegroundColor Cyan
ssh -o StrictHostKeyChecking=no -p $vpsPort "$vpsUser@$vpsHost" "mkdir -p $vpsDeployPath"

# 3. Empacotar projeto local
$projectRoot = "F:\_CLIENTES\Glessios\Site"
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$tempArchive = Join-Path $env:TEMP "icthus-deploy-$timestamp.tar.gz"

Write-Host "Gerando pacote tar.gz do projeto local..." -ForegroundColor Cyan
Push-Location $projectRoot
try {
    tar --exclude=".git" --exclude="*node_modules*" --exclude="*auth_info*" --exclude=".next" --exclude="*.log" --exclude="*.tmp" -czf $tempArchive .
    if (-not (Test-Path $tempArchive)) {
        Write-Error "Falha ao criar arquivo de pacote em $tempArchive"
        exit 1
    }
    $sizeMb = [Math]::Round((Get-Item $tempArchive).Length / 1MB, 2)
    Write-Host "Pacote gerado com sucesso: $sizeMb MB" -ForegroundColor Green
} finally {
    Pop-Location
}

# 4. Enviar pacote para a VPS via SCP
Write-Host "Enviando pacote para $vpsUser@${vpsHost}:$vpsDeployPath..." -ForegroundColor Cyan
scp -O -o StrictHostKeyChecking=no -P $vpsPort $tempArchive "$vpsUser@${vpsHost}:$vpsDeployPath/deploy.tar.gz"
Remove-Item $tempArchive -Force -ErrorAction SilentlyContinue
Write-Host "Upload concluido com sucesso!" -ForegroundColor Green

# 5. Descompactar e iniciar deploy na VPS
Write-Host "Extraindo arquivos e executando deploy via Docker na VPS..." -ForegroundColor Cyan
$cmd1 = "cd " + $vpsDeployPath
$cmd2 = "tar -xzf deploy.tar.gz"
$cmd3 = "rm -f deploy.tar.gz"
$cmd4 = "sed -i 's/\r$//' scripts/deploy.sh 2>/dev/null || true"
$cmd5 = "chmod +x scripts/deploy.sh"
$cmd6 = "./scripts/deploy.sh"
$fullRemoteCmd = "$cmd1 && $cmd2 && $cmd3 && $cmd4 && $cmd5 && $cmd6"

ssh -o StrictHostKeyChecking=no -p $vpsPort "$vpsUser@$vpsHost" $fullRemoteCmd

Write-Host ""
Write-Host "=================================================================" -ForegroundColor Green
Write-Host "  DEPLOY CONCLUIDO COM SUCESSO!" -ForegroundColor Green
Write-Host "  - Backup GitHub: https://github.com/ag-Codevision/ichtus.git" -ForegroundColor Green
Write-Host "  - Aplicacao ativa na VPS: https://icthusbrasil.com (http://$vpsHost:3005)" -ForegroundColor Green
Write-Host "=================================================================" -ForegroundColor Green
