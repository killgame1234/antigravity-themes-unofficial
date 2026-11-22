import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { spawn, execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CACHE_DIR = path.join(__dirname, '.cache');
const BRIDGE_PORT = 47831;
const isOff = process.argv.includes('--off');
const isBridge = process.argv.includes('--bridge');

function findDevToolsPort() {
  const candidates = [
    path.join(process.env.APPDATA || '', 'Antigravity', 'DevToolsActivePort'),
    path.join(process.env.LOCALAPPDATA || '', 'Antigravity', 'DevToolsActivePort'),
  ];
  for (const p of candidates) {
    if (p && fs.existsSync(p)) {
      const firstLine = fs.readFileSync(p, 'utf8').split(/\r?\n/)[0].trim();
      const port = Number(firstLine);
      if (port > 0) return port;
    }
  }
  return 9222;
}

// ============================================================================
// 1. Local yt-dlp Stream, Subtitle & CDP IFrame Bridge (127.0.0.1:47831)
// ============================================================================
if (isBridge) {
  process.on('uncaughtException', (err) => console.error('[Bridge uncaught]', err?.stack || err?.message || err));
  process.on('unhandledRejection', (err) => console.error('[Bridge unhandled]', err?.stack || err?.message || err));
  process.on('exit', (code) => console.log('[Bridge process.on(exit)] code:', code));
  process.on('SIGTERM', () => console.log('[Bridge SIGTERM]'));
  process.on('SIGINT', () => console.log('[Bridge SIGINT]'));

  fs.mkdirSync(CACHE_DIR, { recursive: true });
  const activeDownloads = new Map();

  const pruneCache = () => {
    try {
      const files = fs.readdirSync(CACHE_DIR)
        .filter(f => f.endsWith('.mp4') || f.endsWith('.vtt'))
        .map(f => {
          const full = path.join(CACHE_DIR, f);
          return { full, mtime: fs.statSync(full).mtimeMs };
        })
        .sort((a, b) => b.mtime - a.mtime);
      for (const old of files.slice(14)) {
        try { fs.unlinkSync(old.full); } catch (_) {}
      }
    } catch (_) {}
  };

  const serveCachedFile = (filePath, req, res) => {
    const stat = fs.statSync(filePath);
    const total = stat.size;
    const range = req.headers.range;
    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10) || 0;
      const end = parts[1] ? parseInt(parts[1], 10) : total - 1;
      if (start >= total || end >= total) {
        res.writeHead(416, { 'Content-Range': `bytes */${total}`, 'Access-Control-Allow-Origin': '*' });
        return res.end();
      }
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${total}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': end - start + 1,
        'Content-Type': 'video/mp4',
        'Access-Control-Allow-Origin': '*'
      });
      fs.createReadStream(filePath, { start, end }).pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': total,
        'Accept-Ranges': 'bytes',
        'Content-Type': 'video/mp4',
        'Access-Control-Allow-Origin': '*'
      });
      fs.createReadStream(filePath).pipe(res);
    }
  };

  const server = http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      return res.end();
    }

    const u = new URL(req.url, `http://127.0.0.1:${BRIDGE_PORT}`);

    if (u.pathname === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ ok: true, port: BRIDGE_PORT, v: 5 }));
    }

    if (u.pathname === '/search') {
      const q = (u.searchParams.get('q') || '').trim().slice(0, 120);
      if (!q) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ items: [] }));
      }
      try {
        const out = await new Promise((resolve, reject) => {
          const yt = spawn('yt-dlp', ['--flat-playlist', '--dump-json', '--no-warnings', `ytsearch5:${q}`], { windowsHide: true });
          let buf = '';
          const timer = setTimeout(() => { try { yt.kill(); } catch (_) {} resolve(buf); }, 12000);
          yt.stdout.on('data', c => { buf += c.toString('utf8'); });
          yt.on('error', (e) => { clearTimeout(timer); reject(e); });
          yt.on('close', () => { clearTimeout(timer); resolve(buf); });
        });
        const items = out.trim().split(/\r?\n/).filter(Boolean).map(line => {
          try {
            const d = JSON.parse(line);
            return {
              id: d.id,
              title: d.title || d.id,
              author: d.channel || d.uploader || '',
              duration: d.duration_string || (d.duration ? `${Math.floor(d.duration / 60)}:${String(Math.floor(d.duration % 60)).padStart(2, '0')}` : '')
            };
          } catch (_) { return null; }
        }).filter(x => x && x.id);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ items }));
      } catch (e) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ items: [], error: e.message }));
      }
    }

    if (u.pathname === '/playlist') {
      const listId = (u.searchParams.get('list') || '').replace(/[^a-zA-Z0-9_-]/g, '');
      if (!listId) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ items: [] }));
      }
      try {
        const out = await new Promise((resolve, reject) => {
          const yt = spawn('yt-dlp', ['--flat-playlist', '--dump-json', '--no-warnings', '--playlist-end', '40', `https://www.youtube.com/playlist?list=${listId}`], { windowsHide: true });
          let buf = '';
          const timer = setTimeout(() => { try { yt.kill(); } catch (_) {} resolve(buf); }, 15000);
          yt.stdout.on('data', c => { buf += c.toString('utf8'); });
          yt.on('error', (e) => { clearTimeout(timer); reject(e); });
          yt.on('close', () => { clearTimeout(timer); resolve(buf); });
        });
        const items = out.trim().split(/\r?\n/).filter(Boolean).map(line => {
          try {
            const d = JSON.parse(line);
            return {
              id: d.id,
              title: d.title || d.id,
              author: d.channel || d.uploader || ''
            };
          } catch (_) { return null; }
        }).filter(x => x && x.id && x.title !== '[Deleted video]' && x.title !== '[Private video]');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ items }));
      } catch (e) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ items: [], error: e.message }));
      }
    }

    if (u.pathname === '/thumb') {
      const id = (u.searchParams.get('id') || '').replace(/[^a-zA-Z0-9_-]/g, '');
      if (!id) {
        res.writeHead(400);
        return res.end();
      }
      try {
        const r = await fetch(`https://i.ytimg.com/vi/${id}/mqdefault.jpg`);
        if (r.ok) {
          const buf = Buffer.from(await r.arrayBuffer());
          res.writeHead(200, { 'Content-Type': 'image/jpeg', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'public, max-age=3600' });
          return res.end(buf);
        }
      } catch (_) {}
      res.writeHead(404);
      return res.end();
    }

    if (u.pathname === '/shutdown') {
      console.log('[Bridge] SHUTDOWN REQUEST RECEIVED from port:', req.socket.remotePort);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true }));
      setTimeout(() => process.exit(0), 100);
      return;
    }

    if (u.pathname === '/iframe-sync') {
      const play = u.searchParams.get('play') !== '0';
      const muted = u.searchParams.get('muted') === '1';
      const vol = Math.max(0, Math.min(1, Number(u.searchParams.get('vol') ?? 45) / 100));
      const loop = u.searchParams.get('loop') !== '0';
      const rate = Math.max(0.25, Math.min(2, Number(u.searchParams.get('rate') ?? 1) || 1));
      const seekParam = u.searchParams.get('seek');
      const seek = seekParam !== null && seekParam !== '' ? Number(seekParam) : null;
      const cc = u.searchParams.get('cc') === '1';
      const ccLang = (u.searchParams.get('ccLang') || 'auto').replace(/[^a-zA-Z0-9_-]/g, '');
      const ccScale = Math.max(0.6, Math.min(2.2, Number(u.searchParams.get('ccScale') ?? 1) || 1));
      const interactive = u.searchParams.get('interactive') === '1';
      const statusOnly = u.searchParams.get('statusOnly') === '1';

      try {
        const dp = findDevToolsPort();
        const targets = await (await fetch(`http://127.0.0.1:${dp}/json/list`)).json();
        const ytTarget = targets.find(t => t.type === 'iframe' && typeof t.url === 'string' && t.url.includes('youtube.com/embed'));
        if (!ytTarget || !ytTarget.webSocketDebuggerUrl) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ ok: false, reason: 'no_iframe_target' }));
        }
        const ws = new WebSocket(ytTarget.webSocketDebuggerUrl);
        if (typeof ws.on === 'function') ws.on('error', () => {});
        ws.onerror = () => {};
        await new Promise((r, j) => {
          ws.onopen = r;
          ws.onerror = j;
          setTimeout(() => j(new Error('ws_timeout')), 2000);
        });
        const result = await new Promise((resolve) => {
          const timer = setTimeout(() => {
            try { ws.close(); } catch (_) {}
            resolve({ ok: false, reason: 'timeout' });
          }, 3500);
          ws.onmessage = (ev) => {
            try {
              const msg = JSON.parse(ev.data);
              if (msg.id === 1) {
                clearTimeout(timer);
                resolve(msg.result?.result?.value || { ok: false });
              }
            } catch (_) {}
          };
          ws.onerror = () => {
            clearTimeout(timer);
            resolve({ ok: false, reason: 'ws_error' });
          };
          ws.onclose = () => {
            clearTimeout(timer);
            resolve({ ok: false, reason: 'ws_closed' });
          };
          ws.send(JSON.stringify({
            id: 1,
            method: 'Runtime.evaluate',
            params: {
              userGesture: true,
              awaitPromise: true,
              returnByValue: true,
              expression: `(async () => {
                const interactive = ${JSON.stringify(interactive)};
                const cc = ${JSON.stringify(cc)};
                const ccLang = ${JSON.stringify(ccLang)};
                const ccScale = ${JSON.stringify(ccScale)};
                const statusOnly = ${JSON.stringify(statusOnly)};

                let s = document.getElementById('ytg-clean-embed');
                if (!s) {
                  s = document.createElement('style');
                  s.id = 'ytg-clean-embed';
                  document.head.appendChild(s);
                }
                const hideBottom = interactive ? '' : '.ytp-chrome-bottom, .ytp-gradient-bottom,';
                const hideCaptions = cc ? '' : '.ytp-caption-window-container { display: none !important; }';
                s.textContent = \`
                  .ytp-chrome-top, .ytp-gradient-top, \${hideBottom}
                  .ytp-Watermark, .ytp-watermark, .ytp-pause-overlay,
                  .ytp-ce-element, .ytp-endscreen-content, .ytp-paid-content-overlay {
                    display: none !important;
                    opacity: 0 !important;
                    pointer-events: none !important;
                  }
                  \${hideCaptions}
                  .ytp-caption-window-container {
                    bottom: \${interactive ? '54px' : '28px'} !important;
                    z-index: 9999 !important;
                  }
                  .ytp-caption-segment {
                    font-size: calc(18px * \${ccScale}) !important;
                    line-height: 1.35 !important;
                    background: rgba(6, 6, 12, 0.78) !important;
                    padding: 2px 8px !important;
                    border-radius: 6px !important;
                    text-shadow: 0 1px 3px rgba(0,0,0,0.95) !important;
                  }
                \`;

                const errEl = document.querySelector('.ytp-error, .ytp-error-content-wrap');
                if (errEl && errEl.offsetParent !== null) {
                  return { ok: false, embedBlocked: true, errorText: errEl.innerText || 'Embed restricted' };
                }

                const v = document.querySelector('video');
                const player = document.getElementById('movie_player');
                if (!v) return { ok: false, reason: 'no_video' };

                if (!statusOnly) {
                  v.loop = ${JSON.stringify(loop)};
                  v.volume = ${JSON.stringify(vol)};
                  v.muted = ${JSON.stringify(muted)};
                  v.playbackRate = ${JSON.stringify(rate)};
                  const seekVal = ${JSON.stringify(seek)};
                  if (typeof seekVal === 'number' && !Number.isNaN(seekVal) && seekVal >= 0) {
                    v.currentTime = seekVal;
                  }
                  if (${JSON.stringify(play)}) {
                    if (v.paused) await v.play().catch(() => {});
                  } else {
                    if (!v.paused) v.pause();
                  }

                  // Control YouTube Captions module
                  try {
                    const subBtn = document.querySelector('.ytp-subtitles-button');
                    if (cc) {
                      if (player && typeof player.loadModule === 'function') player.loadModule('captions');
                      if (player && typeof player.toggleSubtitlesOn === 'function') player.toggleSubtitlesOn();
                      else if (subBtn && subBtn.getAttribute('aria-pressed') === 'false') subBtn.click();

                      const tracks = player?.getOption?.('captions', 'tracklist') || [];
                      if (tracks.length > 0) {
                        let chosen = tracks[0];
                        if (ccLang && ccLang !== 'auto') {
                          const match = tracks.find(t => t.languageCode === ccLang || (t.languageCode && t.languageCode.startsWith(ccLang)));
                          if (match) chosen = match;
                        }
                        player?.setOption?.('captions', 'track', chosen);
                      }
                    } else {
                      if (player && typeof player.setOption === 'function') player.setOption('captions', 'track', {});
                      if (subBtn && subBtn.getAttribute('aria-pressed') === 'true') subBtn.click();
                    }
                  } catch (_) {}
                }

                // Sample dominant vibrant RGB color from live YouTube video frame (16x9 offscreen canvas)
                let ambientRgb = null;
                try {
                  if (v.readyState >= 2 && v.videoWidth > 0) {
                    const c = window.__ytgAmbCanvas || (window.__ytgAmbCanvas = document.createElement('canvas'));
                    c.width = 16;
                    c.height = 9;
                    const ctx = c.getContext('2d', { willReadFrequently: true });
                    ctx.drawImage(v, 0, 0, 16, 9);
                    const data = ctx.getImageData(0, 0, 16, 9).data;
                    let wr = 0, wg = 0, wb = 0, wSum = 0;
                    for (let i = 0; i < data.length; i += 4) {
                      const r = data[i], g = data[i + 1], b = data[i + 2];
                      const max = Math.max(r, g, b), min = Math.min(r, g, b);
                      const sat = max === 0 ? 0 : (max - min) / max;
                      const lum = (max + min) / 510;
                      if (lum < 0.08 || lum > 0.94) continue;
                      const w = (sat * sat * 2.5 + 0.08) * (1 - Math.abs(lum - 0.5) * 1.1);
                      wr += r * w; wg += g * w; wb += b * w; wSum += w;
                    }
                    if (wSum > 0) {
                      ambientRgb = [Math.round(wr / wSum), Math.round(wg / wSum), Math.round(wb / wSum)];
                    }
                  }
                } catch (_) {}

                return {
                  ok: true,
                  paused: v.paused,
                  muted: v.muted,
                  volume: Math.round(v.volume * 100),
                  currentTime: v.currentTime || 0,
                  duration: Number.isFinite(v.duration) ? v.duration : 0,
                  playbackRate: v.playbackRate || 1,
                  width: v.videoWidth,
                  height: v.videoHeight,
                  ambientRgb
                };
              })()`
            }
          }));
        });
        try { ws.close(); } catch (_) {}
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify(result));
      } catch (e) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ ok: false, error: e.message }));
      }
    }

    if (u.pathname === '/subtitles') {
      const id = (u.searchParams.get('id') || '').replace(/[^a-zA-Z0-9_-]/g, '');
      const lang = (u.searchParams.get('lang') || 'en').replace(/[^a-zA-Z0-9_-]/g, '');
      if (!id) {
        res.writeHead(400);
        return res.end('WEBVTT\n\n');
      }
      const targetLang = (!lang || lang === 'auto') ? 'en' : lang;
      const vttCachePath = path.join(CACHE_DIR, `${id}.${targetLang}.vtt`);
      if (fs.existsSync(vttCachePath)) {
        res.writeHead(200, { 'Content-Type': 'text/vtt; charset=utf-8', 'Access-Control-Allow-Origin': '*' });
        return fs.createReadStream(vttCachePath).pipe(res);
      }
      try {
        const outBase = path.join(CACHE_DIR, `sub_${id}_${targetLang}`);
        execFileSync('yt-dlp', [
          '--skip-download',
          '--write-subs',
          '--write-auto-subs',
          '--sub-langs', `${targetLang},${targetLang}.*,en,en.*`,
          '--sub-format', 'vtt',
          '--no-playlist',
          '-o', outBase,
          `https://www.youtube.com/watch?v=${id}`
        ], { timeout: 12000, stdio: 'ignore', windowsHide: true });

        const matchFile = fs.readdirSync(CACHE_DIR).find(f => f.startsWith(`sub_${id}_${targetLang}`) && f.endsWith('.vtt'));
        if (matchFile) {
          const fullMatch = path.join(CACHE_DIR, matchFile);
          fs.renameSync(fullMatch, vttCachePath);
          pruneCache();
          res.writeHead(200, { 'Content-Type': 'text/vtt; charset=utf-8', 'Access-Control-Allow-Origin': '*' });
          return fs.createReadStream(vttCachePath).pipe(res);
        }
      } catch (_) {}
      res.writeHead(200, { 'Content-Type': 'text/vtt; charset=utf-8', 'Access-Control-Allow-Origin': '*' });
      return res.end('WEBVTT\n\n');
    }

    if (u.pathname === '/info') {
      const id = (u.searchParams.get('id') || '').replace(/[^a-zA-Z0-9_-]/g, '');
      if (!id) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Missing id' }));
      }
      try {
        const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}&format=json`;
        const r = await fetch(oembedUrl);
        if (r.ok) {
          const data = await r.json();
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ id, title: data.title, author: data.author_name }));
        }
      } catch (_) {}
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ id, title: `YouTube (${id})`, author: '' }));
    }

    if (u.pathname === '/stream') {
      const id = (u.searchParams.get('id') || '').replace(/[^a-zA-Z0-9_-]/g, '');
      if (!id) {
        res.writeHead(400);
        return res.end('Missing video id');
      }

      const cachedPath = path.join(CACHE_DIR, `${id}.mp4`);
      if (fs.existsSync(cachedPath) && fs.statSync(cachedPath).size > 32768) {
        return serveCachedFile(cachedPath, req, res);
      }

      const ytUrl = `https://www.youtube.com/watch?v=${id}`;
      // Skip 24/7 livestreams & dead links in Direct yt-dlp mode (let Embed iframe handle livestreams natively)
      const yt = spawn('yt-dlp', [
        '-q', '--no-warnings',
        '--match-filter', '!is_live',
        '-f', 'b[ext=mp4][protocol^=http]/18',
        '--no-playlist',
        '-o', '-',
        ytUrl
      ], { windowsHide: true });

      let headersSent = false;
      const cleanup = () => {
        try { yt.kill(); } catch (_) {}
      };
      req.on('close', cleanup);
      res.on('close', cleanup);

      yt.stdout.on('data', (chunk) => {
        if (!headersSent) {
          headersSent = true;
          res.writeHead(200, {
            'Content-Type': 'video/mp4',
            'Cache-Control': 'no-store',
            'Access-Control-Allow-Origin': '*'
          });
          // Only cache normal VODs once we confirmed yt-dlp actually returned media bytes
          if (!activeDownloads.has(id)) {
            const partPath = path.join(CACHE_DIR, `${id}.${Date.now()}.part.mp4`);
            const bg = spawn('yt-dlp', [
              '-q', '--no-warnings',
              '--match-filter', '!is_live',
              '-f', 'b[ext=mp4][protocol^=http]/18',
              '--no-playlist',
              '-o', partPath,
              ytUrl
            ], { stdio: 'ignore', windowsHide: true });
            activeDownloads.set(id, bg);
            bg.on('exit', (code) => {
              activeDownloads.delete(id);
              try {
                if (code === 0 && fs.existsSync(partPath) && fs.statSync(partPath).size > 32768) {
                  fs.renameSync(partPath, cachedPath);
                  pruneCache();
                } else if (fs.existsSync(partPath)) {
                  fs.unlinkSync(partPath);
                }
              } catch (_) {}
            });
          }
        }
        res.write(chunk);
      });

      yt.on('close', () => {
        if (!headersSent) {
          headersSent = true;
          res.writeHead(422, { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' });
          res.end('Live stream or unavailable for direct pipe');
        } else {
          res.end();
        }
      });
      return;
    }

    res.writeHead(404);
    res.end('Not found');
  });

  server.on('error', (err) => { console.error('Bridge error:', err.message); process.exit(0); });
  server.listen(BRIDGE_PORT, '127.0.0.1', () => console.log('Bridge listening on', BRIDGE_PORT));
  setInterval(() => {}, 3600000);
}

// ============================================================================
// 2. Ensure Bridge Daemon Is Running (or Restart if Upgraded)
// ============================================================================
async function ensureBridge(shouldRun) {
  const healthUrl = `http://127.0.0.1:${BRIDGE_PORT}/health`;
  const health = await fetch(healthUrl).then(r => r.json()).catch(() => null);
  const isUp = Boolean(health && health.ok);
  if (!shouldRun) {
    if (isUp) {
      await fetch(`http://127.0.0.1:${BRIDGE_PORT}/shutdown`).catch(() => {});
      console.log('[+] Gravitas Prism stream bridge stopped.');
    }
    return;
  }
  if (isUp && health.v === 5) {
    console.log(`[+] Gravitas Prism stream bridge v5 active on 127.0.0.1:${BRIDGE_PORT}`);
    return;
  }
  if (isUp) {
    await fetch(`http://127.0.0.1:${BRIDGE_PORT}/shutdown`).catch(() => {});
    await new Promise(r => setTimeout(r, 250));
  }
  const logFile = path.join(CACHE_DIR, 'bridge.log');
  const out = fs.openSync(logFile, 'a');
  const child = spawn(process.execPath, [fileURLToPath(import.meta.url), '--bridge'], {
    detached: true,
    stdio: ['ignore', out, out],
    windowsHide: true,
    env: { ...process.env, ELECTRON_RUN_AS_NODE: '1' }
  });
  child.unref();
  for (let i = 0; i < 15; i++) {
    await new Promise(r => setTimeout(r, 150));
    if (await fetch(healthUrl).then(r => r.ok).catch(() => false)) {
      console.log(`[+] Gravitas Prism stream bridge v2 started on 127.0.0.1:${BRIDGE_PORT}`);
      return;
    }
  }
  console.warn('[!] Stream bridge did not respond in time; Embed IFrame fallback will still work.');
}

async function evalCdp(wsUrl, expression) {
  const ws = new WebSocket(wsUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  try {
    return await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('CDP timeout')), 15000);
      ws.onmessage = (ev) => {
        const msg = JSON.parse(ev.data);
        if (msg.id === 1) {
          clearTimeout(timer);
          if (msg.error) reject(new Error(JSON.stringify(msg.error)));
          else if (msg.result?.exceptionDetails) reject(new Error(JSON.stringify(msg.result.exceptionDetails)));
          else resolve(msg.result?.result?.value);
        }
      };
      ws.send(JSON.stringify({
        id: 1,
        method: 'Runtime.evaluate',
        params: { expression, returnByValue: true, awaitPromise: true, userGesture: true }
      }));
    });
  } finally {
    ws.close();
  }
}

// ============================================================================
// 3. Injected Theme CSS & Multi-Layout / 3-Tab Draggable Mini-Controller
// ============================================================================
const THEME_CSS = `
:root {
  --ytg-r: 255;
  --ytg-g: 42;
  --ytg-b: 95;
  --ytg-rgb: var(--ytg-r), var(--ytg-g), var(--ytg-b);
  --ytg-accent: rgb(var(--ytg-r), var(--ytg-g), var(--ytg-b));
  --ytg-accent-soft: #FFE4EA;
  --ytg-accent-dark: rgba(24, 24, 38, 0.86);
  --ytg-caption-size: 18px;
}

:root, .dark, .theme-dark, body {
  --sidebar: rgba(10, 10, 16, 0.56) !important;
  --card: rgba(16, 16, 24, 0.72) !important;
  --card-border: rgba(var(--ytg-rgb), 0.42) !important;
  --border: rgba(255, 255, 255, 0.14) !important;
  --foreground: #F5F7FA !important;
  --secondary-foreground: #B8C0CC !important;
}

html, body, #root, .monaco-workbench {
  background: transparent !important;
  color: #F5F7FA !important;
}

.md-sticky-message-bleed, .ytg-clear-pane {
  background: transparent !important;
  background-color: transparent !important;
  background-image: none !important;
  box-shadow: none !important;
}

.md-sticky-message-bleed::after {
  display: none !important;
}

#root {
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.88), 0 0 12px rgba(0, 0, 0, 0.55);
}

/* Direct HTML5 Video WebVTT Captions Styling */
#ytg-bg-video::cue {
  background: rgba(6, 6, 12, 0.82);
  color: #FFFFFF;
  font-size: var(--ytg-caption-size, 18px);
  line-height: 1.35;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.95);
}

/* Transparent Left Sidebar (video shines straight through; crisp text-shadow keeps items readable) */
.ytg-sidebar,
.ytg-sidebar > div,
aside {
  --sidebar: transparent !important;
  --color-sidebar: transparent !important;
  background: transparent !important;
  background-color: transparent !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  border-right: 1px solid rgba(255, 255, 255, 0.14) !important;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.92), 0 0 10px rgba(0, 0, 0, 0.65);
}

.ytg-sidebar .bg-sidebar {
  background: transparent !important;
  background-color: transparent !important;
}

/* When Left Sidebar is closed and hovering peeks it out over the chat header, keep it 97% opaque so header text never bleeds through */
.agy-inset-shell [data-peek-surface="open"],
.agy-inset-shell [data-peek-surface="open"] > div {
  background: linear-gradient(180deg, rgba(13, 14, 23, 0.97) 0%, rgba(9, 10, 17, 0.98) 100%) !important;
  backdrop-filter: blur(24px) saturate(1.35) !important;
  -webkit-backdrop-filter: blur(24px) saturate(1.35) !important;
  box-shadow: 12px 0 36px rgba(0, 0, 0, 0.82) !important;
}

aside a,
button[data-testid="automations-button"] {
  border-radius: 10px !important;
  transition: background 0.18s ease, border-color 0.18s ease !important;
}

aside a:hover,
button[data-testid="automations-button"]:hover {
  background: rgba(var(--ytg-rgb), 0.2) !important;
  box-shadow: inset 0 0 0 1px rgba(var(--ytg-rgb), 0.42) !important;
}

/* Cinema Frosted Glass Top Header */
.ytg-header {
  background: rgba(10, 11, 18, 0.42) !important;
  backdrop-filter: blur(12px) !important;
  -webkit-backdrop-filter: blur(12px) !important;
  border-bottom: 1px solid rgba(var(--ytg-rgb), 0.2) !important;
}

/* User Message Bubbles */
[class*="group/user-input-step"] .bg-card-border,
.agy-user-bubble-frame,
.ytg-chat-card {
  background: linear-gradient(135deg, rgba(22, 22, 34, 0.76) 0%, rgba(15, 15, 24, 0.82) 100%) !important;
  backdrop-filter: blur(16px) saturate(1.25) !important;
  -webkit-backdrop-filter: blur(16px) saturate(1.25) !important;
  border: 1px solid rgba(var(--ytg-rgb), 0.5) !important;
  border-radius: 16px !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.1) !important;
}

[class*="group/user-input-step"] .bg-card,
.agy-user-bubble-frame > .agy-user-bubble {
  background: transparent !important;
}

/* Bottom Prompt Input Box (z-index: 60 so its /slash and @mention popups always stack above chat message rows) */
.surface-composer,
.rounded-2xl.bg-card-border,
.ytg-input-box {
  position: relative !important;
  z-index: 60 !important;
  background: linear-gradient(180deg, rgba(20, 21, 32, 0.78) 0%, rgba(14, 15, 24, 0.86) 100%) !important;
  backdrop-filter: blur(20px) saturate(1.3) !important;
  -webkit-backdrop-filter: blur(20px) saturate(1.3) !important;
  border: 1px solid rgba(var(--ytg-rgb), 0.52) !important;
  border-radius: 18px !important;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.55) !important;
}

/* Only make the inner composer card transparent — NEVER touch the .bg-card.absolute /slash or @mention autocomplete popup! */
.rounded-2xl.bg-card-border > .surface-composer-card,
.surface-composer > .surface-composer-card {
  background: transparent !important;
}

/* Code blocks, inline pills, and tables */
#root pre,
#root table {
  background: rgba(11, 12, 20, 0.82) !important;
  backdrop-filter: blur(14px) !important;
  -webkit-backdrop-filter: blur(14px) !important;
  border: 1px solid rgba(var(--ytg-rgb), 0.28) !important;
  border-radius: 12px !important;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.48) !important;
}

#root :not(pre) > code,
#root a[href^="file://"],
.inline-pill {
  background: var(--ytg-accent-dark, rgba(24, 24, 38, 0.86)) !important;
  color: var(--ytg-accent-soft, #FFE4EA) !important;
  border: 1px solid rgba(var(--ytg-rgb), 0.55) !important;
  border-radius: 6px !important;
  padding: 1px 6px !important;
  box-shadow: none !important;
}

/* Elevate top menu bar (Antigravity / Workspace / View / Window) above blurred sidebar stacking context */
.ytg-menubar {
  position: relative !important;
  z-index: 5000 !important;
}

/* Settings Modals, Top-Bar Dropdowns (.surface-opaque), Slash-Command Autocomplete (.agy-fastpick), Command Palette (.quick-input-widget) & Tooltips (.compact-tooltip) */
[role="menu"],
[role="listbox"],
[role="tooltip"],
[data-radix-popper-content-wrapper],
.agy-fastpick,
.quick-input-widget,
.compact-tooltip,
.surface-opaque:not(button),
.ytg-menu {
  z-index: 9999 !important;
}

.settings-modal-container,
.settings-modal-container .bg-background,
[role="dialog"],
[aria-modal="true"],
[role="menu"]:not(:empty),
[role="listbox"]:not(:empty),
[role="tooltip"]:not(:empty),
.rounded-2xl.bg-card-border > .bg-card.absolute,
.surface-composer > .bg-card.absolute,
[data-radix-popper-content-wrapper] .bg-popover,
[data-radix-popper-content-wrapper] .bg-card,
.agy-fastpick,
.agy-fastpick.surface-glass,
.quick-input-widget,
.quick-input-widget.surface-glass,
.compact-tooltip,
.surface-opaque:not(button),
.ytg-menu-box {
  background: linear-gradient(180deg, rgba(15, 16, 26, 0.97) 0%, rgba(10, 11, 18, 0.98) 100%) !important;
  background-color: rgba(13, 14, 23, 0.97) !important;
  backdrop-filter: blur(26px) saturate(1.35) !important;
  -webkit-backdrop-filter: blur(26px) saturate(1.35) !important;
  border: 1px solid rgba(var(--ytg-rgb), 0.45) !important;
  box-shadow: 0 16px 44px rgba(0, 0, 0, 0.82) !important;
}

/* ============================================================================
   YouTube Stage (#ytg-stage) — Supports Background, Split Side-Panel & PiP
   ============================================================================ */
#ytg-stage {
  position: fixed !important;
  inset: 0 !important;
  z-index: -1 !important;
  overflow: hidden !important;
  pointer-events: none !important;
  background: #050508 !important;
  transition: box-shadow 0.2s ease, border-color 0.2s ease !important;
}

#ytg-stage.is-split {
  z-index: 30 !important;
  background: radial-gradient(circle at 50% 50%, #0b0c14 0%, #040407 100%) !important;
}

#ytg-stage.is-interactive {
  z-index: 35 !important;
  pointer-events: auto !important;
}

#ytg-stage.is-interactive #ytg-bg-video,
#ytg-stage.is-interactive #ytg-bg-iframe {
  pointer-events: auto !important;
}

#ytg-stage.is-pip {
  z-index: 99985 !important;
  pointer-events: auto !important;
  border-radius: 14px !important;
  border: 1.5px solid rgba(var(--ytg-rgb), 0.65) !important;
  box-shadow: 0 18px 44px rgba(0, 0, 0, 0.8) !important;
}

#ytg-stage.is-pip #ytg-bg-video,
#ytg-stage.is-pip #ytg-bg-iframe {
  pointer-events: auto !important;
}

#ytg-pip-bar {
  display: none !important;
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  height: 28px !important;
  z-index: 10 !important;
  background: linear-gradient(180deg, rgba(12, 12, 20, 0.9) 0%, rgba(12, 12, 20, 0.35) 100%) !important;
  cursor: grab !important;
  align-items: center !important;
  justify-content: space-between !important;
  padding: 0 10px !important;
  font-size: 11px !important;
  color: #E2E8F0 !important;
  user-select: none !important;
}

#ytg-stage.is-pip #ytg-pip-bar {
  display: flex !important;
}

#ytg-pip-resize {
  display: none !important;
  position: absolute !important;
  right: 0 !important;
  bottom: 0 !important;
  width: 18px !important;
  height: 18px !important;
  z-index: 12 !important;
  cursor: nwse-resize !important;
  background: linear-gradient(135deg, transparent 50%, rgba(var(--ytg-rgb), 0.85) 50%) !important;
}

#ytg-stage.is-pip #ytg-pip-resize {
  display: block !important;
}

#ytg-media-wrap {
  position: absolute !important;
  inset: 0 !important;
  width: 100% !important;
  height: 100% !important;
  transform-origin: center center !important;
  will-change: opacity, filter, transform;
}

#ytg-bg-video {
  position: absolute !important;
  inset: 0 !important;
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
  pointer-events: none !important;
}

#ytg-bg-iframe {
  position: absolute !important;
  top: 50% !important;
  left: 50% !important;
  width: max(100%, 177.78vh) !important;
  height: max(100%, 56.25vw) !important;
  transform: translate(-50%, -50%) scale(1.02) !important;
  border: 0 !important;
  pointer-events: none !important;
}

#ytg-stage.fit-contain #ytg-bg-video,
#ytg-stage.is-split:not(.fit-cover):not(.fit-stretch) #ytg-bg-video,
#ytg-stage.is-pip:not(.fit-cover):not(.fit-stretch) #ytg-bg-video {
  object-fit: contain !important;
}

#ytg-stage.fit-contain #ytg-bg-iframe,
#ytg-stage.is-split #ytg-bg-iframe,
#ytg-stage.is-pip #ytg-bg-iframe {
  width: 100% !important;
  height: 100% !important;
  transform: translate(-50%, -50%) scale(1) !important;
}

#ytg-stage.fit-stretch #ytg-bg-video {
  object-fit: fill !important;
}

#ytg-vignette {
  position: absolute !important;
  inset: 0 !important;
  background: radial-gradient(circle at 50% 45%, rgba(8, 8, 14, 0.1) 0%, rgba(6, 6, 12, 0.58) 100%) !important;
  pointer-events: none !important;
}

#ytg-stage.is-split #ytg-vignette,
#ytg-stage.is-pip #ytg-vignette {
  display: none !important;
}

/* ============================================================================
   Split Side-Panel Conversation Layout & Draggable Vertical Resizer
   ============================================================================ */
.agy-sheet.ytg-sheet-split-right {
  margin-left: var(--ytg-video-w, 50%) !important;
  margin-right: 0 !important;
  width: calc(100% - var(--ytg-video-w, 50%)) !important;
  max-width: calc(100% - var(--ytg-video-w, 50%)) !important;
  flex: 0 0 calc(100% - var(--ytg-video-w, 50%)) !important;
  border-left: 1px solid rgba(var(--ytg-rgb), 0.48) !important;
  background: linear-gradient(180deg, rgba(10, 11, 18, 0.88) 0%, rgba(8, 9, 15, 0.94) 100%) !important;
  backdrop-filter: blur(20px) saturate(1.25) !important;
  -webkit-backdrop-filter: blur(20px) saturate(1.25) !important;
  box-shadow: -12px 0 36px rgba(0, 0, 0, 0.75) !important;
  z-index: 32 !important;
}

.agy-sheet.ytg-sheet-split-left {
  margin-right: var(--ytg-video-w, 50%) !important;
  margin-left: 0 !important;
  width: calc(100% - var(--ytg-video-w, 50%)) !important;
  max-width: calc(100% - var(--ytg-video-w, 50%)) !important;
  flex: 0 0 calc(100% - var(--ytg-video-w, 50%)) !important;
  border-right: 1px solid rgba(var(--ytg-rgb), 0.48) !important;
  background: linear-gradient(180deg, rgba(10, 11, 18, 0.88) 0%, rgba(8, 9, 15, 0.94) 100%) !important;
  backdrop-filter: blur(20px) saturate(1.25) !important;
  -webkit-backdrop-filter: blur(20px) saturate(1.25) !important;
  box-shadow: 12px 0 36px rgba(0, 0, 0, 0.75) !important;
  z-index: 32 !important;
}

#ytg-split-resizer {
  display: none;
  position: fixed !important;
  top: 35px !important;
  bottom: 0 !important;
  width: 10px !important;
  z-index: 99980 !important;
  cursor: col-resize !important;
  background: transparent !important;
  transition: background 0.15s ease !important;
}

#ytg-split-resizer::after {
  content: '' !important;
  position: absolute !important;
  top: 50% !important;
  left: 2px !important;
  transform: translateY(-50%) !important;
  width: 3px !important;
  height: 48px !important;
  border-radius: 99px !important;
  background: rgba(var(--ytg-rgb), 0.6) !important;
}

#ytg-split-resizer:hover,
#ytg-split-resizer.is-dragging {
  background: rgba(var(--ytg-rgb), 0.22) !important;
}

/* ============================================================================
   Draggable 3-Tab Mini-Controller (#ytg-controller)
   ============================================================================ */
#ytg-controller {
  position: fixed !important;
  right: 18px;
  bottom: 18px;
  z-index: 99998 !important;
  width: 362px !important;
  background: linear-gradient(160deg, rgba(15, 16, 25, 0.92) 0%, rgba(9, 10, 16, 0.96) 100%) !important;
  backdrop-filter: blur(24px) saturate(1.4) !important;
  -webkit-backdrop-filter: blur(24px) saturate(1.4) !important;
  border: 1px solid rgba(var(--ytg-rgb), 0.52) !important;
  border-radius: 16px !important;
  box-shadow: 0 14px 36px rgba(0, 0, 0, 0.72) !important;
  color: #F5F7FA !important;
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif !important;
  font-size: 12px !important;
  padding: 11px 13px !important;
  user-select: none !important;
}

#ytg-controller.is-collapsed {
  width: auto !important;
  max-width: 390px !important;
  padding: 6px 10px !important;
  border-radius: 999px !important;
}

#ytg-controller.is-hidden {
  display: none !important;
}

#ytg-controller.is-collapsed .ytg-body {
  display: none !important;
}

.ytg-pill-only {
  display: none !important;
}

#ytg-controller.is-collapsed .ytg-pill-only {
  display: inline-flex !important;
}

.ytg-top-row {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  gap: 8px !important;
  cursor: grab !important;
}

.ytg-top-row:active {
  cursor: grabbing !important;
}

.ytg-brand {
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
  min-width: 0 !important;
  flex: 1 !important;
}

.ytg-logo-dot {
  width: 24px !important;
  height: 17px !important;
  border-radius: 5px !important;
  background: linear-gradient(135deg, #FF1744 0%, #D50000 100%) !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  box-shadow: 0 0 12px rgba(255, 23, 68, 0.6) !important;
  flex-shrink: 0 !important;
}

.ytg-logo-dot::after {
  content: '' !important;
  border-style: solid !important;
  border-width: 4px 0 4px 7px !important;
  border-color: transparent transparent transparent #FFFFFF !important;
  margin-left: 1px !important;
}

.ytg-track-title {
  font-weight: 600 !important;
  font-size: 12px !important;
  color: #FFFFFF !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}

.ytg-tabs-bar {
  display: grid !important;
  grid-template-columns: repeat(3, 1fr) !important;
  gap: 5px !important;
  margin-top: 9px !important;
  padding: 3px !important;
  background: rgba(6, 7, 12, 0.65) !important;
  border-radius: 10px !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
}

.ytg-tab-btn {
  background: transparent !important;
  border: 0 !important;
  color: #A0AEC0 !important;
  border-radius: 7px !important;
  padding: 5px 6px !important;
  font-size: 11px !important;
  font-weight: 600 !important;
  cursor: pointer !important;
  transition: all 0.15s ease !important;
  text-align: center !important;
}

.ytg-tab-btn:hover {
  color: #FFFFFF !important;
  background: rgba(255, 255, 255, 0.06) !important;
}

.ytg-tab-btn.is-active {
  background: linear-gradient(135deg, rgba(var(--ytg-rgb), 0.4) 0%, rgba(var(--ytg-rgb), 0.26) 100%) !important;
  color: #FFFFFF !important;
  box-shadow: inset 0 0 0 1px rgba(var(--ytg-rgb), 0.62) !important;
}

.ytg-tab-pane {
  display: none !important;
  flex-direction: column !important;
  gap: 8px !important;
  margin-top: 9px !important;
}

.ytg-tab-pane.is-active {
  display: flex !important;
}

.ytg-icon-btn {
  background: rgba(255, 255, 255, 0.08) !important;
  border: 1px solid rgba(255, 255, 255, 0.14) !important;
  color: #F0F4F8 !important;
  border-radius: 8px !important;
  padding: 4px 8px !important;
  font-size: 11px !important;
  cursor: pointer !important;
  transition: all 0.15s ease !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 4px !important;
}

.ytg-icon-btn:hover {
  background: rgba(var(--ytg-rgb), 0.28) !important;
  border-color: rgba(var(--ytg-rgb), 0.68) !important;
  color: #FFFFFF !important;
}

.ytg-icon-btn.is-active {
  background: rgba(var(--ytg-rgb), 0.32) !important;
  border-color: rgba(var(--ytg-rgb), 0.85) !important;
  color: #FFFFFF !important;
  box-shadow: none !important;
}

.ytg-input-row {
  display: flex !important;
  gap: 6px !important;
}

#ytg-url-input {
  flex: 1 !important;
  background: rgba(6, 7, 12, 0.82) !important;
  border: 1px solid rgba(255, 255, 255, 0.16) !important;
  border-radius: 8px !important;
  color: #FFFFFF !important;
  padding: 6px 9px !important;
  font-size: 11.5px !important;
  outline: none !important;
}

#ytg-url-input:focus {
  border-color: var(--ytg-accent) !important;
  box-shadow: 0 0 0 2px rgba(var(--ytg-rgb), 0.26) !important;
}

.ytg-select {
  width: 100% !important;
  background: rgba(10, 11, 18, 0.86) !important;
  border: 1px solid rgba(255, 255, 255, 0.14) !important;
  border-radius: 8px !important;
  color: #D8E0EA !important;
  padding: 5px 8px !important;
  font-size: 11px !important;
  outline: none !important;
  cursor: pointer !important;
}

.ytg-controls-row {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  gap: 5px !important;
}

.ytg-seek-row {
  display: flex !important;
  align-items: center !important;
  gap: 6px !important;
  font-size: 10.5px !important;
  color: #C4CCD8 !important;
}

.ytg-seek-row input[type="range"] {
  flex: 1 !important;
  accent-color: var(--ytg-accent) !important;
  cursor: pointer !important;
  height: 4px !important;
}

.ytg-slider-grid {
  display: grid !important;
  grid-template-columns: 64px 1fr 40px !important;
  align-items: center !important;
  gap: 6px 8px !important;
  font-size: 11px !important;
  color: #C2CAD6 !important;
}

.ytg-slider-grid input[type="range"] {
  width: 100% !important;
  accent-color: var(--ytg-accent) !important;
  cursor: pointer !important;
  height: 4px !important;
}

.ytg-section-label {
  font-size: 10.5px !important;
  font-weight: 600 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.05em !important;
  color: var(--ytg-accent-soft) !important;
  margin-top: 2px !important;
}

.ytg-status {
  font-size: 10.5px !important;
  color: #9AA6B8 !important;
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  margin-top: 6px !important;
  padding-top: 6px !important;
  border-top: 1px solid rgba(255, 255, 255, 0.08) !important;
}

.ytg-list-panel {
  max-height: 158px !important;
  overflow-y: auto !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 4px !important;
  padding: 4px !important;
  background: rgba(6, 7, 12, 0.72) !important;
  border: 1px solid rgba(var(--ytg-rgb), 0.28) !important;
  border-radius: 10px !important;
}

.ytg-list-item {
  display: flex !important;
  align-items: center !important;
  gap: 7px !important;
  padding: 4px 6px !important;
  border-radius: 7px !important;
  background: rgba(255, 255, 255, 0.04) !important;
  cursor: pointer !important;
  transition: background 0.14s ease !important;
}

.ytg-list-item:hover {
  background: rgba(var(--ytg-rgb), 0.2) !important;
}

.ytg-list-item.is-playing {
  background: rgba(var(--ytg-rgb), 0.26) !important;
  border: 1px solid rgba(var(--ytg-rgb), 0.52) !important;
}

.ytg-list-thumb {
  width: 38px !important;
  height: 24px !important;
  border-radius: 4px !important;
  object-fit: cover !important;
  flex-shrink: 0 !important;
  background: #0d0e17 !important;
}

.ytg-list-meta {
  min-width: 0 !important;
  flex: 1 !important;
  display: flex !important;
  flex-direction: column !important;
  line-height: 1.2 !important;
}

.ytg-list-title {
  font-size: 11px !important;
  font-weight: 500 !important;
  color: #F5F7FA !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}

.ytg-list-sub {
  font-size: 9.5px !important;
  color: #9AA6B8 !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}

.ytg-hotkey-hint {
  font-size: 10px !important;
  color: #8E9BAE !important;
  line-height: 1.45 !important;
  padding: 6px 8px !important;
  border-radius: 8px !important;
  background: rgba(6, 7, 12, 0.55) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
}

#ytg-toast {
  position: fixed !important;
  left: 50% !important;
  bottom: 24px !important;
  transform: translateX(-50%) translateY(14px) !important;
  z-index: 99999 !important;
  background: rgba(13, 14, 23, 0.96) !important;
  border: 1px solid rgba(var(--ytg-rgb), 0.55) !important;
  color: #F5F7FA !important;
  padding: 7px 14px !important;
  border-radius: 999px !important;
  font-family: 'Segoe UI', system-ui, sans-serif !important;
  font-size: 11.5px !important;
  font-weight: 500 !important;
  pointer-events: none !important;
  opacity: 0 !important;
  transition: opacity 0.2s ease, transform 0.2s ease !important;
}

#ytg-toast.is-show {
  opacity: 1 !important;
  transform: translateX(-50%) translateY(0) !important;
}
`;

const INJECT_JS = `(() => {
  // 1. Clean up previous themes & old Gravitas Prism instances
  const oldIds = [
    'castorice-3d-theme', 'castorice-intro-overlay', 'castorice-3d-canvas',
    'custom-antigravity-theme', 'eldritch-bg-video', 'eldritch-vignette-overlay',
    'eldritch-rift-header', 'prescript-fate-canvas', 'prescript-hand-bg',
    'prescript-vignette-overlay', 'prescript-header-insignia',
    'capri-companion-root', 'capri-lightning-canvas', 'capri-top-popout',
    'ytg-theme-style', 'ytg-stage', 'ytg-controller', 'ytg-split-resizer', 'ytg-toast'
  ];
  for (const id of oldIds) {
    const el = document.getElementById(id);
    if (el) el.remove();
  }
  if (window.__castoricePaneObserver) {
    try { window.__castoricePaneObserver.disconnect(); } catch (_) {}
    window.__castoricePaneObserver = null;
  }
  if (typeof window.__castorice3DCleanup === 'function') {
    try { window.__castorice3DCleanup(); } catch (_) {}
  }
  if (window.__ytgObserver) {
    try { window.__ytgObserver.disconnect(); } catch (_) {}
    window.__ytgObserver = null;
  }
  if (window.__ytgPollTimer) {
    clearInterval(window.__ytgPollTimer);
    window.__ytgPollTimer = null;
  }
  if (window.__ytgAmbientTimer) {
    clearInterval(window.__ytgAmbientTimer);
    window.__ytgAmbientTimer = null;
  }
  for (const prop of ['--ytg-r', '--ytg-g', '--ytg-b', '--ytg-accent-soft', '--ytg-accent-dark']) {
    document.documentElement.style.removeProperty(prop);
  }
  for (const el of document.querySelectorAll('.castorice-hsr-sticker, .castorice-hsr-hero-logo-img, .castorice-hsr-thinking-pill')) {
    el.remove();
  }
  for (const el of document.querySelectorAll('[class*="castorice-"], [class*="ytg-"]')) {
    for (const c of Array.from(el.classList)) {
      if (c.startsWith('castorice-') || c.startsWith('ytg-')) el.classList.remove(c);
    }
  }

  // 2. Inject Theme CSS
  const style = document.createElement('style');
  style.id = 'ytg-theme-style';
  style.textContent = ${JSON.stringify(THEME_CSS)};
  document.head.appendChild(style);

  // 3. Presets & Persistent State
  const BRIDGE = 'http://127.0.0.1:${BRIDGE_PORT}';
  const STORAGE_KEY = 'yt_gravity_state_v1';
  const DEFAULT_PRESETS = [
    { id: 'LXb3EKWsInQ', title: '🌿 Costa Rica 4K Rainforest Nature' },
    { id: 'rFZHOHl-L8A', title: '🎧 Lofi Girl Radio - Beats to Relax/Study' },
    { id: '4xDzrJKXOOY', title: '🌆 Synthwave Radio - Chill / Retro' },
    { id: 'eKFTSSKCzWA', title: '🌧️ Cyberpunk Rain & Neon Ambience' }
  ];

  let state = {
    videoId: 'LXb3EKWsInQ',
    urlInput: 'https://www.youtube.com/watch?v=LXb3EKWsInQ',
    title: '🌿 Costa Rica 4K Rainforest Nature',
    engine: 'embed',        // 'embed' | 'direct'
    activeTab: 'media',     // 'media' | 'video' | 'layout'
    playing: true,
    muted: true,
    volume: 45,
    playbackRate: 1,
    loop: true,
    // Video & CC tab
    ambientMode: 'live',    // 'live' | 'static' | 'red'
    ccEnabled: false,
    ccLang: 'auto',
    ccScale: 1,             // 0.8 (S), 1 (M), 1.35 (L), 1.7 (XL)
    fitMode: 'cover',       // 'cover' | 'contain' | 'stretch'
    scale: 100,             // 50..160%
    panX: 0,                // -50..50%
    panY: 0,                // -50..50%
    opacity: 72,            // 5..100%
    blur: 1,                // 0..24px
    // Layout tab
    layoutMode: 'background', // 'background' | 'split' | 'pip'
    splitSide: 'right',       // 'right' (Video Left, Chat Right) | 'left' (Chat Left, Video Right)
    chatWidthPct: 44,         // 28..72%
    hideLeftNavInSplit: true,
    interactivePlayer: false,
    // Draggable controller & PiP positions
    ctrlPos: null,            // { x, y }
    pipRect: { x: 28, y: 56, w: 480, h: 270 },
    collapsed: false,
    hidden: false,
    queue: [],
    queueIndex: -1,
    history: DEFAULT_PRESETS
  };

  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (saved && typeof saved === 'object') {
      state = { ...state, ...saved };
      if (!Array.isArray(state.history) || state.history.length === 0) {
        state.history = DEFAULT_PRESETS;
      } else {
        // Migrate expired old Lofi Girl ID (5qap5aO4i9A) to active live stream (rFZHOHl-L8A)
        state.history = state.history.map(h => h.id === '5qap5aO4i9A'
          ? { id: 'rFZHOHl-L8A', title: '🎧 Lofi Girl Radio - Beats to Relax/Study' }
          : h);
      }
      if (state.videoId === '5qap5aO4i9A') state.videoId = 'rFZHOHl-L8A';
      if (!Array.isArray(state.queue)) state.queue = [];
      if (typeof state.queueIndex !== 'number') state.queueIndex = -1;
      if (!state.pipRect || typeof state.pipRect.w !== 'number') {
        state.pipRect = { x: 28, y: 56, w: 480, h: 270 };
      }
    }
  } catch (_) {}

  let activeEngine = state.engine || 'embed';
  let currentDuration = 0;
  let currentTimeSec = 0;
  let isSeeking = false;

  const saveState = () => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (_) {}
  };

  const extractYouTubeId = (raw) => {
    if (!raw) return null;
    const s = raw.trim();
    if (/^[a-zA-Z0-9_-]{11}$/.test(s)) return s;
    const m = s.match(/(?:v=|youtu\\.be\\/|embed\\/|shorts\\/|live\\/)([a-zA-Z0-9_-]{11})/);
    return m ? m[1] : null;
  };

  const extractPlaylistId = (raw) => {
    if (!raw) return null;
    const m = raw.trim().match(/[?&]list=([a-zA-Z0-9_-]+)/);
    return m ? m[1] : null;
  };

  const toastEl = document.createElement('div');
  toastEl.id = 'ytg-toast';
  document.body.appendChild(toastEl);
  let toastTimer = null;
  const showToast = (msg) => {
    toastEl.textContent = msg;
    toastEl.classList.add('is-show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-show'), 2100);
  };

  const fmtTime = (sec) => {
    if (!Number.isFinite(sec) || sec < 0) return '0:00';
    const s = Math.floor(sec);
    const hrs = Math.floor(s / 3600);
    const mins = Math.floor((s % 3600) / 60);
    const rem = s % 60;
    if (hrs > 0) return hrs + ':' + String(mins).padStart(2, '0') + ':' + String(rem).padStart(2, '0');
    return mins + ':' + String(rem).padStart(2, '0');
  };

  // 4. Create Background / Split / PiP Video Stage (#ytg-stage) & Split Resizer (#ytg-split-resizer)
  const stage = document.createElement('div');
  stage.id = 'ytg-stage';
  stage.innerHTML = \`
    <div id="ytg-pip-bar">
      <span style="font-weight:600;display:flex;align-items:center;gap:6px;">
        <span class="ytg-logo-dot" style="width:18px;height:13px;"></span>
        <span>YouTube PiP (Drag to move)</span>
      </span>
      <button class="ytg-icon-btn" id="ytg-pip-close-btn" style="padding:1px 6px;font-size:10px;" title="Return to Background Mode">✕</button>
    </div>
    <div id="ytg-media-wrap">
      <video id="ytg-bg-video" crossorigin="anonymous" playsinline></video>
      <iframe id="ytg-bg-iframe" allow="autoplay; encrypted-media; picture-in-picture" style="display:none"></iframe>
    </div>
    <div id="ytg-vignette"></div>
    <div id="ytg-pip-resize" title="Drag to resize PiP player"></div>
  \`;
  document.body.prepend(stage);

  const splitResizer = document.createElement('div');
  splitResizer.id = 'ytg-split-resizer';
  splitResizer.title = 'Drag to resize YouTube vs Conversation Split Panel';
  document.body.appendChild(splitResizer);

  const mediaWrap = document.getElementById('ytg-media-wrap');
  const videoEl = document.getElementById('ytg-bg-video');
  const iframeEl = document.getElementById('ytg-bg-iframe');
  const pipBar = document.getElementById('ytg-pip-bar');
  const pipResize = document.getElementById('ytg-pip-resize');
  const pipCloseBtn = document.getElementById('ytg-pip-close-btn');

  // 5. Create Draggable 3-Tab Mini-Controller (#ytg-controller)
  const ctrl = document.createElement('div');
  ctrl.id = 'ytg-controller';
  if (state.collapsed) ctrl.classList.add('is-collapsed');
  if (state.hidden) ctrl.classList.add('is-hidden');
  ctrl.innerHTML = \`
    <div class="ytg-top-row" id="ytg-drag-handle" title="Drag to move controller anywhere">
      <div class="ytg-brand" id="ytg-brand-toggle">
        <span class="ytg-logo-dot"></span>
        <span class="ytg-track-title" id="ytg-title-label">Gravitas Prism</span>
      </div>
      <div style="display:flex;gap:4px;align-items:center;">
        <button class="ytg-icon-btn ytg-pill-only" id="ytg-pill-play" style="padding:3px 6px;" title="Play / Pause (Alt+Shift+P)">⏸</button>
        <button class="ytg-icon-btn ytg-pill-only" id="ytg-pill-next" style="padding:3px 6px;" title="Next Track (Alt+Shift+N)">⏭</button>
        <button class="ytg-icon-btn ytg-pill-only" id="ytg-pill-mute" style="padding:3px 6px;" title="Mute / Unmute (Alt+Shift+M)">🔇</button>
        <button class="ytg-icon-btn" id="ytg-quick-layout-btn" title="Quick Cycle Layout (Alt+Shift+S)">🌓</button>
        <button class="ytg-icon-btn" id="ytg-collapse-btn" title="Minimize / Expand">\${state.collapsed ? '▲' : '—'}</button>
      </div>
    </div>

    <div class="ytg-body">
      <div class="ytg-tabs-bar">
        <button class="ytg-tab-btn" data-tab="media">▶ Media</button>
        <button class="ytg-tab-btn" data-tab="video">🎬 Video & CC</button>
        <button class="ytg-tab-btn" data-tab="layout">📐 Layout</button>
      </div>

      <!-- TAB 1: MEDIA -->
      <div class="ytg-tab-pane" data-pane="media">
        <div class="ytg-input-row">
          <input id="ytg-url-input" type="text" placeholder="Search YouTube, paste URL or Playlist..." value="\${state.urlInput || ''}" />
          <button class="ytg-icon-btn is-active" id="ytg-load-btn">Go</button>
        </div>

        <!-- Inline YouTube Search Results (shown when searching by keyword) -->
        <div id="ytg-search-wrap" style="display:none;flex-direction:column;gap:4px;">
          <div style="display:flex;justify-content:space-between;align-items:center;font-size:10px;color:var(--ytg-accent-soft);">
            <span id="ytg-search-header">🔍 Search Results</span>
            <button class="ytg-icon-btn" id="ytg-search-close" style="padding:1px 6px;font-size:10px;">✕</button>
          </div>
          <div class="ytg-list-panel" id="ytg-search-list"></div>
        </div>

        <select class="ytg-select" id="ytg-preset-select" title="Recent & Preset YouTube Videos"></select>

        <!-- Queue & Playlist Transport Row -->
        <div class="ytg-controls-row">
          <button class="ytg-icon-btn" id="ytg-prev-btn" style="padding:4px 7px;" title="Previous Track (Alt+Shift+B)">⏮</button>
          <button class="ytg-icon-btn" id="ytg-queue-toggle" style="flex:1;" title="Show / Hide Playlist Queue">📋 Queue (0)</button>
          <button class="ytg-icon-btn" id="ytg-shuffle-btn" style="padding:4px 7px;" title="Shuffle Queue">🔀</button>
          <button class="ytg-icon-btn" id="ytg-next-btn" style="padding:4px 7px;" title="Next Track (Alt+Shift+N)">⏭</button>
        </div>

        <!-- Toggleable Queue List -->
        <div id="ytg-queue-wrap" style="display:none;flex-direction:column;gap:4px;">
          <div style="display:flex;justify-content:space-between;align-items:center;font-size:10px;color:var(--ytg-accent-soft);">
            <span>📋 Up Next Queue</span>
            <button class="ytg-icon-btn" id="ytg-queue-clear" style="padding:1px 6px;font-size:10px;">Clear</button>
          </div>
          <div class="ytg-list-panel" id="ytg-queue-list"></div>
        </div>

        <!-- Timeline Seek Bar -->
        <div class="ytg-seek-row">
          <button class="ytg-icon-btn" id="ytg-seek-back" style="padding:2px 5px;font-size:10px;" title="Rewind 10s">-10s</button>
          <input type="range" id="ytg-seek-slider" min="0" max="100" value="0" />
          <button class="ytg-icon-btn" id="ytg-seek-fwd" style="padding:2px 5px;font-size:10px;" title="Forward 10s">+10s</button>
          <span id="ytg-time-label" style="min-width:66px;text-align:right;font-variant-numeric:tabular-nums;">0:00 / 0:00</span>
        </div>

        <div class="ytg-controls-row">
          <button class="ytg-icon-btn" id="ytg-play-btn" title="Play / Pause">⏸ Pause</button>
          <button class="ytg-icon-btn" id="ytg-mute-btn" title="Mute / Unmute">🔇 Muted</button>
          <button class="ytg-icon-btn" id="ytg-loop-btn" title="Toggle Loop">🔁 Loop</button>
          <button class="ytg-icon-btn" id="ytg-engine-btn" title="Switch between 1080p/4K Embed and Direct yt-dlp stream">📺 Embed</button>
        </div>

        <div class="ytg-slider-grid">
          <span>🔊 Volume</span>
          <input type="range" id="ytg-vol-slider" min="0" max="100" value="\${state.volume}" />
          <span id="ytg-vol-val">\${state.volume}%</span>
        </div>

        <div class="ytg-controls-row" style="margin-top:2px;">
          <span style="font-size:11px;color:#C2CAD6;">⚡ Speed</span>
          <div style="display:flex;gap:4px;" id="ytg-speed-group">
            <button class="ytg-icon-btn" data-rate="0.75" style="padding:3px 6px;font-size:10.5px;">0.75x</button>
            <button class="ytg-icon-btn" data-rate="1" style="padding:3px 6px;font-size:10.5px;">1x</button>
            <button class="ytg-icon-btn" data-rate="1.25" style="padding:3px 6px;font-size:10.5px;">1.25x</button>
            <button class="ytg-icon-btn" data-rate="1.5" style="padding:3px 6px;font-size:10.5px;">1.5x</button>
            <button class="ytg-icon-btn" data-rate="2" style="padding:3px 6px;font-size:10.5px;">2x</button>
          </div>
        </div>
      </div>

      <!-- TAB 2: VIDEO & CC -->
      <div class="ytg-tab-pane" data-pane="video">
        <div class="ytg-section-label" style="display:flex;align-items:center;justify-content:space-between;">
          <span>🌈 Ambient Light Color</span>
          <span id="ytg-ambient-swatch" style="width:12px;height:12px;border-radius:99px;background:var(--ytg-accent);display:inline-block;"></span>
        </div>
        <div class="ytg-controls-row" id="ytg-ambient-group">
          <button class="ytg-icon-btn" data-ambient="live" style="flex:1;">✨ Live</button>
          <button class="ytg-icon-btn" data-ambient="static" style="flex:1;">🎨 Static</button>
          <button class="ytg-icon-btn" data-ambient="red" style="flex:1;">🔴 Red</button>
        </div>

        <div class="ytg-section-label">💬 Captions / Subtitles (CC)</div>
        <div class="ytg-controls-row">
          <button class="ytg-icon-btn" id="ytg-cc-toggle" style="flex:1;">CC: Off</button>
          <select class="ytg-select" id="ytg-cc-lang" style="flex:1.4;" title="Caption Language">
            <option value="auto">🌐 Auto / Default</option>
            <option value="en">🇺🇸 English (en)</option>
            <option value="vi">🇻🇳 Tiếng Việt (vi)</option>
            <option value="ja">🇯🇵 日本語 (ja)</option>
            <option value="ko">🇰🇷 한국어 (ko)</option>
            <option value="zh">🇨🇳 中文 (zh)</option>
            <option value="es">🇪🇸 Español (es)</option>
            <option value="fr">🇫🇷 Français (fr)</option>
          </select>
        </div>
        <div class="ytg-controls-row">
          <span style="font-size:11px;color:#C2CAD6;">CC Size</span>
          <div style="display:flex;gap:4px;" id="ytg-cc-size-group">
            <button class="ytg-icon-btn" data-ccscale="0.8" style="padding:3px 8px;">S</button>
            <button class="ytg-icon-btn" data-ccscale="1" style="padding:3px 8px;">M</button>
            <button class="ytg-icon-btn" data-ccscale="1.35" style="padding:3px 8px;">L</button>
            <button class="ytg-icon-btn" data-ccscale="1.7" style="padding:3px 8px;">XL</button>
          </div>
        </div>

        <div class="ytg-section-label">🖼️ Video Size, Fit & Framing</div>
        <div class="ytg-controls-row" id="ytg-fit-group">
          <button class="ytg-icon-btn" data-fit="cover" style="flex:1;">Cover (Fill)</button>
          <button class="ytg-icon-btn" data-fit="contain" style="flex:1;">Contain (Full)</button>
          <button class="ytg-icon-btn" data-fit="stretch" style="flex:1;">Stretch</button>
        </div>

        <div class="ytg-slider-grid">
          <span>🔍 Zoom</span>
          <input type="range" id="ytg-scale-slider" min="50" max="160" value="\${state.scale}" />
          <span id="ytg-scale-val">\${state.scale}%</span>

          <span>↔️ Pan X</span>
          <input type="range" id="ytg-panx-slider" min="-50" max="50" value="\${state.panX}" />
          <span id="ytg-panx-val">\${state.panX}%</span>

          <span>↕️ Pan Y</span>
          <input type="range" id="ytg-pany-slider" min="-50" max="50" value="\${state.panY}" />
          <span id="ytg-pany-val">\${state.panY}%</span>

          <span>✨ Opacity</span>
          <input type="range" id="ytg-opa-slider" min="5" max="100" value="\${state.opacity}" />
          <span id="ytg-opa-val">\${state.opacity}%</span>

          <span>💧 Blur</span>
          <input type="range" id="ytg-blur-slider" min="0" max="24" value="\${state.blur}" />
          <span id="ytg-blur-val">\${state.blur}px</span>
        </div>

        <button class="ytg-icon-btn" id="ytg-reset-video-btn" style="width:100%;margin-top:2px;">↺ Reset Size, Pan & Opacity</button>
      </div>

      <!-- TAB 3: LAYOUT (WATCH + SIDE PANEL CONVERSATION) -->
      <div class="ytg-tab-pane" data-pane="layout">
        <div class="ytg-section-label">🖥️ Viewing Mode</div>
        <div class="ytg-controls-row" id="ytg-layout-group">
          <button class="ytg-icon-btn" data-layout="background" style="flex:1;">🖼️ Background</button>
          <button class="ytg-icon-btn" data-layout="split" style="flex:1.15;">🌓 Split Panel</button>
          <button class="ytg-icon-btn" data-layout="pip" style="flex:1;">🪟 Float PiP</button>
        </div>

        <div class="ytg-section-label">🌓 Split Side-Panel Settings</div>
        <div class="ytg-controls-row" id="ytg-splitside-group">
          <button class="ytg-icon-btn" data-side="right" style="flex:1;">🎬 Video Left | 💬 Chat Right</button>
          <button class="ytg-icon-btn" data-side="left" style="flex:1;">💬 Chat Left | 🎬 Video Right</button>
        </div>

        <div class="ytg-slider-grid">
          <span>💬 Chat %</span>
          <input type="range" id="ytg-chatw-slider" min="28" max="72" value="\${state.chatWidthPct}" />
          <span id="ytg-chatw-val">\${state.chatWidthPct}%</span>
        </div>

        <div class="ytg-controls-row">
          <button class="ytg-icon-btn" id="ytg-tuck-nav-btn" style="flex:1;" title="Auto-hide the left workspaces sidebar when in Split Side-Panel mode">⬅️ Auto-Tuck Left Nav</button>
        </div>

        <div class="ytg-section-label">🖱️ Direct YouTube Interaction</div>
        <div class="ytg-controls-row">
          <button class="ytg-icon-btn" id="ytg-interactive-btn" style="flex:1;" title="Allow clicking directly on the YouTube player (timeline, gear settings, chapters)">🖱️ Interactive YouTube Player: Off</button>
        </div>

        <div class="ytg-hotkey-hint">
          <b>Hotkeys (Alt+Shift+):</b> <code>P</code> Play · <code>M</code> Mute · <code>N</code>/<code>B</code> Next/Prev · <code>S</code> Layout · <code>H</code> Hide/Show UI
        </div>
      </div>

      <div class="ytg-status">
        <span id="ytg-status-text">Ready</span>
        <span id="ytg-id-badge">#\${state.videoId}</span>
      </div>
    </div>
  \`;
  document.body.appendChild(ctrl);

  // DOM References
  const dragHandle = document.getElementById('ytg-drag-handle');
  const titleLabel = document.getElementById('ytg-title-label');
  const pillPlayBtn = document.getElementById('ytg-pill-play');
  const pillNextBtn = document.getElementById('ytg-pill-next');
  const pillMuteBtn = document.getElementById('ytg-pill-mute');
  const quickLayoutBtn = document.getElementById('ytg-quick-layout-btn');
  const collapseBtn = document.getElementById('ytg-collapse-btn');
  const urlInput = document.getElementById('ytg-url-input');
  const loadBtn = document.getElementById('ytg-load-btn');
  const searchWrap = document.getElementById('ytg-search-wrap');
  const searchHeader = document.getElementById('ytg-search-header');
  const searchClose = document.getElementById('ytg-search-close');
  const searchList = document.getElementById('ytg-search-list');
  const presetSelect = document.getElementById('ytg-preset-select');
  const prevBtn = document.getElementById('ytg-prev-btn');
  const queueToggleBtn = document.getElementById('ytg-queue-toggle');
  const shuffleBtn = document.getElementById('ytg-shuffle-btn');
  const nextBtn = document.getElementById('ytg-next-btn');
  const queueWrap = document.getElementById('ytg-queue-wrap');
  const queueClearBtn = document.getElementById('ytg-queue-clear');
  const queueList = document.getElementById('ytg-queue-list');
  const seekBackBtn = document.getElementById('ytg-seek-back');
  const seekSlider = document.getElementById('ytg-seek-slider');
  const seekFwdBtn = document.getElementById('ytg-seek-fwd');
  const timeLabel = document.getElementById('ytg-time-label');
  const playBtn = document.getElementById('ytg-play-btn');
  const muteBtn = document.getElementById('ytg-mute-btn');
  const loopBtn = document.getElementById('ytg-loop-btn');
  const engineBtn = document.getElementById('ytg-engine-btn');
  const volSlider = document.getElementById('ytg-vol-slider');
  const volVal = document.getElementById('ytg-vol-val');
  const speedGroup = document.getElementById('ytg-speed-group');

  const ambientGroup = document.getElementById('ytg-ambient-group');
  const ccToggleBtn = document.getElementById('ytg-cc-toggle');
  const ccLangSelect = document.getElementById('ytg-cc-lang');
  const ccSizeGroup = document.getElementById('ytg-cc-size-group');
  const fitGroup = document.getElementById('ytg-fit-group');
  const scaleSlider = document.getElementById('ytg-scale-slider');
  const scaleVal = document.getElementById('ytg-scale-val');
  const panxSlider = document.getElementById('ytg-panx-slider');
  const panxVal = document.getElementById('ytg-panx-val');
  const panySlider = document.getElementById('ytg-pany-slider');
  const panyVal = document.getElementById('ytg-pany-val');
  const opaSlider = document.getElementById('ytg-opa-slider');
  const opaVal = document.getElementById('ytg-opa-val');
  const blurSlider = document.getElementById('ytg-blur-slider');
  const blurVal = document.getElementById('ytg-blur-val');
  const resetVideoBtn = document.getElementById('ytg-reset-video-btn');

  const layoutGroup = document.getElementById('ytg-layout-group');
  const splitSideGroup = document.getElementById('ytg-splitside-group');
  const chatwSlider = document.getElementById('ytg-chatw-slider');
  const chatwVal = document.getElementById('ytg-chatw-val');
  const tuckNavBtn = document.getElementById('ytg-tuck-nav-btn');
  const interactiveBtn = document.getElementById('ytg-interactive-btn');
  const statusText = document.getElementById('ytg-status-text');
  const idBadge = document.getElementById('ytg-id-badge');

  // 6. Position & Dragging Logic for Mini-Controller
  const applyCtrlPosition = () => {
    if (state.ctrlPos && typeof state.ctrlPos.x === 'number' && typeof state.ctrlPos.y === 'number') {
      const rect = ctrl.getBoundingClientRect();
      const maxX = Math.max(8, window.innerWidth - (rect.width || 220) - 8);
      const maxY = Math.max(40, window.innerHeight - (rect.height || 48) - 8);
      const clampedX = Math.max(8, Math.min(maxX, state.ctrlPos.x));
      const clampedY = Math.max(40, Math.min(maxY, state.ctrlPos.y));
      ctrl.style.left = clampedX + 'px';
      ctrl.style.top = clampedY + 'px';
      ctrl.style.right = 'auto';
      ctrl.style.bottom = 'auto';
    }
  };
  applyCtrlPosition();

  let ctrlDrag = null;
  dragHandle.addEventListener('pointerdown', (e) => {
    if (e.target.closest('button')) return;
    const r = ctrl.getBoundingClientRect();
    ctrlDrag = {
      startX: e.clientX,
      startY: e.clientY,
      origX: r.left,
      origY: r.top,
      moved: false
    };
    dragHandle.setPointerCapture(e.pointerId);
  });

  dragHandle.addEventListener('pointermove', (e) => {
    if (!ctrlDrag) return;
    const dx = e.clientX - ctrlDrag.startX;
    const dy = e.clientY - ctrlDrag.startY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) ctrlDrag.moved = true;
    const r = ctrl.getBoundingClientRect();
    const nextX = Math.max(6, Math.min(window.innerWidth - r.width - 6, ctrlDrag.origX + dx));
    const nextY = Math.max(6, Math.min(window.innerHeight - r.height - 6, ctrlDrag.origY + dy));
    state.ctrlPos = { x: Math.round(nextX), y: Math.round(nextY) };
    applyCtrlPosition();
  });

  dragHandle.addEventListener('pointerup', (e) => {
    if (!ctrlDrag) return;
    const wasMoved = ctrlDrag.moved;
    ctrlDrag = null;
    try { dragHandle.releasePointerCapture(e.pointerId); } catch (_) {}
    if (wasMoved) {
      saveState();
    } else if (state.collapsed) {
      toggleCollapse();
    }
  });

  // 7. PiP Window Drag & Resize Logic
  let pipDrag = null;
  pipBar.addEventListener('pointerdown', (e) => {
    if (e.target.closest('button')) return;
    pipDrag = {
      startX: e.clientX,
      startY: e.clientY,
      origX: state.pipRect.x,
      origY: state.pipRect.y
    };
    pipBar.setPointerCapture(e.pointerId);
  });
  pipBar.addEventListener('pointermove', (e) => {
    if (!pipDrag) return;
    state.pipRect.x = Math.max(6, Math.min(window.innerWidth - state.pipRect.w - 6, pipDrag.origX + (e.clientX - pipDrag.startX)));
    state.pipRect.y = Math.max(36, Math.min(window.innerHeight - state.pipRect.h - 6, pipDrag.origY + (e.clientY - pipDrag.startY)));
    applyLayoutMode();
  });
  pipBar.addEventListener('pointerup', (e) => {
    if (!pipDrag) return;
    pipDrag = null;
    try { pipBar.releasePointerCapture(e.pointerId); } catch (_) {}
    saveState();
  });

  let pipResizing = null;
  pipResize.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    pipResizing = {
      startX: e.clientX,
      startY: e.clientY,
      origW: state.pipRect.w,
      origH: state.pipRect.h
    };
    pipResize.setPointerCapture(e.pointerId);
  });
  pipResize.addEventListener('pointermove', (e) => {
    if (!pipResizing) return;
    const nextW = Math.max(260, Math.min(window.innerWidth - 40, pipResizing.origW + (e.clientX - pipResizing.startX)));
    const nextH = Math.round(nextW * (9 / 16));
    state.pipRect.w = nextW;
    state.pipRect.h = nextH;
    applyLayoutMode();
  });
  pipResize.addEventListener('pointerup', (e) => {
    if (!pipResizing) return;
    pipResizing = null;
    try { pipResize.releasePointerCapture(e.pointerId); } catch (_) {}
    saveState();
  });

  pipCloseBtn.addEventListener('click', () => {
    state.layoutMode = 'background';
    applyLayoutMode();
    saveState();
  });

  // 8. Split Side-Panel Vertical Divider Drag Logic
  let splitDragging = false;
  splitResizer.addEventListener('pointerdown', (e) => {
    splitDragging = true;
    splitResizer.classList.add('is-dragging');
    splitResizer.setPointerCapture(e.pointerId);
  });
  splitResizer.addEventListener('pointermove', (e) => {
    if (!splitDragging) return;
    const { chatHost } = getShellParts();
    const hostRect = chatHost ? chatHost.getBoundingClientRect() : { left: 0, width: window.innerWidth };
    const availW = Math.max(360, hostRect.width);
    const relX = Math.max(0, Math.min(availW, e.clientX - hostRect.left));
    let chatPct = state.splitSide === 'right'
      ? ((availW - relX) / availW) * 100
      : (relX / availW) * 100;
    chatPct = Math.round(Math.max(28, Math.min(72, chatPct)));
    state.chatWidthPct = chatPct;
    chatwSlider.value = String(chatPct);
    chatwVal.textContent = chatPct + '%';
    applyLayoutMode();
  });
  splitResizer.addEventListener('pointerup', (e) => {
    if (!splitDragging) return;
    splitDragging = false;
    splitResizer.classList.remove('is-dragging');
    try { splitResizer.releasePointerCapture(e.pointerId); } catch (_) {}
    saveState();
  });

  // 9. Helper: Structural Shell Lookup (NEVER relies on getBoundingClientRect().width)
  const getShellParts = () => {
    const inset = document.querySelector('.agy-inset-shell');
    const row = inset?.querySelector(':scope > div.relative.flex');
    const sheet = document.querySelector('.agy-sheet');
    const leftSidebar = row?.children[0] || null;
    const leftDivider = row?.children[1] || null;
    const chatHost = row?.children[2] || sheet?.parentElement || null;
    return { inset, row, leftSidebar, leftDivider, chatHost, sheet };
  };

  // Repair any legacy inline styles left on leftSidebar or chatHost
  (() => {
    const { leftSidebar, leftDivider, chatHost } = getShellParts();
    if (leftSidebar) leftSidebar.style.display = '';
    if (leftDivider) leftDivider.style.display = '';
    if (chatHost) {
      chatHost.classList.remove('ytg-split-chat-pane', 'ytg-sidebar');
      chatHost.style.flexGrow = '1';
      chatHost.style.flexBasis = '0px';
      chatHost.style.width = '';
      chatHost.style.maxWidth = '';
      chatHost.style.marginLeft = '';
      chatHost.style.marginRight = '';
      chatHost.style.borderLeft = '';
      chatHost.style.borderRight = '';
    }
  })();

  // 10. Apply Layout Mode (Background / Split Side-Panel / Floating PiP)
  const applyLayoutMode = () => {
    const { leftSidebar, chatHost, sheet } = getShellParts();

    for (const btn of layoutGroup.querySelectorAll('button[data-layout]')) {
      btn.classList.toggle('is-active', btn.dataset.layout === state.layoutMode);
    }
    for (const btn of splitSideGroup.querySelectorAll('button[data-side]')) {
      btn.classList.toggle('is-active', btn.dataset.side === state.splitSide);
    }
    const navOpen = Boolean(leftSidebar && leftSidebar.getBoundingClientRect().width > 40);
    tuckNavBtn.classList.toggle('is-active', navOpen);
    tuckNavBtn.textContent = navOpen ? '⬅️ Left Sidebar: Open (Click to Toggle)' : '⬅️ Left Sidebar: Closed (Click to Open)';

    const canInteract = state.interactivePlayer || state.layoutMode === 'pip';
    interactiveBtn.classList.toggle('is-active', state.interactivePlayer);
    interactiveBtn.textContent = state.interactivePlayer
      ? '🖱️ Interactive YouTube Player: On'
      : '🖱️ Interactive YouTube Player: Off';

    quickLayoutBtn.textContent = state.layoutMode === 'background' ? '🖼️' : (state.layoutMode === 'split' ? '🌓' : '🪟');

    if (sheet) {
      sheet.classList.remove('ytg-clear-pane', 'ytg-sheet-split-right', 'ytg-sheet-split-left');
      sheet.style.removeProperty('--ytg-video-w');
    }
    splitResizer.style.display = 'none';
    stage.classList.remove('is-split', 'is-pip', 'is-interactive');

    if (state.layoutMode === 'background') {
      stage.style.cssText = 'position:fixed !important;inset:0 !important;width:100vw !important;height:100vh !important;';
      if (state.interactivePlayer) stage.classList.add('is-interactive');
    } else if (state.layoutMode === 'split') {
      stage.classList.add('is-split');
      if (state.interactivePlayer) stage.classList.add('is-interactive');

      const hostRect = chatHost
        ? chatHost.getBoundingClientRect()
        : { left: 0, top: 35, width: window.innerWidth, height: window.innerHeight - 35 };
      const topBarH = Math.max(0, Math.round(hostRect.top)) || 35;
      const availW = Math.max(320, Math.round(hostRect.width));
      const availH = Math.max(240, Math.round(hostRect.height)) || (window.innerHeight - topBarH);
      const chatW = Math.round(availW * (state.chatWidthPct / 100));
      const videoW = Math.max(160, availW - chatW);

      if (sheet) {
        sheet.style.setProperty('--ytg-video-w', videoW + 'px');
        sheet.classList.add(state.splitSide === 'right' ? 'ytg-sheet-split-right' : 'ytg-sheet-split-left');
      }

      const hostLeft = Math.round(hostRect.left);
      const videoLeft = state.splitSide === 'right' ? hostLeft : (hostLeft + chatW);
      stage.style.cssText = \`
        position: fixed !important;
        top: \${topBarH}px !important;
        left: \${videoLeft}px !important;
        width: \${videoW}px !important;
        height: \${availH}px !important;
        right: auto !important;
        bottom: auto !important;
      \`;

      const dividerX = state.splitSide === 'right' ? (hostLeft + videoW - 5) : (hostLeft + chatW - 5);
      splitResizer.style.display = 'block';
      splitResizer.style.left = dividerX + 'px';
    } else if (state.layoutMode === 'pip') {
      stage.classList.add('is-pip', 'is-interactive');
      stage.style.cssText = \`
        position: fixed !important;
        left: \${state.pipRect.x}px !important;
        top: \${state.pipRect.y}px !important;
        width: \${state.pipRect.w}px !important;
        height: \${state.pipRect.h}px !important;
        right: auto !important;
        bottom: auto !important;
      \`;
    }

    if (canInteract && activeEngine === 'embed') {
      syncEmbedViaBridge();
    }
  };

  // 11. Apply Video Framing, Size, Fit, Captions & Visuals
  const applyVisuals = () => {
    const effOpacity = (state.layoutMode === 'split' || state.layoutMode === 'pip') ? 1 : (state.opacity / 100);
    const effBlur = (state.layoutMode === 'split' || state.layoutMode === 'pip') ? 0 : state.blur;
    mediaWrap.style.opacity = effOpacity.toFixed(2);
    mediaWrap.style.filter = effBlur > 0 ? \`blur(\${effBlur}px)\` : 'none';
    mediaWrap.style.transform = \`translate(\${state.panX}%, \${state.panY}%) scale(\${(state.scale / 100).toFixed(2)})\`;

    stage.classList.toggle('fit-cover', state.fitMode === 'cover');
    stage.classList.toggle('fit-contain', state.fitMode === 'contain');
    stage.classList.toggle('fit-stretch', state.fitMode === 'stretch');

    for (const btn of fitGroup.querySelectorAll('button[data-fit]')) {
      btn.classList.toggle('is-active', btn.dataset.fit === state.fitMode);
    }

    scaleVal.textContent = state.scale + '%';
    panxVal.textContent = state.panX + '%';
    panyVal.textContent = state.panY + '%';
    opaVal.textContent = state.opacity + '%';
    blurVal.textContent = state.blur + 'px';

    ccToggleBtn.classList.toggle('is-active', state.ccEnabled);
    ccToggleBtn.textContent = state.ccEnabled ? '💬 CC: On' : '💬 CC: Off';
    ccLangSelect.value = state.ccLang || 'auto';

    for (const btn of ccSizeGroup.querySelectorAll('button[data-ccscale]')) {
      btn.classList.toggle('is-active', Number(btn.dataset.ccscale) === Number(state.ccScale));
    }
    document.documentElement.style.setProperty('--ytg-caption-size', Math.round(18 * (state.ccScale || 1)) + 'px');
    for (const btn of ambientGroup.querySelectorAll('button[data-ambient]')) {
      btn.classList.toggle('is-active', btn.dataset.ambient === (state.ambientMode || 'live'));
    }
  };

  // 11b. YouTube Ambient Light Dynamic Color Engine (Live + Static + Classic Red)
  const CLASSIC_RED = [255, 42, 95];
  let ambCur = [...CLASSIC_RED];
  let ambTarget = [...CLASSIC_RED];
  let ambCanvas = null;

  const rgbToHsl = (r, g, b) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
      else if (max === g) h = ((b - r) / d + 2) / 6;
      else h = ((r - g) / d + 4) / 6;
    }
    return [h, s, l];
  };

  const hslToRgb = (h, s, l) => {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    return [
      Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
      Math.round(hue2rgb(p, q, h) * 255),
      Math.round(hue2rgb(p, q, h - 1 / 3) * 255)
    ];
  };

  // Boost dark/muted video colors into a luminous, crisp UI accent palette
  const normalizeVibrantRgb = (rgb) => {
    if (!rgb || rgb.length < 3) return CLASSIC_RED;
    const [h, s, l] = rgbToHsl(rgb[0], rgb[1], rgb[2]);
    if (s < 0.08) return [130, 175, 255]; // cool cinema silver-blue for pure B&W frames
    const outS = Math.max(0.58, Math.min(0.92, s * 1.35));
    const outL = Math.max(0.54, Math.min(0.64, l < 0.45 ? 0.56 : l));
    return hslToRgb(h, outS, outL);
  };

  const applyAmbientCss = (rgb) => {
    const r = Math.round(rgb[0]), g = Math.round(rgb[1]), b = Math.round(rgb[2]);
    const [h, s] = rgbToHsl(r, g, b);
    const soft = hslToRgb(h, Math.min(0.9, s * 0.85), 0.88);
    const dark = hslToRgb(h, Math.min(0.65, s * 0.7), 0.14);
    const root = document.documentElement;
    root.style.setProperty('--ytg-r', String(r));
    root.style.setProperty('--ytg-g', String(g));
    root.style.setProperty('--ytg-b', String(b));
    root.style.setProperty('--ytg-accent-soft', \`rgb(\${soft[0]}, \${soft[1]}, \${soft[2]})\`);
    root.style.setProperty('--ytg-accent-dark', \`rgba(\${dark[0]}, \${dark[1]}, \${dark[2]}, 0.88)\`);
  };

  const setTargetAmbientRgb = (rawRgb, force = false) => {
    if (state.ambientMode === 'red') {
      ambTarget = [...CLASSIC_RED];
      if (force) { ambCur = [...CLASSIC_RED]; applyAmbientCss(ambCur); }
      return;
    }
    const norm = normalizeVibrantRgb(rawRgb);
    ambTarget = norm;
    if (force) { ambCur = [...norm]; applyAmbientCss(ambCur); }
  };

  const extractRgbFromDrawable = (source) => {
    try {
      if (!ambCanvas) {
        ambCanvas = document.createElement('canvas');
        ambCanvas.width = 16;
        ambCanvas.height = 9;
      }
      const ctx = ambCanvas.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(source, 0, 0, 16, 9);
      const data = ctx.getImageData(0, 0, 16, 9).data;
      let wr = 0, wg = 0, wb = 0, wSum = 0;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2];
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        const sat = max === 0 ? 0 : (max - min) / max;
        const lum = (max + min) / 510;
        if (lum < 0.08 || lum > 0.94) continue;
        const w = (sat * sat * 2.5 + 0.08) * (1 - Math.abs(lum - 0.5) * 1.1);
        wr += r * w; wg += g * w; wb += b * w; wSum += w;
      }
      if (wSum > 0) return [Math.round(wr / wSum), Math.round(wg / wSum), Math.round(wb / wSum)];
    } catch (_) {}
    return null;
  };

  const sampleThumbnailColor = (id) => {
    if (state.ambientMode === 'red') {
      setTargetAmbientRgb(CLASSIC_RED, true);
      return;
    }
    const tryLoad = (src) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const rgb = extractRgbFromDrawable(img);
        if (rgb) setTargetAmbientRgb(rgb);
      };
      img.onerror = () => {
        if (!src.includes('ytimg.com')) {
          tryLoad(\`https://i.ytimg.com/vi/\${encodeURIComponent(id)}/hqdefault.jpg\`);
        }
      };
      img.src = src;
    };
    tryLoad(\`\${BRIDGE}/thumb?id=\${encodeURIComponent(id)}\`);
  };

  if (window.__ytgAmbientTimer) clearInterval(window.__ytgAmbientTimer);
  window.__ytgAmbientTimer = setInterval(() => {
    const dr = ambTarget[0] - ambCur[0];
    const dg = ambTarget[1] - ambCur[1];
    const db = ambTarget[2] - ambCur[2];
    if (Math.abs(dr) + Math.abs(dg) + Math.abs(db) > 0.6) {
      ambCur[0] += dr * 0.14;
      ambCur[1] += dg * 0.14;
      ambCur[2] += db * 0.14;
      applyAmbientCss(ambCur);
    }
  }, 50);

  // 12. WebVTT Captions Loader for Direct yt-dlp Mode
  const updateDirectSubtitles = () => {
    for (const oldTrack of videoEl.querySelectorAll('track')) oldTrack.remove();
    if (!state.ccEnabled || activeEngine !== 'direct') return;
    const track = document.createElement('track');
    track.kind = 'captions';
    track.label = state.ccLang || 'Captions';
    track.srclang = state.ccLang === 'auto' ? 'en' : state.ccLang;
    track.src = \`\${BRIDGE}/subtitles?id=\${encodeURIComponent(state.videoId)}&lang=\${encodeURIComponent(state.ccLang)}&t=\${Date.now()}\`;
    track.default = true;
    videoEl.appendChild(track);
    setTimeout(() => {
      if (videoEl.textTracks && videoEl.textTracks[0]) {
        videoEl.textTracks[0].mode = 'showing';
      }
    }, 300);
  };

  // 13. Bridge Sync & Transport Controls
  const sendIframeCmd = (func, args = []) => {
    if (iframeEl && iframeEl.contentWindow) {
      iframeEl.contentWindow.postMessage(JSON.stringify({ event: 'command', func, args }), '*');
    }
  };

  if (window.__ytgMsgListener) {
    window.removeEventListener('message', window.__ytgMsgListener);
  }
  let lastAutoNextTs = 0;
  window.__ytgMsgListener = (e) => {
    if (!e.data || typeof e.data !== 'string') return;
    try {
      const msg = JSON.parse(e.data);
      if (msg.event === 'infoDelivery' && msg.info) {
        if (typeof msg.info.currentTime === 'number') currentTimeSec = msg.info.currentTime;
        if (typeof msg.info.duration === 'number' && msg.info.duration > 0) currentDuration = msg.info.duration;
        updateSeekUI();
        // Never auto-skip livestreams (duration === 0 or videoData.isLive) or initial buffer states (currentTime < 3)
        const isLiveStream = Boolean(msg.info.videoData?.isLive) || currentDuration <= 5;
        const nearEnd = currentDuration > 5 && currentTimeSec >= Math.max(3, currentDuration - 4);
        if (msg.info.playerState === 0 && !isLiveStream && nearEnd && state.queue.length > 1 && (Date.now() - lastAutoNextTs > 4000)) {
          lastAutoNextTs = Date.now();
          playNextTrack();
        }
      } else if (msg.event === 'onError' && activeEngine === 'embed') {
        statusText.textContent = 'Embed restricted -> Direct yt-dlp';
        loadVideo(state.videoId, 'direct');
      }
    } catch (_) {}
  };
  window.addEventListener('message', window.__ytgMsgListener);

  const syncEmbedViaBridge = async (extra = {}) => {
    try {
      const qs = new URLSearchParams({
        play: state.playing ? '1' : '0',
        muted: state.muted ? '1' : '0',
        vol: String(state.volume),
        loop: state.loop ? '1' : '0',
        rate: String(state.playbackRate || 1),
        cc: state.ccEnabled ? '1' : '0',
        ccLang: state.ccLang || 'auto',
        ccScale: String(state.ccScale || 1),
        interactive: (state.interactivePlayer || state.layoutMode === 'pip') ? '1' : '0',
        ...(extra.seek !== undefined ? { seek: String(extra.seek) } : {}),
        ...(extra.statusOnly ? { statusOnly: '1' } : {})
      });
      const r = await fetch(\`\${BRIDGE}/iframe-sync?\${qs.toString()}\`);
      if (r.ok) {
        const d = await r.json();
        if (d && d.embedBlocked) {
          statusText.textContent = 'Embed restricted -> Direct yt-dlp';
          loadVideo(state.videoId, 'direct');
          return;
        }
        if (d && d.ok) {
          if (typeof d.paused === 'boolean') {
            state.playing = !d.paused;
            playBtn.textContent = state.playing ? '⏸ Pause' : '▶ Play';
            playBtn.classList.toggle('is-active', state.playing);
            pillPlayBtn.textContent = state.playing ? '⏸' : '▶';
          }
          currentTimeSec = d.currentTime || 0;
          currentDuration = d.duration || 0;
          updateSeekUI();
          if (state.ambientMode === 'live' && Array.isArray(d.ambientRgb) && d.ambientRgb.length >= 3) {
            setTargetAmbientRgb(d.ambientRgb);
          }
        }
      }
    } catch (_) {
      if (state.ambientMode === 'live' && state.videoId) {
        sampleThumbnailColor(state.videoId);
      }
    }
  };

  const updateSeekUI = () => {
    if (!isSeeking) {
      const pct = currentDuration > 0 ? Math.min(100, (currentTimeSec / currentDuration) * 100) : 0;
      seekSlider.value = String(pct.toFixed(1));
    }
    timeLabel.textContent = \`\${fmtTime(currentTimeSec)} / \${fmtTime(currentDuration)}\`;
  };

  const applyAudioAndTransport = (extra = {}) => {
    playBtn.textContent = state.playing ? '⏸ Pause' : '▶ Play';
    playBtn.classList.toggle('is-active', state.playing);
    pillPlayBtn.textContent = state.playing ? '⏸' : '▶';

    muteBtn.textContent = state.muted ? '🔇 Muted' : '🔊 Audio';
    muteBtn.classList.toggle('is-active', !state.muted);
    pillMuteBtn.textContent = state.muted ? '🔇' : '🔊';

    loopBtn.classList.toggle('is-active', state.loop);
    engineBtn.textContent = activeEngine === 'direct' ? '⚡ Direct' : '📺 Embed';
    engineBtn.classList.toggle('is-active', activeEngine === 'direct');

    for (const btn of speedGroup.querySelectorAll('button[data-rate]')) {
      btn.classList.toggle('is-active', Number(btn.dataset.rate) === Number(state.playbackRate));
    }

    volVal.textContent = state.volume + '%';
    titleLabel.textContent = state.title || 'Gravitas Prism';
    idBadge.textContent = '#' + state.videoId;

    if (activeEngine === 'direct') {
      videoEl.loop = state.loop;
      videoEl.volume = Math.max(0, Math.min(1, state.volume / 100));
      videoEl.muted = state.muted;
      videoEl.playbackRate = state.playbackRate || 1;
      if (typeof extra.seek === 'number' && Number.isFinite(extra.seek)) {
        videoEl.currentTime = Math.max(0, extra.seek);
      }
      if (state.playing && videoEl.paused && videoEl.src) {
        videoEl.play().catch(() => {});
      } else if (!state.playing && !videoEl.paused) {
        videoEl.pause();
      }
    } else {
      sendIframeCmd('setVolume', [state.volume]);
      sendIframeCmd(state.muted ? 'mute' : 'unMute');
      sendIframeCmd('setPlaybackRate', [state.playbackRate || 1]);
      if (typeof extra.seek === 'number') {
        sendIframeCmd('seekTo', [extra.seek, true]);
      }
      sendIframeCmd(state.playing ? 'playVideo' : 'pauseVideo');
      syncEmbedViaBridge(extra);
    }
  };

  // Poll timeline & live ambient color every 600ms in both Embed and Direct modes
  let pollCount = 0;
  window.__ytgPollTimer = setInterval(() => {
    pollCount++;
    if (activeEngine === 'direct') {
      currentTimeSec = videoEl.currentTime || 0;
      currentDuration = Number.isFinite(videoEl.duration) ? videoEl.duration : 0;
      updateSeekUI();
      if (state.ambientMode === 'live' && videoEl.readyState >= 2 && videoEl.videoWidth > 0) {
        const rgb = extractRgbFromDrawable(videoEl);
        if (rgb) setTargetAmbientRgb(rgb);
      }
    } else if (pollCount % 2 === 0) {
      syncEmbedViaBridge({ statusOnly: true });
    }
  }, 600);

  const renderPresets = () => {
    presetSelect.innerHTML = '';
    for (const item of state.history) {
      const opt = document.createElement('option');
      opt.value = item.id;
      opt.textContent = item.title || ('YouTube (' + item.id + ')');
      if (item.id === state.videoId) opt.selected = true;
      presetSelect.appendChild(opt);
    }
  };

  const fetchVideoTitle = async (id) => {
    try {
      const r = await fetch(\`https://www.youtube.com/oembed?url=\${encodeURIComponent('https://www.youtube.com/watch?v=' + id)}&format=json\`);
      if (r.ok) {
        const d = await r.json();
        if (d && d.title) return d.title;
      }
    } catch (_) {}
    return null;
  };

  const loadVideo = async (id, overrideEngine) => {
    if (!id) return;
    state.videoId = id;
    state.urlInput = 'https://www.youtube.com/watch?v=' + id;
    urlInput.value = state.urlInput;
    activeEngine = overrideEngine || state.engine || 'embed';
    state.playing = true;
    currentTimeSec = 0;
    currentDuration = 0;
    updateSeekUI();

    applyVisuals();
    applyLayoutMode();
    applyAudioAndTransport();
    sampleThumbnailColor(id);
    saveState();

    fetchVideoTitle(id).then((t) => {
      if (t) {
        state.title = t;
        const existing = state.history.find(h => h.id === id);
        if (existing) existing.title = t;
        else state.history.unshift({ id, title: t });
        state.history = state.history.slice(0, 12);
        titleLabel.textContent = t;
        renderPresets();
        saveState();
      }
    });

    if (activeEngine === 'direct') {
      const bridgeUp = await fetch(\`\${BRIDGE}/health\`).then(r => r.ok).catch(() => false);
      if (!bridgeUp) {
        statusText.textContent = 'Bridge offline -> YouTube Embed HD';
        return loadVideo(id, 'embed');
      }
      statusText.textContent = 'Streaming via yt-dlp...';
      iframeEl.style.display = 'none';
      iframeEl.src = 'about:blank';
      videoEl.style.display = 'block';
      videoEl.muted = state.muted;
      videoEl.volume = Math.max(0, Math.min(1, state.volume / 100));
      videoEl.playbackRate = state.playbackRate || 1;
      videoEl.loop = state.loop;
      videoEl.src = \`\${BRIDGE}/stream?id=\${encodeURIComponent(id)}&t=\${Date.now()}\`;
      updateDirectSubtitles();
      try {
        await videoEl.play();
        statusText.textContent = 'Playing (Direct Video)';
      } catch (_) {
        if (!state.muted) {
          state.muted = true;
          videoEl.muted = true;
          applyAudioAndTransport();
          try {
            await videoEl.play();
            statusText.textContent = 'Playing (Muted for autoplay)';
            return;
          } catch (_) {}
        }
        statusText.textContent = 'Live/Stream fallback -> Embed';
        loadVideo(id, 'embed');
      }
    } else {
      statusText.textContent = 'Loading YouTube 1080p/4K...';
      videoEl.pause();
      videoEl.removeAttribute('src');
      videoEl.load();
      videoEl.style.display = 'none';
      iframeEl.style.display = 'block';
      const loopParam = (state.loop && state.queue.length <= 1) ? \`&loop=1&playlist=\${encodeURIComponent(id)}\` : '';
      const ccParam = state.ccEnabled ? '&cc_load_policy=1' : '';
      const ccLangParam = (state.ccLang && state.ccLang !== 'auto') ? \`&cc_lang_pref=\${encodeURIComponent(state.ccLang)}\` : '';
      const muteParam = state.muted ? '&mute=1' : '&mute=0';
      iframeEl.src = \`https://www.youtube.com/embed/\${encodeURIComponent(id)}?autoplay=1\${muteParam}&controls=1\${loopParam}\${ccParam}\${ccLangParam}&enablejsapi=1&iv_load_policy=3&modestbranding=1&rel=0&playsinline=1\`;
      iframeEl.onload = () => {
        statusText.textContent = 'Playing (YouTube HD)';
        try {
          iframeEl.contentWindow?.postMessage(JSON.stringify({ event: 'listening', id: 1, channel: 'widget' }), '*');
          sendIframeCmd('addEventListener', ['onError']);
        } catch (_) {}
        setTimeout(() => {
          try {
            iframeEl.contentWindow?.postMessage(JSON.stringify({ event: 'listening', id: 1, channel: 'widget' }), '*');
          } catch (_) {}
          applyAudioAndTransport();
        }, 650);
      };
    }
  };

  // 13b. Queue, Playlist & In-Controller YouTube Search Engine
  const renderQueue = () => {
    queueToggleBtn.textContent = \`📋 Queue (\${state.queue.length})\`;
    queueList.innerHTML = '';
    if (state.queue.length === 0) {
      queueList.innerHTML = '<div style="font-size:10.5px;color:#8E9BAE;padding:6px;text-align:center;">Queue is empty — search above or paste a playlist link.</div>';
      return;
    }
    state.queue.forEach((item, idx) => {
      const row = document.createElement('div');
      row.className = 'ytg-list-item' + (idx === state.queueIndex ? ' is-playing' : '');
      row.innerHTML = \`
        <img class="ytg-list-thumb" src="\${BRIDGE}/thumb?id=\${encodeURIComponent(item.id)}" alt="" />
        <div class="ytg-list-meta">
          <span class="ytg-list-title">\${idx + 1}. \${(item.title || item.id).replace(/</g, '&lt;')}</span>
          <span class="ytg-list-sub">\${(item.author || item.id).replace(/</g, '&lt;')}</span>
        </div>
        <button class="ytg-icon-btn" style="padding:2px 5px;font-size:10px;" title="Remove from queue">✕</button>
      \`;
      row.addEventListener('click', (e) => {
        if (e.target.closest('button')) {
          state.queue.splice(idx, 1);
          if (state.queueIndex >= state.queue.length) state.queueIndex = state.queue.length - 1;
          renderQueue();
          saveState();
          return;
        }
        state.queueIndex = idx;
        state.title = item.title || state.title;
        renderQueue();
        loadVideo(item.id);
      });
      queueList.appendChild(row);
    });
  };

  const addToQueue = (item) => {
    if (!item || !item.id) return;
    state.queue.push({ id: item.id, title: item.title || ('YouTube (' + item.id + ')'), author: item.author || '' });
    renderQueue();
    saveState();
    showToast(\`+ Queued: \${(item.title || item.id).slice(0, 38)}\`);
  };

  const playNextTrack = () => {
    if (state.queue.length > 0) {
      state.queueIndex = (state.queueIndex + 1) % state.queue.length;
      const item = state.queue[state.queueIndex];
      state.title = item.title || state.title;
      renderQueue();
      showToast(\`⏭ Next: \${(item.title || item.id).slice(0, 40)}\`);
      loadVideo(item.id);
    } else if (state.history.length > 1) {
      const curIdx = state.history.findIndex(h => h.id === state.videoId);
      const nextItem = state.history[(curIdx + 1) % state.history.length];
      showToast(\`⏭ Next: \${(nextItem.title || nextItem.id).slice(0, 40)}\`);
      loadVideo(nextItem.id);
    }
  };

  const playPrevTrack = () => {
    if (state.queue.length > 0) {
      state.queueIndex = (state.queueIndex - 1 + state.queue.length) % state.queue.length;
      const item = state.queue[state.queueIndex];
      state.title = item.title || state.title;
      renderQueue();
      showToast(\`⏮ Prev: \${(item.title || item.id).slice(0, 40)}\`);
      loadVideo(item.id);
    } else if (state.history.length > 1) {
      const curIdx = state.history.findIndex(h => h.id === state.videoId);
      const prevItem = state.history[(curIdx - 1 + state.history.length) % state.history.length];
      showToast(\`⏮ Prev: \${(prevItem.title || prevItem.id).slice(0, 40)}\`);
      loadVideo(prevItem.id);
    }
  };

  const runYouTubeSearch = async (query) => {
    statusText.textContent = '🔍 Searching YouTube...';
    searchWrap.style.display = 'flex';
    searchHeader.textContent = \`🔍 Searching "\${query.slice(0, 28)}"...\`;
    searchList.innerHTML = '<div style="font-size:10.5px;color:#8E9BAE;padding:8px;text-align:center;">Searching YouTube...</div>';
    try {
      const r = await fetch(\`\${BRIDGE}/search?q=\${encodeURIComponent(query)}\`);
      const d = await r.json();
      const items = d?.items || [];
      searchList.innerHTML = '';
      if (items.length === 0) {
        searchHeader.textContent = '🔍 No results found';
        searchList.innerHTML = '<div style="font-size:10.5px;color:#8E9BAE;padding:8px;text-align:center;">No matches found (ensure bridge is active).</div>';
        statusText.textContent = 'No search results';
        return;
      }
      searchHeader.textContent = \`🔍 Top \${items.length} for "\${query.slice(0, 24)}"\`;
      statusText.textContent = \`Found \${items.length} results\`;
      for (const item of items) {
        const row = document.createElement('div');
        row.className = 'ytg-list-item';
        row.innerHTML = \`
          <img class="ytg-list-thumb" src="\${BRIDGE}/thumb?id=\${encodeURIComponent(item.id)}" alt="" />
          <div class="ytg-list-meta">
            <span class="ytg-list-title">\${(item.title || item.id).replace(/</g, '&lt;')}</span>
            <span class="ytg-list-sub">\${(item.author || '').replace(/</g, '&lt;')}\${item.duration ? ' · ' + item.duration : ''}</span>
          </div>
          <button class="ytg-icon-btn" data-act="play" style="padding:2px 6px;font-size:10px;" title="Play Now">▶</button>
          <button class="ytg-icon-btn" data-act="queue" style="padding:2px 6px;font-size:10px;" title="Add to Queue">+</button>
        \`;
        row.addEventListener('click', (e) => {
          const btn = e.target.closest('button');
          if (btn && btn.dataset.act === 'queue') {
            addToQueue(item);
            return;
          }
          state.title = item.title;
          if (!state.history.some(h => h.id === item.id)) {
            state.history.unshift({ id: item.id, title: item.title });
          }
          renderPresets();
          searchWrap.style.display = 'none';
          loadVideo(item.id);
        });
        searchList.appendChild(row);
      }
    } catch (_) {
      searchHeader.textContent = '⚠️ Search unavailable';
      searchList.innerHTML = '<div style="font-size:10.5px;color:#8E9BAE;padding:8px;text-align:center;">Run Apply_Youtube_Gravity.bat to start the local search bridge.</div>';
      statusText.textContent = 'Search bridge offline';
    }
  };

  const loadPlaylist = async (listId, initialVideoId) => {
    statusText.textContent = '📋 Loading playlist...';
    try {
      const r = await fetch(\`\${BRIDGE}/playlist?list=\${encodeURIComponent(listId)}\`);
      const d = await r.json();
      const items = d?.items || [];
      if (items.length > 0) {
        state.queue = items;
        const startIdx = initialVideoId ? Math.max(0, items.findIndex(x => x.id === initialVideoId)) : 0;
        state.queueIndex = startIdx;
        state.loop = false;
        renderQueue();
        queueWrap.style.display = 'flex';
        showToast(\`📋 Loaded \${items.length} tracks into Queue\`);
        loadVideo(items[startIdx].id);
        return true;
      }
    } catch (_) {}
    if (initialVideoId) loadVideo(initialVideoId);
    return false;
  };

  videoEl.addEventListener('ended', () => {
    if (activeEngine !== 'direct') return;
    // Ignore 0-second failed/aborted streams or livestreams so they never trigger a skip loop
    if (!Number.isFinite(videoEl.duration) || videoEl.duration <= 5 || videoEl.currentTime < 3) return;
    if (state.queue.length > 1 && !state.loop) {
      if (Date.now() - lastAutoNextTs > 4000) {
        lastAutoNextTs = Date.now();
        playNextTrack();
      }
    } else if (state.loop) {
      videoEl.currentTime = 0;
      videoEl.play().catch(() => loadVideo(state.videoId, 'direct'));
    } else if (state.queue.length > 1 && (Date.now() - lastAutoNextTs > 4000)) {
      lastAutoNextTs = Date.now();
      playNextTrack();
    }
  });

  videoEl.addEventListener('error', () => {
    if (activeEngine === 'direct' && state.videoId) {
      statusText.textContent = 'Direct stream error -> Embed HD';
      loadVideo(state.videoId, 'embed');
    }
  });

  // 14. Tabs & Control Event Listeners
  const setActiveTab = (tabName) => {
    state.activeTab = tabName;
    for (const btn of ctrl.querySelectorAll('.ytg-tab-btn')) {
      btn.classList.toggle('is-active', btn.dataset.tab === tabName);
    }
    for (const pane of ctrl.querySelectorAll('.ytg-tab-pane')) {
      pane.classList.toggle('is-active', pane.dataset.pane === tabName);
    }
    saveState();
  };
  setActiveTab(state.activeTab || 'media');

  for (const btn of ctrl.querySelectorAll('.ytg-tab-btn')) {
    btn.addEventListener('click', () => setActiveTab(btn.dataset.tab));
  }

  const toggleCollapse = () => {
    state.collapsed = !state.collapsed;
    ctrl.classList.toggle('is-collapsed', state.collapsed);
    collapseBtn.textContent = state.collapsed ? '▲' : '—';
    applyCtrlPosition();
    saveState();
  };

  collapseBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleCollapse();
  });

  const cycleLayoutMode = () => {
    const order = ['background', 'split', 'pip'];
    const idx = order.indexOf(state.layoutMode);
    state.layoutMode = order[(idx + 1) % order.length];
    applyVisuals();
    applyLayoutMode();
    saveState();
    showToast(\`📐 Layout: \${state.layoutMode === 'background' ? 'Background' : (state.layoutMode === 'split' ? 'Split Side-Panel' : 'Floating PiP')}\`);
  };

  quickLayoutBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    cycleLayoutMode();
  });

  pillPlayBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    state.playing = !state.playing;
    applyAudioAndTransport();
    saveState();
  });
  pillMuteBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    state.muted = !state.muted;
    applyAudioAndTransport();
    saveState();
  });
  pillNextBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    playNextTrack();
  });

  searchClose.addEventListener('click', () => { searchWrap.style.display = 'none'; });
  queueToggleBtn.addEventListener('click', () => {
    const isOpen = queueWrap.style.display === 'flex';
    queueWrap.style.display = isOpen ? 'none' : 'flex';
    queueToggleBtn.classList.toggle('is-active', !isOpen);
    renderQueue();
  });
  queueClearBtn.addEventListener('click', () => {
    state.queue = [];
    state.queueIndex = -1;
    renderQueue();
    saveState();
  });
  prevBtn.addEventListener('click', playPrevTrack);
  nextBtn.addEventListener('click', playNextTrack);
  shuffleBtn.addEventListener('click', () => {
    if (state.queue.length < 2) return;
    for (let i = state.queue.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [state.queue[i], state.queue[j]] = [state.queue[j], state.queue[i]];
    }
    state.queueIndex = Math.max(0, state.queue.findIndex(x => x.id === state.videoId));
    renderQueue();
    saveState();
    showToast('🔀 Queue Shuffled');
  });

  // Global Alt+Shift Keyboard Shortcuts
  if (window.__ytgKeyListener) {
    window.removeEventListener('keydown', window.__ytgKeyListener, true);
  }
  window.__ytgKeyListener = (e) => {
    if (!e.altKey || !e.shiftKey || e.ctrlKey || e.metaKey) return;
    const k = (e.key || '').toLowerCase();
    if (k === 'p') {
      e.preventDefault();
      state.playing = !state.playing;
      applyAudioAndTransport();
      saveState();
      showToast(state.playing ? '▶ Playing' : '⏸ Paused');
    } else if (k === 'm') {
      e.preventDefault();
      state.muted = !state.muted;
      applyAudioAndTransport();
      saveState();
      showToast(state.muted ? '🔇 Muted' : '🔊 Unmuted');
    } else if (k === 'n') {
      e.preventDefault();
      playNextTrack();
    } else if (k === 'b') {
      e.preventDefault();
      playPrevTrack();
    } else if (k === 's') {
      e.preventDefault();
      cycleLayoutMode();
    } else if (k === 'h') {
      e.preventDefault();
      state.hidden = !state.hidden;
      ctrl.classList.toggle('is-hidden', state.hidden);
      saveState();
      showToast(state.hidden ? 'Controller hidden (Alt+Shift+H to show)' : 'Controller shown');
    }
  };
  window.addEventListener('keydown', window.__ytgKeyListener, true);

  const handleUrlSubmit = () => {
    const raw = (urlInput.value || '').trim();
    if (!raw) return;
    const listId = extractPlaylistId(raw);
    const id = extractYouTubeId(raw);
    if (listId) {
      loadPlaylist(listId, id);
      return;
    }
    if (id) {
      searchWrap.style.display = 'none';
      if (!state.history.some(h => h.id === id)) {
        state.history.unshift({ id, title: 'YouTube (' + id + ')' });
      }
      renderPresets();
      loadVideo(id);
      return;
    }
    runYouTubeSearch(raw);
  };

  loadBtn.addEventListener('click', handleUrlSubmit);
  urlInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleUrlSubmit(); });
  urlInput.addEventListener('paste', () => setTimeout(handleUrlSubmit, 60));
  presetSelect.addEventListener('change', () => { if (presetSelect.value) loadVideo(presetSelect.value); });

  // Seek events
  seekSlider.addEventListener('pointerdown', () => { isSeeking = true; });
  seekSlider.addEventListener('input', () => {
    if (currentDuration > 0) {
      const targetSec = (Number(seekSlider.value) / 100) * currentDuration;
      timeLabel.textContent = \`\${fmtTime(targetSec)} / \${fmtTime(currentDuration)}\`;
    }
  });
  seekSlider.addEventListener('change', () => {
    isSeeking = false;
    if (currentDuration > 0) {
      const targetSec = (Number(seekSlider.value) / 100) * currentDuration;
      currentTimeSec = targetSec;
      applyAudioAndTransport({ seek: targetSec });
    }
  });
  seekBackBtn.addEventListener('click', () => {
    const targetSec = Math.max(0, currentTimeSec - 10);
    currentTimeSec = targetSec;
    applyAudioAndTransport({ seek: targetSec });
  });
  seekFwdBtn.addEventListener('click', () => {
    const targetSec = currentDuration > 0 ? Math.min(currentDuration - 1, currentTimeSec + 10) : (currentTimeSec + 10);
    currentTimeSec = targetSec;
    applyAudioAndTransport({ seek: targetSec });
  });

  playBtn.addEventListener('click', () => {
    state.playing = !state.playing;
    applyAudioAndTransport();
    saveState();
  });

  muteBtn.addEventListener('click', () => {
    state.muted = !state.muted;
    applyAudioAndTransport();
    saveState();
  });

  loopBtn.addEventListener('click', () => {
    state.loop = !state.loop;
    applyAudioAndTransport();
    saveState();
  });

  engineBtn.addEventListener('click', () => {
    state.engine = activeEngine === 'direct' ? 'embed' : 'direct';
    saveState();
    loadVideo(state.videoId, state.engine);
  });

  volSlider.addEventListener('input', () => {
    state.volume = Number(volSlider.value);
    if (state.volume > 0 && state.muted) state.muted = false;
    applyAudioAndTransport();
    saveState();
  });

  for (const btn of speedGroup.querySelectorAll('button[data-rate]')) {
    btn.addEventListener('click', () => {
      state.playbackRate = Number(btn.dataset.rate);
      applyAudioAndTransport();
      saveState();
    });
  }

  // Video & CC tab listeners
  for (const btn of ambientGroup.querySelectorAll('button[data-ambient]')) {
    btn.addEventListener('click', () => {
      state.ambientMode = btn.dataset.ambient;
      applyVisuals();
      if (state.ambientMode === 'red') {
        setTargetAmbientRgb(CLASSIC_RED);
      } else if (state.ambientMode === 'static') {
        sampleThumbnailColor(state.videoId);
      } else {
        sampleThumbnailColor(state.videoId);
        if (activeEngine === 'embed') syncEmbedViaBridge({ statusOnly: true });
      }
      saveState();
    });
  }

  ccToggleBtn.addEventListener('click', () => {
    state.ccEnabled = !state.ccEnabled;
    applyVisuals();
    if (activeEngine === 'direct') updateDirectSubtitles();
    else syncEmbedViaBridge();
    saveState();
  });

  ccLangSelect.addEventListener('change', () => {
    state.ccLang = ccLangSelect.value;
    state.ccEnabled = true;
    applyVisuals();
    if (activeEngine === 'direct') updateDirectSubtitles();
    else syncEmbedViaBridge();
    saveState();
  });

  for (const btn of ccSizeGroup.querySelectorAll('button[data-ccscale]')) {
    btn.addEventListener('click', () => {
      state.ccScale = Number(btn.dataset.ccscale);
      applyVisuals();
      if (activeEngine === 'embed') syncEmbedViaBridge();
      saveState();
    });
  }

  for (const btn of fitGroup.querySelectorAll('button[data-fit]')) {
    btn.addEventListener('click', () => {
      state.fitMode = btn.dataset.fit;
      applyVisuals();
      saveState();
    });
  }

  scaleSlider.addEventListener('input', () => { state.scale = Number(scaleSlider.value); applyVisuals(); saveState(); });
  panxSlider.addEventListener('input', () => { state.panX = Number(panxSlider.value); applyVisuals(); saveState(); });
  panySlider.addEventListener('input', () => { state.panY = Number(panySlider.value); applyVisuals(); saveState(); });
  opaSlider.addEventListener('input', () => { state.opacity = Number(opaSlider.value); applyVisuals(); saveState(); });
  blurSlider.addEventListener('input', () => { state.blur = Number(blurSlider.value); applyVisuals(); saveState(); });

  resetVideoBtn.addEventListener('click', () => {
    state.fitMode = 'cover';
    state.scale = 100;
    state.panX = 0;
    state.panY = 0;
    state.opacity = 72;
    state.blur = 1;
    scaleSlider.value = '100';
    panxSlider.value = '0';
    panySlider.value = '0';
    opaSlider.value = '72';
    blurSlider.value = '1';
    applyVisuals();
    saveState();
  });

  // Layout tab listeners
  for (const btn of layoutGroup.querySelectorAll('button[data-layout]')) {
    btn.addEventListener('click', () => {
      state.layoutMode = btn.dataset.layout;
      applyVisuals();
      applyLayoutMode();
      saveState();
    });
  }

  for (const btn of splitSideGroup.querySelectorAll('button[data-side]')) {
    btn.addEventListener('click', () => {
      state.splitSide = btn.dataset.side;
      applyLayoutMode();
      saveState();
    });
  }

  chatwSlider.addEventListener('input', () => {
    state.chatWidthPct = Number(chatwSlider.value);
    chatwVal.textContent = state.chatWidthPct + '%';
    if (state.layoutMode !== 'split') state.layoutMode = 'split';
    applyVisuals();
    applyLayoutMode();
    saveState();
  });

  tuckNavBtn.addEventListener('click', () => {
    const nativeBtn = document.querySelector('button[aria-label="Toggle Sidebar"]');
    if (nativeBtn) nativeBtn.click();
    setTimeout(() => applyLayoutMode(), 60);
    setTimeout(() => applyLayoutMode(), 520);
  });

  interactiveBtn.addEventListener('click', () => {
    state.interactivePlayer = !state.interactivePlayer;
    applyLayoutMode();
    syncEmbedViaBridge();
    saveState();
  });

  window.addEventListener('resize', () => {
    applyCtrlPosition();
    applyLayoutMode();
  });

  if (window.__ytgResizeObserver) {
    try { window.__ytgResizeObserver.disconnect(); } catch (_) {}
  }
  const ro = new ResizeObserver(() => {
    if (state.layoutMode === 'split') applyLayoutMode();
  });
  const { leftSidebar: initSidebar, chatHost: initHost } = getShellParts();
  if (initSidebar) ro.observe(initSidebar);
  if (initHost) ro.observe(initHost);
  window.__ytgResizeObserver = ro;

  // 15. Keep Antigravity Layout Panes Transparent
  const hasSolidBg = (bg) => {
    if (!bg || bg === 'transparent' || bg === 'rgba(0, 0, 0, 0)') return false;
    const t = bg.trim();
    return !(t.endsWith('/ 0)') || t.endsWith(', 0)'));
  };

  const clearOpaqueWrappers = () => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const { leftSidebar: sidebarEl, sheet } = getShellParts();

    for (const prev of document.querySelectorAll('.ytg-sidebar')) {
      if (prev !== sidebarEl) prev.classList.remove('ytg-sidebar');
    }
    if (sidebarEl) {
      sidebarEl.classList.remove('ytg-clear-pane');
      sidebarEl.classList.add('ytg-sidebar');
      if (sidebarEl.firstElementChild) {
        sidebarEl.firstElementChild.classList.remove('ytg-clear-pane');
      }
    }

    // 1. Elevate top menu bar (Antigravity / Workspace / View / Window) above blurred sidebar stacking context
    for (const el of document.querySelectorAll('#root > div, #root header, #root div')) {
      const r = el.getBoundingClientRect();
      if (r.top <= 4 && r.height >= 24 && r.height <= 46 && r.width >= vw * 0.85) {
        el.classList.add('ytg-menubar');
        break;
      }
    }

    // 2. Tag Prompt Input Box container so it and its popups stay properly layered
    for (const prev of document.querySelectorAll('.ytg-input-box')) {
      prev.classList.remove('ytg-input-box');
    }
    for (const inp of document.querySelectorAll('textarea, [contenteditable="true"]')) {
      const composer = inp.closest('.surface-composer') || inp.closest('.surface-composer-card');
      if (composer) {
        composer.classList.remove('ytg-clear-pane', 'ytg-chat-card');
        composer.classList.add('ytg-input-box');
        for (const child of composer.querySelectorAll('.ytg-clear-pane')) {
          child.classList.remove('ytg-clear-pane');
        }
      }
    }

    // Strip any accidental ytg-clear-pane inside slash-command autocomplete (.agy-fastpick), popovers (.surface-opaque), or tooltips (.compact-tooltip)
    for (const pop of document.querySelectorAll('.agy-fastpick, .quick-input-widget, .compact-tooltip, .surface-opaque:not(button), .hidden-if-empty')) {
      pop.classList.remove('ytg-clear-pane');
      for (const child of pop.querySelectorAll('.ytg-clear-pane')) {
        child.classList.remove('ytg-clear-pane');
      }
    }

    const isOverlay = (node) => Boolean(
      node.closest('#ytg-controller, #ytg-stage, .agy-user-bubble-frame, .agy-user-bubble, .agy-fastpick, .quick-input-widget, .compact-tooltip, .surface-opaque, .hidden-if-empty, .surface-composer, .surface-composer-card, .ytg-menu-box, .ytg-menu, [role="dialog"], [aria-modal="true"], [role="menu"], [role="listbox"], [role="tooltip"], [data-radix-popper-content-wrapper]')
    );

    for (const el of document.querySelectorAll('#root div, #root main, #root section, #root header, #root footer, body > div div')) {
      if (el === sidebarEl || el === sheet || isOverlay(el)) continue;
      if (el.closest('pre, code, .ytg-chat-card, .ytg-input-box')) continue;
      const cs = getComputedStyle(el);
      const hasGrad = cs.backgroundImage && cs.backgroundImage.includes('gradient');
      const solid = hasSolidBg(cs.backgroundColor);
      if (!hasGrad && !solid) continue;
      const r = el.getBoundingClientRect();
      if (r.width < 20 || r.height < 16) continue;

      if (hasGrad && !el.matches('button, [role="button"]') && ((r.left >= 140 && r.width > vw * 0.3 && r.height <= 180) || (r.top <= 64 && r.height <= 64 && r.left >= 140))) {
        el.classList.add('ytg-clear-pane');
        continue;
      }

      // Inside Left Sidebar: keep outer & peek containers opaque/frosted, only clear inner virtualized row backgrounds
      if (sidebarEl && sidebarEl.contains(el)) {
        if (el === sidebarEl.firstElementChild || el.hasAttribute('data-peek-surface')) {
          el.classList.remove('ytg-clear-pane', 'ytg-menu-box', 'ytg-menu');
          continue;
        }
        el.classList.remove('ytg-menu-box', 'ytg-menu');
        if (!el.matches('button, [role="button"], a, :hover') && (r.height > 52 || cs.position === 'sticky' || el.classList.contains('bg-sidebar'))) {
          el.classList.add('ytg-clear-pane');
        }
        continue;
      }

      // 3. Floating popups outside sidebar: Top-bar dropdowns (Workspace/View/Window), slash-command (/gri) autocomplete, @ mentions & tooltips
      if ((cs.position === 'fixed' || cs.position === 'absolute') && solid && r.height < vh * 0.68 && r.width < vw * 0.85) {
        const isTopLeftRightToolbar = r.top >= 34 && r.top <= 45 && r.height <= 42 && (r.left <= 12 || r.right >= vw - 12);
        if (!isTopLeftRightToolbar) {
          el.classList.remove('ytg-clear-pane', 'ytg-header');
          el.classList.add('ytg-menu-box', 'ytg-menu');
          for (const child of el.querySelectorAll('.ytg-clear-pane')) {
            child.classList.remove('ytg-clear-pane');
          }
          continue;
        }
      }

      if (r.top <= 64 && r.height <= 165 && cs.position !== 'fixed' && cs.position !== 'absolute') {
        el.classList.add(r.width > vw * 0.45 ? 'ytg-header' : 'ytg-clear-pane');
        continue;
      }

      if (r.width > vw * 0.25 && r.height > vh * 0.45) {
        el.classList.add('ytg-clear-pane');
      }
    }
  };

  clearOpaqueWrappers();
  let rafId = 0;
  const obs = new MutationObserver(() => {
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      rafId = 0;
      clearOpaqueWrappers();
    });
  });
  obs.observe(document.body, { childList: true, subtree: true });
  window.__ytgObserver = obs;

  renderPresets();
  renderQueue();
  loadVideo(state.videoId);
  return 'Gravitas Prism (Search + Queue + Smart Pill + Hotkeys + Live Ambient) Injected!';
})()`;

const REMOVE_JS = `(() => {
  for (const id of ['ytg-theme-style', 'ytg-stage', 'ytg-controller', 'ytg-split-resizer', 'ytg-toast']) {
    const el = document.getElementById(id);
    if (el) el.remove();
  }
  if (window.__ytgKeyListener) {
    window.removeEventListener('keydown', window.__ytgKeyListener, true);
    window.__ytgKeyListener = null;
  }
  if (window.__ytgObserver) {
    try { window.__ytgObserver.disconnect(); } catch (_) {}
    window.__ytgObserver = null;
  }
  if (window.__ytgResizeObserver) {
    try { window.__ytgResizeObserver.disconnect(); } catch (_) {}
    window.__ytgResizeObserver = null;
  }
  if (window.__ytgPollTimer) {
    clearInterval(window.__ytgPollTimer);
    window.__ytgPollTimer = null;
  }
  if (window.__ytgAmbientTimer) {
    clearInterval(window.__ytgAmbientTimer);
    window.__ytgAmbientTimer = null;
  }
  for (const prop of ['--ytg-r', '--ytg-g', '--ytg-b', '--ytg-accent-soft', '--ytg-accent-dark']) {
    document.documentElement.style.removeProperty(prop);
  }
  for (const el of document.querySelectorAll('.ytg-clear-pane, .ytg-sidebar, .ytg-header, .ytg-chat-card, .ytg-input-box, .ytg-split-chat-pane, .ytg-sheet-split-right, .ytg-sheet-split-left')) {
    el.classList.remove('ytg-clear-pane', 'ytg-sidebar', 'ytg-header', 'ytg-chat-card', 'ytg-input-box', 'ytg-split-chat-pane', 'ytg-sheet-split-right', 'ytg-sheet-split-left');
    el.style.removeProperty('--ytg-video-w');
  }
  return 'Gravitas Prism Theme Removed!';
})()`;

// ============================================================================
// 4. Main Entry Point
// ============================================================================
if (!isBridge) {
  await ensureBridge(!isOff);

  const port = findDevToolsPort();
  const listRes = await fetch(`http://127.0.0.1:${port}/json/list`).catch(() => null);
  if (!listRes || !listRes.ok) {
    console.error(`[!] Could not connect to Antigravity DevTools on port ${port}.`);
    process.exit(1);
  }

  const allPages = await listRes.json();
  const pages = allPages.filter(p =>
    p.type === 'page' &&
    p.webSocketDebuggerUrl &&
    typeof p.url === 'string' &&
    !p.url.startsWith('data:') &&
    !p.url.startsWith('devtools:') &&
    !p.url.startsWith('about:blank')
  );

  if (pages.length === 0) {
    console.error('[!] Antigravity main window is not ready yet.');
    process.exit(1);
  }

  let applied = 0;
  for (const page of pages) {
    try {
      const out = await evalCdp(page.webSocketDebuggerUrl, isOff ? REMOVE_JS : INJECT_JS);
      console.log(`[+] ${page.title || page.url}: ${out}`);
      applied++;
    } catch (err) {
      console.warn(`[!] Skipped ${page.title || page.url}: ${err.message}`);
    }
  }
  if (applied === 0) process.exit(1);
}
