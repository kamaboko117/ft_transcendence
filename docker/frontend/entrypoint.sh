#!/bin/sh

#if [ ! -d ./node_modules ];
#then
#	npm i -g npm@latest
#	npm i -g @nestjs/cli@latest
#	npm install
#else
#	npm i -g npm@latest
#	npm i -g @nestjs/cli@latest
#	npm update
#	npm update -g
#fi
exec "$@"
