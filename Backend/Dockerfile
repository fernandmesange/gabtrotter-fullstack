

# ───────────────────────────────
# Étape 1 : Build et install
# ───────────────────────────────
FROM node:20-alpine AS base

WORKDIR /app

# Copie des fichiers de config
COPY package*.json ./

# Installation des dépendances (prod + dev si besoin)
RUN npm ci --legacy-peer-deps

# Copie du code source
COPY . .

# Build si TypeScript ou transpilation
# RUN npm run build


# ───────────────────────────────
# Étape 2 : Exécution production
# ───────────────────────────────
FROM node:20-alpine

# Crée un utilisateur non-root pour la sécurité
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copie depuis l’étape précédente
COPY --from=base /app /app

# Copie uniquement les dépendances nécessaires
RUN npm prune --production

# Définir les variables d’environnement
ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000
USER appuser

CMD ["node", "index.js"]

