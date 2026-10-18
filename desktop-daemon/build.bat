@echo off
echo ========================================================
echo Compiling SleepOrDie Native Windows Desktop Guard (C++)
echo ========================================================

call "C:\Program Files (x86)\Microsoft Visual Studio\18\BuildTools\VC\Auxiliary\Build\vcvars64.bat"

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Visual Studio Build Tools environment setup failed.
    pause
    exit /b %ERRORLEVEL%
)

cl.exe /O2 /EHsc /std:c++17 main.cpp /Fe:SleepOrDieGuard.exe user32.lib shell32.lib winmm.lib

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================================
    echo [SUCCESS] SleepOrDieGuard.exe built successfully!
    echo Run "SleepOrDieGuard.exe --test" to simulate 3-2-1 countdown.
    echo ========================================================
) else (
    echo.
    echo [ERROR] Compilation failed.
)
