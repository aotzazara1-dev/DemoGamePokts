@echo off
title Poktsonline Client [Port 5173]
set "PATH=%LOCALAPPDATA%\Programs\NodeJS;%LOCALAPPDATA%\Programs\Git\cmd;%LOCALAPPDATA%\Programs\Git\ucrt64\bin;%PATH%"

cd /d "%~dp0"

echo ===================================================
echo   POKTSONLINE - PHASER 3 CLIENT (VITE)
echo ===================================================
echo Starting Vite Dev Server on http://localhost:5173...
echo.
call npm run dev --workspace=@poktsonline/client

pause
