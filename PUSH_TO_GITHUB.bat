@echo off
title Push Poktsonline to GitHub
color 0b
echo ========================================================
echo   Pushing Poktsonline to GitHub
echo   Target: https://github.com/aotzazara1-dev/DemoGamePokts.git
echo ========================================================
echo.

set "PATH=%LOCALAPPDATA%\Programs\Git\cmd;%LOCALAPPDATA%\Programs\Git\ucrt64\bin;%LOCALAPPDATA%\Programs\Git\bin;%PATH%"

cd /d "E:\Poktsonline"

echo [1/2] Adding files...
git add .
git commit -m "update prototype" 2>nul

echo [2/2] Pushing to GitHub...
echo.
git push -u origin main

echo.
echo ========================================================
if %ERRORLEVEL% EQU 0 (
    color 0a
    echo SUCCESS! Pushed to GitHub.
) else (
    color 0c
    echo PUSH FAILED or CANCELLED.
)
echo ========================================================
echo.
pause
