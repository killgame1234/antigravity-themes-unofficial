import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const assetsDir = path.join(__dirname, 'assets');
const personaSrc = path.join(assetsDir, 'castorice_persona.md');
const personaDstDir = path.join(os.homedir(), '.gemini', 'config', 'rules');
const personaDst = path.join(personaDstDir, 'castorice-persona.md');
const isOff = process.argv.includes('--off');

function setPersonaRule(enabled) {
  if (enabled) {
    if (fs.existsSync(personaSrc)) {
      fs.mkdirSync(personaDstDir, { recursive: true });
      fs.copyFileSync(personaSrc, personaDst);
      console.log(`[+] Castorice personality enabled: ${personaDst}`);
    }
  } else if (fs.existsSync(personaDst)) {
    fs.unlinkSync(personaDst);
    console.log(`[+] Castorice personality disabled: removed ${personaDst}`);
  }
}

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

async function evalCdp(wsUrl, expression) {
  const ws = new WebSocket(wsUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  try {
    return await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('CDP timeout')), 15000);
      ws.onclose = (ev) => {
        clearTimeout(timer);
        reject(new Error(`CDP socket closed (${ev.code} ${ev.reason || 'no reason'})`));
      };
      ws.onerror = () => {
        clearTimeout(timer);
        reject(new Error('CDP socket error'));
      };
      ws.onmessage = (ev) => {
        const msg = JSON.parse(ev.data);
        if (msg.id === 1) {
          clearTimeout(timer);
          ws.onclose = null;
          ws.onerror = null;
          if (msg.error) reject(new Error(JSON.stringify(msg.error)));
          else if (msg.result?.exceptionDetails) reject(new Error(JSON.stringify(msg.result.exceptionDetails)));
          else resolve(msg.result?.result?.value);
        }
      };
      ws.send(JSON.stringify({
        id: 1,
        method: 'Runtime.evaluate',
        params: { expression, returnByValue: true, awaitPromise: true }
      }));
    });
  } finally {
    ws.close();
  }
}

const layersDir = path.join(assetsDir, 'layers');
const fontsDir = path.join(assetsDir, 'fonts');
const stickersDir = path.join(assetsDir, 'stickers');
const threeBundle = fs.readFileSync(path.join(assetsDir, 'three.bundle.js'), 'utf8');
const sceneScript = fs.readFileSync(path.join(assetsDir, 'castorice_scene.js'), 'utf8');
const b64File = (dir, file, mime) => `data:${mime};base64,${fs.readFileSync(path.join(dir, file)).toString('base64')}`;

const fontCss = `
@font-face {
  font-family: 'HSR-DIN';
  font-style: normal;
  font-weight: 400 500;
  font-display: swap;
  src: url('${b64File(fontsDir, 'HSR-Regular.woff2', 'font/woff2')}') format('woff2');
}
@font-face {
  font-family: 'HSR-DIN';
  font-style: normal;
  font-weight: 400 500;
  font-display: swap;
  unicode-range: U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+1EA0-1EF9;
  src: url('${b64File(fontsDir, 'HSR-Regular-vi.woff2', 'font/woff2')}') format('woff2');
}
@font-face {
  font-family: 'HSR-DIN';
  font-style: normal;
  font-weight: 600 800;
  font-display: swap;
  src: url('${b64File(fontsDir, 'HSR-Bold.woff2', 'font/woff2')}') format('woff2');
}
@font-face {
  font-family: 'HSR-DIN';
  font-style: normal;
  font-weight: 600 800;
  font-display: swap;
  unicode-range: U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+1EA0-1EF9;
  src: url('${b64File(fontsDir, 'HSR-Bold-vi.woff2', 'font/woff2')}') format('woff2');
}
`;
const themeCss = fontCss + '\n' + fs.readFileSync(path.join(assetsDir, 'theme.css'), 'utf8');

const layerUrls = {
  ambient: b64File(layersDir, 'layer_ambient.jpg', 'image/jpeg'),
  depthMap: b64File(layersDir, 'layer_depth_5zone.jpg', 'image/jpeg'),
  butterflyWing: b64File(layersDir, 'butterfly_wing.webp', 'image/webp'),
  heroLogo: b64File(layersDir, 'hsr_castorice_logo.webp', 'image/webp'),
};

const rawB64 = (dir, file) => fs.readFileSync(path.join(dir, file)).toString('base64');
const videoB64 = {
  master: rawB64(layersDir, 'vid_master.webm'),
  intro: fs.existsSync(path.join(layersDir, 'vid_intro.mp4')) ? rawB64(layersDir, 'vid_intro.mp4') : '',
};
const skipIntro = process.argv.includes('--no-intro');

const stickerUrls = {
  create: b64File(stickersDir, 'create.webp', 'image/webp'),
  butterfly: b64File(stickersDir, 'butterfly.webp', 'image/webp'),
  shy: b64File(stickersDir, 'shy.webp', 'image/webp'),
  speechless: b64File(stickersDir, 'speechless.webp', 'image/webp'),
  sad: b64File(stickersDir, 'sad.webp', 'image/webp'),
};

const injectJs = `(() => {
  const prevStyle = document.getElementById('castorice-3d-theme');
  if (prevStyle) prevStyle.remove();
  for (const el of document.querySelectorAll('.castorice-hsr-active-row, .castorice-hsr-warp-btn, .castorice-hsr-modal, .castorice-hsr-solid-deco, .castorice-hsr-files-bar, .castorice-hsr-badge-btn, .castorice-hsr-blur-deco, .castorice-hsr-chat-card')) {
    el.classList.remove('castorice-hsr-active-row', 'castorice-hsr-warp-btn', 'castorice-hsr-modal', 'castorice-hsr-solid-deco', 'castorice-hsr-files-bar', 'castorice-hsr-badge-btn', 'castorice-hsr-blur-deco', 'castorice-hsr-chat-card');
  }
  for (const el of document.querySelectorAll('.castorice-hsr-sticker, .castorice-hsr-hero-logo-img, .castorice-hsr-thinking-pill')) {
    el.remove();
  }
  const HERO_LOGO_URL = ${JSON.stringify(layerUrls.heroLogo)};
  const STICKERS = ${JSON.stringify(stickerUrls)};
  const isAgentWorking = () => {
    for (const btn of document.querySelectorAll('button, [role="button"]')) {
      const label = ((btn.getAttribute('aria-label') || '') + ' ' + (btn.getAttribute('title') || '') + ' ' + (btn.textContent || '')).toLowerCase();
      if (label.includes('stop') || label.includes('cancel generation') || label.includes('interrupt')) {
        const r = btn.getBoundingClientRect();
        if (r.width > 12 && r.height > 12 && r.bottom >= window.innerHeight - 240) return true;
      }
    }
    return false;
  };
  const pickStickerKey = (text, working) => {
    if (working) return 'create';
    const t = (text || '').toLowerCase();
    if (/(bug|error|fix|broken|fail|crash|bad|revert|wrong|glitch|noise|gone|stuck|clip|weird|issue|problem)/.test(t)) return 'sad';
    if (/(thank|thanks|thx|cute|love|awesome|great|nice|cool|good|perfect|wow|amazing|beautiful|best)/.test(t)) return 'shy';
    if (t.includes('?') || /(why|what|how|where|when|huh|wait|unsure|possible|can u|can you|is it|is this)/.test(t)) return 'speechless';
    return 'butterfly';
  };
  if (window.__castoricePaneObserver) {
    try { window.__castoricePaneObserver.disconnect(); } catch (_) {}
  }

  const style = document.createElement('style');
  style.id = 'castorice-3d-theme';
  style.textContent = ${JSON.stringify(themeCss)};
  document.head.appendChild(style);

  if (!window.THREE) {
    (0, eval)(${JSON.stringify(threeBundle)});
  }
  if (typeof window.__castorice3DCleanup === 'function') {
    try { window.__castorice3DCleanup(); } catch (_) {}
  }
  (0, eval)(${JSON.stringify(sceneScript)});

  const b64ToBlobUrl = (b64, mime) => {
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return URL.createObjectURL(new Blob([bytes], { type: mime }));
  };

  let sceneStarted = false;
  const startScene = () => {
    if (sceneStarted) return;
    sceneStarted = true;
    const vidUrls = {
      master: b64ToBlobUrl(${JSON.stringify(videoB64.master)}, 'video/webm'),
    };
    window.initCastorice3D({
      container: document.body,
      layers: ${JSON.stringify(layerUrls)},
      videoLayers: vidUrls,
      blobUrls: Object.values(vidUrls),
      interactiveAlways: false,
      sidebarAware: false
    });
  };

  // Fullscreen H.264 Honkai: Star Rail Castorice Logo Intro (plays FIRST with zero WebGL/video contention!)
  const prevIntro = document.getElementById('castorice-intro-overlay');
  if (prevIntro) prevIntro.remove();
  const introB64 = ${JSON.stringify(skipIntro ? '' : videoB64.intro)};
  if (introB64 && (document.getElementById('root') || document.querySelector('.monaco-workbench'))) {
    const introUrl = b64ToBlobUrl(introB64, 'video/mp4');
    const overlay = document.createElement('div');
    overlay.id = 'castorice-intro-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:999999;background:#05040a;display:flex;align-items:center;justify-content:center;opacity:1;transition:opacity 0.22s ease, background-color 1.4s ease;cursor:pointer;will-change:opacity;';
    const ivid = document.createElement('video');
    ivid.src = introUrl;
    ivid.muted = true;
    ivid.playsInline = true;
    ivid.preload = 'auto';
    // Both intro & 2.5D wallpaper use exact centered 16:9 contain in the full window -> pixel-for-pixel match!
    ivid.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:contain;pointer-events:none;transform:translateZ(0);';
    const hint = document.createElement('div');
    hint.textContent = 'Click or press Esc to skip';
    hint.style.cssText = 'position:fixed;right:20px;bottom:16px;font-size:12px;color:rgba(226,218,255,0.48);letter-spacing:0.06em;pointer-events:none;';
    overlay.appendChild(ivid);
    overlay.appendChild(hint);
    document.body.appendChild(overlay);

    let closed = false;
    const closeIntro = () => {
      if (closed) return;
      closed = true;
      window.removeEventListener('keydown', onEsc, true);
      startScene();
      if (typeof window.__castoriceWake25D === 'function') {
        try { window.__castoriceWake25D(); } catch (_) {}
      }
      overlay.style.pointerEvents = 'none';
      overlay.style.transition = 'opacity 0.22s ease';
      requestAnimationFrame(() => { overlay.style.opacity = '0'; });
      setTimeout(() => {
        try { ivid.pause(); ivid.removeAttribute('src'); ivid.load(); } catch (_) {}
        try { URL.revokeObjectURL(introUrl); } catch (_) {}
        overlay.remove();
      }, 250);
    };
    const onEsc = (e) => { if (e.key === 'Escape') closeIntro(); };
    overlay.addEventListener('click', closeIntro);
    window.addEventListener('keydown', onEsc, true);
    ivid.addEventListener('timeupdate', () => {
      if (!sceneStarted && ivid.duration > 1 && (ivid.duration - ivid.currentTime) <= 1.2) {
        startScene();
        overlay.style.backgroundColor = 'rgba(5, 4, 10, 0.12)';
      }
    });
    ivid.addEventListener('ended', closeIntro);
    ivid.addEventListener('error', closeIntro);
    ivid.addEventListener('canplaythrough', () => { ivid.play().catch(closeIntro); }, { once: true });
    ivid.load();
  } else {
    startScene();
  }

  // Reveal 2.5D wallpaper everywhere: frosted blurred sidebar, no black boxes, full HSR Castorice UI
  if (!document.querySelector('.monaco-workbench')) {
    // Works across rgb(), rgba(), oklch(), oklab(), and color(srgb ...) used by Tailwind v4
    const hasSolidBg = (bg) => {
      if (!bg || bg === 'transparent' || bg === 'rgba(0, 0, 0, 0)') return false;
      const trimmed = bg.trim();
      if (trimmed.endsWith('/ 0)') || trimmed.endsWith(', 0)')) return false;
      return true;
    };

    const applyRightPaneGlass = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      let sidebarEl = null;

      // Reset active-row highlights on every view switch so previous tabs never stay highlighted
      for (const prev of document.querySelectorAll('.castorice-hsr-active-row')) {
        prev.classList.remove('castorice-hsr-active-row');
      }

      // 1. Identify outermost left sidebar (even if deeply nested in #root) and give it frosted blurred glass
      for (const el of document.querySelectorAll('#root aside, #root nav, #root div')) {
        const r = el.getBoundingClientRect();
        if (r.left <= 24 && r.width >= 160 && r.width <= vw * 0.35 && r.height >= vh * 0.7) {
          if (!sidebarEl) {
            sidebarEl = el;
            el.classList.remove('castorice-clear-pane');
            el.classList.add('castorice-hsr-sidebar');
          } else if (sidebarEl.contains(el)) {
            el.classList.add('castorice-clear-pane');
          }
        }
      }

      // 2. Remove solid black boxes & gradient fade bars across Agent Manager
      //    NEVER make semantic modals/dialogs/menus transparent, and NEVER treat split-panes as modals!
      const isOverlay = (node) => Boolean(
        node.closest('[role="dialog"], [aria-modal="true"], [role="menu"], [role="listbox"], [data-radix-popper-content-wrapper]')
      );

      // Elevate the top menu bar (Antigravity / Workspace / View / Window) above the blurred sidebar stacking context
      for (const el of document.querySelectorAll('#root > div, #root header, #root div')) {
        const r = el.getBoundingClientRect();
        if (r.top <= 4 && r.height >= 24 && r.height <= 46 && r.width >= vw * 0.85) {
          el.classList.add('castorice-hsr-menubar');
          break;
        }
      }

      // Style Settings dialog inner wrappers so its frosted blur shows through (safe: only inside semantic dialogs)
      for (const dlg of document.querySelectorAll('[role="dialog"], [aria-modal="true"]')) {
        dlg.classList.add('castorice-hsr-modal');
        for (const inner of dlg.querySelectorAll('div, aside, main, section')) {
          const ir = inner.getBoundingClientRect();
          if (ir.width > 180 && ir.height > 200 && hasSolidBg(getComputedStyle(inner).backgroundColor)) {
            inner.classList.add('castorice-clear-pane');
          }
        }
      }

      // Style ONLY the outermost Customizations top header (clear inner max-width wrappers so no double outline box)
      for (const inp of document.querySelectorAll('input[placeholder*="customizations" i], input[placeholder*="Customizations"]')) {
        let cur = inp.parentElement;
        const matched = [];
        for (let d = 0; d < 5 && cur && cur !== document.body; d++, cur = cur.parentElement) {
          const cr = cur.getBoundingClientRect();
          if (cr.width > vw * 0.45 && cr.height >= 48 && cr.height <= 240) matched.push(cur);
        }
        if (matched.length > 0) {
          const outer = matched[matched.length - 1];
          outer.classList.remove('castorice-clear-pane', 'castorice-hsr-chat-card');
          outer.classList.add('castorice-hsr-header');
          for (let i = 0; i < matched.length - 1; i++) {
            matched[i].classList.remove('castorice-hsr-header', 'castorice-hsr-chat-card');
            matched[i].classList.add('castorice-clear-pane');
          }
        }
      }

      const candidates = document.querySelectorAll('#root div, #root main, #root section, #root header, #root footer, body > div div');
      for (const el of candidates) {
        if (el.id === 'castorice-3d-canvas' || el === sidebarEl) continue;
        // Fast skip for inline/text leaf divs inside markdown, code blocks & already-styled chat cards
        if (el.classList.contains('castorice-hsr-chat-card')) continue;
        if (el.closest('pre, code, .castorice-hsr-chat-card, .castorice-hsr-input-box')) continue;
        if (el.classList.contains('castorice-clear-pane') && (!sidebarEl || !sidebarEl.contains(el))) continue;
        if (isOverlay(el)) continue;
        if (el.classList.contains('castorice-hsr-input-box') || el.classList.contains('castorice-hsr-warp-btn') || el.classList.contains('castorice-hsr-badge-btn')) continue;
        const cs = getComputedStyle(el);
        const bg = cs.backgroundColor;
        const hasGrad = cs.backgroundImage && cs.backgroundImage.includes('gradient');
        if (!hasGrad && !hasSolidBg(bg)) continue;
        const r = el.getBoundingClientRect();
        if (r.width < 20 || r.height < 16) continue;

        // Remove black scroll-fade gradient bars (wide conversation fades + narrow top-header edge fades)
        if (hasGrad && !el.classList.contains('castorice-hsr-chat-card') && !el.classList.contains('castorice-hsr-badge-btn') && !el.matches('button, [role="button"]')) {
          if ((r.left >= 140 && r.width > vw * 0.3 && r.height <= 180) || (r.top <= 64 && r.height <= 64 && r.left >= 140)) {
            el.classList.add('castorice-clear-pane');
            continue;
          }
        }

        if (!hasSolidBg(bg)) continue;

        // Top-bar dropdown popups (Antigravity, Workspace, View, Window) -> consistent frosted glass regardless of left X
        if ((cs.position === 'fixed' || cs.position === 'absolute') && r.top >= 20 && r.top <= 75 && r.width >= 120 && r.width <= 380 && r.height >= 40 && r.height <= 420) {
          if (el.querySelector('button, [role="menuitem"], [role="button"]')) {
            el.classList.add('castorice-hsr-menu-box', 'castorice-hsr-menu');
            continue;
          }
        }

        // Inside left sidebar: clear nested opaque wrappers & black project folder rectangles; never lock :hover!
        if (sidebarEl && sidebarEl.contains(el)) {
          if (el.matches(':hover')) continue;
          const isSelected = el.getAttribute('aria-current') === 'page'
            || el.getAttribute('aria-selected') === 'true'
            || el.getAttribute('data-active') === 'true';
          const isRealRow = r.height >= 26 && r.height <= 46 && r.width > 120
            && el.textContent.trim().length > 0
            && !el.querySelector('input, button, [role="button"]');
          if (isRealRow && isSelected) {
            el.classList.add('castorice-hsr-active-row');
          } else {
            el.classList.remove('castorice-hsr-active-row');
            // Clear structural wrappers and black rectangular project headers (e.g. Castorice, TH08, AntiPersonality)
            if (r.height > 54 || cs.position === 'sticky' || (r.height >= 24 && r.height <= 46 && !el.matches('button, [role="button"]'))) {
              el.classList.add('castorice-clear-pane');
            }
          }
          continue;
        }

        // Top header bar (including Customizations sticky header up to ~165px tall)
        if (r.top <= 64 && r.height <= 165) {
          el.classList.add(r.width > vw * 0.45 ? 'castorice-hsr-header' : 'castorice-clear-pane');
          continue;
        }

        // Large layout wrappers & bottom footer strip behind prompt input -> clear so wallpaper shows cleanly
        if (r.width > vw * 0.48 && (r.height > vh * 0.45 || r.bottom >= vh - 12)) {
          el.classList.add('castorice-clear-pane');
          continue;
        }

        // Chat message bubbles on the right pane -> Styxia's Butterfly Chat Box (never floating hover tooltips or portals!)
        if (r.left > 180 && r.width >= 140 && r.width <= vw * 0.72 && r.height >= 36 && r.height < vh * 0.55) {
          let isFloating = !document.getElementById('root')?.contains(el)
            || Boolean(el.closest('[role="tooltip"], [data-radix-popper-content-wrapper]'));
          for (let p = el; !isFloating && p && p !== document.body && p.id !== 'root'; p = p.parentElement) {
            const pcs = getComputedStyle(p);
            if (pcs.position === 'fixed' || (pcs.position === 'absolute' && (parseInt(pcs.zIndex, 10) || 0) >= 10)) {
              isFloating = true;
            }
          }
          if (!isFloating && !el.closest('.castorice-hsr-header') && !el.querySelector('textarea, [contenteditable="true"], button')) {
            el.classList.add('castorice-hsr-chat-card');
          }
        }
      }

      // 3. Tag + New Conversation inside sidebar (strip native border at rest) and "21d 1h" (Open IDE) button
      for (const btn of document.querySelectorAll('button, [role="button"], a')) {
        if (btn.closest('[role="menu"], [role="listbox"], .castorice-hsr-menu')) continue;
        const txt = (btn.textContent || '').replace(/\\s+/g, ' ').trim();
        if (txt.includes('New Conversation') && !txt.includes('Ctrl') && (!sidebarEl || sidebarEl.contains(btn))) {
          btn.classList.add('castorice-hsr-new-conv');
        } else if (txt === 'Open IDE') {
          btn.classList.add('castorice-hsr-badge-btn');
        }
      }

      // 4. Tag ONLY the single Prompt Input Box container (never grab full-width <footer> or double-layer!)
      const workingNow = isAgentWorking();
      for (const prev of document.querySelectorAll('.castorice-hsr-input-box')) {
        prev.classList.remove('castorice-hsr-input-box', 'is-thinking');
      }
      for (const inp of document.querySelectorAll('textarea, [contenteditable="true"]')) {
        let cur = inp.parentElement;
        let targetBox = null;
        for (let depth = 0; depth < 5 && cur && cur !== document.body && cur.tagName !== 'FOOTER' && cur.tagName !== 'MAIN'; depth++, cur = cur.parentElement) {
          const r = cur.getBoundingClientRect();
          if (r.width >= 320 && r.width <= vw * 0.72 && r.height >= 64 && r.height <= 340) {
            targetBox = cur;
            // Stop as soon as we wrap both the text input and its action/model buttons
            if (cur.querySelector('button')) break;
          }
        }
        if (targetBox) {
          targetBox.classList.remove('castorice-clear-pane', 'castorice-hsr-chat-card');
          targetBox.classList.add('castorice-hsr-input-box');
          targetBox.classList.toggle('is-thinking', workingNow);
          if (!targetBox.querySelector(':scope > .castorice-hsr-thinking-pill')) {
            const pill = document.createElement('div');
            pill.className = 'castorice-hsr-thinking-pill';
            pill.innerHTML = '<span class="castorice-hsr-thinking-bf"></span><span>The butterflies are gathering your answer...</span>';
            targetBox.appendChild(pill);
          }
          for (const child of targetBox.querySelectorAll('.castorice-hsr-input-box, .castorice-hsr-chat-card')) {
            child.classList.remove('castorice-hsr-input-box', 'castorice-hsr-chat-card');
          }
        }
      }

      // 5. Attach Castorice chibi sticker on the left side of each user message bubble
      //    Shows "Castorice Create" while working on the latest bubble, then pops into mood-matched sticker when done!
      const chatBubbles = Array.from(document.querySelectorAll('.castorice-hsr-chat-card'))
        .filter((el) => el.getBoundingClientRect().height >= 28 && (el.textContent || '').trim().length > 0);
      const corners = ['tl', 'tr', 'bl', 'br'];
      chatBubbles.forEach((bubble, idx) => {
        const msgText = (bubble.textContent || '').trim();
        // Stable deterministic hash per message so corner & watermark stay random per bubble without jumping on scroll
        if (!bubble.dataset.bfCorner) {
          let h = 2166136261;
          for (let i = 0; i < msgText.length; i++) {
            h ^= msgText.charCodeAt(i);
            h = Math.imul(h, 16777619);
          }
          h = Math.abs(h + idx * 31);
          bubble.dataset.bfCorner = corners[h % 4];
          const wmX = 10 + ((h >>> 3) % 81);  // 10%..90% across bubble width
          const wmY = 12 + ((h >>> 10) % 77); // 12%..88% across bubble height
          bubble.style.setProperty('--castorice-wm-pos', wmX + '% ' + wmY + '%');
        }
        const isLatest = idx === chatBubbles.length - 1;
        const key = pickStickerKey(msgText, isLatest && workingNow);
        let img = bubble.querySelector(':scope > .castorice-hsr-sticker');
        if (!img) {
          img = document.createElement('img');
          img.className = 'castorice-hsr-sticker';
          img.alt = '';
          bubble.appendChild(img);
        }
        if (img.dataset.stickerKey !== key) {
          img.dataset.stickerKey = key;
          img.src = STICKERS[key] || STICKERS.butterfly;
          img.classList.toggle('is-creating', key === 'create');
          if (key !== 'create') {
            img.style.animation = 'none';
            void img.offsetWidth;
            img.style.animation = '';
          }
        }
      });

      // 6. Replace the center Antigravity A-logo & greeting on New Conversation empty state with the HSR Castorice emblem & quote
      for (const svg of document.querySelectorAll('#root svg, body > div svg')) {
        if (sidebarEl && sidebarEl.contains(svg)) continue;
        if (svg.closest('button, [role="button"], a, .castorice-hsr-input-box, .castorice-hsr-header, .castorice-hsr-chat-card')) continue;
        const r = svg.getBoundingClientRect();
        const isHeroLogo = (r.width >= 36 && r.width <= 180 && r.height >= 36 && r.height <= 180 && r.left > 180 && r.top > 70 && r.bottom < vh - 120)
          || svg.classList.contains('castorice-hsr-hero-logo-svg')
          || svg.getAttribute('viewBox') === '0 0 180 180';
        if (isHeroLogo && svg.parentElement) {
          svg.classList.add('castorice-hsr-hero-logo-svg');
          if (!svg.parentElement.querySelector(':scope > .castorice-hsr-hero-logo-img')) {
            const hImg = document.createElement('img');
            hImg.className = 'castorice-hsr-hero-logo-img';
            hImg.src = HERO_LOGO_URL;
            hImg.alt = 'Honkai: Star Rail Castorice';
            svg.parentElement.insertBefore(hImg, svg);
          }
          // Style and gently rewrite ALL Antigravity random empty-state greetings right below the hero logo
          const greetRoot = svg.parentElement.parentElement?.parentElement || svg.parentElement.parentElement || svg.parentElement;
          for (const gEl of greetRoot.querySelectorAll('h1, h2, h3, p, span, div')) {
            if (gEl.children.length > 0) continue;
            if (gEl.closest('button, [role="button"], a, .castorice-hsr-input-box')) continue;
            const gt = (gEl.textContent || '').trim();
            if (!gt) continue;
            const isGreeting = gEl.dataset.castoriceOrigGreet
              || /(What['’]s next|Good to see you|Welcome back|Hello|Hi there|Hey there|Good morning|Good afternoon|Good evening|How can I help|What can I help|What are we building|Ready when you are|Where should we start|What['’]s on your mind)/i.test(gt)
              || (gt.length >= 10 && gt.length <= 90 && gEl.getBoundingClientRect().top >= svg.parentElement.getBoundingClientRect().top - 10);
            if (isGreeting) {
              if (!gEl.dataset.castoriceOrigGreet) {
                gEl.dataset.castoriceOrigGreet = gt;
              }
              const m = gEl.dataset.castoriceOrigGreet.match(/(?:,\\s*|\\bfor\\s+|\\bhey\\s+|\\bhi\\s+|\\bhello\\s+)([A-Za-z0-9_-]{3,24})(?:[.,!?]|$)/i);
              const userName = m ? m[1].trim() : 'KIllgame1234';
              const targetGreet = 'May the Stygian butterflies guide you, ' + userName + '. Shall we begin?';
              if (gEl.textContent !== targetGreet) {
                gEl.textContent = targetGreet;
              }
              gEl.classList.add('castorice-hsr-greeting');
              break;
            }
          }
        }
      }
    };
    applyRightPaneGlass();
    let rafPending = false;
    let lastGlassRun = 0;
    let throttleTimer = 0;
    const scheduleGlassPass = (immediate = false) => {
      if (immediate) {
        if (throttleTimer) { clearTimeout(throttleTimer); throttleTimer = 0; }
        if (rafPending) return;
        rafPending = true;
        requestAnimationFrame(() => {
          rafPending = false;
          lastGlassRun = performance.now();
          applyRightPaneGlass();
        });
        return;
      }
      if (rafPending || throttleTimer) return;
      const elapsed = performance.now() - lastGlassRun;
      if (elapsed >= 180) {
        rafPending = true;
        requestAnimationFrame(() => {
          rafPending = false;
          lastGlassRun = performance.now();
          applyRightPaneGlass();
        });
      } else {
        throttleTimer = setTimeout(() => {
          throttleTimer = 0;
          scheduleGlassPass(true);
        }, 180 - elapsed);
      }
    };
    const obs = new MutationObserver((mutations) => {
      let structural = false;
      for (let i = 0; i < mutations.length; i++) {
        const m = mutations[i];
        // Ignore our own sticker/logo injections or text-only streaming inside existing elements
        for (let j = 0; j < m.addedNodes.length; j++) {
          const n = m.addedNodes[j];
          if (n.nodeType === 1 && !n.classList.contains('castorice-hsr-sticker') && !n.classList.contains('castorice-hsr-hero-logo-img') && !n.classList.contains('castorice-hsr-thinking-pill')) {
            structural = true;
            break;
          }
        }
        if (structural) break;
        for (let j = 0; j < m.removedNodes.length; j++) {
          const n = m.removedNodes[j];
          if (n.nodeType === 1 && !n.classList.contains('castorice-hsr-sticker') && !n.classList.contains('castorice-hsr-hero-logo-img') && !n.classList.contains('castorice-hsr-thinking-pill')) {
            structural = true;
            break;
          }
        }
        if (structural) break;
      }
      if (!structural) return;
      // If a top-level view or sidebar switched, run on the immediate next frame (0ms flash); otherwise coalesce streaming tokens at 180ms
      const isMajorSwitch = mutations.some(m => m.target && (m.target.id === 'root' || m.target.tagName === 'MAIN' || m.target.tagName === 'ASIDE'));
      scheduleGlassPass(isMajorSwitch);
    });
    obs.observe(document.body, { childList: true, subtree: true });
    window.__castoricePaneObserver = obs;
  }

  return 'Castorice 2.5D 5-layer wallpaper applied';
})()`;

const removeJs = `(() => {
  const s = document.getElementById('castorice-3d-theme');
  if (s) s.remove();
  const intro = document.getElementById('castorice-intro-overlay');
  if (intro) intro.remove();
  if (window.__castoricePaneObserver) {
    try { window.__castoricePaneObserver.disconnect(); } catch (_) {}
    window.__castoricePaneObserver = null;
  }
  if (typeof window.__castorice3DCleanup === 'function') {
    try { window.__castorice3DCleanup(); } catch (_) {}
  }
  for (const el of document.querySelectorAll('.castorice-hsr-sticker, .castorice-hsr-hero-logo-img, .castorice-hsr-thinking-pill')) el.remove();
  for (const el of document.querySelectorAll('[data-castorice-orig-greet]')) {
    el.textContent = el.dataset.castoriceOrigGreet;
    delete el.dataset.castoriceOrigGreet;
  }
  for (const el of document.querySelectorAll('[class*="castorice-"]')) {
    for (const c of Array.from(el.classList)) {
      if (c.startsWith('castorice-')) el.classList.remove(c);
    }
  }
  return 'Castorice 2.5D theme removed';
})()`;

const port = findDevToolsPort();
const listRes = await fetch(`http://127.0.0.1:${port}/json/list`).catch(() => null);

const isRealAppPage = (p) => p.type === 'page'
  && p.webSocketDebuggerUrl
  && typeof p.url === 'string'
  && !p.url.startsWith('data:')
  && !p.url.startsWith('devtools:')
  && !p.url.startsWith('about:blank');

if (isOff) {
  setPersonaRule(false);
  if (listRes && listRes.ok) {
    const pages = (await listRes.json()).filter(p => p.type === 'page' && p.webSocketDebuggerUrl);
    for (const page of pages) {
      try {
        const out = await evalCdp(page.webSocketDebuggerUrl, removeJs);
        console.log(`[+] ${page.title || page.url}: ${out}`);
      } catch (err) {
        console.warn(`[!] Skipped ${page.title || page.url}: ${err.message}`);
      }
    }
  }
  process.exit(0);
}

if (!listRes || !listRes.ok) {
  console.error(`[!] Could not connect to Antigravity DevTools on port ${port}.`);
  console.error('    Make sure Antigravity is running with --remote-debugging-port=9222 (or DevToolsActivePort exists).');
  process.exit(1);
}

const allPages = await listRes.json();
const pages = allPages.filter(isRealAppPage);
// Clean up any previously injected hidden data:text/html splash/blank pages so they never waste GPU/video decoders!
for (const bgPage of allPages.filter(p => p.type === 'page' && p.webSocketDebuggerUrl && !isRealAppPage(p))) {
  try { await evalCdp(bgPage.webSocketDebuggerUrl, removeJs); } catch (_) {}
}
if (pages.length === 0) {
  console.error('[!] No Antigravity page targets found.');
  process.exit(1);
}

let applied = 0;
for (const page of pages) {
  try {
    const out = await evalCdp(page.webSocketDebuggerUrl, injectJs);
    console.log(`[+] ${page.title || page.url}: ${out}`);
    applied++;
  } catch (err) {
    console.warn(`[!] Skipped ${page.title || page.url}: ${err.message}`);
  }
}
if (applied > 0) setPersonaRule(true);
