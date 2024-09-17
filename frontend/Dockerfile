FROM node:18 AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm cache clean --force

RUN npm run build

FROM node:18

WORKDIR /app

RUN npm install --only=production

CMD ["npm", "start"]
