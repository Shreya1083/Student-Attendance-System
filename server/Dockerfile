# =======================================================
# Production Container for Node.js / Express Backend API
# =======================================================
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=5000

# Install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev --prefer-offline --no-audit

# Copy application source code
COPY src ./src

# Set ownership to unprivileged node user
RUN chown -R node:node /app

# Run as non-root user
USER node

# Expose backend port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=20s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:5000/api/v1/health || exit 1

# Start production server
CMD ["node", "src/server.js"]
