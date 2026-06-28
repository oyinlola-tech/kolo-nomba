FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./

FROM base AS backend-deps
WORKDIR /app/kolo-backend
COPY kolo-backend/package*.json ./
RUN npm ci

FROM base AS frontend-deps
WORKDIR /app/public
COPY public/package*.json ./
RUN npm ci

FROM base AS backend-build
WORKDIR /app/kolo-backend
COPY kolo-backend/ .
COPY --from=backend-deps /app/kolo-backend/node_modules ./node_modules
RUN npx prisma generate
RUN npm run build

FROM base AS frontend-build
WORKDIR /app/public
COPY public/ .
COPY --from=frontend-deps /app/public/node_modules ./node_modules
RUN npm run build

FROM node:20-alpine AS production
WORKDIR /app
RUN apk add --no-cache curl
COPY --from=backend-build /app/kolo-backend/dist ./dist
COPY --from=backend-build /app/kolo-backend/package.json ./package.json
COPY --from=backend-build /app/kolo-backend/node_modules ./node_modules
COPY --from=frontend-build /app/public/dist ./public
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/v1/health || exit 1
CMD ["node", "dist/app.js"]
