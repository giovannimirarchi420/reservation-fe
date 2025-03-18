# Build stage
FROM node:16-alpine AS build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy all project files
COPY . .

# Build the React application
RUN npm run build

# Production stage
FROM nginx:alpine

# Create directory for SSL certificates
RUN mkdir -p /etc/nginx/ssl

# Copy built files from build stage to nginx serve directory
COPY --from=build /app/build /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose ports
EXPOSE 80
EXPOSE 443

# Default command to run nginx in foreground
CMD ["nginx", "-g", "daemon off;"]