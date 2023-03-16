#!/bin/sh

if [ ! -d ./node_modules ];
then
	npm install
else
	npm update
	npm update -g
fi
exec "$@"
