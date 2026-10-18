/**
 * SleepOrDie Native Windows Desktop Guard Daemon
 * Hardcore Biological Discipline & Night Curfew Enforcer
 *
 * Win32 API Integration:
 * - GetLastInputInfo: Detects keyboard/mouse activity & evasion
 * - Beep / PlaySound: Hardware audio alerts for Alert, Lockdown, Emergency Alarm, Shutdown
 * - LockWorkStation: Instantly locks Windows workstation upon curfew breach
 * - InitiateSystemShutdown: Enforces PC shutdown on 0% HP
 */

#define WIN32_LEAN_AND_MEAN
#include <windows.h>
#include <shellapi.h>
#include <mmsystem.h>
#include <iostream>
#include <string>
#include <sstream>
#include <ctime>
#include <chrono>
#include <thread>

#pragma comment(lib, "user32.lib")
#pragma comment(lib, "shell32.lib")
#pragma comment(lib, "winmm.lib")

enum class SleepStage {
    Normal,
    Alert,      // T-30m
    Lockdown,   // T-15m
    Sleep,      // Deadline Exceeded (HP Draining)
    Shutdown    // HP 0% (System Power-down / Lock)
};

struct DaemonConfig {
    int bedtimeHour = 23;
    int bedtimeMinute = 15;
    bool enableAudio = true;
    bool lockOnShutdown = true;
    bool enforcePcPoweroff = false;
    int currentHp = 100;
};

// Global daemon state
DaemonConfig config;
SleepStage currentStage = SleepStage::Normal;

/**
 * Returns seconds since last user input (keyboard or mouse)
 */
DWORD GetUserIdleSeconds() {
    LASTINPUTINFO lii;
    lii.cbSize = sizeof(LASTINPUTINFO);
    if (GetLastInputInfo(&lii)) {
        DWORD currentTick = GetTickCount();
        return (currentTick - lii.dwTime) / 1000;
    }
    return 0;
}

/**
 * Calculates remaining seconds until bedtime target
 */
long GetSecondsUntilBedtime(int targetHour, int targetMin) {
    auto now = std::chrono::system_clock::now();
    std::time_t nowTime = std::chrono::system_clock::to_time_t(now);
    std::tm localTm;
    localtime_s(&localTm, &nowTime);

    int nowSeconds = localTm.tm_hour * 3600 + localTm.tm_min * 60 + localTm.tm_sec;
    int targetSeconds = targetHour * 3600 + targetMin * 60;

    long diff = targetSeconds - nowSeconds;

    // Adjust for overnight wrap-around (within 12h span)
    if (diff < -43200) {
        diff += 86400;
    } else if (diff > 43200) {
        diff -= 86400;
    }

    return diff;
}

/**
 * Hardware Sound Synthesis for Each Stage
 */
void PlaySoundForStage(SleepStage stage) {
    if (!config.enableAudio) return;

    switch (stage) {
        case SleepStage::Alert:
            // Gentle double chime (D5 -> A5)
            Beep(587, 250);
            Sleep(80);
            Beep(880, 350);
            break;

        case SleepStage::Lockdown:
            // Urgent heartbeat rhythm
            Beep(440, 150);
            Sleep(100);
            Beep(440, 200);
            break;

        case SleepStage::Sleep:
            // High-frequency emergency alarm pulse
            for (int i = 0; i < 3; ++i) {
                Beep(988, 120);
                Sleep(50);
                Beep(1318, 180);
                Sleep(60);
            }
            break;

        case SleepStage::Shutdown:
            // Power-down descending tone
            Beep(659, 250);
            Beep(494, 250);
            Beep(330, 400);
            Beep(165, 700);
            break;

        default:
            break;
    }
}

/**
 * Native Windows Toast / Message Alert
 */
void ShowWindowsAlert(const std::wstring& title, const std::wstring& message, UINT iconType) {
    std::wcout << L"[" << title << L"] " << message << std::endl;
    // Show non-blocking popup or console print
    MessageBeep(iconType);
}

/**
 * Disciplinary Enforcement (Lock Workstation or Shutdown PC)
 */
void ExecuteEnforcement() {
    std::wcout << L"\n>>> [ENFORCEMENT] EXECUTING DISCIPLINARY LOCK PROTOCOL <<<\n";
    PlaySoundForStage(SleepStage::Shutdown);

    if (config.lockOnShutdown) {
        std::wcout << L"[SleepOrDie] Locking Windows Workstation immediately.\n";
        LockWorkStation();
    }

    if (config.enforcePcPoweroff) {
        std::wcout << L"[SleepOrDie] Initiating Windows System Shutdown (60s countdown)...\n";
        system("shutdown /s /t 60 /c \"SleepOrDie: HP Reached 0%! System Shutting Down to Enforce Sleep Discipline.\"");
    }
}

/**
 * Simulates the 3-2-1 Bedtime Countdown locally
 */
void RunSimulation321() {
    std::cout << "\n=======================================================\n";
    std::cout << "  [SIMULATION] Starting Bedtime Countdown 3 - 2 - 1    \n";
    std::cout << "=======================================================\n";

    for (int sec = 3; sec >= 1; --sec) {
        std::cout << ">>> Countdown: " << sec << " seconds remaining...\n";
        Beep(587, 200);
        Sleep(1000);
    }

    std::cout << "\n>>> [DEADLINE REACHED: 00:00:00] BEDTIME PROTOCOL BREACHED! <<<\n";
    std::cout << ">>> Alarm sounding! HP is now draining rapidly...\n";
    PlaySoundForStage(SleepStage::Sleep);

    int testHp = 100;
    while (testHp > 0) {
        testHp -= 20;
        std::cout << "[HP DRAIN] Current HP: " << testHp << "%\n";
        Beep(1175, 150);
        Sleep(1000);
    }

    std::cout << "\n>>> [0% HP: SYSTEM SHUTDOWN] STRIKE RECORDED! <<<\n";
    ExecuteEnforcement();
}

int main(int argc, char* argv[]) {
    // Set console code page to UTF-8
    SetConsoleOutputCP(CP_UTF8);

    std::cout << "============================================================\n";
    std::cout << "       SLEEP OR DIE - NATIVE WINDOWS DESKTOP GUARD          \n";
    std::cout << "    Hardcore Biological Discipline & Night Curfew Enforcer  \n";
    std::cout << "============================================================\n";
    std::cout << " Target Bedtime: " << config.bedtimeHour << ":" << (config.bedtimeMinute < 10 ? "0" : "") << config.bedtimeMinute << "\n";
    std::cout << " Monitoring active user presence via Win32 API...\n";
    std::cout << " Type 'test' to simulate 3-2-1 bedtime deadline.\n";
    std::cout << "------------------------------------------------------------\n\n";

    if (argc > 1 && std::string(argv[1]) == "--test") {
        RunSimulation321();
        return 0;
    }

    bool running = true;
    while (running) {
        long secondsRemaining = GetSecondsUntilBedtime(config.bedtimeHour, config.bedtimeMinute);
        DWORD idleSeconds = GetUserIdleSeconds();
        SleepStage newStage = SleepStage::Normal;

        if (secondsRemaining <= 0) {
            newStage = SleepStage::Sleep;
        } else if (secondsRemaining <= 900) {
            newStage = SleepStage::Lockdown;
        } else if (secondsRemaining <= 1800) {
            newStage = SleepStage::Alert;
        } else {
            newStage = SleepStage::Normal;
        }

        // Stage transition alerts
        if (newStage != currentStage) {
            currentStage = newStage;
            PlaySoundForStage(currentStage);

            if (currentStage == SleepStage::Alert) {
                ShowWindowsAlert(L"SleepOrDie เตือนเวลานอน", L"เหลือเวลา 30 นาทีก่อนถึงเส้นตาย เริ่มวางงานและพักสายตา", MB_ICONINFORMATION);
            } else if (currentStage == SleepStage::Lockdown) {
                ShowWindowsAlert(L"SleepOrDie ล็อคดาวน์", L"เหลือเวลา 15 นาทีสุดท้าย! ปิดหน้าจอคอมพิวเตอร์ทันที", MB_ICONWARNING);
            } else if (currentStage == SleepStage::Sleep) {
                ShowWindowsAlert(L"SleepOrDie เลยเวลานอน", L"เลยเส้นตายแล้ว! เลือดกำลังลด หากไม่นอนเครื่องจะถูกล็อค", MB_ICONERROR);
            }
        }

        // Active evasion check past deadline:
        if (currentStage == SleepStage::Sleep) {
            if (idleSeconds < 30) {
                // User is actively moving mouse or typing past deadline!
                std::cout << "[VIOLATION] Active keyboard/mouse detected past bedtime deadline! (Idle: " << idleSeconds << "s)\n";
                PlaySoundForStage(SleepStage::Sleep);

                config.currentHp = max(0, config.currentHp - 5);
                std::cout << "[VITALITY] HP drained to " << config.currentHp << "%\n";

                if (config.currentHp <= 0) {
                    currentStage = SleepStage::Shutdown;
                    ExecuteEnforcement();
                    break;
                }
            }
        }

        // Sleep for 2 seconds before next tick
        Sleep(2000);
    }

    return 0;
}
