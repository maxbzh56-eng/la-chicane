# Stage de construction
FROM node:20-alpine AS builder

WORKDIR /app

# Copier les fichiers de dépendances
COPY package.json package-lock.json* ./

# Installer les dépendances
RUN npm ci || npm install

# Copier le reste de l'application
COPY . .

# Construire l'application Next.js
RUN npm run build

# Stage de production
FROM node:20-alpine AS runner

WORKDIR /app

# Créer un utilisateur non-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Copier les fichiers nécessaires depuis le builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.js ./next.config.js

# Changer le propriétaire des fichiers
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

CMD ["npm", "start"]