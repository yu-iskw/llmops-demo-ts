# Use a lightweight web server image for serving the built application
FROM nginx:alpine

# Copy the built files from the build stage
COPY dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
