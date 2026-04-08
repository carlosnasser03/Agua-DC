# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies)
RUN npm install

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build with verbose output so we can see what the compiler is doing
RUN echo ">>> Starting nest build..." && \
    npm run build -- --verbose && \
    echo ">>> nest build finished."

# Verify dist was actually populated — fail fast if it's empty
RUN echo ">>> Contents of dist/:" && \
    ls -la dist/ && \
    test -f dist/main.js || (echo "ERROR: dist/main.js was not generated!" && exit 1)

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files for production install
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy built app and required artifacts from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 3000

# Start the compiled Nest application
CMD ["node", "dist/main"]
