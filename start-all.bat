@echo off
title Poktsonline Launcher
set "PATH=%LOCALAPPDATA%\Programs\NodeJS;%LOCALAPPDATA%\Programs\Git\cmd;%LOCALAPPDATA%\Programs\Git\ucrt64\bin;%PATH%"

cd /d "%~dp0"

echo ===================================================
echo        POKTSONLINE MVP - 1-CLICK LAUNCHER
echo ===================================================
echo [1/3] Building core packages...
call npm run build --workspace=@poktsonline/shared
call npm run build --workspace=@poktsonline/server

echo.
echo [2/3] Starting Authoritative Server in new window...
start "Poktsonline Server [Port 2567]" cmd /k "call start-server.bat"

rem Wait 2 seconds for server initialization
timeout /t 2 /nobreak >nul

echo.
echo [3/3] Starting Phaser Client in new window...
start "Poktsonline Client [Port 5173]" cmd /k "call start-client.bat"

rem Wait 2 seconds for Vite initialization
timeout /t 2 /nobreak >nul

echo.
echo Opening browser to http://localhost:5173 ...
start http://localhost:5173

echo ===================================================
echo  Both Server and Client are now running!
echo  - Server: ws://localhost:2567
echo  - Client: http://localhost:5173
echo.
echo  Press any key to close this launcher window.
echo  (The game windows will remain active in background)
echo ===================================================
pause >nul
