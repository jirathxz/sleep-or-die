@echo off
chcp 65001 > nul
title SleepOrDie Desktop Guard
color 0c
echo ========================================================
echo       SLEEP OR DIE - NATIVE WINDOWS DESKTOP GUARD
echo ========================================================
echo.
if exist SleepOrDieGuard.exe (
    echo Starting native C++ executable...
    SleepOrDieGuard.exe
) else (
    echo SleepOrDieGuard.exe not found, falling back to Python...
    python daemon.py
)
pause
