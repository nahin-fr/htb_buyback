# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code and build
COPY . .
RUN npm run build

# Production stage
FROM nginx:stable-alpine

# Set up non-root user for security
RUN touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid /var/cache/nginx /var/log/nginx /etc/nginx/conf.d

# Copy built assets to nginx server
COPY --from=build /app/dist /usr/share/nginx/html
RUN chown -R nginx:nginx /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Switch to non-root user
USER nginx

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
