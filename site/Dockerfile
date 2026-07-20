# Aivo site — production image (Next.js 16 standalone)
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
# зеркало npm: registry.npmjs.org из РФ-датацентров нестабилен (обрывы ~100с)
RUN npm config set registry https://registry.npmmirror.com && npm ci --fetch-retries=5 --fetch-timeout=120000

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# NEXT_PUBLIC_* переменные вшиваются на этапе сборки
ARG NEXT_PUBLIC_SITE_URL=https://aivo.example
ARG NEXT_PUBLIC_YM_ID=
ARG NEXT_PUBLIC_GA_ID=
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_YM_ID=$NEXT_PUBLIC_YM_ID \
    NEXT_PUBLIC_GA_ID=$NEXT_PUBLIC_GA_ID
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=build --chown=nextjs:nodejs /app/public ./public
# /data — точка монтирования тома с заявками; создаём с правами nextjs,
# чтобы именованный том инициализировался с правильным владельцем
RUN mkdir -p /data && chown nextjs:nodejs /data
USER nextjs
EXPOSE 3000
ENV PORT=3000 HOSTNAME=0.0.0.0
CMD ["node", "server.js"]
