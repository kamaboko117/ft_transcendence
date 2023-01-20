#!/bin/sh

#if [ ! -d ./node_modules ];
#then
	npm install 
	npm update
#fi
exec "$@"
