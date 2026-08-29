# Use official Node 20 Debian Bookworm image
FROM node:20-bookworm

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Clean install dependencies without local prebuilt cache
RUN npm ci || npm install

# Copy application source
COPY . .

# Expose server port
EXPOSE 3005

# Start command
CMD ["node", "index.js"]
