# Dockerfile for Dokploy/Ubuntu server deployment
# Multi-stage build for smaller image and reliable TS config handling

FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
# Install all deps (including dev) so Next can load TS during build
RUN npm ci

FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]


