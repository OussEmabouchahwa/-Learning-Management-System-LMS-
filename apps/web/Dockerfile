# --- Stage 1: Build ---
FROM node:22-alpine AS builder

WORKDIR /app

# Copy workspace configs
COPY package*.json ./
COPY packages/contracts/package*.json ./packages/contracts/
COPY apps/web/package*.json ./apps/web/
COPY tsconfig.base.json ./

RUN npm ci

# Copy sources
COPY packages/contracts ./packages/contracts
RUN npm run build --workspace=packages/contracts

COPY apps/web ./apps/web
WORKDIR /app/apps/web
RUN npm run build

# --- Stage 2: Serve ---
FROM nginx:alpine AS runner

COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
