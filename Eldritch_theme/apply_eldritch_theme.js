const fs = require('fs');
const path = require('path');

const LOCAL_VIDEO_PATH = path.join(__dirname, 'eldritch_bg.mp4');
const FALLBACK_VIDEO_PATH = 'C:\\Users\\ngole\\Downloads\\snaptik.vn_7586300755884182802.mp4';
const VIDEO_PATH = fs.existsSync(LOCAL_VIDEO_PATH) ? LOCAL_VIDEO_PATH : FALLBACK_VIDEO_PATH;

async function main() {
    if (!fs.existsSync(VIDEO_PATH)) {
        console.error('Video file not found at:', VIDEO_PATH);
        process.exit(1);
    }

    // Read video as base64
    const videoBuffer = fs.readFileSync(VIDEO_PATH);
    const videoBase64 = videoBuffer.toString('base64');
    console.log('Loaded video bytes:', videoBuffer.length);

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
        await injectIntoPage(page.webSocketDebuggerUrl, videoBase64);
    }
}

function injectIntoPage(wsUrl, videoBase64) {
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
                if (window.__capriCleanupListeners) {
                    window.__capriCleanupListeners();
                    window.__capriCleanupListeners = null;
                }
                if (window.__capriTopPopoutTimer) {
                    clearTimeout(window.__capriTopPopoutTimer);
                    window.__capriTopPopoutTimer = null;
                }
                [
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
                document.querySelectorAll('.prescript-stop-seal-svg').forEach(el => el.remove());

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

                    /* Target both Composer Cancel button and Command Stop Execution button */
                    button[data-tooltip-id="input-send-button-cancel-tooltip"],
                    button[aria-label^="Cancel ("],
                    button[aria-label="Stop execution"] {
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

                    button[data-tooltip-id="input-send-button-cancel-tooltip"]:hover,
                    button[aria-label^="Cancel ("]:hover,
                    button[aria-label="Stop execution"]:hover {
                        transform: scale(1.18) !important;
                        border-color: #FF8593 !important;
                        box-shadow:
                            0 0 20px #FF1E38,
                            0 0 40px #FF1E38,
                            inset 0 0 14px #FF1E38 !important;
                    }

                    /* Hide default red square or default stop square icon inside when Eldritch Eye is active */
                    button[data-tooltip-id="input-send-button-cancel-tooltip"] > div.bg-red-500,
                    button[aria-label^="Cancel ("] > div.bg-red-500,
                    button[aria-label="Stop execution"] > svg:not(.eldritch-stop-eye-svg) {
                        display: none !important;
                    }

                    /* Pure CSS fallback eye in case React re-renders before MutationObserver tick */
                    button[data-tooltip-id="input-send-button-cancel-tooltip"]:not(:has(.eldritch-stop-eye-svg))::before,
                    button[aria-label^="Cancel ("]:not(:has(.eldritch-stop-eye-svg))::before,
                    button[aria-label="Stop execution"]:not(:has(.eldritch-stop-eye-svg))::before {
                        content: "" !important;
                        position: absolute !important;
                        width: 18px !important;
                        height: 11px !important;
                        border-radius: 50% !important;
                        background: radial-gradient(circle, #FF6B7D 0%, #FF1E38 45%, #5E000C 85%, #000000 100%) !important;
                        border: 1px solid #FF1E38 !important;
                        box-shadow: 0 0 8px #FF1E38 !important;
                    }

                    button[data-tooltip-id="input-send-button-cancel-tooltip"]:not(:has(.eldritch-stop-eye-svg))::after,
                    button[aria-label^="Cancel ("]:not(:has(.eldritch-stop-eye-svg))::after,
                    button[aria-label="Stop execution"]:not(:has(.eldritch-stop-eye-svg))::after {
                        content: "" !important;
                        position: absolute !important;
                        width: 3px !important;
                        height: 9px !important;
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

                    .eldritch-stop-pupil-group {
                        transform-origin: 18px 18px;
                        animation: eldritch-stop-pupil-scan 3.6s infinite ease-in-out;
                    }

                    .eldritch-stop-iris-ring {
                        transform-origin: 18px 18px;
                        animation: eldritch-iris-spin 10s infinite linear;
                    }

                    /* ==========================================================================
                       HIGH-CONTRAST CRIMSON TEXT HIGHLIGHTS & CODE BLOCKS
                       ========================================================================== */
                    h1, h2, h3, h4 {
                        color: #FF2A44 !important;
                        text-shadow: 0 0 12px rgba(255, 30, 56, 0.42) !important;
                        letter-spacing: 0.02em !important;
                    }

                    strong, b {
                        color: #FF475E !important;
                        text-shadow: 0 0 8px rgba(255, 30, 56, 0.32) !important;
                    }

                    a,
                    button[data-testid="automations-button"] {
                        color: #FF1E38 !important;
                        text-decoration-color: rgba(255, 30, 56, 0.5) !important;
                        text-shadow: 0 0 8px rgba(255, 30, 56, 0.35) !important;
                    }

                    a:hover,
                    button[data-testid="automations-button"]:hover {
                        color: #FF6B7D !important;
                        text-shadow: 0 0 14px rgba(255, 30, 56, 0.75) !important;
                    }

                    code:not(pre code) {
                        background: rgba(65, 4, 16, 0.65) !important;
                        color: #FF5C70 !important;
                        border: 1px solid rgba(255, 30, 56, 0.38) !important;
                        box-shadow: 0 0 8px rgba(255, 30, 56, 0.18) !important;
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
                       HEADER JAGGED DARK RIFT INSIGNIA WITH MULTI-EYED CRIMSON PUPILS
                       ========================================================================== */
                    [class*="@container/titlebar"] {
                        position: relative !important;
                        background: linear-gradient(90deg, rgba(0, 0, 0, 0.85) 0%, rgba(28, 1, 7, 0.78) 50%, rgba(0, 0, 0, 0.85) 100%) !important;
                        border-bottom: 1px solid rgba(255, 30, 56, 0.45) !important;
                        box-shadow: 0 4px 20px rgba(255, 30, 56, 0.2) !important;
                    }

                    #eldritch-rift-header {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 10px;
                        padding: 2px 14px;
                        pointer-events: none;
                        user-select: none;
                        filter: drop-shadow(0 0 10px rgba(255, 30, 56, 0.7));
                    }

                    @keyframes eldritch-pulse {
                        0%, 100% {
                            filter: drop-shadow(0 0 6px #FF1E38) drop-shadow(0 0 14px rgba(255, 30, 56, 0.6));
                            transform: scale(1);
                        }
                        50% {
                            filter: drop-shadow(0 0 12px #FF1E38) drop-shadow(0 0 24px rgba(255, 30, 56, 0.95));
                            transform: scale(1.03);
                        }
                    }

                    @keyframes pupil-dilate {
                        0%, 100% { transform: scaleY(1) scaleX(1); opacity: 0.92; }
                        45% { transform: scaleY(1.08) scaleX(0.75); opacity: 1; }
                        48% { transform: scaleY(0.12) scaleX(1.1); opacity: 0.85; }
                        52% { transform: scaleY(1.05) scaleX(0.8); opacity: 1; }
                    }

                    .eldritch-rift-svg {
                        height: 28px;
                        width: 190px;
                        animation: eldritch-pulse 3.8s infinite ease-in-out;
                    }

                    .eldritch-eye-group {
                        transform-origin: center;
                        animation: pupil-dilate 6s infinite ease-in-out;
                    }

                    .eldritch-eye-group.delay-1 {
                        animation-delay: -2.1s;
                        animation-duration: 5.2s;
                    }

                    .eldritch-eye-group.delay-2 {
                        animation-delay: -3.7s;
                        animation-duration: 6.8s;
                    }

                    .eldritch-eye-group.delay-3 {
                        animation-delay: -1.3s;
                        animation-duration: 4.7s;
                    }
                \`;

                // 4. Inject Header Jagged Dark Rift Multi-Eyed Insignia
                function ensureRiftInsignia() {
                    const titlebar = document.querySelector('[class*="@container/titlebar"]');
                    if (titlebar && !document.getElementById('eldritch-rift-header')) {
                        const insignia = document.createElement('div');
                        insignia.id = 'eldritch-rift-header';
                        insignia.innerHTML = \`
                            <svg class="eldritch-rift-svg" viewBox="0 0 220 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <defs>
                                    <radialGradient id="crimsonIris" cx="50%" cy="50%" r="50%">
                                        <stop offset="0%" stop-color="#FF8593" />
                                        <stop offset="35%" stop-color="#FF1E38" />
                                        <stop offset="75%" stop-color="#8A0012" />
                                        <stop offset="100%" stop-color="#140003" />
                                    </radialGradient>
                                    <linearGradient id="riftEdge" x1="0%" y1="50%" x2="100%" y2="50%">
                                        <stop offset="0%" stop-color="transparent" />
                                        <stop offset="18%" stop-color="#FF1E38" />
                                        <stop offset="50%" stop-color="#FF6B7D" />
                                        <stop offset="82%" stop-color="#FF1E38" />
                                        <stop offset="100%" stop-color="transparent" />
                                    </linearGradient>
                                </defs>

                                <path d="M4 18 L24 14 L35 20 L52 10 L70 15 L88 6 L110 13 L132 6 L150 15 L168 10 L185 20 L196 14 L216 18 L196 22 L183 17 L166 26 L148 21 L130 30 L110 23 L90 30 L72 21 L54 26 L37 17 L24 22 Z"
                                      fill="#030001"
                                      stroke="url(#riftEdge)"
                                      stroke-width="1.3" />

                                <path d="M18 18 L45 15 L68 19 L110 17 L152 19 L175 15 L202 18"
                                      stroke="#FF1E38"
                                      stroke-width="0.6"
                                      stroke-opacity="0.55" />

                                <g class="eldritch-eye-group delay-1" style="transform-origin: 54px 18px;">
                                    <path d="M43 18 Q54 10 65 18 Q54 26 43 18 Z" fill="#1A0005" stroke="#FF1E38" stroke-width="1" />
                                    <circle cx="54" cy="18" r="4.5" fill="url(#crimsonIris)" />
                                    <ellipse cx="54" cy="18" rx="1.1" ry="3.8" fill="#000000" />
                                    <circle cx="52.5" cy="16.5" r="0.8" fill="#FFD1D6" />
                                </g>

                                <g class="eldritch-eye-group delay-3" style="transform-origin: 82px 16px;">
                                    <path d="M74 16 Q82 11 90 16 Q82 21 74 16 Z" fill="#1A0005" stroke="#FF1E38" stroke-width="0.8" />
                                    <circle cx="82" cy="16" r="3" fill="url(#crimsonIris)" />
                                    <ellipse cx="82" cy="16" rx="0.8" ry="2.5" fill="#000000" />
                                </g>

                                <g class="eldritch-eye-group" style="transform-origin: 110px 18px;">
                                    <path d="M93 18 Q110 5 127 18 Q110 31 93 18 Z" fill="#120003" stroke="#FF1E38" stroke-width="1.4" />
                                    <circle cx="110" cy="18" r="7.2" fill="url(#crimsonIris)" />
                                    <circle cx="110" cy="18" r="5.2" stroke="#FF8593" stroke-width="0.5" stroke-dasharray="1.5 1" fill="none" />
                                    <ellipse cx="110" cy="18" rx="1.5" ry="6.2" fill="#000000" />
                                    <circle cx="108" cy="15.5" r="1.2" fill="#FFFFFF" />
                                </g>

                                <g class="eldritch-eye-group delay-2" style="transform-origin: 138px 20px;">
                                    <path d="M130 20 Q138 15 146 20 Q138 25 130 20 Z" fill="#1A0005" stroke="#FF1E38" stroke-width="0.8" />
                                    <circle cx="138" cy="20" r="3" fill="url(#crimsonIris)" />
                                    <ellipse cx="138" cy="20" rx="0.8" ry="2.5" fill="#000000" />
                                </g>

                                <g class="eldritch-eye-group delay-1" style="transform-origin: 166px 18px;">
                                    <path d="M155 18 Q166 10 177 18 Q166 26 155 18 Z" fill="#1A0005" stroke="#FF1E38" stroke-width="1" />
                                    <circle cx="166" cy="18" r="4.5" fill="url(#crimsonIris)" />
                                    <ellipse cx="166" cy="18" rx="1.1" ry="3.8" fill="#000000" />
                                    <circle cx="164.5" cy="16.5" r="0.8" fill="#FFD1D6" />
                                </g>
                            </svg>
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
                        'button[aria-label="Stop execution"]'
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
