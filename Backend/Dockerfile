# Use official Node 20 Debian Bookworm image
FROM node:20-bookworm

# Set working directory
WORKDIR /app

# Copy package files
COPY Backend/package*.json ./

# Install dependencies
RUN npm install

# Copy application source
COPY Backend/ ./

# Expose server port
EXPOSE 3005

# Start command
CMD ["node", "index.js"]
