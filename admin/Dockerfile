FROM node:22-alpine AS builder

RUN corepack enable && corepack prepare pnpm@10 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/ ./packages/
COPY internal/ ./internal/
COPY apps/web-antd/package.json ./apps/web-antd/package.json

RUN pnpm install --frozen-lockfile

COPY apps/web-antd/ ./apps/web-antd/
RUN pnpm --filter @vben/web-antd build

FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/apps/web-antd/dist /usr/share/nginx/html