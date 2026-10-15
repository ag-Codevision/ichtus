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

# 3. Build das Imagens e Inicialização dos Containers
echo "📦 Construindo containers de produção..."
$DOCKER_COMPOSE -f docker-compose.prod.yml build --no-cache

echo "🔄 Subindo serviços (PostgreSQL, Next.js e Nginx)..."
$DOCKER_COMPOSE -f docker-compose.prod.yml up -d

# 4. Aguarda a estabilização do banco de dados
echo "⏳ Aguardando prontidão do PostgreSQL..."
sleep 5

# 5. Execução de Migrações do Prisma
echo "🗄️ Aplicando migrações do banco de dados Prisma..."
$DOCKER_COMPOSE -f docker-compose.prod.yml exec -T app npx prisma db push --skip-generate

# 6. Health Check do Endpoint
echo "🔍 Realizando Health Check da aplicação..."
HEALTH_URL="http://localhost:3000/api/v1/health"
MAX_RETRIES=10
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

echo "✅ Deploy concluído com sucesso!"
echo "🌐 Plataforma Glessios operacional em produção."
