#!/bin/sh

dockerize -wait tcp://postgres_tr:5432 -timeout 60s
if [ ! -d ./node_modules ];
then
	npm i -g npm@latest
	npm i -g @nestjs/cli@latest
	npm install
else
	npm i -g npm@latest
	npm i -g @nestjs/cli@latest
	npm update
	npm update -g
fi
exec "$@"
