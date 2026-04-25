# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Build args for Vite env vars
ARG VITE_API_URL=http://admin.gpmh.local
ARG VITE_PLATFORM_DOMAIN=gpmh.local

# Set env vars for vite build
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_PLATFORM_DOMAIN=${VITE_PLATFORM_DOMAIN}

COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps && npm cache clean --force

COPY . .
RUN npm run build

# Production stage - serve with nginx
FROM nginx:alpine

# Copy built assets
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx config for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
