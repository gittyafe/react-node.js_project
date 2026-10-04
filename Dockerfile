FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

RUN npm install --prefix client --silent
RUN npm install --prefix server --silent

COPY client ./client
COPY server ./server

RUN npm --prefix server run build

EXPOSE 3000

CMD ["node", "server/dist/server.js"]
