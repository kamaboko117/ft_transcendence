FROM node

RUN npm i -g @nestjs/cli

RUN nest new pong -p npm

EXPOSE 3000

ENTRYPOINT [ "npm", "run", "start:dev" ]