# ─── Frontend Dockerfile (Next.js standalone output) ──────────────────────────
# Uses Next.js "output: standalone" mode to produce a minimal production image.
# The NEXT_PUBLIC_API_URL build arg is baked in at build time.

FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# ── Build ──
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Public env var is needed at build time for Next.js to embed it
ARG NEXT_PUBLIC_API_URL=http://localhost:4000/api
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Signal to next.config.mjs that we want standalone output
ENV DOCKER_BUILD=1

RUN npm run build

# ── Production image ──
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Next.js standalone output copies only what's needed
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
