# Use a Node.js image as the base
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /app/backend

# Copy the built artifacts
COPY dist ./dist
COPY build ./build
COPY package.json .
COPY node_modules ./node_modules

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["node", "dist/index.js"]
