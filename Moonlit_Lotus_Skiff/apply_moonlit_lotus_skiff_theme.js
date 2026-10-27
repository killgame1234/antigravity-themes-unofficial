const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const THEME_DIR = __dirname;
const LOCAL_VIDEO1_PATH = path.join(THEME_DIR, 'moonlit_lotus_skiff_bg.mp4');
const FALLBACK_VIDEO1_PATH = 'C:\\Users\\ngole\\Downloads\\m2-res_1080p.mp4';
const VIDEO1_PATH = fs.existsSync(LOCAL_VIDEO1_PATH) ? LOCAL_VIDEO1_PATH : FALLBACK_VIDEO1_PATH;

const LOCAL_VIDEO2_PATH = path.join(THEME_DIR, 'iuno_ancient_tree_bg.mp4');
const FALLBACK_VIDEO2_PATH = 'C:\\Users\\ngole\\Downloads\\iuno-sleeping-in-the-ancient-tree-wuthering-waves-moewalls-com.mp4';
const VIDEO2_PATH = fs.existsSync(LOCAL_VIDEO2_PATH) ? LOCAL_VIDEO2_PATH : FALLBACK_VIDEO2_PATH;

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
        transition: background-color 1.8s ease-in-out !important;
    }

    /* Dual Video Backgrounds with 1.8s Cross-Fade */
    #moonlit-bg-video-1, #moonlit-bg-video-2 {
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

    #moonlit-bg-video-1 {
        opacity: 0.72 !important;
    }

    #moonlit-bg-video-2 {
        opacity: 0 !important;
    }

    body.realm-skiff #moonlit-bg-video-1 {
        opacity: 0.72 !important;
    }
    body.realm-skiff #moonlit-bg-video-2 {
        opacity: 0 !important;
    }

    body.realm-tree #moonlit-bg-video-1 {
        opacity: 0 !important;
    }
    body.realm-tree #moonlit-bg-video-2 {
        opacity: 0.72 !important;
    }

    #moonlit-vignette-overlay {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        z-index: 0 !important;
        pointer-events: none !important;
        transition: background 1.8s ease-in-out !important;
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
        transition: opacity 0.3s ease, left 0.4s cubic-bezier(0.16, 1, 0.3, 1), top 0.4s cubic-bezier(0.16, 1, 0.3, 1), color 1.2s ease !important;
    }

    /* Time & Date Moon Phase Calendar Card */
    #moonlit-calendar-card {
        position: fixed !important;
        z-index: 2 !important;
        pointer-events: none !important;
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        justify-content: center !important;
        background: rgba(6, 12, 24, 0.88) !important;
        border: 1px solid rgba(56, 189, 248, 0.35) !important;
        border-radius: 14px !important;
        backdrop-filter: blur(18px) saturate(140%) !important;
        padding: 9px 22px !important;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.85), 0 0 18px rgba(56, 189, 248, 0.22) !important;
        transition: opacity 0.35s ease, left 0.4s cubic-bezier(0.16, 1, 0.3, 1), top 0.4s cubic-bezier(0.16, 1, 0.3, 1), background 1.2s ease, border-color 1.2s ease !important;
        font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace !important;
    }

    .moonlit-cal-quarters-row {
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        gap: 20px !important;
    }

    .moonlit-cal-item {
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        gap: 3px !important;
        opacity: 0.62 !important;
        transition: all 0.2s ease !important;
    }

    .moonlit-cal-item.active {
        opacity: 1 !important;
        transform: scale(1.08) !important;
    }

    .moonlit-cal-item.active svg {
        filter: drop-shadow(0 0 10px #38bdf8) drop-shadow(0 0 4px #bae6fd) !important;
    }

    .moonlit-cal-name {
        font-size: 10px !important;
        letter-spacing: 0.08em !important;
        color: #94a3b8 !important;
        text-transform: uppercase !important;
        font-weight: 500 !important;
    }

    .moonlit-cal-item.active .moonlit-cal-name {
        color: #7dd3fc !important;
        font-weight: 700 !important;
    }

    .moonlit-cal-date {
        font-size: 11px !important;
        color: #cbd5e1 !important;
        font-weight: 500 !important;
    }

    .moonlit-cal-item.active .moonlit-cal-date {
        color: #ffffff !important;
        text-shadow: 0 0 8px rgba(56, 189, 248, 0.85) !important;
    }

    .moonlit-cal-telemetry {
        font-size: 11px !important;
        color: rgba(125, 211, 252, 0.95) !important;
        letter-spacing: 0.06em !important;
        margin-top: 7px !important;
        text-align: center !important;
        white-space: nowrap !important;
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
        transition: background-color 1.2s ease !important;
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
       CHAT BUBBLES: USER & ASSISTANT (DEFAULT / REALM SKIFF)
       ========================================================================== */
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
       REALM 2: ANCIENT FROST TREE (IUNO) THEMATIC OVERRIDES
       ========================================================================== */
    body.realm-tree {
        --cyan-glow: #22d3ee;
        --cyan-bloom: #67e8f9;
        --lantern-gold: #f59e0b;
        --deep-twilight: #030b18;
        background-color: #030b18 !important;
    }

    body.realm-tree #moonlit-vignette-overlay {
        background:
            radial-gradient(circle at 65% 55%, rgba(3, 11, 24, 0.12) 0%, rgba(3, 11, 24, 0.52) 60%, rgba(2, 8, 18, 0.95) 100%),
            linear-gradient(180deg, rgba(3, 11, 26, 0.82) 0%, transparent 16%, transparent 82%, rgba(2, 8, 18, 0.96) 100%) !important;
    }

    body.realm-tree [class*="group/user-input-step"] .bg-card-border {
        background: linear-gradient(135deg, #22d3ee 0%, #0891b2 50%, #f59e0b 100%) !important;
        box-shadow:
            0 0 24px rgba(34, 211, 238, 0.42),
            0 4px 22px rgba(0, 0, 0, 0.85) !important;
    }

    body.realm-tree [class*="group/user-input-step"] .bg-card {
        background: linear-gradient(135deg, rgba(6, 22, 38, 0.94) 0%, rgba(3, 11, 24, 0.98) 100%) !important;
        box-shadow: inset 0 0 18px rgba(34, 211, 238, 0.16) !important;
    }

    body.realm-tree .gap-y-3 > .flex.items-start:not(:has([class*="group/user-input-step"])) > .flex-col {
        background: linear-gradient(160deg, rgba(4, 16, 30, 0.92) 0%, rgba(2, 10, 20, 0.97) 100%) !important;
        border: 1px solid rgba(34, 211, 238, 0.35) !important;
        box-shadow:
            0 8px 30px rgba(0, 0, 0, 0.9),
            0 0 18px rgba(34, 211, 238, 0.18),
            inset 0 1px 0 rgba(245, 158, 11, 0.35) !important;
    }

    body.realm-tree .gap-y-3 > .flex.items-start:not(:has([class*="group/user-input-step"])) > .flex-col:hover {
        border-color: rgba(34, 211, 238, 0.6) !important;
        box-shadow:
            0 12px 36px rgba(0, 0, 0, 0.94),
            0 0 24px rgba(34, 211, 238, 0.3),
            inset 0 1px 0 rgba(245, 158, 11, 0.6) !important;
    }

    body.realm-tree .rounded-2xl.bg-card-border {
        background: linear-gradient(90deg, #22d3ee 0%, #a7f3d0 50%, #f59e0b 100%) !important;
        box-shadow:
            0 0 22px rgba(34, 211, 238, 0.35),
            0 8px 30px rgba(0, 0, 0, 0.9) !important;
    }

    body.realm-tree .rounded-2xl.bg-card-border:focus-within {
        box-shadow:
            0 0 34px rgba(34, 211, 238, 0.6),
            0 0 16px rgba(245, 158, 11, 0.45),
            0 10px 40px rgba(0, 0, 0, 0.94) !important;
    }

    body.realm-tree .rounded-2xl.bg-card-border > .bg-card {
        background: rgba(4, 16, 30, 0.96) !important;
        box-shadow: inset 0 0 18px rgba(34, 211, 238, 0.12) !important;
    }

    body.realm-tree button[data-tooltip-id="input-send-button-send-tooltip"] {
        background: linear-gradient(135deg, #22d3ee 0%, #0891b2 100%) !important;
        box-shadow: 0 0 16px rgba(34, 211, 238, 0.6) !important;
    }

    body.realm-tree button[data-tooltip-id="input-send-button-send-tooltip"]:hover {
        box-shadow: 0 0 24px rgba(34, 211, 238, 0.9) !important;
    }

    body.realm-tree #moonlit-calendar-card {
        background: rgba(3, 14, 28, 0.9) !important;
        border: 1px solid rgba(34, 211, 238, 0.4) !important;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.9), 0 0 20px rgba(34, 211, 238, 0.25) !important;
    }

    body.realm-tree .moonlit-cal-telemetry {
        color: rgba(103, 232, 249, 0.95) !important;
    }

    body.realm-tree #moonlit-poem-box {
        color: rgba(167, 243, 208, 0.95) !important;
        text-shadow: 0 0 12px rgba(34, 211, 238, 0.8), 0 0 22px rgba(245, 158, 11, 0.4) !important;
    }

    body.realm-tree .bg-sidebar {
        background-color: rgba(3, 11, 22, 0.8) !important;
    }

    body.realm-tree .bg-sidebar-secondary,
    body.realm-tree aside a:hover,
    body.realm-tree button[data-testid='automations-button']:hover {
        background: linear-gradient(90deg, rgba(34, 211, 238, 0.2) 0%, rgba(10, 32, 54, 0.35) 100%) !important;
        border: 1px solid rgba(34, 211, 238, 0.5) !important;
        box-shadow: 0 0 18px rgba(34, 211, 238, 0.3), inset 0 0 10px rgba(34, 211, 238, 0.12) !important;
    }

    /* ==========================================================================
       SCOPED HOVER & SHIMMER
       ========================================================================== */
    .moonlit-hover-active {
        color: #7dd3fc !important;
        text-shadow: 0 0 10px rgba(56, 189, 248, 0.85), 0 0 18px rgba(251, 191, 36, 0.45) !important;
        transition: color 0.15s ease, text-shadow 0.15s ease !important;
    }

    body.realm-tree .moonlit-hover-active {
        color: #67e8f9 !important;
        text-shadow: 0 0 10px rgba(34, 211, 238, 0.9), 0 0 18px rgba(245, 158, 11, 0.5) !important;
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
    if (!fs.existsSync(VIDEO1_PATH)) {
        console.error('Video 1 file not found at:', VIDEO1_PATH);
        process.exit(1);
    }

    const video1Buffer = fs.readFileSync(VIDEO1_PATH);
    const video1Base64 = video1Buffer.toString('base64');
    console.log('[*] Loaded Video 1 (Moonlit Lotus Skiff) bytes:', video1Buffer.length);

    let video2Base64 = '';
    if (fs.existsSync(VIDEO2_PATH)) {
        const video2Buffer = fs.readFileSync(VIDEO2_PATH);
        video2Base64 = video2Buffer.toString('base64');
        console.log('[*] Loaded Video 2 (Iuno Ancient Tree) bytes:', video2Buffer.length);
    } else {
        console.warn('[-] Video 2 file not found at:', VIDEO2_PATH);
    }

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
        await injectIntoPage(page.webSocketDebuggerUrl, video1Base64, video2Base64, emblemBase64);
    }
    console.log('[+] Moonlit Lotus Skiff Theme (Dual-Realm) successfully injected!');
}

function injectIntoPage(wsUrl, video1Base64, video2Base64, emblemBase64) {
    return new Promise((resolve, reject) => {
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
            const injectedCode = `(async function() {
                // =========================================================================
                // 0. CLEANUP PREVIOUS THEME TIMERS, LISTENERS, AND GLOBAL STATE
                // =========================================================================
                if (window.__moonlitState) {
                    try { if (window.__moonlitState.watchdog) clearInterval(window.__moonlitState.watchdog); } catch(e){}
                    try { if (window.__moonlitState.rotationInterval) clearInterval(window.__moonlitState.rotationInterval); } catch(e){}
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

                // Clean up non-Moonlit theme elements and legacy single video
                [
                    'moonlit-bg-video',
                    'eldritch-hover-eye-popup', 'eldritch-ambient-rifts-canvas', 'eldritch-bg-video',
                    'eldritch-vignette-overlay', 'eldritch-rift-header',
                    'prescript-fate-canvas', 'prescript-hand-bg', 'prescript-quote-box',
                    'prescript-vignette-overlay', 'prescript-header-insignia',
                    'capri-companion-root', 'capri-lightning-canvas', 'capri-top-popout'
                ].forEach(id => {
                    const el = document.getElementById(id);
                    if (el) el.remove();
                });

                // Single global state object
                const state = {
                    animFrame: null,
                    watchdog: null,
                    rotationInterval: null,
                    poemInterval: null,
                    poemTimer: null,
                    observer: null,
                    observerDebounce: null,
                    cleanupListeners: null,
                    activeTargetContainer: null,
                    activeHoverLeaf: null,
                    lastFrameTime: performance.now(),
                    lastLayoutCheck: 0,
                    currentRealm: 'skiff', // 'skiff' (Lotus River) | 'tree' (Ancient Frost Tree)
                    lastRealmSwitchTime: performance.now(),
                    // Realm 1: Skiff particles
                    butterflies: [],
                    petals: [],
                    embers: [],
                    // Realm 2: Tree particles
                    crystalSpores: [],
                    frostStars: [],
                    dreamEmbers: [],
                    // Dynamic interactive events
                    ripples: [],
                    sparks: []
                };
                window.__moonlitState = state;

                // =========================================================================
                // 1. DUAL VIDEO WALLPAPERS & BLOBS (REUSED IF ALREADY ACTIVE)
                // =========================================================================
                function getOrCreateVideo(id, base64) {
                    let vid = document.getElementById(id);
                    if (!vid || !vid.src) {
                        if (!vid) {
                            vid = document.createElement('video');
                            vid.id = id;
                            document.body.prepend(vid);
                        }
                        if (base64) {
                            const binStr = atob(base64);
                            const len = binStr.length;
                            const bytes = new Uint8Array(len);
                            for (let i = 0; i < len; i++) {
                                bytes[i] = binStr.charCodeAt(i);
                            }
                            const blob = new Blob([bytes], { type: 'video/mp4' });
                            const blobUrl = URL.createObjectURL(blob);
                            vid.dataset.oldBlobUrl = blobUrl;
                            vid.src = blobUrl;
                        }
                        vid.muted = true;
                        vid.defaultMuted = true;
                        vid.autoplay = true;
                        vid.loop = true;
                        vid.playsInline = true;
                        vid.setAttribute('muted', '');
                        vid.setAttribute('autoplay', '');
                        vid.setAttribute('loop', '');
                        vid.setAttribute('playsinline', '');
                        vid.oncanplay = () => {
                            vid.muted = true;
                            vid.play().catch(() => {});
                        };
                        vid.play().catch(() => {});
                    }
                    return vid;
                }

                let video1 = getOrCreateVideo('moonlit-bg-video-1', "${video1Base64}");
                let video2 = getOrCreateVideo('moonlit-bg-video-2', "${video2Base64}");

                // Realm Switch Function
                function switchRealm(newRealm) {
                    if (state.currentRealm === newRealm) return;
                    state.currentRealm = newRealm;
                    state.lastRealmSwitchTime = performance.now();

                    if (newRealm === 'skiff') {
                        document.body.classList.remove('realm-tree');
                        document.body.classList.add('realm-skiff');
                    } else {
                        document.body.classList.remove('realm-skiff');
                        document.body.classList.add('realm-tree');
                    }
                    cyclePoem(true);
                }

                // Initial realm setup
                document.body.classList.remove('realm-tree');
                document.body.classList.add('realm-skiff');

                // Automated Rotational Dual-Video Cross-Fade (Every 80 seconds)
                state.rotationInterval = setInterval(() => {
                    const nextRealm = state.currentRealm === 'skiff' ? 'tree' : 'skiff';
                    switchRealm(nextRealm);
                }, 80000);

                // Expose manual switch hook for dev/testing
                window.__moonlitSwitchRealm = switchRealm;

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
                // 3. REAL-LIFE TIME & DATE ASTRONOMICAL BLUE MOON ENGINE
                // =========================================================================
                function getLunarCalendar(date = new Date()) {
                    const synodicMonth = 29.53058867 * 24 * 60 * 60 * 1000;
                    const refNewMoon = new Date(Date.UTC(2024, 0, 11, 11, 57, 0)).getTime();
                    const now = date.getTime();
                    
                    const totalCycles = (now - refNewMoon) / synodicMonth;
                    const currentCycleIndex = Math.floor(totalCycles);
                    const currentPhase = totalCycles - currentCycleIndex;
                    
                    const cycleStart = refNewMoon + currentCycleIndex * synodicMonth;
                    const phases = [
                        { name: 'New Moon', fraction: 0.0, time: new Date(cycleStart) },
                        { name: 'First Quarter', fraction: 0.25, time: new Date(cycleStart + 0.25 * synodicMonth) },
                        { name: 'Full Moon', fraction: 0.50, time: new Date(cycleStart + 0.50 * synodicMonth) },
                        { name: 'Third Quarter', fraction: 0.75, time: new Date(cycleStart + 0.75 * synodicMonth) }
                    ];
                    
                    const illumination = Math.round(0.5 * (1 - Math.cos(currentPhase * 2 * Math.PI)) * 100);
                    const moonAgeDays = (currentPhase * 29.53058867).toFixed(1);
                    
                    let currentPhaseName = '';
                    if (currentPhase < 0.025 || currentPhase > 0.975) currentPhaseName = 'New Moon';
                    else if (currentPhase < 0.22) currentPhaseName = 'Waxing Crescent';
                    else if (currentPhase < 0.28) currentPhaseName = 'First Quarter';
                    else if (currentPhase < 0.47) currentPhaseName = 'Waxing Gibbous';
                    else if (currentPhase < 0.53) currentPhaseName = 'Full Moon';
                    else if (currentPhase < 0.72) currentPhaseName = 'Waning Gibbous';
                    else if (currentPhase < 0.78) currentPhaseName = 'Third Quarter';
                    else currentPhaseName = 'Waning Crescent';

                    let activeQuarterIdx = 0;
                    if (currentPhase >= 0.125 && currentPhase < 0.375) activeQuarterIdx = 1;
                    else if (currentPhase >= 0.375 && currentPhase < 0.625) activeQuarterIdx = 2;
                    else if (currentPhase >= 0.625 && currentPhase < 0.875) activeQuarterIdx = 3;

                    const nextPhases = [
                        ...phases,
                        { name: 'New Moon', fraction: 1.0, time: new Date(cycleStart + synodicMonth) }
                    ];
                    const upcoming = nextPhases.find(p => p.time.getTime() > now) || nextPhases[4];
                    const diffDays = Math.max(0.1, (upcoming.time.getTime() - now) / (1000 * 60 * 60 * 24)).toFixed(1);

                    return {
                        currentPhase,
                        currentPhaseName,
                        illumination,
                        moonAgeDays,
                        activeQuarterIdx,
                        upcoming: {
                            name: upcoming.name,
                            date: upcoming.time.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                            diffDays
                        },
                        quarters: phases.map((p, idx) => ({
                            name: p.name,
                            fraction: p.fraction,
                            dateStr: p.time.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                            isActive: idx === activeQuarterIdx
                        }))
                    };
                }

                function generateTadMoonSvg(phase, size = 32) {
                    const p = ((phase % 1.0) + 1.0) % 1.0;
                    const isWaxing = p <= 0.5;
                    const cosP = Math.cos(p * 2 * Math.PI);
                    const r = size * 0.40;
                    const cx = size / 2;
                    const cy = size / 2;
                    const rx = Math.max(0.1, r * Math.abs(cosP));

                    let litPath = '';
                    if (isWaxing) {
                        if (cosP >= 0) {
                            litPath = 'M ' + cx + ' ' + (cy - r) + ' A ' + r + ' ' + r + ' 0 0 1 ' + cx + ' ' + (cy + r) + ' A ' + rx + ' ' + r + ' 0 0 1 ' + cx + ' ' + (cy - r) + ' Z';
                        } else {
                            litPath = 'M ' + cx + ' ' + (cy - r) + ' A ' + r + ' ' + r + ' 0 0 1 ' + cx + ' ' + (cy + r) + ' A ' + rx + ' ' + r + ' 0 0 0 ' + cx + ' ' + (cy - r) + ' Z';
                        }
                    } else {
                        if (cosP >= 0) {
                            litPath = 'M ' + cx + ' ' + (cy + r) + ' A ' + r + ' ' + r + ' 0 0 1 ' + cx + ' ' + (cy - r) + ' A ' + rx + ' ' + r + ' 0 0 1 ' + cx + ' ' + (cy + r) + ' Z';
                        } else {
                            litPath = 'M ' + cx + ' ' + (cy + r) + ' A ' + r + ' ' + r + ' 0 0 1 ' + cx + ' ' + (cy - r) + ' A ' + rx + ' ' + r + ' 0 0 0 ' + cx + ' ' + (cy + r) + ' Z';
                        }
                    }

                    if (p < 0.015 || p > 0.985) litPath = '';
                    if (Math.abs(p - 0.5) < 0.015) {
                        litPath = 'M ' + (cx - r) + ' ' + cy + ' A ' + r + ' ' + r + ' 0 1 0 ' + (cx + r) + ' ' + cy + ' A ' + r + ' ' + r + ' 0 1 0 ' + (cx - r) + ' ' + cy + ' Z';
                    }

                    const uniqueId = Math.round(phase * 1000) + '_' + size;
                    const gradId = 'bmLit_' + uniqueId;

                    return '<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 ' + size + ' ' + size + '\" width=\"' + size + '\" height=\"' + size + '\">' +
                        '<defs>' +
                            '<linearGradient id=\"' + gradId + '\" x1=\"0%\" y1=\"0%\" x2=\"100%\" y2=\"100%\">' +
                                '<stop offset=\"0%\" stop-color=\"#ffffff\" />' +
                                '<stop offset=\"25%\" stop-color=\"#bae6fd\" />' +
                                '<stop offset=\"65%\" stop-color=\"#38bdf8\" />' +
                                '<stop offset=\"100%\" stop-color=\"#0284c7\" />' +
                            '</linearGradient>' +
                        '</defs>' +
                        '<circle cx=\"' + cx + '\" cy=\"' + cy + '\" r=\"' + (r * 1.25) + '\" fill=\"rgba(56, 189, 248, 0.25)\" />' +
                        '<circle cx=\"' + cx + '\" cy=\"' + cy + '\" r=\"' + r + '\" fill=\"#08101e\" stroke=\"#38bdf8\" stroke-width=\"1.2\" stroke-opacity=\"0.4\" />' +
                        (litPath ? '<path d=\"' + litPath + '\" fill=\"url(#' + gradId + ')\" />' : '') +
                        '<circle cx=\"' + cx + '\" cy=\"' + cy + '\" r=\"' + r + '\" fill=\"none\" stroke=\"#7dd3fc\" stroke-width=\"1.2\" stroke-opacity=\"0.6\" />' +
                    '</svg>';
                }

                function svgToDataUrl(svg) {
                    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
                }

                let currentCal = getLunarCalendar();
                let currentSmallMoonUrl = svgToDataUrl(generateTadMoonSvg(currentCal.currentPhase, 36));
                let currentLargeMoonUrl = svgToDataUrl(generateTadMoonSvg(currentCal.currentPhase, 220));

                let emblem = document.getElementById('moonlit-lotus-emblem');
                if (!emblem) {
                    emblem = document.createElement('div');
                    emblem.id = 'moonlit-lotus-emblem';
                    emblem.innerHTML = '<img class=\"moonlit-lotus-img\" src=\"' + currentLargeMoonUrl + '\" alt=\"Real-Life Blue Moon\" />';
                    document.body.prepend(emblem);
                } else {
                    const existingImg = emblem.querySelector('.moonlit-lotus-img');
                    if (existingImg) existingImg.src = currentLargeMoonUrl;
                }

                let calendarCard = document.getElementById('moonlit-calendar-card');
                if (!calendarCard) {
                    calendarCard = document.createElement('div');
                    calendarCard.id = 'moonlit-calendar-card';
                    document.body.appendChild(calendarCard);
                }

                let poemBox = document.getElementById('moonlit-poem-box');
                if (!poemBox) {
                    poemBox = document.createElement('div');
                    poemBox.id = 'moonlit-poem-box';
                    document.body.appendChild(poemBox);
                }

                // Update Antigravity Top Logo, Floating Emblem, Favicon, and Lunar Calendar HUD
                function updateMoonIcons() {
                    const cal = getLunarCalendar();
                    const nowPhase = cal.currentPhase;
                    currentSmallMoonUrl = svgToDataUrl(generateTadMoonSvg(nowPhase, 36));
                    currentLargeMoonUrl = svgToDataUrl(generateTadMoonSvg(nowPhase, 220));

                    const btn = document.querySelector('[data-testid=\"app-icon-new-conversation-button\"]');
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
                        icon.alt = 'Blue Moon (' + cal.currentPhaseName + ')';
                        btn.title = 'Time & Date Lunar Calendar • ' + cal.currentPhaseName + ' (' + cal.illumination + '%, Day ' + cal.moonAgeDays + ') • Next: ' + cal.upcoming.name + ' in ' + cal.upcoming.diffDays + 'd';
                    }

                    const emblemImg = emblem ? emblem.querySelector('.moonlit-lotus-img') : null;
                    if (emblemImg && emblemImg.src !== currentLargeMoonUrl) {
                        emblemImg.src = currentLargeMoonUrl;
                        emblemImg.alt = 'Real-Life Blue Moon: ' + cal.currentPhaseName;
                    }

                    let link = document.querySelector('link[rel*=\"icon\"]');
                    if (!link) {
                        link = document.createElement('link');
                        link.rel = 'icon';
                        document.head.appendChild(link);
                    }
                    if (link && link.href !== currentSmallMoonUrl) {
                        link.type = 'image/svg+xml';
                        link.href = currentSmallMoonUrl;
                    }

                    if (calendarCard) {
                        const phaseKey = cal.currentPhaseName + '_' + cal.illumination + '_' + cal.activeQuarterIdx + '_v2';
                        if (calendarCard.dataset.phaseKey !== phaseKey || !calendarCard.children.length) {
                            calendarCard.dataset.phaseKey = phaseKey;
                            calendarCard.innerHTML =
                                '<div class=\"moonlit-cal-quarters-row\">' +
                                    cal.quarters.map(q =>
                                        '<div class=\"moonlit-cal-item ' + (q.isActive ? 'active' : '') + '\">' +
                                            '<div class=\"moonlit-cal-icon\">' + generateTadMoonSvg(q.fraction, 32) + '</div>' +
                                            '<div class=\"moonlit-cal-name\">' + q.name + '</div>' +
                                            '<div class=\"moonlit-cal-date\">' + q.dateStr + '</div>' +
                                        '</div>'
                                    ).join('') +
                                '</div>' +
                                '<div class=\"moonlit-cal-telemetry\">' +
                                    '<strong>' + cal.currentPhaseName + '</strong> • ' + cal.illumination + '% Illumination • Day ' + cal.moonAgeDays + ' of Cycle • Next: <strong>' + cal.upcoming.name + '</strong> in ' + cal.upcoming.diffDays + 'd' +
                                '</div>';
                        }
                    }
                }
                updateMoonIcons();

                // =========================================================================
                // 4. LIVING MULTI-REALM ATMOSPHERIC CANVAS ENGINE
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

                // Realm 1 Particles: Skiff / Lotus River
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

                // Realm 2 Particles: Ancient Frost Tree / Iuno
                for (let i = 0; i < 32; i++) {
                    state.crystalSpores.push({
                        x: Math.random() * window.innerWidth,
                        y: Math.random() * window.innerHeight,
                        radius: Math.random() * 2.2 + 0.8,
                        alpha: Math.random() * 0.6 + 0.25,
                        speedY: -(Math.random() * 0.35 + 0.15),
                        speedX: (Math.random() - 0.5) * 0.25,
                        phase: Math.random() * Math.PI * 2,
                        pulseSpeed: Math.random() * 0.025 + 0.012,
                        isMint: Math.random() > 0.4
                    });
                }

                for (let i = 0; i < 24; i++) {
                    state.frostStars.push({
                        x: Math.random() * window.innerWidth,
                        y: Math.random() * window.innerHeight,
                        speedX: Math.random() * 0.4 + 0.15,
                        speedY: (Math.random() - 0.5) * 0.12,
                        size: Math.random() * 3 + 2,
                        alpha: Math.random() * 0.75 + 0.25,
                        phase: Math.random() * Math.PI * 2,
                        rot: Math.random() * Math.PI,
                        rotSpeed: (Math.random() - 0.5) * 0.02
                    });
                }

                for (let i = 0; i < 28; i++) {
                    state.dreamEmbers.push({
                        x: Math.random() * window.innerWidth,
                        y: Math.random() * window.innerHeight,
                        radius: Math.random() * 2.4 + 0.7,
                        alpha: Math.random() * 0.65 + 0.25,
                        speedY: -(Math.random() * 0.4 + 0.18),
                        speedX: (Math.random() - 0.5) * 0.35,
                        phase: Math.random() * Math.PI * 2,
                        glowPulse: Math.random() * 0.03 + 0.015
                    });
                }

                // Star sparkle drawing helper
                function drawTwinkleCross(context, x, y, r, angle) {
                    context.save();
                    context.translate(x, y);
                    context.rotate(angle);
                    context.beginPath();
                    context.moveTo(-r, 0); context.lineTo(r, 0);
                    context.moveTo(0, -r); context.lineTo(0, r);
                    context.moveTo(-r * 0.4, -r * 0.4); context.lineTo(r * 0.4, r * 0.4);
                    context.moveTo(-r * 0.4, r * 0.4); context.lineTo(r * 0.4, -r * 0.4);
                    context.stroke();
                    context.restore();
                }

                // Hexagonal ripple helper
                function drawHexagonPath(context, x, y, r) {
                    context.beginPath();
                    for (let i = 0; i < 6; i++) {
                        const a = (i * Math.PI) / 3;
                        const hx = x + r * Math.cos(a);
                        const hy = y + r * Math.sin(a);
                        if (i === 0) context.moveTo(hx, hy);
                        else context.lineTo(hx, hy);
                    }
                    context.closePath();
                }

                function renderCanvas(now) {
                    state.lastFrameTime = now;
                    updateMoonlitLayout(now);

                    if (document.hidden) {
                        state.animFrame = requestAnimationFrame(renderCanvas);
                        return;
                    }

                    ctx.clearRect(0, 0, canvas.width, canvas.height);

                    const isSkiff = state.currentRealm === 'skiff';

                    // 1. Draw Expanding Ripples (Circular Water Ripple vs Hexagonal Starfrost)
                    for (let i = state.ripples.length - 1; i >= 0; i--) {
                        const r = state.ripples[i];
                        r.radius += (r.maxRadius - r.radius) * 0.045 + 0.7;
                        r.alpha *= 0.955;

                        if (r.alpha < 0.02 || r.radius >= r.maxRadius - 2) {
                            state.ripples.splice(i, 1);
                            continue;
                        }

                        ctx.save();
                        if (r.isFrost) {
                            // Realm 2: Crystalline Hexagonal Starfrost Ripple
                            ctx.strokeStyle = 'rgba(34, 211, 238, ' + (r.alpha * 0.85) + ')';
                            ctx.lineWidth = 1.6;
                            ctx.shadowColor = '#22d3ee';
                            ctx.shadowBlur = 10;
                            drawHexagonPath(ctx, r.x, r.y, r.radius);
                            ctx.stroke();

                            ctx.strokeStyle = 'rgba(240, 253, 250, ' + (r.alpha * 0.6) + ')';
                            ctx.lineWidth = 1.0;
                            drawHexagonPath(ctx, r.x, r.y, r.radius * 0.65);
                            ctx.stroke();

                            ctx.strokeStyle = 'rgba(245, 158, 11, ' + (r.alpha * 0.75) + ')';
                            drawTwinkleCross(ctx, r.x, r.y, r.radius * 0.45, now * 0.001);
                        } else {
                            // Realm 1: Circular Lotus River Ripple
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
                        }
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

                    if (isSkiff) {
                        // =============================================================
                        // REALM 1: LOTUS RIVER SYSTEM
                        // =============================================================
                        // A. Floating Amber/Cyan Embers
                        ctx.shadowColor = '#38bdf8';
                        ctx.shadowBlur = 8;
                        for (const p of state.embers) {
                            p.y += p.speedY;
                            p.x += p.speedX;
                            p.phase += p.glowPulse;

                            if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
                            if (p.x < -10) p.x = canvas.width + 10;
                            if (p.x > canvas.width + 10) p.x = -10;

                            const curAlpha = Math.max(0.05, Math.min(1, p.alpha + Math.sin(p.phase) * 0.35));
                            ctx.beginPath();
                            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                            ctx.fillStyle = p.isCyan ? ('rgba(56, 189, 248, ' + curAlpha + ')') : ('rgba(251, 191, 36, ' + curAlpha + ')');
                            ctx.fill();
                        }
                        ctx.shadowBlur = 0;

                        // B. Drifting Lotus Petals
                        for (const p of state.petals) {
                            p.y += p.vy;
                            p.x += Math.sin(now * p.swaySpeed + p.swayOffset) * p.swayAmount;
                            p.rotation += p.rotSpeed;

                            if (p.y > canvas.height + 20) { p.y = -20; p.x = Math.random() * canvas.width; }

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

                        // C. Celestial Flapping Butterflies
                        for (const b of state.butterflies) {
                            b.x += b.vx;
                            b.y += b.vy + Math.sin(now * 0.003 + b.flapPhase) * 0.5;

                            if (b.x < -30) { b.x = canvas.width + 20; b.vx = -Math.abs(b.vx); }
                            if (b.x > canvas.width + 30) { b.x = -20; b.vx = Math.abs(b.vx); }
                            if (b.y < 30) b.vy = Math.abs(b.vy);
                            if (b.y > canvas.height * 0.85) b.vy = -Math.abs(b.vy);

                            b.angle = Math.atan2(b.vy, b.vx);

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
                    } else {
                        // =============================================================
                        // REALM 2: ANCIENT FROST TREE SYSTEM (IUNO)
                        // =============================================================
                        // A. Bioluminescent Crystal Spores Rising
                        ctx.shadowColor = '#22d3ee';
                        ctx.shadowBlur = 10;
                        for (const s of state.crystalSpores) {
                            s.y += s.speedY;
                            s.x += s.speedX + Math.sin(now * 0.0015 + s.phase) * 0.25;
                            s.phase += s.pulseSpeed;

                            if (s.y < -10) { s.y = canvas.height + 10; s.x = Math.random() * canvas.width; }
                            if (s.x < -10) s.x = canvas.width + 10;
                            if (s.x > canvas.width + 10) s.x = -10;

                            const curAlpha = Math.max(0.08, Math.min(1, s.alpha + Math.sin(s.phase) * 0.32));
                            ctx.beginPath();
                            ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
                            ctx.fillStyle = s.isMint ? ('rgba(103, 232, 249, ' + curAlpha + ')') : ('rgba(34, 211, 238, ' + curAlpha + ')');
                            ctx.fill();
                        }

                        // B. Golden Dream Embers Rising Around Iuno
                        ctx.shadowColor = '#f59e0b';
                        ctx.shadowBlur = 8;
                        for (const d of state.dreamEmbers) {
                            d.y += d.speedY;
                            d.x += d.speedX;
                            d.phase += d.glowPulse;

                            if (d.y < -10) { d.y = canvas.height + 10; d.x = Math.random() * canvas.width; }
                            if (d.x < -10) d.x = canvas.width + 10;
                            if (d.x > canvas.width + 10) d.x = -10;

                            const curAlpha = Math.max(0.06, Math.min(0.95, d.alpha + Math.sin(d.phase) * 0.35));
                            ctx.beginPath();
                            ctx.arc(d.x, d.y, d.radius, 0, Math.PI * 2);
                            ctx.fillStyle = 'rgba(245, 158, 11, ' + curAlpha + ')';
                            ctx.fill();
                        }
                        ctx.shadowBlur = 0;

                        // C. Crystalline Frost Star Motes Twinkling with Horizontal Breeze
                        for (const fs of state.frostStars) {
                            fs.x += fs.speedX;
                            fs.y += fs.speedY + Math.sin(now * 0.002 + fs.phase) * 0.3;
                            fs.rot += fs.rotSpeed;
                            fs.phase += 0.03;

                            if (fs.x > canvas.width + 20) { fs.x = -20; fs.y = Math.random() * canvas.height; }
                            if (fs.y < -10) fs.y = canvas.height + 10;
                            if (fs.y > canvas.height + 10) fs.y = -10;

                            const curAlpha = Math.max(0.1, Math.min(1, fs.alpha + Math.sin(fs.phase) * 0.4));
                            ctx.save();
                            ctx.strokeStyle = 'rgba(240, 253, 250, ' + curAlpha + ')';
                            ctx.lineWidth = 1.0;
                            ctx.shadowColor = '#67e8f9';
                            ctx.shadowBlur = 6;
                            drawTwinkleCross(ctx, fs.x, fs.y, fs.size, fs.rot);
                            ctx.restore();
                        }
                    }

                    state.animFrame = requestAnimationFrame(renderCanvas);
                }
                state.animFrame = requestAnimationFrame(renderCanvas);

                // =========================================================================
                // 5. DYNAMIC LAYOUT SYMMETRY CONTROLLER (NEW CONV vs ACTIVE CHAT)
                // =========================================================================
                function updateMoonlitLayout(now) {
                    if (state._pauseLayout) return;
                    if (now && now - state.lastLayoutCheck < 150) return;
                    state.lastLayoutCheck = now || performance.now();

                    const curEmblem = document.getElementById('moonlit-lotus-emblem');
                    const curCard = document.getElementById('moonlit-calendar-card');
                    const curPoem = document.getElementById('moonlit-poem-box');
                    if (!curEmblem || !curPoem || !curCard) return;

                    const composer = document.getElementById('antigravity.agentSidePanelInputBox') || document.querySelector('.rounded-2xl.bg-card-border');
                    const compRect = composer ? composer.getBoundingClientRect() : null;
                    const messages = document.querySelectorAll('[class*="group/user-input-step"], [class*="user-input-step"]');

                    const isInChat = messages.length > 0 && compRect && compRect.top > window.innerHeight * 0.65;

                    if (isInChat) {
                        // In active chat: fade out so background artwork on right is 100% visible
                        curEmblem.style.opacity = '0';
                        curEmblem.style.pointerEvents = 'none';
                        curCard.style.opacity = '0';
                        curCard.style.pointerEvents = 'none';
                        curPoem.style.opacity = '0';
                        curPoem.style.pointerEvents = 'none';
                    } else if (compRect) {
                        // In New Conversation: Symmetrical docking above & below composer
                        const centerX = compRect.left + compRect.width / 2;

                        // Floating Blue Moon emblem docked above composer
                        curEmblem.style.left = centerX + 'px';
                        curEmblem.style.top = (compRect.top - 18) + 'px';
                        curEmblem.style.transform = 'translate(-50%, -100%)';
                        curEmblem.style.opacity = '0.98';

                        // Time & Date Lunar Phase Calendar HUD docked directly below composer
                        const cardTop = compRect.bottom + 14;
                        curCard.style.left = centerX + 'px';
                        curCard.style.top = cardTop + 'px';
                        curCard.style.transform = 'translateX(-50%)';
                        curCard.style.opacity = '0.96';

                        // Poetic Decree Caption docked cleanly beneath the calendar card with zero overlap
                        const cardHeight = curCard.offsetHeight || 92;
                        const poemTop = cardTop + cardHeight + 14;
                        curPoem.style.left = centerX + 'px';
                        curPoem.style.top = poemTop + 'px';
                        curPoem.style.transform = 'translateX(-50%)';
                        curPoem.style.maxWidth = Math.min(compRect.width, 680) + 'px';
                        curPoem.style.opacity = '0.92';
                    }
                }
                updateMoonlitLayout();

                // =========================================================================
                // 6. POETIC DECREE CAPTION TYPEWRITER LOOP (REALM ADAPTIVE)
                // =========================================================================
                const skiffPoems = [
                    "Drifting upon tranquil waters where moonlight crowns the blooming lotus.",
                    "The night river whispers under the stone bridge as celestial butterflies take flight.",
                    "A solitary skiff beneath the silver moon, rippling through starlight and silence.",
                    "Lantern light wafts on the evening tide, where lotus blossoms dream in azure mist.",
                    "In the stillness of the water's embrace, the moon weaves threads of quiet reverie.",
                    "烟波浩渺，月印荷塘。一叶扁舟过浅洲，两岸星河入梦流。"
                ];

                const treePoems = [
                    "Slumbering beneath ancient frosty boughs, where time dissolves into crystal dreams.",
                    "Bioluminescent spores drift upon the silence of eternal roots.",
                    "In the quiet cradle of the frosted canopy, starlight whispers to the sleeping maiden.",
                    "Frost crystals shimmer on ancient branches as celestial melodies echo through the twilight.",
                    "Golden motes of forgotten dreams awaken gently in the deep sapphire mist.",
                    "古木沉眠，霜雪初凝。青鸾入梦寒枝倚，落落星辉引岁长。"
                ];

                let skiffIdx = 0;
                let treeIdx = 0;

                function typePoemText(text, onComplete) {
                    if (!poemBox) return;
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

                function cyclePoem(immediate = false) {
                    if (state.poemTimer) clearTimeout(state.poemTimer);
                    const poems = state.currentRealm === 'skiff' ? skiffPoems : treePoems;
                    let targetIdx = state.currentRealm === 'skiff' ? skiffIdx : treeIdx;

                    if (!immediate) {
                        targetIdx = (targetIdx + 1) % poems.length;
                        if (state.currentRealm === 'skiff') skiffIdx = targetIdx;
                        else treeIdx = targetIdx;
                    }

                    if (poemBox) {
                        poemBox.style.opacity = '0';
                        setTimeout(() => {
                            poemBox.style.opacity = '0.92';
                            typePoemText(poems[targetIdx]);
                        }, immediate ? 200 : 400);
                    }
                }

                typePoemText(skiffPoems[0]);

                state.poemInterval = setInterval(() => {
                    cyclePoem(false);
                }, 16000);

                // =========================================================================
                // 7. INJECT CUSTOM MOONLIT THEME CSS
                // =========================================================================
                let style = document.getElementById('custom-antigravity-theme');
                if (!style) {
                    style = document.createElement('style');
                    style.id = 'custom-antigravity-theme';
                    document.head.appendChild(style);
                }
                style.textContent = ${JSON.stringify(MOONLIT_CSS)};

                // =========================================================================
                // 8. INTERACTIVE RIPPLES & MOUSE SPARKLES
                // =========================================================================
                const onWindowClick = (e) => {
                    if (e.target.closest('input, textarea, button, a, [contenteditable="true"]')) {
                        return;
                    }
                    const isTree = state.currentRealm === 'tree';
                    state.ripples.push({
                        x: e.clientX,
                        y: e.clientY,
                        radius: 4,
                        maxRadius: Math.random() * 30 + 80,
                        alpha: 0.9,
                        isFrost: isTree
                    });
                };

                let lastSparkTime = 0;
                const onMouseMove = (e) => {
                    const now = performance.now();
                    if (now - lastSparkTime > 55) {
                        lastSparkTime = now;
                        const isTree = state.currentRealm === 'tree';
                        if (isTree) {
                            const isMint = Math.random() > 0.45;
                            state.sparks.push({
                                x: e.clientX + (Math.random() - 0.5) * 8,
                                y: e.clientY + (Math.random() - 0.5) * 8,
                                vx: (Math.random() - 0.5) * 0.4,
                                vy: -(Math.random() * 0.45 + 0.18),
                                radius: Math.random() * 1.6 + 0.8,
                                alpha: 0.85,
                                color: isMint ? '#67e8f9' : '#f59e0b',
                                colorPrefix: isMint ? 'rgba(103, 232, 249, ' : 'rgba(245, 158, 11, '
                            });
                        } else {
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
                    }
                };

                // =========================================================================
                // 9. SCOPED HOVER EFFECTS (YELLOW & BOXED TEXT ONLY)
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
                    if (!document.getElementById('moonlit-particles-canvas') && canvas) {
                        document.body.prepend(canvas);
                    }
                    if (!document.getElementById('moonlit-lotus-emblem') && emblem) {
                        document.body.prepend(emblem);
                    }
                    if (!document.getElementById('moonlit-calendar-card') && calendarCard) {
                        document.body.appendChild(calendarCard);
                    }
                    if (!document.getElementById('moonlit-poem-box') && poemBox) {
                        document.body.appendChild(poemBox);
                    }
                    if (!document.getElementById('moonlit-vignette-overlay') && vignette) {
                        document.body.prepend(vignette);
                    }
                    const btn = document.querySelector('[data-testid=\"app-icon-new-conversation-button\"]');
                    if (btn && !btn.querySelector('.moonlit-top-app-icon')) {
                        updateMoonIcons();
                    }
                }

                // =========================================================================
                // 10. WATCHDOG & MUTATION OBSERVER
                // =========================================================================
                state.watchdog = setInterval(() => {
                    ensureDOMElements();
                    resizeCanvas();
                    updateMoonlitLayout(performance.now());
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
                        if (!id.startsWith('moonlit-')) {
                            shouldHandle = true;
                            break;
                        }
                    }
                    if (!shouldHandle) return;

                    if (state.observerDebounce) return;
                    state.observerDebounce = setTimeout(() => {
                        state.observerDebounce = null;
                        ensureDOMElements();
                        updateMoonlitLayout(performance.now());
                    }, 80);
                });
                observer.observe(document.body, { childList: true, subtree: true });
                state.observer = observer;

                return 'Moonlit Lotus Skiff Theme Dual-Realm Engine Live: Skiff & Ancient Frost Tree Active!';
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
