const fs = require('fs');
const path = require('path');

const themesRoot = path.resolve(__dirname, '..');
const capriSpritePath = path.join(themesRoot, 'Capri', 'capri_sprite.webp');
const capriVideoPath = path.join(themesRoot, 'Capri', 'capri_popout.mp4');
const prescriptImgPath = path.join(themesRoot, 'Prescript', 'prescript_source.webp');

const capriSpriteB64 = fs.existsSync(capriSpritePath) ? fs.readFileSync(capriSpritePath).toString('base64') : '';
const capriVideoB64 = fs.existsSync(capriVideoPath) ? fs.readFileSync(capriVideoPath).toString('base64') : '';
const prescriptImgB64 = fs.existsSync(prescriptImgPath) ? fs.readFileSync(prescriptImgPath).toString('base64') : '';

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Antigravity 2.0 Custom Theme Tutorial — YouTube & TikTok Animation Studio</title>
<style>
    :root {
        --pink: #FF1E56;
        --green: #00E64D;
        --cyan: #00E5FF;
        --gold: #D4AF37;
        --void: #07030D;
        --panel: #10061C;
    }
    * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
        user-select: none;
    }
    body {
        background: #040108;
        color: #FDF2F6;
        font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
        height: 100vh;
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }
    /* Top Studio Toolbar */
    .studio-bar {
        height: 58px;
        background: linear-gradient(90deg, #090312 0%, #190728 50%, #090312 100%);
        border-bottom: 1.5px solid rgba(255, 30, 86, 0.55);
        box-shadow: 0 4px 24px rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 20px;
        z-index: 20;
        gap: 12px;
    }
    .studio-brand {
        display: flex;
        align-items: center;
        gap: 10px;
        font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
        font-weight: 800;
        font-size: 14px;
        letter-spacing: 0.08em;
        color: var(--green);
        text-shadow: -1px 0 var(--pink);
    }
    .studio-badge {
        background: rgba(255, 30, 86, 0.22);
        border: 1px solid var(--pink);
        color: #FFF;
        padding: 3px 8px;
        border-radius: 5px;
        font-size: 11px;
    }
    .studio-controls {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
    }
    .btn {
        background: #140724;
        border: 1.5px solid rgba(255, 30, 86, 0.55);
        color: #FDF2F6;
        padding: 7px 13px;
        border-radius: 6px;
        font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
        font-size: 12px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.16s ease;
        display: flex;
        align-items: center;
        gap: 6px;
    }
    .btn:hover {
        border-color: var(--green);
        color: var(--green);
        box-shadow: 0 0 12px rgba(0, 230, 77, 0.35);
    }
    .btn.active {
        background: linear-gradient(135deg, rgba(255, 30, 86, 0.35), rgba(0, 230, 77, 0.22));
        border-color: var(--green);
        color: #FFF;
        box-shadow: -2px 0 10px rgba(255, 30, 86, 0.45), 2px 0 10px rgba(0, 230, 77, 0.45);
    }
    .btn-record {
        background: linear-gradient(135deg, #FF1E56, #900C3F);
        border-color: #00E64D;
        color: #FFF;
    }
    .btn-record.recording {
        background: #00E64D;
        color: #05020A;
        border-color: #FF1E56;
        animation: pulse-rec 0.9s infinite alternate;
    }
    @keyframes pulse-rec {
        from { box-shadow: 0 0 8px #00E64D; }
        to { box-shadow: 0 0 24px #FF1E56; }
    }
    /* Stage Viewport */
    .stage-wrap {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 16px;
        position: relative;
        background:
            radial-gradient(circle at 50% 50%, rgba(255, 30, 86, 0.08) 0%, transparent 65%),
            repeating-linear-gradient(0deg, rgba(255,255,255,0.015) 0px, rgba(255,255,255,0.015) 1px, transparent 1px, transparent 32px),
            #040108;
        overflow: hidden;
    }
    #stage-canvas {
        max-width: 100%;
        max-height: 100%;
        border-radius: 10px;
        border: 2px solid rgba(255, 30, 86, 0.65);
        box-shadow:
            -6px 0 35px rgba(255, 30, 86, 0.35),
            6px 0 35px rgba(0, 230, 77, 0.28),
            0 20px 60px rgba(0, 0, 0, 0.95);
        background: #07030D;
    }
    /* Bottom Timeline & Scene Selector */
    .timeline-bar {
        height: 64px;
        background: #080311;
        border-top: 1px solid rgba(0, 230, 77, 0.35);
        display: flex;
        align-items: center;
        padding: 0 20px;
        gap: 10px;
        z-index: 20;
    }
    .scene-pills {
        display: flex;
        gap: 6px;
        flex: 1;
        overflow-x: auto;
    }
    .scene-pill {
        flex: 1;
        min-width: 115px;
        background: #120620;
        border: 1px solid rgba(255, 30, 86, 0.35);
        border-radius: 6px;
        padding: 6px 8px;
        cursor: pointer;
        font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
        font-size: 10.5px;
        color: #C89EB4;
        transition: all 0.15s ease;
        position: relative;
        overflow: hidden;
    }
    .scene-pill:hover {
        border-color: var(--green);
        color: #FFF;
    }
    .scene-pill.current {
        border-color: var(--green);
        color: #FFF;
        background: rgba(0, 230, 77, 0.14);
        box-shadow: 0 0 12px rgba(0, 230, 77, 0.25);
    }
    .scene-pill .step-num {
        color: var(--green);
        font-weight: 800;
        display: block;
        font-size: 9.5px;
        margin-bottom: 2px;
    }
    .scene-pill .progress-fill {
        position: absolute;
        left: 0;
        bottom: 0;
        height: 3px;
        background: linear-gradient(90deg, var(--pink), var(--green));
        width: 0%;
    }
    .time-readout {
        font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
        font-size: 12px;
        color: var(--green);
        min-width: 105px;
        text-align: right;
    }
</style>
</head>
<body>

<div class="studio-bar">
    <div class="studio-brand">
        <span>⚡ ANTIGRAVITY 2.0 THEME GUIDE STUDIO</span>
        <span class="studio-badge" id="mode-badge">📺 YOUTUBE 16:9 (1920×1080)</span>
    </div>
    <div class="studio-controls">
        <button class="btn active" id="btn-yt" title="1920x1080 Widescreen for YouTube">📺 YouTube (16:9)</button>
        <button class="btn" id="btn-tiktok" title="1080x1920 Vertical for TikTok / Shorts / Reels">📱 TikTok / Shorts (9:16)</button>
        <button class="btn" id="btn-play">⏸ Pause</button>
        <button class="btn" id="btn-restart">⏮ Restart</button>
        <button class="btn active" id="btn-sfx">🔊 Synth Audio: ON</button>
        <button class="btn btn-record" id="btn-record">🔴 Record & Export Video</button>
    </div>
</div>

<div class="stage-wrap">
    <canvas id="stage-canvas" width="1920" height="1080"></canvas>
</div>

<div class="timeline-bar">
    <div class="scene-pills" id="scene-pills"></div>
    <div class="time-readout" id="time-readout">00.0s / 46.0s</div>
</div>

<script>
// ============================================================================
// 1. LOAD EMBEDDED ASSETS (CAPRI SPRITE, CAPRI POPOUT VIDEO, PRESCRIPT HAND)
// ============================================================================
const CAPRI_SPRITE_B64 = "${capriSpriteB64}";
const CAPRI_VIDEO_B64 = "${capriVideoB64}";
const PRESCRIPT_IMG_B64 = "${prescriptImgB64}";

let capriCanvasSprite = null;
let prescriptCanvasSprite = null;
let popoutVideoEl = document.createElement('video');
popoutVideoEl.muted = true;
popoutVideoEl.loop = true;
popoutVideoEl.playsInline = true;

if (CAPRI_VIDEO_B64) {
    const bin = atob(CAPRI_VIDEO_B64);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    const blob = new Blob([arr], { type: 'video/mp4' });
    popoutVideoEl.src = URL.createObjectURL(blob);
    popoutVideoEl.play().catch(() => {});
}

function keyOutBlackToCanvas(b64, threshold = 18) {
    return new Promise((resolve) => {
        if (!b64) return resolve(null);
        const img = new Image();
        img.onload = () => {
            const c = document.createElement('canvas');
            const w = img.naturalWidth, h = img.naturalHeight;
            c.width = w; c.height = h;
            const ctx = c.getContext('2d');
            ctx.drawImage(img, 0, 0);
            const imgData = ctx.getImageData(0, 0, w, h);
            const px = imgData.data;
            const visited = new Uint8Array(w * h);
            const q = [];
            for (let x = 0; x < w; x++) { q.push(x); q.push((h - 1) * w + x); }
            for (let y = 0; y < h; y++) { q.push(y * w); q.push(y * w + (w - 1)); }
            while (q.length > 0) {
                const pos = q.pop();
                if (pos < 0 || pos >= w * h || visited[pos]) continue;
                visited[pos] = 1;
                const idx = pos * 4;
                if (px[idx] < threshold && px[idx+1] < threshold && px[idx+2] < threshold) {
                    px[idx+3] = 0;
                    const x = pos % w, y = (pos - x) / w;
                    if (x > 0) q.push(pos - 1);
                    if (x < w - 1) q.push(pos + 1);
                    if (y > 0) q.push(pos - w);
                    if (y < h - 1) q.push(pos + w);
                }
            }
            ctx.putImageData(imgData, 0, 0);
            resolve(c);
        };
        img.src = 'data:image/webp;base64,' + b64;
    });
}

Promise.all([
    keyOutBlackToCanvas(CAPRI_SPRITE_B64, 18),
    keyOutBlackToCanvas(PRESCRIPT_IMG_B64, 16)
]).then(([capriC, prescriptC]) => {
    capriCanvasSprite = capriC;
    prescriptCanvasSprite = prescriptC;
});

// ============================================================================
// 2. SCENES DEFINITION (7 STEP-BY-STEP SCENES FOR YOUTUBE & TIKTOK)
// ============================================================================
const SCENES = [
    {
        id: 1,
        tag: "HOOK // 01",
        shortTitle: "Default vs Custom",
        duration: 6.0,
        headline: "TURN ANTIGRAVITY 2.0 INTO AN ANIME / CYBERPUNK UI!",
        subhead: "Live-inject custom themes, video backgrounds & interactive companions in 5 easy steps.",
        bullets: [
            "Zero core file patching (no app.asar hacking required)",
            "Switch between Eldritch, Project Moon & Edgerunners S2 Capri live",
            "Works with 1 double-click on any Windows PC"
        ]
    },
    {
        id: 2,
        tag: "STEP 1 // ARCHITECTURE",
        shortTitle: "How Injection Works",
        duration: 6.5,
        headline: "STEP 1: USE ANTIGRAVITY'S BUILT-IN NODE & CDP PORT",
        subhead: "Antigravity.exe includes Node.js when run with ELECTRON_RUN_AS_NODE=1.",
        codeTitle: "Apply_Capri_Theme.bat",
        codeLines: [
            "@echo off",
            "set ELECTRON_RUN_AS_NODE=1",
            "\"%LOCALAPPDATA%\\Programs\\antigravity\\Antigravity.exe\" \"%~dp0apply_capri_theme.js\"",
            "",
            "// Inside apply_capri_theme.js:",
            "const port = fs.readFileSync(APPDATA + '/Antigravity/DevToolsActivePort');",
            "const pages = await fetch('http://127.0.0.1:' + port + '/json/list').then(r => r.json());",
            "ws.send(JSON.stringify({ method: 'Runtime.evaluate', params: { expression } }));"
        ]
    },
    {
        id: 3,
        tag: "STEP 2 // CSS & GOTCHAS",
        shortTitle: "CSS & 3 UI Fixes",
        duration: 7.0,
        headline: "STEP 2: INJECT CSS & FIX THE 3 ANTIGRAVITY UI GOTCHAS",
        subhead: "Avoid background shadow boxes, transparent Settings modals & unstyled sidebar buttons:",
        codeTitle: "custom-antigravity-theme (<style>)",
        codeLines: [
            "/* 1. Put main background on html, body & keep .bg-background transparent! */",
            "#root, .bg-background, .sticky { background: transparent !important; }",
            "",
            "/* 2. Keep Settings Modal dark & readable (97% opaque) */",
            ".settings-modal-container, [role='dialog'] { background: rgba(8,3,16,0.97) !important; }",
            "",
            "/* 3. Sync Sidebar 'Automations' button alongside <a> links */",
            "aside a, button[data-testid='automations-button'] { color: #C89EB4 !important; }",
            "",
            "/* 4. Add Cyberpsychosis Hover Glitch on UI controls */",
            "button:hover, a:hover { animation: capri-glitch 0.28s infinite; }"
        ]
    },
    {
        id: 4,
        tag: "STEP 3 // MEDIA & SPRITES",
        shortTitle: "Sprites & Blob Video",
        duration: 6.5,
        headline: "STEP 3: CHROMA-KEY SPRITES & LOAD VIDEOS VIA BLOB URL",
        subhead: "Bypass https://127.0.0.1 file:/// blocks using Base64 -> Blob URLs & Canvas flood-fill:",
        codeTitle: "Media & Alpha Keying Engine",
        codeLines: [
            "// Convert local .mp4 to Base64 -> Uint8Array -> Blob URL:",
            "const blob = new Blob([bytes], { type: 'video/mp4' });",
            "video.src = URL.createObjectURL(blob);",
            "video.muted = true; video.play(); // Required for autoplay!",
            "",
            "// Flood-fill key out black (#000) background from .webp sprites:",
            "if (r < 18 && g < 18 && b < 18) px[idx + 3] = 0;",
            "const cleanSpriteUrl = canvas.toDataURL('image/png');"
        ]
    },
    {
        id: 5,
        tag: "STEP 4 // COMPANION AI",
        shortTitle: "Interactive Companion",
        duration: 7.5,
        headline: "STEP 4: 60FPS COMPANION, LIGHTNING & RIGHT-CLICK MENU",
        subhead: "Capri patrols the perimeter, zaps chat boxes with lightning & opens a Neural Console:",
        codeTitle: "Interactive Companion Features",
        codeLines: [
            "• Left-Click Capri -> Speaks Edgerunners S2 lines + spark burst",
            "• Perimeter Patrol -> Walks edges so center workspace stays clear",
            "• Lightning Engine -> Midpoint-displacement bolts glitch chat cards",
            "• Right-Click Menu -> Toggle Move, Toggle Attack, Zap Now & Mini-Chat!",
            "• Top Edge Fix -> Toggles .flip-below when y < 230 so dialog never clips"
        ]
    },
    {
        id: 6,
        tag: "STEP 5 // CEILING POP-OUT",
        shortTitle: "Top Ceiling Pop-Out",
        duration: 6.5,
        headline: "STEP 5: UPSIDE-DOWN CEILING RIFT VIDEO POP-OUT (0:00–0:06)",
        subhead: "Capri periodically drops down upside-down from the top bar of Antigravity!",
        codeTitle: "#capri-top-popout (350×300 Studio Trigger Portal)",
        codeLines: [
            "#capri-top-popout { top: 0; transform: translate(-50%, -120%); opacity: 0; }",
            "#capri-top-popout.active { transform: translate(-50%, 0%); opacity: 1; }",
            "",
            "// Enforce strict 0:00 -> 0:06 clip playback:",
            "topVideo.currentTime = 0.0;",
            "topVideo.addEventListener('timeupdate', () => {",
            "  if (topVideo.currentTime >= 6.0) dismissTopPopout();",
            "});"
        ]
    },
    {
        id: 7,
        tag: "OUTRO // GET IT NOW",
        shortTitle: "GitHub & AI Prompt",
        duration: 6.0,
        headline: "CLONE THE REPO OR ASK ANTIGRAVITY AI TO BUILD YOURS!",
        subhead: "Grab all 3 themes (Capri, Project Moon Prescript, Eldritch) + the full guide on GitHub:",
        codeTitle: "github.com/killgame1234/antigravity-themes-unofficial",
        codeLines: [
            "git clone https://github.com/killgame1234/antigravity-themes-unofficial.git",
            "",
            "// Or prompt Antigravity AI directly:",
            "\"Recreate a [Character] theme in .gemini/antigravity/themes with an",
            " interactive companion, hover glitch effects, and a .bat launcher!\""
        ]
    }
];

const TOTAL_DURATION = SCENES.reduce((acc, s) => acc + s.duration, 0);

// ============================================================================
// 3. SYNTHESIZED CYBERPUNK AUDIO ENGINE (WEB AUDIO API + MEDIARECORDER STREAM)
// ============================================================================
let audioCtx = null;
let audioDest = null;
let sfxEnabled = true;
let lastSceneTriggered = -1;
let lastBeatIndex = -1;

function ensureAudio() {
    if (!audioCtx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AC();
        audioDest = audioCtx.createMediaStreamDestination();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function playCyberSynth(freq, type = 'sawtooth', dur = 0.18, vol = 0.06) {
    if (!sfxEnabled) return;
    ensureAudio();
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.5, now + dur);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1800, now);

    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    if (audioDest) gain.connect(audioDest);

    osc.start(now);
    osc.stop(now + dur);
}

function playSceneTransitionWhoosh() {
    if (!sfxEnabled) return;
    ensureAudio();
    playCyberSynth(520, 'sawtooth', 0.22, 0.07);
    setTimeout(() => playCyberSynth(780, 'triangle', 0.25, 0.06), 70);
}

// ============================================================================
// 4. TIMELINE & UI CONTROLS
// ============================================================================
const canvas = document.getElementById('stage-canvas');
const ctx = canvas.getContext('2d');
const pillsContainer = document.getElementById('scene-pills');
const timeReadout = document.getElementById('time-readout');

let aspectMode = '16:9'; // '16:9' (1920x1080) or '9:16' (1080x1920)
let isPlaying = true;
let elapsed = 0;
let lastFrameTime = performance.now();

SCENES.forEach((sc, idx) => {
    const pill = document.createElement('div');
    pill.className = 'scene-pill';
    pill.innerHTML = \`
        <span class="step-num">\${sc.tag}</span>
        <span>\${sc.shortTitle}</span>
        <div class="progress-fill" id="prog-\${idx}"></div>
    \`;
    pill.addEventListener('click', () => {
        ensureAudio();
        let t = 0;
        for (let i = 0; i < idx; i++) t += SCENES[i].duration;
        elapsed = t;
        playSceneTransitionWhoosh();
    });
    pillsContainer.appendChild(pill);
});

document.getElementById('btn-yt').addEventListener('click', () => {
    aspectMode = '16:9';
    canvas.width = 1920;
    canvas.height = 1080;
    document.getElementById('btn-yt').classList.add('active');
    document.getElementById('btn-tiktok').classList.remove('active');
    document.getElementById('mode-badge').textContent = '📺 YOUTUBE 16:9 (1920×1080)';
});

document.getElementById('btn-tiktok').addEventListener('click', () => {
    aspectMode = '9:16';
    canvas.width = 1080;
    canvas.height = 1920;
    document.getElementById('btn-tiktok').classList.add('active');
    document.getElementById('btn-yt').classList.remove('active');
    document.getElementById('mode-badge').textContent = '📱 TIKTOK / SHORTS 9:16 (1080×1920)';
});

const btnPlay = document.getElementById('btn-play');
btnPlay.addEventListener('click', () => {
    ensureAudio();
    isPlaying = !isPlaying;
    btnPlay.textContent = isPlaying ? '⏸ Pause' : '▶ Play';
});

document.getElementById('btn-restart').addEventListener('click', () => {
    ensureAudio();
    elapsed = 0;
    isPlaying = true;
    btnPlay.textContent = '⏸ Pause';
    playSceneTransitionWhoosh();
});

const btnSfx = document.getElementById('btn-sfx');
btnSfx.addEventListener('click', () => {
    ensureAudio();
    sfxEnabled = !sfxEnabled;
    btnSfx.textContent = sfxEnabled ? '🔊 Synth Audio: ON' : '🔇 Synth Audio: OFF';
    btnSfx.classList.toggle('active', sfxEnabled);
});

// ============================================================================
// 5. 1-CLICK VIDEO RECORDER & EXPORTER (.MP4 / .WEBM)
// ============================================================================
let mediaRecorder = null;
let recordedChunks = [];
let isRecording = false;
const btnRecord = document.getElementById('btn-record');

btnRecord.addEventListener('click', () => {
    ensureAudio();
    if (isRecording) {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
        }
        return;
    }

    // Start from 0:00 and record full 46s animation automatically
    elapsed = 0;
    isPlaying = true;
    btnPlay.textContent = '⏸ Pause';
    recordedChunks = [];

    const canvasStream = canvas.captureStream(60);
    if (audioDest) {
        const audioTracks = audioDest.stream.getAudioTracks();
        if (audioTracks.length > 0) canvasStream.addTrack(audioTracks[0]);
    }

    const mimeTypes = [
        'video/mp4;codecs=avc1',
        'video/mp4',
        'video/webm;codecs=vp9',
        'video/webm;codecs=vp8',
        'video/webm'
    ];
    let chosenMime = mimeTypes.find(m => MediaRecorder.isTypeSupported(m)) || '';

    mediaRecorder = new MediaRecorder(canvasStream, chosenMime ? {
        mimeType: chosenMime,
        videoBitsPerSecond: 12000000
    } : { videoBitsPerSecond: 12000000 });

    mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) recordedChunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
        isRecording = false;
        btnRecord.classList.remove('recording');
        btnRecord.textContent = '🔴 Record & Export Video';

        const ext = chosenMime.includes('mp4') ? 'mp4' : 'webm';
        const blob = new Blob(recordedChunks, { type: chosenMime || 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const modeTag = aspectMode === '16:9' ? 'YouTube_16x9' : 'TikTok_9x16';
        a.href = url;
        a.download = \`Antigravity_Custom_Theme_Guide_\${modeTag}.\${ext}\`;
        document.body.appendChild(a);
        a.click();
        a.remove();
    };

    mediaRecorder.start(200);
    isRecording = true;
    btnRecord.classList.add('recording');
    btnRecord.textContent = '⏹ Stop & Save Video...';
});

// ============================================================================
// 6. CANVAS DRAWING HELPERS (MOCK ANTIGRAVITY IDE, LIGHTNING, CODE CARDS)
// ============================================================================
function drawRoundedRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

function drawLightning(ctx, x1, y1, x2, y2, color, width = 3, displace = 28) {
    const pts = [{ x: x1, y: y1 }];
    const steps = 10;
    for (let i = 1; i < steps; i++) {
        const t = i / steps;
        const jitter = (Math.random() - 0.5) * displace;
        pts.push({
            x: x1 + (x2 - x1) * t + jitter,
            y: y1 + (y2 - y1) * t + jitter
        });
    }
    pts.push({ x: x2, y: y2 });

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.shadowColor = color;
    ctx.shadowBlur = 18;
    ctx.stroke();

    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = Math.max(1, width * 0.38);
    ctx.stroke();
    ctx.restore();
}

// Simulated Antigravity 2.0 Window Preview
function drawSimulatedAntigravityWindow(ctx, x, y, w, h, sceneIdx, sceneTime, globalTime) {
    ctx.save();
    drawRoundedRect(ctx, x, y, w, h, 14);
    ctx.clip();

    // Determine theme flavor inside preview window
    let flavor = 'capri';
    if (sceneIdx === 0) {
        if (sceneTime < 1.5) flavor = 'default';
        else if (sceneTime < 3.0) flavor = 'eldritch';
        else if (sceneTime < 4.4) flavor = 'prescript';
        else flavor = 'capri';
    } else if (sceneIdx === 3 && sceneTime < 3.0) {
        flavor = 'prescript';
    }

    const bgCol = flavor === 'default' ? '#18181B'
                : flavor === 'eldritch' ? '#080104'
                : flavor === 'prescript' ? '#020508'
                : '#07030D';
    const accent1 = flavor === 'default' ? '#3F3F46'
                  : flavor === 'eldritch' ? '#FF0033'
                  : flavor === 'prescript' ? '#00E5FF'
                  : '#FF1E56';
    const accent2 = flavor === 'default' ? '#71717A'
                  : flavor === 'eldritch' ? '#99001F'
                  : flavor === 'prescript' ? '#D4AF37'
                  : '#00E64D';

    ctx.fillStyle = bgCol;
    ctx.fillRect(x, y, w, h);

    // Subtle grid or Strings of Fate inside preview
    if (flavor === 'prescript') {
        for (let i = 0; i < 16; i++) {
            const tx = x + (w * (i + 0.5)) / 16;
            ctx.strokeStyle = i % 4 === 0 ? 'rgba(212,175,55,0.22)' : 'rgba(0,229,255,0.22)';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(tx, y);
            ctx.lineTo(tx, y + h);
            ctx.stroke();
        }
        if (prescriptCanvasSprite) {
            const pw = Math.min(w * 0.34, h * 0.46);
            const ph = pw * (prescriptCanvasSprite.height / prescriptCanvasSprite.width);
            ctx.globalAlpha = 0.85;
            ctx.drawImage(prescriptCanvasSprite, x + w * 0.58 - pw / 2, y + h * 0.48 - ph / 2, pw, ph);
            ctx.globalAlpha = 1;
        }
    } else if (flavor === 'capri') {
        ctx.strokeStyle = 'rgba(0, 230, 77, 0.06)';
        ctx.lineWidth = 1;
        for (let gx = x; gx < x + w; gx += 36) {
            ctx.beginPath(); ctx.moveTo(gx, y); ctx.lineTo(gx, y + h); ctx.stroke();
        }
        for (let gy = y; gy < y + h; gy += 36) {
            ctx.beginPath(); ctx.moveTo(x, gy); ctx.lineTo(x + w, gy); ctx.stroke();
        }
    }

    // Titlebar
    const tbH = 34;
    ctx.fillStyle = flavor === 'default' ? '#202024' : '#0B0314';
    ctx.fillRect(x, y, w, tbH);
    ctx.strokeStyle = accent1;
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(x, y + tbH); ctx.lineTo(x + w, y + tbH); ctx.stroke();

    ctx.fillStyle = accent2;
    ctx.font = 'bold 12px Consolas, monospace';
    ctx.fillText('ANTIGRAVITY 2.0 // ' + flavor.toUpperCase() + ' ENGINE', x + 16, y + 22);

    // Sidebar
    const sbW = w * 0.24;
    ctx.fillStyle = flavor === 'default' ? '#141417' : 'rgba(10, 4, 19, 0.92)';
    ctx.fillRect(x, y + tbH, sbW, h - tbH);
    ctx.strokeStyle = accent1;
    ctx.beginPath(); ctx.moveTo(x + sbW, y + tbH); ctx.lineTo(x + sbW, y + h); ctx.stroke();

    const navItems = ['+ New Chat', 'Workspaces', 'Automations', 'Capri Theme', 'Prescript Theme'];
    navItems.forEach((item, idx) => {
        const iy = y + tbH + 18 + idx * 34;
        const isAuto = item === 'Automations';
        if (idx === 0 || (sceneIdx === 2 && isAuto)) {
            drawRoundedRect(ctx, x + 10, iy - 16, sbW - 20, 26, 5);
            ctx.fillStyle = 'rgba(255, 30, 86, 0.22)';
            ctx.fill();
            ctx.strokeStyle = accent2;
            ctx.stroke();
        }
        ctx.fillStyle = (idx === 0 || (sceneIdx === 2 && isAuto)) ? accent2 : '#C89EB4';
        ctx.font = 'bold 11.5px Segoe UI, sans-serif';
        ctx.fillText(item, x + 20, iy + 1);
    });

    // Main Chat Area
    const chatX = x + sbW + 22;
    const chatW = w - sbW - 44;

    // User Message Bubble
    const uY = y + tbH + 22;
    drawRoundedRect(ctx, chatX + chatW * 0.2, uY, chatW * 0.8, 46, 9);
    ctx.fillStyle = flavor === 'default' ? '#27272A' : '#260618';
    ctx.fill();
    ctx.strokeStyle = accent1;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '12.5px Segoe UI, sans-serif';
    ctx.fillText('Make me a custom Cyberpunk: Edgerunners S2 Capri theme!', chatX + chatW * 0.2 + 14, uY + 28);

    // Agent Response Panel
    const aY = uY + 64;
    const isZapped = (sceneIdx === 4 && (sceneTime % 3.2 > 1.8 && sceneTime % 3.2 < 2.5));
    const glitchShift = isZapped ? (Math.random() - 0.5) * 14 : 0;

    drawRoundedRect(ctx, chatX + glitchShift, aY, chatW, 110, 8);
    ctx.fillStyle = flavor === 'default' ? '#1F1F23' : 'rgba(18, 6, 30, 0.94)';
    ctx.fill();
    ctx.strokeStyle = isZapped ? '#00E64D' : accent2;
    ctx.lineWidth = isZapped ? 3 : 1.5;
    ctx.stroke();

    ctx.fillStyle = accent2;
    ctx.font = 'bold 12px Consolas, monospace';
    ctx.fillText('[PROJECT CAPRICORN // LIVE INJECTION ACTIVE]', chatX + 16 + glitchShift, aY + 26);
    ctx.fillStyle = '#E8D5E0';
    ctx.font = '12px Segoe UI, sans-serif';
    ctx.fillText('✓ Transparent .bg-background & .sticky (Zero shadow box glitch)', chatX + 16 + glitchShift, aY + 52);
    ctx.fillText('✓ High-contrast Settings Modal & synced Automations button', chatX + 16 + glitchShift, aY + 74);
    ctx.fillText('✓ 60fps Capri Companion + Lightning Canvas + Ceiling Rift', chatX + 16 + glitchShift, aY + 96);

    // Bottom Composer Box
    const compY = y + h - 54;
    drawRoundedRect(ctx, chatX, compY, chatW, 38, 10);
    ctx.fillStyle = '#0C0417';
    ctx.fill();
    ctx.strokeStyle = accent1;
    ctx.lineWidth = 1.8;
    ctx.stroke();
    ctx.fillStyle = '#8E6D82';
    ctx.font = '12px Segoe UI, sans-serif';
    ctx.fillText('Ask Antigravity or right-click Capri for Neural Console...', chatX + 14, compY + 24);

    // Draw Interactive Capri Companion inside the preview window!
    if (flavor === 'capri' && capriCanvasSprite && sceneIdx !== 5) {
        const cw = 82;
        const ch = cw * (capriCanvasSprite.height / capriCanvasSprite.width);
        const walkCycle = Math.sin(globalTime * 2.2);
        const cx = chatX + chatW * 0.72 + walkCycle * 45;
        const cy = y + h - ch - 52 + Math.sin(globalTime * 5) * 4;

        // Holographic afterimages during pose
        if (sceneIdx === 4 || sceneIdx === 6) {
            ctx.save();
            ctx.globalAlpha = 0.35;
            ctx.drawImage(capriCanvasSprite, cx - 12, cy - 4, cw, ch);
            ctx.drawImage(capriCanvasSprite, cx + 12, cy + 4, cw, ch);
            ctx.restore();
        }

        ctx.save();
        ctx.shadowColor = '#00E64D';
        ctx.shadowBlur = 16;
        ctx.drawImage(capriCanvasSprite, cx, cy, cw, ch);
        ctx.restore();

        // Lightning strike from Capri to the Agent Response Card!
        if (isZapped) {
            drawLightning(ctx, cx + 30, cy + 40, chatX + chatW * 0.5, aY + 55, '#00E64D', 3.2, 26);
            drawLightning(ctx, cx + 30, cy + 40, chatX + chatW * 0.5, aY + 55, '#FF1E56', 2.2, 22);
        }

        // Speech Bubble or Right-Click Console showcase in Scene 4 (idx 4)
        if (sceneIdx === 4) {
            const menuX = cx - 155;
            const menuY = cy - 115;
            drawRoundedRect(ctx, menuX, menuY, 220, 102, 8);
            ctx.fillStyle = 'rgba(14, 4, 24, 0.97)';
            ctx.fill();
            ctx.strokeStyle = '#00E64D';
            ctx.lineWidth = 1.8;
            ctx.stroke();

            ctx.fillStyle = '#00E64D';
            ctx.font = 'bold 10.5px Consolas, monospace';
            ctx.fillText('⚡ CAPRI // NEURAL CONSOLE', menuX + 10, menuY + 18);

            const btns = ['[Stop Moving]', '[Stop Attack]', '[⚡ Zap Chat]', '[🙃 Top Pop-Out]'];
            btns.forEach((b, bi) => {
                const bx = menuX + 10 + (bi % 2) * 102;
                const by = menuY + 28 + Math.floor(bi / 2) * 24;
                drawRoundedRect(ctx, bx, by, 96, 20, 4);
                ctx.fillStyle = 'rgba(255, 30, 86, 0.25)';
                ctx.fill();
                ctx.fillStyle = '#FFF';
                ctx.font = '10px Consolas, monospace';
                ctx.fillText(b, bx + 6, by + 14);
            });
            ctx.fillStyle = '#00E64D';
            ctx.fillText('> "Hey choom! Let\\'s short-circuit this UI~"', menuX + 10, menuY + 90);
        }
    }

    // Scene 5 (idx 5): Upside-Down Ceiling Rift Pop-Out Showcase (0:00 - 0:06)
    if (sceneIdx === 5) {
        const popW = Math.min(280, chatW * 0.58);
        const popH = popW * 0.84;
        const popX = chatX + (chatW - popW) * 0.5;
        const dropProgress = Math.min(1, sceneTime / 0.55);
        const popY = y + tbH - (1 - dropProgress) * (popH + 40);

        // Glowing Top Rift Bar
        ctx.save();
        ctx.fillStyle = '#00E64D';
        ctx.shadowColor = '#FF1E56';
        ctx.shadowBlur = 24;
        ctx.fillRect(popX - 30, y + tbH - 3, popW + 60, 6);
        ctx.restore();

        // Video Portal Frame
        ctx.save();
        drawRoundedRect(ctx, popX, popY, popW, popH, 10);
        ctx.fillStyle = '#07030D';
        ctx.fill();
        ctx.strokeStyle = '#FF1E56';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.clip();

        if (popoutVideoEl && popoutVideoEl.readyState >= 2) {
            if (popoutVideoEl.currentTime >= 6.0) popoutVideoEl.currentTime = 0.0;
            ctx.drawImage(popoutVideoEl, popX, popY, popW, popH);
        } else if (capriCanvasSprite) {
            ctx.translate(popX + popW / 2, popY + popH / 2);
            ctx.scale(1, -1);
            ctx.drawImage(capriCanvasSprite, -60, -70, 120, 140);
        }
        ctx.restore();

        // Lightning arcs from top rift
        if (Math.random() < 0.45) {
            drawLightning(ctx, popX, y + tbH, popX + popW, y + tbH + 18, '#00E64D', 2.2, 16);
        }

        // Caption Banner
        const capY = popY + popH + 8;
        drawRoundedRect(ctx, popX - 20, capY, popW + 40, 30, 6);
        ctx.fillStyle = 'rgba(14, 4, 24, 0.96)';
        ctx.fill();
        ctx.strokeStyle = '#00E64D';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 11px Consolas, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('“ Hey now, don\\'t \\'her\\' me, buddy! Just call me... CAPRI! ”', popX + popW / 2, capY + 19);
        ctx.textAlign = 'left';
    }

    // Outer Border of Simulated Window
    ctx.restore();
    drawRoundedRect(ctx, x, y, w, h, 14);
    ctx.strokeStyle = accent1;
    ctx.lineWidth = 2.5;
    ctx.shadowColor = accent1;
    ctx.shadowBlur = 20;
    ctx.stroke();
    ctx.shadowBlur = 0;
}

// ============================================================================
// 7. MAIN 60FPS ANIMATION RENDER LOOP (SUPPORTS BOTH 16:9 YOUTUBE & 9:16 TIKTOK)
// ============================================================================
function renderFrame(now) {
    const dt = (now - lastFrameTime) / 1000;
    lastFrameTime = now;

    if (isPlaying) {
        elapsed += dt;
        if (elapsed >= TOTAL_DURATION) {
            if (isRecording && mediaRecorder && mediaRecorder.state !== 'inactive') {
                mediaRecorder.stop();
                isPlaying = false;
            } else {
                elapsed = elapsed % TOTAL_DURATION;
            }
        }
    }

    // Determine active scene
    let acc = 0;
    let currentSceneIdx = 0;
    let sceneTime = 0;
    for (let i = 0; i < SCENES.length; i++) {
        if (elapsed < acc + SCENES[i].duration || i === SCENES.length - 1) {
            currentSceneIdx = i;
            sceneTime = Math.max(0, elapsed - acc);
            break;
        }
        acc += SCENES[i].duration;
    }

    const scene = SCENES[currentSceneIdx];

    // Trigger synth whoosh on scene change
    if (currentSceneIdx !== lastSceneTriggered) {
        lastSceneTriggered = currentSceneIdx;
        if (isPlaying) playSceneTransitionWhoosh();
    }

    // Subtle background synth pulse every 0.5s while playing
    const beatIdx = Math.floor(elapsed * 2);
    if (isPlaying && beatIdx !== lastBeatIndex) {
        lastBeatIndex = beatIdx;
        const notes = [110, 130.81, 146.83, 164.81];
        playCyberSynth(notes[beatIdx % notes.length], 'triangle', 0.12, 0.025);
    }

    // Update timeline UI pills
    timeReadout.textContent = \`\${elapsed.toFixed(1).padStart(4, '0')}s / \${TOTAL_DURATION.toFixed(1)}s\`;
    const pillEls = pillsContainer.querySelectorAll('.scene-pill');
    pillEls.forEach((el, idx) => {
        el.classList.toggle('current', idx === currentSceneIdx);
        const progEl = document.getElementById('prog-' + idx);
        if (idx < currentSceneIdx) progEl.style.width = '100%';
        else if (idx > currentSceneIdx) progEl.style.width = '0%';
        else progEl.style.width = \`\${Math.min(100, (sceneTime / scene.duration) * 100)}%\`;
    });

    // Clear Stage Canvas
    const W = canvas.width;
    const H = canvas.height;
    const isVertical = aspectMode === '9:16';

    ctx.fillStyle = '#07030D';
    ctx.fillRect(0, 0, W, H);

    // Animated Cyber Grid Background
    ctx.strokeStyle = 'rgba(255, 30, 86, 0.07)';
    ctx.lineWidth = 1;
    const gridOffset = (elapsed * 28) % 60;
    for (let x = 0; x < W; x += 60) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = gridOffset; y < H; y += 60) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    // Ambient Radial Neon Glows
    const g1 = ctx.createRadialGradient(W * 0.18, H * 0.2, 10, W * 0.18, H * 0.2, W * 0.55);
    g1.addColorStop(0, 'rgba(255, 30, 86, 0.16)');
    g1.addColorStop(1, 'transparent');
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, W, H);

    const g2 = ctx.createRadialGradient(W * 0.82, H * 0.8, 10, W * 0.82, H * 0.8, W * 0.55);
    g2.addColorStop(0, 'rgba(0, 230, 77, 0.14)');
    g2.addColorStop(1, 'transparent');
    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, W, H);

    // Top Header Banner
    const padX = isVertical ? 56 : 76;
    const topY = isVertical ? 78 : 56;

    // Step Tag Pill
    drawRoundedRect(ctx, padX, topY, 290, 38, 6);
    ctx.fillStyle = 'rgba(255, 30, 86, 0.24)';
    ctx.fill();
    ctx.strokeStyle = '#00E64D';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#00E64D';
    ctx.font = 'bold 18px Consolas, monospace';
    ctx.fillText('⚡ ' + scene.tag, padX + 16, topY + 25);

    // Repo Watermark top-right
    ctx.fillStyle = '#C89EB4';
    ctx.font = 'bold 16px Consolas, monospace';
    ctx.textAlign = 'right';
    ctx.fillText('github.com/killgame1234/antigravity-themes-unofficial', W - padX, topY + 25);
    ctx.textAlign = 'left';

    // Headline with entrance slide animation
    const slideIn = Math.min(1, sceneTime / 0.35);
    const headY = topY + (isVertical ? 82 : 76);
    ctx.save();
    ctx.font = \`900 \${isVertical ? 40 : 44}px "Segoe UI", sans-serif\`;
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = '#FF1E56';
    ctx.shadowBlur = 18;
    ctx.fillText(scene.headline, padX + (1 - slideIn) * -40, headY, W - padX * 2);
    ctx.restore();

    // Subheadline
    ctx.fillStyle = '#00E64D';
    ctx.font = \`600 \${isVertical ? 22 : 23}px "Segoe UI", sans-serif\`;
    ctx.fillText(scene.subhead, padX, headY + 42, W - padX * 2);

    // Layout Split: Left/Top = Code & Step Breakdown | Right/Bottom = Live Simulated Antigravity Window
    let codeBoxX, codeBoxY, codeBoxW, codeBoxH;
    let simX, simY, simW, simH;

    if (!isVertical) {
        // 16:9 YouTube Widescreen Layout
        codeBoxX = padX;
        codeBoxY = headY + 74;
        codeBoxW = (W - padX * 2) * 0.47;
        codeBoxH = H - codeBoxY - 88;

        simX = codeBoxX + codeBoxW + 36;
        simY = codeBoxY;
        simW = (W - padX * 2) * 0.53 - 36;
        simH = codeBoxH;
    } else {
        // 9:16 TikTok / Shorts Vertical Layout
        codeBoxX = padX;
        codeBoxY = headY + 74;
        codeBoxW = W - padX * 2;
        codeBoxH = 620;

        simX = padX;
        simY = codeBoxY + codeBoxH + 36;
        simW = W - padX * 2;
        simH = H - simY - 110;
    }

    // Draw Left/Top Step & Code Panel
    drawRoundedRect(ctx, codeBoxX, codeBoxY, codeBoxW, codeBoxH, 12);
    ctx.fillStyle = 'rgba(14, 5, 25, 0.94)';
    ctx.fill();
    ctx.strokeStyle = '#FF1E56';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Left accent bar
    ctx.fillStyle = '#00E64D';
    ctx.fillRect(codeBoxX, codeBoxY + 12, 5, codeBoxH - 24);

    if (scene.bullets) {
        ctx.fillStyle = '#FF1E56';
        ctx.font = 'bold 22px Consolas, monospace';
        ctx.fillText('// WHY LIVE INJECTION ROCKS:', codeBoxX + 28, codeBoxY + 48);

        scene.bullets.forEach((b, i) => {
            const reveal = Math.max(0, Math.min(1, (sceneTime - i * 0.5) / 0.4));
            ctx.globalAlpha = reveal;
            const by = codeBoxY + 105 + i * 78;
            drawRoundedRect(ctx, codeBoxX + 28, by - 30, codeBoxW - 56, 56, 8);
            ctx.fillStyle = 'rgba(0, 230, 77, 0.1)';
            ctx.fill();
            ctx.strokeStyle = 'rgba(0, 230, 77, 0.45)';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 20px "Segoe UI", sans-serif';
            ctx.fillText('✓  ' + b, codeBoxX + 46, by + 5, codeBoxW - 90);
            ctx.globalAlpha = 1;
        });

        // Show large Capri sprite cameo inside Scene 1
        if (capriCanvasSprite) {
            const ch = codeBoxH * 0.42;
            const cw = ch * (capriCanvasSprite.width / capriCanvasSprite.height);
            ctx.save();
            ctx.shadowColor = '#FF1E56';
            ctx.shadowBlur = 24;
            ctx.drawImage(capriCanvasSprite, codeBoxX + codeBoxW - cw - 28, codeBoxY + codeBoxH - ch - 16, cw, ch);
            ctx.restore();
        }
    } else if (scene.codeLines) {
        // Terminal Header
        ctx.fillStyle = '#1B0830';
        drawRoundedRect(ctx, codeBoxX + 2, codeBoxY + 2, codeBoxW - 4, 44, 10);
        ctx.fill();
        ctx.fillStyle = '#00E64D';
        ctx.font = 'bold 17px Consolas, monospace';
        ctx.fillText('📄 ' + scene.codeTitle, codeBoxX + 24, codeBoxY + 30);

        // Typewriter Code Lines
        const lineCount = scene.codeLines.length;
        scene.codeLines.forEach((line, idx) => {
            const appearTime = idx * 0.28;
            if (sceneTime < appearTime) return;
            const charProgress = Math.min(1, (sceneTime - appearTime) / 0.45);
            const chars = Math.floor(line.length * charProgress);
            const text = line.slice(0, chars);

            const ly = codeBoxY + 82 + idx * (isVertical ? 48 : 44);
            if (line.trim().startsWith('/*') || line.trim().startsWith('//')) {
                ctx.fillStyle = '#00E64D';
            } else if (line.trim().startsWith('•')) {
                ctx.fillStyle = '#FDF2F6';
            } else {
                ctx.fillStyle = '#FF85A9';
            }
            ctx.font = \`bold \${isVertical ? 19 : 17.5}px Consolas, monospace\`;
            ctx.fillText(text, codeBoxX + 26, ly, codeBoxW - 48);
        });
    }

    // Draw Right/Bottom Live Simulated Antigravity Window
    drawSimulatedAntigravityWindow(ctx, simX, simY, simW, simH, currentSceneIdx, sceneTime, elapsed);

    // Bottom Global Progress Bar inside Canvas (for exported video)
    const barY = H - 24;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.fillRect(padX, barY, W - padX * 2, 8);
    const grad = ctx.createLinearGradient(padX, 0, W - padX, 0);
    grad.addColorStop(0, '#FF1E56');
    grad.addColorStop(1, '#00E64D');
    ctx.fillStyle = grad;
    ctx.fillRect(padX, barY, (W - padX * 2) * (elapsed / TOTAL_DURATION), 8);

    requestAnimationFrame(renderFrame);
}

requestAnimationFrame(renderFrame);
</script>
</body>
</html>`;

const outHtmlPath = path.join(__dirname, 'Antigravity_Theme_Guide_Animator.html');
fs.writeFileSync(outHtmlPath, htmlContent, 'utf8');
console.log('Generated:', outHtmlPath);

const batContent = `@echo off
start "" "%~dp0Antigravity_Theme_Guide_Animator.html"
`;
const outBatPath = path.join(__dirname, 'Open_Video_Guide_Studio.bat');
fs.writeFileSync(outBatPath, batContent, 'utf8');
console.log('Generated:', outBatPath);
