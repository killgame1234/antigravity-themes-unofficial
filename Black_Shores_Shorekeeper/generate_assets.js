const fs = require('fs');
const path = require('path');

const THEME_DIR = __dirname;
const SVG_PATH = path.join(THEME_DIR, 'shorekeeper_crest.svg');
const PNG_PATH = path.join(THEME_DIR, 'shorekeeper_emblem.png');
const ICO_PATH = path.join(THEME_DIR, 'shorekeeper.ico');

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <radialGradient id="abyssBg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#06122c" stop-opacity="0.95"/>
      <stop offset="70%" stop-color="#020611" stop-opacity="0.98"/>
      <stop offset="100%" stop-color="#010308" stop-opacity="1"/>
    </radialGradient>
    <linearGradient id="tethysCyanIris" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00f0ff" />
      <stop offset="40%" stop-color="#38bdf8" />
      <stop offset="70%" stop-color="#818cf8" />
      <stop offset="100%" stop-color="#c084fc" />
    </linearGradient>
    <linearGradient id="lilacStarlight" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="50%" stop-color="#c084fc" />
      <stop offset="100%" stop-color="#ffffff" />
    </linearGradient>
    <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="1" />
      <stop offset="25%" stop-color="#00f0ff" stop-opacity="0.85" />
      <stop offset="60%" stop-color="#818cf8" stop-opacity="0.4" />
      <stop offset="100%" stop-color="#020611" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="haloBloom" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#00f0ff" stop-opacity="0.35" />
      <stop offset="50%" stop-color="#818cf8" stop-opacity="0.15" />
      <stop offset="100%" stop-color="#020611" stop-opacity="0" />
    </radialGradient>
    <filter id="bloom" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="6" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- Ambient Resonance Halo -->
  <circle cx="256" cy="256" r="236" fill="url(#abyssBg)" stroke="url(#tethysCyanIris)" stroke-width="2" stroke-opacity="0.4"/>
  <circle cx="256" cy="256" r="210" fill="none" stroke="#00f0ff" stroke-width="1.5" stroke-dasharray="8 14" stroke-opacity="0.6"/>
  <circle cx="256" cy="256" r="185" fill="none" stroke="#818cf8" stroke-width="1" stroke-dasharray="2 8" stroke-opacity="0.5"/>
  <circle cx="256" cy="256" r="248" fill="url(#haloBloom)"/>

  <!-- Orbital Navigation Ring Markers -->
  <g stroke="#00f0ff" stroke-opacity="0.6" stroke-width="1.5">
    <line x1="256" y1="12" x2="256" y2="28" />
    <line x1="256" y1="484" x2="256" y2="500" />
    <line x1="12" y1="256" x2="28" y2="256" />
    <line x1="484" y1="256" x2="500" y2="256" />
    <!-- Diagonal Ticks -->
    <line x1="83" y1="83" x2="95" y2="95" stroke="#c084fc" stroke-opacity="0.5"/>
    <line x1="429" y1="83" x2="417" y2="95" stroke="#c084fc" stroke-opacity="0.5"/>
    <line x1="83" y1="429" x2="95" y2="417" stroke="#c084fc" stroke-opacity="0.5"/>
    <line x1="429" y1="429" x2="417" y2="417" stroke="#c084fc" stroke-opacity="0.5"/>
  </g>

  <!-- Constellation Nodes & Lensing Geometry -->
  <g stroke="#38bdf8" stroke-opacity="0.3" stroke-width="0.75" fill="none">
    <polygon points="256,76 390,210 390,302 256,436 122,302 122,210"/>
    <circle cx="256" cy="76" r="3.5" fill="#00f0ff" stroke="#ffffff" stroke-width="1"/>
    <circle cx="390" cy="210" r="3" fill="#818cf8" stroke="#ffffff" stroke-width="0.8"/>
    <circle cx="390" cy="302" r="3" fill="#c084fc" stroke="#ffffff" stroke-width="0.8"/>
    <circle cx="256" cy="436" r="3.5" fill="#00f0ff" stroke="#ffffff" stroke-width="1"/>
    <circle cx="122" cy="302" r="3" fill="#c084fc" stroke="#ffffff" stroke-width="0.8"/>
    <circle cx="122" cy="210" r="3" fill="#818cf8" stroke="#ffffff" stroke-width="0.8"/>
  </g>

  <!-- Shorekeeper Stellar Butterfly Wings (Masterwork Symmetry) -->
  <g filter="url(#bloom)">
    <!-- Upper Wings (Left & Right) -->
    <!-- Left Upper Wing Outer Facet -->
    <path d="M 256,238 C 220,180 150,110 82,142 C 60,154 52,185 70,218 C 96,264 165,274 246,260 Z" 
          fill="url(#tethysCyanIris)" fill-opacity="0.45" stroke="#00f0ff" stroke-width="1.8"/>
    <!-- Left Upper Wing Inner Crystalline Lattice -->
    <path d="M 256,238 C 230,195 178,145 118,162 C 100,168 96,192 112,216 C 138,252 195,258 252,252 Z" 
          fill="url(#lilacStarlight)" fill-opacity="0.35" stroke="#ffffff" stroke-width="1" stroke-opacity="0.8"/>
    <path d="M 256,238 L 138,162 M 256,244 L 112,216 M 256,250 L 165,274" stroke="#ffffff" stroke-opacity="0.4" stroke-width="0.8"/>

    <!-- Right Upper Wing Outer Facet -->
    <path d="M 256,238 C 292,180 362,110 430,142 C 452,154 460,185 442,218 C 416,264 347,274 266,260 Z" 
          fill="url(#tethysCyanIris)" fill-opacity="0.45" stroke="#00f0ff" stroke-width="1.8"/>
    <!-- Right Upper Wing Inner Crystalline Lattice -->
    <path d="M 256,238 C 282,195 334,145 394,162 C 412,168 416,192 400,216 C 374,252 317,258 260,252 Z" 
          fill="url(#lilacStarlight)" fill-opacity="0.35" stroke="#ffffff" stroke-width="1" stroke-opacity="0.8"/>
    <path d="M 256,238 L 374,162 M 256,244 L 400,216 M 256,250 L 347,274" stroke="#ffffff" stroke-opacity="0.4" stroke-width="0.8"/>

    <!-- Lower Wings / Swallowtail Ribbons (Left & Right) -->
    <!-- Left Lower Wing -->
    <path d="M 252,266 C 190,285 125,320 108,375 C 98,406 122,416 142,398 C 174,370 216,334 250,288 Z" 
          fill="url(#tethysCyanIris)" fill-opacity="0.5" stroke="#818cf8" stroke-width="1.6"/>
    <!-- Left Swallowtail Filament -->
    <path d="M 124,395 C 108,422 92,448 76,462 C 72,465 68,460 72,454 C 84,435 106,398 122,374" 
          stroke="#00f0ff" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    <circle cx="72" cy="460" r="2.5" fill="#ffffff"/>

    <!-- Right Lower Wing -->
    <path d="M 260,266 C 322,285 387,320 404,375 C 414,406 390,416 370,398 C 338,370 296,334 262,288 Z" 
          fill="url(#tethysCyanIris)" fill-opacity="0.5" stroke="#818cf8" stroke-width="1.6"/>
    <!-- Right Swallowtail Filament -->
    <path d="M 388,395 C 404,422 420,448 436,462 C 440,465 444,460 440,454 C 428,435 406,398 390,374" 
          stroke="#00f0ff" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    <circle cx="440" cy="460" r="2.5" fill="#ffffff"/>

    <!-- Shorekeeper Antennae with Radiant Stars -->
    <path d="M 254,228 C 248,190 228,155 196,134 C 188,129 184,136 190,142 C 218,168 234,196 242,228" 
          stroke="#00f0ff" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    <circle cx="192" cy="132" r="3.5" fill="#ffffff" stroke="#00f0ff" stroke-width="1.5"/>

    <path d="M 258,228 C 264,190 284,155 316,134 C 324,129 328,136 322,142 C 294,168 278,196 270,228" 
          stroke="#00f0ff" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    <circle cx="320" cy="132" r="3.5" fill="#ffffff" stroke="#00f0ff" stroke-width="1.5"/>

    <!-- Central Body & Tethys Core Diamond -->
    <path d="M 256,218 L 262,252 L 256,298 L 250,252 Z" fill="#ffffff" stroke="#818cf8" stroke-width="1.2"/>
    <ellipse cx="256" cy="256" rx="30" ry="30" fill="url(#coreGlow)"/>
    <!-- Four-Pointed Radiant Core Flare -->
    <path d="M 256,220 L 260,252 L 292,256 L 260,260 L 256,292 L 252,260 L 220,256 L 252,252 Z" 
          fill="#ffffff" stroke="#00f0ff" stroke-width="1"/>
  </g>

  <!-- Ambient Asteria Florets & Data Runes -->
  <g fill="#00f0ff" opacity="0.8">
    <circle cx="210" cy="190" r="1.8" />
    <circle cx="302" cy="190" r="1.8" />
    <circle cx="170" cy="235" r="1.5" />
    <circle cx="342" cy="235" r="1.5" />
    <circle cx="160" cy="330" r="2" fill="#c084fc"/>
    <circle cx="352" cy="330" r="2" fill="#c084fc"/>
  </g>
</svg>`;

fs.writeFileSync(SVG_PATH, svgContent, 'utf8');
console.log('[+] Saved shorekeeper_crest.svg');

// Now render to PNG and generate ICO using CDP on port 51231
async function generatePngAndIco() {
    const appData = process.env.APPDATA || 'C:\\Users\\ngole\\AppData\\Roaming';
    const portFile = path.join(appData, 'Antigravity', 'DevToolsActivePort');
    let port = 51231;
    if (fs.existsSync(portFile)) {
        const lines = fs.readFileSync(portFile, 'utf8').trim().split(/\r?\n/);
        if (lines[0]) port = parseInt(lines[0], 10);
    }

    const listRes = await fetch(`http://127.0.0.1:${port}/json/list`);
    const targets = await listRes.json();
    const page = targets.find(t => t.type === 'page');
    if (!page) throw new Error('No page found');

    const ws = new WebSocket(page.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
        ws.onopen = resolve;
        ws.onerror = reject;
    });

    const svgBase64 = Buffer.from(svgContent).toString('base64');
    const expr = `(async () => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = 256;
                canvas.height = 256;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, 256, 256);
                resolve(canvas.toDataURL('image/png').split(',')[1]);
            };
            img.onerror = (e) => reject(new Error('Image load failed'));
            img.src = 'data:image/svg+xml;base64,${svgBase64}';
        });
    })()`;

    const pngBase64 = await new Promise((resolve, reject) => {
        ws.onmessage = (evt) => {
            const data = JSON.parse(evt.data);
            if (data.id === 101) {
                if (data.result?.exceptionDetails) {
                    reject(new Error(JSON.stringify(data.result.exceptionDetails)));
                } else {
                    resolve(data.result.result.value);
                }
            }
        };
        ws.send(JSON.stringify({
            id: 101,
            method: 'Runtime.evaluate',
            params: {
                expression: expr,
                awaitPromise: true,
                returnByValue: true
            }
        }));
    });

    ws.close();

    const pngBuffer = Buffer.from(pngBase64, 'base64');
    fs.writeFileSync(PNG_PATH, pngBuffer);
    console.log('[+] Saved shorekeeper_emblem.png (' + pngBuffer.length + ' bytes)');

    // Build 256x256 ICO file containing the PNG buffer
    const icoHeader = Buffer.alloc(6);
    icoHeader.writeUInt16LE(0, 0); // Reserved
    icoHeader.writeUInt16LE(1, 2); // Type 1 = ICO
    icoHeader.writeUInt16LE(1, 4); // 1 Image

    const icoDir = Buffer.alloc(16);
    icoDir.writeUInt8(0, 0); // 256 width = 0
    icoDir.writeUInt8(0, 1); // 256 height = 0
    icoDir.writeUInt8(0, 2); // Colors (0 = no palette)
    icoDir.writeUInt8(0, 3); // Reserved
    icoDir.writeUInt16LE(1, 4); // Color planes
    icoDir.writeUInt16LE(32, 6); // Bits per pixel
    icoDir.writeUInt32LE(pngBuffer.length, 8); // Size of image
    icoDir.writeUInt32LE(22, 12); // Offset = 6 + 16 = 22

    const icoBuffer = Buffer.concat([icoHeader, icoDir, pngBuffer]);
    fs.writeFileSync(ICO_PATH, icoBuffer);
    console.log('[+] Saved shorekeeper.ico (' + icoBuffer.length + ' bytes)');
}

generatePngAndIco().catch(err => {
    console.error('[-] Asset generation error:', err);
    process.exit(1);
});
