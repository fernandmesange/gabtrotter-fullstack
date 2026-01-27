FROM node:20-alpine AS frontend-build

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

FROM node:20-alpine AS backend-build

WORKDIR /app/backend

COPY Backend/package*.json ./
RUN npm ci --legacy-peer-deps

COPY Backend/ ./

RUN npm prune --production

FROM node:20-alpine

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

COPY --from=backend-build /app/backend ./
COPY --from=frontend-build /app/frontend/dist ./public

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

USER appuser

CMD ["node", "index.js"]
