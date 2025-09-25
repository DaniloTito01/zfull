# Backend Dockerfile - Node.js Express
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev for build)
RUN npm install

# Copy source code
COPY src/ ./src/
COPY tsconfig.json ./

# Build TypeScript
RUN npm run build

# Remove dev dependencies and source files
RUN npm prune --production && rm -rf src/ tsconfig.json

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S backend -u 1001 -G nodejs

# Change ownership
RUN chown -R backend:nodejs /app
USER backend

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Start the application
CMD ["npm", "start"]