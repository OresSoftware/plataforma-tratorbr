# imagem base
FROM node:20-alpine

# deps úteis (wget para healthcheck; tini opcional)
RUN apk add --no-cache wget tini

# diretório de trabalho
WORKDIR /app

# ambiente padrão (pode sobrescrever no compose)
ENV NODE_ENV=production
ENV PORT=3069
ENV MANUFACTURER_DIR=/usr/share/nginx/html/images/manufacturer

# copie manifestos e instale deps de produção (cache eficiente)
COPY package*.json ./
RUN npm ci --omit=dev --no-audit --no-fund

# copie apenas o que precisa para rodar
# (ajuste estas linhas conforme sua estrutura)
COPY src ./src
COPY middleware ./middleware
# se houver outras pastas/arquivos necessários, adicione aqui:
# COPY utils ./utils
# COPY config ./config

# porta (informativa)
EXPOSE 3069

# healthcheck esperado pelo compose
HEALTHCHECK --interval=30s --timeout=3s --retries=5 CMD wget -qO- http://127.0.0.1:${PORT}/healthz || exit 1

# usuário não-root
RUN addgroup -S nodegrp && adduser -S nodeusr -G nodegrp && chown -R nodeusr:nodegrp /app
USER nodeusr

# use tini como PID 1 (graceful signals)
ENTRYPOINT ["/sbin/tini", "--"]

# inicia
CMD ["node", "src/server.js"]
