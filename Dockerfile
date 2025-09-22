# syntax=docker/dockerfile:1.7
ARG NODE_VERSION=20.12.2

FROM node:${NODE_VERSION}-alpine AS base
WORKDIR /app
ENV NODE_ENV=production

# Install deps (build)
FROM base AS deps
RUN corepack enable && corepack prepare pnpm@10.14.0 --activate
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

# Build
FROM deps AS build
COPY . .
RUN pnpm build

# Production deps only
FROM base AS prod-deps
RUN corepack enable && corepack prepare pnpm@10.14.0 --activate
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile --prod

# Runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./
CMD ["node", "dist/server/node-build.mjs"]
