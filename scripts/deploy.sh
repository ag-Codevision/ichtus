#!/usr/bin/env bash
# =============================================================================
# Script de Deploy Automatizado para VPS — Glessios Comunicação Visual
# =============================================================================

set -e

echo "🚀 Iniciando processo de deploy da plataforma Glessios..."

# 1. Checagem de Pré-Requisitos
if ! command -v docker &> /dev/null; then
    echo "❌ Erro: Docker não está instalado nesta máquina."
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Erro: Docker Compose não está instalado."
    exit 1
fi

# Define comando do docker compose
DOCKER_COMPOSE="docker compose"
if ! docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
fi

# 2. Verificação de Arquivo de Ambiente (.env)
if [ ! -f .env ]; then
    echo "⚠️ Arquivo .env não encontrado. Copiando de .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "⚠️ Configure suas chaves no .env antes de rodar o deploy definitivo!"
    fi
fi

# 2.1 Garantir diretório de uploads com permissão total de escrita
mkdir -p ./public/uploads/leads
chmod -R 777 ./public/uploads 2>/dev/null || true

# 3. Limpeza Preventiva de Disco e Build das Imagens
echo "🧹 Executando limpeza preventiva de cache do Docker..."
docker builder prune -af 2>/dev/null || true
docker image prune -f 2>/dev/null || true

echo "📦 Construindo containers de produção com isolamento de recursos..."
$DOCKER_COMPOSE -f docker-compose.prod.yml build

echo "🔄 Subindo serviços isolados (PostgreSQL e Next.js)..."
$DOCKER_COMPOSE -f docker-compose.prod.yml up -d

# 4. Aguarda a estabilização do banco de dados
echo "⏳ Aguardando prontidão do PostgreSQL..."
sleep 5

# 5. Execução de Migrações do Prisma
echo "🗄️ Aplicando migrações do banco de dados Prisma..."
$DOCKER_COMPOSE -f docker-compose.prod.yml run --rm migrator npx prisma db push || true

# 6. Health Check do Endpoint (Porta 3005 do Glessios no Host)
echo "🔍 Realizando Health Check da aplicação..."
HEALTH_URL="http://localhost:3005/api/v1/health"
MAX_RETRIES=12
COUNT=0

until curl -s -f "$HEALTH_URL" > /dev/null || [ $COUNT -eq $MAX_RETRIES ]; do
    echo "Aguardando inicialização da aplicação... ($((COUNT+1))/$MAX_RETRIES)"
    sleep 3
    COUNT=$((COUNT+1))
done

if [ $COUNT -eq $MAX_RETRIES ]; then
    echo "❌ Falha no Health Check após $MAX_RETRIES tentativas."
    echo "Exibindo logs recentes do container app:"
    $DOCKER_COMPOSE -f docker-compose.prod.yml logs --tail=50 app
    exit 1
fi

# 7. Garantir integridade do Proxy Reverso Central do Host
if command -v systemctl &> /dev/null; then
    if ! systemctl is-active --quiet nginx; then
        echo "⚠️ Nginx do host estava inativo. Reativando para preservar outros projetos..."
        systemctl restart nginx || true
    fi
fi

echo "✅ Deploy concluído com sucesso!"
echo "🌐 Plataforma Glessios operacional e isolada em produção."