# ───────────────────────────────
# Étape 1 : Build frontend
# ───────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copie des fichiers de config
COPY package*.json ./

# Installation des dépendances
RUN npm ci --legacy-peer-deps

# Copie du code source
COPY . .

ENV VITE_API_URL=https://gabtrotter.org/api/
ENV VITE_RECAPTCHA_SITE_KEY=6LeIX_opAAAAAADTeU65RQ4DOzB5STo412GoaHc3
ENV VITE_NODE_ENV=production

# Build de l’application
RUN npm run build

# ───────────────────────────────
# Étape 2 : Serveur Nginx pour la prod
# ───────────────────────────────
FROM nginx:alpine

# Suppression du site par défaut
RUN rm -rf /usr/share/nginx/html/*

# Copie du build vers Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copie optionnelle d'une config Nginx personnalisée (si besoin)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
