# --- Stage 1: build do Vite ---
FROM node:20-alpine AS build
WORKDIR /app

ARG VITE_APP_BUILD_COMMIT=""
ARG VITE_APP_BUILD_TIME=""
ENV VITE_APP_BUILD_COMMIT=$VITE_APP_BUILD_COMMIT
ENV VITE_APP_BUILD_TIME=$VITE_APP_BUILD_TIME

# 1) instala deps (inclui dev) com cache eficiente
COPY package*.json ./
RUN npm ci --no-audit --no-fund

# 2) copia o código
COPY . .

# 3) (workaround) garante permissão de execução nos bins locais
#    em alguns ambientes o bit +x não vem marcado e o "vite" falha
RUN chmod +x node_modules/.bin/* || true \
 && chmod +x node_modules/vite/bin/vite.js || true

# 4) build (pode usar o script do package.json ou chamar direto o vite.js)
# RUN npm run build
RUN node node_modules/vite/bin/vite.js build

# --- Stage 2: nginx estático ---
FROM nginx:alpine
WORKDIR /usr/share/nginx/html
# Copia o build
COPY --from=build /app/dist ./
# Healthcheck simples
RUN apk add --no-cache wget
HEALTHCHECK --interval=30s --timeout=3s --retries=3 CMD wget -qO- http://127.0.0.1/healthz || exit 1
