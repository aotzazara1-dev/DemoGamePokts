const { spawn } = require('child_process');
const http = require('http');
const WebSocket = require('ws');

async function checkPortOpen(port) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}/`, () => resolve(true));
    req.on('error', () => resolve(false));
  });
}

async function runE2ESmoke() {
  console.log('--- Poktsonline E2E Smoke Test ---');

  const serverReady = await checkPortOpen(2567);
  const clientReady = await checkPortOpen(5173);

  if (!serverReady || !clientReady) {
    console.error(`Error: Both server (:2567, status: ${serverReady}) and client (:5173, status: ${clientReady}) must be running before running E2E smoke tests.`);
    process.exit(1);
  }

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chromeProc = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--disable-gpu',
    '--no-sandbox',
    '--disable-extensions',
    'http://localhost:5173/'
  ]);

  let wsUrl = null;
  for (let i = 0; i < 25; i++) {
    await new Promise(r => setTimeout(r, 200));
    try {
      const data = await new Promise((resolve, reject) => {
        http.get('http://localhost:9222/json', (res) => {
          let buf = '';
          res.on('data', c => buf += c);
          res.on('end', () => resolve(buf));
        }).on('error', reject);
      });
      const list = JSON.parse(data);
      const page = list.find(t => t.type === 'page' && t.webSocketDebuggerUrl);
      if (page) {
        wsUrl = page.webSocketDebuggerUrl;
        break;
      }
    } catch (e) {}
  }

  if (!wsUrl) {
    console.error('Failed to connect to headless Chrome remote debugging port.');
    chromeProc.kill();
    process.exit(1);
  }

  const ws = new WebSocket(wsUrl);
  let idCounter = 1;
  const pending = new Map();

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = idCounter++;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  ws.on('message', (raw) => {
    const msg = JSON.parse(raw);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(msg.error);
      else resolve(msg.result);
    }
  });

  await new Promise(r => ws.on('open', r));
  await send('Runtime.enable');
  await send('Page.enable');

  console.log('[1/4] Waiting for initial page load and Phaser canvas...');
  await new Promise(r => setTimeout(r, 2000));

  // Check Guest Login or Character Select
  console.log('[2/4] Authenticating as Guest if not already authenticated...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      const guestBtn = document.getElementById('btn-auth-guest');
      if (guestBtn && document.getElementById('auth-modal')?.classList.contains('open')) {
        guestBtn.click();
      }
    })()`
  });

  await new Promise(r => setTimeout(r, 1200));

  // Check Character Select
  console.log('[3/4] Ensuring active hero exists and clicking Enter World...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      const enterBtns = document.querySelectorAll('.btn-enter-world');
      if (enterBtns.length === 0) {
        const createBtn = document.querySelector('.btn-create-slot-hero');
        createBtn?.click();
        const input = document.getElementById('create-hero-name');
        if (input) input.value = 'SmokeTester';
        const submitBtn = document.getElementById('btn-submit-create-hero');
        submitBtn?.click();
      }
    })()`
  });

  // Poll until .btn-enter-world exists, then click it
  for (let i = 0; i < 20; i++) {
    const res = await send('Runtime.evaluate', {
      expression: `(() => {
        const enterBtn = document.querySelector('.btn-enter-world');
        if (enterBtn) {
          enterBtn.click();
          return true;
        }
        return false;
      })()`,
      returnByValue: true
    });
    if (res.result.value) {
      console.log('   -> Clicked Enter World.');
      break;
    }
    await new Promise(r => setTimeout(r, 250));
  }

  await new Promise(r => setTimeout(r, 2000));

  console.log('[4/4] Verifying Overworld Scene, player position, and camera bounds...');
  const inspection = await send('Runtime.evaluate', {
    expression: `(() => {
      const g = window.__PHASER_GAME__;
      if (!g) return { error: 'Phaser game instance not found on window.__PHASER_GAME__' };
      const overworld = g.scene.getScene('OverworldScene');
      if (!overworld) return { error: 'OverworldScene not found' };

      const cam = overworld.cameras?.main;
      const minimapCanvas = document.getElementById('minimap-canvas');
      const chatOverlay = document.getElementById('chat-overlay');
      const chatInput = document.getElementById('chat-input');
      const chatMessages = document.getElementById('chat-messages');

      let chatSent = false;
      if (chatInput && document.getElementById('chat-btn-send')) {
        chatInput.value = 'E2E Smoke Greetings!';
        document.getElementById('chat-btn-send').click();
        chatSent = true;
      }

      return {
        sceneActive: overworld.scene.isActive(),
        playerX: overworld.playerContainer?.x,
        playerY: overworld.playerContainer?.y,
        playerVisible: overworld.playerContainer?.visible,
        cameraScrollX: cam?.scrollX,
        cameraScrollY: cam?.scrollY,
        mapTilesCount: overworld.mapTiles?.length,
        mapConfigId: overworld.mapConfig?.id,
        minimapReady: !!minimapCanvas && minimapCanvas.width > 0,
        chatReady: !!chatOverlay && !!chatMessages && chatSent
      };
    })()`,
    returnByValue: true
  });

  ws.close();
  chromeProc.kill();

  const data = inspection.result.value;
  console.log('Scene Inspection Result:', data);

  if (data.error) {
    console.error('❌ E2E Smoke Test FAILED:', data.error);
    process.exit(1);
  }

  if (!data.sceneActive) {
    console.error('❌ E2E Smoke Test FAILED: OverworldScene is not active.');
    process.exit(1);
  }

  if (!data.playerVisible || typeof data.playerX !== 'number' || typeof data.playerY !== 'number') {
    console.error('❌ E2E Smoke Test FAILED: Player container not visible or missing coordinates.');
    process.exit(1);
  }

  // Ensure player is on valid map coordinates and not warped off into void
  if (data.playerX < 500 || data.playerX > 2500 || data.playerY < 200 || data.playerY > 1500) {
    console.error(`❌ E2E Smoke Test FAILED: Player position (${data.playerX}, ${data.playerY}) is outside valid map boundaries!`);
    process.exit(1);
  }

  // Ensure camera is looking near the player
  const camDist = Math.hypot(data.playerX - (data.cameraScrollX + 512), data.playerY - (data.cameraScrollY + 384));
  if (camDist > 400) {
    console.error(`❌ E2E Smoke Test FAILED: Camera is pointed far away from player (Distance: ${Math.round(camDist)}px)!`);
    process.exit(1);
  }

  if (!data.minimapReady) {
    console.error('❌ E2E Smoke Test FAILED: Minimap canvas is not loaded or ready.');
    process.exit(1);
  }

  if (!data.chatReady) {
    console.error('❌ E2E Smoke Test FAILED: Chat overlay is not ready or failed to send message.');
    process.exit(1);
  }

  console.log('✅ E2E Smoke Test PASSED! Game canvas renders player on map with camera focused, minimap radar ready, and chat system active.');
  process.exit(0);
}

runE2ESmoke().catch(err => {
  console.error('❌ E2E Smoke Test Error:', err);
  process.exit(1);
});
