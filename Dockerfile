FROM node:20-bookworm-slim

ENV NODE_ENV=production
ENV PORT=3016

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends ffmpeg curl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json* ./

RUN if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi

COPY public ./public
COPY src ./src
COPY scripts ./scripts
COPY README.md ./
COPY .env.local.example ./

RUN mkdir -p /app/data/drafts /app/data/config

EXPOSE 3016

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=5 \
  CMD curl -fsS http://127.0.0.1:${PORT}/api/status >/dev/null || exit 1

CMD ["npm", "run", "start"]
