const fs = require('fs');
const path = require('path');

const LOCAL_VIDEO_PATH = path.join(__dirname, 'eldritch_bg.mp4');
const FALLBACK_VIDEO_PATH = 'C:\\Users\\ngole\\Downloads\\snaptik.vn_7586300755884182802.mp4';
const VIDEO_PATH = fs.existsSync(LOCAL_VIDEO_PATH) ? LOCAL_VIDEO_PATH : FALLBACK_VIDEO_PATH;

const LOCAL_EYE_GIF_PATH = path.join(__dirname, 'eldritch_eye.gif');
const FALLBACK_EYE_GIF_PATH = 'C:\\Users\\ngole\\Downloads\\genshin-impact-genshin.gif';
const EYE_GIF_PATH = fs.existsSync(LOCAL_EYE_GIF_PATH) ? LOCAL_EYE_GIF_PATH : FALLBACK_EYE_GIF_PATH;

async function main() {
    if (!fs.existsSync(VIDEO_PATH)) {
        console.error('Video file not found at:', VIDEO_PATH);
        process.exit(1);
    }

    // Read video as base64
    const videoBuffer = fs.readFileSync(VIDEO_PATH);
    const videoBase64 = videoBuffer.toString('base64');
    console.log('Loaded video bytes:', videoBuffer.length);

    // Read Genshin Eldritch Eye GIF as base64
    let eyeGifBase64 = '';
    if (fs.existsSync(EYE_GIF_PATH)) {
        const gifBuffer = fs.readFileSync(EYE_GIF_PATH);
        eyeGifBase64 = gifBuffer.toString('base64');
        console.log('Loaded header eye GIF bytes:', gifBuffer.length);
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
        await injectIntoPage(page.webSocketDebuggerUrl, videoBase64, eyeGifBase64);
    }
}

function injectIntoPage(wsUrl, videoBase64, eyeGifBase64) {
    return new Promise((resolve, reject) => {
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
            const expression = `(function() {
                // 0. Clean up any active Prescript theme elements if switching themes
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
                if (window.__capriTopPopoutTimer) {
                    clearTimeout(window.__capriTopPopoutTimer);
                    window.__capriTopPopoutTimer = null;
                }
                if (window.__halibutEyeAnimFrame) {
                    cancelAnimationFrame(window.__halibutEyeAnimFrame);
                    window.__halibutEyeAnimFrame = null;
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
                    'halibut-eye-demo-panel',
                    'eldritch-hover-eye-popup',
                    'eldritch-ambient-rifts-canvas',
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
                    if (el) el.remove();
                });
                document.querySelectorAll('.prescript-stop-seal-svg').forEach(el => el.remove());

                // Convert Header Eye GIF base64 to Blob URL
                let eyeGifBlobUrl = '';
                const gifB64 = "${eyeGifBase64}";
                if (gifB64) {
                    const gBin = atob(gifB64);
                    const gLen = gBin.length;
                    const gBytes = new Uint8Array(gLen);
                    for (let i = 0; i < gLen; i++) {
                        gBytes[i] = gBin.charCodeAt(i);
                    }
                    const gBlob = new Blob([gBytes], { type: 'image/gif' });
                    eyeGifBlobUrl = URL.createObjectURL(gBlob);
                }

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

                let video = document.getElementById('eldritch-bg-video');
                if (!video) {
                    video = document.createElement('video');
                    video.id = 'eldritch-bg-video';
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

                // 2. Create or update Eldritch OLED Vignette Overlay
                let vignette = document.getElementById('eldritch-vignette-overlay');
                if (!vignette) {
                    vignette = document.createElement('div');
                    vignette.id = 'eldritch-vignette-overlay';
                    document.body.prepend(vignette);
                }

                // 3. Inject Eldritch Void & Crimson Ocular Horror CSS
                let style = document.getElementById('custom-antigravity-theme');
                if (!style) {
                    style = document.createElement('style');
                    style.id = 'custom-antigravity-theme';
                    document.head.appendChild(style);
                }

                style.textContent = \`
                    :root, .dark, .theme-dark, body {
                        --background: transparent !important;
                        --sidebar: rgba(4, 0, 2, 0.62) !important;
                        --sidebar-secondary: rgba(255, 30, 56, 0.14) !important;
                        --sidebar-muted: rgba(255, 30, 56, 0.08) !important;
                        --card: rgba(8, 0, 3, 0.72) !important;
                        --card-border: rgba(255, 30, 56, 0.45) !important;
                        --border: rgba(255, 30, 56, 0.24) !important;
                        --muted: rgba(20, 2, 6, 0.75) !important;
                        --foreground: #F5E6E8 !important;
                        --secondary-foreground: #C89FA6 !important;
                        --crimson-neon: #FF1E38;
                        --crimson-glow: rgba(255, 30, 56, 0.55);
                        --wine-deep: #3A030E;
                        --oled-void: #000000;
                    }

                    /* Pitch-Black OLED Base & Video Layering */
                    html, body {
                        background-color: #000000 !important;
                        color: #F5E6E8 !important;
                    }

                    #eldritch-bg-video {
                        position: fixed !important;
                        top: 0 !important;
                        left: 0 !important;
                        width: 100vw !important;
                        height: 100vh !important;
                        object-fit: cover !important;
                        z-index: 0 !important;
                        pointer-events: none !important;
                        opacity: 0.58 !important;
                        filter: contrast(1.18) saturate(1.25) brightness(0.78) !important;
                    }

                    #eldritch-vignette-overlay {
                        position: fixed !important;
                        top: 0 !important;
                        left: 0 !important;
                        width: 100vw !important;
                        height: 100vh !important;
                        z-index: 0 !important;
                        pointer-events: none !important;
                        background:
                            radial-gradient(circle at 50% 42%, rgba(255, 30, 56, 0.07) 0%, rgba(8, 0, 2, 0.55) 55%, rgba(0, 0, 0, 0.92) 100%),
                            linear-gradient(180deg, rgba(0, 0, 0, 0.78) 0%, transparent 15%, transparent 82%, rgba(0, 0, 0, 0.88) 100%) !important;
                    }

                    #root {
                        position: relative !important;
                        z-index: 1 !important;
                        background: transparent !important;
                    }

                    /* Make main layout containers transparent so OLED + Video shine through */
                    .bg-background {
                        background-color: transparent !important;
                    }

                    /* ==========================================================================
                       SETTINGS MODAL, CARDS & DROPDOWN MENUS (HIGH-CONTRAST DARK)
                       ========================================================================== */
                    .settings-modal-backdrop {
                        background-color: rgba(2, 0, 1, 0.84) !important;
                        backdrop-filter: blur(12px) !important;
                    }

                    .settings-modal-container,
                    .settings-modal-container .bg-background,
                    [role="dialog"],
                    [role="menu"],
                    [role="listbox"] {
                        background-color: rgba(5, 0, 2, 0.97) !important;
                        backdrop-filter: blur(24px) saturate(150%) !important;
                    }

                    .settings-modal-container {
                        border: 1px solid rgba(255, 30, 56, 0.6) !important;
                        box-shadow:
                            0 24px 70px rgba(0, 0, 0, 0.98),
                            0 0 32px rgba(255, 30, 56, 0.28),
                            inset 0 1px 0 rgba(255, 30, 56, 0.4) !important;
                    }

                    .settings-modal-container .bg-sidebar {
                        background-color: rgba(2, 0, 1, 0.98) !important;
                        border-right: 1px solid rgba(255, 30, 56, 0.28) !important;
                    }

                    .settings-modal-container .rounded-xl.border {
                        background-color: rgba(16, 1, 5, 0.92) !important;
                        border-color: rgba(255, 30, 56, 0.38) !important;
                        box-shadow: 0 4px 18px rgba(0, 0, 0, 0.8), inset 0 0 12px rgba(255, 30, 56, 0.08) !important;
                    }

                    .settings-modal-container button {
                        background-color: rgba(32, 2, 9, 0.9) !important;
                        border: 1px solid rgba(255, 30, 56, 0.35) !important;
                        color: #FFE8EB !important;
                    }

                    .settings-modal-container button:hover {
                        background-color: rgba(255, 30, 56, 0.25) !important;
                        border-color: #FF1E38 !important;
                    }

                    /* Sleek Sinister Glassmorphic Sidebars & Panels */
                    .bg-sidebar {
                        background-color: rgba(3, 0, 1, 0.58) !important;
                        backdrop-filter: blur(12px) saturate(140%) !important;
                    }

                    /* Left Sidebar border & styling */
                    aside, [class*="bg-sidebar"]:not(.overflow-y-auto *) {
                        border-color: rgba(255, 30, 56, 0.22) !important;
                    }

                    /* Active / Hover Conversation Row in Sidebar */
                    .bg-sidebar-secondary {
                        background: linear-gradient(90deg, rgba(255, 30, 56, 0.22) 0%, rgba(70, 4, 18, 0.35) 100%) !important;
                        border: 1px solid rgba(255, 30, 56, 0.5) !important;
                        box-shadow: 0 0 14px rgba(255, 30, 56, 0.25), inset 0 0 8px rgba(255, 30, 56, 0.15) !important;
                        color: #FFFFFF !important;
                    }

                    /* Sticky User Message Bleed Fix (prevent solid block covering video) */
                    .md-sticky-message-bleed {
                        background: transparent !important;
                    }
                    .md-sticky-message-bleed::after {
                        display: none !important;
                    }

                    /* ==========================================================================
                       DEEP WINE-RED USER MESSAGE BUBBLES + GLOWING CRIMSON HAIRLINE STROKE
                       ========================================================================== */
                    [class*="group/user-input-step"] .bg-card-border {
                        background: #FF1E38 !important;
                        padding: 1px !important;
                        border-radius: 14px !important;
                        box-shadow:
                            0 0 18px rgba(255, 30, 56, 0.42),
                            0 4px 24px rgba(0, 0, 0, 0.9) !important;
                        transition: all 0.25s ease !important;
                    }

                    [class*="group/user-input-step"]:hover .bg-card-border {
                        box-shadow:
                            0 0 26px rgba(255, 30, 56, 0.68),
                            0 4px 28px rgba(0, 0, 0, 0.95) !important;
                    }

                    [class*="group/user-input-step"] .bg-card {
                        background: linear-gradient(135deg, rgba(72, 4, 18, 0.88) 0%, rgba(34, 2, 9, 0.92) 60%, rgba(14, 0, 4, 0.95) 100%) !important;
                        backdrop-filter: blur(18px) !important;
                        border-radius: 13px !important;
                        color: #FFE8EB !important;
                        box-shadow: inset 0 0 16px rgba(255, 30, 56, 0.22) !important;
                    }

                    /* ==========================================================================
                       TRANSLUCENT BLACK GLASSMORPHIC AGENT MESSAGE BUBBLES
                       ========================================================================== */
                    .gap-y-3 > .flex.items-start:not(:has([class*="group/user-input-step"])) > .flex-col {
                        background: linear-gradient(160deg, rgba(6, 0, 2, 0.76) 0%, rgba(0, 0, 0, 0.84) 100%) !important;
                        backdrop-filter: blur(16px) saturate(140%) !important;
                        border: 1px solid rgba(255, 30, 56, 0.42) !important;
                        border-radius: 14px !important;
                        padding: 14px 18px !important;
                        margin-top: 4px !important;
                        margin-bottom: 4px !important;
                        box-shadow:
                            0 10px 32px rgba(0, 0, 0, 0.92),
                            0 0 14px rgba(255, 30, 56, 0.16),
                            inset 0 1px 0 rgba(255, 30, 56, 0.3) !important;
                        transition: border-color 0.25s ease, box-shadow 0.25s ease !important;
                    }

                    .gap-y-3 > .flex.items-start:not(:has([class*="group/user-input-step"])) > .flex-col:hover {
                        border-color: rgba(255, 30, 56, 0.72) !important;
                        box-shadow:
                            0 12px 36px rgba(0, 0, 0, 0.95),
                            0 0 22px rgba(255, 30, 56, 0.28),
                            inset 0 1px 0 rgba(255, 30, 56, 0.45) !important;
                    }

                    /* ==========================================================================
                       ACTIVE INPUT COMPOSER BOX WITH NEON RED BLOOM
                       ========================================================================== */
                    .rounded-2xl.bg-card-border {
                        background: linear-gradient(90deg, #FF1E38, #8A0618, #FF1E38) !important;
                        padding: 1px !important;
                        box-shadow:
                            0 0 20px rgba(255, 30, 56, 0.32),
                            0 8px 32px rgba(0, 0, 0, 0.95) !important;
                        transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
                    }

                    .rounded-2xl.bg-card-border:focus-within {
                        background: #FF1E38 !important;
                        box-shadow:
                            0 0 32px rgba(255, 30, 56, 0.62),
                            0 0 10px rgba(255, 30, 56, 0.45),
                            0 10px 40px rgba(0, 0, 0, 0.98) !important;
                    }

                    .rounded-2xl.bg-card-border > .bg-card {
                        background: rgba(4, 0, 2, 0.88) !important;
                        backdrop-filter: blur(20px) !important;
                        box-shadow: inset 0 0 18px rgba(255, 30, 56, 0.14) !important;
                    }

                    /* ==========================================================================
                       ELDRITCH EYE STOP CONVERSATION & STOP EXECUTION BUTTONS
                       ========================================================================== */
                    @keyframes eldritch-stop-socket-pulse {
                        0%, 100% {
                            box-shadow:
                                0 0 10px #FF1E38,
                                0 0 22px rgba(255, 30, 56, 0.65),
                                inset 0 0 8px rgba(255, 30, 56, 0.75);
                            transform: scale(1);
                        }
                        50% {
                            box-shadow:
                                0 0 16px #FF1E38,
                                0 0 32px rgba(255, 30, 56, 0.95),
                                inset 0 0 12px rgba(255, 30, 56, 0.95);
                            transform: scale(1.08);
                        }
                    }

                    @keyframes eldritch-stop-pupil-scan {
                        0%, 100% { transform: translate(0px, 0px) scaleY(1) scaleX(1); }
                        20% { transform: translate(-1.8px, -0.6px) scaleY(1.06) scaleX(0.85); }
                        42% { transform: translate(1.8px, 0.5px) scaleY(1.06) scaleX(0.85); }
                        47% { transform: translate(0px, 0px) scaleY(0.1) scaleX(1.3); } /* sinister blink */
                        52% { transform: translate(0px, 0px) scaleY(1.1) scaleX(0.75); }
                        75% { transform: translate(-1.2px, 0.8px) scaleY(0.95) scaleX(1.05); }
                    }

                    @keyframes eldritch-iris-spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }

                    /* Target Composer Cancel, Stop Execution, and Sidebar Archive Conversation buttons */
                    button[data-tooltip-id="input-send-button-cancel-tooltip"],
                    button[aria-label^="Cancel ("],
                    button[aria-label="Stop execution"],
                    button[data-testid="conversation-archive-button"],
                    button[aria-label="Archive conversation"],
                    button[aria-label="Unarchive conversation"] {
                        position: relative !important;
                        width: 32px !important;
                        height: 32px !important;
                        border-radius: 9999px !important;
                        background: radial-gradient(circle at 50% 50%, #3A000A 0%, #120003 65%, #000000 100%) !important;
                        border: 1.5px solid #FF1E38 !important;
                        padding: 0 !important;
                        overflow: visible !important;
                        animation: eldritch-stop-socket-pulse 2.2s infinite ease-in-out !important;
                        transition: all 0.25s ease !important;
                    }

                    button[aria-label="Stop execution"] {
                        width: 26px !important;
                        height: 26px !important;
                    }

                    button[data-testid="conversation-archive-button"],
                    button[aria-label="Archive conversation"],
                    button[aria-label="Unarchive conversation"] {
                        width: 22px !important;
                        height: 22px !important;
                    }

                    button[data-tooltip-id="input-send-button-cancel-tooltip"]:hover,
                    button[aria-label^="Cancel ("]:hover,
                    button[aria-label="Stop execution"]:hover,
                    button[data-testid="conversation-archive-button"]:hover,
                    button[aria-label="Archive conversation"]:hover,
                    button[aria-label="Unarchive conversation"]:hover {
                        transform: scale(1.18) !important;
                        border-color: #FF8593 !important;
                        box-shadow:
                            0 0 20px #FF1E38,
                            0 0 40px #FF1E38,
                            inset 0 0 14px #FF1E38 !important;
                    }

                    /* Hide default red square, stop square, or archive box icon inside when Eldritch Eye is active */
                    button[data-tooltip-id="input-send-button-cancel-tooltip"] > div.bg-red-500,
                    button[aria-label^="Cancel ("] > div.bg-red-500,
                    button[aria-label="Stop execution"] > svg:not(.eldritch-stop-eye-svg),
                    button[data-testid="conversation-archive-button"] > svg:not(.eldritch-stop-eye-svg),
                    button[aria-label="Archive conversation"] > svg:not(.eldritch-stop-eye-svg),
                    button[aria-label="Unarchive conversation"] > svg:not(.eldritch-stop-eye-svg) {
                        display: none !important;
                    }

                    /* Pure CSS fallback eye in case React re-renders before MutationObserver tick */
                    button[data-tooltip-id="input-send-button-cancel-tooltip"]:not(:has(.eldritch-stop-eye-svg))::before,
                    button[aria-label^="Cancel ("]:not(:has(.eldritch-stop-eye-svg))::before,
                    button[aria-label="Stop execution"]:not(:has(.eldritch-stop-eye-svg))::before,
                    button[data-testid="conversation-archive-button"]:not(:has(.eldritch-stop-eye-svg))::before,
                    button[aria-label="Archive conversation"]:not(:has(.eldritch-stop-eye-svg))::before,
                    button[aria-label="Unarchive conversation"]:not(:has(.eldritch-stop-eye-svg))::before {
                        content: "" !important;
                        position: absolute !important;
                        width: 16px !important;
                        height: 10px !important;
                        border-radius: 50% !important;
                        background: radial-gradient(circle, #FF6B7D 0%, #FF1E38 45%, #5E000C 85%, #000000 100%) !important;
                        border: 1px solid #FF1E38 !important;
                        box-shadow: 0 0 8px #FF1E38 !important;
                    }

                    button[data-tooltip-id="input-send-button-cancel-tooltip"]:not(:has(.eldritch-stop-eye-svg))::after,
                    button[aria-label^="Cancel ("]:not(:has(.eldritch-stop-eye-svg))::after,
                    button[aria-label="Stop execution"]:not(:has(.eldritch-stop-eye-svg))::after,
                    button[data-testid="conversation-archive-button"]:not(:has(.eldritch-stop-eye-svg))::after,
                    button[aria-label="Archive conversation"]:not(:has(.eldritch-stop-eye-svg))::after,
                    button[aria-label="Unarchive conversation"]:not(:has(.eldritch-stop-eye-svg))::after {
                        content: "" !important;
                        position: absolute !important;
                        width: 3px !important;
                        height: 8px !important;
                        border-radius: 50% !important;
                        background: #000000 !important;
                        box-shadow: 0 0 3px #FF8593 !important;
                    }

                    .eldritch-stop-eye-svg {
                        width: 28px !important;
                        height: 28px !important;
                        overflow: visible !important;
                        pointer-events: none !important;
                        filter: drop-shadow(0 0 6px #FF1E38) !important;
                    }

                    button[aria-label="Stop execution"] .eldritch-stop-eye-svg {
                        width: 22px !important;
                        height: 22px !important;
                    }

                    button[data-testid="conversation-archive-button"] .eldritch-stop-eye-svg,
                    button[aria-label="Archive conversation"] .eldritch-stop-eye-svg,
                    button[aria-label="Unarchive conversation"] .eldritch-stop-eye-svg {
                        width: 19px !important;
                        height: 19px !important;
                    }

                    .eldritch-stop-pupil-group {
                        transform-origin: 18px 18px;
                        animation: eldritch-stop-pupil-scan 3.6s infinite ease-in-out;
                    }

                    .eldritch-stop-iris-ring {
                        transform-origin: 18px 18px;
                        animation: eldritch-iris-spin 10s infinite linear;
                    }

                    /* ==========================================================================
                       ELDRITCH HIGH-LEGIBILITY LEFT-TO-RIGHT GRADIENT TEXT EFFECT
                       ========================================================================== */
                    @keyframes eldritch-gradient-flow-ltr {
                        0% { background-position: 200% 50%; }
                        100% { background-position: 0% 50%; }
                    }

                    h1, h2, h3, h4 {
                        background: linear-gradient(
                            90deg,
                            #FF6B7D 0%,
                            #FF1E38 30%,
                            #FFB3BC 50%,
                            #FF1E38 70%,
                            #FF6B7D 100%
                        ) !important;
                        background-size: 200% 100% !important;
                        -webkit-background-clip: text !important;
                        background-clip: text !important;
                        -webkit-text-fill-color: transparent !important;
                        color: #FF2A44 !important;
                        filter: drop-shadow(0 0 10px rgba(255, 30, 56, 0.42)) !important;
                        letter-spacing: 0.02em !important;
                        animation: eldritch-gradient-flow-ltr 4.5s linear infinite !important;
                    }

                    h1:hover, h2:hover, h3:hover, h4:hover {
                        filter: drop-shadow(0 0 14px rgba(255, 30, 56, 0.8)) !important;
                    }

                    strong, b {
                        background: linear-gradient(
                            90deg,
                            #FFA3AF 0%,
                            #FF3B54 35%,
                            #FFE3E7 50%,
                            #FF3B54 65%,
                            #FFA3AF 100%
                        ) !important;
                        background-size: 200% 100% !important;
                        -webkit-background-clip: text !important;
                        background-clip: text !important;
                        -webkit-text-fill-color: transparent !important;
                        color: #FF475E !important;
                        filter: drop-shadow(0 0 6px rgba(255, 30, 56, 0.32)) !important;
                        animation: eldritch-gradient-flow-ltr 5.5s linear infinite !important;
                    }

                    strong:hover, b:hover {
                        filter: drop-shadow(0 0 10px rgba(255, 30, 56, 0.75)) !important;
                    }

                    a,
                    button[data-testid="automations-button"] {
                        color: #FF2E47 !important;
                        text-decoration-color: rgba(255, 30, 56, 0.5) !important;
                        text-shadow: 0 0 8px rgba(255, 30, 56, 0.38) !important;
                    }

                    a:hover,
                    button[data-testid="automations-button"]:hover {
                        color: #FF7A8A !important;
                        text-shadow:
                            0 0 12px rgba(255, 30, 56, 0.85),
                            0 4px 8px rgba(175, 0, 24, 0.7) !important;
                    }

                    code:not(pre code) {
                        background: linear-gradient(135deg, rgba(75, 4, 18, 0.72) 0%, rgba(28, 0, 6, 0.82) 100%) !important;
                        color: #FF6B7D !important;
                        border: 1px solid rgba(255, 30, 56, 0.4) !important;
                        box-shadow: 0 0 8px rgba(255, 30, 56, 0.2) !important;
                    }

                    pre {
                        background: rgba(2, 0, 1, 0.88) !important;
                        border: 1px solid rgba(255, 30, 56, 0.35) !important;
                        border-radius: 10px !important;
                        box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.9), 0 0 12px rgba(255, 30, 56, 0.12) !important;
                    }

                    ::selection {
                        background: rgba(255, 30, 56, 0.45) !important;
                        color: #FFFFFF !important;
                    }

                    /* ==========================================================================
                       SOFT NEON RED BLOOM ON ICONS & BUTTONS
                       ========================================================================== */
                    button svg, a svg {
                        filter: drop-shadow(0 0 4px rgba(255, 30, 56, 0.45));
                        transition: all 0.2s ease !important;
                    }

                    button:hover svg {
                        color: #FF1E38 !important;
                        filter: drop-shadow(0 0 9px rgba(255, 30, 56, 0.9)) !important;
                        transform: scale(1.06);
                    }

                    /* Scrollbar Styling */
                    ::-webkit-scrollbar {
                        width: 6px !important;
                        height: 6px !important;
                    }
                    ::-webkit-scrollbar-track {
                        background: rgba(0, 0, 0, 0.4) !important;
                    }
                    ::-webkit-scrollbar-thumb {
                        background: rgba(255, 30, 56, 0.45) !important;
                        border-radius: 9999px !important;
                        box-shadow: 0 0 8px rgba(255, 30, 56, 0.6) !important;
                    }
                    ::-webkit-scrollbar-thumb:hover {
                        background: #FF1E38 !important;
                    }

                    /* ==========================================================================
                       HEADER ELDRITCH EYE GIF WITH SEAMLESS BLEEDING BLEND (ORIGINAL 184x38 SIZE)
                       ========================================================================== */
                    [class*="@container/titlebar"] {
                        position: relative !important;
                        min-height: 42px !important;
                        background: linear-gradient(90deg, rgba(0, 0, 0, 0.85) 0%, rgba(28, 1, 7, 0.78) 50%, rgba(0, 0, 0, 0.85) 100%) !important;
                        border-bottom: 1px solid rgba(255, 30, 56, 0.45) !important;
                        box-shadow: 0 4px 20px rgba(255, 30, 56, 0.2) !important;
                    }

                    /* Keep right-side titlebar controls ("Open IDE", etc.) pinned to the right even when New Conversation / Conversation History hides the left title */
                    [class*="@container/titlebar"] > div.justify-end {
                        margin-left: auto !important;
                    }

                    #eldritch-rift-header {
                        position: absolute !important;
                        left: 50% !important;
                        top: 50% !important;
                        transform: translate(-50%, -50%) !important;
                        display: flex !important;
                        align-items: center !important;
                        justify-content: center !important;
                        padding: 1px 10px !important;
                        pointer-events: none !important;
                        user-select: none !important;
                        z-index: 10 !important;
                        mix-blend-mode: screen !important;
                        filter:
                            drop-shadow(0 0 10px rgba(255, 20, 48, 0.85))
                            drop-shadow(0 4px 14px rgba(175, 0, 24, 0.75)) !important;
                    }

                    .eldritch-rift-gif-frame {
                        position: relative !important;
                        /* Exact original size preserved: 184px x 38px */
                        width: 184px !important;
                        height: 38px !important;
                        background: transparent !important;
                        border: none !important;
                        overflow: hidden !important;
                        /* Seamless feathered bleeding blend mask — zero hard outline or box seam */
                        -webkit-mask-image:
                            radial-gradient(ellipse 52% 54% at 50% 50%, #000000 44%, rgba(0, 0, 0, 0.78) 68%, rgba(0, 0, 0, 0.22) 86%, transparent 100%) !important;
                        mask-image:
                            radial-gradient(ellipse 52% 54% at 50% 50%, #000000 44%, rgba(0, 0, 0, 0.78) 68%, rgba(0, 0, 0, 0.22) 86%, transparent 100%) !important;
                        animation: eldritch-pulse 3.8s infinite ease-in-out !important;
                    }

                    .eldritch-rift-gif {
                        position: absolute !important;
                        /* Exact original GIF size and centering preserved: 206px x 117px at translate(-50%, -36.5%) */
                        width: 206px !important;
                        height: 117px !important;
                        max-width: none !important;
                        left: 50% !important;
                        top: 50% !important;
                        transform: translate(-50%, -36.5%) !important;
                        mix-blend-mode: lighten !important;
                        filter: contrast(1.22) saturate(1.3) brightness(1.04) !important;
                    }

                    .eldritch-rift-gif-frame::after {
                        content: "" !important;
                        position: absolute !important;
                        inset: 0 !important;
                        background:
                            radial-gradient(ellipse 46% 48% at 50% 50%, rgba(255, 24, 52, 0.24) 0%, rgba(160, 0, 22, 0.18) 55%, transparent 100%) !important;
                        mix-blend-mode: color-dodge !important;
                        pointer-events: none !important;
                    }

                    @keyframes eldritch-pulse {
                        0%, 100% {
                            filter:
                                drop-shadow(0 0 6px rgba(255, 30, 56, 0.8))
                                drop-shadow(0 3px 10px rgba(160, 0, 22, 0.65));
                        }
                        50% {
                            filter:
                                drop-shadow(0 0 12px rgba(255, 30, 56, 0.98))
                                drop-shadow(0 5px 16px rgba(190, 0, 28, 0.9));
                        }
                    }
                \`;

                // 4. Inject Header Jagged Dark Rift with Animated Genshin Eye GIF
                function ensureRiftInsignia() {
                    const titlebar = document.querySelector('[class*="@container/titlebar"]');
                    if (titlebar && !document.getElementById('eldritch-rift-header')) {
                        const insignia = document.createElement('div');
                        insignia.id = 'eldritch-rift-header';
                        insignia.innerHTML = \`
                            <div class="eldritch-rift-gif-frame">
                                <img class="eldritch-rift-gif" src="\${eyeGifBlobUrl}" alt="Eldritch Rift Eye" />
                            </div>
                        \`;
                        titlebar.insertBefore(insignia, titlebar.children[1] || null);
                    }
                }

                // 5. Inject Animated Eldritch Eye into Stop Conversation & Stop Execution Buttons
                const stopEyeSvgMarkup = \`
                    <svg class="eldritch-stop-eye-svg" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <radialGradient id="stopEyeIris" cx="50%" cy="50%" r="50%">
                                <stop offset="0%" stop-color="#FF99A5" />
                                <stop offset="30%" stop-color="#FF1E38" />
                                <stop offset="72%" stop-color="#7A0010" />
                                <stop offset="100%" stop-color="#140003" />
                            </radialGradient>
                        </defs>
                        <!-- Jagged Eldritch Eyelid / Rift Socket -->
                        <path d="M2 18 L7 13 L11 14 L18 7 L25 14 L29 13 L34 18 L29 23 L25 22 L18 29 L11 22 L7 23 Z"
                              fill="#070002"
                              stroke="#FF1E38"
                              stroke-width="1.4" />
                        <!-- Inner Sclera / Blood Rim -->
                        <path d="M4.5 18 Q18 7.5 31.5 18 Q18 28.5 4.5 18 Z"
                              fill="#1C0005"
                              stroke="#FF4D64"
                              stroke-width="0.9" />
                        <!-- Rotating Arcane Iris Ring -->
                        <circle class="eldritch-stop-iris-ring" cx="18" cy="18" r="8.2"
                                stroke="#FF1E38"
                                stroke-width="0.7"
                                stroke-dasharray="2.5 1.8"
                                fill="none" />
                        <!-- Scanning Iris & Slit Pupil Group -->
                        <g class="eldritch-stop-pupil-group">
                            <circle cx="18" cy="18" r="7" fill="url(#stopEyeIris)" />
                            <circle cx="18" cy="18" r="4.8" stroke="#FFB3BC" stroke-width="0.45" stroke-dasharray="1.2 1" fill="none" />
                            <!-- Abyssal Vertical Slit Pupil -->
                            <ellipse cx="18" cy="18" rx="1.6" ry="6.1" fill="#000000" />
                            <!-- Ocular Glint Highlights -->
                            <circle cx="15.8" cy="15.2" r="1.2" fill="#FFFFFF" />
                            <circle cx="20.2" cy="20.5" r="0.65" fill="#FF8593" />
                        </g>
                    </svg>
                \`;

                function ensureStopEyeButtons() {
                    const selectors = [
                        'button[data-tooltip-id="input-send-button-cancel-tooltip"]',
                        'button[aria-label^="Cancel ("]',
                        'button[aria-label="Stop execution"]',
                        'button[data-testid="conversation-archive-button"]',
                        'button[aria-label="Archive conversation"]',
                        'button[aria-label="Unarchive conversation"]'
                    ];
                    const stopBtns = document.querySelectorAll(selectors.join(','));
                    stopBtns.forEach(btn => {
                        if (!btn.querySelector('.eldritch-stop-eye-svg')) {
                            btn.insertAdjacentHTML('beforeend', stopEyeSvgMarkup);
                        }
                    });
                }

                ensureRiftInsignia();
                ensureStopEyeButtons();

                // 6. Multi-Angle Small Video-Eye Hover Effect (Extracts ONLY the single eye from snaptik.vn_7586300755884182802.mp4 with rift removed; NO glitch/shake/lightning)
                const hoverEyeCanvas = document.createElement('canvas');
                hoverEyeCanvas.id = 'eldritch-hover-eye-popup';
                hoverEyeCanvas.style.cssText = \`
                    position: fixed !important;
                    top: 0 !important;
                    left: 0 !important;
                    width: 100vw !important;
                    height: 100vh !important;
                    pointer-events: none !important;
                    z-index: 10005 !important;
                \`;
                document.body.appendChild(hoverEyeCanvas);

                const hCtx = hoverEyeCanvas.getContext('2d');

                // 6b. Ambient Random Eye Rifts in the Background Layer (max 3, random size not too big, random rotation, random translucency & brightness, NO outline, <1s stagger/duration relative to first, behind text)
                const ambientRiftsCanvas = document.createElement('canvas');
                ambientRiftsCanvas.id = 'eldritch-ambient-rifts-canvas';
                ambientRiftsCanvas.style.cssText = \`
                    position: fixed !important;
                    top: 0 !important;
                    left: 0 !important;
                    width: 100vw !important;
                    height: 100vh !important;
                    pointer-events: none !important;
                    z-index: 0 !important;
                    mix-blend-mode: screen !important;
                \`;
                if (vignette && vignette.parentNode) {
                    vignette.parentNode.insertBefore(ambientRiftsCanvas, vignette.nextSibling);
                } else {
                    document.body.prepend(ambientRiftsCanvas);
                }
                const rCtx = ambientRiftsCanvas.getContext('2d');

                // Offscreen feather buffer so each ambient rift has ZERO hard outline and blends seamlessly like the raw video
                const rfW = 240;
                const rfH = 140;
                const riftFeatherCanvas = document.createElement('canvas');
                riftFeatherCanvas.width = rfW;
                riftFeatherCanvas.height = rfH;
                const rfCtx = riftFeatherCanvas.getContext('2d');

                function resizeHoverCanvas() {
                    hoverEyeCanvas.width = window.innerWidth;
                    hoverEyeCanvas.height = window.innerHeight;
                    ambientRiftsCanvas.width = window.innerWidth;
                    ambientRiftsCanvas.height = window.innerHeight;
                }
                resizeHoverCanvas();

                const activeAmbientRifts = [];
                const MAX_AMBIENT_RIFTS = 3;
                let ambientRiftTimer = 18;
                let firstRiftBaseMaxAge = 115;

                function spawnAmbientEyeRift() {
                    if (activeAmbientRifts.length >= MAX_AMBIENT_RIFTS) return;

                    const marginX = 140;
                    const marginY = 95;
                    const availW = Math.max(200, window.innerWidth - marginX * 2);
                    const availH = Math.max(160, window.innerHeight - marginY * 2);

                    let x = marginX + Math.random() * availW;
                    let y = marginY + Math.random() * availH;
                    for (let attempt = 0; attempt < 8; attempt++) {
                        const candX = marginX + Math.random() * availW;
                        const candY = marginY + Math.random() * availH;
                        const tooClose = activeAmbientRifts.some(r => Math.hypot(r.x - candX, r.y - candY) < 175);
                        if (!tooClose) {
                            x = candX;
                            y = candY;
                            break;
                        }
                    }

                    // Random size (not too big: 135px to 215px wide), full random rotation, random translucency & random brightness
                    const w = 135 + Math.random() * 80;
                    const h = w * (0.48 + Math.random() * 0.08);
                    const angle = (Math.random() - 0.5) * Math.PI * 2;
                    const baseAlpha = 0.28 + Math.random() * 0.48;     // Random translucency (0.28..0.76)
                    const brightness = 0.62 + Math.random() * 0.58;    // Random brightness (0.62..1.20)

                    const isFirst = activeAmbientRifts.length === 0;
                    if (isFirst) {
                        firstRiftBaseMaxAge = 105 + Math.floor(Math.random() * 30);
                    }
                    // Follow-up rifts have duration < 1s (15..52 frames) shorter than the first appearing rift
                    const maxAge = isFirst
                        ? firstRiftBaseMaxAge
                        : Math.max(48, firstRiftBaseMaxAge - (15 + Math.floor(Math.random() * 36)));

                    activeAmbientRifts.push({
                        x,
                        y,
                        w,
                        h,
                        angle,
                        baseAlpha,
                        brightness,
                        age: 0,
                        maxAge,
                        closing: false,
                        openProgress: 0.03
                    });
                }

                function renderAmbientEyeRifts() {
                    rCtx.clearRect(0, 0, ambientRiftsCanvas.width, ambientRiftsCanvas.height);

                    ambientRiftTimer--;
                    if (ambientRiftTimer <= 0 && activeAmbientRifts.length < MAX_AMBIENT_RIFTS) {
                        spawnAmbientEyeRift();
                        // If 1 or 2 rifts are active, spawn the next one within < 1s (14..45 frames = 0.23s..0.75s)
                        if (activeAmbientRifts.length < MAX_AMBIENT_RIFTS) {
                            ambientRiftTimer = 14 + Math.floor(Math.random() * 31);
                        } else {
                            ambientRiftTimer = 75 + Math.floor(Math.random() * 45);
                        }
                    }

                    if (activeAmbientRifts.length > 0 && video && video.readyState >= 2 && video.videoWidth > 0) {
                        const vw = video.videoWidth;
                        const vh = video.videoHeight;
                        // Full crimson Eye Rift region in snaptik.vn_7586300755884182802.mp4
                        const riftSx = vw * 0.16;
                        const riftSy = vh * 0.26;
                        const riftSw = vw * 0.66;
                        const riftSh = vh * 0.48;

                        // Prepare seamlessly feathered video frame (NO outline, pure soft video fade)
                        rfCtx.clearRect(0, 0, rfW, rfH);
                        rfCtx.globalCompositeOperation = 'source-over';
                        rfCtx.drawImage(video, riftSx, riftSy, riftSw, riftSh, 0, 0, rfW, rfH);
                        rfCtx.globalCompositeOperation = 'destination-in';
                        rfCtx.save();
                        rfCtx.translate(rfW * 0.5, rfH * 0.5);
                        rfCtx.scale(1.0, rfH / rfW);
                        const featherMask = rfCtx.createRadialGradient(0, 0, rfW * 0.16, 0, 0, rfW * 0.49);
                        featherMask.addColorStop(0, 'rgba(0, 0, 0, 1)');
                        featherMask.addColorStop(0.58, 'rgba(0, 0, 0, 0.86)');
                        featherMask.addColorStop(0.84, 'rgba(0, 0, 0, 0.32)');
                        featherMask.addColorStop(1, 'rgba(0, 0, 0, 0)');
                        rfCtx.fillStyle = featherMask;
                        rfCtx.beginPath();
                        rfCtx.arc(0, 0, rfW * 0.5, 0, Math.PI * 2);
                        rfCtx.fill();
                        rfCtx.restore();
                        rfCtx.globalCompositeOperation = 'source-over';

                        for (let i = activeAmbientRifts.length - 1; i >= 0; i--) {
                            const rift = activeAmbientRifts[i];
                            rift.age++;

                            if (rift.age >= rift.maxAge) {
                                rift.closing = true;
                            }

                            if (!rift.closing) {
                                rift.openProgress += (1.0 - rift.openProgress) * 0.18;
                            } else {
                                rift.openProgress -= 0.11;
                            }

                            if (rift.openProgress <= 0.02 && rift.closing) {
                                activeAmbientRifts.splice(i, 1);
                                continue;
                            }

                            const sy = Math.max(0.03, rift.openProgress);
                            const alpha = Math.min(rift.baseAlpha, rift.openProgress * rift.baseAlpha * 1.15);

                            rCtx.save();
                            rCtx.globalAlpha = alpha;
                            rCtx.filter = \`contrast(1.18) saturate(1.25) brightness(\${rift.brightness.toFixed(2)})\`;
                            rCtx.translate(rift.x, rift.y);
                            rCtx.rotate(rift.angle);
                            rCtx.scale(1.0, sy);
                            rCtx.drawImage(riftFeatherCanvas, -rift.w * 0.5, -rift.h * 0.5, rift.w, rift.h);
                            rCtx.filter = 'none';
                            rCtx.restore();
                        }
                    }
                }

                // Offscreen canvases that isolate the BIG MIDDLE EYE & its animated pupil from #eldritch-bg-video (snaptik.vn_7586300755884182802.mp4)
                const esW = 96;
                const esH = 60;
                const eyelidCanvas = document.createElement('canvas');
                eyelidCanvas.width = esW;
                eyelidCanvas.height = esH;
                const lidCtx = eyelidCanvas.getContext('2d');

                const pupilSize = 44;
                const pupilCanvas = document.createElement('canvas');
                pupilCanvas.width = pupilSize;
                pupilCanvas.height = pupilSize;
                const pupCtx = pupilCanvas.getContext('2d');

                let mouseX = window.innerWidth * 0.5;
                let mouseY = window.innerHeight * 0.5;

                function updateIsolatedBigMiddleEye() {
                    lidCtx.clearRect(0, 0, esW, esH);
                    pupCtx.clearRect(0, 0, pupilSize, pupilSize);

                    if (video && video.readyState >= 2 && video.videoWidth > 0) {
                        const vw = video.videoWidth;   // 768
                        const vh = video.videoHeight;  // 576
                        // Exact measured center of the BIG MIDDLE EYE in snaptik.vn_7586300755884182802.mp4:
                        // Center is at (367, 294) = (vw * 0.4778, vh * 0.5104), tilted +22deg, size 66x44px
                        const cx = vw * 0.4778;
                        const cy = vh * 0.5104;
                        const cropW = vw * 0.088;
                        const cropH = vh * 0.078;
                        const scaleX = esW / cropW;
                        const scaleY = esH / cropH;

                        // 1. Draw the Big Middle Eye's Almond Eyelid & Sclera into eyelidCanvas
                        lidCtx.save();
                        lidCtx.beginPath();
                        lidCtx.moveTo(3, esH * 0.5);
                        lidCtx.quadraticCurveTo(esW * 0.5, -4, esW - 3, esH * 0.5);
                        lidCtx.quadraticCurveTo(esW * 0.5, esH + 4, 3, esH * 0.5);
                        lidCtx.closePath();
                        lidCtx.clip();

                        lidCtx.translate(esW * 0.5, esH * 0.5);
                        lidCtx.rotate(-22 * Math.PI / 180);
                        lidCtx.scale(scaleX, scaleY);
                        lidCtx.filter = 'contrast(1.3) saturate(1.35) brightness(1.12)';
                        lidCtx.drawImage(video, -cx, -cy);
                        lidCtx.filter = 'none';
                        lidCtx.restore();

                        // Clear the static center pupil inside eyelidCanvas with dark abyssal sclera so the moving pupil can look around freely!
                        lidCtx.save();
                        const scleraMask = lidCtx.createRadialGradient(esW * 0.5, esH * 0.5, 2, esW * 0.5, esH * 0.5, 21);
                        scleraMask.addColorStop(0, 'rgba(5, 0, 1, 0.96)');
                        scleraMask.addColorStop(0.65, 'rgba(5, 0, 1, 0.88)');
                        scleraMask.addColorStop(1, 'rgba(5, 0, 1, 0)');
                        lidCtx.fillStyle = scleraMask;
                        lidCtx.beginPath();
                        lidCtx.arc(esW * 0.5, esH * 0.5, 21, 0, Math.PI * 2);
                        lidCtx.fill();
                        lidCtx.restore();

                        // 2. Extract ONLY the glowing animated crimson pupil from the center of the Big Middle Eye into pupilCanvas
                        pupCtx.save();
                        pupCtx.beginPath();
                        pupCtx.arc(pupilSize * 0.5, pupilSize * 0.5, pupilSize * 0.46, 0, Math.PI * 2);
                        pupCtx.closePath();
                        pupCtx.clip();

                        pupCtx.translate(pupilSize * 0.5, pupilSize * 0.5);
                        pupCtx.rotate(-22 * Math.PI / 180);
                        pupCtx.scale(scaleX * 1.08, scaleY * 1.08);
                        pupCtx.filter = 'contrast(1.35) saturate(1.4) brightness(1.2)';
                        pupCtx.drawImage(video, -cx, -cy);
                        pupCtx.filter = 'none';
                        pupCtx.restore();
                    }
                }

                // Active small hover eyes opening around the hovered element from various angles
                const activeHoverEyes = [];
                let currentHoverEl = null;
                let hoverSpawnCooldown = 0;

                const hoverSelector = 'button, a, [role="button"], [role="menuitem"], .inline-pill, input, textarea, [class*="group/user-input-step"] .bg-card-border, .gap-y-3 > .flex.items-start > .flex-col';

                function getTargetEyeCount(r) {
                    const perimeter = 2 * (r.width + r.height);
                    // Scale eye count cleanly to fit the hovered element's size (3 on small icons/pills up to 10 on large cards)
                    return Math.max(3, Math.min(10, Math.round(perimeter / 72)));
                }

                function spawnRandomEyeOnElement(el) {
                    const r = el.getBoundingClientRect();
                    if (r.width < 12 || r.height < 12) return;

                    // Pick a completely random position along the 4 edges/corners weighted by edge length
                    const perimeter = 2 * (r.width + r.height);
                    let p = Math.random() * perimeter;
                    let x = 0, y = 0, baseAngle = 0;

                    if (p < r.width) {
                        // Top edge
                        x = r.left + p + (Math.random() - 0.5) * 6;
                        y = r.top + (Math.random() - 0.5) * 5;
                        baseAngle = (Math.random() - 0.5) * 0.85;
                    } else if (p < r.width + r.height) {
                        // Right edge
                        x = r.right + (Math.random() - 0.5) * 5;
                        y = r.top + (p - r.width) + (Math.random() - 0.5) * 6;
                        baseAngle = (Math.random() - 0.5) * 1.15;
                    } else if (p < 2 * r.width + r.height) {
                        // Bottom edge
                        x = r.left + (p - r.width - r.height) + (Math.random() - 0.5) * 6;
                        y = r.bottom + (Math.random() - 0.5) * 5;
                        baseAngle = (Math.random() - 0.5) * 0.85;
                    } else {
                        // Left edge
                        x = r.left + (Math.random() - 0.5) * 5;
                        y = r.top + (p - 2 * r.width - r.height) + (Math.random() - 0.5) * 6;
                        baseAngle = (Math.random() - 0.5) * 1.15;
                    }

                    x = Math.max(12, Math.min(window.innerWidth - 12, x));
                    y = Math.max(10, Math.min(window.innerHeight - 10, y));

                    // Avoid overlapping right on top of another active eye
                    for (const existing of activeHoverEyes) {
                        if (!existing.closing && Math.hypot(existing.x - x, existing.y - y) < 14) return;
                    }

                    // Smaller eye size (13px to 23px wide) so multiple eyes fit cleanly around any hovered item
                    const minDim = Math.min(r.width, r.height);
                    const w = minDim < 34
                        ? 13 + Math.random() * 5
                        : 16 + Math.random() * 7;
                    const h = w * (esH / esW);

                    activeHoverEyes.push({
                        el,
                        x,
                        y,
                        w,
                        h,
                        angle: baseAngle,
                        age: 0,
                        maxAge: 52 + Math.floor(Math.random() * 45),
                        closing: false,
                        openProgress: 0.05,
                        gazeX: 0,
                        gazeY: 0
                    });
                }

                const onMouseOver = (e) => {
                    mouseX = e.clientX;
                    mouseY = e.clientY;
                    const target = e.target.closest(hoverSelector);
                    if (!target || target.querySelector('.eldritch-stop-eye-svg')) {
                        if (!target) currentHoverEl = null;
                        return;
                    }
                    if (target !== currentHoverEl) {
                        currentHoverEl = target;
                        for (const eye of activeHoverEyes) {
                            if (eye.el !== target) eye.closing = true;
                        }
                        const r = target.getBoundingClientRect();
                        const burstCount = Math.max(2, Math.ceil(getTargetEyeCount(r) * 0.7));
                        for (let i = 0; i < burstCount; i++) {
                            spawnRandomEyeOnElement(target);
                        }
                        hoverSpawnCooldown = 8;
                    }
                };

                const onMouseMove = (e) => {
                    mouseX = e.clientX;
                    mouseY = e.clientY;
                    if (currentHoverEl && !currentHoverEl.contains(e.target)) {
                        const next = e.target.closest(hoverSelector);
                        if (!next) {
                            currentHoverEl = null;
                            for (const eye of activeHoverEyes) eye.closing = true;
                        }
                    }
                };

                document.addEventListener('mouseover', onMouseOver, true);
                window.addEventListener('mousemove', onMouseMove, true);
                window.addEventListener('resize', resizeHoverCanvas);

                window.__eldritchHoverCleanup = () => {
                    document.removeEventListener('mouseover', onMouseOver, true);
                    window.removeEventListener('mousemove', onMouseMove, true);
                    window.removeEventListener('resize', resizeHoverCanvas);
                };

                function renderHoverEyes() {
                    renderAmbientEyeRifts();
                    hCtx.clearRect(0, 0, hoverEyeCanvas.width, hoverEyeCanvas.height);

                    if (currentHoverEl && document.body.contains(currentHoverEl)) {
                        hoverSpawnCooldown--;
                        const currentCount = activeHoverEyes.filter(e => !e.closing && e.el === currentHoverEl).length;
                        const r = currentHoverEl.getBoundingClientRect();
                        const maxEyes = getTargetEyeCount(r);
                        if (hoverSpawnCooldown <= 0 && currentCount < maxEyes) {
                            spawnRandomEyeOnElement(currentHoverEl);
                            hoverSpawnCooldown = 7 + Math.floor(Math.random() * 10);
                        }
                    } else if (currentHoverEl) {
                        currentHoverEl = null;
                    }

                    if (activeHoverEyes.length > 0) {
                        updateIsolatedBigMiddleEye();

                        for (let i = activeHoverEyes.length - 1; i >= 0; i--) {
                            const eye = activeHoverEyes[i];
                            eye.age++;

                            if (eye.age >= eye.maxAge || eye.el !== currentHoverEl) {
                                eye.closing = true;
                            }

                            if (!eye.closing) {
                                eye.openProgress += (1.0 - eye.openProgress) * 0.24;
                            } else {
                                eye.openProgress -= 0.14;
                            }

                            if (eye.openProgress <= 0.02 && eye.closing) {
                                activeHoverEyes.splice(i, 1);
                                continue;
                            }

                            // Occasional natural quick blink while open
                            let blinkScale = 1.0;
                            if (!eye.closing && eye.age > 22 && eye.age < 28) {
                                blinkScale = Math.abs(eye.age - 25) / 3.0;
                            }

                            // Calculate cursor vector in this eye's rotated coordinate system so the pupil ALWAYS looks at the cursor!
                            const dx = mouseX - eye.x;
                            const dy = mouseY - eye.y;
                            const cosA = Math.cos(-eye.angle);
                            const sinA = Math.sin(-eye.angle);
                            const localDx = dx * cosA - dy * sinA;
                            const localDy = dx * sinA + dy * cosA;
                            const dist = Math.hypot(localDx, localDy) || 1;
                            const gazeFactor = Math.min(1.0, dist / 90);
                            const targetGazeX = (localDx / dist) * gazeFactor * (eye.w * 0.20);
                            const targetGazeY = (localDy / dist) * gazeFactor * (eye.h * 0.16);

                            eye.gazeX += (targetGazeX - eye.gazeX) * 0.25;
                            eye.gazeY += (targetGazeY - eye.gazeY) * 0.25;

                            const sy = Math.max(0.04, eye.openProgress * blinkScale);
                            const alpha = Math.min(1.0, eye.openProgress * 1.25);

                            hCtx.save();
                            hCtx.globalAlpha = alpha;
                            hCtx.translate(eye.x, eye.y);
                            hCtx.rotate(eye.angle);
                            hCtx.scale(1.0, sy);

                            // Clip to almond eye boundary so the moving pupil stays cleanly inside the eyelids
                            hCtx.beginPath();
                            hCtx.moveTo(-eye.w * 0.47, 0);
                            hCtx.quadraticCurveTo(0, -eye.h * 0.56, eye.w * 0.47, 0);
                            hCtx.quadraticCurveTo(0, eye.h * 0.56, -eye.w * 0.47, 0);
                            hCtx.closePath();
                            hCtx.clip();

                            // 1. Draw the Big Middle Eye's Eyelid & Dark Sclera from the video
                            hCtx.drawImage(eyelidCanvas, -eye.w * 0.5, -eye.h * 0.5, eye.w, eye.h);

                            // 2. Draw the Big Middle Eye's Glowing Red Pupil shifted toward the cursor!
                            const pDrawSize = eye.h * 0.78;
                            hCtx.drawImage(
                                pupilCanvas,
                                eye.gazeX - pDrawSize * 0.5,
                                eye.gazeY - pDrawSize * 0.5,
                                pDrawSize,
                                pDrawSize
                            );
                            hCtx.restore();

                            // 3. Draw glowing crimson eyelid rim
                            hCtx.save();
                            hCtx.globalAlpha = alpha;
                            hCtx.translate(eye.x, eye.y);
                            hCtx.rotate(eye.angle);
                            hCtx.scale(1.0, sy);
                            hCtx.beginPath();
                            hCtx.moveTo(-eye.w * 0.47, 0);
                            hCtx.quadraticCurveTo(0, -eye.h * 0.54, eye.w * 0.47, 0);
                            hCtx.quadraticCurveTo(0, eye.h * 0.54, -eye.w * 0.47, 0);
                            hCtx.closePath();
                            hCtx.strokeStyle = '#FF1E38';
                            hCtx.lineWidth = 1.4;
                            hCtx.shadowColor = '#FF1E38';
                            hCtx.shadowBlur = 7;
                            hCtx.stroke();
                            hCtx.restore();
                        }
                    }

                    window.__eldritchHoverEyeAnimFrame = requestAnimationFrame(renderHoverEyes);
                }

                window.__eldritchHoverEyeAnimFrame = requestAnimationFrame(renderHoverEyes);

                // Observe DOM changes so Stop Eye and Header Insignia appear the instant React renders them
                if (window.__eldritchObserver) {
                    window.__eldritchObserver.disconnect();
                }
                window.__eldritchObserver = new MutationObserver(() => {
                    ensureRiftInsignia();
                    ensureStopEyeButtons();
                });
                window.__eldritchObserver.observe(document.body, { childList: true, subtree: true });

                return 'Eldritch Void Theme + Video Wallpaper + Eldritch Eye Stop Button Injected!';
            })()`;

            ws.send(JSON.stringify({
                id: 1,
                method: 'Runtime.evaluate',
                params: {
                    expression,
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
