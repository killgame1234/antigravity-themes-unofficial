# Antigravity 2.0 Unofficial Custom Themes (`antigravity-themes-unofficial`)

A collection of live-injected custom themes, animated `<canvas>`/video backgrounds, and interactive screen companions for **Google Antigravity 2.0 Desktop**, plus a complete step-by-step guide on how to create your own.

> 📖 **Want to build your own custom theme or interactive companion?**
> Read the full step-by-step tutorial: **[HOW_TO_CREATE_THEMES.md](./HOW_TO_CREATE_THEMES.md)**

---

## 🚀 Quick Start (How to Use)

1. Clone this repository anywhere on your Windows PC:
   ```bash
   git clone https://github.com/killgame1234/antigravity-themes-unofficial.git
   ```
2. Make sure **Google Antigravity 2.0 Desktop** is open.
3. Double-click the **`Apply_<Theme>_Theme.bat`** file inside any theme folder to inject it live (no restart or file patching required!):
   - `Capri\Apply_Capri_Theme.bat`
   - `Prescript\Apply_Prescript_Theme.bat`
   - `Eldritch_theme\Apply_Eldritch_Theme.bat`
   - `Moonlit_Lotus_Skiff\Apply_Moonlit_Lotus_Skiff_Theme.bat`
   - `Black_Shores_Shorekeeper\Apply_Black_Shores_Theme.bat`

*(Or run via PowerShell)*:
```powershell
$env:ELECTRON_RUN_AS_NODE="1"
& "$env:LOCALAPPDATA\Programs\antigravity\Antigravity.exe" ".\Capri\apply_capri_theme.js" | Out-String
```

---

## 🎨 Included Themes

### 1. Cyberpunk: Edgerunners Season 2 — Capri (`Project Capricorn`)
- **Folder**: [`Capri/`](./Capri)
- **Launcher**: [`Capri/Apply_Capri_Theme.bat`](./Capri/Apply_Capri_Theme.bat)
- **Features**:
  - **Palette**: Crimson-magenta (`#FF1E56`), toxic emerald-green (`#00E64D`), and void-violet (`#07030D`) matched directly to Capri's character design.
  - **Cyberpsychosis Hover Glitch**: Hovering buttons, links, pills, or cards triggers chromatic aberration glitch slices and live `<canvas>` lightning sparks.
  - **Interactive Capri Companion**:
    - Walks calmly around the outer perimeter of the window so she never blocks your center workspace.
    - Performs zero-G holographic afterimage poses and speaks characteristic dialogue when clicked.
    - Periodically fires green & crimson lightning bolts at chat bubbles, making them temporarily glitch out.
  - **Upside-Down Ceiling Rift Pop-Out (`0:00–0:06`)**:
    - Periodically opens a glowing rift along the top bar of Antigravity where Capri drops down upside-down (`350px × 300px` Studio Trigger angular portal).
  - **Right-Click Neural Command Console**:
    - **Right-click Capri** anytime to toggle movement (`Stop Moving` / `Resume Move`), toggle lightning attacks (`Stop Attack` / `Resume Attack`), trigger an immediate `⚡ Zap Chat`, trigger `🙃 Top Pop-Out`, or type commands/messages to have a little chat with her!

---

### 2. Project Moon — The Index & The Prescripts
- **Folder**: [`Prescript/`](./Prescript)
- **Launcher**: [`Prescript/Apply_Prescript_Theme.bat`](./Prescript/Apply_Prescript_Theme.bat)
- **Features**:
  - **Palette**: Abyssal obsidian-black OLED void (`#020508`) with glowing Prescript cyan (`#00E5FF`) and Index gold (`#D4AF37`).
  - **Strings of Fate Canvas**: 34 animated vertical cyan and gold fate threads with descending light pulses.
  - **Floating Index Hand Emblem**: Alpha-keyed centerpiece emblem with zero background box artifacts.
  - **2-Minute Prescript Decree Generator**: Automatically generates and typewrites a new canonical or procedural Index Prescript behind the emblem every 2 minutes.

---

### 3. Eldritch Void & Crimson Ocular Horror
- **Folder**: [`Eldritch_theme/`](./Eldritch_theme)
- **Launcher**: [`Eldritch_theme/Apply_Eldritch_Theme.bat`](./Eldritch_theme/Apply_Eldritch_Theme.bat)
- **Features**:
  - **Palette**: Pitch-black OLED abyssal void with crimson ocular horror glow (`#FF1E38`).
  - **Live Video Background & Ambient Eye Rifts**: Seamless looping video background (`eldritch_bg.mp4`) plus up to 3 random feathered ambient Eye Rifts that tear open at random angles, sizes, translucencies, and brightness in the background layer without blocking text.
  - **Cursor-Tracking Hover Eyes**: Hovering buttons, links, pills, or cards spawns small crimson eyes around the element's perimeter whose pupils track your mouse cursor in real time.
  - **Crimson Gradient & Selective Bleeding Text**: Animated crimson-ruby gradient typography with periodic selective crimson droplets dripping from random headings and bold text.
  - **Blinking Header Eye & Ocular Buttons**: Centered blinking eye GIF (`eldritch_eye.gif`) in the titlebar with a seamless bleeding blend, plus animated Eldritch Eye icons on the Stop and Archive Conversation buttons.

---

### 4. Moonlit Lotus Skiff
- **Folder**: [`Moonlit_Lotus_Skiff/`](./Moonlit_Lotus_Skiff)
- **Launcher**: [`Moonlit_Lotus_Skiff/Apply_Moonlit_Lotus_Skiff_Theme.bat`](./Moonlit_Lotus_Skiff/Apply_Moonlit_Lotus_Skiff_Theme.bat)
- **Features**:
  - **Palette**: Serene moonlit night sky, warm lantern gold, and lotus pink glassmorphism.
  - **Dual-Realm Video Background**: Automated cross-fade between Moonlit Lotus Skiff and Ancient Frost Tree (Iuno).
  - **Real-Life Astronomical Lunar Cycle**: Precise 29.53-day Blue Moon phase calendar HUD and top navigation icon.

---

### 5. The Black Shores & Shorekeeper (Wuthering Waves — Real Game Scenery & Tacet Sonata)
- **Folder**: [`Black_Shores_Shorekeeper/`](./Black_Shores_Shorekeeper)
- **Launcher**: [`Black_Shores_Shorekeeper/Apply_Black_Shores_Theme.bat`](./Black_Shores_Shorekeeper/Apply_Black_Shores_Theme.bat)
- **Features**:
  - **Dual Real Game Scenery Video Engine**:
    - **Scenery 1 (Archipelago Dawn)**: `black_shores_scenery_archipelago.mp4` — High-definition sunrise over the Black Shores archipelago with drifting petals across reflective water.
    - **Scenery 2 (Subterranean Cavern)**: `black_shores_scenery_cavern.mp4` — Deep Tethys subterranean core with bioluminescent flora and swimming celestial cetaceans/whales.
    - Automated 80s cross-fade transition or instant toggle via top bar button `[SCENERY: ARCHIPELAGO / CAVERN]`.
  - **Official Shorekeeper Artwork Right-Docking**:
    - High-resolution transparent character splash art docked on the right side of the screen with gentle vertical floating physics and starbloom.
    - Smart contrast: 92% opacity in New Conversation mode, smoothly fading to 35% opacity in active chat to ensure 100% reading clarity.
  - **Animated Interactive Chibi Screen Companion**:
    - Transparent animated GIF companion (`shorekeeper_chibi_companion.gif`) holding a glowing butterfly docked over the composer card.
    - Interactive responses: Clicking or hovering triggers harmonic crystal chimes, playful 6px bounce physics, stardust spark rings, and dialogue bubbles.
  - **Palette**: Deep sea of Tethys abyssal black (`#020611`), Quantum Tethys Cyan (`#00F0FF`), Shorekeeper Celestial Iris (`#818CF8`), and Asteria Bloom Lilac (`#C084FC`).
  - **3-Tier Sonoro Resonance Domain Shift (`window.__blackShoresState`)**: Dynamically shifts environment between Stage 1 (Deep Sea / Idle), Stage 2 (Constellation Nebula / In-Chat), and Stage 3 (Supernal Resonance / Agent Execution Shimmer).
  - **Living Canvas Engine (`#blackshores-canvas`)**:
    - **Gravitational Constellation Mesh**: Star nodes with dynamic distance triangulation that bend toward the cursor via gravitational lensing physics.
    - **Flapping Crystalline Stellar Butterflies**: Sinusoidal 3D wing physics shedding quantum stardust trails.
    - **Drifting Asteria Petals & Data Motes**: Translucent glowing florets swaying organically downwards.
    - **Interactive Soundwave Ripples**: Concentric frequency waves with hexagonal quantum data glimmers on click.
    - **Idle Resting Butterfly Companion**: Glides in and rests on the cursor tip after 2.5s pause, bursting into sparks upon movement.
  - **Native Web Audio API Tacet Resonance**: Zero external audio files; pure procedural crystal pentatonic harmonic chimes on composer typing and button interactions, with a top navigation bar toggle (`[RESONANCE: ON/OFF]`).
  - **Symmetrical Tethys Terminal HUD**: Symmetrically docked floating holographic Shorekeeper Constellation Crest above composer and live equalizer telemetry card below in New Conversation mode, fading cleanly in active chat.
  - **Custom App Navigation Icon & Windows Shortcut**: Official Shorekeeper avatar icon (`shorekeeper_avatar_icon.png`) with iridescent hover bloom and embedded `.ico` updating the Windows Taskbar/Start Menu shortcut.

---

## 🛠️ Create Your Own Theme

Check out **[HOW_TO_CREATE_THEMES.md](./HOW_TO_CREATE_THEMES.md)** for:
- How `ELECTRON_RUN_AS_NODE=1` + Chrome DevTools Protocol (`DevToolsActivePort`) live injection works
- A copy-paste starter template (`apply_my_theme.js`)
- Complete Antigravity 2.0 CSS selector cheat sheet & common gotchas (`.bg-background` transparency, Settings modal contrast, `Automations` sidebar button selector, sticky header bleed)
- How to embed `.mp4` videos and transparent `.webp`/`.png` sprites
- Exact prompts you can give Antigravity AI to build and customize new themes for you
