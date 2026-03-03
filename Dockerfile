# 1. Install dependencies only when needed
FROM node:20-alpine AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci

# 2. Rebuild the source code only when needed
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build the Next.js app
RUN npm run build

# 3. Production image, copy all the files and run next
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# You only need to copy next.config.ts if you are NOT using the default configuration
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copy Prisma schema and migrations to apply them during startup if needed
COPY --from=builder /app/prisma ./prisma

# Copy the geoip-lite database manually because Next.js standalone dynamic tracing ignores it
COPY --from=deps /app/node_modules/geoip-lite/data ./.next/standalone/node_modules/geoip-lite/data

EXPOSE 3000
ENV PORT=3000

# Install prisma to run database sync at startup
RUN npm install -g prisma@6.19.2

# Copy the startup script
COPY entrypoint.sh ./
RUN chmod +x entrypoint.sh

# Server.js is created by next build from the standalone output
# The startup script pushes the Prisma schema and then starts the Next server
CMD ["./entrypoint.sh"]
