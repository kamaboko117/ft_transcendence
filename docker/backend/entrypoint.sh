#!/bin/sh

dockerize -wait tcp://postgres_tr:5432 -timeout 60s
if [ ! -d ./node_modules ];
then
	npm i -g @nestjs/cli@latest
	npm i -g npm@latest
	npm install
else
	npm i -g @nestjs/cli@latest
	npm i -g npm@latest
	npm update
	npm update -g
fi
exec "$@"
