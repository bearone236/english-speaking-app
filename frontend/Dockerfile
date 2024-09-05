FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci && ls -la node_modules/next && npm install sharp

COPY . .

COPY .env .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]