FROM node:19-alpine3.16

COPY entrypoint.sh /
RUN chmod +x /entrypoint.sh
WORKDIR /pong/

ENTRYPOINT [ "/entrypoint.sh" ]
CMD ["npm", "run", "dev"]
