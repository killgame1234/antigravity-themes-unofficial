const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const THEME_DIR = __dirname;
const LOCAL_VIDEO_PATH = path.join(THEME_DIR, 'moonlit_lotus_skiff_bg.mp4');
const FALLBACK_VIDEO_PATH = 'C:\\Users\\ngole\\Downloads\\m2-res_1080p.mp4';
const VIDEO_PATH = fs.existsSync(LOCAL_VIDEO_PATH) ? LOCAL_VIDEO_PATH : FALLBACK_VIDEO_PATH;
const EMBLEM_PATH = path.join(THEME_DIR, 'moonlit_emblem.png');
const ICO_PATH = path.join(THEME_DIR, 'moonlit.ico');

// Update Windows Shortcut Icon for Taskbar
try {
    if (fs.existsSync(ICO_PATH)) {
        const escapedIco = ICO_PATH.replace(/\\/g, '\\\\');
        const psCmd = `powershell -WindowStyle Hidden -Command "$wsh = New-Object -ComObject WScript.Shell; $lnk = [System.IO.Path]::Combine($env:APPDATA, 'Microsoft\\Windows\\Start Menu\\Programs\\Antigravity.lnk'); if (Test-Path $lnk) { $s = $wsh.CreateShortcut($lnk); $s.IconLocation = '${escapedIco},0'; $s.Save() }"`;
        exec(psCmd, (err) => {
            if (err) console.log('Shortcut icon notice:', err.message);
            else console.log('[+] Windows taskbar shortcut icon updated to Moonlit Lotus emblem!');
        });
    }
} catch (e) {}

const MOONLIT_CSS = `
    :root, .dark, .theme-dark, body {
        --background: transparent !important;
        --sidebar: rgba(6, 11, 22, 0.76) !important;
        --sidebar-secondary: rgba(56, 189, 248, 0.16) !important;
        --sidebar-muted: rgba(56, 189, 248, 0.08) !important;
        --card: rgba(8, 14, 26, 0.84) !important;
        --card-border: rgba(56, 189, 248, 0.42) !important;
        --border: rgba(56, 189, 248, 0.22) !important;
        --muted: rgba(12, 22, 40, 0.76) !important;
        --foreground: #F1F5F9 !important;
        --secondary-foreground: #94A3B8 !important;
        --cyan-glow: #38bdf8;
        --cyan-bloom: #7dd3fc;
        --lantern-gold: #fbbf24;
        --deep-twilight: #060913;
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
        opacity: 0.72 !important;
        transition: opacity 0.5s ease !important;
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
            radial-gradient(circle at 65% 55%, rgba(6, 10, 20, 0.15) 0%, rgba(6, 10, 20, 0.55) 60%, rgba(4, 7, 14, 0.94) 100%),
            linear-gradient(180deg, rgba(6, 10, 22, 0.82) 0%, transparent 16%, transparent 82%, rgba(4, 7, 14, 0.95) 100%) !important;
    }

    #moonlit-particles-canvas {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        z-index: 1 !important;
        pointer-events: none !important;
        contain: strict !important;
        will-change: contents !important;
    }

    /* Floating Real-Life Blue Moon Emblem Container */
    @keyframes blue-moon-float {
        0%, 100% {
            transform: translateY(0px) scale(1);
            filter: drop-shadow(0 0 18px rgba(56, 189, 248, 0.8)) drop-shadow(0 0 36px rgba(2, 132, 199, 0.45));
        }
        50% {
            transform: translateY(-8px) scale(1.03);
            filter: drop-shadow(0 0 28px rgba(56, 189, 248, 0.98)) drop-shadow(0 0 50px rgba(2, 132, 199, 0.65));
        }
    }

    #moonlit-lotus-emblem {
        position: fixed !important;
        z-index: 2 !important;
        pointer-events: none !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        background: transparent !important;
        box-shadow: none !important;
        border: none !important;
        transition: opacity 0.4s ease, left 0.4s cubic-bezier(0.16, 1, 0.3, 1), top 0.4s cubic-bezier(0.16, 1, 0.3, 1) !important;
    }

    .moonlit-lotus-img {
        max-height: min(220px, 28vh) !important;
        max-width: min(220px, 28vw) !important;
        width: 190px !important;
        height: 190px !important;
        border-radius: 50% !important;
        object-fit: contain !important;
        animation: blue-moon-float 7s infinite ease-in-out !important;
        user-select: none !important;
        pointer-events: none !important;
    }

    /* Dynamic Moonlit Poetic Decree Caption */
    #moonlit-poem-box {
        position: fixed !important;
        z-index: 2 !important;
        pointer-events: none !important;
        max-width: min(650px, 80vw) !important;
        font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace !important;
        font-size: 13px !important;
        font-weight: 500 !important;
        line-height: 1.6 !important;
        text-align: center !important;
        letter-spacing: 0.12em !important;
        color: rgba(125, 211, 252, 0.92) !important;
        text-shadow: 0 0 12px rgba(56, 189, 248, 0.75), 0 0 20px rgba(251, 191, 36, 0.35) !important;
        transition: opacity 0.3s ease, left 0.4s cubic-bezier(0.16, 1, 0.3, 1), top 0.4s cubic-bezier(0.16, 1, 0.3, 1) !important;
    }

    /* Moonlit Top App Icon Button */
    button[data-testid="app-icon-new-conversation-button"] {
        padding: 0 4px !important;
        height: 36px !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        overflow: visible !important;
    }

    button[data-testid="app-icon-new-conversation-button"] > svg {
        display: none !important;
    }

    /* Moonlit Top App Icon (Replacing Antigravity top logo) */
    .moonlit-top-app-icon {
        width: 36px !important;
        height: 36px !important;
        object-fit: contain !important;
        filter: drop-shadow(0 0 8px rgba(56, 189, 248, 0.95)) !important;
        vertical-align: middle !important;
        cursor: pointer !important;
        transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), filter 0.2s ease !important;
    }

    .moonlit-top-app-icon:hover {
        transform: scale(1.1) rotate(3deg) !important;
        filter: drop-shadow(0 0 14px #38bdf8) drop-shadow(0 0 6px #fbbf24) !important;
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
        background-color: rgba(6, 11, 22, 0.76) !important;
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
        box-shadow: 0 0 16px rgba(56, 189, 248, 0.25), inset 0 0 10px rgba(56, 189, 248, 0.1) !important;
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
        background: linear-gradient(135deg, #38bdf8 0%, #0284c7 50%, #fbbf24 100%) !important;
        padding: 1px !important;
        border-radius: 14px !important;
        box-shadow:
            0 0 20px rgba(56, 189, 248, 0.35),
            0 4px 22px rgba(0, 0, 0, 0.78) !important;
        transition: all 0.25s ease !important;
    }

    [class*="group/user-input-step"]:hover .bg-card-border {
        box-shadow:
            0 0 28px rgba(56, 189, 248, 0.55),
            0 6px 28px rgba(0, 0, 0, 0.88) !important;
    }

    [class*="group/user-input-step"] .bg-card {
        background: linear-gradient(135deg, rgba(12, 24, 44, 0.94) 0%, rgba(6, 12, 26, 0.98) 100%) !important;
        border-radius: 13px !important;
        color: #F8FAFC !important;
        box-shadow: inset 0 0 16px rgba(56, 189, 248, 0.14) !important;
    }

    /* Assistant Bubble: Deep Indigo Night with Moonbeam & Amber accents */
    .gap-y-3 > .flex.items-start:not(:has([class*="group/user-input-step"])) > .flex-col {
        background: linear-gradient(160deg, rgba(8, 14, 28, 0.92) 0%, rgba(5, 9, 18, 0.97) 100%) !important;
        border: 1px solid rgba(56, 189, 248, 0.3) !important;
        border-radius: 14px !important;
        padding: 14px 18px !important;
        margin-top: 4px !important;
        margin-bottom: 4px !important;
        backdrop-filter: blur(16px) !important;
        box-shadow:
            0 8px 30px rgba(0, 0, 0, 0.88),
            0 0 14px rgba(56, 189, 248, 0.15),
            inset 0 1px 0 rgba(251, 191, 36, 0.32) !important;
        transition: border-color 0.25s ease, box-shadow 0.25s ease !important;
    }

    .gap-y-3 > .flex.items-start:not(:has([class*="group/user-input-step"])) > .flex-col:hover {
        border-color: rgba(56, 189, 248, 0.55) !important;
        box-shadow:
            0 12px 36px rgba(0, 0, 0, 0.92),
            0 0 22px rgba(56, 189, 248, 0.25),
            inset 0 1px 0 rgba(251, 191, 36, 0.55) !important;
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
            0 0 30px rgba(56, 189, 248, 0.55),
            0 0 14px rgba(251, 191, 36, 0.4),
            0 10px 38px rgba(0, 0, 0, 0.92) !important;
    }

    .rounded-2xl.bg-card-border > .bg-card {
        background: rgba(8, 14, 26, 0.95) !important;
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
        box-shadow: 0 0 22px rgba(56, 189, 248, 0.85) !important;
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
       SCOPED HOVER & SHIMMER
       ========================================================================== */
    .moonlit-hover-active {
        color: #7dd3fc !important;
        text-shadow: 0 0 10px rgba(56, 189, 248, 0.85), 0 0 18px rgba(251, 191, 36, 0.45) !important;
        transition: color 0.15s ease, text-shadow 0.15s ease !important;
    }

    /* Settings & Dropdown High Readability */
    .settings-modal-backdrop {
        background-color: rgba(4, 7, 14, 0.86) !important;
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
`;

async function main() {
    if (!fs.existsSync(VIDEO_PATH)) {
        console.error('Video file not found at:', VIDEO_PATH);
        process.exit(1);
    }

    const videoBuffer = fs.readFileSync(VIDEO_PATH);
    const videoBase64 = videoBuffer.toString('base64');
    console.log('[*] Loaded Moonlit video bytes:', videoBuffer.length);

    let emblemBase64 = '';
    if (fs.existsSync(EMBLEM_PATH)) {
        emblemBase64 = fs.readFileSync(EMBLEM_PATH).toString('base64');
        console.log('[*] Loaded Moonlit emblem bytes:', emblemBase64.length);
    }

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
        await injectIntoPage(page.webSocketDebuggerUrl, videoBase64, emblemBase64);
    }
    console.log('[+] Moonlit Lotus Skiff Theme successfully injected!');
}

function injectIntoPage(wsUrl, videoBase64, emblemBase64) {
    return new Promise((resolve, reject) => {
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
            const injectedCode = `(async function() {
                // =========================================================================
                // 0. CLEANUP PREVIOUS THEME TIMERS, LISTENERS, AND GLOBAL STATE
                // =========================================================================
                if (window.__moonlitState) {
                    try { if (window.__moonlitState.watchdog) clearInterval(window.__moonlitState.watchdog); } catch(e){}
                    try { if (window.__moonlitState.poemInterval) clearInterval(window.__moonlitState.poemInterval); } catch(e){}
                    try { if (window.__moonlitState.poemTimer) clearTimeout(window.__moonlitState.poemTimer); } catch(e){}
                    try { if (window.__moonlitState.animFrame) cancelAnimationFrame(window.__moonlitState.animFrame); } catch(e){}
                    try { if (window.__moonlitState.observer) window.__moonlitState.observer.disconnect(); } catch(e){}
                    try { if (window.__moonlitState.cleanupListeners) window.__moonlitState.cleanupListeners(); } catch(e){}
                    if (window.__moonlitState.activeHoverLeaf) {
                        try {
                            if (window.__moonlitState.activeHoverLeaf.__moonlitOriginalText !== undefined) {
                                window.__moonlitState.activeHoverLeaf.textContent = window.__moonlitState.activeHoverLeaf.__moonlitOriginalText;
                            }
                            window.__moonlitState.activeHoverLeaf.classList.remove('moonlit-hover-active');
                        } catch (e) {}
                    }
                }

                // Legacy theme cleanup
                try { if (window.__eldritchObserver) { window.__eldritchObserver.disconnect(); window.__eldritchObserver = null; } } catch(e){}
                try { if (window.__prescriptObserver) { window.__prescriptObserver.disconnect(); window.__prescriptObserver = null; } } catch(e){}
                try { if (window.__prescriptAnimFrame) { cancelAnimationFrame(window.__prescriptAnimFrame); window.__prescriptAnimFrame = null; } } catch(e){}
                try { if (window.__prescriptQuoteInterval) { clearInterval(window.__prescriptQuoteInterval); window.__prescriptQuoteInterval = null; } } catch(e){}
                try { if (window.__prescriptTypewriterTimer) { clearTimeout(window.__prescriptTypewriterTimer); window.__prescriptTypewriterTimer = null; } } catch(e){}
                try { if (window.__prescriptCleanupListeners) { window.__prescriptCleanupListeners(); window.__prescriptCleanupListeners = null; } } catch(e){}
                try { if (window.__capriAnimFrame) { cancelAnimationFrame(window.__capriAnimFrame); window.__capriAnimFrame = null; } } catch(e){}
                try { if (window.__capriCleanupListeners) { window.__capriCleanupListeners(); window.__capriCleanupListeners = null; } } catch(e){}
                try { if (window.__moonlitAnimFrame) { cancelAnimationFrame(window.__moonlitAnimFrame); window.__moonlitAnimFrame = null; } } catch(e){}
                try { if (window.__moonlitCleanupListeners) { window.__moonlitCleanupListeners(); window.__moonlitCleanupListeners = null; } } catch(e){}

                [
                    'eldritch-hover-eye-popup', 'eldritch-ambient-rifts-canvas', 'eldritch-bg-video',
                    'eldritch-vignette-overlay', 'eldritch-rift-header',
                    'prescript-fate-canvas', 'prescript-hand-bg', 'prescript-quote-box',
                    'prescript-vignette-overlay', 'prescript-header-insignia',
                    'capri-companion-root', 'capri-lightning-canvas', 'capri-top-popout',
                    'moonlit-bg-video', 'moonlit-vignette-overlay', 'moonlit-particles-canvas',
                    'moonlit-lotus-emblem', 'moonlit-poem-box'
                ].forEach(id => {
                    const el = document.getElementById(id);
                    if (el) {
                        if (el.dataset && el.dataset.oldBlobUrl) {
                            try { URL.revokeObjectURL(el.dataset.oldBlobUrl); } catch (e) {}
                        }
                        el.remove();
                    }
                });

                // Single global state object
                const state = {
                    animFrame: null,
                    watchdog: null,
                    poemInterval: null,
                    poemTimer: null,
                    observer: null,
                    cleanupListeners: null,
                    activeTargetContainer: null,
                    activeHoverLeaf: null,
                    lastFrameTime: performance.now(),
                    lastLayoutCheck: 0,
                    butterflies: [],
                    petals: [],
                    embers: [],
                    ripples: [],
                    sparks: []
                };
                window.__moonlitState = state;

                // =========================================================================
                // 1. VIDEO WALLPAPER & BLOBS
                // =========================================================================
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
                video.dataset.oldBlobUrl = blobUrl;
                video.src = blobUrl;
                video.oncanplay = () => {
                    video.muted = true;
                    video.play().catch(() => {});
                };
                video.play().catch(() => {});

                // =========================================================================
                // 2. VIGNETTE & EMBLEM DOM ELEMENTS
                // =========================================================================
                let vignette = document.getElementById('moonlit-vignette-overlay');
                if (!vignette) {
                    vignette = document.createElement('div');
                    vignette.id = 'moonlit-vignette-overlay';
                    document.body.prepend(vignette);
                }

                // =========================================================================
                // 2. REAL-LIFE ASTRONOMICAL BLUE MOON PHASE ENGINE
                // =========================================================================
                function getRealLifeMoonPhase(date = new Date()) {
                    // Reference astronomical new moon: Jan 11, 2024 11:57:00 UTC
                    const refNewMoon = new Date(Date.UTC(2024, 0, 11, 11, 57, 0)).getTime();
                    const synodicMonth = 29.53058867 * 24 * 60 * 60 * 1000;
                    const diff = date.getTime() - refNewMoon;
                    const cycles = (diff % synodicMonth) / synodicMonth;
                    const phase = cycles < 0 ? cycles + 1 : cycles;

                    let phaseName = '';
                    if (phase < 0.025 || phase > 0.975) phaseName = 'New Moon';
                    else if (phase < 0.22) phaseName = 'Waxing Crescent';
                    else if (phase < 0.28) phaseName = 'First Quarter';
                    else if (phase < 0.47) phaseName = 'Waxing Gibbous';
                    else if (phase < 0.53) phaseName = 'Full Moon';
                    else if (phase < 0.72) phaseName = 'Waning Gibbous';
                    else if (phase < 0.78) phaseName = 'Last Quarter';
                    else phaseName = 'Waning Crescent';

                    const illumination = Math.round(0.5 * (1 - Math.cos(phase * 2 * Math.PI)) * 100);
                    const ageDays = (phase * 29.53).toFixed(1);
                    return { phase, phaseName, illumination, ageDays };
                }

                function generateBlueMoonDataUrl(size, phase) {
                    const canvas = document.createElement('canvas');
                    canvas.width = size;
                    canvas.height = size;
                    const ctx = canvas.getContext('2d');
                    const cx = size / 2;
                    const cy = size / 2;
                    const r = size * 0.38;

                    // (a) Ambient Atmospheric Cyan Glow
                    const glow = ctx.createRadialGradient(cx, cy, r * 0.75, cx, cy, r * 1.4);
                    glow.addColorStop(0, 'rgba(56, 189, 248, 0.65)');
                    glow.addColorStop(0.45, 'rgba(2, 132, 199, 0.25)');
                    glow.addColorStop(1, 'rgba(6, 11, 22, 0)');
                    ctx.fillStyle = glow;
                    ctx.beginPath();
                    ctx.arc(cx, cy, r * 1.4, 0, Math.PI * 2);
                    ctx.fill();

                    // (b) Base Dark Moon (Earthshine Sphere)
                    ctx.save();
                    ctx.beginPath();
                    ctx.arc(cx, cy, r, 0, Math.PI * 2);
                    ctx.clip();

                    const darkGrad = ctx.createRadialGradient(cx - r * 0.25, cy - r * 0.25, 0, cx, cy, r);
                    darkGrad.addColorStop(0, '#0c1a2e');
                    darkGrad.addColorStop(0.7, '#07101f');
                    darkGrad.addColorStop(1, '#030712');
                    ctx.fillStyle = darkGrad;
                    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);

                    // (c) Lit Moon Surface (Astronomical Terminator Arc)
                    const p = phase % 1.0;
                    const cosP = Math.cos(p * 2 * Math.PI);
                    const isWaxing = p <= 0.5;
                    const rx = Math.max(0.1, r * Math.abs(cosP));

                    ctx.beginPath();
                    if (isWaxing) {
                        ctx.arc(cx, cy, r, -Math.PI / 2, Math.PI / 2, false);
                        if (cosP >= 0) {
                            ctx.ellipse(cx, cy, rx, r, 0, Math.PI / 2, -Math.PI / 2, true);
                        } else {
                            ctx.ellipse(cx, cy, rx, r, 0, Math.PI / 2, -Math.PI / 2, false);
                        }
                    } else {
                        ctx.arc(cx, cy, r, Math.PI / 2, -Math.PI / 2, false);
                        if (cosP >= 0) {
                            ctx.ellipse(cx, cy, rx, r, 0, -Math.PI / 2, Math.PI / 2, true);
                        } else {
                            ctx.ellipse(cx, cy, rx, r, 0, -Math.PI / 2, Math.PI / 2, false);
                        }
                    }
                    ctx.closePath();
                    ctx.clip();

                    // Moonlit Azure Texture
                    const moonGrad = ctx.createRadialGradient(
                        isWaxing ? cx + r * 0.25 : cx - r * 0.25,
                        cy - r * 0.2,
                        0,
                        cx,
                        cy,
                        r * 1.15
                    );
                    moonGrad.addColorStop(0, '#ffffff');
                    moonGrad.addColorStop(0.22, '#e0f2fe');
                    moonGrad.addColorStop(0.55, '#38bdf8');
                    moonGrad.addColorStop(0.85, '#0284c7');
                    moonGrad.addColorStop(1, '#034a7d');
                    ctx.fillStyle = moonGrad;
                    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);

                    // Lunar Maria Craters
                    ctx.fillStyle = 'rgba(2, 100, 160, 0.35)';
                    ctx.beginPath(); ctx.arc(cx - r * 0.18, cy - r * 0.18, r * 0.26, 0, Math.PI * 2); ctx.fill();
                    ctx.beginPath(); ctx.arc(cx + r * 0.25, cy - r * 0.12, r * 0.22, 0, Math.PI * 2); ctx.fill();
                    ctx.beginPath(); ctx.arc(cx - r * 0.08, cy + r * 0.28, r * 0.32, 0, Math.PI * 2); ctx.fill();
                    ctx.beginPath(); ctx.arc(cx + r * 0.32, cy + r * 0.25, r * 0.18, 0, Math.PI * 2); ctx.fill();

                    // Bright Ray Craters
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
                    ctx.beginPath(); ctx.arc(cx + (isWaxing ? r * 0.28 : -r * 0.28), cy + r * 0.35, r * 0.05, 0, Math.PI * 2); ctx.fill();
                    ctx.beginPath(); ctx.arc(cx + (isWaxing ? r * 0.12 : -r * 0.12), cy - r * 0.35, r * 0.04, 0, Math.PI * 2); ctx.fill();

                    ctx.restore();

                    // Outer Rim Glint
                    ctx.beginPath();
                    ctx.arc(cx, cy, r - 0.5, 0, Math.PI * 2);
                    ctx.strokeStyle = 'rgba(125, 211, 252, 0.45)';
                    ctx.lineWidth = 1.0;
                    ctx.stroke();

                    return canvas.toDataURL('image/png');
                }

                let currentMoonInfo = getRealLifeMoonPhase();
                let currentSmallMoonUrl = generateBlueMoonDataUrl(72, currentMoonInfo.phase);
                let currentLargeMoonUrl = generateBlueMoonDataUrl(320, currentMoonInfo.phase);

                let emblem = document.getElementById('moonlit-lotus-emblem');
                if (!emblem) {
                    emblem = document.createElement('div');
                    emblem.id = 'moonlit-lotus-emblem';
                    emblem.innerHTML = '<img class="moonlit-lotus-img" src="' + currentLargeMoonUrl + '" alt="Real-Life Blue Moon" />';
                    document.body.prepend(emblem);
                }

                let poemBox = document.getElementById('moonlit-poem-box');
                if (!poemBox) {
                    poemBox = document.createElement('div');
                    poemBox.id = 'moonlit-poem-box';
                    document.body.appendChild(poemBox);
                }

                // Update Antigravity Top Logo and Floating Emblem to Real-Life Blue Moon
                function updateMoonIcons() {
                    const nowInfo = getRealLifeMoonPhase();
                    // If lunar phase changed or first run
                    currentSmallMoonUrl = generateBlueMoonDataUrl(72, nowInfo.phase);
                    currentLargeMoonUrl = generateBlueMoonDataUrl(320, nowInfo.phase);

                    const btn = document.querySelector('[data-testid="app-icon-new-conversation-button"]');
                    if (btn) {
                        const svg = btn.querySelector('svg');
                        if (svg) svg.style.display = 'none';
                        let icon = btn.querySelector('.moonlit-top-app-icon');
                        if (!icon) {
                            icon = document.createElement('img');
                            icon.className = 'moonlit-top-app-icon';
                            btn.appendChild(icon);
                        }
                        if (icon.src !== currentSmallMoonUrl) icon.src = currentSmallMoonUrl;
                        icon.alt = 'Blue Moon (' + nowInfo.phaseName + ')';
                        btn.title = 'Real-Life Lunar Phase: ' + nowInfo.phaseName + ' (' + nowInfo.illumination + '% illuminated, Day ' + nowInfo.ageDays + ' of cycle)';
                    }

                    const emblemImg = emblem ? emblem.querySelector('.moonlit-lotus-img') : null;
                    if (emblemImg && emblemImg.src !== currentLargeMoonUrl) {
                        emblemImg.src = currentLargeMoonUrl;
                        emblemImg.alt = 'Real-Life Blue Moon: ' + nowInfo.phaseName;
                    }

                    let link = document.querySelector('link[rel*="icon"]');
                    if (!link) {
                        link = document.createElement('link');
                        link.rel = 'icon';
                        document.head.appendChild(link);
                    }
                    link.type = 'image/png';
                    link.href = currentSmallMoonUrl;
                }
                updateMoonIcons();

                // =========================================================================
                // 3. LIVING ATMOSPHERIC CANVAS ENGINE
                // =========================================================================
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

                // (a) Flapping Celestial Butterflies (5 instances)
                for (let i = 0; i < 5; i++) {
                    state.butterflies.push({
                        x: Math.random() * window.innerWidth * 0.8,
                        y: Math.random() * window.innerHeight * 0.7 + window.innerHeight * 0.1,
                        vx: (Math.random() * 0.7 + 0.35) * (Math.random() > 0.4 ? 1 : -1),
                        vy: (Math.random() - 0.5) * 0.35,
                        size: Math.random() * 6 + 12,
                        angle: 0,
                        flapPhase: Math.random() * Math.PI * 2,
                        flapSpeed: Math.random() * 0.08 + 0.14,
                        trail: []
                    });
                }

                // (b) Drifting Lotus Petals (14 instances)
                for (let i = 0; i < 14; i++) {
                    state.petals.push({
                        x: Math.random() * window.innerWidth,
                        y: Math.random() * window.innerHeight,
                        vy: Math.random() * 0.55 + 0.35,
                        swaySpeed: Math.random() * 0.002 + 0.0015,
                        swayAmount: Math.random() * 1.4 + 0.7,
                        swayOffset: Math.random() * Math.PI * 2,
                        rotation: Math.random() * Math.PI * 2,
                        rotSpeed: (Math.random() - 0.5) * 0.015,
                        size: Math.random() * 4 + 7,
                        alpha: Math.random() * 0.45 + 0.3
                    });
                }

                // (c) Floating Lantern Embers (35 instances)
                for (let i = 0; i < 35; i++) {
                    state.embers.push({
                        x: Math.random() * window.innerWidth,
                        y: Math.random() * window.innerHeight,
                        radius: Math.random() * 2 + 0.6,
                        alpha: Math.random() * 0.7 + 0.2,
                        speedY: -(Math.random() * 0.45 + 0.2),
                        speedX: (Math.random() - 0.5) * 0.3,
                        phase: Math.random() * Math.PI * 2,
                        glowPulse: Math.random() * 0.03 + 0.015,
                        isCyan: Math.random() > 0.45
                    });
                }

                function renderCanvas(now) {
                    state.lastFrameTime = now;
                    updateMoonlitLayout(now);

                    if (document.hidden) {
                        state.animFrame = requestAnimationFrame(renderCanvas);
                        return;
                    }

                    ctx.clearRect(0, 0, canvas.width, canvas.height);

                    // 1. Draw Expanding Water Ripples
                    for (let i = state.ripples.length - 1; i >= 0; i--) {
                        const r = state.ripples[i];
                        r.radius += (r.maxRadius - r.radius) * 0.045 + 0.7;
                        r.alpha *= 0.955;

                        if (r.alpha < 0.02 || r.radius >= r.maxRadius - 2) {
                            state.ripples.splice(i, 1);
                            continue;
                        }

                        ctx.save();
                        ctx.strokeStyle = 'rgba(56, 189, 248, ' + (r.alpha * 0.8) + ')';
                        ctx.lineWidth = 1.8;
                        ctx.shadowColor = '#38bdf8';
                        ctx.shadowBlur = 8;
                        ctx.beginPath();
                        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
                        ctx.stroke();

                        ctx.strokeStyle = 'rgba(251, 191, 36, ' + (r.alpha * 0.5) + ')';
                        ctx.lineWidth = 1.0;
                        ctx.beginPath();
                        ctx.arc(r.x, r.y, r.radius * 0.62, 0, Math.PI * 2);
                        ctx.stroke();
                        ctx.restore();
                    }

                    // 2. Draw Mouse Sparkle Trail
                    for (let i = state.sparks.length - 1; i >= 0; i--) {
                        const s = state.sparks[i];
                        s.x += s.vx;
                        s.y += s.vy;
                        s.alpha *= 0.92;

                        if (s.alpha < 0.03) {
                            state.sparks.splice(i, 1);
                            continue;
                        }

                        ctx.save();
                        ctx.shadowColor = s.color;
                        ctx.shadowBlur = 6;
                        ctx.fillStyle = s.colorPrefix + s.alpha + ')';
                        ctx.beginPath();
                        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.restore();
                    }

                    // 3. Draw Floating Embers
                    ctx.shadowColor = '#38bdf8';
                    ctx.shadowBlur = 8;
                    for (const p of state.embers) {
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
                        ctx.fillStyle = p.isCyan ? ('rgba(56, 189, 248, ' + curAlpha + ')') : ('rgba(251, 191, 36, ' + curAlpha + ')');
                        ctx.fill();
                    }
                    ctx.shadowBlur = 0;

                    // 4. Draw Drifting Lotus Petals
                    for (const p of state.petals) {
                        p.y += p.vy;
                        p.x += Math.sin(now * p.swaySpeed + p.swayOffset) * p.swayAmount;
                        p.rotation += p.rotSpeed;

                        if (p.y > canvas.height + 20) {
                            p.y = -20;
                            p.x = Math.random() * canvas.width;
                        }

                        ctx.save();
                        ctx.translate(p.x, p.y);
                        ctx.rotate(p.rotation);
                        ctx.beginPath();
                        ctx.moveTo(0, -p.size);
                        ctx.bezierCurveTo(p.size * 0.6, -p.size * 0.3, p.size * 0.6, p.size * 0.6, 0, p.size);
                        ctx.bezierCurveTo(-p.size * 0.6, p.size * 0.6, -p.size * 0.6, -p.size * 0.3, 0, -p.size);
                        ctx.fillStyle = 'rgba(255, 238, 248, ' + p.alpha + ')';
                        ctx.shadowColor = 'rgba(56, 189, 248, 0.4)';
                        ctx.shadowBlur = 4;
                        ctx.fill();
                        ctx.strokeStyle = 'rgba(125, 211, 252, ' + (p.alpha * 0.7) + ')';
                        ctx.lineWidth = 0.8;
                        ctx.stroke();
                        ctx.restore();
                    }

                    // 5. Draw Celestial Butterflies & Wing Flaps
                    for (const b of state.butterflies) {
                        b.x += b.vx;
                        b.y += b.vy + Math.sin(now * 0.003 + b.flapPhase) * 0.5;

                        if (b.x < -30) { b.x = canvas.width + 20; b.vx = -Math.abs(b.vx); }
                        if (b.x > canvas.width + 30) { b.x = -20; b.vx = Math.abs(b.vx); }
                        if (b.y < 30) b.vy = Math.abs(b.vy);
                        if (b.y > canvas.height * 0.85) b.vy = -Math.abs(b.vy);

                        b.angle = Math.atan2(b.vy, b.vx);

                        // Butterfly stardust trail
                        if (Math.random() > 0.45) {
                            b.trail.push({ x: b.x, y: b.y, alpha: 0.85, r: Math.random() * 1.5 + 0.8 });
                        }

                        for (let t = b.trail.length - 1; t >= 0; t--) {
                            const tr = b.trail[t];
                            tr.alpha *= 0.94;
                            if (tr.alpha < 0.04) {
                                b.trail.splice(t, 1);
                                continue;
                            }
                            ctx.fillStyle = 'rgba(125, 211, 252, ' + tr.alpha + ')';
                            ctx.beginPath();
                            ctx.arc(tr.x, tr.y, tr.r, 0, Math.PI * 2);
                            ctx.fill();
                        }

                        // Render Wings
                        ctx.save();
                        ctx.translate(b.x, b.y);
                        ctx.rotate(b.angle);

                        const wingPhase = Math.sin(now * b.flapSpeed + b.flapPhase);
                        const wingSpread = Math.cos(wingPhase);

                        ctx.shadowColor = '#38bdf8';
                        ctx.shadowBlur = 10;

                        // Left Wing
                        ctx.save();
                        ctx.scale(wingSpread, 1);
                        ctx.beginPath();
                        ctx.moveTo(0, 0);
                        ctx.bezierCurveTo(-b.size * 0.7, -b.size * 1.2, -b.size * 1.3, -b.size * 0.4, 0, b.size * 0.4);
                        ctx.fillStyle = 'rgba(56, 189, 248, 0.88)';
                        ctx.fill();
                        ctx.beginPath();
                        ctx.moveTo(0, 0);
                        ctx.bezierCurveTo(-b.size * 0.4, -b.size * 0.7, -b.size * 0.8, -b.size * 0.2, 0, b.size * 0.2);
                        ctx.fillStyle = 'rgba(251, 191, 36, 0.75)';
                        ctx.fill();
                        ctx.restore();

                        // Right Wing
                        ctx.save();
                        ctx.scale(-wingSpread, 1);
                        ctx.beginPath();
                        ctx.moveTo(0, 0);
                        ctx.bezierCurveTo(-b.size * 0.7, -b.size * 1.2, -b.size * 1.3, -b.size * 0.4, 0, b.size * 0.4);
                        ctx.fillStyle = 'rgba(56, 189, 248, 0.88)';
                        ctx.fill();
                        ctx.beginPath();
                        ctx.moveTo(0, 0);
                        ctx.bezierCurveTo(-b.size * 0.4, -b.size * 0.7, -b.size * 0.8, -b.size * 0.2, 0, b.size * 0.2);
                        ctx.fillStyle = 'rgba(251, 191, 36, 0.75)';
                        ctx.fill();
                        ctx.restore();

                        // Body
                        ctx.beginPath();
                        ctx.ellipse(0, 0, 1.8, b.size * 0.35, 0, 0, Math.PI * 2);
                        ctx.fillStyle = '#ffffff';
                        ctx.fill();
                        ctx.restore();
                    }

                    state.animFrame = requestAnimationFrame(renderCanvas);
                }
                state.animFrame = requestAnimationFrame(renderCanvas);

                // =========================================================================
                // 4. DYNAMIC LAYOUT SYMMETRY CONTROLLER (NEW CONV vs ACTIVE CHAT)
                // =========================================================================
                function updateMoonlitLayout(now) {
                    if (state._pauseLayout) return;
                    if (now && now - state.lastLayoutCheck < 150) return;
                    state.lastLayoutCheck = now || performance.now();

                    const curEmblem = document.getElementById('moonlit-lotus-emblem');
                    const curPoem = document.getElementById('moonlit-poem-box');
                    if (!curEmblem || !curPoem) return;

                    const composer = document.getElementById('antigravity.agentSidePanelInputBox') || document.querySelector('.rounded-2xl.bg-card-border');
                    const compRect = composer ? composer.getBoundingClientRect() : null;
                    const messages = document.querySelectorAll('[class*="group/user-input-step"], [class*="user-input-step"]');

                    const isInChat = messages.length > 0 && compRect && compRect.top > window.innerHeight * 0.65;

                    if (isInChat) {
                        // In active chat: fade out so girl on skiff on right is 100% visible
                        curEmblem.style.opacity = '0';
                        curEmblem.style.pointerEvents = 'none';
                        curPoem.style.opacity = '0';
                        curPoem.style.pointerEvents = 'none';
                    } else if (compRect) {
                        // In New Conversation: Symmetrical docking above & below composer
                        const centerX = compRect.left + compRect.width / 2;

                        curEmblem.style.left = centerX + 'px';
                        curEmblem.style.top = (compRect.top - 18) + 'px';
                        curEmblem.style.transform = 'translate(-50%, -100%)';
                        curEmblem.style.opacity = '0.96';

                        curPoem.style.left = centerX + 'px';
                        curPoem.style.top = (compRect.bottom + 18) + 'px';
                        curPoem.style.transform = 'translateX(-50%)';
                        curPoem.style.maxWidth = Math.min(compRect.width, 680) + 'px';
                        curPoem.style.opacity = '0.92';
                    }
                }
                updateMoonlitLayout();

                // =========================================================================
                // 5. POETIC DECREE CAPTION TYPEWRITER LOOP (16s)
                // =========================================================================
                const canonicalPoems = [
                    "Drifting upon tranquil waters where moonlight crowns the blooming lotus.",
                    "The night river whispers under the stone bridge as celestial butterflies take flight.",
                    "A solitary skiff beneath the silver moon, rippling through starlight and silence.",
                    "Lantern light wafts on the evening tide, where lotus blossoms dream in azure mist.",
                    "In the stillness of the water's embrace, the moon weaves threads of quiet reverie.",
                    "烟波浩渺，月印荷塘。一叶扁舟过浅洲，两岸星河入梦流。"
                ];
                let currentPoemIdx = 0;

                function typePoemText(text, onComplete) {
                    poemBox.textContent = '';
                    let charIdx = 0;

                    function step() {
                        if (charIdx < text.length) {
                            poemBox.textContent = text.slice(0, charIdx + 1) + ' ▮';
                            charIdx++;
                            const delay = Math.floor(Math.random() * 20) + 32;
                            state.poemTimer = setTimeout(step, delay);
                        } else {
                            poemBox.textContent = text;
                            if (onComplete) onComplete();
                        }
                    }
                    step();
                }

                typePoemText(canonicalPoems[currentPoemIdx]);

                state.poemInterval = setInterval(() => {
                    currentPoemIdx = (currentPoemIdx + 1) % canonicalPoems.length;
                    poemBox.style.opacity = '0';
                    setTimeout(() => {
                        poemBox.style.opacity = '0.92';
                        typePoemText(canonicalPoems[currentPoemIdx]);
                    }, 400);
                }, 16000);

                // =========================================================================
                // 6. INJECT CUSTOM MOONLIT THEME CSS
                // =========================================================================
                let style = document.getElementById('custom-antigravity-theme');
                if (!style) {
                    style = document.createElement('style');
                    style.id = 'custom-antigravity-theme';
                    document.head.appendChild(style);
                }
                style.textContent = ${JSON.stringify(MOONLIT_CSS)};

                // =========================================================================
                // 7. INTERACTIVE WATER RIPPLES & MOUSE SPARKLES
                // =========================================================================
                const onWindowClick = (e) => {
                    // Check if clicked an input or button
                    if (e.target.closest('input, textarea, button, a, [contenteditable="true"]')) {
                        return;
                    }
                    state.ripples.push({
                        x: e.clientX,
                        y: e.clientY,
                        radius: 4,
                        maxRadius: Math.random() * 30 + 80,
                        alpha: 0.88
                    });
                };

                let lastSparkTime = 0;
                const onMouseMove = (e) => {
                    const now = performance.now();
                    if (now - lastSparkTime > 55) {
                        lastSparkTime = now;
                        const isCyan = Math.random() > 0.4;
                        state.sparks.push({
                            x: e.clientX + (Math.random() - 0.5) * 8,
                            y: e.clientY + (Math.random() - 0.5) * 8,
                            vx: (Math.random() - 0.5) * 0.4,
                            vy: -(Math.random() * 0.5 + 0.2),
                            radius: Math.random() * 1.6 + 0.8,
                            alpha: 0.8,
                            color: isCyan ? '#38bdf8' : '#fbbf24',
                            colorPrefix: isCyan ? 'rgba(56, 189, 248, ' : 'rgba(251, 191, 36, '
                        });
                    }
                };

                // =========================================================================
                // 8. SCOPED HOVER EFFECTS (YELLOW & BOXED TEXT ONLY)
                // =========================================================================
                const TARGET_SELECTOR = 'strong, b, .text-index-gold, code:not(pre code), .inline-pill, [class*="pill"], [class*="badge"], div[data-testid="conversation-row-sidebar"]';
                const EXCLUDE_SELECTOR = 'a[href="/"], button[data-testid="automations-button"], pre, pre code, #moonlit-lotus-emblem, #moonlit-poem-box, #moonlit-particles-canvas, #moonlit-vignette-overlay';

                const onMoonlitMouseOver = (e) => {
                    if (state.activeTargetContainer && (state.activeTargetContainer === e.target || state.activeTargetContainer.contains(e.target))) {
                        return;
                    }

                    const target = e.target.closest(TARGET_SELECTOR);
                    if (!target || target.closest(EXCLUDE_SELECTOR)) return;

                    state.activeTargetContainer = target;
                    target.classList.add('moonlit-hover-active');
                    state.activeHoverLeaf = target;
                };

                const onMoonlitMouseOut = (e) => {
                    if (!state.activeTargetContainer) return;
                    if (e.relatedTarget && (state.activeTargetContainer === e.relatedTarget || state.activeTargetContainer.contains(e.relatedTarget))) {
                        return;
                    }
                    state.activeTargetContainer.classList.remove('moonlit-hover-active');
                    state.activeTargetContainer = null;
                    state.activeHoverLeaf = null;
                };

                window.addEventListener('click', onWindowClick, { passive: true });
                window.addEventListener('mousemove', onMouseMove, { passive: true });
                document.body.addEventListener('mouseover', onMoonlitMouseOver, { passive: true });
                document.body.addEventListener('mouseout', onMoonlitMouseOut, { passive: true });
                window.addEventListener('resize', () => {
                    resizeCanvas();
                    updateMoonlitLayout();
                }, { passive: true });

                state.cleanupListeners = () => {
                    window.removeEventListener('click', onWindowClick);
                    window.removeEventListener('mousemove', onMouseMove);
                    document.body.removeEventListener('mouseover', onMoonlitMouseOver);
                    document.body.removeEventListener('mouseout', onMoonlitMouseOut);
                    window.removeEventListener('resize', resizeCanvas);
                };

                function ensureDOMElements() {
                    if (!document.getElementById('moonlit-particles-canvas')) {
                        document.body.prepend(canvas);
                    }
                    if (!document.getElementById('moonlit-lotus-emblem')) {
                        document.body.prepend(emblem);
                    }
                    if (!document.getElementById('moonlit-poem-box')) {
                        document.body.appendChild(poemBox);
                    }
                    if (!document.getElementById('moonlit-vignette-overlay')) {
                        document.body.prepend(vignette);
                    }
                    updateMoonIcons();
                }

                // =========================================================================
                // 9. WATCHDOG & MUTATION OBSERVER
                // =========================================================================
                state.watchdog = setInterval(() => {
                    ensureDOMElements();
                    resizeCanvas();
                    updateMoonlitLayout();
                    updateMoonIcons();
                    const now = performance.now();
                    if (!document.hidden && now - state.lastFrameTime > 2500) {
                        if (state.animFrame) cancelAnimationFrame(state.animFrame);
                        state.animFrame = requestAnimationFrame(renderCanvas);
                    }
                }, 2000);

                const observer = new MutationObserver(() => {
                    ensureDOMElements();
                    updateMoonlitLayout();
                });
                observer.observe(document.body, { childList: true, subtree: true });
                state.observer = observer;

                return 'Moonlit Lotus Skiff Theme Live: Real-Life Astronomical Blue Moon Phase Engine!';
            })();`;

            ws.send(JSON.stringify({
                id: 1,
                method: 'Runtime.evaluate',
                params: {
                    expression: injectedCode,
                    awaitPromise: true,
                    returnByValue: true
                }
            }));
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.id === 1) {
                if (data.result?.exceptionDetails) {
                    console.error('Injected Script Exception:', JSON.stringify(data.result.exceptionDetails, null, 2));
                    reject(new Error(data.result.exceptionDetails.text));
                } else {
                    console.log('Result:', data.result?.result?.value);
                    ws.close();
                    resolve();
                }
            }
        };

        ws.onerror = (err) => {
            console.error('WS Error:', err);
            reject(err);
        };
    });
}

main().catch(err => {
    console.error('[-] Execution failed:', err);
    process.exit(1);
});
