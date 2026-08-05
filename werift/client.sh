#!/bin/bash
# Run the compiled client (built by `npm run build` in the Dockerfile).
# Avoid ts-node at runtime: modern werift type defs break outdated ts-node/TS combos.
# Note: $1 is intentionally unquoted so Data Channel CI args like
# "-s http://echo-server:8080/offer -t 1" are word-split for yargs.
DEBUG=werift* node client.js $1
