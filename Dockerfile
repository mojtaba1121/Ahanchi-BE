FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --no-audit --no-fund

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build && npm prune --omit=dev

FROM node:22-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
RUN addgroup -S nodejs && adduser -S ahanchi -G nodejs
COPY --from=build --chown=ahanchi:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=ahanchi:nodejs /app/dist ./dist
COPY --from=build --chown=ahanchi:nodejs /app/package.json ./package.json
USER ahanchi
EXPOSE 3000
CMD ["node", "dist/main.js"]
