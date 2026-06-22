FROM node:18-alpine AS build

WORKDIR /app

# Copier d'abord les dépendances pour utiliser efficacement le cache
COPY package.json ./
RUN npm install --production --no-audit --no-fund

# Copier le reste de l'application et construire
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app

# Copier uniquement le résultat de build dans l'image finale
COPY --from=build /app/dist ./dist

# Utilisateur non root
RUN chown -R node:node /app
USER node

EXPOSE 3000
CMD ["node", "dist/index.js"]
