FROM node

RUN npm i -g @nestjs/cli

RUN nest new pong -p npm

EXPOSE 3000

WORKDIR /pong/

RUN npm i @nestjs/config
RUN npm i @nestjs/typeorm typeorm mysql2
RUN npm i pg

COPY ./srcs/app.module.ts src/

ENTRYPOINT [ "npm", "run", "start:dev" ]