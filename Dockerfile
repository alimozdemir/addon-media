# Build Stage
FROM node:22-alpine AS build
WORKDIR /app

# Enable corepack for pnpm/yarn support (optional, but recommended)
RUN corepack enable

# Copy the entire project
COPY ./src ./

# Install dependencies
RUN pnpm i --frozen-lockfile

# Build the project
RUN pnpm run build

# Production Stage
FROM node:22-alpine
WORKDIR /app

# Only `.output` folder is needed from the build stage
COPY --from=build /app/.output/ ./

# Install and configure Nginx as reverse proxy
RUN apk add --no-cache nginx && \
    mkdir -p /run/nginx /var/cache/nginx

# Copy nginx configuration
COPY ./nginx/nginx.conf /etc/nginx/nginx.conf

# Entrypoint script to run Node (on 3000) behind Nginx (on 80)
COPY <<'SH' /entrypoint.sh
#!/bin/sh
set -e

# Run Nuxt server on port 3000
export PORT=3000
export HOST=0.0.0.0
node /app/server/index.mjs &

# Start Nginx in foreground
exec nginx -g 'daemon off;'
SH

RUN chmod +x /entrypoint.sh

EXPOSE 80

CMD ["/entrypoint.sh"]