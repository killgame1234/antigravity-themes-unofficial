const fs = require('fs');
const path = require('path');

const IMAGE_PATH = path.join(__dirname, 'prescript_source.webp');
const TYPEWRITER_PATH = path.join(__dirname, 'typewriter.core.js');

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
            const expression = `(async function() {
                // 0. Clean up any previous theme elements, timers, or observers
                if (window.__eldritchObserver) {
                    window.__eldritchObserver.disconnect();
                    window.__eldritchObserver = null;
                }
                if (window.__prescriptObserver) {
                    window.__prescriptObserver.disconnect();
                    window.__prescriptObserver = null;
                }

                // Register official typewriter-effect core (https://www.npmjs.com/package/typewriter-effect)
                if (!window.Typewriter && "${twBase64}") {
                    try {
                        const twFn = new Function(atob("${twBase64}"));
                        twFn.call(window);
                    } catch (e) {
                        console.error('Failed to initialize Typewriter core:', e);
                    }
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
                if (window.__capriTopPopoutTimer) {
                    clearTimeout(window.__capriTopPopoutTimer);
                    window.__capriTopPopoutTimer = null;
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

                // 1. Transparent Hand + Crescent + Blue Flower Emblem (Complete, unclipped top flower)
                const handDataUrl = "data:image/webp;base64,${imgBase64}";

                // 2. Create Background Layers:
                //    (a) Animated Cyan Strings of Fate Canvas
                const fateCanvas = document.createElement('canvas');
                fateCanvas.id = 'prescript-fate-canvas';
                document.body.prepend(fateCanvas);

                //    (b) Centered Index Hand Emblem + Dynamic Prescript Quote Container
                const handBg = document.createElement('div');
                handBg.id = 'prescript-hand-bg';
                handBg.innerHTML = \`
                    <img class="prescript-hand-img" src="\${handDataUrl}" alt="The Index Hand Emblem" />
                    <div id="prescript-quote-box" class="prescript-bg-decree-caption"></div>
                \`;
                document.body.prepend(handBg);

                //    (c) Obsidian-Black OLED Vignette Overlay
                const vignette = document.createElement('div');
                vignette.id = 'prescript-vignette-overlay';
                document.body.prepend(vignette);

                // 3. Dynamic Prescript Quote Generator (New Prescript every 2 minutes)
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
                    "and await the nextMessenger's knock.",
                    "then proceed as the Loom decrees.",
                    "and speak no word of it until dawn.",
                    "so that the City's rhythm remains unbroken.",
                    "and discard whatever remains in your left hand.",
                    "for the Prescript tolerates neither delay nor doubt."
                ];

                let lastIndex = -1;
                function generateNextPrescript() {
                    // Mix canonical lore Prescripts with procedural City decrees
                    if (Math.random() < 0.65) {
                        let idx = Math.floor(Math.random() * canonicalPrescripts.length);
                        if (idx === lastIndex) idx = (idx + 1) % canonicalPrescripts.length;
                        lastIndex = idx;
                        return canonicalPrescripts[idx];
                    } else {
                        const s = proceduralSubjects[Math.floor(Math.random() * proceduralSubjects.length)];
                        const a = proceduralActions[Math.floor(Math.random() * proceduralActions.length)];
                        const c = proceduralClosers[Math.floor(Math.random() * proceduralClosers.length)];
                        return \`\${s} \${a}, \${c}\`;
                    }
                }

                function typewritePrescript(text) {
                    const box = document.getElementById('prescript-quote-box');
                    if (!box) return;
                    if (window.__prescriptTypewriterTimer) {
                        clearTimeout(window.__prescriptTypewriterTimer);
                    }
                    box.style.opacity = '0';
                    setTimeout(() => {
                        box.textContent = '';
                        box.style.opacity = '1';
                        const fullText = '“ ' + text + ' ”';
                        let i = 0;
                        function step() {
                            if (!document.getElementById('prescript-quote-box')) return;
                            if (i <= fullText.length) {
                                box.textContent = fullText.slice(0, i) + (i < fullText.length ? '▮' : '');
                                i++;
                                window.__prescriptTypewriterTimer = setTimeout(step, 24);
                            }
                        }
                        step();
                    }, 300);
                }

                // Trigger initial Prescript immediately, then generate a new one every 2 minutes (120,000 ms)
                typewritePrescript(generateNextPrescript());
                window.__prescriptQuoteInterval = setInterval(() => {
                    typewritePrescript(generateNextPrescript());
                }, 120000);

                // 4. Animate Cyan Strings of Fate descending across the void
                const ctx = fateCanvas.getContext('2d');
                function resizeCanvas() {
                    fateCanvas.width = window.innerWidth;
                    fateCanvas.height = window.innerHeight;
                }
                resizeCanvas();
                window.addEventListener('resize', resizeCanvas);
                window.__prescriptCleanupListeners = () => {
                    window.removeEventListener('resize', resizeCanvas);
                    document.removeEventListener('mouseover', onPrescriptMouseOver, true);
                    document.removeEventListener('mouseout', onPrescriptMouseOut, true);
                    if (activeTypewriterTarget) resetTypewriter(activeTypewriterTarget);
                };

                // Pre-rendered offscreen gradient sprites to eliminate 2,000+ GC gradient allocations/sec
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
                    dropY: Math.random() * window.innerHeight,
                    dropLen: 60 + Math.random() * 160,
                    isGold: i % 7 === 0
                }));

                function renderFateStrings(now) {
                    if (document.hidden) {
                        window.__prescriptAnimFrame = requestAnimationFrame(renderFateStrings);
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
                            ? \`rgba(212, 175, 55, \${baseAlpha * 0.5})\`
                            : \`rgba(0, 229, 255, \${baseAlpha * 0.6})\`;
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

                    window.__prescriptAnimFrame = requestAnimationFrame(renderFateStrings);
                }
                window.__prescriptAnimFrame = requestAnimationFrame(renderFateStrings);

                // 5. Inject The Index & Prescript CSS Theme (Clean Top Bar & Default Stop Button)
                let style = document.getElementById('custom-antigravity-theme');
                if (!style) {
                    style = document.createElement('style');
                    style.id = 'custom-antigravity-theme';
                    document.head.appendChild(style);
                }

                style.textContent = \`
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

                    #prescript-hand-bg {
                        position: fixed !important;
                        top: 46% !important;
                        left: 54% !important;
                        transform: translate(-50%, -50%) !important;
                        z-index: 0 !important;
                        pointer-events: none !important;
                        display: flex !important;
                        flex-direction: column !important;
                        align-items: center !important;
                        justify-content: center !important;
                        background: transparent !important;
                        box-shadow: none !important;
                        border: none !important;
                    }

                    @keyframes prescript-hand-float {
                        0%, 100% {
                            transform: translateY(0px);
                            opacity: 0.82;
                        }
                        50% {
                            transform: translateY(-5px);
                            opacity: 0.95;
                        }
                    }

                    /* Clean Hand Emblem with ZERO box or square shadow */
                    .prescript-hand-img {
                        width: min(350px, 42vh) !important;
                        height: auto !important;
                        background: transparent !important;
                        box-shadow: none !important;
                        border: none !important;
                        filter: none !important;
                        animation: prescript-hand-float 6s infinite ease-in-out !important;
                        user-select: none !important;
                    }

                    /* Dynamic Prescript Quote Styling */
                    .prescript-bg-decree-caption {
                        margin-top: 8px !important;
                        max-width: min(560px, 70vw) !important;
                        text-align: center !important;
                        font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace !important;
                        font-size: 12px !important;
                        line-height: 1.55 !important;
                        letter-spacing: 0.14em !important;
                        color: rgba(130, 238, 255, 0.72) !important;
                        text-shadow: 0 0 10px rgba(0, 229, 255, 0.55) !important;
                        transition: opacity 0.3s ease !important;
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

                    #root {
                        position: relative !important;
                        z-index: 1 !important;
                        background: transparent !important;
                    }

                    .bg-background {
                        background-color: transparent !important;
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
                       WITH #00E5FF HAIRLINE BORDERS & #D4AF37 SACRED GOLD CORNER ACCENTS
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
                \`;


                // 6. Interactive Prescript Scoped Typewriter Hover Effect
                // Strictly scoped to:
                // 1) Yellow/Gold text: strong, b, .text-index-gold
                // 2) Boxed text: code:not(pre code), .inline-pill, [class*="pill"], [class*="badge"],
                //    sidebar conversation rows (div[data-testid="conversation-row-sidebar"]),
                //    and user conversation prompt cards (div[class*="user-input-step"], .bg-card-border:has(.whitespace-pre-wrap))
                // Excludes plain headings, plain text, and sidebar nav links (+ New Conversation, History)
                const STRICT_TARGET_SELECTOR = 'strong, b, .text-index-gold, code:not(pre code), .inline-pill, [class*="pill"], [class*="badge"], div[data-testid="conversation-row-sidebar"], div[class*="user-input-step"], .bg-card-border:has(.whitespace-pre-wrap)';
                const EXCLUDE_SELECTOR = 'a[href="/"], button[data-testid="automations-button"], pre, pre code, #prescript-hand-bg, .prescript-bg-decree-caption, #prescript-fate-canvas, #prescript-vignette-overlay';

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

                let activeTargetContainer = null;
                let activeTextLeaf = null;

                function startTypewriter(el) {
                    if (!el || el.__prescriptTyping) return;
                    const rawText = el.__prescriptOriginalText || el.textContent;
                    if (!rawText || !rawText.trim() || rawText.trim() === '▮') return;

                    el.__prescriptOriginalText = rawText;
                    el.__prescriptTyping = true;
                    el.classList.add('prescript-hover-active');

                    // Dynamic duration: snappy ~120ms for short badges, up to ~350ms for long prompts
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

                    // Initial Frame: text is NOT blanked out! Unrevealed text is visible in dim cyber-cyan (opacity: 0.35)
                    // with cursor ▮ ready at index 0, guaranteeing zero layout shift and smooth transition
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
                    // 1. If pointer is moving inside the already active container, DO NOTHING!
                    // This prevents horizontal/vertical drag from restarting the animation.
                    if (activeTargetContainer && (activeTargetContainer === e.target || activeTargetContainer.contains(e.target))) {
                        return;
                    }

                    // 2. Strict targeting: only yellow text and boxed elements
                    const container = e.target.closest(STRICT_TARGET_SELECTOR);
                    if (!container || container.closest(EXCLUDE_SELECTOR)) {
                        if (activeTargetContainer) {
                            resetTypewriter(activeTextLeaf);
                            activeTargetContainer = null;
                            activeTextLeaf = null;
                        }
                        return;
                    }

                    if (activeTargetContainer && activeTargetContainer !== container) {
                        resetTypewriter(activeTextLeaf);
                    }

                    const leaf = findTextLeaf(container);
                    if (!leaf) return;

                    activeTargetContainer = container;
                    activeTextLeaf = leaf;
                    startTypewriter(leaf);
                };

                const onPrescriptMouseOut = (e) => {
                    if (!activeTargetContainer) return;

                    // Only reset if mouse truly leaves the outer container (not moving across child elements or padding)
                    if (e.relatedTarget && (activeTargetContainer === e.relatedTarget || activeTargetContainer.contains(e.relatedTarget))) {
                        return;
                    }

                    resetTypewriter(activeTextLeaf);
                    activeTargetContainer = null;
                    activeTextLeaf = null;
                };

                document.addEventListener('mouseover', onPrescriptMouseOver, true);
                document.addEventListener('mouseout', onPrescriptMouseOut, true);

                return 'Prescript Theme Updated (Clean Header, Default Stop Button, Transparent Hand Emblem, 2-Min Quote Generator)!';
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
