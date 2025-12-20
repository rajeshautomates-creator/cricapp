# Multi-stage build for NestJS backend
# Build stage
FROM node:20-bookworm-slim AS builder

WORKDIR /app

# Install build dependencies for native modules (bcrypt) and openssl for Prisma
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    openssl \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci --legacy-peer-deps

# Generate Prisma Client first
RUN npx prisma generate

# Copy source code and config files
COPY tsconfig.json nest-cli.json ./
COPY src ./src

# Build the application
RUN npm run build

# Production stage
FROM node:20-bookworm-slim AS runner

WORKDIR /app

# Install runtime dependencies (openssl) and build tools if needed for native modules
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    openssl \
    && rm -rf /var/lib/apt/lists/*

# Install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev --legacy-peer-deps && npm cache clean --force

# Copy Prisma schema and generated client
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Copy built application
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 4000

# Start the application
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
