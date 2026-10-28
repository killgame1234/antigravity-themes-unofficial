const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const THEME_DIR = __dirname;
const VIDEO1_PATH = path.join(THEME_DIR, 'black_shores_scenery_archipelago.mp4');
const VIDEO2_PATH = path.join(THEME_DIR, 'black_shores_scenery_cavern.mp4');
const SPLASH_PATH = path.join(THEME_DIR, 'shorekeeper_splash_art.png');
const CHIBI_PATH = path.join(THEME_DIR, 'shorekeeper_chibi_companion.gif');
const AVATAR_PATH = path.join(THEME_DIR, 'shorekeeper_avatar_icon.png');
const ICO_PATH = path.join(THEME_DIR, 'shorekeeper.ico');
const CREST_SVG_PATH = path.join(THEME_DIR, 'shorekeeper_crest.svg');

// Update Windows Shortcut Icon for Taskbar & Start Menu
try {
    if (fs.existsSync(ICO_PATH)) {
        const escapedIco = ICO_PATH.replace(/\\/g, '\\\\');
        const psCmd = `powershell -WindowStyle Hidden -Command "$wsh = New-Object -ComObject WScript.Shell; $lnk = [System.IO.Path]::Combine($env:APPDATA, 'Microsoft\\Windows\\Start Menu\\Programs\\Antigravity.lnk'); if (Test-Path $lnk) { $s = $wsh.CreateShortcut($lnk); $s.IconLocation = '${escapedIco},0'; $s.Save() }"`;
        exec(psCmd, (err) => {
            if (err) console.log('Shortcut icon notice:', err.message);
            else console.log('[+] Windows shortcut icon successfully updated to Shorekeeper emblem!');
        });
    }
} catch (e) {}

const BLACK_SHORES_CSS = `
    :root, .dark, .theme-dark, body {
        --background: transparent !important;
        --sidebar: rgba(2, 6, 17, 0.82) !important;
        --sidebar-secondary: rgba(0, 240, 255, 0.12) !important;
        --sidebar-muted: rgba(129, 140, 248, 0.08) !important;
        --card: rgba(4, 10, 28, 0.82) !important;
        --card-border: rgba(0, 240, 255, 0.38) !important;
        --border: rgba(129, 140, 248, 0.24) !important;
        --muted: rgba(6, 14, 34, 0.78) !important;
        --foreground: #F8FAFC !important;
        --secondary-foreground: #94A3B8 !important;
        --tethys-cyan: #00f0ff;
        --tethys-cyan-glow: #38bdf8;
        --tethys-iris: #818cf8;
        --tethys-lilac: #c084fc;
        --tethys-starlight: #f0fdfa;
        --abyssal-black: #020611;
    }

    /* Base Body & Abyssal Sea Setup */
    html, body {
        background-color: #020611 !important;
        color: #F8FAFC !important;
        overflow-x: hidden !important;
    }

    /* Real Game Scenery Video Backgrounds with 1.8s Cross-Fade */
    #blackshores-video-1, #blackshores-video-2 {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        object-fit: cover !important;
        z-index: 0 !important;
        pointer-events: none !important;
        transition: opacity 1.8s ease-in-out !important;
    }

    body.scenery-archipelago #blackshores-video-1 {
        opacity: 0.76 !important;
    }
    body.scenery-archipelago #blackshores-video-2 {
        opacity: 0 !important;
    }

    body.scenery-cavern #blackshores-video-1 {
        opacity: 0 !important;
    }
    body.scenery-cavern #blackshores-video-2 {
        opacity: 0.78 !important;
    }

    /* Abyssal Vignette Gradient Overlay for Maximum Text Readability */
    #blackshores-vignette-overlay {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        z-index: 0 !important;
        pointer-events: none !important;
        background:
            radial-gradient(ellipse at 50% 50%, rgba(2, 6, 17, 0.25) 0%, rgba(2, 6, 17, 0.65) 60%, rgba(1, 3, 8, 0.94) 100%),
            linear-gradient(180deg, rgba(2, 6, 17, 0.8) 0%, transparent 18%, transparent 75%, rgba(1, 3, 8, 0.96) 100%) !important;
    }

    /* Living Canvas Engine Overlay */
    #blackshores-canvas {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        z-index: 0 !important;
        pointer-events: none !important;
    }

    /* Official Shorekeeper Splash Art Right-Docking */
    #shorekeeper-right-artwork {
        position: fixed !important;
        right: 1.5vw !important;
        bottom: 0 !important;
        height: 88vh !important;
        max-width: 46vw !important;
        object-fit: contain !important;
        pointer-events: none !important;
        z-index: 1 !important;
        transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 4s ease-in-out !important;
        animation: shorekeeperFloat 5s infinite alternate ease-in-out;
        filter: drop-shadow(0 0 24px rgba(0, 240, 255, 0.35)) drop-shadow(0 0 60px rgba(129, 140, 248, 0.22));
    }

    @keyframes shorekeeperFloat {
        0% { transform: translateY(0px) scale(1); }
        100% { transform: translateY(-12px) scale(1.01); }
    }

    /* Splash Art Opacity Adaptability */
    body.mode-new-conv #shorekeeper-right-artwork {
        opacity: 0.92 !important;
    }
    body.mode-active-chat #shorekeeper-right-artwork {
        opacity: 0.35 !important;
    }
    @media (max-width: 1280px) {
        body.mode-active-chat #shorekeeper-right-artwork {
            opacity: 0 !important;
        }
    }

    /* Interactive Animated Chibi Companion */
    #shorekeeper-chibi-companion {
        position: fixed !important;
        bottom: 24px !important;
        right: 28px !important;
        width: 86px !important;
        height: 86px !important;
        z-index: 15 !important;
        cursor: pointer !important;
        user-select: none !important;
        transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
        filter: drop-shadow(0 4px 14px rgba(0, 240, 255, 0.45));
    }

    #shorekeeper-chibi-companion:hover {
        transform: translateY(-8px) scale(1.1) !important;
        filter: drop-shadow(0 8px 24px rgba(0, 240, 255, 0.75)) drop-shadow(0 0 16px rgba(192, 132, 252, 0.6));
    }

    #shorekeeper-chibi-companion img {
        width: 100% !important;
        height: 100% !important;
        object-fit: contain !important;
        pointer-events: none !important;
    }

    .chibi-speech-bubble {
        position: absolute;
        bottom: 92px;
        right: 0;
        min-width: 170px;
        max-width: 230px;
        background: rgba(3, 8, 22, 0.88);
        border: 1px solid rgba(0, 240, 255, 0.45);
        border-radius: 12px;
        padding: 7px 12px;
        font-size: 11px;
        font-style: italic;
        color: #f1f5f9;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.6), 0 0 12px rgba(0, 240, 255, 0.25);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        pointer-events: none;
        opacity: 0;
        transform: translateY(6px);
        transition: opacity 0.35s ease, transform 0.35s ease;
        text-align: center;
    }

    #shorekeeper-chibi-companion:hover .chibi-speech-bubble,
    #shorekeeper-chibi-companion.bubble-active .chibi-speech-bubble {
        opacity: 1;
        transform: translateY(0);
    }

    /* Make App Windows Translucent */
    #root, .app-root, [data-testid="app-root"], main {
        background: transparent !important;
        position: relative !important;
        z-index: 2 !important;
    }

    /* Left Sidebar: Deep Abyssal Glassmorphism */
    nav, aside, [data-testid="sidebar"], div[class*="sidebar"] {
        background: rgba(2, 6, 17, 0.76) !important;
        backdrop-filter: blur(20px) !important;
        -webkit-backdrop-filter: blur(20px) !important;
        border-right: 1px solid rgba(0, 240, 255, 0.18) !important;
        box-shadow: 4px 0 24px rgba(0, 0, 0, 0.45) !important;
    }

    /* Chat Messages Glassmorphism */
    [class*="group/user-input-step"], div[data-testid="user-message"] {
        background: rgba(6, 16, 40, 0.76) !important;
        border: 1px solid rgba(0, 240, 255, 0.4) !important;
        border-radius: 18px !important;
        box-shadow: 0 4px 24px rgba(0, 240, 255, 0.08), inset 0 0 16px rgba(0, 240, 255, 0.04) !important;
        backdrop-filter: blur(14px) !important;
        -webkit-backdrop-filter: blur(14px) !important;
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
    }

    [class*="group/user-input-step"]:hover, div[data-testid="user-message"]:hover {
        border-color: rgba(0, 240, 255, 0.75) !important;
        box-shadow: 0 6px 32px rgba(0, 240, 255, 0.18), inset 0 0 20px rgba(0, 240, 255, 0.08) !important;
    }

    div[data-testid="assistant-message"], [class*="prose"] {
        color: #F8FAFC !important;
    }

    /* Code Blocks */
    pre {
        background: rgba(2, 6, 18, 0.92) !important;
        border: 1px solid rgba(129, 140, 248, 0.32) !important;
        border-radius: 12px !important;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5) !important;
    }

    code:not(pre code) {
        background: rgba(0, 240, 255, 0.12) !important;
        color: #38bdf8 !important;
        border: 1px solid rgba(0, 240, 255, 0.3) !important;
        border-radius: 6px !important;
        padding: 2px 6px !important;
    }

    /* Input Composer Area */
    .rounded-2xl.bg-card-border, div:has(> textarea) {
        background: rgba(3, 9, 26, 0.88) !important;
        border: 1px solid rgba(0, 240, 255, 0.42) !important;
        border-radius: 20px !important;
        box-shadow: 0 4px 30px rgba(0, 0, 0, 0.65), 0 0 20px rgba(0, 240, 255, 0.15) !important;
        backdrop-filter: blur(20px) !important;
        -webkit-backdrop-filter: blur(20px) !important;
        transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1) !important;
    }

    .rounded-2xl.bg-card-border:focus-within, div:has(> textarea):focus-within {
        border-color: #00f0ff !important;
        box-shadow: 0 8px 38px rgba(0, 240, 255, 0.28), 0 0 26px rgba(129, 140, 248, 0.35) !important;
    }

    textarea {
        color: #F8FAFC !important;
    }

    /* Supernal Resonance (Stage 3) Dynamic Animated Shimmer */
    @keyframes tethysAuroraFlow {
        0% {
            border-color: rgba(0, 240, 255, 0.7);
            box-shadow: 0 0 22px rgba(0, 240, 255, 0.35), 0 0 8px rgba(129, 140, 248, 0.2);
        }
        50% {
            border-color: rgba(192, 132, 252, 0.85);
            box-shadow: 0 0 30px rgba(192, 132, 252, 0.4), 0 0 12px rgba(0, 240, 255, 0.3);
        }
        100% {
            border-color: rgba(0, 240, 255, 0.7);
            box-shadow: 0 0 22px rgba(0, 240, 255, 0.35), 0 0 8px rgba(129, 140, 248, 0.2);
        }
    }

    body.stage-resonance .rounded-2xl.bg-card-border,
    body.stage-resonance div:has(> textarea) {
        animation: tethysAuroraFlow 3s infinite ease-in-out !important;
    }

    /* Top App Navigation Avatar Icon */
    .shorekeeper-avatar-btn {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        cursor: pointer;
        object-fit: cover;
        border: 1.5px solid rgba(0, 240, 255, 0.65);
        box-shadow: 0 0 12px rgba(0, 240, 255, 0.4), inset 0 0 6px rgba(0, 240, 255, 0.2);
        transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease, border-color 0.4s ease;
    }
    .shorekeeper-avatar-btn:hover {
        transform: scale(1.15) rotate(6deg);
        border-color: #38bdf8;
        box-shadow: 0 0 20px rgba(0, 240, 255, 0.85), 0 0 28px rgba(192, 132, 252, 0.7);
    }

    /* Audio Toggle Button in Top Bar */
    #tethys-audio-toggle {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 10px;
        margin-left: 8px;
        border-radius: 9999px;
        font-family: inherit;
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.04em;
        cursor: pointer;
        user-select: none;
        transition: all 0.25s ease;
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
    }
    #tethys-audio-toggle.audio-on {
        background: rgba(0, 240, 255, 0.14);
        border: 1px solid rgba(0, 240, 255, 0.55);
        color: #38bdf8;
        box-shadow: 0 0 12px rgba(0, 240, 255, 0.25);
    }
    #tethys-audio-toggle.audio-off {
        background: rgba(148, 163, 184, 0.08);
        border: 1px solid rgba(148, 163, 184, 0.22);
        color: #64748b;
        box-shadow: none;
    }
    #tethys-audio-toggle:hover {
        transform: translateY(-1px);
        filter: brightness(1.2);
    }

    /* Scenery Switcher Pill Button in Top Bar */
    #tethys-scenery-toggle {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 10px;
        margin-left: 6px;
        border-radius: 9999px;
        font-family: inherit;
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.04em;
        cursor: pointer;
        user-select: none;
        transition: all 0.25s ease;
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        background: rgba(129, 140, 248, 0.15);
        border: 1px solid rgba(129, 140, 248, 0.5);
        color: #c084fc;
        box-shadow: 0 0 12px rgba(129, 140, 248, 0.25);
    }
    #tethys-scenery-toggle:hover {
        transform: translateY(-1px);
        filter: brightness(1.25);
    }

    /* =========================================================================
       NEW CONVERSATION SYMMETRICAL HUD (TETHYS TERMINAL)
       ========================================================================= */

    /* Floating Holographic Crest Seal Docked Above Composer */
    #tethys-crest-seal {
        position: fixed;
        left: 50%;
        transform: translate(-50%, -100%);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        pointer-events: none;
        z-index: 10;
        transition: opacity 0.65s cubic-bezier(0.16, 1, 0.3, 1), transform 0.65s cubic-bezier(0.16, 1, 0.3, 1);
    }

    #tethys-crest-seal.hud-hidden {
        opacity: 0 !important;
        pointer-events: none !important;
        transform: translate(-50%, -120%) scale(0.96) !important;
    }

    .tethys-seal-ring-container {
        position: relative;
        width: 170px;
        height: 170px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .tethys-seal-bg-glow {
        position: absolute;
        width: 140px;
        height: 140px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(0, 240, 255, 0.35) 0%, rgba(129, 140, 248, 0.18) 50%, transparent 70%);
        filter: blur(14px);
        animation: tethysPulse 4s infinite alternate ease-in-out;
    }

    @keyframes tethysPulse {
        0% { transform: scale(0.92); opacity: 0.6; }
        100% { transform: scale(1.15); opacity: 1; }
    }

    .tethys-orbit-ring {
        position: absolute;
        border-radius: 50%;
        pointer-events: none;
    }

    .tethys-orbit-outer {
        width: 164px;
        height: 164px;
        border: 1px dashed rgba(0, 240, 255, 0.45);
        animation: tethysSpinClockwise 32s linear infinite;
    }

    .tethys-orbit-inner {
        width: 136px;
        height: 136px;
        border: 1px solid rgba(192, 132, 252, 0.35);
        border-top-color: rgba(0, 240, 255, 0.9);
        border-bottom-color: rgba(129, 140, 248, 0.9);
        animation: tethysSpinCounter 20s linear infinite;
    }

    @keyframes tethysSpinClockwise {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }

    @keyframes tethysSpinCounter {
        from { transform: rotate(360deg); }
        to { transform: rotate(0deg); }
    }

    .tethys-seal-emblem-img {
        width: 110px;
        height: 110px;
        object-fit: contain;
        position: relative;
        z-index: 2;
        filter: drop-shadow(0 0 12px rgba(0, 240, 255, 0.6));
    }

    .tethys-seal-title {
        margin-top: 10px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 13px;
        font-weight: 700;
        letter-spacing: 0.28em;
        text-transform: uppercase;
        background: linear-gradient(135deg, #00f0ff 0%, #818cf8 50%, #c084fc 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        text-shadow: 0 0 16px rgba(0, 240, 255, 0.35);
    }

    .tethys-seal-subtitle {
        margin-top: 3px;
        font-size: 10px;
        letter-spacing: 0.16em;
        color: #94a3b8;
        text-transform: uppercase;
    }

    /* Symmetrical Telemetry Card Docked Below Composer */
    #tethys-telemetry-card {
        position: fixed;
        left: 50%;
        transform: translateX(-50%);
        width: 90%;
        max-width: 640px;
        background: rgba(3, 8, 22, 0.82);
        border: 1px solid rgba(0, 240, 255, 0.35);
        border-radius: 14px;
        padding: 10px 18px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.65), inset 0 0 20px rgba(0, 240, 255, 0.06);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        pointer-events: auto;
        z-index: 10;
        display: flex;
        flex-direction: column;
        gap: 6px;
        transition: opacity 0.65s cubic-bezier(0.16, 1, 0.3, 1), transform 0.65s cubic-bezier(0.16, 1, 0.3, 1);
    }

    #tethys-telemetry-card.hud-hidden {
        opacity: 0 !important;
        pointer-events: none !important;
        transform: translate(-50%, 20px) scale(0.96) !important;
    }

    .tethys-telemetry-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 10.5px;
        font-weight: 600;
        letter-spacing: 0.1em;
        color: #38bdf8;
        border-bottom: 1px solid rgba(0, 240, 255, 0.14);
        padding-bottom: 5px;
    }

    .tethys-eq-container {
        display: flex;
        align-items: flex-end;
        gap: 3px;
        height: 14px;
    }

    .tethys-eq-bar {
        width: 2.5px;
        border-radius: 1px;
        background: linear-gradient(180deg, #00f0ff 0%, #818cf8 100%);
        box-shadow: 0 0 4px rgba(0, 240, 255, 0.6);
        transition: height 0.12s ease;
    }

    .tethys-telemetry-decree-box {
        min-height: 22px;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        font-size: 12px;
        font-style: italic;
        color: #e2e8f0;
        text-shadow: 0 0 8px rgba(0, 240, 255, 0.25);
        transition: opacity 0.5s ease;
    }
`;

async function main() {
    console.log('[*] Reading real game assets and scenery videos...');
    let video1Base64 = '';
    if (fs.existsSync(VIDEO1_PATH)) {
        const v1Buf = fs.readFileSync(VIDEO1_PATH);
        video1Base64 = v1Buf.toString('base64');
        console.log('[+] Loaded Scenery 1 (Archipelago Dawn):', v1Buf.length, 'bytes');
    }

    let video2Base64 = '';
    if (fs.existsSync(VIDEO2_PATH)) {
        const v2Buf = fs.readFileSync(VIDEO2_PATH);
        video2Base64 = v2Buf.toString('base64');
        console.log('[+] Loaded Scenery 2 (Subterranean Cavern):', v2Buf.length, 'bytes');
    }

    let splashBase64 = '';
    if (fs.existsSync(SPLASH_PATH)) {
        const sBuf = fs.readFileSync(SPLASH_PATH);
        splashBase64 = sBuf.toString('base64');
        console.log('[+] Loaded Shorekeeper Splash Art:', sBuf.length, 'bytes');
    }

    let chibiBase64 = '';
    if (fs.existsSync(CHIBI_PATH)) {
        const cBuf = fs.readFileSync(CHIBI_PATH);
        chibiBase64 = cBuf.toString('base64');
        console.log('[+] Loaded Shorekeeper Chibi GIF:', cBuf.length, 'bytes');
    }

    let avatarBase64 = '';
    if (fs.existsSync(AVATAR_PATH)) {
        const aBuf = fs.readFileSync(AVATAR_PATH);
        avatarBase64 = aBuf.toString('base64');
        console.log('[+] Loaded Shorekeeper Avatar Icon:', aBuf.length, 'bytes');
    }

    let crestSvgRaw = '';
    if (fs.existsSync(CREST_SVG_PATH)) {
        crestSvgRaw = fs.readFileSync(CREST_SVG_PATH, 'utf8');
        console.log('[+] Loaded Shorekeeper Crest SVG:', crestSvgRaw.length, 'bytes');
    }

    const appData = process.env.APPDATA || 'C:\\Users\\ngole\\AppData\\Roaming';
    const portFile = path.join(appData, 'Antigravity', 'DevToolsActivePort');
    let port = 51231;
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
        await injectIntoPage(page.webSocketDebuggerUrl, {
            video1Base64,
            video2Base64,
            splashBase64,
            chibiBase64,
            avatarBase64,
            crestSvgRaw
        });
    }
    console.log('[+] The Black Shores & Shorekeeper Theme (Real Game Scenery Engine) Live!');
}

function injectIntoPage(wsUrl, assets) {
    return new Promise((resolve, reject) => {
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
            const injectedCode = `(async function() {
                const ASSETS = ${JSON.stringify(assets)};

                // =========================================================================
                // 0. CLEANUP PREVIOUS THEME TIMERS, LISTENERS, AND GLOBAL STATE
                // =========================================================================
                const prev = window.__blackShoresState || {};
                if (prev.watchdog) try { clearInterval(prev.watchdog); } catch(e){}
                if (prev.decreeTimer) try { clearInterval(prev.decreeTimer); } catch(e){}
                if (prev.sceneryTimer) try { clearInterval(prev.sceneryTimer); } catch(e){}
                if (prev.animFrame) try { cancelAnimationFrame(prev.animFrame); } catch(e){}
                if (prev.observer) try { prev.observer.disconnect(); } catch(e){}
                if (prev.cleanupListeners) try { prev.cleanupListeners(); } catch(e){}

                // If Moonlit theme is running, clean it up completely
                if (window.__moonlitState) {
                    try { if (window.__moonlitState.watchdog) clearInterval(window.__moonlitState.watchdog); } catch(e){}
                    try { if (window.__moonlitState.animFrame) cancelAnimationFrame(window.__moonlitState.animFrame); } catch(e){}
                    try { if (window.__moonlitState.observer) window.__moonlitState.observer.disconnect(); } catch(e){}
                    try { if (window.__moonlitState.cleanupListeners) window.__moonlitState.cleanupListeners(); } catch(e){}
                    try {
                        const m1 = document.getElementById('moonlit-bg-video-1'); if (m1) m1.remove();
                        const m2 = document.getElementById('moonlit-bg-video-2'); if (m2) m2.remove();
                        const mc = document.getElementById('moonlit-particles-canvas'); if (mc) mc.remove();
                        const mv = document.getElementById('moonlit-vignette-overlay'); if (mv) mv.remove();
                        const me = document.getElementById('moonlit-lotus-emblem'); if (me) me.remove();
                        const mcard = document.getElementById('moonlit-calendar-card'); if (mcard) mcard.remove();
                        const mp = document.getElementById('moonlit-poem-box'); if (mp) mp.remove();
                        const ms = document.getElementById('moonlit-theme-css'); if (ms) ms.remove();
                    } catch(e){}
                    window.__moonlitState = null;
                }

                function base64ToBlobUrl(base64, mimeType = 'video/mp4') {
                    if (!base64) return '';
                    const byteChars = atob(base64);
                    const byteNumbers = new Array(byteChars.length);
                    for (let i = 0; i < byteChars.length; i++) {
                        byteNumbers[i] = byteChars.charCodeAt(i);
                    }
                    const byteArray = new Uint8Array(byteNumbers);
                    const blob = new Blob([byteArray], { type: mimeType });
                    return URL.createObjectURL(blob);
                }

                const state = {
                    currentScenery: prev.currentScenery || 'archipelago', // 'archipelago' or 'cavern'
                    currentStage: 'stage-tethys', // 'stage-tethys' (idle), 'stage-nebula' (chat), 'stage-resonance' (generating)
                    audioEnabled: localStorage.getItem('tethys_audio_enabled') !== 'false',
                    audioCtx: null,
                    lastAudioTime: 0,
                    video1BlobUrl: prev.video1BlobUrl || (ASSETS.video1Base64 ? base64ToBlobUrl(ASSETS.video1Base64, 'video/mp4') : ''),
                    video2BlobUrl: prev.video2BlobUrl || (ASSETS.video2Base64 ? base64ToBlobUrl(ASSETS.video2Base64, 'video/mp4') : ''),
                    mouseX: window.innerWidth / 2,
                    mouseY: window.innerHeight / 2,
                    lastMouseMoveTime: performance.now(),
                    restingButterfly: null,
                    starNodes: [],
                    butterflies: [],
                    petals: [],
                    ripples: [],
                    sparks: [],
                    decreeIndex: 0,
                    lastFrameTime: performance.now(),
                    animFrame: null,
                    watchdog: null,
                    decreeTimer: null,
                    sceneryTimer: null,
                    observer: null,
                    observerDebounce: null,
                    hasChatMessages: false
                };
                window.__blackShoresState = state;

                // =========================================================================
                // 1. INJECT MASTER STYLESHEET
                // =========================================================================
                let styleEl = document.getElementById('blackshores-theme-css');
                if (!styleEl) {
                    styleEl = document.createElement('style');
                    styleEl.id = 'blackshores-theme-css';
                    document.head.appendChild(styleEl);
                }
                styleEl.textContent = ${JSON.stringify(BLACK_SHORES_CSS)};

                // Set initial scenery class on body
                document.body.classList.remove('scenery-archipelago', 'scenery-cavern');
                document.body.classList.add(state.currentScenery === 'archipelago' ? 'scenery-archipelago' : 'scenery-cavern');

                // =========================================================================
                // 2. REAL GAME SCENERY VIDEO BACKGROUND ELEMENTS
                // =========================================================================
                let v1 = document.getElementById('blackshores-video-1');
                if (!v1 && state.video1BlobUrl) {
                    v1 = document.createElement('video');
                    v1.id = 'blackshores-video-1';
                    v1.muted = true;
                    v1.playsInline = true;
                    v1.loop = true;
                    v1.autoplay = true;
                    v1.src = state.video1BlobUrl;
                    document.body.prepend(v1);
                    v1.play().catch(()=>{});
                }

                let v2 = document.getElementById('blackshores-video-2');
                if (!v2 && state.video2BlobUrl) {
                    v2 = document.createElement('video');
                    v2.id = 'blackshores-video-2';
                    v2.muted = true;
                    v2.playsInline = true;
                    v2.loop = true;
                    v2.autoplay = true;
                    v2.src = state.video2BlobUrl;
                    document.body.prepend(v2);
                    v2.play().catch(()=>{});
                }

                // Inject Vignette Overlay
                let vignette = document.getElementById('blackshores-vignette-overlay');
                if (!vignette) {
                    vignette = document.createElement('div');
                    vignette.id = 'blackshores-vignette-overlay';
                    document.body.prepend(vignette);
                }

                // =========================================================================
                // 3. OFFICIAL CHARACTER ARTWORK RIGHT-DOCKING
                // =========================================================================
                let splashImg = document.getElementById('shorekeeper-right-artwork');
                if (!splashImg && ASSETS.splashBase64) {
                    splashImg = document.createElement('img');
                    splashImg.id = 'shorekeeper-right-artwork';
                    splashImg.src = 'data:image/png;base64,' + ASSETS.splashBase64;
                    splashImg.alt = 'Shorekeeper';
                    document.body.appendChild(splashImg);
                }

                // =========================================================================
                // 4. ANIMATED INTERACTIVE CHIBI COMPANION
                // =========================================================================
                const CHIBI_QUOTES = [
                    "Let the stars guide you through the tide...",
                    "I am Shorekeeper. I shall guard your return.",
                    "Tethys Core resonance: Stable at 99.8%.",
                    "Listen closely to the melody of the sea.",
                    "Across the endless data, our frequencies align."
                ];
                let quoteIndex = 0;

                let chibi = document.getElementById('shorekeeper-chibi-companion');
                if (!chibi && ASSETS.chibiBase64) {
                    chibi = document.createElement('div');
                    chibi.id = 'shorekeeper-chibi-companion';
                    chibi.title = 'Shorekeeper Companion (Click to hear Tacet Resonance)';
                    chibi.innerHTML = \`
                        <div class="chibi-speech-bubble" id="chibi-quote-text">"\${CHIBI_QUOTES[0]}"</div>
                        <img src="data:image/gif;base64,\${ASSETS.chibiBase64}" alt="Shorekeeper Chibi" />
                    \`;
                    chibi.addEventListener('click', (e) => {
                        e.stopPropagation();
                        quoteIndex = (quoteIndex + 1) % CHIBI_QUOTES.length;
                        const bubble = document.getElementById('chibi-quote-text');
                        if (bubble) bubble.textContent = \`"\${CHIBI_QUOTES[quoteIndex]}"\`;
                        chibi.classList.add('bubble-active');
                        setTimeout(() => chibi.classList.remove('bubble-active'), 3200);

                        playCrystalChime(1.25, true);

                        // Spawn stardust sparks around chibi
                        const rect = chibi.getBoundingClientRect();
                        for (let k = 0; k < 10; k++) {
                            const angle = Math.random() * Math.PI * 2;
                            const speed = Math.random() * 2.5 + 1;
                            state.sparks.push({
                                x: rect.left + rect.width / 2,
                                y: rect.top + rect.height / 2,
                                vx: Math.cos(angle) * speed,
                                vy: Math.sin(angle) * speed,
                                radius: Math.random() * 2.0 + 1.0,
                                alpha: 0.95,
                                color: k % 2 === 0 ? '#00f0ff' : '#c084fc'
                            });
                        }
                    });
                    document.body.appendChild(chibi);
                }

                // =========================================================================
                // 5. NATIVE WEB AUDIO API SYNTHESIZER (TACET RESONANCE)
                // =========================================================================
                const CELESTIAL_NOTES = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50, 1174.66, 1318.51]; // C5 to E6 Pentatonic

                function initAudioContext() {
                    if (!state.audioCtx) {
                        const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
                        if (AudioCtxClass) {
                            state.audioCtx = new AudioCtxClass();
                        }
                    }
                    if (state.audioCtx && state.audioCtx.state === 'suspended') {
                        state.audioCtx.resume();
                    }
                }

                function playCrystalChime(freqMultiplier = 1, isAction = false) {
                    if (!state.audioEnabled) return;
                    initAudioContext();
                    if (!state.audioCtx) return;

                    const now = state.audioCtx.currentTime;
                    const baseFreq = CELESTIAL_NOTES[Math.floor(Math.random() * CELESTIAL_NOTES.length)] * freqMultiplier;

                    const osc1 = state.audioCtx.createOscillator();
                    const osc2 = state.audioCtx.createOscillator();
                    const gainNode = state.audioCtx.createGain();
                    const filter = state.audioCtx.createBiquadFilter();

                    osc1.type = 'sine';
                    osc1.frequency.setValueAtTime(baseFreq, now);

                    osc2.type = 'triangle';
                    osc2.frequency.setValueAtTime(baseFreq * 2.01, now);

                    filter.type = 'lowpass';
                    filter.frequency.setValueAtTime(isAction ? 3200 : 2200, now);
                    filter.Q.setValueAtTime(4.0, now);

                    const duration = isAction ? 0.6 : 0.35;
                    const peakGain = isAction ? 0.08 : 0.045;

                    gainNode.gain.setValueAtTime(0.0001, now);
                    gainNode.gain.exponentialRampToValueAtTime(peakGain, now + 0.015);
                    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

                    osc1.connect(filter);
                    osc2.connect(filter);
                    filter.connect(gainNode);
                    gainNode.connect(state.audioCtx.destination);

                    osc1.start(now);
                    osc2.start(now);
                    osc1.stop(now + duration);
                    osc2.stop(now + duration);
                }

                // =========================================================================
                // 6. TOP NAVIGATION APP ICON & CONTROLS
                // =========================================================================
                function updateTopNavigation() {
                    const appIconBtn = document.querySelector('[data-testid="app-icon-new-conversation-button"]');
                    if (appIconBtn && !appIconBtn.querySelector('.shorekeeper-avatar-btn')) {
                        appIconBtn.innerHTML = '';
                        const img = document.createElement('img');
                        img.className = 'shorekeeper-avatar-btn';
                        img.src = 'data:image/png;base64,' + ASSETS.avatarBase64;
                        img.alt = 'Shorekeeper';
                        img.title = 'The Black Shores — Shorekeeper (Wuthering Waves)';
                        appIconBtn.appendChild(img);
                    }

                    // Audio Toggle
                    let toggleBtn = document.getElementById('tethys-audio-toggle');
                    const targetContainer = appIconBtn ? appIconBtn.parentElement : document.querySelector('header, nav');
                    if (!toggleBtn && targetContainer) {
                        toggleBtn = document.createElement('div');
                        toggleBtn.id = 'tethys-audio-toggle';
                        toggleBtn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            state.audioEnabled = !state.audioEnabled;
                            localStorage.setItem('tethys_audio_enabled', state.audioEnabled ? 'true' : 'false');
                            updateAudioToggleUI();
                            if (state.audioEnabled) playCrystalChime(1.2, true);
                        });
                        if (appIconBtn && appIconBtn.nextSibling) {
                            targetContainer.insertBefore(toggleBtn, appIconBtn.nextSibling);
                        } else {
                            targetContainer.appendChild(toggleBtn);
                        }
                    }
                    updateAudioToggleUI();

                    // Scenery Switcher Toggle
                    let sceneryBtn = document.getElementById('tethys-scenery-toggle');
                    if (!sceneryBtn && targetContainer) {
                        sceneryBtn = document.createElement('div');
                        sceneryBtn.id = 'tethys-scenery-toggle';
                        sceneryBtn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            toggleScenery();
                        });
                        if (toggleBtn && toggleBtn.nextSibling) {
                            targetContainer.insertBefore(sceneryBtn, toggleBtn.nextSibling);
                        } else {
                            targetContainer.appendChild(sceneryBtn);
                        }
                    }
                    updateSceneryToggleUI();
                }

                function toggleScenery() {
                    state.currentScenery = state.currentScenery === 'archipelago' ? 'cavern' : 'archipelago';
                    document.body.classList.remove('scenery-archipelago', 'scenery-cavern');
                    document.body.classList.add(state.currentScenery === 'archipelago' ? 'scenery-archipelago' : 'scenery-cavern');
                    updateSceneryToggleUI();
                    playCrystalChime(1.15, true);
                }

                function updateSceneryToggleUI() {
                    const btn = document.getElementById('tethys-scenery-toggle');
                    if (!btn) return;
                    if (state.currentScenery === 'archipelago') {
                        btn.innerHTML = \`<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/></svg> SCENERY: ARCHIPELAGO\`;
                        btn.title = 'Current: Black Shores Archipelago Dawn (Click to switch to Tethys Cavern)';
                    } else {
                        btn.innerHTML = \`<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg> SCENERY: TETHYS CAVERN\`;
                        btn.title = 'Current: Tethys Core Cavern & Whales (Click to switch to Archipelago)';
                    }
                }

                function updateAudioToggleUI() {
                    const toggleBtn = document.getElementById('tethys-audio-toggle');
                    if (!toggleBtn) return;
                    if (state.audioEnabled) {
                        toggleBtn.className = 'audio-on';
                        toggleBtn.innerHTML = \`<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg> RESONANCE: ON\`;
                        toggleBtn.title = 'Tacet Sonata Resonance Audio: Enabled (Click to Mute)';
                    } else {
                        toggleBtn.className = 'audio-off';
                        toggleBtn.innerHTML = \`<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg> RESONANCE: OFF\`;
                        toggleBtn.title = 'Tacet Sonata Resonance Audio: Muted (Click to Enable)';
                    }
                }

                // Automated Rotational Cross-Fade Timer (every 80 seconds)
                state.sceneryTimer = setInterval(() => {
                    toggleScenery();
                }, 80000);

                // =========================================================================
                // 7. SYMMETRICAL TETHYS TERMINAL HUD (NEW CONVERSATION)
                // =========================================================================
                const DECREES = [
                    "Across the sea of data, where weeping stars cradle the silent lament...",
                    "I am Shorekeeper. Even if all memories turn to sorrow, I shall guard your return.",
                    "When the final ripple fades from the Black Shores, the melody of your footsteps remains.",
                    "In this endless abyssal expanse, every frequency converges upon a single coordinate: you.",
                    "Let the Tethys core resonate. The stars of Asteria will light our path through the tide."
                ];

                let crestSeal = document.getElementById('tethys-crest-seal');
                if (!crestSeal) {
                    crestSeal = document.createElement('div');
                    crestSeal.id = 'tethys-crest-seal';
                    const crestSvgBase64 = ${JSON.stringify(Buffer.from(assets.crestSvgRaw).toString('base64'))};
                    crestSeal.innerHTML = \`
                        <div class="tethys-seal-ring-container">
                            <div class="tethys-seal-bg-glow"></div>
                            <div class="tethys-orbit-ring tethys-orbit-outer"></div>
                            <div class="tethys-orbit-ring tethys-orbit-inner"></div>
                            <img class="tethys-seal-emblem-img" src="data:image/svg+xml;base64,\${crestSvgBase64}" alt="Tethys Seal"/>
                        </div>
                        <div class="tethys-seal-title">THE BLACK SHORES</div>
                        <div class="tethys-seal-subtitle">TETHYS SYSTEM • TACET SONATA RESONANCE</div>
                    \`;
                    document.body.appendChild(crestSeal);
                }

                let telemetryCard = document.getElementById('tethys-telemetry-card');
                if (!telemetryCard) {
                    telemetryCard = document.createElement('div');
                    telemetryCard.id = 'tethys-telemetry-card';

                    let eqBarsHtml = '';
                    for (let i = 0; i < 24; i++) {
                        eqBarsHtml += \`<div class="tethys-eq-bar" id="tethys-bar-\${i}" style="height: \${4 + (i % 5) * 2}px;"></div>\`;
                    }

                    telemetryCard.innerHTML = \`
                        <div class="tethys-telemetry-header">
                            <span>TETHYS CORE SYNC: 99.8% | DOMAIN: TACET SONATA</span>
                            <div class="tethys-eq-container">
                                \${eqBarsHtml}
                            </div>
                        </div>
                        <div class="tethys-telemetry-decree-box" id="tethys-decree-text">
                            "\${DECREES[0]}"
                        </div>
                    \`;
                    document.body.appendChild(telemetryCard);
                }

                state.decreeTimer = setInterval(() => {
                    const decreeEl = document.getElementById('tethys-decree-text');
                    if (!decreeEl) return;
                    state.decreeIndex = (state.decreeIndex + 1) % DECREES.length;
                    decreeEl.style.opacity = '0';
                    setTimeout(() => {
                        decreeEl.textContent = \`"\${DECREES[state.decreeIndex]}"\`;
                        decreeEl.style.opacity = '1';
                    }, 400);
                }, 16000);

                // =========================================================================
                // 8. LIVING CANVAS ENGINE (#blackshores-canvas)
                // =========================================================================
                let canvas = document.getElementById('blackshores-canvas');
                if (!canvas) {
                    canvas = document.createElement('canvas');
                    canvas.id = 'blackshores-canvas';
                    document.body.prepend(canvas);
                }
                const ctx = canvas.getContext('2d');

                function resizeCanvas() {
                    const dpr = window.devicePixelRatio || 1;
                    if (canvas.width !== window.innerWidth * dpr || canvas.height !== window.innerHeight * dpr) {
                        canvas.width = window.innerWidth * dpr;
                        canvas.height = window.innerHeight * dpr;
                        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
                    }
                }
                resizeCanvas();

                // Initialize Star Nodes
                const NODE_COUNT = 44;
                state.starNodes = [];
                for (let i = 0; i < NODE_COUNT; i++) {
                    state.starNodes.push({
                        x: Math.random() * window.innerWidth,
                        y: Math.random() * window.innerHeight,
                        vx: (Math.random() - 0.5) * 0.35,
                        vy: (Math.random() - 0.5) * 0.35,
                        radius: Math.random() * 1.8 + 1.0,
                        baseAlpha: Math.random() * 0.45 + 0.3,
                        color: Math.random() > 0.4 ? '#00f0ff' : '#c084fc',
                        pulsePhase: Math.random() * Math.PI * 2
                    });
                }

                // Initialize Flapping Crystalline Stellar Butterflies
                const BUTTERFLY_COUNT = 4;
                state.butterflies = [];
                for (let i = 0; i < BUTTERFLY_COUNT; i++) {
                    state.butterflies.push({
                        x: Math.random() * window.innerWidth,
                        y: Math.random() * window.innerHeight,
                        vx: (Math.random() * 0.8 + 0.4) * (Math.random() > 0.5 ? 1 : -1),
                        vy: (Math.random() - 0.5) * 0.4,
                        scale: Math.random() * 0.4 + 0.7,
                        flapPhase: Math.random() * Math.PI * 2,
                        flapSpeed: Math.random() * 0.08 + 0.12,
                        color: i % 2 === 0 ? '#00f0ff' : '#818cf8',
                        trailTimer: 0
                    });
                }

                // Initialize Asteria Petals
                const PETAL_COUNT = 30;
                state.petals = [];
                for (let i = 0; i < PETAL_COUNT; i++) {
                    state.petals.push({
                        x: Math.random() * window.innerWidth,
                        y: Math.random() * window.innerHeight,
                        vy: Math.random() * 0.45 + 0.25,
                        swaySpeed: Math.random() * 0.02 + 0.015,
                        swayAmp: Math.random() * 1.5 + 0.8,
                        swayPhase: Math.random() * Math.PI * 2,
                        rotation: Math.random() * Math.PI * 2,
                        rotSpeed: (Math.random() - 0.5) * 0.02,
                        size: Math.random() * 4.5 + 2.5,
                        color: Math.random() > 0.5 ? '#00f0ff' : '#c084fc',
                        alpha: Math.random() * 0.5 + 0.3
                    });
                }

                function checkRestingButterfly(now) {
                    const idleDuration = now - state.lastMouseMoveTime;
                    if (idleDuration > 2500) {
                        if (!state.restingButterfly) {
                            state.restingButterfly = {
                                x: state.mouseX - 40,
                                y: state.mouseY - 40,
                                targetX: state.mouseX,
                                targetY: state.mouseY,
                                flapPhase: 0,
                                alpha: 0
                            };
                        }
                        state.restingButterfly.targetX = state.mouseX;
                        state.restingButterfly.targetY = state.mouseY;
                        state.restingButterfly.x += (state.restingButterfly.targetX - state.restingButterfly.x) * 0.05;
                        state.restingButterfly.y += (state.restingButterfly.targetY - state.restingButterfly.y) * 0.05;
                        state.restingButterfly.alpha = Math.min(1, state.restingButterfly.alpha + 0.025);
                        state.restingButterfly.flapPhase += 0.08;
                    } else if (state.restingButterfly) {
                        for (let k = 0; k < 12; k++) {
                            const angle = Math.random() * Math.PI * 2;
                            const speed = Math.random() * 2.5 + 1.0;
                            state.sparks.push({
                                x: state.restingButterfly.x,
                                y: state.restingButterfly.y,
                                vx: Math.cos(angle) * speed,
                                vy: Math.sin(angle) * speed,
                                radius: Math.random() * 1.8 + 0.8,
                                alpha: 0.9,
                                color: k % 2 === 0 ? '#00f0ff' : '#c084fc'
                            });
                        }
                        state.restingButterfly = null;
                    }
                }

                function renderCanvas(time) {
                    const dt = Math.min(50, time - state.lastFrameTime) / 16.666;
                    state.lastFrameTime = time;

                    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

                    const speedMultiplier = state.currentStage === 'stage-resonance' ? 1.7 : 1.0;

                    // 1. Gravitational Constellation Mesh
                    for (let i = 0; i < state.starNodes.length; i++) {
                        const node = state.starNodes[i];
                        node.x += node.vx * dt * speedMultiplier;
                        node.y += node.vy * dt * speedMultiplier;

                        if (node.x < 0) node.x = window.innerWidth;
                        if (node.x > window.innerWidth) node.x = 0;
                        if (node.y < 0) node.y = window.innerHeight;
                        if (node.y > window.innerHeight) node.y = 0;

                        const dx = state.mouseX - node.x;
                        const dy = state.mouseY - node.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist < 180 && dist > 5) {
                            const force = ((180 - dist) / 180) * 0.75;
                            node.x += (dx / dist) * force;
                            node.y += (dy / dist) * force;
                        }

                        node.pulsePhase += 0.03 * dt;
                        const pulse = Math.sin(node.pulsePhase) * 0.25;

                        ctx.beginPath();
                        ctx.arc(node.x, node.y, node.radius * (1 + pulse), 0, Math.PI * 2);
                        ctx.fillStyle = node.color;
                        ctx.globalAlpha = Math.max(0.1, Math.min(1, node.baseAlpha + pulse));
                        ctx.shadowColor = node.color;
                        ctx.shadowBlur = 8;
                        ctx.fill();
                        ctx.shadowBlur = 0;

                        for (let j = i + 1; j < state.starNodes.length; j++) {
                            const n2 = state.starNodes[j];
                            const ndx = n2.x - node.x;
                            const ndy = n2.y - node.y;
                            const ndist = Math.sqrt(ndx * ndx + ndy * ndy);
                            if (ndist < 120) {
                                const lineAlpha = (1 - ndist / 120) * 0.25;
                                ctx.beginPath();
                                ctx.moveTo(node.x, node.y);
                                ctx.lineTo(n2.x, n2.y);
                                ctx.strokeStyle = '#00f0ff';
                                ctx.globalAlpha = lineAlpha;
                                ctx.lineWidth = 0.75;
                                ctx.stroke();
                            }
                        }
                    }

                    // 2. Drifting Asteria Petals
                    for (let i = 0; i < state.petals.length; i++) {
                        const p = state.petals[i];
                        p.swayPhase += p.swaySpeed * dt * speedMultiplier;
                        p.x += Math.sin(p.swayPhase) * p.swayAmp * dt;
                        p.y += p.vy * dt * speedMultiplier;
                        p.rotation += p.rotSpeed * dt;

                        if (p.y > window.innerHeight + 20) {
                            p.y = -20;
                            p.x = Math.random() * window.innerWidth;
                        }
                        if (p.x < -20) p.x = window.innerWidth + 20;
                        if (p.x > window.innerWidth + 20) p.x = -20;

                        ctx.save();
                        ctx.translate(p.x, p.y);
                        ctx.rotate(p.rotation);
                        ctx.fillStyle = p.color;
                        ctx.globalAlpha = p.alpha;
                        ctx.shadowColor = p.color;
                        ctx.shadowBlur = 6;

                        ctx.beginPath();
                        ctx.moveTo(0, -p.size);
                        ctx.lineTo(p.size * 0.6, 0);
                        ctx.lineTo(0, p.size);
                        ctx.lineTo(-p.size * 0.6, 0);
                        ctx.closePath();
                        ctx.fill();
                        ctx.restore();
                    }

                    // 3. Flapping Crystalline Butterflies
                    for (let i = 0; i < state.butterflies.length; i++) {
                        const b = state.butterflies[i];
                        b.x += b.vx * dt * speedMultiplier;
                        b.y += b.vy * dt * speedMultiplier;
                        b.flapPhase += b.flapSpeed * dt * speedMultiplier;

                        if (b.x < -60) b.x = window.innerWidth + 60;
                        if (b.x > window.innerWidth + 60) b.x = -60;
                        if (b.y < -60) b.y = window.innerHeight + 60;
                        if (b.y > window.innerHeight + 60) b.y = -60;

                        b.trailTimer += dt;
                        if (b.trailTimer > 6) {
                            b.trailTimer = 0;
                            state.sparks.push({
                                x: b.x,
                                y: b.y,
                                vx: (Math.random() - 0.5) * 0.3,
                                vy: (Math.random() - 0.5) * 0.3,
                                radius: Math.random() * 1.5 + 0.6,
                                alpha: 0.75,
                                color: b.color
                            });
                        }

                        const flap = Math.cos(b.flapPhase);
                        const wingWidth = Math.abs(flap) * 22 * b.scale;

                        ctx.save();
                        ctx.translate(b.x, b.y);
                        const heading = Math.atan2(b.vy, b.vx);
                        ctx.rotate(heading);

                        ctx.shadowColor = b.color;
                        ctx.shadowBlur = 10;
                        ctx.globalAlpha = 0.85;

                        ctx.beginPath();
                        ctx.moveTo(0, 0);
                        ctx.quadraticCurveTo(-wingWidth * 1.2, -18 * b.scale, -wingWidth * 0.4, -28 * b.scale);
                        ctx.quadraticCurveTo(0, -14 * b.scale, 0, 0);
                        ctx.fillStyle = b.color;
                        ctx.fill();

                        ctx.beginPath();
                        ctx.moveTo(0, 0);
                        ctx.quadraticCurveTo(wingWidth * 1.2, -18 * b.scale, wingWidth * 0.4, -28 * b.scale);
                        ctx.quadraticCurveTo(0, -14 * b.scale, 0, 0);
                        ctx.fillStyle = b.color;
                        ctx.fill();

                        ctx.beginPath();
                        ctx.moveTo(0, 0);
                        ctx.quadraticCurveTo(-wingWidth * 0.9, 14 * b.scale, -wingWidth * 0.2, 22 * b.scale);
                        ctx.quadraticCurveTo(0, 8 * b.scale, 0, 0);
                        ctx.fillStyle = '#c084fc';
                        ctx.fill();

                        ctx.beginPath();
                        ctx.moveTo(0, 0);
                        ctx.quadraticCurveTo(wingWidth * 0.9, 14 * b.scale, wingWidth * 0.2, 22 * b.scale);
                        ctx.quadraticCurveTo(0, 8 * b.scale, 0, 0);
                        ctx.fillStyle = '#c084fc';
                        ctx.fill();

                        ctx.beginPath();
                        ctx.ellipse(0, 0, 1.8 * b.scale, 6 * b.scale, 0, 0, Math.PI * 2);
                        ctx.fillStyle = '#ffffff';
                        ctx.fill();

                        ctx.restore();
                    }

                    // 4. Resting Butterfly Cursor Companion
                    checkRestingButterfly(time);
                    if (state.restingButterfly && state.restingButterfly.alpha > 0.05) {
                        const rb = state.restingButterfly;
                        const flap = Math.cos(rb.flapPhase);
                        const wingW = Math.abs(flap) * 18;

                        ctx.save();
                        ctx.translate(rb.x, rb.y);
                        ctx.globalAlpha = rb.alpha * 0.9;
                        ctx.shadowColor = '#00f0ff';
                        ctx.shadowBlur = 12;

                        ctx.beginPath();
                        ctx.moveTo(0, 0);
                        ctx.quadraticCurveTo(-wingW, -14, -wingW * 0.3, -22);
                        ctx.quadraticCurveTo(0, -10, 0, 0);
                        ctx.fillStyle = '#00f0ff';
                        ctx.fill();

                        ctx.beginPath();
                        ctx.moveTo(0, 0);
                        ctx.quadraticCurveTo(wingW, -14, wingW * 0.3, -22);
                        ctx.quadraticCurveTo(0, -10, 0, 0);
                        ctx.fillStyle = '#00f0ff';
                        ctx.fill();

                        ctx.beginPath();
                        ctx.ellipse(0, 0, 1.5, 5, 0, 0, Math.PI * 2);
                        ctx.fillStyle = '#ffffff';
                        ctx.fill();

                        ctx.restore();
                    }

                    // 5. Soundwave Ripples
                    for (let i = state.ripples.length - 1; i >= 0; i--) {
                        const r = state.ripples[i];
                        r.radius += r.speed * dt;
                        r.alpha -= 0.016 * dt;
                        if (r.alpha <= 0) {
                            state.ripples.splice(i, 1);
                            continue;
                        }

                        ctx.save();
                        ctx.strokeStyle = r.color;
                        ctx.shadowColor = r.color;
                        ctx.shadowBlur = 10;
                        ctx.globalAlpha = r.alpha;
                        ctx.lineWidth = 1.5;

                        ctx.beginPath();
                        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
                        ctx.stroke();

                        ctx.beginPath();
                        ctx.arc(r.x, r.y, Math.max(0, r.radius * 0.65), 0, Math.PI * 2);
                        ctx.stroke();

                        for (let k = 0; k < 6; k++) {
                            const angle = (k * Math.PI) / 3 + r.rotation;
                            const gx = r.x + Math.cos(angle) * r.radius;
                            const gy = r.y + Math.sin(angle) * r.radius;
                            ctx.fillStyle = '#ffffff';
                            ctx.beginPath();
                            ctx.arc(gx, gy, 1.8, 0, Math.PI * 2);
                            ctx.fill();
                        }
                        ctx.restore();
                    }

                    // 6. Quantum Sparks
                    for (let i = state.sparks.length - 1; i >= 0; i--) {
                        const s = state.sparks[i];
                        s.x += s.vx * dt;
                        s.y += s.vy * dt;
                        s.alpha -= 0.02 * dt;
                        if (s.alpha <= 0) {
                            state.sparks.splice(i, 1);
                            continue;
                        }

                        ctx.beginPath();
                        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
                        ctx.fillStyle = s.color;
                        ctx.shadowColor = s.color;
                        ctx.shadowBlur = 6;
                        ctx.globalAlpha = s.alpha;
                        ctx.fill();
                    }

                    ctx.shadowBlur = 0;
                    ctx.globalAlpha = 1;

                    // Equalizer Bar Animation for HUD
                    if (document.getElementById('tethys-telemetry-card')) {
                        for (let b = 0; b < 24; b++) {
                            const bar = document.getElementById('tethys-bar-' + b);
                            if (bar) {
                                const h = 3 + Math.sin(time * 0.005 + b * 0.5) * 4 + Math.cos(time * 0.003 - b * 0.3) * 3;
                                bar.style.height = Math.max(2, h) + 'px';
                            }
                        }
                    }

                    state.animFrame = requestAnimationFrame(renderCanvas);
                }
                state.animFrame = requestAnimationFrame(renderCanvas);

                // =========================================================================
                // 9. EVENT LISTENERS
                // =========================================================================
                const onMouseMove = (e) => {
                    state.mouseX = e.clientX;
                    state.mouseY = e.clientY;
                    state.lastMouseMoveTime = performance.now();
                };

                const onWindowClick = (e) => {
                    state.ripples.push({
                        x: e.clientX,
                        y: e.clientY,
                        radius: 5,
                        speed: 3.5,
                        alpha: 0.85,
                        rotation: Math.random() * Math.PI,
                        color: Math.random() > 0.5 ? '#00f0ff' : '#818cf8'
                    });

                    const target = e.target.closest('button, a, [role="button"], input, textarea, [data-testid]');
                    if (target) {
                        playCrystalChime(1.15, true);
                    }
                };

                const onKeyDown = (e) => {
                    const now = performance.now();
                    if (now - state.lastAudioTime > 85) {
                        state.lastAudioTime = now;
                        playCrystalChime(1.0, false);
                    }
                };

                window.addEventListener('mousemove', onMouseMove, { passive: true });
                window.addEventListener('click', onWindowClick, { passive: true });
                window.addEventListener('keydown', onKeyDown, { passive: true });
                window.addEventListener('resize', resizeCanvas, { passive: true });

                state.cleanupListeners = () => {
                    window.removeEventListener('mousemove', onMouseMove);
                    window.removeEventListener('click', onWindowClick);
                    window.removeEventListener('keydown', onKeyDown);
                    window.removeEventListener('resize', resizeCanvas);
                };

                // =========================================================================
                // 10. LAYOUT & CHAT DETECTION ENGINE
                // =========================================================================
                function updateLayoutState() {
                    updateTopNavigation();

                    const composer = document.querySelector('.rounded-2xl.bg-card-border') || document.querySelector('div:has(> textarea)') || document.querySelector('textarea');
                    const compRect = composer ? composer.getBoundingClientRect() : null;

                    const chatTurns = document.querySelectorAll('[class*="group/user-input-step"], div[data-testid="user-message"], div[data-testid="assistant-message"]');
                    const hasMessages = chatTurns.length > 0;
                    state.hasChatMessages = hasMessages;

                    const isInChat = hasMessages && compRect && compRect.top > window.innerHeight * 0.6;

                    // Mode class on body for splash art & glassmorphism
                    if (isInChat) {
                        document.body.classList.add('mode-active-chat');
                        document.body.classList.remove('mode-new-conv');
                    } else {
                        document.body.classList.add('mode-new-conv');
                        document.body.classList.remove('mode-active-chat');
                    }

                    // Execution / generating state
                    const stopBtn = document.querySelector('button[data-testid="stop-button"], [aria-label*="Stop"], .animate-spin');
                    const isGenerating = !!stopBtn;

                    if (isGenerating) {
                        state.currentStage = 'stage-resonance';
                        document.body.classList.add('stage-resonance');
                        document.body.classList.remove('stage-nebula', 'stage-tethys');
                    } else if (hasMessages) {
                        state.currentStage = 'stage-nebula';
                        document.body.classList.add('stage-nebula');
                        document.body.classList.remove('stage-resonance', 'stage-tethys');
                    } else {
                        state.currentStage = 'stage-tethys';
                        document.body.classList.add('stage-tethys');
                        document.body.classList.remove('stage-resonance', 'stage-nebula');
                    }

                    // Symmetrical Docking of HUD relative to Composer
                    const seal = document.getElementById('tethys-crest-seal');
                    const card = document.getElementById('tethys-telemetry-card');

                    if (seal && card) {
                        if (isInChat) {
                            seal.classList.add('hud-hidden');
                            card.classList.add('hud-hidden');
                        } else if (compRect) {
                            seal.classList.remove('hud-hidden');
                            card.classList.remove('hud-hidden');

                            const centerX = compRect.left + compRect.width / 2;

                            // Symmetrical Crest positioning above composer
                            seal.style.left = centerX + 'px';
                            seal.style.top = (compRect.top - 18) + 'px';
                            seal.style.bottom = 'auto';
                            seal.style.transform = 'translate(-50%, -100%)';

                            // Symmetrical Telemetry Card positioning below composer
                            let cardTop = compRect.bottom + 14;
                            if (cardTop + 72 > window.innerHeight) {
                                cardTop = window.innerHeight - 76;
                            }
                            card.style.left = centerX + 'px';
                            card.style.top = cardTop + 'px';
                            card.style.bottom = 'auto';
                            card.style.transform = 'translateX(-50%)';
                            card.style.width = Math.min(compRect.width, 640) + 'px';
                        }
                    }
                }

                // =========================================================================
                // 11. WATCHDOG & DEBOUNCED MUTATION OBSERVER
                // =========================================================================
                state.watchdog = setInterval(() => {
                    resizeCanvas();
                    updateLayoutState();
                    const now = performance.now();
                    if (!document.hidden && now - state.lastFrameTime > 2500) {
                        if (state.animFrame) cancelAnimationFrame(state.animFrame);
                        state.animFrame = requestAnimationFrame(renderCanvas);
                    }
                }, 2000);

                const observer = new MutationObserver((mutations) => {
                    let shouldHandle = false;
                    for (let i = 0; i < mutations.length; i++) {
                        const target = mutations[i].target;
                        const id = target && target.id ? target.id : '';
                        if (!id.startsWith('blackshores-') && !id.startsWith('tethys-') && !id.startsWith('shorekeeper-')) {
                            shouldHandle = true;
                            break;
                        }
                    }
                    if (!shouldHandle) return;

                    if (state.observerDebounce) return;
                    state.observerDebounce = setTimeout(() => {
                        state.observerDebounce = null;
                        updateLayoutState();
                    }, 80);
                });
                observer.observe(document.body, { childList: true, subtree: true });
                state.observer = observer;

                updateLayoutState();

                return 'The Black Shores & Shorekeeper Theme (Real Game Scenery Engine) Live & Resonating!';
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
