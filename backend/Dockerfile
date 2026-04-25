# Backend
FROM node:20-alpine

WORKDIR /app

# Install fonts for Marathi PDF generation
RUN apk add --no-cache \
    fontconfig \
    font-noto-devanagari \
    && fc-cache -fv

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies (including prisma CLI from devDeps for generate + db push)
RUN npm ci && npm cache clean --force

# Copy prisma schema
COPY prisma ./prisma

# Generate Prisma Client
RUN npx prisma generate

# Copy app source
COPY src ./src
COPY scripts ./scripts

# Create uploads directory
RUN mkdir -p uploads/certificates

EXPOSE 5000

# Start script: run migrations, seed, then start server
CMD ["sh", "-c", "npx prisma db push --skip-generate --accept-data-loss && node prisma/seed-all.js && node src/server.js"]
