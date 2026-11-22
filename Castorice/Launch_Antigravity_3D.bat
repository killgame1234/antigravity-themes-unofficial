@echo off
setlocal
cd /d "%~dp0"

set "AGY_EXE=%LOCALAPPDATA%\Programs\antigravity\Antigravity.exe"
if not exist "%AGY_EXE%" (
    echo [!] Could not find Antigravity.exe at "%AGY_EXE%".
    pause
    exit /b 1
)

tasklist /FI "IMAGENAME eq Antigravity.exe" 2>nul | find /I "Antigravity.exe" >nul
if %ERRORLEVEL% EQU 0 (
    echo [*] Antigravity is already running. Trying to apply Castorice 3D...
    node "%~dp0apply.mjs" >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo [+] Castorice 3D Wallpaper Applied!
        timeout /t 2 >nul
        exit /b 0
    )
    echo.
    echo [!] Antigravity is currently running WITHOUT --remote-debugging-port=9222.
    echo     Please close all Antigravity windows first, then run Launch_Antigravity_3D.bat again.
    pause
    exit /b 1
)

echo [*] Starting Antigravity with --remote-debugging-port=9222...
start "" "%AGY_EXE%" --remote-debugging-port=9222

echo [*] Waiting for Antigravity window...
for /L %%i in (1,1,15) do (
    timeout /t 1 >nul
    node "%~dp0apply.mjs" >nul 2>&1
    if not errorlevel 1 (
        echo [+] Castorice 3D Wallpaper Applied! (Alt+Drag to orbit, Alt+Scroll to zoom, Alt+DoubleClick to reset)
        timeout /t 2 >nul
        exit /b 0
    )
)

echo [!] Antigravity started, but Castorice 3D could not attach automatically.
echo     Once Antigravity finishes loading, run Apply_Castorice_3D.bat.
pause
exit /b 1
