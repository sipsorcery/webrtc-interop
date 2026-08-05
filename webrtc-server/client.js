// Client Peer for the webrtc-interop echo tests.
//
//   node client.js <url>              Peer Connection Test
//   node client.js -s <url> -t 0      Peer Connection Test
//   node client.js -s <url> -t 1      Data Channel Echo Test
//
// Exits 0 on success, 1 on failure or timeout.

const { RTCPeerConnection } = require('webrtc-server');

const TIMEOUT_MS = 15000;
const TEST_PEER_CONNECTION = 0;
const TEST_DATA_CHANNEL_ECHO = 1;

// The Docker entrypoint passes its arguments as a single string, which the
// shell splits before we see it. A bare URL is also accepted.
function parseArgs(argv) {
  let url = null;
  let testType = TEST_PEER_CONNECTION;

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '-s') url = argv[++i];
    else if (a === '-t') testType = parseInt(argv[++i], 10);
    else if (!a.startsWith('-') && !url) url = a;
  }

  return {
    url: url || 'http://localhost:8080/offer',
    testType: isNaN(testType) ? TEST_PEER_CONNECTION : testType
  };
}

const { url, testType } = parseArgs(process.argv.slice(2));

// 5 pseudo-random characters, per the Data Channel Echo specification.
function randomMessage() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let s = '';
  for (let i = 0; i < 5; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

let finished = false;
let pc = null;

const timer = setTimeout(() => fail('timeout after ' + TIMEOUT_MS + 'ms'), TIMEOUT_MS);

function pass() {
  if (finished) return;
  finished = true;
  clearTimeout(timer);
  console.log('PASS');

  // Close gracefully instead of tearing the sockets down mid-flight, which
  // some peers report as a handshake failure.
  setTimeout(() => {
    try { pc.close(); } catch (e) { /* ignore */ }
    setTimeout(() => process.exit(0), 200);
  }, 1000);
}

function fail(reason) {
  if (finished) return;
  finished = true;
  clearTimeout(timer);
  console.error('FAIL:', reason);
  try { if (pc) pc.close(); } catch (e) { /* ignore */ }
  process.exit(1);
}

(async () => {
  try {
    console.log('test:  ', testType === TEST_DATA_CHANNEL_ECHO ? 'data channel echo' : 'peer connection');
    console.log('server:', url);

    pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    const channel = pc.createDataChannel('interop-test');
    const sent = randomMessage();

    if (testType === TEST_DATA_CHANNEL_ECHO) {
      channel.onopen = () => {
        console.log('data channel open, sending:', sent);
        channel.send(sent);
      };

      channel.onmessage = (e) => {
        const received = String(e.data);
        console.log('received:', received);
        if (received === sent) pass();
        else fail('echo mismatch: sent "' + sent + '", got "' + received + '"');
      };
    }

    pc.onconnectionstatechange = () => {
      console.log('connection state:', pc.connectionState);

      // The Peer Connection Test is satisfied by the DTLS handshake alone;
      // the echo test has to wait for the round trip.
      if (pc.connectionState === 'connected' && testType === TEST_PEER_CONNECTION) pass();
      if (pc.connectionState === 'failed') fail('connection failed');
      if (pc.connectionState === 'closed') fail('connection closed');
    };

    await pc.setLocalDescription(await pc.createOffer());

    // non-trickle: all candidates must travel inside the SDP
    if (pc.iceGatheringState !== 'complete') {
      await new Promise((resolve) => {
        pc.onicegatheringstatechange = () => {
          if (pc.iceGatheringState === 'complete') resolve();
        };
      });
    }

    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: pc.localDescription.type,
        sdp: pc.localDescription.sdp
      })
    });

    if (!resp.ok) throw new Error('HTTP ' + resp.status + ' ' + resp.statusText);

    await pc.setRemoteDescription(await resp.json());

  } catch (err) {
    fail(err && err.message ? err.message : String(err));
  }
})();
