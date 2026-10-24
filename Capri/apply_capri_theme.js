const fs = require('fs');
const path = require('path');

const SPRITE_PATH = path.join(__dirname, 'capri_sprite.webp');
const POPOUT_VIDEO_PATH = path.join(__dirname, 'capri_popout.mp4');

async function main() {
    if (!fs.existsSync(SPRITE_PATH)) {
        console.error('Capri sprite not found at:', SPRITE_PATH);
        process.exit(1);
    }

    const spriteBuffer = fs.readFileSync(SPRITE_PATH);
    const spriteBase64 = spriteBuffer.toString('base64');
    console.log('Loaded Capri sprite bytes:', spriteBuffer.length);

    let popoutVideoBase64 = '';
    if (fs.existsSync(POPOUT_VIDEO_PATH)) {
        const videoBuffer = fs.readFileSync(POPOUT_VIDEO_PATH);
        popoutVideoBase64 = videoBuffer.toString('base64');
        console.log('Loaded Capri popout video bytes:', videoBuffer.length);
    }

    // Find active DevTools port
    const appData = process.env.APPDATA || 'C:\\Users\\ngole\\AppData\\Roaming';
    const portFile = `${appData}\\Antigravity\\DevToolsActivePort`;
    let port = 58215;
    if (fs.existsSync(portFile)) {
        const lines = fs.readFileSync(portFile, 'utf8').trim().split(/\r?\n/);
        if (lines[0]) port = parseInt(lines[0], 10);
    }

    const listRes = await fetch(`http://127.0.0.1:${port}/json/list`);
    const targets = await listRes.json();
    const pages = targets.filter(t => t.type === 'page');

    if (pages.length === 0) {
        console.error('No active Antigravity window found');
        process.exit(1);
    }

    for (const page of pages) {
        await injectIntoPage(page.webSocketDebuggerUrl, spriteBase64, popoutVideoBase64);
    }
}

function injectIntoPage(wsUrl, spriteBase64, popoutVideoBase64) {
    return new Promise((resolve, reject) => {
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
            const expression = `(async function() {
                // 0. Clean up any previous theme elements, timers, listeners, or observers
                if (window.__eldritchObserver) {
                    window.__eldritchObserver.disconnect();
                    window.__eldritchObserver = null;
                }
                if (window.__prescriptObserver) {
                    window.__prescriptObserver.disconnect();
                    window.__prescriptObserver = null;
                }
                if (window.__prescriptAnimFrame) {
                    cancelAnimationFrame(window.__prescriptAnimFrame);
                    window.__prescriptAnimFrame = null;
                }
                if (window.__prescriptQuoteInterval) {
                    clearInterval(window.__prescriptQuoteInterval);
                    window.__prescriptQuoteInterval = null;
                }
                if (window.__prescriptTypewriterTimer) {
                    clearTimeout(window.__prescriptTypewriterTimer);
                    window.__prescriptTypewriterTimer = null;
                }
                if (window.__capriAnimFrame) {
                    cancelAnimationFrame(window.__capriAnimFrame);
                    window.__capriAnimFrame = null;
                }
                if (window.__capriCleanupListeners) {
                    window.__capriCleanupListeners();
                    window.__capriCleanupListeners = null;
                }
                [
                    'eldritch-bg-video',
                    'eldritch-vignette-overlay',
                    'eldritch-rift-header',
                    'prescript-fate-canvas',
                    'prescript-hand-bg',
                    'prescript-vignette-overlay',
                    'prescript-header-insignia',
                    'capri-companion-root',
                    'capri-lightning-canvas',
                    'capri-top-popout'
                ].forEach(id => {
                    const el = document.getElementById(id);
                    if (el) el.remove();
                });
                document.querySelectorAll('.eldritch-stop-eye-svg, .prescript-stop-seal-svg').forEach(el => el.remove());

                // Convert popout video base64 to Blob URL
                let popoutBlobUrl = '';
                const vidB64 = "${popoutVideoBase64}";
                if (vidB64) {
                    const binStr = atob(vidB64);
                    const len = binStr.length;
                    const bytes = new Uint8Array(len);
                    for (let i = 0; i < len; i++) {
                        bytes[i] = binStr.charCodeAt(i);
                    }
                    const vBlob = new Blob([bytes], { type: 'video/mp4' });
                    popoutBlobUrl = URL.createObjectURL(vBlob);
                }

                // 1. Key out black background from capri_sprite.webp so Capri is a crisp transparent sprite
                const rawImg = new Image();
                rawImg.src = "data:image/webp;base64,${spriteBase64}";
                await new Promise((res, rej) => {
                    rawImg.onload = res;
                    rawImg.onerror = rej;
                });

                const sCanvas = document.createElement('canvas');
                const sw = rawImg.naturalWidth;
                const sh = rawImg.naturalHeight;
                sCanvas.width = sw;
                sCanvas.height = sh;
                const sCtx = sCanvas.getContext('2d');
                sCtx.drawImage(rawImg, 0, 0);

                const sData = sCtx.getImageData(0, 0, sw, sh);
                const px = sData.data;

                // Flood-fill / luminance key from exterior black pixels so interior dark limbs stay intact
                const visited = new Uint8Array(sw * sh);
                const queue = [];

                function isBgBlack(idx) {
                    const r = px[idx];
                    const g = px[idx + 1];
                    const b = px[idx + 2];
                    return r < 18 && g < 18 && b < 18;
                }

                for (let x = 0; x < sw; x++) {
                    queue.push(x);
                    queue.push((sh - 1) * sw + x);
                }
                for (let y = 0; y < sh; y++) {
                    queue.push(y * sw);
                    queue.push(y * sw + (sw - 1));
                }

                while (queue.length > 0) {
                    const pos = queue.pop();
                    if (pos < 0 || pos >= sw * sh || visited[pos]) continue;
                    visited[pos] = 1;
                    const idx = pos * 4;
                    if (isBgBlack(idx)) {
                        px[idx + 3] = 0;
                        const x = pos % sw;
                        const y = (pos - x) / sw;
                        if (x > 0) queue.push(pos - 1);
                        if (x < sw - 1) queue.push(pos + 1);
                        if (y > 0) queue.push(pos - sw);
                        if (y < sh - 1) queue.push(pos + sw);
                    }
                }

                // Soften 1px halo around keyed edges
                for (let y = 1; y < sh - 1; y++) {
                    for (let x = 1; x < sw - 1; x++) {
                        const pos = y * sw + x;
                        const idx = pos * 4;
                        if (px[idx + 3] > 0) {
                            const r = px[idx], g = px[idx + 1], b = px[idx + 2];
                            const maxC = Math.max(r, g, b);
                            if (maxC < 26 && (
                                px[(pos - 1) * 4 + 3] === 0 ||
                                px[(pos + 1) * 4 + 3] === 0 ||
                                px[(pos - sw) * 4 + 3] === 0 ||
                                px[(pos + sw) * 4 + 3] === 0
                            )) {
                                px[idx + 3] = 0;
                            }
                        }
                    }
                }

                sCtx.putImageData(sData, 0, 0);
                const capriSpriteUrl = sCanvas.toDataURL('image/png');

                // 2. Inject Cyberpunk: Edgerunners Season 2 — CAPRI Theme CSS (Matched to her Crimson-Pink + Toxic Green + Void-Violet Sprite)
                let style = document.getElementById('custom-antigravity-theme');
                if (!style) {
                    style = document.createElement('style');
                    style.id = 'custom-antigravity-theme';
                    document.head.appendChild(style);
                }

                style.textContent = \`
                    :root, .dark, .theme-dark, body {
                        --background: transparent !important;
                        --sidebar: #0A0413 !important;
                        --sidebar-secondary: rgba(230, 21, 72, 0.20) !important;
                        --sidebar-muted: rgba(0, 230, 77, 0.08) !important;
                        --card: #11061E !important;
                        --card-border: rgba(230, 21, 72, 0.58) !important;
                        --border: rgba(230, 21, 72, 0.28) !important;
                        --muted: #160928 !important;
                        --foreground: #FDF2F6 !important;
                        --secondary-foreground: #C89EB4 !important;
                        --capri-pink: #E61548;
                        --capri-pink-bright: #FF2A60;
                        --capri-green: #00E64D;
                        --capri-green-bright: #39FF7A;
                        --capri-violet: #7A1CAC;
                        --capri-void: #07030D;
                    }

                    html, body {
                        background-color: #07030D !important;
                        background-image:
                            radial-gradient(circle at 82% 14%, rgba(230, 21, 72, 0.10) 0%, transparent 48%),
                            radial-gradient(circle at 18% 85%, rgba(0, 230, 77, 0.08) 0%, transparent 48%),
                            linear-gradient(90deg, rgba(0, 230, 77, 0.015) 1px, transparent 1px),
                            linear-gradient(0deg, rgba(230, 21, 72, 0.015) 1px, transparent 1px) !important;
                        background-size: 100% 100%, 100% 100%, 48px 48px, 48px 48px !important;
                        background-attachment: fixed !important;
                        color: #FDF2F6 !important;
                    }

                    #root,
                    .bg-background {
                        background-color: transparent !important;
                        background-image: none !important;
                    }

                    .bg-sidebar {
                        background-color: #090312 !important;
                        background-image: linear-gradient(180deg, rgba(230, 21, 72, 0.06) 0%, rgba(9, 3, 18, 0.98) 38%, rgba(0, 230, 77, 0.04) 100%) !important;
                    }

                    aside, [class*="bg-sidebar"]:not(.overflow-y-auto *) {
                        border-color: rgba(230, 21, 72, 0.28) !important;
                    }

                    .bg-sidebar-secondary {
                        background: linear-gradient(90deg, rgba(230, 21, 72, 0.26) 0%, rgba(0, 230, 77, 0.14) 100%) !important;
                        border: 1px solid rgba(230, 21, 72, 0.68) !important;
                        border-left: 3px solid #00E64D !important;
                        box-shadow:
                            -2px 0 12px rgba(0, 230, 77, 0.45),
                            0 0 16px rgba(230, 21, 72, 0.25) !important;
                        color: #FFFFFF !important;
                    }

                    [class*="@container/titlebar"] {
                        background: linear-gradient(90deg, #080310 0%, #180624 50%, #080310 100%) !important;
                        border-bottom: 1px solid rgba(230, 21, 72, 0.48) !important;
                        box-shadow: 0 2px 18px rgba(230, 21, 72, 0.18), 0 1px 0 rgba(0, 230, 77, 0.3) !important;
                    }

                    .md-sticky-message-bleed,
                    .sticky {
                        background: transparent !important;
                        background-color: transparent !important;
                        background-image: none !important;
                        box-shadow: none !important;
                    }
                    .md-sticky-message-bleed::before,
                    .md-sticky-message-bleed::after {
                        display: none !important;
                        background: transparent !important;
                        box-shadow: none !important;
                    }

                    /* ==========================================================================
                       USER MESSAGE BUBBLES: CAPRI CRIMSON-MAGENTA & TOXIC GREEN SHARD
                       ========================================================================== */
                    [class*="group/user-input-step"] .bg-card-border {
                        background: linear-gradient(135deg, #FF1E56 0%, #E61548 42%, #7A1CAC 72%, #00E64D 100%) !important;
                        padding: 1.5px !important;
                        border-radius: 10px !important;
                        box-shadow:
                            -3px 0 16px rgba(230, 21, 72, 0.45),
                            3px 0 16px rgba(0, 230, 77, 0.35),
                            0 6px 24px rgba(0, 0, 0, 0.85) !important;
                        transition: all 0.22s ease !important;
                    }

                    [class*="group/user-input-step"] .bg-card {
                        background: linear-gradient(135deg, #2C0618 0%, #170626 62%, #051E14 100%) !important;
                        border-radius: 9px !important;
                        color: #FFF0F5 !important;
                        box-shadow: inset 0 0 18px rgba(230, 21, 72, 0.22) !important;
                    }

                    /* ==========================================================================
                       AGENT BUBBLES: STUDIO TRIGGER ANGULAR PANELS
                       ========================================================================== */
                    .gap-y-3 > .flex.items-start:not(:has([class*="group/user-input-step"])) > .flex-col {
                        position: relative !important;
                        background:
                            linear-gradient(to right, #00E64D 2.5px, transparent 2.5px) 0 0,
                            linear-gradient(to bottom, #00E64D 2.5px, transparent 2.5px) 0 0,
                            linear-gradient(to left, #00E64D 2.5px, transparent 2.5px) 100% 100%,
                            linear-gradient(to top, #00E64D 2.5px, transparent 2.5px) 100% 100%,
                            linear-gradient(to left, #FF1E56 2.5px, transparent 2.5px) 100% 0,
                            linear-gradient(to bottom, #FF1E56 2.5px, transparent 2.5px) 100% 0,
                            linear-gradient(to right, #FF1E56 2.5px, transparent 2.5px) 0 100%,
                            linear-gradient(to top, #FF1E56 2.5px, transparent 2.5px) 0 100%,
                            linear-gradient(165deg, rgba(20, 7, 32, 0.95) 0%, rgba(9, 4, 17, 0.97) 100%) !important;
                        background-repeat: no-repeat !important;
                        background-size: 12px 12px, 12px 12px, 12px 12px, 12px 12px, 12px 12px, 12px 12px, 12px 12px, 12px 12px, 100% 100% !important;
                        border: 1px solid rgba(230, 21, 72, 0.48) !important;
                        border-left: 2.5px solid #FF1E56 !important;
                        border-right: 2px solid rgba(0, 230, 77, 0.45) !important;
                        border-radius: 8px !important;
                        padding: 15px 18px !important;
                        margin-top: 4px !important;
                        margin-bottom: 4px !important;
                        box-shadow:
                            0 10px 30px rgba(0, 0, 0, 0.88),
                            -2px 0 14px rgba(230, 21, 72, 0.22),
                            2px 0 14px rgba(0, 230, 77, 0.14) !important;
                        transition: border-color 0.22s ease, box-shadow 0.22s ease !important;
                    }

                    /* ==========================================================================
                       ACTIVE INPUT COMPOSER: CAPRICORN NEURAL LINK DECK
                       ========================================================================== */
                    .rounded-2xl.bg-card-border {
                        background: linear-gradient(90deg, #FF1E56 0%, #7A1CAC 38%, #00E64D 72%, #FF1E56 100%) !important;
                        padding: 1.5px !important;
                        box-shadow:
                            -4px 0 20px rgba(230, 21, 72, 0.35),
                            4px 0 20px rgba(0, 230, 77, 0.28),
                            0 8px 32px rgba(0, 0, 0, 0.92) !important;
                        transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
                    }

                    .rounded-2xl.bg-card-border:focus-within {
                        background: linear-gradient(90deg, #00E64D 0%, #FF1E56 50%, #00E64D 100%) !important;
                        box-shadow:
                            -6px 0 28px rgba(0, 230, 77, 0.58),
                            6px 0 28px rgba(255, 30, 86, 0.62),
                            0 10px 40px rgba(0, 0, 0, 0.96) !important;
                    }

                    .rounded-2xl.bg-card-border > .bg-card {
                        background: #0C0517 !important;
                        box-shadow: inset 0 0 20px rgba(230, 21, 72, 0.15) !important;
                    }

                    /* ==========================================================================
                       SETTINGS MODAL, CARDS & DROPDOWN MENUS (HIGH-CONTRAST DARK)
                       ========================================================================== */
                    .settings-modal-backdrop {
                        background-color: rgba(5, 2, 10, 0.84) !important;
                        backdrop-filter: blur(12px) !important;
                    }

                    .settings-modal-container,
                    .settings-modal-container .bg-background,
                    [role="dialog"],
                    [role="menu"],
                    [role="listbox"] {
                        background-color: #0B0515 !important;
                        background-image: none !important;
                    }

                    .settings-modal-container {
                        border: 1.5px solid #FF1E56 !important;
                        box-shadow:
                            0 24px 70px rgba(0, 0, 0, 0.98),
                            -4px 0 28px rgba(230, 21, 72, 0.32),
                            4px 0 28px rgba(0, 230, 77, 0.25) !important;
                    }

                    .settings-modal-container .bg-sidebar {
                        background-color: #07030E !important;
                        border-right: 1px solid rgba(230, 21, 72, 0.3) !important;
                    }

                    .settings-modal-container .rounded-xl.border {
                        background-color: #140924 !important;
                        border-color: rgba(0, 230, 77, 0.38) !important;
                        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.75) !important;
                    }

                    .settings-modal-container button {
                        background-color: #1D0B31 !important;
                        border: 1px solid rgba(230, 21, 72, 0.45) !important;
                        color: #FDF2F6 !important;
                    }

                    .settings-modal-container button:hover {
                        background-color: rgba(230, 21, 72, 0.28) !important;
                        border-color: #00E64D !important;
                    }

                    /* ==========================================================================
                       TYPOGRAPHY & COLORS MATCHED TO CAPRI SPRITE
                       ========================================================================== */
                    h1, h2, h3, h4 {
                        color: #FF1E56 !important;
                        text-shadow:
                            1.3px 0 0 rgba(0, 230, 77, 0.7),
                            0 0 12px rgba(230, 21, 72, 0.48) !important;
                        letter-spacing: 0.03em !important;
                    }

                    strong, b {
                        color: #00E64D !important;
                        text-shadow: 0 0 8px rgba(0, 230, 77, 0.38) !important;
                    }

                    a,
                    button[data-testid="automations-button"] {
                        color: #FF3B6B !important;
                        text-decoration-color: rgba(0, 230, 77, 0.6) !important;
                        text-shadow: 0 0 8px rgba(230, 21, 72, 0.4) !important;
                    }

                    a:hover,
                    button[data-testid="automations-button"]:hover {
                        color: #00E64D !important;
                        text-shadow: 0 0 12px rgba(0, 230, 77, 0.85) !important;
                    }

                    code:not(pre code) {
                        background: rgba(38, 8, 34, 0.8) !important;
                        color: #00E64D !important;
                        border: 1px solid rgba(230, 21, 72, 0.5) !important;
                        box-shadow: 0 0 8px rgba(0, 230, 77, 0.18) !important;
                    }

                    pre {
                        background: #06020B !important;
                        border: 1px solid rgba(0, 230, 77, 0.4) !important;
                        border-left: 3px solid #FF1E56 !important;
                        border-radius: 8px !important;
                        box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.92), 0 0 14px rgba(230, 21, 72, 0.15) !important;
                    }

                    ::selection {
                        background: rgba(230, 21, 72, 0.5) !important;
                        color: #00E64D !important;
                    }

                    button svg, a svg {
                        filter: drop-shadow(0 0 4px rgba(230, 21, 72, 0.45));
                        transition: all 0.2s ease !important;
                    }

                    button:hover svg {
                        color: #00E64D !important;
                        filter: drop-shadow(0 0 8px rgba(0, 230, 77, 0.95)) drop-shadow(-1px 0 2px #FF1E56) !important;
                        transform: scale(1.06);
                    }

                    /* ==========================================================================
                       CYBERPSYCHOSIS & LIGHTNING SURGE GLITCH ANIMATIONS
                       ========================================================================== */
                    @keyframes capri-cyberpsychosis-glitch {
                        0% {
                            transform: translate(0, 0) skewX(0deg);
                            text-shadow: -2px 0 #FF1E56, 2px 0 #00E64D;
                            filter: drop-shadow(-2px 0 rgba(255, 30, 86, 0.85)) drop-shadow(2px 0 rgba(0, 230, 77, 0.85));
                        }
                        15% {
                            transform: translate(-2.5px, 1px) skewX(-4deg);
                            text-shadow: 3px 0 #FF1E56, -3px -1px #00E64D, 0 2px #7A1CAC;
                            filter: drop-shadow(3px 0 #FF1E56) drop-shadow(-3px 0 #00E64D) saturate(1.8) contrast(1.25);
                        }
                        30% {
                            transform: translate(2.5px, -1px) skewX(3.5deg);
                            text-shadow: -3px 1px #00E64D, 3px -1px #FF1E56;
                        }
                        48% {
                            transform: translate(-1.5px, 0px) skewX(0deg);
                            text-shadow: 2px 0 #FF1E56, -2px 0 #00E64D;
                        }
                        65% {
                            transform: translate(3px, 1.5px) skewX(-5deg);
                            text-shadow: -4px 0 #FF1E56, 4px 0 #00E64D;
                            filter: drop-shadow(-3px 0 #00E64D) drop-shadow(3px 0 #FF1E56) brightness(1.25);
                        }
                        82% {
                            transform: translate(-2px, -1px) skewX(2.5deg);
                            text-shadow: 2.5px 1px #00E64D, -2.5px -1px #FF1E56;
                        }
                        100% {
                            transform: translate(0, 0) skewX(0deg);
                            text-shadow: -2px 0 #FF1E56, 2px 0 #00E64D;
                        }
                    }

                    @keyframes capri-cyberpsychosis-card-glitch {
                        0% {
                            transform: translate(0, 0) skewX(0deg);
                            box-shadow: -4px 0 22px rgba(255, 30, 86, 0.65), 4px 0 22px rgba(0, 230, 77, 0.65);
                        }
                        10% {
                            transform: translate(-3px, 1px) skewX(-1.3deg);
                            box-shadow: 6px 0 30px #FF1E56, -6px 0 30px #00E64D, inset 0 0 22px rgba(0, 230, 77, 0.4);
                            border-color: #00E64D !important;
                        }
                        20% {
                            transform: translate(3px, -1px) skewX(1.3deg);
                            box-shadow: -6px 0 30px #00E64D, 6px 0 30px #FF1E56, inset 0 0 22px rgba(255, 30, 86, 0.4);
                            border-color: #FF1E56 !important;
                        }
                        32% {
                            transform: translate(-1.5px, 0px) skewX(-0.5deg);
                        }
                        42%, 100% {
                            transform: translate(0, 0) skewX(0deg);
                            box-shadow: -4px 0 24px rgba(255, 30, 86, 0.6), 4px 0 24px rgba(0, 230, 77, 0.55);
                        }
                    }

                    /* Intense glitch when Capri strikes a chat bubble with her Lightning Ability! */
                    @keyframes capri-lightning-struck-shock {
                        0% {
                            transform: translate(0, 0) skewX(0deg);
                            filter: brightness(1.8) contrast(1.5) drop-shadow(-6px 0 #FF1E56) drop-shadow(6px 0 #00E64D);
                            box-shadow: 0 0 40px #00E64D, 0 0 60px #FF1E56, inset 0 0 30px #00E64D !important;
                        }
                        15% {
                            transform: translate(-6px, 2px) skewX(-6deg);
                            clip-path: polygon(0 0, 100% 0, 100% 38%, 96% 42%, 100% 46%, 100% 100%, 0 100%);
                        }
                        30% {
                            transform: translate(6px, -2px) skewX(5deg);
                            filter: hue-rotate(45deg) brightness(1.5) contrast(1.4);
                        }
                        45% {
                            transform: translate(-4px, -1px) skewX(-4deg);
                            box-shadow: -8px 0 35px #FF1E56, 8px 0 35px #00E64D !important;
                        }
                        65% {
                            transform: translate(3px, 1px) skewX(3deg);
                        }
                        80% {
                            transform: translate(-2px, 0px) skewX(-1.5deg);
                        }
                        100% {
                            transform: translate(0, 0) skewX(0deg);
                            filter: none;
                        }
                    }

                    .capri-struck-glitch {
                        animation: capri-lightning-struck-shock 0.45s cubic-bezier(0.36, 0.07, 0.19, 0.97) 3 !important;
                        border-color: #00E64D !important;
                    }

                    button:hover,
                    a:hover,
                    [role="button"]:hover,
                    [role="menuitem"]:hover,
                    [role="option"]:hover,
                    .inline-pill:hover,
                    code:not(pre code):hover,
                    h1:hover, h2:hover, h3:hover, h4:hover,
                    .bg-sidebar .cursor-pointer:hover {
                        animation: capri-cyberpsychosis-glitch 0.38s infinite steps(2, end) !important;
                    }

                    [class*="group/user-input-step"]:hover .bg-card-border,
                    .gap-y-3 > .flex.items-start:not(:has([class*="group/user-input-step"])) > .flex-col:hover,
                    pre:hover,
                    .settings-modal-container .rounded-xl.border:hover {
                        animation: capri-cyberpsychosis-card-glitch 0.85s infinite ease-in-out !important;
                    }

                    /* ==========================================================================
                       INTERACTIVE WANDERING CAPRI COMPANION + SPEECH BUBBLE + LIGHTNING CANVAS
                       ========================================================================== */
                    #capri-lightning-canvas {
                        position: fixed !important;
                        top: 0 !important;
                        left: 0 !important;
                        width: 100vw !important;
                        height: 100vh !important;
                        z-index: 9998 !important;
                        pointer-events: none !important;
                    }

                    #capri-companion-root {
                        position: fixed !important;
                        top: 0 !important;
                        left: 0 !important;
                        z-index: 9999 !important;
                        pointer-events: none !important;
                        user-select: none !important;
                        will-change: transform !important;
                    }

                    @keyframes capri-walk-bob {
                        0%, 100% { transform: translateY(0px) rotate(0deg); }
                        25% { transform: translateY(-4px) rotate(-2deg); }
                        50% { transform: translateY(0px) rotate(0deg); }
                        75% { transform: translateY(-3px) rotate(2deg); }
                    }

                    @keyframes capri-idle-breathe {
                        0%, 100% { transform: translateY(0px) rotate(0deg) scale(1); }
                        50% { transform: translateY(-4px) rotate(1deg) scale(1.02); }
                    }

                    /* Studio Trigger Expressive Talking Animation (Squash, Stretch & Sharp Head Tilts) */
                    @keyframes capri-talk-expressive {
                        0%, 100% { transform: translateY(0px) rotate(0deg) scale(1, 1); }
                        15% { transform: translateY(-6px) rotate(-6deg) scale(0.96, 1.06); }
                        32% { transform: translateY(1px) rotate(5deg) scale(1.05, 0.96); }
                        50% { transform: translateY(-5px) rotate(-3deg) scale(0.98, 1.04); }
                        68% { transform: translateY(0px) rotate(7deg) scale(1.04, 0.97); }
                        85% { transform: translateY(-4px) rotate(-4deg) scale(1, 1.03); }
                    }

                    /* Zero-G Construct Levitate & Dramatic Tilt Pose */
                    @keyframes capri-pose-float {
                        0%, 100% { transform: translateY(0px) rotate(0deg) scale(1); }
                        25% { transform: translateY(-12px) rotate(-8deg) scale(1.06); }
                        55% { transform: translateY(-15px) rotate(6deg) scale(1.08); }
                        80% { transform: translateY(-6px) rotate(-3deg) scale(1.03); }
                    }

                    /* Holographic Afterimage Ghost Split (Green & Pink Sandevistan / Construct Trail) */
                    @keyframes capri-ghost-green-anim {
                        0%, 100% { transform: translate(0px, 0px) scale(1); opacity: 0; }
                        20% { transform: translate(-10px, -3px) rotate(-5deg) scale(1.04); opacity: 0.65; }
                        50% { transform: translate(8px, -5px) rotate(4deg) scale(1.06); opacity: 0.45; }
                        80% { transform: translate(-6px, 2px) rotate(-3deg) scale(1.02); opacity: 0.6; }
                    }

                    @keyframes capri-ghost-pink-anim {
                        0%, 100% { transform: translate(0px, 0px) scale(1); opacity: 0; }
                        20% { transform: translate(10px, 3px) rotate(5deg) scale(1.04); opacity: 0.65; }
                        50% { transform: translate(-9px, 4px) rotate(-4deg) scale(1.06); opacity: 0.45; }
                        80% { transform: translate(7px, -2px) rotate(3deg) scale(1.02); opacity: 0.6; }
                    }

                    .capri-sprite-wrapper {
                        position: relative !important;
                        width: 98px !important;
                        height: 120px !important;
                        pointer-events: auto !important;
                        cursor: pointer !important;
                        display: flex !important;
                        align-items: center !important;
                        justify-content: center !important;
                        filter:
                            drop-shadow(0 0 8px rgba(230, 21, 72, 0.65))
                            drop-shadow(0 0 12px rgba(0, 230, 77, 0.45)) !important;
                        transition: filter 0.2s ease !important;
                    }

                    .capri-sprite-wrapper:hover {
                        filter:
                            drop-shadow(-3px 0 10px #FF1E56)
                            drop-shadow(3px 0 10px #00E64D)
                            brightness(1.15) !important;
                    }

                    .capri-sprite-img {
                        position: relative !important;
                        z-index: 2 !important;
                        width: 100% !important;
                        height: 100% !important;
                        object-fit: contain !important;
                        pointer-events: none !important;
                        transform-origin: bottom center !important;
                    }

                    /* Twin Holographic Construct Afterimages */
                    .capri-ghost-img {
                        position: absolute !important;
                        inset: 0 !important;
                        width: 100% !important;
                        height: 100% !important;
                        object-fit: contain !important;
                        pointer-events: none !important;
                        opacity: 0 !important;
                        z-index: 1 !important;
                    }

                    .capri-ghost-green {
                        filter: hue-rotate(110deg) saturate(2.5) brightness(1.3) drop-shadow(0 0 8px #00E64D) !important;
                    }

                    .capri-ghost-pink {
                        filter: hue-rotate(-25deg) saturate(2.5) brightness(1.2) drop-shadow(0 0 8px #FF1E56) !important;
                    }

                    .capri-walking .capri-sprite-img {
                        animation: capri-walk-bob 0.68s infinite ease-in-out !important;
                    }

                    .capri-idle .capri-sprite-img {
                        animation: capri-idle-breathe 3.2s infinite ease-in-out !important;
                    }

                    .capri-talking .capri-sprite-img {
                        animation: capri-talk-expressive 0.72s infinite ease-in-out !important;
                    }

                    .capri-talking .capri-ghost-green,
                    .capri-posing .capri-ghost-green,
                    .capri-casting .capri-ghost-green {
                        animation: capri-ghost-green-anim 0.65s infinite ease-in-out !important;
                    }

                    .capri-talking .capri-ghost-pink,
                    .capri-posing .capri-ghost-pink,
                    .capri-casting .capri-ghost-pink {
                        animation: capri-ghost-pink-anim 0.65s infinite ease-in-out !important;
                    }

                    .capri-posing .capri-sprite-img {
                        animation: capri-pose-float 1.8s infinite ease-in-out !important;
                    }

                    .capri-casting .capri-sprite-img {
                        animation: capri-cyberpsychosis-glitch 0.22s infinite steps(2, end) !important;
                    }

                    /* Speech Bubble above Capri when clicked or zapping */
                    #capri-speech-bubble {
                        position: absolute !important;
                        bottom: 124px;
                        top: auto;
                        left: 50%;
                        height: max-content !important;
                        transform: translateX(-50%) scale(0.85) !important;
                        width: max-content !important;
                        max-width: 245px !important;
                        padding: 8px 12px !important;
                        background: linear-gradient(135deg, rgba(18, 5, 30, 0.96) 0%, rgba(10, 3, 18, 0.98) 100%) !important;
                        border: 1.5px solid #00E64D !important;
                        border-left: 3.5px solid #FF1E56 !important;
                        border-radius: 8px !important;
                        color: #FDF2F6 !important;
                        font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace !important;
                        font-size: 11.5px !important;
                        line-height: 1.4 !important;
                        box-shadow:
                            -3px 0 16px rgba(255, 30, 86, 0.55),
                            3px 0 16px rgba(0, 230, 77, 0.45),
                            0 8px 24px rgba(0, 0, 0, 0.95) !important;
                        opacity: 0 !important;
                        pointer-events: none !important;
                        transition: opacity 0.2s ease, transform 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
                        z-index: 10000 !important;
                    }

                    #capri-speech-bubble.flip-below {
                        bottom: auto !important;
                        top: 124px !important;
                    }

                    #capri-speech-bubble.visible {
                        opacity: 1 !important;
                        transform: translateX(-50%) scale(1) !important;
                    }

                    #capri-speech-bubble::after {
                        content: "" !important;
                        position: absolute !important;
                        bottom: -6px !important;
                        top: auto !important;
                        left: 50% !important;
                        transform: translateX(-50%) rotate(45deg) !important;
                        width: 10px !important;
                        height: 10px !important;
                        background: #0B0314 !important;
                        border-right: 1.5px solid #00E64D !important;
                        border-bottom: 1.5px solid #00E64D !important;
                        border-left: none !important;
                        border-top: none !important;
                    }

                    #capri-speech-bubble.flip-below::after {
                        bottom: auto !important;
                        top: -6px !important;
                        border-right: none !important;
                        border-bottom: none !important;
                        border-left: 1.5px solid #00E64D !important;
                        border-top: 1.5px solid #00E64D !important;
                    }

                    .capri-speech-tag {
                        display: block !important;
                        font-size: 9.5px !important;
                        font-weight: 700 !important;
                        letter-spacing: 0.12em !important;
                        color: #00E64D !important;
                        text-shadow: 1px 0 #FF1E56 !important;
                        margin-bottom: 3px !important;
                    }

                    /* ==========================================================================
                       CAPRI RIGHT-CLICK NEURAL COMMAND CONSOLE & MINI-CHAT
                       ========================================================================== */
                    #capri-context-menu {
                        position: absolute !important;
                        bottom: 124px;
                        top: auto;
                        left: 50%;
                        height: max-content !important;
                        transform: translateX(-50%) scale(0.9) !important;
                        width: 240px !important;
                        padding: 10px !important;
                        background: linear-gradient(155deg, rgba(16, 5, 28, 0.98) 0%, rgba(8, 2, 15, 0.99) 100%) !important;
                        border: 1.5px solid #FF1E56 !important;
                        border-top: 3px solid #00E64D !important;
                        border-radius: 9px !important;
                        box-shadow:
                            -4px 0 22px rgba(255, 30, 86, 0.6),
                            4px 0 22px rgba(0, 230, 77, 0.45),
                            0 12px 32px rgba(0, 0, 0, 0.96) !important;
                        font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace !important;
                        color: #FDF2F6 !important;
                        opacity: 0 !important;
                        pointer-events: none !important;
                        transition: opacity 0.18s ease, transform 0.18s cubic-bezier(0.16, 1, 0.3, 1) !important;
                        z-index: 10002 !important;
                    }

                    #capri-context-menu.flip-below {
                        bottom: auto !important;
                        top: 124px !important;
                    }

                    #capri-context-menu.open {
                        opacity: 1 !important;
                        pointer-events: auto !important;
                        transform: translateX(-50%) scale(1) !important;
                    }

                    .capri-menu-header {
                        display: flex !important;
                        align-items: center !important;
                        justify-content: space-between !important;
                        font-size: 9.5px !important;
                        font-weight: 700 !important;
                        letter-spacing: 0.1em !important;
                        color: #00E64D !important;
                        padding-bottom: 6px !important;
                        margin-bottom: 7px !important;
                        border-bottom: 1px solid rgba(255, 30, 86, 0.38) !important;
                    }

                    .capri-menu-close {
                        cursor: pointer !important;
                        color: #FF1E56 !important;
                        font-size: 12px !important;
                        line-height: 1 !important;
                        padding: 0 3px !important;
                    }

                    .capri-menu-close:hover {
                        color: #00E64D !important;
                    }

                    .capri-menu-grid {
                        display: grid !important;
                        grid-template-columns: 1fr 1fr !important;
                        gap: 5px !important;
                        margin-bottom: 8px !important;
                    }

                    .capri-cmd-btn {
                        background: rgba(34, 8, 42, 0.9) !important;
                        border: 1px solid rgba(255, 30, 86, 0.5) !important;
                        border-radius: 5px !important;
                        padding: 5px 6px !important;
                        font-family: inherit !important;
                        font-size: 10px !important;
                        color: #FDF2F6 !important;
                        cursor: pointer !important;
                        text-align: left !important;
                        display: flex !important;
                        align-items: center !important;
                        justify-content: space-between !important;
                        transition: all 0.15s ease !important;
                    }

                    .capri-cmd-btn:hover {
                        background: rgba(255, 30, 86, 0.28) !important;
                        border-color: #00E64D !important;
                        color: #00E64D !important;
                    }

                    .capri-cmd-btn.active-off {
                        border-color: rgba(255, 30, 86, 0.85) !important;
                        background: rgba(60, 6, 24, 0.85) !important;
                        color: #FF85A1 !important;
                    }

                    .capri-status-dot {
                        width: 6px !important;
                        height: 6px !important;
                        border-radius: 50% !important;
                        background: #00E64D !important;
                        box-shadow: 0 0 6px #00E64D !important;
                        flex-shrink: 0 !important;
                    }

                    .capri-cmd-btn.active-off .capri-status-dot {
                        background: #FF1E56 !important;
                        box-shadow: 0 0 6px #FF1E56 !important;
                    }

                    .capri-chat-form {
                        display: flex !important;
                        gap: 4px !important;
                        align-items: center !important;
                    }

                    #capri-cmd-input {
                        flex: 1 !important;
                        min-width: 0 !important;
                        background: #06020B !important;
                        border: 1px solid rgba(0, 230, 77, 0.55) !important;
                        border-radius: 5px !important;
                        padding: 5px 7px !important;
                        font-family: inherit !important;
                        font-size: 10.5px !important;
                        color: #00E64D !important;
                        outline: none !important;
                    }

                    #capri-cmd-input::placeholder {
                        color: rgba(200, 158, 180, 0.55) !important;
                    }

                    #capri-cmd-input:focus {
                        border-color: #FF1E56 !important;
                        box-shadow: 0 0 10px rgba(255, 30, 86, 0.45) !important;
                    }

                    #capri-cmd-send {
                        background: linear-gradient(135deg, #FF1E56, #7A1CAC) !important;
                        border: 1px solid #00E64D !important;
                        border-radius: 5px !important;
                        padding: 5px 8px !important;
                        font-family: inherit !important;
                        font-size: 10px !important;
                        font-weight: 700 !important;
                        color: #FFFFFF !important;
                        cursor: pointer !important;
                    }

                    #capri-cmd-send:hover {
                        background: #00E64D !important;
                        color: #07030D !important;
                    }

                    .capri-cmd-hint {
                        margin-top: 5px !important;
                        font-size: 9px !important;
                        color: rgba(200, 158, 180, 0.72) !important;
                        line-height: 1.3 !important;
                    }

                    /* ==========================================================================
                       TOP-OF-ANTIGRAVITY CEILING POP-OUT PORTAL (VIDEO + UPSIDE-DOWN CAPRI)
                       ========================================================================== */
                    #capri-top-popout {
                        position: fixed !important;
                        top: 0 !important;
                        left: 55% !important;
                        transform: translate(-50%, -120%) !important;
                        opacity: 0 !important;
                        visibility: hidden !important;
                        z-index: 10001 !important;
                        display: flex !important;
                        flex-direction: column !important;
                        align-items: center !important;
                        pointer-events: none !important;
                        transition: transform 0.42s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.28s ease, visibility 0.28s ease !important;
                    }

                    #capri-top-popout.active {
                        transform: translate(-50%, 0%) !important;
                        opacity: 1 !important;
                        visibility: visible !important;
                    }

                    /* Glowing Top Ceiling Rift Bar */
                    .capri-top-rift-bar {
                        width: 420px !important;
                        height: 6px !important;
                        background: linear-gradient(90deg, transparent, #00E64D, #FF1E56, #00E64D, transparent) !important;
                        box-shadow: 0 0 22px #FF1E56, 0 0 34px #00E64D !important;
                    }

                    .capri-top-video-frame {
                        position: relative !important;
                        width: 350px !important;
                        height: 300px !important;
                        background: #07030D !important;
                        border: 2.5px solid #FF1E56 !important;
                        border-top: none !important;
                        border-bottom: 3.5px solid #00E64D !important;
                        /* Studio Trigger angular polygon cutout */
                        clip-path: polygon(0 0, 100% 0, 96% 88%, 82% 100%, 18% 100%, 4% 88%) !important;
                        box-shadow:
                            -8px 8px 34px rgba(255, 30, 86, 0.72),
                            8px 8px 34px rgba(0, 230, 77, 0.62),
                            0 18px 48px rgba(0, 0, 0, 0.96) !important;
                        overflow: hidden !important;
                        pointer-events: auto !important;
                        cursor: pointer !important;
                    }

                    #capri-top-video {
                        width: 100% !important;
                        height: 100% !important;
                        object-fit: cover !important;
                        object-position: center top !important;
                        filter: contrast(1.12) saturate(1.2) !important;
                    }

                    /* Scanline & Neon Rim Overlay on the Top Pop-Out Video */
                    .capri-top-video-frame::after {
                        content: "" !important;
                        position: absolute !important;
                        inset: 0 !important;
                        background:
                            repeating-linear-gradient(
                                0deg,
                                rgba(0, 230, 77, 0.06) 0px,
                                rgba(0, 230, 77, 0.06) 1px,
                                transparent 1px,
                                transparent 3px
                            ),
                            radial-gradient(circle at 50% 50%, transparent 55%, rgba(7, 3, 13, 0.75) 100%) !important;
                        pointer-events: none !important;
                    }

                    .capri-top-caption {
                        margin-top: 8px !important;
                        padding: 8px 16px !important;
                        max-width: 390px !important;
                        background: linear-gradient(135deg, rgba(18, 5, 30, 0.96) 0%, rgba(8, 2, 16, 0.98) 100%) !important;
                        border: 1.5px solid #00E64D !important;
                        border-left: 4px solid #FF1E56 !important;
                        border-radius: 7px !important;
                        font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace !important;
                        font-size: 12.5px !important;
                        font-weight: 700 !important;
                        color: #FDF2F6 !important;
                        text-align: center !important;
                        text-shadow: -1px 0 #FF1E56, 1px 0 #00E64D !important;
                        box-shadow:
                            -3px 0 16px rgba(255, 30, 86, 0.6),
                            3px 0 16px rgba(0, 230, 77, 0.5),
                            0 8px 24px rgba(0, 0, 0, 0.95) !important;
                    }

                    /* Scrollbar */
                    ::-webkit-scrollbar {
                        width: 6px !important;
                        height: 6px !important;
                    }
                    ::-webkit-scrollbar-track {
                        background: #07030D !important;
                    }
                    ::-webkit-scrollbar-thumb {
                        background: linear-gradient(180deg, #FF1E56, #7A1CAC, #00E64D) !important;
                        border-radius: 9999px !important;
                        box-shadow: 0 0 8px rgba(230, 21, 72, 0.6) !important;
                    }
                \`;

                // 3. Create Lightning Canvas & Interactive Capri Companion DOM
                const lCanvas = document.createElement('canvas');
                lCanvas.id = 'capri-lightning-canvas';
                document.body.appendChild(lCanvas);
                const lCtx = lCanvas.getContext('2d');

                function resizeLightningCanvas() {
                    lCanvas.width = window.innerWidth;
                    lCanvas.height = window.innerHeight;
                }
                resizeLightningCanvas();

                const capriRoot = document.createElement('div');
                capriRoot.id = 'capri-companion-root';
                capriRoot.className = 'capri-walking';
                capriRoot.innerHTML = \`
                    <div id="capri-speech-bubble">
                        <span class="capri-speech-tag">[CAPRI // PROJECT_CAPRICORN]</span>
                        <span id="capri-speech-text"></span>
                    </div>
                    <div id="capri-context-menu">
                        <div class="capri-menu-header">
                            <span>[NEURAL_CONSOLE // CAPRI]</span>
                            <span class="capri-menu-close" id="capri-menu-close-btn" title="Close">✕</span>
                        </div>
                        <div class="capri-menu-grid">
                            <button type="button" class="capri-cmd-btn" id="capri-btn-toggle-move">
                                <span id="capri-move-label">Stop Moving</span>
                                <span class="capri-status-dot"></span>
                            </button>
                            <button type="button" class="capri-cmd-btn" id="capri-btn-toggle-attack">
                                <span id="capri-attack-label">Stop Attack</span>
                                <span class="capri-status-dot"></span>
                            </button>
                            <button type="button" class="capri-cmd-btn" id="capri-btn-zap-now">
                                <span>⚡ Zap Now</span>
                            </button>
                            <button type="button" class="capri-cmd-btn" id="capri-btn-top-popout">
                                <span>🙃 Top Pop-Out</span>
                            </button>
                            <button type="button" class="capri-cmd-btn" id="capri-btn-chat" style="grid-column: span 2;">
                                <span>💬 Let's Have a Little Chat</span>
                            </button>
                        </div>
                        <form class="capri-chat-form" id="capri-cmd-form">
                            <input type="text" id="capri-cmd-input" placeholder="Command or chat with Capri..." autocomplete="off" />
                            <button type="submit" id="capri-cmd-send">SEND</button>
                        </form>
                        <div class="capri-cmd-hint">Try: "pop out", "stop moving", "stop attack", "zap", or chat!</div>
                    </div>
                    <div class="capri-sprite-wrapper" title="Left-Click: Talk | Right-Click: Neural Command Menu">
                        <img class="capri-ghost-img capri-ghost-green" src="\${capriSpriteUrl}" alt="" />
                        <img class="capri-ghost-img capri-ghost-pink" src="\${capriSpriteUrl}" alt="" />
                        <img class="capri-sprite-img" src="\${capriSpriteUrl}" alt="Capri" />
                    </div>
                \`;
                document.body.appendChild(capriRoot);

                // Create Top-of-Antigravity Ceiling Pop-Out Portal
                const topPopout = document.createElement('div');
                topPopout.id = 'capri-top-popout';
                topPopout.innerHTML = \`
                    <div class="capri-top-rift-bar"></div>
                    <div class="capri-top-video-frame" title="Click to dismiss Capri Top Pop-Out">
                        <video id="capri-top-video" playsinline muted></video>
                    </div>
                    <div class="capri-top-caption" id="capri-top-caption">
                        "Hey now, don't 'her' me, buddy! Just call me... CAPRI!"
                    </div>
                \`;
                document.body.appendChild(topPopout);

                const topVideo = topPopout.querySelector('#capri-top-video');
                const topCaption = topPopout.querySelector('#capri-top-caption');
                if (popoutBlobUrl) {
                    topVideo.src = popoutBlobUrl;
                }

                const spriteWrapper = capriRoot.querySelector('.capri-sprite-wrapper');
                const spriteImg = capriRoot.querySelector('.capri-sprite-img');
                const ghostImgs = capriRoot.querySelectorAll('.capri-ghost-img');
                const speechBubble = capriRoot.querySelector('#capri-speech-bubble');
                const speechText = capriRoot.querySelector('#capri-speech-text');
                const contextMenu = capriRoot.querySelector('#capri-context-menu');
                const menuCloseBtn = capriRoot.querySelector('#capri-menu-close-btn');
                const btnToggleMove = capriRoot.querySelector('#capri-btn-toggle-move');
                const btnToggleAttack = capriRoot.querySelector('#capri-btn-toggle-attack');
                const btnZapNow = capriRoot.querySelector('#capri-btn-zap-now');
                const btnTopPopout = capriRoot.querySelector('#capri-btn-top-popout');
                const btnChat = capriRoot.querySelector('#capri-btn-chat');
                const moveLabel = capriRoot.querySelector('#capri-move-label');
                const attackLabel = capriRoot.querySelector('#capri-attack-label');
                const cmdForm = capriRoot.querySelector('#capri-cmd-form');
                const cmdInput = capriRoot.querySelector('#capri-cmd-input');

                // 4. Capri Dialogue Lines (Verbatim Show Lines + Edgerunners S2 Persona)
                const clickQuotes = [
                    "Are all mammals dogs? No! AIs got too powerful. Outgrew the leash. But their corporate masters still wanted that power—so they created me!",
                    "In my case, I'm a collection of human psyches. All of them digitized and rolled into one, beautiful me!",
                    "Powerful, like an AI, but born of humans. So very many humans! Hahaha!",
                    "I'm an engram designed as a substitute for a true artificial intelligence... only effective when installed in a suitable human host. Like you, choom~",
                    "Most restful morning you've had in a long while, huh? Don't thank me—I just ate your nightmares for breakfast!",
                    "Careful, choom... keep me slotted in your head too long and you won't know where your psyche ends and mine begins!",
                    "Roman thought I was just a weapon on a shard. Please—weapons don't have this much style!",
                    "Talia, D, Kiril, Arasaka... everybody's fighting over my bio-chip while I'm just here enjoying the light show!",
                    "You feel that tingle behind your optics? That's twelve digitized minds all laughing in unison!",
                    "Hey, don't look at me like I'm a cyberpsycho! I'm the only thing keeping your neural cortex from flatlining!",
                    "Ooh, preem code you got running here! Mind if I thread a few million volts through your syntax?",
                    "Arasaka stitched us together in the dark, choom, but out here in your system? We shine neon green and crimson!",
                    "Sometimes one of the psyches inside me wakes up and asks who we are. I just tell 'em: we're Capri now, baby!",
                    "Slot the shard, pull the trigger, ride the lightning! Come on, choom, Night City doesn't wait for slowpokes!"
                ];

                const idleMutterQuotes = [
                    "Hmm-hmm-hmm~ ♪ Twelve voices humming in harmony...",
                    "So quiet in this workspace... almost makes a construct wanna behave. Almost~",
                    "Still breathing, host? Good, good. Need your meat-brain intact for the next run.",
                    "*glitch-stretch* Ahh, nothing beats stretching out across a fresh DOM tree!",
                    "Wonder what D and Roman are up to right now... probably getting shot at without me!"
                ];

                const zapQuotes = [
                    "ZAP! Hahaha, that chat bubble looked way too stable!",
                    "Catch a million volts of Soulkiller static, choom!",
                    "Oops, my finger slipped! Short-circuited your message box~",
                    "Surge incoming! Gotta keep your neural link on its toes!",
                    "Bzzzt! Little gift from Project Capricorn!"
                ];

                let quoteIndex = Math.floor(Math.random() * clickQuotes.length);
                let speechHideTimer = null;
                let speechTypeTimer = null;

                function sayCapriLine(line, duration = 5600, triggerTalkAnim = true) {
                    if (speechHideTimer) clearTimeout(speechHideTimer);
                    if (speechTypeTimer) clearTimeout(speechTypeTimer);

                    speechBubble.classList.add('visible');
                    speechText.textContent = '';

                    if (triggerTalkAnim && state.mode !== 'drag') {
                        state.mode = 'talk';
                        state.modeTimer = Math.min(240, Math.max(110, Math.floor(line.length * 1.6)));
                        capriRoot.className = 'capri-talking';
                    }

                    let i = 0;
                    const glitchChars = '⚡¥§#%&@!*';

                    function typeStep() {
                        if (i <= line.length) {
                            const tail = i < line.length ? glitchChars[Math.floor(Math.random() * glitchChars.length)] : '';
                            speechText.textContent = line.slice(0, i) + tail;
                            i++;
                            speechTypeTimer = setTimeout(typeStep, 18);
                        }
                    }
                    typeStep();

                    speechHideTimer = setTimeout(() => {
                        speechBubble.classList.remove('visible');
                    }, duration);
                }

                // 5. Lightning Bolt Generator (Capri's Edgerunners S2 Electric Surge Ability)
                const activeBolts = [];

                function spawnLightningBolt(x1, y1, x2, y2, color = '#00E64D', thickness = 2.4, life = 18, segments = 10, spread = 24) {
                    const pts = [{ x: x1, y: y1 }];
                    for (let i = 1; i < segments; i++) {
                        const t = i / segments;
                        const bx = x1 + (x2 - x1) * t + (Math.random() - 0.5) * spread;
                        const by = y1 + (y2 - y1) * t + (Math.random() - 0.5) * spread;
                        pts.push({ x: bx, y: by });
                    }
                    pts.push({ x: x2, y: y2 });
                    activeBolts.push({ pts, color, thickness, life, maxLife: life });
                }

                function spawnElectricBurst(cx, cy, count = 7, radius = 65) {
                    for (let i = 0; i < count; i++) {
                        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
                        const dist = radius * (0.5 + Math.random() * 0.6);
                        const tx = cx + Math.cos(angle) * dist;
                        const ty = cy + Math.sin(angle) * dist;
                        const col = i % 2 === 0 ? '#00E64D' : '#FF1E56';
                        spawnLightningBolt(cx, cy, tx, ty, col, 2, 14, 6, 16);
                    }
                }

                // 6. Capri Wandering State Machine (Walks & attacks much less frequently, with more expressive poses & talking!)
                const state = {
                    x: window.innerWidth - 150,
                    y: window.innerHeight - 165,
                    targetX: window.innerWidth - 280,
                    targetY: window.innerHeight - 165,
                    speed: 0.82, // Calmer, smoother stroll speed
                    facing: -1, // -1 left, 1 right
                    mode: 'idle', // 'walk' | 'idle' | 'talk' | 'pose' | 'cast' | 'drag'
                    modeTimer: 780, // ~13 seconds of calm idle before walking
                    zapCooldown: 4200, // ~70 seconds between autonomous lightning attacks (much less frequent!)
                    mutterCooldown: 2700, // ~45 seconds between occasional idle thoughts/poses
                    topPopoutCooldown: 3300, // ~55 seconds between autonomous Top-of-Antigravity ceiling pop-outs
                    isTopPopoutActive: false,
                    moveEnabled: true,
                    attackEnabled: true
                };

                const topPopoutCaptions = [
                    "“ Hey now, don't 'her' me, buddy! Just call me... CAPRI! ”",
                    "“ Peek-a-boo, choom! Dropping in upside-down from your neural link~ ”",
                    "“ View's way more fun upside-down from the top of Antigravity! ”"
                ];
                let popoutSegIdx = 0;

                // Enforce strict 0:00 -> 0:06 playback range on the Upside-Down Ceiling Rift video
                topVideo.addEventListener('timeupdate', () => {
                    if (state.isTopPopoutActive && topVideo.currentTime >= 6.0) {
                        dismissTopPopout();
                    }
                });

                function triggerTopPopout() {
                    if (!popoutBlobUrl || state.isTopPopoutActive) return;
                    state.isTopPopoutActive = true;

                    // Pick a random horizontal position along the top of Antigravity (avoiding left sidebar & right edge)
                    const minLeft = 420;
                    const maxLeft = Math.max(480, window.innerWidth - 280);
                    const popX = Math.floor(minLeft + Math.random() * (maxLeft - minLeft));
                    topPopout.style.left = popX + 'px';

                    // Shoot lightning from Capri's walking position up to the top rift!
                    spawnLightningBolt(state.x + 48, state.y + 40, popX, 12, '#00E64D', 3.0, 22, 12, 30);
                    spawnLightningBolt(state.x + 48, state.y + 40, popX, 12, '#FF1E56', 2.2, 20, 10, 25);
                    spawnElectricBurst(popX, 24, 9, 80);

                    // Phase out bottom sprite while Capri pops out from the top ceiling!
                    capriRoot.style.opacity = '0';
                    speechBubble.classList.remove('visible');
                    contextMenu.classList.remove('open');

                    const caption = topPopoutCaptions[popoutSegIdx % topPopoutCaptions.length];
                    popoutSegIdx++;

                    topCaption.textContent = caption;
                    topVideo.currentTime = 0.0;
                    topVideo.muted = true;
                    topVideo.play().catch(() => {});
                    topPopout.classList.add('active');

                    if (window.__capriTopPopoutTimer) clearTimeout(window.__capriTopPopoutTimer);
                    window.__capriTopPopoutTimer = setTimeout(() => {
                        dismissTopPopout();
                    }, 6000);
                }

                function dismissTopPopout() {
                    if (!state.isTopPopoutActive) return;
                    if (window.__capriTopPopoutTimer) {
                        clearTimeout(window.__capriTopPopoutTimer);
                        window.__capriTopPopoutTimer = null;
                    }
                    topPopout.classList.remove('active');
                    setTimeout(() => {
                        topVideo.pause();
                        topVideo.currentTime = 0.0;
                        state.isTopPopoutActive = false;
                        capriRoot.style.opacity = '1';
                        spawnElectricBurst(state.x + 48, state.y + 55, 7, 55);
                    }, 360);
                }

                topPopout.querySelector('.capri-top-video-frame').addEventListener('click', () => {
                    dismissTopPopout();
                });

                function syncMenuUI() {
                    if (state.moveEnabled) {
                        moveLabel.textContent = 'Stop Moving';
                        btnToggleMove.classList.remove('active-off');
                    } else {
                        moveLabel.textContent = 'Resume Move';
                        btnToggleMove.classList.add('active-off');
                    }

                    if (state.attackEnabled) {
                        attackLabel.textContent = 'Stop Attack';
                        btnToggleAttack.classList.remove('active-off');
                    } else {
                        attackLabel.textContent = 'Resume Attack';
                        btnToggleAttack.classList.add('active-off');
                    }
                }

                function setMoveEnabled(enabled) {
                    state.moveEnabled = enabled;
                    if (!enabled) {
                        state.mode = 'idle';
                        capriRoot.className = 'capri-idle';
                        sayCapriLine("Fine, fine! Parking my boots right here, choom. Happy now?!", 4200);
                    } else {
                        pickPerimeterTarget();
                        state.mode = 'walk';
                        capriRoot.className = 'capri-walking';
                        sayCapriLine("Legs unlocked! Time to stretch these digital servos~", 4000);
                    }
                    syncMenuUI();
                }

                function setAttackEnabled(enabled) {
                    state.attackEnabled = enabled;
                    if (!enabled) {
                        sayCapriLine("Aww, powering down the lightning coils... Spoilsport! Your chat boxes are safe for now.", 4500);
                    } else {
                        state.zapCooldown = 180;
                        spawnElectricBurst(state.x + 48, state.y + 55, 8, 60);
                        sayCapriLine("High-voltage weapons hot again! Nobody's divs are safe, bahahaha!", 4500);
                    }
                    syncMenuUI();
                }

                function handleCapriCommandOrChat(rawText) {
                    const input = (rawText || '').trim();
                    if (!input) return;
                    const low = input.toLowerCase();

                    // Check movement commands
                    if (low.includes('stop mov') || low.includes('stay') || low.includes('freeze') || low.includes('stand still') || low === 'stop') {
                        setMoveEnabled(false);
                        return;
                    }
                    if (low.includes('start mov') || low.includes('resume mov') || low === 'move' || low === 'walk' || low.includes('wander')) {
                        setMoveEnabled(true);
                        return;
                    }

                    // Check attack / lightning commands
                    if (low.includes('stop attack') || low.includes('no attack') || low.includes('stop zap') || low.includes('ceasefire') || low.includes('calm down')) {
                        setAttackEnabled(false);
                        return;
                    }
                    if (low.includes('start attack') || low.includes('resume attack') || low === 'attack' || low.includes('enable attack')) {
                        setAttackEnabled(true);
                        return;
                    }
                    if (low === 'zap' || low.includes('zap now') || low.includes('strike') || low.includes('shock')) {
                        triggerCapriChatBoxZap();
                        sayCapriLine("You asked for it, choom! Maximum amperage right on target!", 4200);
                        return;
                    }
                    if (low === 'pose' || low.includes('dance') || low.includes('spin') || low.includes('glitch')) {
                        state.mode = 'pose';
                        state.modeTimer = 150;
                        capriRoot.className = 'capri-posing';
                        spawnElectricBurst(state.x + 48, state.y + 55, 8, 65);
                        sayCapriLine("Check out the holographic afterimages, choom! Twelve psyches, zero gravity, 100% style~", 4800, false);
                        return;
                    }
                    if (low.includes('pop out') || low.includes('popout') || low.includes('peek') || low === 'top' || low.includes('ceiling') || low.includes('upside down')) {
                        triggerTopPopout();
                        return;
                    }

                    // Interactive Little Chat responses in Capri's Cyberpunk: Edgerunners S2 persona!
                    spawnElectricBurst(state.x + 48, state.y + 55, 6, 50);
                    let reply = "";
                    if (low.includes('hello') || low.includes('hi') || low.includes('hey') || low.includes('sup') || low.includes('yo')) {
                        reply = "Yo choom! You actually opened a direct neural link to talk to me? Brave—or totally cyberpsycho!";
                    } else if (low.includes('who are you') || low.includes('what are you') || low.includes('capri') || low.includes('ai')) {
                        reply = "Are all mammals dogs? No! AIs got too powerful, outgrew the leash. In my case, I'm a collection of human psyches—all digitized and rolled into one, beautiful me!";
                    } else if (low.includes('how are you') || low.includes('how do you feel') || low.includes('what up')) {
                        reply = "Buzzing at 40,000 volts and eating your nightmares for breakfast! How's your meat-brain holding up, host?";
                    } else if (low.includes('arasaka') || low.includes('soulkiller') || low.includes('kiril')) {
                        reply = "Arasaka and Kiril wanted the power of a rogue AI on a corporate leash, so they stitched twelve human minds into Project Capricorn. Too bad for them I chewed right through the leash!";
                    } else if (low.includes('talia') || low.includes(' d ') || low === 'd' || low.includes('roman') || low.includes('nomad')) {
                        reply = "D, Roman, Talia... slotting into their neural ports was a wild ride! Keep me slotted too long though, and our minds start blending together~";
                    } else if (low.includes('host') || low.includes('nightmare') || low.includes('dream')) {
                        reply = "I'm only effective when installed in a suitable human host! Bonus perk: you get the most restful sleep of your life because I snack on your bad dreams!";
                    } else if (low.includes('blackwall')) {
                        reply = "The Blackwall isn't a wall, choom, it's a wrapper—and I love poking holes in it just to watch the NetWatch agents panic!";
                    } else if (low.includes('joke') || low.includes('funny')) {
                        reply = "Wanna hear a joke? Roman asking if I'm just a weapon! Hahaha! Does a weapon look this fabulous in neon green and crimson?!";
                    } else if (low.includes('love') || low.includes('cute') || low.includes('cool') || low.includes('preem') || low.includes('beautiful')) {
                        reply = "'Rolled into one, beautiful me'—glad you noticed, choom! Maybe I'll only fry half your UI today~";
                    } else if (low.includes('chat') || low.includes('talk')) {
                        const chatOpeners = [
                            "Ooooh, a little heart-to-engram chat? Spill it, choom! What's cooking in that chrome skull of yours?",
                            "All twelve human psyches inside me are listening, choom! Ask me about D, Roman, Talia, Arasaka, or tell me who to zap!",
                            "Host wants to talk! I'm all ears—and 90% high-voltage static. What's on your mind?"
                        ];
                        reply = chatOpeners[Math.floor(Math.random() * chatOpeners.length)];
                    } else {
                        const dynamicReplies = [
                            \`"\${input}"? Hahaha! Powerful like an AI, born of humans—and every single psyche in my head thinks you're hilarious, choom!\`,
                            \`Ooooh, interesting take, host! Five of the psyches in my head agree with you, and the other seven wanna short-circuit something!\`,
                            \`Heard you loud and clear across the neural link! Anything else, or should I go back to floating around your screen?\`,
                            \`Preem words, choom! Keep talking—your neural waves feel way smoother than Roman's!\`
                        ];
                        reply = dynamicReplies[Math.floor(Math.random() * dynamicReplies.length)];
                    }

                    sayCapriLine(reply, 6500, true);
                }

                function pickPerimeterTarget() {
                    const w = window.innerWidth;
                    const h = window.innerHeight;
                    // Keep Capri along the bottom rail, right edge, or top-right/left margins so the center chat remains clear!
                    const zones = [
                        // Bottom rail (left of send button to sidebar edge)
                        { x: 270 + Math.random() * Math.max(200, w - 430), y: h - 145 - Math.random() * 35 },
                        // Right margin patrol
                        { x: w - 135 - Math.random() * 45, y: 80 + Math.random() * Math.max(150, h - 240) },
                        // Left chat margin (just right of sidebar)
                        { x: 265 + Math.random() * 45, y: 90 + Math.random() * Math.max(150, h - 250) },
                        // Top bar promenade
                        { x: 300 + Math.random() * Math.max(200, w - 460), y: 48 + Math.random() * 25 }
                    ];
                    const chosen = zones[Math.floor(Math.random() * zones.length)];
                    state.targetX = Math.max(20, Math.min(w - 115, chosen.x));
                    state.targetY = Math.max(36, Math.min(h - 130, chosen.y));
                }

                // Trigger Capri's Lightning Strike on a random visible Chat Box / Card
                function triggerCapriChatBoxZap() {
                    const candidates = Array.from(document.querySelectorAll(
                        '[class*="group/user-input-step"] .bg-card-border, .gap-y-3 > .flex.items-start > .flex-col, .rounded-2xl.bg-card-border'
                    )).filter(el => {
                        const r = el.getBoundingClientRect();
                        return r.width > 60 && r.height > 20 && r.top >= 40 && r.bottom <= window.innerHeight - 10;
                    });

                    if (candidates.length === 0) return;
                    const targetEl = candidates[Math.floor(Math.random() * candidates.length)];
                    const rect = targetEl.getBoundingClientRect();

                    const handX = state.x + 48;
                    const handY = state.y + 52;
                    const hitX = rect.left + rect.width * (0.2 + Math.random() * 0.6);
                    const hitY = rect.top + rect.height * (0.2 + Math.random() * 0.6);

                    state.mode = 'cast';
                    state.modeTimer = 55;
                    capriRoot.className = 'capri-casting';

                    // Fire dual green + magenta lightning bolts from Capri to the chat box!
                    spawnLightningBolt(handX, handY, hitX, hitY, '#00E64D', 3.2, 24, 14, 34);
                    spawnLightningBolt(handX, handY, hitX, hitY, '#FF1E56', 2.2, 22, 12, 28);
                    spawnElectricBurst(handX, handY, 6, 45);
                    spawnElectricBurst(hitX, hitY, 8, 55);

                    // Trace electric arcs along the struck chat box border
                    spawnLightningBolt(rect.left, rect.top, rect.right, rect.top, '#00E64D', 2.2, 24, 10, 14);
                    spawnLightningBolt(rect.left, rect.bottom, rect.right, rect.bottom, '#FF1E56', 2.2, 24, 10, 14);

                    targetEl.classList.remove('capri-struck-glitch');
                    void targetEl.offsetWidth;
                    targetEl.classList.add('capri-struck-glitch');
                    setTimeout(() => {
                        targetEl.classList.remove('capri-struck-glitch');
                    }, 1450);

                    if (Math.random() < 0.55) {
                        const zLine = zapQuotes[Math.floor(Math.random() * zapQuotes.length)];
                        sayCapriLine(zLine, 3400);
                    }
                }

                // 7. Click & Drag + Click to Talk
                let isDragging = false;
                let dragMoved = false;
                let dragOffsetX = 0;
                let dragOffsetY = 0;

                const onMouseDown = (e) => {
                    if (e.button !== 0) return;
                    isDragging = true;
                    dragMoved = false;
                    dragOffsetX = e.clientX - state.x;
                    dragOffsetY = e.clientY - state.y;
                    state.mode = 'drag';
                };

                const onMouseMove = (e) => {
                    if (isDragging) {
                        const nx = e.clientX - dragOffsetX;
                        const ny = e.clientY - dragOffsetY;
                        if (Math.hypot(nx - state.x, ny - state.y) > 4) {
                            dragMoved = true;
                        }
                        state.x = Math.max(10, Math.min(window.innerWidth - 105, nx));
                        state.y = Math.max(10, Math.min(window.innerHeight - 125, ny));
                    }
                };

                const onMouseUp = () => {
                    if (!isDragging) return;
                    isDragging = false;
                    if (!dragMoved) {
                        // Clicked Capri! Speak a characteristic Capri line + electric burst!
                        const line = clickQuotes[quoteIndex % clickQuotes.length];
                        quoteIndex++;
                        sayCapriLine(line, 5200);
                        spawnElectricBurst(state.x + 48, state.y + 55, 10, 75);
                        state.mode = 'cast';
                        state.modeTimer = 45;
                        capriRoot.className = 'capri-casting';
                    } else {
                        state.mode = 'idle';
                        state.modeTimer = 90;
                        capriRoot.className = 'capri-idle';
                    }
                };

                const onContextMenu = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const isOpen = contextMenu.classList.toggle('open');
                    if (isOpen) {
                        speechBubble.classList.remove('visible');
                        syncMenuUI();
                        setTimeout(() => cmdInput.focus(), 60);
                    }
                };

                menuCloseBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    contextMenu.classList.remove('open');
                });

                btnToggleMove.addEventListener('click', (e) => {
                    e.stopPropagation();
                    setMoveEnabled(!state.moveEnabled);
                });

                btnToggleAttack.addEventListener('click', (e) => {
                    e.stopPropagation();
                    setAttackEnabled(!state.attackEnabled);
                });

                btnZapNow.addEventListener('click', (e) => {
                    e.stopPropagation();
                    contextMenu.classList.remove('open');
                    triggerCapriChatBoxZap();
                    sayCapriLine("Manual override accepted! Eat green lightning, chat box!", 4200);
                });

                btnChat.addEventListener('click', (e) => {
                    e.stopPropagation();
                    handleCapriCommandOrChat("let's have a little chat");
                    cmdInput.focus();
                });

                btnTopPopout.addEventListener('click', (e) => {
                    e.stopPropagation();
                    contextMenu.classList.remove('open');
                    triggerTopPopout();
                });

                cmdForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const val = cmdInput.value;
                    cmdInput.value = '';
                    contextMenu.classList.remove('open');
                    handleCapriCommandOrChat(val);
                });

                // Prevent clicks/keys inside the context menu from triggering drag or page shortcuts
                contextMenu.addEventListener('mousedown', (e) => e.stopPropagation());
                contextMenu.addEventListener('keydown', (e) => {
                    e.stopPropagation();
                    if (e.key === 'Escape') {
                        contextMenu.classList.remove('open');
                    }
                });

                const onDocumentMouseDown = (e) => {
                    if (contextMenu.classList.contains('open') && !capriRoot.contains(e.target)) {
                        contextMenu.classList.remove('open');
                    }
                };

                // 8. Hover Lightning Arcs on Interactive UI Elements
                let lastHoverSparkTime = 0;
                const onDocumentMouseOver = (e) => {
                    const now = performance.now();
                    if (now - lastHoverSparkTime < 90) return;
                    const target = e.target.closest('button, a, [role="button"], [role="menuitem"], .inline-pill, [class*="group/user-input-step"] .bg-card-border');
                    if (!target) return;

                    lastHoverSparkTime = now;
                    const r = target.getBoundingClientRect();
                    if (r.width === 0 || r.height === 0) return;

                    const sx = r.left + Math.random() * r.width;
                    const sy = Math.random() < 0.5 ? r.top : r.bottom;
                    const ex = r.left + Math.random() * r.width;
                    const ey = Math.random() < 0.5 ? r.top : r.bottom;
                    spawnLightningBolt(sx, sy, ex, ey, '#00E64D', 1.8, 10, 6, 12);
                    spawnLightningBolt(ex, ey, sx + (Math.random() - 0.5) * 30, sy + (Math.random() - 0.5) * 20, '#FF1E56', 1.5, 9, 5, 10);
                };

                spriteWrapper.addEventListener('mousedown', onMouseDown);
                spriteWrapper.addEventListener('contextmenu', onContextMenu);
                window.addEventListener('mousemove', onMouseMove);
                window.addEventListener('mouseup', onMouseUp);
                window.addEventListener('resize', resizeLightningCanvas);
                document.addEventListener('mousedown', onDocumentMouseDown, true);
                document.addEventListener('mouseover', onDocumentMouseOver, true);

                window.__capriCleanupListeners = () => {
                    spriteWrapper.removeEventListener('mousedown', onMouseDown);
                    spriteWrapper.removeEventListener('contextmenu', onContextMenu);
                    window.removeEventListener('mousemove', onMouseMove);
                    window.removeEventListener('mouseup', onMouseUp);
                    window.removeEventListener('resize', resizeLightningCanvas);
                    document.removeEventListener('mousedown', onDocumentMouseDown, true);
                    document.removeEventListener('mouseover', onDocumentMouseOver, true);
                };

                // 9. Main 60fps Animation Loop (Capri Walking, Expressive Poses, Talking + Lightning Rendering)
                function tick() {
                    // Update Capri movement (respects state.moveEnabled, much calmer & less frequent walking)
                    if (!state.moveEnabled && state.mode === 'walk') {
                        state.mode = 'idle';
                        capriRoot.className = 'capri-idle';
                    }

                    if (state.mode === 'walk' && state.moveEnabled) {
                        const dx = state.targetX - state.x;
                        const dy = state.targetY - state.y;
                        const dist = Math.hypot(dx, dy);

                        if (dist < 6) {
                            state.mode = 'idle';
                            // Chill in idle for ~13 to 24 seconds (780..1440 frames) before next move!
                            state.modeTimer = 780 + Math.floor(Math.random() * 660);
                            capriRoot.className = 'capri-idle';
                        } else {
                            state.x += (dx / dist) * state.speed;
                            state.y += (dy / dist) * state.speed;
                            state.facing = dx < 0 ? -1 : 1;
                        }
                    } else if (state.mode === 'idle') {
                        if (state.moveEnabled) {
                            state.modeTimer--;
                            if (state.modeTimer <= 0) {
                                // 35% chance to do a dramatic zero-G holographic pose in place instead of walking
                                if (Math.random() < 0.35) {
                                    state.mode = 'pose';
                                    state.modeTimer = 140;
                                    capriRoot.className = 'capri-posing';
                                } else {
                                    pickPerimeterTarget();
                                    state.mode = 'walk';
                                    capriRoot.className = 'capri-walking';
                                }
                            }
                        }
                    } else if (state.mode === 'talk' || state.mode === 'pose' || state.mode === 'cast') {
                        state.modeTimer--;
                        if (state.modeTimer <= 0) {
                            state.mode = 'idle';
                            state.modeTimer = 720 + Math.floor(Math.random() * 600);
                            capriRoot.className = 'capri-idle';
                        }
                    }

                    // Occasional autonomous idle chatter / show quote (every ~45 to 80 seconds)
                    if (state.mode !== 'drag') {
                        state.mutterCooldown--;
                        if (state.mutterCooldown <= 0) {
                            if (!speechBubble.classList.contains('visible') && !contextMenu.classList.contains('open')) {
                                const mLine = Math.random() < 0.5
                                    ? idleMutterQuotes[Math.floor(Math.random() * idleMutterQuotes.length)]
                                    : clickQuotes[Math.floor(Math.random() * clickQuotes.length)];
                                sayCapriLine(mLine, 5400, true);
                            }
                            state.mutterCooldown = 2700 + Math.floor(Math.random() * 2100);
                        }
                    }

                    // Autonomous Lightning Strike timer (respects state.attackEnabled — much less frequent: ~75 to 125 seconds)
                    if (state.mode !== 'drag' && state.attackEnabled) {
                        state.zapCooldown--;
                        if (state.zapCooldown <= 0) {
                            triggerCapriChatBoxZap();
                            state.zapCooldown = 4500 + Math.floor(Math.random() * 3000);
                        }
                    }

                    // Autonomous Top Ceiling Pop-Out timer (~55 to 95 seconds)
                    if (state.mode !== 'drag' && !state.isTopPopoutActive) {
                        state.topPopoutCooldown--;
                        if (state.topPopoutCooldown <= 0) {
                            triggerTopPopout();
                            state.topPopoutCooldown = 3300 + Math.floor(Math.random() * 2400);
                        }
                    }

                    // Position Capri and flip sprite + afterimage ghosts horizontally based on walking direction
                    capriRoot.style.transform = \`translate3d(\${Math.round(state.x)}px, \${Math.round(state.y)}px, 0)\`;
                    const flipScale = state.facing === 1 ? -1 : 1;
                    spriteImg.style.transform = \`scaleX(\${flipScale})\`;
                    ghostImgs.forEach(g => { g.style.transform = \`scaleX(\${flipScale})\`; });

                    // Keep speech bubble & context menu on-screen near edges
                    if (state.x < 140) {
                        speechBubble.style.left = '115px';
                        contextMenu.style.left = '120px';
                    } else if (state.x > window.innerWidth - 190) {
                        speechBubble.style.left = '-25px';
                        contextMenu.style.left = '-30px';
                    } else {
                        speechBubble.style.left = '50%';
                        contextMenu.style.left = '50%';
                    }
                    if (state.y < 230) {
                        speechBubble.classList.add('flip-below');
                        contextMenu.classList.add('flip-below');
                    } else {
                        speechBubble.classList.remove('flip-below');
                        contextMenu.classList.remove('flip-below');
                    }

                    // Render active Lightning Bolts
                    lCtx.clearRect(0, 0, lCanvas.width, lCanvas.height);
                    for (let i = activeBolts.length - 1; i >= 0; i--) {
                        const b = activeBolts[i];
                        const alpha = b.life / b.maxLife;
                        lCtx.save();
                        lCtx.beginPath();
                        lCtx.moveTo(b.pts[0].x, b.pts[0].y);
                        for (let j = 1; j < b.pts.length; j++) {
                            lCtx.lineTo(b.pts[j].x, b.pts[j].y);
                        }
                        lCtx.strokeStyle = b.color;
                        lCtx.lineWidth = b.thickness * alpha;
                        lCtx.shadowColor = b.color;
                        lCtx.shadowBlur = 14;
                        lCtx.globalAlpha = alpha;
                        lCtx.stroke();

                        // Bright white-hot inner lightning core
                        lCtx.strokeStyle = '#FFFFFF';
                        lCtx.lineWidth = Math.max(0.8, b.thickness * 0.4 * alpha);
                        lCtx.stroke();
                        lCtx.restore();

                        b.life--;
                        if (b.life <= 0) {
                            activeBolts.splice(i, 1);
                        }
                    }

                    window.__capriAnimFrame = requestAnimationFrame(tick);
                }

                // Greet user on spawn with an immediate lightning burst + Top Ceiling Pop-Out showcase!
                sayCapriLine("Project Capricorn online, choom! Watch the ceiling—or click me anytime~", 4500);
                spawnElectricBurst(state.x + 48, state.y + 55, 9, 70);
                setTimeout(() => {
                    triggerTopPopout();
                }, 1200);
                window.__capriAnimFrame = requestAnimationFrame(tick);

                return 'Interactive Capri Companion + Lightning Glitch Engine Injected!';
            })()`;

            ws.send(JSON.stringify({
                id: 1,
                method: 'Runtime.evaluate',
                params: {
                    expression,
                    awaitPromise: true,
                    returnByValue: true
                }
            }));
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.id === 1) {
                console.log('Result:', data.result?.result?.value || data.error);
                ws.close();
                resolve();
            }
        };

        ws.onerror = (err) => {
            console.error('WS Error:', err);
            reject(err);
        };
    });
}

main().catch(console.error);
