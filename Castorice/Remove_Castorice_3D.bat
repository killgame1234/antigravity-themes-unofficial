@echo off
setlocal
cd /d "%~dp0"
node "%~dp0apply.mjs" --off
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [!] Failed to remove Castorice 3D theme.
    pause
    exit /b 1
)
echo.
echo [+] Castorice 3D Theme and Castorice personality turned OFF!
timeout /t 2 >nul
