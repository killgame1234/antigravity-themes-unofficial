const fs = require('fs');
const path = require('path');

const LOCAL_VIDEO_PATH = path.join(__dirname, 'moonlit_lotus_skiff_bg.mp4');
const FALLBACK_VIDEO_PATH = 'C:\\Users\\ngole\\Downloads\\m2-res_1080p.mp4';
const VIDEO_PATH = fs.existsSync(LOCAL_VIDEO_PATH) ? LOCAL_VIDEO_PATH : FALLBACK_VIDEO_PATH;

async function main() {
    if (!fs.existsSync(VIDEO_PATH)) {
        console.error('Video file not found at:', VIDEO_PATH);
        process.exit(1);
    }

    // Read video as base64
    const videoBuffer = fs.readFileSync(VIDEO_PATH);
    const videoBase64 = videoBuffer.toString('base64');
    console.log('[*] Loaded Moonlit Lotus Skiff video bytes:', videoBuffer.length);

    // Find active DevTools port
    const appData = process.env.APPDATA || 'C:\\Users\\ngole\\AppData\\Roaming';
    const portFile = path.join(appData, 'Antigravity', 'DevToolsActivePort');
    let port = 58215;
    if (fs.existsSync(portFile)) {
        const lines = fs.readFileSync(portFile, 'utf8').trim().split(/\r?\n/);
        if (lines[0]) port = parseInt(lines[0], 10);
    }

    console.log(`[*] Connecting to Antigravity on CDP port ${port}...`);
    const listRes = await fetch(`http://127.0.0.1:${port}/json/list`);
    const targets = await listRes.json();
    const pages = targets.filter(t => t.type === 'page');

    if (pages.length === 0) {
        console.error('[-] No active Antigravity window found');
        process.exit(1);
    }

    for (const page of pages) {
        console.log(`[*] Injecting into window: ${page.title || 'Antigravity'}`);
        await injectIntoPage(page.webSocketDebuggerUrl, videoBase64);
    }
    console.log('[+] Moonlit Lotus Skiff Theme successfully injected!');
}

function injectIntoPage(wsUrl, videoBase64) {
    return new Promise((resolve, reject) => {
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
            const expression = `(function() {
                // 0. Clean up previous theme components
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
                if (window.__moonlitAnimFrame) {
                    cancelAnimationFrame(window.__moonlitAnimFrame);
                    window.__moonlitAnimFrame = null;
                }
                if (window.__capriCleanupListeners) {
                    window.__capriCleanupListeners();
                    window.__capriCleanupListeners = null;
                }
                if (window.__moonlitCleanupListeners) {
                    window.__moonlitCleanupListeners();
                    window.__moonlitCleanupListeners = null;
                }
                if (window.__prescriptCleanupListeners) {
                    window.__prescriptCleanupListeners();
                    window.__prescriptCleanupListeners = null;
                }
                if (window.__eldritchHoverEyeAnimFrame) {
                    cancelAnimationFrame(window.__eldritchHoverEyeAnimFrame);
                    window.__eldritchHoverEyeAnimFrame = null;
                }
                if (window.__eldritchHoverCleanup) {
                    window.__eldritchHoverCleanup();
                    window.__eldritchHoverCleanup = null;
                }

                [
                    'eldritch-hover-eye-popup',
                    'eldritch-ambient-rifts-canvas',
                    'eldritch-bg-video',
                    'eldritch-vignette-overlay',
                    'eldritch-rift-header',
                    'prescript-fate-canvas',
                    'prescript-hand-bg',
                    'prescript-vignette-overlay',
                    'prescript-header-insignia',
                    'capri-companion-root',
                    'capri-lightning-canvas',
                    'capri-top-popout',
                    'moonlit-bg-video',
                    'moonlit-vignette-overlay',
                    'moonlit-particles-canvas'
                ].forEach(id => {
                    const el = document.getElementById(id);
                    if (el) {
                        if (el.dataset && el.dataset.oldBlobUrl) {
                            try { URL.revokeObjectURL(el.dataset.oldBlobUrl); } catch (e) {}
                        }
                        el.remove();
                    }
                });
                document.querySelectorAll('.eldritch-stop-eye-svg, .prescript-stop-seal-svg').forEach(el => el.remove());

                // 1. Create or update Video Wallpaper via Blob URL
                const b64 = "${videoBase64}";
                const binStr = atob(b64);
                const len = binStr.length;
                const bytes = new Uint8Array(len);
                for (let i = 0; i < len; i++) {
                    bytes[i] = binStr.charCodeAt(i);
                }
                const blob = new Blob([bytes], { type: 'video/mp4' });
                const blobUrl = URL.createObjectURL(blob);

                let video = document.getElementById('moonlit-bg-video');
                if (!video) {
                    video = document.createElement('video');
                    video.id = 'moonlit-bg-video';
                    document.body.prepend(video);
                }
                video.muted = true;
                video.defaultMuted = true;
                video.autoplay = true;
                video.loop = true;
                video.playsInline = true;
                video.setAttribute('muted', '');
                video.setAttribute('autoplay', '');
                video.setAttribute('loop', '');
                video.setAttribute('playsinline', '');
                if (video.dataset.oldBlobUrl) {
                    try { URL.revokeObjectURL(video.dataset.oldBlobUrl); } catch (e) {}
                }
                video.dataset.oldBlobUrl = blobUrl;
                video.src = blobUrl;
                video.oncanplay = () => {
                    video.muted = true;
                    video.play().catch(() => {});
                };
                video.play().catch(() => {});

                // 2. Vignette & Atmosphere Overlay
                let vignette = document.getElementById('moonlit-vignette-overlay');
                if (!vignette) {
                    vignette = document.createElement('div');
                    vignette.id = 'moonlit-vignette-overlay';
                    document.body.prepend(vignette);
                }

                // 3. Ambient Floating Motes & Luminescent Butterflies Canvas
                let canvas = document.getElementById('moonlit-particles-canvas');
                if (!canvas) {
                    canvas = document.createElement('canvas');
                    canvas.id = 'moonlit-particles-canvas';
                    document.body.prepend(canvas);
                }
                const ctx = canvas.getContext('2d');

                function resizeCanvas() {
                    canvas.width = window.innerWidth;
                    canvas.height = window.innerHeight;
                }
                resizeCanvas();
                window.addEventListener('resize', resizeCanvas);
                window.__moonlitCleanupListeners = () => {
                    window.removeEventListener('resize', resizeCanvas);
                };

                // Particle systems: ethereal cyan fireflies and glowing moonlight specks
                const particles = [];
                for (let i = 0; i < 45; i++) {
                    const isCyan = Math.random() > 0.35;
                    particles.push({
                        x: Math.random() * window.innerWidth,
                        y: Math.random() * window.innerHeight,
                        radius: Math.random() * 2.2 + 0.6,
                        isCyan: isCyan,
                        colorPrefix: isCyan ? 'rgba(56, 189, 248, ' : 'rgba(251, 191, 36, ',
                        alpha: Math.random() * 0.7 + 0.2,
                        speedY: -(Math.random() * 0.45 + 0.15),
                        speedX: (Math.random() - 0.5) * 0.35,
                        phase: Math.random() * Math.PI * 2,
                        glowPulse: Math.random() * 0.03 + 0.015
                    });
                }

                function drawParticles() {
                    if (document.hidden) {
                        window.__moonlitAnimFrame = requestAnimationFrame(drawParticles);
                        return;
                    }

                    ctx.clearRect(0, 0, canvas.width, canvas.height);

                    // Batch 1: Cyan particles
                    ctx.shadowColor = '#38bdf8';
                    ctx.shadowBlur = 8;
                    for (const p of particles) {
                        if (!p.isCyan) continue;
                        p.y += p.speedY;
                        p.x += p.speedX;
                        p.phase += p.glowPulse;

                        if (p.y < -10) {
                            p.y = canvas.height + 10;
                            p.x = Math.random() * canvas.width;
                        }
                        if (p.x < -10) p.x = canvas.width + 10;
                        if (p.x > canvas.width + 10) p.x = -10;

                        const curAlpha = Math.max(0.05, Math.min(1, p.alpha + Math.sin(p.phase) * 0.35));
                        ctx.beginPath();
                        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                        ctx.fillStyle = p.colorPrefix + curAlpha + ')';
                        ctx.fill();
                    }

                    // Batch 2: Amber particles
                    ctx.shadowColor = '#fbbf24';
                    ctx.shadowBlur = 8;
                    for (const p of particles) {
                        if (p.isCyan) continue;
                        p.y += p.speedY;
                        p.x += p.speedX;
                        p.phase += p.glowPulse;

                        if (p.y < -10) {
                            p.y = canvas.height + 10;
                            p.x = Math.random() * canvas.width;
                        }
                        if (p.x < -10) p.x = canvas.width + 10;
                        if (p.x > canvas.width + 10) p.x = -10;

                        const curAlpha = Math.max(0.05, Math.min(1, p.alpha + Math.sin(p.phase) * 0.35));
                        ctx.beginPath();
                        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                        ctx.fillStyle = p.colorPrefix + curAlpha + ')';
                        ctx.fill();
                    }
                    ctx.shadowBlur = 0;

                    window.__moonlitAnimFrame = requestAnimationFrame(drawParticles);
                }
                window.__moonlitAnimFrame = requestAnimationFrame(drawParticles);

                // 4. Custom CSS Injection
                let style = document.getElementById('custom-antigravity-theme');
                if (!style) {
                    style = document.createElement('style');
                    style.id = 'custom-antigravity-theme';
                    document.head.appendChild(style);
                }

                style.textContent = \`
                    :root, .dark, .theme-dark, body {
                        --background: transparent !important;
                        --sidebar: rgba(8, 14, 26, 0.72) !important;
                        --sidebar-secondary: rgba(56, 189, 248, 0.16) !important;
                        --sidebar-muted: rgba(56, 189, 248, 0.08) !important;
                        --card: rgba(10, 18, 34, 0.78) !important;
                        --card-border: rgba(56, 189, 248, 0.38) !important;
                        --border: rgba(56, 189, 248, 0.22) !important;
                        --muted: rgba(16, 26, 46, 0.72) !important;
                        --foreground: #F1F5F9 !important;
                        --secondary-foreground: #94A3B8 !important;
                        --cyan-glow: #38bdf8;
                        --lantern-gold: #fbbf24;
                        --deep-twilight: #080d1a;
                    }

                    /* Base Body & Video Wallpaper Setup */
                    html, body {
                        background-color: #060913 !important;
                        color: #F1F5F9 !important;
                    }

                    #moonlit-bg-video {
                        position: fixed !important;
                        top: 0 !important;
                        left: 0 !important;
                        width: 100vw !important;
                        height: 100vh !important;
                        object-fit: cover !important;
                        z-index: 0 !important;
                        pointer-events: none !important;
                        opacity: 0.65 !important;
                        filter: contrast(1.1) saturate(1.15) brightness(0.85) !important;
                    }

                    #moonlit-vignette-overlay {
                        position: fixed !important;
                        top: 0 !important;
                        left: 0 !important;
                        width: 100vw !important;
                        height: 100vh !important;
                        z-index: 0 !important;
                        pointer-events: none !important;
                        background:
                            radial-gradient(circle at 50% 45%, rgba(8, 13, 26, 0.35) 0%, rgba(6, 10, 20, 0.7) 65%, rgba(4, 7, 15, 0.94) 100%),
                            linear-gradient(180deg, rgba(6, 10, 22, 0.8) 0%, transparent 18%, transparent 80%, rgba(4, 7, 16, 0.92) 100%) !important;
                    }

                    #moonlit-particles-canvas {
                        position: fixed !important;
                        top: 0 !important;
                        left: 0 !important;
                        width: 100vw !important;
                        height: 100vh !important;
                        z-index: 0 !important;
                        pointer-events: none !important;
                        contain: strict !important;
                        will-change: contents !important;
                    }

                    #root {
                        position: relative !important;
                        z-index: 1 !important;
                        background: transparent !important;
                    }

                    .bg-background {
                        background-color: transparent !important;
                    }

                    /* ==========================================================================
                       SIDEBARS & NAVIGATION
                       ========================================================================== */
                    .bg-sidebar {
                        background-color: rgba(6, 11, 22, 0.72) !important;
                        backdrop-filter: blur(16px) saturate(140%) !important;
                    }

                    aside, [class*="bg-sidebar"]:not(.overflow-y-auto *) {
                        border-color: rgba(56, 189, 248, 0.18) !important;
                    }

                    .bg-sidebar-secondary,
                    aside a:hover,
                    button[data-testid='automations-button']:hover {
                        background: linear-gradient(90deg, rgba(56, 189, 248, 0.18) 0%, rgba(14, 30, 56, 0.32) 100%) !important;
                        border: 1px solid rgba(56, 189, 248, 0.45) !important;
                        box-shadow: 0 0 16px rgba(56, 189, 248, 0.22), inset 0 0 10px rgba(56, 189, 248, 0.1) !important;
                        color: #FFFFFF !important;
                    }

                    /* Sticky bleed fix */
                    .md-sticky-message-bleed {
                        background: transparent !important;
                    }
                    .md-sticky-message-bleed::after {
                        display: none !important;
                    }

                    /* ==========================================================================
                       CHAT BUBBLES: USER & ASSISTANT
                       ========================================================================== */
                    /* User Bubble: Translucent Midnight Blue with Celestial Cyan Aura */
                    [class*="group/user-input-step"] .bg-card-border {
                        background: linear-gradient(135deg, #38bdf8 0%, #0284c7 50%, #4deeea 100%) !important;
                        padding: 1px !important;
                        border-radius: 14px !important;
                        box-shadow:
                            0 0 18px rgba(56, 189, 248, 0.35),
                            0 4px 20px rgba(0, 0, 0, 0.75) !important;
                        transition: all 0.25s ease !important;
                    }

                    [class*="group/user-input-step"]:hover .bg-card-border {
                        box-shadow:
                            0 0 26px rgba(56, 189, 248, 0.55),
                            0 6px 26px rgba(0, 0, 0, 0.85) !important;
                    }

                    [class*="group/user-input-step"] .bg-card {
                        background: linear-gradient(135deg, rgba(14, 28, 50, 0.88) 0%, rgba(8, 16, 32, 0.94) 100%) !important;
                        backdrop-filter: blur(18px) !important;
                        border-radius: 13px !important;
                        color: #F8FAFC !important;
                        box-shadow: inset 0 0 14px rgba(56, 189, 248, 0.14) !important;
                    }

                    /* Assistant Bubble: Deep Indigo Night with Moonbeam & Amber accents */
                    .gap-y-3 > .flex.items-start:not(:has([class*="group/user-input-step"])) > .flex-col {
                        background: linear-gradient(160deg, rgba(10, 18, 34, 0.82) 0%, rgba(6, 11, 22, 0.9) 100%) !important;
                        backdrop-filter: blur(18px) saturate(135%) !important;
                        border: 1px solid rgba(56, 189, 248, 0.3) !important;
                        border-radius: 14px !important;
                        padding: 14px 18px !important;
                        margin-top: 4px !important;
                        margin-bottom: 4px !important;
                        box-shadow:
                            0 10px 30px rgba(0, 0, 0, 0.85),
                            0 0 16px rgba(56, 189, 248, 0.12),
                            inset 0 1px 0 rgba(251, 191, 36, 0.32) !important;
                        transition: border-color 0.25s ease, box-shadow 0.25s ease !important;
                    }

                    .gap-y-3 > .flex.items-start:not(:has([class*="group/user-input-step"])) > .flex-col:hover {
                        border-color: rgba(56, 189, 248, 0.55) !important;
                        box-shadow:
                            0 12px 34px rgba(0, 0, 0, 0.9),
                            0 0 22px rgba(56, 189, 248, 0.22),
                            inset 0 1px 0 rgba(251, 191, 36, 0.5) !important;
                    }

                    /* ==========================================================================
                       INPUT COMPOSER BOX
                       ========================================================================== */
                    .rounded-2xl.bg-card-border {
                        background: linear-gradient(90deg, #38bdf8 0%, #fbbf24 50%, #4deeea 100%) !important;
                        padding: 1px !important;
                        box-shadow:
                            0 0 18px rgba(56, 189, 248, 0.28),
                            0 8px 30px rgba(0, 0, 0, 0.85) !important;
                        transition: all 0.25s ease !important;
                    }

                    .rounded-2xl.bg-card-border:focus-within {
                        box-shadow:
                            0 0 28px rgba(56, 189, 248, 0.55),
                            0 0 12px rgba(251, 191, 36, 0.35),
                            0 10px 38px rgba(0, 0, 0, 0.92) !important;
                    }

                    .rounded-2xl.bg-card-border > .bg-card {
                        background: rgba(8, 14, 26, 0.88) !important;
                        backdrop-filter: blur(20px) !important;
                        box-shadow: inset 0 0 16px rgba(56, 189, 248, 0.1) !important;
                    }

                    /* Send Button */
                    button[data-tooltip-id="input-send-button-send-tooltip"] {
                        background: linear-gradient(135deg, #38bdf8 0%, #0284c7 100%) !important;
                        color: #FFFFFF !important;
                        box-shadow: 0 0 14px rgba(56, 189, 248, 0.5) !important;
                        transition: all 0.2s ease !important;
                    }

                    button[data-tooltip-id="input-send-button-send-tooltip"]:hover {
                        transform: scale(1.06) !important;
                        box-shadow: 0 0 20px rgba(56, 189, 248, 0.8) !important;
                    }

                    /* Stop / Cancel Button: Pulsing Moonlit Lantern Amber */
                    button[data-tooltip-id="input-send-button-cancel-tooltip"],
                    button[aria-label^="Cancel ("],
                    button[aria-label="Stop execution"] {
                        border-radius: 9999px !important;
                        background: radial-gradient(circle at 50% 50%, #2b1d06 0%, #140d02 65%, #080d1a 100%) !important;
                        border: 1.5px solid #fbbf24 !important;
                        box-shadow: 0 0 14px rgba(251, 191, 36, 0.6) !important;
                        transition: all 0.2s ease !important;
                    }

                    button[data-tooltip-id="input-send-button-cancel-tooltip"]:hover,
                    button[aria-label^="Cancel ("]:hover,
                    button[aria-label="Stop execution"]:hover {
                        transform: scale(1.12) !important;
                        border-color: #fef08a !important;
                        box-shadow: 0 0 22px rgba(251, 191, 36, 0.9) !important;
                    }

                    /* ==========================================================================
                       SETTINGS MODAL, DIALOGS, DROPDOWNS (HIGH READABILITY)
                       ========================================================================== */
                    .settings-modal-backdrop {
                        background-color: rgba(4, 7, 14, 0.84) !important;
                        backdrop-filter: blur(12px) !important;
                    }

                    .settings-modal-container,
                    .settings-modal-container .bg-background,
                    [role="dialog"],
                    [role="menu"],
                    [role="listbox"] {
                        background-color: rgba(8, 14, 25, 0.97) !important;
                        backdrop-filter: blur(24px) saturate(150%) !important;
                    }

                    .settings-modal-container {
                        border: 1px solid rgba(56, 189, 248, 0.45) !important;
                        box-shadow:
                            0 24px 70px rgba(0, 0, 0, 0.98),
                            0 0 30px rgba(56, 189, 248, 0.22),
                            inset 0 1px 0 rgba(251, 191, 36, 0.35) !important;
                    }

                    .settings-modal-container .bg-sidebar {
                        background-color: rgba(6, 10, 20, 0.98) !important;
                        border-right: 1px solid rgba(56, 189, 248, 0.24) !important;
                    }

                    .settings-modal-container .rounded-xl.border {
                        background-color: rgba(12, 20, 36, 0.92) !important;
                        border-color: rgba(56, 189, 248, 0.3) !important;
                        box-shadow: 0 4px 18px rgba(0, 0, 0, 0.75), inset 0 0 10px rgba(56, 189, 248, 0.08) !important;
                    }

                    .settings-modal-container button {
                        background-color: rgba(16, 28, 50, 0.9) !important;
                        border: 1px solid rgba(56, 189, 248, 0.3) !important;
                        color: #F1F5F9 !important;
                    }

                    .settings-modal-container button:hover {
                        background-color: rgba(56, 189, 248, 0.2) !important;
                        border-color: #38bdf8 !important;
                    }

                    /* Scrollbars */
                    ::-webkit-scrollbar {
                        width: 6px !important;
                        height: 6px !important;
                    }
                    ::-webkit-scrollbar-track {
                        background: transparent !important;
                    }
                    ::-webkit-scrollbar-thumb {
                        background: rgba(56, 189, 248, 0.35) !important;
                        border-radius: 9999px !important;
                    }
                    ::-webkit-scrollbar-thumb:hover {
                        background: rgba(56, 189, 248, 0.75) !important;
                    }
                \`;

                console.log('[+] Moonlit Lotus Skiff styles and background injected successfully!');
            })();`;

            ws.send(JSON.stringify({
                id: 1,
                method: 'Runtime.evaluate',
                params: {
                    expression: expression,
                    userGesture: true,
                    awaitPromise: true
                }
            }));
        };

        ws.onmessage = (msg) => {
            const data = JSON.parse(msg.data);
            if (data.id === 1) {
                if (data.result && data.result.exceptionDetails) {
                    console.error('[-] Evaluation exception:', data.result.exceptionDetails);
                } else {
                    console.log('[+] Evaluation success');
                }
                ws.close();
                resolve();
            }
        };

        ws.onerror = (err) => {
            console.error('[-] WebSocket error:', err);
            reject(err);
        };
    });
}

main().catch(err => {
    console.error('[-] Execution failed:', err);
    process.exit(1);
});
