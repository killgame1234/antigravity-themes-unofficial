@echo off
set ELECTRON_RUN_AS_NODE=1

powershell -NoProfile -Command "try { if ((Invoke-WebRequest -Uri 'http://127.0.0.1:47831/health' -UseBasicParsing -TimeoutSec 1).StatusCode -eq 200) { exit 0 } } catch {}; Start-Process -FilePath '%LOCALAPPDATA%\Programs\antigravity\Antigravity.exe' -ArgumentList '\"%~dp0apply_gravitas_prism.mjs\" --bridge' -WindowStyle Hidden"

"%LOCALAPPDATA%\Programs\antigravity\Antigravity.exe" "%~dp0apply_gravitas_prism.mjs"
echo.
echo [+] Gravitas Prism Theme Applied!
ping 127.0.0.1 -n 3 >nul
