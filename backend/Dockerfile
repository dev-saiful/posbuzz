# =========================
# Stage 1: Dependencies
# =========================
FROM node:20-alpine AS deps

RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy only package.json (no lockfile needed)
COPY package.json ./
RUN npm install

# =========================
# Stage 2: Builder
# =========================
FROM node:20-alpine AS builder

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build NestJS app (Nest CLI)
RUN npm run build

# =========================
# Stage 3: Runner
# =========================
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nestjs

# Copy only what we need to run
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./package.json

USER nestjs

EXPOSE 5000
ENV PORT=5000

CMD ["node", "dist/main.js"]
