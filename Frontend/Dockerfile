# Stage 1: Build React Vite app
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

ARG VITE_LOCAL_API_BASE_URL=http://localhost:3005/api
ARG VITE_LIVE_API_BASE_URL=http://localhost:3005/api
ARG VITE_API_KEY=leadmanagement
ARG VITE_CONTENT_TYPE=Application/json

ENV VITE_LOCAL_API_BASE_URL=$VITE_LOCAL_API_BASE_URL
ENV VITE_LIVE_API_BASE_URL=$VITE_LIVE_API_BASE_URL
ENV VITE_API_KEY=$VITE_API_KEY
ENV VITE_CONTENT_TYPE=$VITE_CONTENT_TYPE

COPY . .
RUN npm run build

# Stage 2: Serve with lightweight Nginx web server
FROM nginx:alpine

# Copy built frontend assets to Nginx html directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration for React SPA routing fallback
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
