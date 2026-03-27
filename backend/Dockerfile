# ─── Backend Dockerfile ───────────────────────────────────────────────────────
# Node 20 LTS slim. Prisma client generado en build time.
# Migraciones + seed corren al iniciar via docker-entrypoint.sh.

FROM node:20-slim AS base

# Prisma query engine necesita openssl
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# ── Dependencias ──
COPY package*.json ./
RUN npm ci --omit=dev

# ── Código fuente ──
COPY . .

# ── Generar Prisma client ──
RUN npx prisma generate

# ── Entrypoint ──
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
# Fix Windows CRLF line endings and ensure executable
RUN sed -i 's/\r//' /usr/local/bin/docker-entrypoint.sh && chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 4000

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "server.js"]
