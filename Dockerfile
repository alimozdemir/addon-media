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

# Set environment variables for host and port
ENV PORT=80
ENV HOST=0.0.0.0

EXPOSE 80

# Start the Nuxt server
CMD ["NUXT_APP_BASE_URL=./", "node", "/app/server/index.mjs"]