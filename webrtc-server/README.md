# WebRTC Echo Server

**Description**

A Node.js application that runs a WebRTC Echo Server using
[webrtc-server](https://github.com/colocohen/webrtc-server), a pure JavaScript
WebRTC implementation with a browser-compatible API. No native bindings and no
build step are required.

**Prerequisites**

- Node.js version 18+ (uses the global `fetch`)
- `npm install`

**Usage**

By default the built in web server will listen on `http://*:8080/`.

`npm start` (or `node server.js`)

POST an SDP offer to `http://*:8080/offer` or open `http://localhost:8080/` in a
browser to use the included `index.html` demo page.

# WebRTC Echo Client

**Description**

A Node.js application that acts as a peer for a WebRTC Echo Server. It supports
both the Peer Connection Test and the Data Channel Echo Test.

**Prerequisites**

- Node.js version 18+
- `npm install`

**Usage**

By default the client will attempt to POST its SDP offer to an echo server at
`http://localhost:8080/offer`.

- Make sure the echo test server is running.
- `node client.js -s http://localhost:8080/offer -t 0` for the Peer Connection Test.
- `node client.js -s http://localhost:8080/offer -t 1` for the Data Channel Echo Test.

A bare URL is also accepted for the Peer Connection Test:

- `node client.js http://localhost:8080/offer`

The client exits with 0 on success and 1 on failure or timeout.

# Docker

Build from the repository root, not from this directory:

````
docker build -t webrtc-server-webrtc-echo -f webrtc-server/Dockerfile .
````

Run as a Server Peer:

````
docker run -it --rm --init -p 8080:8080 webrtc-server-webrtc-echo
````

Run as a Client Peer:

````
docker run --entrypoint "/client.sh" webrtc-server-webrtc-echo http://host.docker.internal:8080/offer
docker run --entrypoint "/client.sh" webrtc-server-webrtc-echo "-s http://host.docker.internal:8080/offer -t 1"
````
