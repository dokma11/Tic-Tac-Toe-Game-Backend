FROM node:20 AS build
WORKDIR /src

RUN npm install -g typescript

COPY package*.json ./

RUN npm i

RUN npm install -g prisma

COPY . .

RUN npx prisma generate

RUN npx tsc

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/app.js"]