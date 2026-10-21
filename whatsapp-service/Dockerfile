# -----------------------------------------------------------------------------
# Microserviço WhatsApp Baileys Multi-Device — Icthus Comunicação Visual
# -----------------------------------------------------------------------------
FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache curl openssl

COPY package.json ./

RUN npm install --omit=dev

COPY server.js ./

RUN mkdir -p /app/auth_info

EXPOSE 3001

HEALTHCHECK --interval=20s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

CMD ["node", "server.js"]
