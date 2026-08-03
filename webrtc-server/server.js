// Server Peer for the webrtc-interop echo tests.
//
// Listens on TCP port 8080 for POST /offer with a JSON-encoded
// RTCSessionDescriptionInit, answers with its own SDP, and echoes back any
// data channel message it receives.
//
// See doc/PeerConnectionTestSpecification.md and
// doc/DataChannelEchoTestSpecification.md

const path = require('path');
const express = require('express');
const { RTCPeerConnection } = require('webrtc-server');

const PORT = 8080;

const app = express();
app.use(express.json());

// Serves the browser-based Client Peer at html/index.html
app.use(express.static(path.join(__dirname, '..', 'html')));

app.post('/offer', async (req, res) => {
  try {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    pc.onconnectionstatechange = () => {
      console.log('connection state:', pc.connectionState);
    };

    // Data Channel Echo Test: echo every message back on the same channel.
    pc.ondatachannel = (e) => {
      const channel = e.channel;
      console.log('data channel opened:', channel.label);
      channel.onmessage = (m) => {
        console.log('echoing:', m.data);
        channel.send(m.data);
      };
    };

    await pc.setRemoteDescription(req.body);
    await pc.setLocalDescription(await pc.createAnswer());

    // Signalling here is one-shot, so operate in non-trickle mode: wait for
    // gathering to finish so that every candidate travels inside the SDP.
    if (pc.iceGatheringState !== 'complete') {
      await new Promise((resolve) => {
        pc.onicegatheringstatechange = () => {
          if (pc.iceGatheringState === 'complete') resolve();
        };
      });
    }

    res.json({
      type: pc.localDescription.type,
      sdp: pc.localDescription.sdp
    });

  } catch (err) {
    console.error('error handling offer:', err);
    res.status(500).json({ error: String(err) });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('webrtc-server echo listening on http://localhost:' + PORT);
});
