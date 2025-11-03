# Étape 1 : base image Node.js
FROM node:18-alpine

# Créer un dossier de travail dans le container
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier tout le reste
COPY . .


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

# Exposer le port 5000
EXPOSE 5000

# Lancer le serveur
CMD ["npm", "start"]
