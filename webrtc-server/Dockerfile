# Build from the repository root:
#   docker build -t webrtc-server-echo -f webrtc-server/Dockerfile .

FROM node:22-slim

WORKDIR /app

COPY ["./webrtc-server/package.json", "./"]
RUN npm install --omit=dev

COPY ["./webrtc-server/server.js", "./webrtc-server/client.js", "./"]

# Browser-based Client Peer, served by server.js
COPY ["html", "../html/"]

COPY ["./webrtc-server/client.sh", "/client.sh"]
RUN chmod +x /client.sh

EXPOSE 8080
# WebRTC also needs UDP on ephemeral ports, but the interop tests run
# container-to-container on a shared network where no mapping is required.
#EXPOSE 49000-65535/udp

ENTRYPOINT ["node", "/app/server.js"]
