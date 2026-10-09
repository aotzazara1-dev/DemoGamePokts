@echo off
title Poktsonline Server [Port 2567]
set "PATH=%LOCALAPPDATA%\Programs\NodeJS;%LOCALAPPDATA%\Programs\Git\cmd;%LOCALAPPDATA%\Programs\Git\ucrt64\bin;%PATH%"

cd /d "%~dp0"

echo ===================================================
echo   POKTSONLINE - COLYSEUS AUTHORITATIVE SERVER
echo ===================================================
echo [1/2] Building shared and server packages...
call npm run build --workspace=@poktsonline/shared
call npm run build --workspace=@poktsonline/server

echo.
echo [2/2] Launching Colyseus Server on ws://localhost:2567...
node packages/server/dist/index.js

pause
