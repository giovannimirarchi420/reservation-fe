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

# Create directory for configuration
RUN mkdir -p /usr/share/nginx/html/config

# Copy built files from build stage to nginx serve directory
COPY --from=build /app/build /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create entrypoint script
RUN echo '#!/bin/sh' > /docker-entrypoint.sh && \
    echo 'cat > /usr/share/nginx/html/config/env-config.js << EOF' >> /docker-entrypoint.sh && \
    echo 'window.ENV = {' >> /docker-entrypoint.sh && \
    echo '  KEYCLOAK_URL: "${REACT_APP_KEYCLOAK_URL}",' >> /docker-entrypoint.sh && \
    echo '  KEYCLOAK_REALM: "${REACT_APP_KEYCLOAK_REALM}",' >> /docker-entrypoint.sh && \
    echo '  KEYCLOAK_CLIENT_ID: "${REACT_APP_KEYCLOAK_CLIENT_ID}",' >> /docker-entrypoint.sh && \
    echo '  API_URL: "${REACT_APP_API_URL}",' >> /docker-entrypoint.sh && \
    echo '  DOCUMENTATION_URL: "${REACT_APP_DOCUMENTATION_URL}"' >> /docker-entrypoint.sh && \
    echo '};' >> /docker-entrypoint.sh && \
    echo 'EOF' >> /docker-entrypoint.sh && \
    echo 'nginx -g "daemon off;"' >> /docker-entrypoint.sh && \
    chmod +x /docker-entrypoint.sh

# Expose ports
EXPOSE 80

# Start nginx using the entrypoint script
ENTRYPOINT ["/docker-entrypoint.sh"]