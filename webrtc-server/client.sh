#!/bin/sh
# Client Peer entrypoint.
#
#   /client.sh http://echo-server:8080/offer
#   /client.sh "-s http://echo-server:8080/offer -t 1"
#
# $1 is intentionally unquoted so the second form splits into arguments.
node /app/client.js $1
