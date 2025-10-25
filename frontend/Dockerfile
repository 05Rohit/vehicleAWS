# Use official Node image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy rest of the app
COPY . .

# Build the React app
RUN npm run build

# Serve with static server
RUN npm install -g serve
CMD ["serve", "-s", "build"]

EXPOSE 3000
 
