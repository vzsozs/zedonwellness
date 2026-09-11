FROM node:22-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
# The lockfile is written by npm 12, which resolves auto-installed peer
# dependencies differently from the npm 10 bundled with node:22 — that older
# npm rejects the lock as out of sync ("Missing: @swc/helpers@… from lock
# file"). Pin the same major here so the image installs exactly what the
# lockfile describes.
RUN npm i -g npm@12 && npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next inlines every NEXT_PUBLIC_* value at BUILD time, so passing them only
# through the runtime env_file leaves the built output with the defaults —
# which silently ships a staging site with `Allow: /` in robots.txt and
# localhost canonical URLs. They have to arrive as build args instead.
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_STAGING_NOINDEX
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_STAGING_NOINDEX=$NEXT_PUBLIC_STAGING_NOINDEX

ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# Applies pending migrations, then exits. Run as a one-shot service before
# the web container starts (see docker-compose.yml) so the app can never
# come up against an un-migrated schema. Needs the dev dependencies, hence
# the full node_modules rather than the standalone output.
FROM base AS migrator
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY package.json drizzle.config.ts ./
COPY src/db ./src/db
CMD ["npx", "drizzle-kit", "migrate"]

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/public ./public

RUN mkdir -p ./uploads && chown -R nextjs:nodejs ./uploads

RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
