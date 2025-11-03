# Étape 1 : build de l'app Next.js
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build


ENV VITE_API_URL=https://gabtrotter.org/api/
ENV VITE_RECAPTCHA_SITE_KEY=6LeIX_opAAAAAADTeU65RQ4DOzB5STo412GoaHc3
ENV VITE_NODE_ENV=production

EXPOSE 3000

CMD ["npm", "start"]
