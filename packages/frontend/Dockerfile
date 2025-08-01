
# Use a Node.js image as the base for building the frontend
FROM node:20-alpine as build

# Set the working directory
WORKDIR /app/frontend

# Copy package.json and pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# Install pnpm globally and then install dependencies
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Build the Vue.js application
RUN pnpm build

# Use a lightweight web server image for serving the built application
FROM nginx:alpine

# Copy the built files from the build stage
COPY --from=build /app/frontend/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
