# Build stage
FROM node:20-alpine AS build

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .
RUN npx prisma generate
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --only=production

COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/prisma ./prisma
COPY --from=build /usr/src/app/node_modules/.prisma ./node_modules/.prisma

# Archivo maestro de colonias para NormalizationService
COPY --from=build /usr/src/app/data ./data

EXPOSE 3000

# Corre migraciones de Prisma y luego inicia la API
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
