FROM node

RUN npx create-react-app pong --template typescript

COPY entrypoint.sh /
RUN chmod +x /entrypoint.sh
WORKDIR /pong/

ENTRYPOINT [ "/entrypoint.sh" ]
CMD [ "npm", "start"]