FROM node

RUN npm i -g @nestjs/cli

# RUN nest new pong -p npm

EXPOSE 3000

WORKDIR /pong/

COPY entrypoint.sh /
RUN chmod +x /entrypoint.sh
# RUN npm i @nestjs/config
# RUN npm i @nestjs/typeorm typeorm mysql2
# RUN npm i pg

ENTRYPOINT [ "/entrypoint.sh" ]
CMD [ "npm", "run", "start:dev" ]