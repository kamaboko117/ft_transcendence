#!/bin/sh

if [ ! -d ./node_modules ];
then
	npm install
	npm i -g @nestjs/cli@latest
	npm i -g npm@latest
else
	npm i -g @nestjs/cli@latest
	npm i -g npm@latest
	npm update
	npm update -g
fi
exec "$@"
