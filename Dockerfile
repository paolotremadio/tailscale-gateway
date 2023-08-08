FROM node:20-alpine

WORKDIR "/home/node/app"
ADD . /home/node/app

RUN yarn install

RUN mkdir /home/node/app-config
WORKDIR /home/node/app-config

EXPOSE 9000

ENTRYPOINT node /home/node/app/src/index.js
