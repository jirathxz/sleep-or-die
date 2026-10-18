@echo off
chcp 65001 > nul
title SleepOrDie Guard - 3-2-1 Test Simulation
color 0e
echo ========================================================
echo   SLEEP OR DIE - 3-2-1 BEDTIME COUNTDOWN SIMULATION
echo ========================================================
echo.
if exist SleepOrDieGuard.exe (
    SleepOrDieGuard.exe --test
) else (
    python daemon.py --test
)
pause
