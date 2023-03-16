#!/bin/sh

dockerize -wait tcp://postgres_tr:5432 -timeout 60s
if [ ! -d ./node_modules ];
then
	npm install
else
	npm update
	npm update -g
fi
exec "$@"
