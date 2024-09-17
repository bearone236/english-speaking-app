FROM node:18 AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN rm -rf .next

RUN NODE_OPTIONS="--max-old-space-size=4096" npm run build

FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=build /app .

CMD ["npm", "start"]
