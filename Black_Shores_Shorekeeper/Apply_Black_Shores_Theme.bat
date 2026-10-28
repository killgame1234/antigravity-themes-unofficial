@echo off
set ELECTRON_RUN_AS_NODE=1
"%LOCALAPPDATA%\Programs\antigravity\Antigravity.exe" "%~dp0apply_black_shores_theme.js"
echo.
echo [+] The Black Shores & Shorekeeper Theme Applied!
ping 127.0.0.1 -n 3 >nul
