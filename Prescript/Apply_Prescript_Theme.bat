@echo off
set ELECTRON_RUN_AS_NODE=1
"%LOCALAPPDATA%\Programs\antigravity\Antigravity.exe" "%~dp0apply_prescript_theme.js"
echo.
echo [+] Project Moon - The Index & Prescript Theme Applied!
timeout /t 2 >nul
