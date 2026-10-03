// Temporary verification script (will be deleted).
// Fetches the EXACT mqtt.js browser ESM bundle that bloby.html's importmap uses
// (cdnjs mqtt 5.14.1), then connects to the EMQX Serverless broker with
// credentials embedded in the wss:// URL — the same format bloby.html will ship.
import https from 'https';

const BUNDLE_URL = 'https://cdnjs.cloudflare.com/ajax/libs/mqtt/5.14.1/mqtt.esm.js';

// 1. Download the exact browser bundle
const src = await new Promise((resolve, reject) => {
  https
    .get(BUNDLE_URL, res => {
      if (res.statusCode !== 200) return reject(new Error('HTTP ' + res.statusCode));
      let d = '';
      res.on('data', c => (d += c));
      res.on('end', () => resolve(d));
    })
    .on('error', reject);
});
console.log('bundle bytes:', src.length);

// 2. Self-containment check (bare import specifiers)
const bare = [...src.matchAll(/^import\s[^'"]*?from\s+['"]([^'"]+)['"]/gm)]
  .map(m => m[1])
  .filter(n => !n.startsWith('.') && !n.startsWith('data:'));
console.log('bare import specifiers:', JSON.stringify(bare));

// 3. Import via data: URL (runs the browser bundle under Node v24,
//    which provides the same global WebSocket the browser does)
const mod = await import('data:text/javascript;base64,' + Buffer.from(src, 'utf8').toString('base64'));
const mqtt = mod.default;
console.log('mqtt lib loaded, version:', mqtt.version || 'unknown');

// 4. Connect with credentials embedded in URL (blobby.html target format)
const url = 'wss://blobbyuser:BlobbyJelly2026!@c616191f.ala.asia-southeast1.emqxsl.com:8084/mqtt';
const client = mqtt.connect(url, { forceNativeWebSocket: true, connectTimeout: 10000, reconnectPeriod: 30000 });

// Prove the bundle's url polyfill extracted auth from the URL
console.log('parsed options.username :', client.options.username);
console.log('parsed options.password :', String(client.options.password).replace(/./g, '*'));
console.log('clean WS url will be    :', client.options.protocol + '//' + client.options.hostname + ':' + client.options.port + (client.options.path || ''));

const timer = setTimeout(() => {
  console.log('RESULT: TIMEOUT — no CONNACK within 15s');
  try { client.end(); } catch {}
  process.exit(2);
}, 15000);

client.on('connect', pack => {
  console.log('RESULT: CONNECTED — CONNACK received:', JSON.stringify(pack));
  client.end(() => { clearTimeout(timer); process.exit(0); });
});
client.on('error', e => console.log('client error:', e && e.message ? e.message : String(e)));
client.on('close', () => console.log('close event'));
