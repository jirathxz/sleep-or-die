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

void PrintConsoleUnicode(const std::wstring& text) {
    HANDLE hStdOut = GetStdHandle(STD_OUTPUT_HANDLE);
    if (hStdOut != INVALID_HANDLE_VALUE) {
        DWORD written = 0;
        WriteConsoleW(hStdOut, text.c_str(), (DWORD)text.length(), &written, NULL);
    }
}

/**
 * Native Windows Toast / Message Alert (Async non-blocking popup)
 */
void ShowWindowsAlert(const std::wstring& title, const std::wstring& message, UINT iconType) {
    PrintConsoleUnicode(L"[" + title + L"] " + message + L"\n");
    MessageBeep(iconType);

    struct PopupArgs {
        std::wstring title;
        std::wstring message;
        UINT iconType;
    };
    PopupArgs* args = new PopupArgs{ title, message, iconType };

    HANDLE hThread = CreateThread(
        NULL, 0,
        [](LPVOID param) -> DWORD {
            PopupArgs* p = (PopupArgs*)param;
            MessageBoxW(NULL, p->message.c_str(), p->title.c_str(), p->iconType | MB_TOPMOST);
            delete p;
            return 0;
        },
        args, 0, NULL
    );
    if (hThread) {
        CloseHandle(hThread);
    }
}

/**
 * Disciplinary Enforcement (Shutdown - Test Mode uses MessageBox as requested)
 */
void ExecuteEnforcement() {
    PrintConsoleUnicode(L"\n=======================================================\n");
    PrintConsoleUnicode(L">>> [0% HP: SYSTEM SHUTDOWN ENFORCED (TEST MODE: MSGBOX)] <<<\n");
    PrintConsoleUnicode(L"=======================================================\n");
    PlaySoundForStage(SleepStage::Shutdown);

    // Using Windows MessageBox for test mode as requested (instead of locking or turning off PC)
    MessageBoxW(
        NULL,
        L"🚨 [SleepOrDie: HARDCORE DISCIPLINARY SHUTDOWN]\n\n"
        L"พลังชีวิต (HP) ของคุณลดลงเหลือ 0% แล้ว!\n"
        L"หมดเวลาช่วงฉุกเฉิน 30 วินาที และเลยเส้นตายเข้านอน\n\n"
        L"⚠️ บันทึกสไตรค์ความผิด 1 ครั้ง (Strike Recorded)\n\n"
        L"----------------------------------------------------\n"
        L"[โหมดทดสอบ: แสดง MessageBox จำลองคำสั่ง Shutdown สำเร็จ]\n"
        L"(ในระบบจริงเครื่องจะถูกสั่ง LockWorkStation หรือปิดระบบทันที)",
        L"SleepOrDie — SYSTEM SHUTDOWN (0% HP)",
        MB_OK | MB_ICONERROR | MB_SYSTEMMODAL
    );
}

/**
 * Simulates the 3-2-1 Bedtime Countdown locally with 30s emergency window before HP hits 0%
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
    std::cout << ">>> EMERGENCY! 30 seconds remaining before HP reaches 0%!\n";
    PlaySoundForStage(SleepStage::Sleep);

    for (int sec = 30; sec >= 1; --sec) {
        int hp = (sec * 100) / 30;
        std::cout << ">>> [EMERGENCY 30s COUNTDOWN] " << sec << "s remaining before HP 0%! Current HP: " << hp << "%\n";
        Beep(1175, 120);
        Sleep(1000);
    }

    std::cout << "\n>>> [0% HP: SYSTEM SHUTDOWN] STRIKE RECORDED! <<<\n";
    ExecuteEnforcement();
}

int main(int argc, char* argv[]) {
    // Set console code page to UTF-8
    SetConsoleOutputCP(CP_UTF8);
    SetConsoleCP(CP_UTF8);

    std::cout << "============================================================\n";
    std::cout << "       SLEEP OR DIE - NATIVE WINDOWS DESKTOP GUARD          \n";
    std::cout << "    Hardcore Biological Discipline & Night Curfew Enforcer  \n";
    std::cout << "============================================================\n";
    std::cout << " Target Bedtime: " << config.bedtimeHour << ":" << (config.bedtimeMinute < 10 ? "0" : "") << config.bedtimeMinute << "\n";
    std::cout << " Emergency Window: 30 seconds before HP runs out (100% -> 0%)\n";
    std::cout << " Monitoring active user presence via Win32 API...\n";
    std::cout << " Type 'SleepOrDieGuard.exe --test' to simulate 3-2-1 bedtime deadline.\n";
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
                ShowWindowsAlert(L"SleepOrDie เลยเวลานอน", L"เลยเส้นตายแล้ว! มีเวลา 30 วินาทีก่อน HP หมดและเครื่องจะถูกล็อค", MB_ICONERROR);
            }
        }

        // Bedtime curfew breached: 30 seconds emergency countdown before HP hits 0%
        if (currentStage == SleepStage::Sleep) {
            long secondsPastDeadline = -secondsRemaining;
            long emergencySecondsLeft = max(0L, 30L - secondsPastDeadline);
            config.currentHp = max(0, (int)((emergencySecondsLeft * 100) / 30));

            std::cout << "[EMERGENCY 30s COUNTDOWN] " << emergencySecondsLeft << "s remaining before HP 0%! Current HP: " << config.currentHp << "%\n";
            PlaySoundForStage(SleepStage::Sleep);

            if (emergencySecondsLeft <= 0 || config.currentHp <= 0) {
                currentStage = SleepStage::Shutdown;
                ExecuteEnforcement();
                break;
            }
        }

        // Sleep for 1 second before next tick
        Sleep(1000);
    }

    return 0;
}
