FROM node:22-bookworm-slim AS frontend-build

WORKDIR /app/frontend

COPY Frontend/package*.json ./
RUN npm ci --legacy-peer-deps

COPY Frontend/ ./

ARG VITE_API_URL
ARG VITE_NODE_ENV=production
ARG VITE_RECAPTCHA_SITE_KEY

ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_NODE_ENV=${VITE_NODE_ENV}
ENV VITE_RECAPTCHA_SITE_KEY=${VITE_RECAPTCHA_SITE_KEY}

RUN npm run build

FROM node:22-bookworm-slim AS backend-build

WORKDIR /app/backend

COPY Backend/package*.json ./
RUN npm ci --omit=dev

COPY Backend/ ./

FROM node:22-bookworm-slim

WORKDIR /app

COPY --chown=node:node --from=backend-build /app/backend ./
COPY --chown=node:node --from=frontend-build /app/frontend/dist ./public

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

USER node

HEALTHCHECK --interval=10s --timeout=3s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+process.env.PORT+'/api/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"

CMD ["node", "index.js"]
