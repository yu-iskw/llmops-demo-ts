# Use a Node.js image as the base
FROM node:20-alpine

# Create a non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Set the working directory in the container
WORKDIR /app/backend

# Copy the built artifacts
COPY dist ./dist
COPY build ./build
COPY package.json .
COPY node_modules ./node_modules

# Change ownership of the app directory to the nodejs user
RUN chown -R nodejs:nodejs /app/backend

# Switch to non-root user
USER nodejs

# Expose the port the app runs on
EXPOSE 3000

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" || exit 1

# Command to run the application
CMD ["node", "dist/index.js"]
