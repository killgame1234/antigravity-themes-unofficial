const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const IMAGE_PATH = path.join(__dirname, 'prescript_source.webp');
const ICO_PATH = path.join(__dirname, 'prescript.ico');
const TYPEWRITER_PATH = path.join(__dirname, 'typewriter.core.js');

// Update Windows Shortcut Icon for Taskbar
try {
    if (fs.existsSync(ICO_PATH)) {
        const escapedIco = ICO_PATH.replace(/\\/g, '\\\\');
        const psCmd = `powershell -WindowStyle Hidden -Command "$wsh = New-Object -ComObject WScript.Shell; $lnk = [System.IO.Path]::Combine($env:APPDATA, 'Microsoft\\Windows\\Start Menu\\Programs\\Antigravity.lnk'); if (Test-Path $lnk) { $s = $wsh.CreateShortcut($lnk); $s.IconLocation = '${escapedIco},0'; $s.Save() }"`;
        exec(psCmd, (err) => {
            if (err) console.log('Shortcut icon notice:', err.message);
            else console.log('Windows taskbar shortcut icon updated to Prescript emblem!');
        });
    }
} catch (e) {}

const PRESCRIPT_CSS = `
    :root, .dark, .theme-dark, body {
        --background: transparent !important;
        --sidebar: rgba(2, 6, 11, 0.68) !important;
        --sidebar-secondary: rgba(0, 229, 255, 0.14) !important;
        --sidebar-muted: rgba(0, 229, 255, 0.07) !important;
        --card: rgba(4, 10, 16, 0.78) !important;
        --card-border: rgba(0, 229, 255, 0.48) !important;
        --border: rgba(0, 229, 255, 0.22) !important;
        --muted: rgba(5, 16, 26, 0.78) !important;
        --foreground: #E6F9FF !important;
        --secondary-foreground: #8CB8C8 !important;
        --prescript-cyan: #00E5FF;
        --prescript-bloom: #00F0FF;
        --index-gold: #D4AF37;
        --index-gold-bright: #F5DF8B;
        --obsidian-void: #020508;
    }

    /* Abyssal Obsidian-Black OLED Base */
    html, body {
        background-color: #020508 !important;
        color: #E6F9FF !important;
    }

    #prescript-fate-canvas {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        z-index: 0 !important;
        pointer-events: none !important;
        opacity: 0.85 !important;
        contain: strict !important;
        will-change: contents !important;
    }

    @keyframes prescript-hand-float {
        0%, 100% {
            transform: translateY(0px);
            opacity: 0.88;
        }
        50% {
            transform: translateY(-6px);
            opacity: 0.98;
        }
    }

    /* Prescript Index Hand Emblem Container */
    #prescript-hand-bg {
        position: fixed !important;
        z-index: 0 !important;
        pointer-events: none !important;
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        justify-content: center !important;
        background: transparent !important;
        box-shadow: none !important;
        border: none !important;
        transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1) !important;
    }

    .prescript-hand-img {
        max-height: min(250px, 30vh) !important;
        max-width: min(300px, 35vw) !important;
        width: auto !important;
        height: auto !important;
        background: transparent !important;
        box-shadow: none !important;
        border: none !important;
        filter: none !important;
        animation: prescript-hand-float 6s infinite ease-in-out !important;
        user-select: none !important;
        pointer-events: none !important;
    }

    /* Prescript Dynamic Quote Decree Caption */
    #prescript-quote-box {
        position: fixed !important;
        z-index: 2 !important;
        pointer-events: none !important;
        max-width: min(650px, 80vw) !important;
        text-align: center !important;
        font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace !important;
        font-size: 12px !important;
        line-height: 1.55 !important;
        letter-spacing: 0.14em !important;
        color: rgba(130, 238, 255, 0.85) !important;
        text-shadow: 0 0 10px rgba(0, 229, 255, 0.6) !important;
        transition: opacity 0.3s ease, left 0.4s cubic-bezier(0.16, 1, 0.3, 1), top 0.4s cubic-bezier(0.16, 1, 0.3, 1) !important;
    }

    /* Prescript Top App Icon (Replacing Antigravity top logo) */
    .prescript-top-app-icon {
        width: 22px !important;
        height: 22px !important;
        object-fit: contain !important;
        filter: drop-shadow(0 0 6px #00E5FF) !important;
        vertical-align: middle !important;
        cursor: pointer !important;
        transition: transform 0.2s ease !important;
    }

    .prescript-top-app-icon:hover {
        transform: scale(1.12) rotate(4deg) !important;
        filter: drop-shadow(0 0 10px #00F0FF) !important;
    }

    #prescript-vignette-overlay {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        z-index: 0 !important;
        pointer-events: none !important;
        background:
            radial-gradient(circle at 54% 46%, rgba(2, 5, 8, 0.1) 0%, rgba(2, 5, 8, 0.6) 65%, rgba(2, 5, 8, 0.94) 100%),
            linear-gradient(180deg, rgba(2, 5, 8, 0.8) 0%, transparent 14%, transparent 84%, rgba(2, 5, 8, 0.9) 100%) !important;
    }

    /* Empty Chat & Main Container Transparency */
    #root,
    main,
    [role="main"],
    .flex-1.flex.flex-col,
    .bg-background,
    div[class*="items-center justify-center"] {
        background-color: transparent !important;
    }

    #root {
        position: relative !important;
        z-index: 1 !important;
    }

    /* ==========================================================================
       SETTINGS MODAL, CARDS & DROPDOWN MENUS (HIGH-CONTRAST DARK)
       ========================================================================== */
    .settings-modal-backdrop {
        background-color: rgba(1, 3, 6, 0.82) !important;
        backdrop-filter: blur(12px) !important;
    }

    .settings-modal-container,
    .settings-modal-container .bg-background,
    [role="dialog"],
    [role="menu"],
    [role="listbox"] {
        background-color: rgba(2, 6, 12, 0.97) !important;
        backdrop-filter: blur(24px) saturate(150%) !important;
    }

    .settings-modal-container {
        border: 1px solid rgba(0, 229, 255, 0.55) !important;
        box-shadow:
            0 24px 70px rgba(0, 0, 0, 0.98),
            0 0 30px rgba(0, 229, 255, 0.22),
            inset 0 1px 0 rgba(212, 175, 55, 0.35) !important;
    }

    .settings-modal-container .bg-sidebar {
        background-color: rgba(1, 4, 8, 0.98) !important;
        border-right: 1px solid rgba(0, 229, 255, 0.25) !important;
    }

    .settings-modal-container .rounded-xl.border {
        background-color: rgba(6, 16, 28, 0.92) !important;
        border-color: rgba(0, 229, 255, 0.35) !important;
        box-shadow: 0 4px 18px rgba(0, 0, 0, 0.75), inset 0 0 12px rgba(0, 229, 255, 0.06) !important;
    }

    .settings-modal-container button {
        background-color: rgba(10, 26, 42, 0.9) !important;
        border: 1px solid rgba(0, 229, 255, 0.3) !important;
        color: #E6F9FF !important;
    }

    .settings-modal-container button:hover {
        background-color: rgba(0, 229, 255, 0.2) !important;
        border-color: #00E5FF !important;
    }

    /* Translucent Obsidian-Cyan Sidebar */
    .bg-sidebar {
        background-color: rgba(2, 6, 11, 0.64) !important;
        backdrop-filter: blur(14px) saturate(140%) !important;
    }

    aside, [class*="bg-sidebar"]:not(.overflow-y-auto *) {
        border-color: rgba(0, 229, 255, 0.22) !important;
    }

    /* Active Sidebar Conversation Row */
    .bg-sidebar-secondary {
        background: linear-gradient(90deg, rgba(0, 229, 255, 0.18) 0%, rgba(212, 175, 55, 0.10) 100%) !important;
        border: 1px solid rgba(0, 229, 255, 0.52) !important;
        border-left: 3px solid #D4AF37 !important;
        box-shadow: 0 0 16px rgba(0, 229, 255, 0.22), inset 0 0 10px rgba(0, 229, 255, 0.12) !important;
        color: #FFFFFF !important;
    }

    /* Sticky User Message Bleed Fix */
    .md-sticky-message-bleed {
        background: transparent !important;
    }
    .md-sticky-message-bleed::after {
        display: none !important;
    }

    /* ==========================================================================
       USER MESSAGE BUBBLES: DEEP MIDNIGHT-AZURE & GILDED OBSIDIAN
       ========================================================================== */
    [class*="group/user-input-step"] .bg-card-border {
        background: linear-gradient(135deg, #D4AF37 0%, #00E5FF 25%, #0088AA 75%, #D4AF37 100%) !important;
        padding: 1px !important;
        border-radius: 12px !important;
        box-shadow:
            0 0 18px rgba(0, 229, 255, 0.35),
            0 0 6px rgba(212, 175, 55, 0.3),
            0 6px 24px rgba(0, 0, 0, 0.9) !important;
        transition: all 0.25s ease !important;
    }

    [class*="group/user-input-step"]:hover .bg-card-border {
        box-shadow:
            0 0 26px rgba(0, 240, 255, 0.58),
            0 0 12px rgba(212, 175, 55, 0.45),
            0 6px 28px rgba(0, 0, 0, 0.95) !important;
    }

    [class*="group/user-input-step"] .bg-card {
        background: linear-gradient(135deg, rgba(6, 28, 46, 0.94) 0%, rgba(3, 14, 24, 0.96) 65%, rgba(18, 14, 5, 0.97) 100%) !important;
        border-radius: 11px !important;
        color: #E8FCFF !important;
        box-shadow: inset 0 0 18px rgba(0, 229, 255, 0.16) !important;
    }

    /* ==========================================================================
       AGENT BUBBLES: SLEEK TRANSLUCENT PRESCRIPT PAGER TERMINALS
       ========================================================================== */
    .gap-y-3 > .flex.items-start:not(:has([class*="group/user-input-step"])) > .flex-col {
        position: relative !important;
        background:
            linear-gradient(to right, #D4AF37 2px, transparent 2px) 0 0,
            linear-gradient(to bottom, #D4AF37 2px, transparent 2px) 0 0,
            linear-gradient(to left, #D4AF37 2px, transparent 2px) 100% 0,
            linear-gradient(to bottom, #D4AF37 2px, transparent 2px) 100% 0,
            linear-gradient(to right, #D4AF37 2px, transparent 2px) 0 100%,
            linear-gradient(to top, #D4AF37 2px, transparent 2px) 0 100%,
            linear-gradient(to left, #D4AF37 2px, transparent 2px) 100% 100%,
            linear-gradient(to top, #D4AF37 2px, transparent 2px) 100% 100%,
            rgba(4, 10, 16, 0.78) !important;
        background-repeat: no-repeat !important;
        background-size: 10px 10px, 10px 10px, 10px 10px, 10px 10px, 10px 10px, 10px 10px, 10px 10px, 10px 10px, 100% 100% !important;
        border: 1px solid rgba(0, 229, 255, 0.42) !important;
        border-radius: 10px !important;
        padding: 15px 18px !important;
        margin-top: 4px !important;
        margin-bottom: 4px !important;
        box-shadow:
            0 10px 32px rgba(0, 0, 0, 0.92),
            0 0 16px rgba(0, 229, 255, 0.14),
            inset 0 1px 0 rgba(0, 240, 255, 0.28) !important;
        transition: border-color 0.25s ease, box-shadow 0.25s ease !important;
    }

    .gap-y-3 > .flex.items-start:not(:has([class*="group/user-input-step"])) > .flex-col:hover {
        border-color: #00E5FF !important;
        box-shadow:
            0 12px 38px rgba(0, 0, 0, 0.96),
            0 0 24px rgba(0, 240, 255, 0.28),
            inset 0 1px 0 rgba(212, 175, 55, 0.45) !important;
    }

    /* ==========================================================================
       ACTIVE INPUT COMPOSER WITH COLD ELECTRIC CYAN BLOOM (#00F0FF) & GOLD
       ========================================================================== */
    .rounded-2xl.bg-card-border {
        background: linear-gradient(90deg, #D4AF37 0%, #00E5FF 25%, #006680 50%, #00E5FF 75%, #D4AF37 100%) !important;
        padding: 1px !important;
        box-shadow:
            0 0 22px rgba(0, 240, 255, 0.28),
            0 8px 32px rgba(0, 0, 0, 0.95) !important;
        transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
    }

    .rounded-2xl.bg-card-border:focus-within {
        background: linear-gradient(90deg, #F5DF8B 0%, #00F0FF 35%, #00F0FF 65%, #F5DF8B 100%) !important;
        box-shadow:
            0 0 34px rgba(0, 240, 255, 0.58),
            0 0 12px rgba(212, 175, 55, 0.42),
            0 10px 40px rgba(0, 0, 0, 0.98) !important;
    }

    .rounded-2xl.bg-card-border > .bg-card {
        background: rgba(3, 8, 14, 0.95) !important;
        box-shadow: inset 0 0 20px rgba(0, 240, 255, 0.12) !important;
    }

    /* ==========================================================================
       TYPOGRAPHY, CODE BLOCKS & COLD ELECTRIC CYAN / GOLD HIGHLIGHTS
       ========================================================================== */
    h1, h2, h3, h4 {
        color: #00E5FF !important;
        text-shadow: 0 0 12px rgba(0, 229, 255, 0.42) !important;
        letter-spacing: 0.03em !important;
    }

    strong, b {
        color: #F5DF8B !important;
        text-shadow: 0 0 8px rgba(212, 175, 55, 0.38) !important;
    }

    a,
    button[data-testid="automations-button"] {
        color: #38F6FF !important;
        text-decoration-color: rgba(0, 229, 255, 0.5) !important;
        text-shadow: 0 0 8px rgba(0, 229, 255, 0.38) !important;
    }

    a:hover,
    button[data-testid="automations-button"]:hover {
        color: #F5DF8B !important;
        text-shadow: 0 0 14px rgba(212, 175, 55, 0.75) !important;
    }

    code:not(pre code) {
        background: rgba(3, 28, 44, 0.72) !important;
        color: #5CEEFF !important;
        border: 1px solid rgba(0, 229, 255, 0.4) !important;
        box-shadow: 0 0 8px rgba(0, 240, 255, 0.16) !important;
    }

    pre {
        background: rgba(2, 6, 11, 0.90) !important;
        border: 1px solid rgba(0, 229, 255, 0.36) !important;
        border-left: 2px solid #D4AF37 !important;
        border-radius: 8px !important;
        box-shadow: inset 0 0 22px rgba(0, 0, 0, 0.92), 0 0 14px rgba(0, 240, 255, 0.12) !important;
    }

    ::selection {
        background: rgba(0, 229, 255, 0.35) !important;
        color: #FFFFFF !important;
    }

    /* Cold Electric Cyan Bloom on Icons */
    button svg, a svg {
        filter: drop-shadow(0 0 4px rgba(0, 240, 255, 0.45));
        transition: all 0.2s ease !important;
    }

    button:hover svg {
        color: #00F0FF !important;
        filter: drop-shadow(0 0 9px rgba(0, 240, 255, 0.95)) !important;
        transform: scale(1.06);
    }

    /* Scrollbar */
    ::-webkit-scrollbar {
        width: 6px !important;
        height: 6px !important;
    }
    ::-webkit-scrollbar-track {
        background: rgba(2, 5, 8, 0.5) !important;
    }
    ::-webkit-scrollbar-thumb {
        background: linear-gradient(180deg, #00E5FF, #D4AF37) !important;
        border-radius: 9999px !important;
        box-shadow: 0 0 8px rgba(0, 229, 255, 0.6) !important;
    }

    /* ==========================================================================
       PRESCRIPT TYPEWRITER HOVER STYLES (STRICT SCOPED: YELLOW & BOXED ONLY)
       ========================================================================== */
    .prescript-hover-active {
        font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace !important;
        color: rgba(130, 238, 255, 0.98) !important;
        text-shadow: 0 0 10px rgba(0, 229, 255, 0.75), 0 0 20px rgba(0, 229, 255, 0.35) !important;
        letter-spacing: 0.04em !important;
    }

    .prescript-tw-wrapper {
        display: inline-block !important;
        text-align: left !important;
        vertical-align: baseline !important;
        white-space: inherit !important;
        max-width: 100% !important;
        pointer-events: none !important;
    }

    .prescript-tw-typed {
        font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace !important;
        color: rgba(130, 238, 255, 0.98) !important;
        text-shadow: 0 0 10px rgba(0, 229, 255, 0.75), 0 0 20px rgba(0, 229, 255, 0.35) !important;
        white-space: inherit !important;
        pointer-events: none !important;
    }

    .prescript-tw-cursor {
        display: inline-block !important;
        width: 0 !important;
        overflow: visible !important;
        color: #00F0FF !important;
        text-shadow: 0 0 12px rgba(0, 240, 255, 0.95), 0 0 24px rgba(0, 229, 255, 0.8) !important;
        user-select: none !important;
        pointer-events: none !important;
        vertical-align: baseline !important;
        font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace !important;
        animation: prescript-cursor-blink 0.75s infinite !important;
    }

    .prescript-tw-ghost {
        opacity: 0.35 !important;
        color: rgba(130, 238, 255, 0.45) !important;
        text-shadow: none !important;
        pointer-events: none !important;
        user-select: none !important;
        white-space: inherit !important;
    }

    @keyframes prescript-cursor-blink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0; }
    }
`;

async function main() {
    if (!fs.existsSync(IMAGE_PATH)) {
        console.error('Source image not found at:', IMAGE_PATH);
        process.exit(1);
    }

    const imgBuffer = fs.readFileSync(IMAGE_PATH);
    const imgBase64 = imgBuffer.toString('base64');
    console.log('Loaded Prescript source image bytes:', imgBuffer.length);

    let twBase64 = '';
    if (fs.existsSync(TYPEWRITER_PATH)) {
        twBase64 = fs.readFileSync(TYPEWRITER_PATH).toString('base64');
        console.log('Loaded typewriter.core.js bytes:', twBase64.length);
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
        await injectIntoPage(page.webSocketDebuggerUrl, imgBase64, twBase64);
    }
}

function injectIntoPage(wsUrl, imgBase64, twBase64) {
    return new Promise((resolve, reject) => {
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
            const injectedCode = `(async function() {
                // =========================================================================
                // 0. CLEANUP PREVIOUS THEME TIMERS, LISTENERS, AND GLOBAL STATE
                // =========================================================================
                if (window.__prescriptState) {
                    try { if (window.__prescriptState.watchdog) clearInterval(window.__prescriptState.watchdog); } catch(e){}
                    try { if (window.__prescriptState.quoteInterval) clearInterval(window.__prescriptState.quoteInterval); } catch(e){}
                    try { if (window.__prescriptState.quoteTimer) clearTimeout(window.__prescriptState.quoteTimer); } catch(e){}
                    try { if (window.__prescriptState.animFrame) cancelAnimationFrame(window.__prescriptState.animFrame); } catch(e){}
                    try { if (window.__prescriptState.observer) window.__prescriptState.observer.disconnect(); } catch(e){}
                    try { if (window.__prescriptState.cleanupListeners) window.__prescriptState.cleanupListeners(); } catch(e){}
                    if (window.__prescriptState.activeHoverLeaf) {
                        try {
                            if (window.__prescriptState.activeHoverLeaf.__prescriptOriginalText !== undefined) {
                                window.__prescriptState.activeHoverLeaf.textContent = window.__prescriptState.activeHoverLeaf.__prescriptOriginalText;
                            }
                            window.__prescriptState.activeHoverLeaf.classList.remove('prescript-hover-active');
                        } catch (e) {}
                    }
                }

                // Legacy cleanup with safe try/catches
                try { if (window.__eldritchObserver) { window.__eldritchObserver.disconnect(); window.__eldritchObserver = null; } } catch(e){}
                try { if (window.__prescriptObserver) { window.__prescriptObserver.disconnect(); window.__prescriptObserver = null; } } catch(e){}
                try { if (window.__prescriptAnimFrame) { cancelAnimationFrame(window.__prescriptAnimFrame); window.__prescriptAnimFrame = null; } } catch(e){}
                try { if (window.__prescriptQuoteInterval) { clearInterval(window.__prescriptQuoteInterval); window.__prescriptQuoteInterval = null; } } catch(e){}
                try { if (window.__prescriptTypewriterTimer) { clearTimeout(window.__prescriptTypewriterTimer); window.__prescriptTypewriterTimer = null; } } catch(e){}
                try { if (window.__prescriptCleanupListeners) { window.__prescriptCleanupListeners(); window.__prescriptCleanupListeners = null; } } catch(e){}
                window.__prescriptCleanupListeners = null;

                // Clean legacy alien theme nodes & temporary styles
                [
                    'prescript-dynamic-modes', 'prescript-test-style',
                    'halibut-eye-demo-panel', 'eldritch-hover-eye-popup', 'eldritch-ambient-rifts-canvas',
                    'eldritch-bg-video', 'eldritch-vignette-overlay', 'eldritch-rift-header',
                    'capri-companion-root', 'capri-lightning-canvas', 'capri-top-popout',
                    'moonlit-bg-video', 'moonlit-vignette-overlay', 'moonlit-particles-canvas'
                ].forEach(id => {
                    const el = document.getElementById(id);
                    if (el) el.remove();
                });

                document.body.classList.remove('prescript-in-conversation', 'prescript-new-conversation');

                // Single global state object
                const state = {
                    animFrame: null,
                    watchdog: null,
                    quoteInterval: null,
                    quoteTimer: null,
                    observer: null,
                    cleanupListeners: null,
                    activeTargetContainer: null,
                    activeHoverLeaf: null,
                    lastFrameTime: performance.now(),
                    lastLayoutCheck: 0
                };
                window.__prescriptState = state;

                // Register official typewriter-effect core if available
                const twData = ${JSON.stringify(twBase64)};
                if (!window.Typewriter && twData) {
                    try {
                        const twFn = new Function(atob(twData));
                        twFn.call(window);
                    } catch (e) {}
                }

                // =========================================================================
                // 1. DOM NODES CREATION (SEPARATE TOP-LEVEL ELEMENTS)
                // =========================================================================
                const handDataUrl = "data:image/webp;base64," + ${JSON.stringify(imgBase64)};

                // (a) Cyan Strings of Fate Canvas
                let fateCanvas = document.getElementById('prescript-fate-canvas');
                if (!fateCanvas) {
                    fateCanvas = document.createElement('canvas');
                    fateCanvas.id = 'prescript-fate-canvas';
                    document.body.prepend(fateCanvas);
                }

                // (b) Transparent Index Hand Emblem (Clean logo, zero text inside)
                let handBg = document.getElementById('prescript-hand-bg');
                if (!handBg) {
                    handBg = document.createElement('div');
                    handBg.id = 'prescript-hand-bg';
                    handBg.innerHTML = '<img class="prescript-hand-img" src="' + handDataUrl + '" alt="The Index Hand Emblem" />';
                    document.body.prepend(handBg);
                } else {
                    const childQuote = handBg.querySelector('#prescript-quote-box');
                    if (childQuote) childQuote.remove();
                    const img = handBg.querySelector('.prescript-hand-img');
                    if (img && img.src !== handDataUrl) img.src = handDataUrl;
                }

                // (c) Dedicated Prescript Quote Box directly on document.body
                let quoteBox = document.getElementById('prescript-quote-box');
                if (!quoteBox) {
                    quoteBox = document.createElement('div');
                    quoteBox.id = 'prescript-quote-box';
                    quoteBox.className = 'prescript-bg-decree-caption';
                    document.body.appendChild(quoteBox);
                } else if (quoteBox.parentElement !== document.body) {
                    quoteBox.remove();
                    document.body.appendChild(quoteBox);
                }

                // (d) Obsidian-Black OLED Vignette Overlay
                let vignette = document.getElementById('prescript-vignette-overlay');
                if (!vignette) {
                    vignette = document.createElement('div');
                    vignette.id = 'prescript-vignette-overlay';
                    document.body.prepend(vignette);
                }

                // Update Antigravity Top Logo (data-testid="app-icon-new-conversation-button")
                function updateTopLogo() {
                    const btn = document.querySelector('[data-testid="app-icon-new-conversation-button"]');
                    if (btn) {
                        const svg = btn.querySelector('svg');
                        if (svg) svg.style.display = 'none';
                        let icon = btn.querySelector('.prescript-top-app-icon');
                        if (!icon) {
                            icon = document.createElement('img');
                            icon.className = 'prescript-top-app-icon';
                            icon.src = handDataUrl;
                            icon.alt = 'Prescript';
                            btn.appendChild(icon);
                        }
                    }

                    // Update Favicon / App Icon
                    let link = document.querySelector('link[rel*="icon"]');
                    if (!link) {
                        link = document.createElement('link');
                        link.rel = 'icon';
                        document.head.appendChild(link);
                    }
                    link.type = 'image/webp';
                    link.href = handDataUrl;
                }
                updateTopLogo();

                function ensureDOMElements() {
                    if (!document.getElementById('prescript-fate-canvas')) {
                        document.body.prepend(fateCanvas);
                    }
                    if (!document.getElementById('prescript-hand-bg')) {
                        document.body.prepend(handBg);
                    }
                    if (!document.getElementById('prescript-quote-box')) {
                        document.body.appendChild(quoteBox);
                    }
                    if (!document.getElementById('prescript-vignette-overlay')) {
                        document.body.prepend(vignette);
                    }
                    updateTopLogo();
                }

                // =========================================================================
                // 2. DYNAMIC LAYOUT SYMMETRY CONTROLLER
                // - New Conversation: Perfectly symmetrical horizontally with "Ask anything" box,
                //   Logo on top of box, Quote under box.
                // - In Conversation: Back to normal background center.
                // =========================================================================
                function updatePrescriptLayout(now) {
                    if (now && now - state.lastLayoutCheck < 150) return;
                    state.lastLayoutCheck = now || performance.now();

                    const curHand = document.getElementById('prescript-hand-bg');
                    const curQuote = document.getElementById('prescript-quote-box');
                    if (!curHand || !curQuote) return;

                    const composer = document.getElementById('antigravity.agentSidePanelInputBox') || document.querySelector('.rounded-2xl.bg-card-border');
                    const compRect = composer ? composer.getBoundingClientRect() : null;
                    const messages = document.querySelectorAll('[class*="group/user-input-step"], [class*="user-input-step"]');

                    // Active chat with messages: composer docked near bottom
                    const isInChat = messages.length > 0 && compRect && compRect.top > window.innerHeight * 0.65;

                    if (isInChat) {
                        // BACK TO NORMAL CONVERSATION LAYOUT
                        curHand.style.left = '54%';
                        curHand.style.top = '46%';
                        curHand.style.transform = 'translate(-50%, -50%)';

                        curQuote.style.left = '54%';
                        curQuote.style.top = 'calc(46% + 140px)';
                        curQuote.style.transform = 'translateX(-50%)';
                        curQuote.style.maxWidth = 'min(650px, 80vw)';
                    } else if (compRect) {
                        // SYMMETRICAL NEW CONVERSATION LAYOUT:
                        // Center is strictly based on the composer's exact center coordinates
                        const centerX = compRect.left + compRect.width / 2;

                        // Logo on top of "Ask anything" box
                        curHand.style.left = centerX + 'px';
                        curHand.style.top = (compRect.top - 16) + 'px';
                        curHand.style.transform = 'translate(-50%, -100%)';

                        // Quote under "Ask anything" box
                        curQuote.style.left = centerX + 'px';
                        curQuote.style.top = (compRect.bottom + 16) + 'px';
                        curQuote.style.transform = 'translateX(-50%)';
                        curQuote.style.maxWidth = Math.min(compRect.width, 680) + 'px';
                    }
                }
                updatePrescriptLayout();

                // =========================================================================
                // 3. DYNAMIC PRESCRIPT QUOTE GENERATOR & SMOOTH TYPEWRITER LOOP (16s)
                // =========================================================================
                const canonicalPrescripts = [
                    "To the one who receives this: Drink a cup of lukewarm water at 3:14, then look toward the northernmost tower.",
                    "Draw three concentric circles on the pavement before speaking to the fourth person you meet today.",
                    "Count the teeth of the next gear you find. If the number is even, walk home without turning left.",
                    "Fold a sheet of white paper seven times and leave it beneath the third streetlamp in District 12.",
                    "Do not close your eyes for more than two seconds when the clock chimes the twelfth hour.",
                    "Offer a blue flower to the stranger wearing a tarnished watch, then depart in silence.",
                    "Cut the thread of the garment worn for three days, and tie it to the handle of an unopened door.",
                    "When the pendulum swings to the east, speak the name of a forgotten street twice.",
                    "Place a single brass coin upon the windowsill before the rain begins to fall.",
                    "Read the seventh line of the nearest ledger aloud, then erase your footsteps from the threshold.",
                    "Follow the sound of the weaving loom until the third intersection, then wait for five breaths.",
                    "Do not question where the thread leads; the Will of the City has already woven the answer."
                ];

                const proceduralSubjects = [
                    "At the stroke of the fourth bell,",
                    "Before the streetlights of the Backstreets flicker twice,",
                    "When the shadow of the Spire touches the eastern alley,",
                    "Upon hearing the third chime of the messenger's pocket watch,",
                    "If the wind from the Outskirts carries the scent of iron,",
                    "Before opening the second file in your workspace,"
                ];
                const proceduralActions = [
                    "tap the left edge of your desk three times",
                    "trace a crescent arc across the nearest glass surface",
                    "count to seventeen in reverse without pausing",
                    "leave a single blank line at the end of your transmission",
                    "turn your gaze toward the highest window for four seconds",
                    "tie a pale thread around the stem of a withered leaf"
                ];
                const proceduralClosers = [
                    "and await the next Messenger's knock.",
                    "then proceed as the Loom decrees.",
                    "and speak no word of it until dawn.",
                    "so that the City's rhythm remains unbroken.",
                    "and discard whatever remains in your left hand.",
                    "for the Prescript tolerates neither delay nor doubt."
                ];

                let lastQuoteIndex = -1;
                function generateNextPrescript() {
                    if (Math.random() < 0.65) {
                        let idx = Math.floor(Math.random() * canonicalPrescripts.length);
                        if (idx === lastQuoteIndex) idx = (idx + 1) % canonicalPrescripts.length;
                        lastQuoteIndex = idx;
                        return canonicalPrescripts[idx];
                    } else {
                        const s = proceduralSubjects[Math.floor(Math.random() * proceduralSubjects.length)];
                        const a = proceduralActions[Math.floor(Math.random() * proceduralActions.length)];
                        const c = proceduralClosers[Math.floor(Math.random() * proceduralClosers.length)];
                        return s + ' ' + a + ', ' + c;
                    }
                }

                function typewritePrescript(text) {
                    ensureDOMElements();
                    const box = document.getElementById('prescript-quote-box');
                    if (!box) return;
                    if (state.quoteTimer) {
                        clearTimeout(state.quoteTimer);
                        state.quoteTimer = null;
                    }
                    box.style.opacity = '0';
                    state.quoteTimer = setTimeout(() => {
                        box.textContent = '';
                        box.style.opacity = '1';
                        const fullText = '“ ' + text + ' ”';
                        let i = 0;
                        function step() {
                            const curBox = document.getElementById('prescript-quote-box');
                            if (!curBox) return;
                            if (i <= fullText.length) {
                                curBox.textContent = fullText.slice(0, i) + (i < fullText.length ? '▮' : '');
                                i++;
                                state.quoteTimer = setTimeout(step, 24);
                            }
                        }
                        step();
                    }, 350);
                }

                // Initial trigger and robust 16-second cycle
                typewritePrescript(generateNextPrescript());
                state.quoteInterval = setInterval(() => {
                    typewritePrescript(generateNextPrescript());
                }, 16000);

                // =========================================================================
                // 4. CYAN STRINGS OF FATE CANVAS & WATCHDOG LOOP
                // =========================================================================
                const ctx = fateCanvas.getContext('2d');
                function resizeCanvas() {
                    const targetW = Math.max(300, window.innerWidth);
                    const targetH = Math.max(300, window.innerHeight);
                    if (fateCanvas.width !== targetW || fateCanvas.height !== targetH) {
                        fateCanvas.width = targetW;
                        fateCanvas.height = targetH;
                    }
                }
                resizeCanvas();

                const cyanGlowCanvas = document.createElement('canvas');
                cyanGlowCanvas.width = 4;
                cyanGlowCanvas.height = 128;
                const cGlowCtx = cyanGlowCanvas.getContext('2d');
                const cGrad = cGlowCtx.createLinearGradient(0, 0, 0, 128);
                cGrad.addColorStop(0, 'rgba(0, 229, 255, 0)');
                cGrad.addColorStop(0.75, 'rgba(80, 248, 255, 1)');
                cGrad.addColorStop(1, 'rgba(0, 229, 255, 0)');
                cGlowCtx.fillStyle = cGrad;
                cGlowCtx.fillRect(0, 0, 4, 128);

                const goldGlowCanvas = document.createElement('canvas');
                goldGlowCanvas.width = 4;
                goldGlowCanvas.height = 128;
                const gGlowCtx = goldGlowCanvas.getContext('2d');
                const gGrad = gGlowCtx.createLinearGradient(0, 0, 0, 128);
                gGrad.addColorStop(0, 'rgba(212, 175, 55, 0)');
                gGrad.addColorStop(0.7, 'rgba(243, 229, 171, 1)');
                gGrad.addColorStop(1, 'rgba(212, 175, 55, 0)');
                gGlowCtx.fillStyle = gGrad;
                gGlowCtx.fillRect(0, 0, 4, 128);

                const threadCount = 34;
                const threads = Array.from({ length: threadCount }, (_, i) => ({
                    xRatio: (i + 0.5) / threadCount + (Math.random() - 0.5) * 0.02,
                    alpha: 0.05 + Math.random() * 0.15,
                    speed: 0.4 + Math.random() * 1.1,
                    pulseOffset: Math.random() * Math.PI * 2,
                    dropY: Math.random() * Math.max(600, window.innerHeight),
                    dropLen: 60 + Math.random() * 160,
                    isGold: i % 7 === 0
                }));

                function renderFateStrings(now) {
                    state.lastFrameTime = now;
                    updatePrescriptLayout(now);

                    if (document.hidden) {
                        state.animFrame = requestAnimationFrame(renderFateStrings);
                        return;
                    }

                    const w = fateCanvas.width;
                    const h = fateCanvas.height;
                    ctx.clearRect(0, 0, w, h);

                    const t = now * 0.001;
                    for (const th of threads) {
                        const x = th.xRatio * w + Math.sin(t * 0.8 + th.pulseOffset) * 2.5;
                        const baseAlpha = th.alpha * (0.65 + 0.35 * Math.sin(t * 1.5 + th.pulseOffset));

                        ctx.beginPath();
                        ctx.moveTo(x, 0);
                        ctx.lineTo(x, h);
                        ctx.strokeStyle = th.isGold
                            ? 'rgba(212, 175, 55, ' + (baseAlpha * 0.5) + ')'
                            : 'rgba(0, 229, 255, ' + (baseAlpha * 0.6) + ')';
                        ctx.lineWidth = th.isGold ? 0.8 : 0.6;
                        ctx.stroke();

                        th.dropY = (th.dropY + th.speed) % (h + th.dropLen);
                        const yEnd = th.dropY;
                        const yStart = yEnd - th.dropLen;
                        const pulseTop = Math.max(0, yStart);
                        const pulseBottom = Math.min(h, yEnd);
                        const pulseHeight = pulseBottom - pulseTop;

                        if (pulseHeight > 0) {
                            ctx.globalAlpha = Math.min(1.0, baseAlpha * (th.isGold ? 1.7 : 2.0));
                            ctx.drawImage(
                                th.isGold ? goldGlowCanvas : cyanGlowCanvas,
                                x - 1,
                                pulseTop,
                                2,
                                pulseHeight
                            );
                            ctx.globalAlpha = 1.0;
                        }
                    }

                    state.animFrame = requestAnimationFrame(renderFateStrings);
                }
                state.animFrame = requestAnimationFrame(renderFateStrings);

                // Watchdog Heartbeat: checks every 2 seconds
                state.watchdog = setInterval(() => {
                    ensureDOMElements();
                    resizeCanvas();
                    updatePrescriptLayout();
                    const now = performance.now();
                    if (!document.hidden && now - state.lastFrameTime > 2500) {
                        if (state.animFrame) cancelAnimationFrame(state.animFrame);
                        state.animFrame = requestAnimationFrame(renderFateStrings);
                    }
                }, 2000);

                // =========================================================================
                // 4. INJECT THE INDEX & PRESCRIPT CSS THEME
                // =========================================================================
                let style = document.getElementById('custom-antigravity-theme');
                if (!style) {
                    style = document.createElement('style');
                    style.id = 'custom-antigravity-theme';
                    document.head.appendChild(style);
                }
                style.textContent = ${JSON.stringify(PRESCRIPT_CSS)};

                // =========================================================================
                // 5. INTERACTIVE PRESCRIPT SCOPED TYPEWRITER HOVER EFFECT
                // =========================================================================
                const STRICT_TARGET_SELECTOR = 'strong, b, .text-index-gold, code:not(pre code), .inline-pill, [class*="pill"], [class*="badge"], div[data-testid="conversation-row-sidebar"], div[class*="user-input-step"], .bg-card-border:has(.whitespace-pre-wrap)';
                const EXCLUDE_SELECTOR = 'a[href="/"], button[data-testid="automations-button"], pre, pre code, #prescript-hand-bg, #prescript-quote-box, #prescript-fate-canvas, #prescript-vignette-overlay';

                function escapePrescriptHtml(str) {
                    if (!str) return '';
                    return str
                        .replace(/&/g, '&amp;')
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;')
                        .replace(/"/g, '&quot;')
                        .replace(/'/g, '&#39;');
                }

                function findTextLeaf(container) {
                    if (!container) return null;
                    if (container.children.length === 0) return container;
                    
                    const promptText = container.querySelector('.whitespace-pre-wrap');
                    if (promptText) return promptText;

                    const rowTitle = container.querySelector('.truncate, span');
                    if (rowTitle) return rowTitle;

                    const leaf = container.querySelector('code, strong, b, span');
                    if (leaf && leaf.children.length === 0) return leaf;

                    return container;
                }

                function startTypewriter(el) {
                    if (!el || el.__prescriptTyping) return;
                    const rawText = el.__prescriptOriginalText || el.textContent;
                    if (!rawText || !rawText.trim() || rawText.trim() === '▮') return;

                    el.__prescriptOriginalText = rawText;
                    el.__prescriptTyping = true;
                    el.classList.add('prescript-hover-active');

                    const totalDuration = Math.min(350, Math.max(120, rawText.length * 2.2));
                    const startTime = performance.now();

                    function renderFrame(now) {
                        if (!el.isConnected || !el.__prescriptTyping) {
                            resetTypewriter(el);
                            return;
                        }

                        const elapsed = now - startTime;
                        const progress = Math.min(1, elapsed / totalDuration);
                        const count = Math.max(1, Math.floor(progress * rawText.length));

                        const typed = rawText.slice(0, count);
                        const ghost = rawText.slice(count);

                        el.innerHTML = '<span class="prescript-tw-wrapper"><span class="prescript-tw-typed">' + escapePrescriptHtml(typed) + '</span><span class="prescript-tw-cursor">▮</span><span class="prescript-tw-ghost">' + escapePrescriptHtml(ghost) + '</span></span>';

                        if (progress < 1) {
                            el.__prescriptTimer = requestAnimationFrame(renderFrame);
                        } else {
                            el.__prescriptTimer = null;
                            el.__prescriptCompleted = true;
                        }
                    }

                    // Initial Frame: unrevealed text is visible in dim cyber-cyan (opacity: 0.35) with cursor ▮ ready at index 0
                    el.innerHTML = '<span class="prescript-tw-wrapper"><span class="prescript-tw-cursor">▮</span><span class="prescript-tw-ghost">' + escapePrescriptHtml(rawText) + '</span></span>';
                    el.__prescriptTimer = requestAnimationFrame(renderFrame);
                }

                function resetTypewriter(el) {
                    if (!el) return;
                    if (el.__prescriptTimer) {
                        cancelAnimationFrame(el.__prescriptTimer);
                        el.__prescriptTimer = null;
                    }
                    el.__prescriptTyping = false;
                    el.__prescriptCompleted = false;
                    if (el.__prescriptOriginalText !== undefined) {
                        el.textContent = el.__prescriptOriginalText;
                        delete el.__prescriptOriginalText;
                    }
                    el.classList.remove('prescript-hover-active');
                }

                const onPrescriptMouseOver = (e) => {
                    if (state.activeTargetContainer && (state.activeTargetContainer === e.target || state.activeTargetContainer.contains(e.target))) {
                        return;
                    }

                    const container = e.target.closest(STRICT_TARGET_SELECTOR);
                    if (!container || container.closest(EXCLUDE_SELECTOR)) {
                        if (state.activeTargetContainer) {
                            resetTypewriter(state.activeHoverLeaf);
                            state.activeTargetContainer = null;
                            state.activeHoverLeaf = null;
                        }
                        return;
                    }

                    if (state.activeTargetContainer && state.activeTargetContainer !== container) {
                        resetTypewriter(state.activeHoverLeaf);
                    }

                    const leaf = findTextLeaf(container);
                    if (!leaf) return;

                    state.activeTargetContainer = container;
                    state.activeHoverLeaf = leaf;
                    startTypewriter(leaf);
                };

                const onPrescriptMouseOut = (e) => {
                    if (!state.activeTargetContainer) return;

                    if (e.relatedTarget && (state.activeTargetContainer === e.relatedTarget || state.activeTargetContainer.contains(e.relatedTarget))) {
                        return;
                    }

                    resetTypewriter(state.activeHoverLeaf);
                    state.activeTargetContainer = null;
                    state.activeHoverLeaf = null;
                };

                document.body.addEventListener('mouseover', onPrescriptMouseOver, { passive: true });
                document.body.addEventListener('mouseout', onPrescriptMouseOut, { passive: true });
                window.addEventListener('resize', () => {
                    resizeCanvas();
                    updatePrescriptLayout();
                }, { passive: true });

                state.cleanupListeners = () => {
                    document.body.removeEventListener('mouseover', onPrescriptMouseOver);
                    document.body.removeEventListener('mouseout', onPrescriptMouseOut);
                    window.removeEventListener('resize', resizeCanvas);
                };

                // Dynamic DOM Observer for instant recovery & alignment checks
                const observer = new MutationObserver(() => {
                    ensureDOMElements();
                    updatePrescriptLayout();
                });
                observer.observe(document.body, { childList: true, subtree: true });
                state.observer = observer;

                return 'Prescript Theme Live: Symmetrical New Conversation, Normal Active Chat, and Prescript App Icons!';
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

main().catch(console.error);
