@echo off
setlocal
cd /d "%~dp0"
node "%~dp0apply.mjs"
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [!] Failed to apply Castorice 3D wallpaper.
    pause
    exit /b 1
)
echo.
echo [+] Castorice 3D Wallpaper Applied! (Alt+Drag to orbit, Alt+Scroll to zoom, Alt+DoubleClick to reset)
timeout /t 2 >nul
