FROM node:latest

WORKDIR /app

COPY package*.json ./
COPY yarn.lock ./
RUN yarn

COPY . .
ENV NODE_OPTIONS=--openssl-legacy-provider
# RUN export NODE_OPTIONS=--openssl-legacy-provider
EXPOSE 3000
CMD ["yarn", "start"]
