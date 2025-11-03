

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

ENV MONGO_URL=mongodb+srv://admin:raponda2019@cluster0.rtzlb1w.mongodb.net/gabtrotter?retryWrites=true&w=majority&appName=Cluster0
ENV JWT_SECRET=qwepowiep1o3183w68849etgfsdkfbzx
ENV CLOUDINARY_CLOUD_NAME=dyh0rsrbd
ENV CLOUDINARY_API_KEY=765353953515239
ENV CLOUDINARY_API_SECRET=QV9htwUrfdSYkIQyPD42msrFS_E
ENV RESEND_API_KEY=re_QXFWpXFj_CFmLWC89FRBQSWEs3wF816WH
ENV FRONTEND_URL=https://gabtrotter.org
ENV NODE_ENV=development
ENV EMAIL_USER=contact@gabtrotter.org
ENV EMAIL_PASSWORD=Azerty2022@@*

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

CMD ["node", "src/index.js"]
