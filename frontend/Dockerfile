# Build stage
FROM node:18-alpine AS build

WORKDIR /app

# Install dependencies based on the lock file
COPY package*.json ./
RUN npm install

# Copy the rest of the application files
COPY . .

# Build the Next.js application
RUN NODE_OPTIONS="--max-old-space-size=4096" npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy only the necessary files for production
COPY package*.json ./
RUN npm install --omit=dev

# Copy built files and public assets from the build stage
COPY --from=build /app . 
COPY --from=build /app/public ./public

CMD ["npm", "start"]
