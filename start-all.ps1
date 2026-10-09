# Poktsonline MVP PowerShell Launcher
$env:PATH = "$env:LOCALAPPDATA\Programs\NodeJS;$env:LOCALAPPDATA\Programs\Git\cmd;$env:LOCALAPPDATA\Programs\Git\ucrt64\bin;$env:PATH"

Set-Location $PSScriptRoot

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "       POKTSONLINE MVP - POWERSHELL LAUNCHER" -ForegroundColor Yellow
Write-Host "===================================================" -ForegroundColor Cyan

Write-Host "[1/3] Building core shared & server packages..." -ForegroundColor Green
npm run build --workspace=@poktsonline/shared
npm run build --workspace=@poktsonline/server

Write-Host "[2/3] Launching Authoritative Server (ws://localhost:2567)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:PATH = '$env:PATH'; cd '$PSScriptRoot'; node packages/server/dist/index.js"

Start-Sleep -Seconds 2

Write-Host "[3/3] Launching Phaser Client (http://localhost:5173)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:PATH = '$env:PATH'; cd '$PSScriptRoot'; npm run dev --workspace=@poktsonline/client"

Start-Sleep -Seconds 2

Write-Host "Opening web browser at http://localhost:5173..." -ForegroundColor Cyan
Start-Process "http://localhost:5173"

Write-Host "`nAll services running successfully!" -ForegroundColor Green
