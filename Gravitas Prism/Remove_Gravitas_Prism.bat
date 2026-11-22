@echo off
set ELECTRON_RUN_AS_NODE=1
"%LOCALAPPDATA%\Programs\antigravity\Antigravity.exe" "%~dp0apply_gravitas_prism.mjs" --off
echo.
echo [+] Gravitas Prism Theme Removed!
ping 127.0.0.1 -n 3 >nul
