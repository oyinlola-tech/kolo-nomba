FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package.json package-lock.json* ./
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src

RUN npm run prisma:generate
RUN npm run build

FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./
COPY --from=builder /app/node_modules ./node_modules
COPY scripts ./scripts

RUN mkdir -p /app/logs && chown -R appuser:appgroup /app && chmod +x /app/scripts/docker-healthcheck.js

USER appuser

EXPOSE 3000

CMD ["node", "dist/server.js"]
