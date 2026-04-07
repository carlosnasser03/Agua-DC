# Build stage
FROM node:20-alpine AS build

WORKDIR /usr/src/app

# Install dev dependencies (Nest CLI, TypeScript) for building
ARG NODE_ENV=development
ENV NODE_ENV=$NODE_ENV

# Copy package files and Nest/TS config
COPY package*.json ./
COPY nest-cli.json ./
COPY tsconfig.json ./

# Install all dependencies (including dev)
RUN npm ci --legacy-peer-deps

# Copy source code and Prisma schema
COPY . .

# Generate Prisma client and build the Nest app
RUN npx prisma generate
RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /usr/src/app

# Copy production artifacts from build stage
COPY --from=build /usr/src/app/package*.json ./
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/prisma ./prisma
COPY --from=build /usr/src/app/node_modules/.prisma ./node_modules/.prisma

# Install only production dependencies
RUN npm ci --legacy-peer-deps --only=production

EXPOSE 3000

# Run migrations then start the compiled Nest application
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
