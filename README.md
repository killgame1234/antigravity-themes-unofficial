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
   - `Moonlit_Lotus_Skiff\Apply_Moonlit_Theme.bat`

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
- **Launcher**: [`Moonlit_Lotus_Skiff/Apply_Moonlit_Theme.bat`](./Moonlit_Lotus_Skiff/Apply_Moonlit_Theme.bat)
- **Features**:
  - **Palette**: Serene moonlit night sky, warm lantern gold, and lotus pink glassmorphism.
  - **Live Video Wallpaper & Drifting Lantern Petals**: Smooth looping background video (`moonlit_bg.mp4`) paired with an interactive `<canvas>` particle layer of glowing lotus petals and fireflies.

---

## 🛠️ Create Your Own Theme

Check out **[HOW_TO_CREATE_THEMES.md](./HOW_TO_CREATE_THEMES.md)** for:
- How `ELECTRON_RUN_AS_NODE=1` + Chrome DevTools Protocol (`DevToolsActivePort`) live injection works
- A copy-paste starter template (`apply_my_theme.js`)
- Complete Antigravity 2.0 CSS selector cheat sheet & common gotchas (`.bg-background` transparency, Settings modal contrast, `Automations` sidebar button selector, sticky header bleed)
- How to embed `.mp4` videos and transparent `.webp`/`.png` sprites
- Exact prompts you can give Antigravity AI to build and customize new themes for you
