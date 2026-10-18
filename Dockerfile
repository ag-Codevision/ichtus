# syntax=docker/dockerfile:1
# -----------------------------------------------------------------------------
# Dockerfile Multi-Stage de Produção — Glessios Comunicação Visual
# Plataforma Web Integrada (Next.js 15 App Router + Prisma ORM + PostgreSQL)
# -----------------------------------------------------------------------------

# Estágio 1: Dependências
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY package.json package-lock.json tsconfig.json* ./
COPY prisma ./prisma/

RUN npm ci

# Estágio 2: Compilação / Builder
FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache openssl

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Desativa telemetria durante o build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Gera o Prisma Client
RUN npx prisma generate

# Executa o build de produção standalone
RUN npm run build

# Estágio 3: Runner de Produção
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
RUN apk add --no-cache openssl curl

# Copia artefatos públicos e standalone
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Assegura que o diretório de uploads exista com permissão de escrita
RUN mkdir -p ./public/uploads/leads && chown -R nextjs:nodejs ./public

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:3000/api/v1/health || exit 1

CMD ["node", "server.js"]
