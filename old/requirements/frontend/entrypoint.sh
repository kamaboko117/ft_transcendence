#!/bin/sh

#if [ ! -d ./node_modules ];
#then
npm i

#fi
exec "$@"
