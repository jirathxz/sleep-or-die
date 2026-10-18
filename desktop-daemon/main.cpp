/**
 * SleepOrDie Native Windows Desktop Guard Daemon
 * Hardcore Biological Discipline & Night Curfew Enforcer
 *
 * Win32 API Integration:
 * - GetLastInputInfo: Detects keyboard/mouse activity & evasion
 * - Beep / PlaySound: Hardware audio alerts for Alert, Lockdown, Emergency Alarm, Shutdown
 * - LockWorkStation: Instantly locks Windows workstation (Sign Out) upon Lockdown
 * - WinHTTP: Native HTTP presence reporting to SleepOrDie Web API
 */

#define WIN32_LEAN_AND_MEAN
#include <windows.h>
#include <shellapi.h>
#include <mmsystem.h>
#include <winhttp.h>
#include <iostream>
#include <fstream>
#include <string>
#include <sstream>
#include <ctime>
#include <chrono>
#include <thread>

#pragma comment(lib, "user32.lib")
#pragma comment(lib, "shell32.lib")
#pragma comment(lib, "winmm.lib")
#pragma comment(lib, "winhttp.lib")

enum class SleepStage {
    Normal,
    Alert,      // T-30m
    Lockdown,   // T-15m (Windows Sign Out / Screen Lock)
    Sleep,      // Deadline Exceeded (HP Draining - 30s emergency)
    Shutdown    // HP 0% (Disciplinary Shutdown)
};

struct DaemonConfig {
    int bedtimeHour = 23;
    int bedtimeMinute = 15;
    std::wstring apiHost = L"127.0.0.1";
    int apiPort = 8000;
    std::wstring apiPath = L"/api/presence/update";
    std::string discordUserId = "";
    int userId = 1;
    bool enableAudio = true;
    bool lockWorkstationOnLockdown = true;
    bool enforcePcPoweroff = false;
    int idleThresholdSeconds = 60;
    int checkIntervalSeconds = 2;
    int currentHp = 100;
};

// Global daemon state
DaemonConfig config;
SleepStage currentStage = SleepStage::Normal;

void LoadConfigJson() {
    std::ifstream file("config.json");
    if (!file.is_open()) return;
    std::string content((std::istreambuf_iterator<char>(file)), std::istreambuf_iterator<char>());
    file.close();

    auto findInt = [&](const std::string& key, int defaultVal) -> int {
        size_t pos = content.find("\"" + key + "\"");
        if (pos == std::string::npos) return defaultVal;
        size_t colon = content.find(":", pos);
        if (colon == std::string::npos) return defaultVal;
        size_t start = content.find_first_of("0123456789", colon);
        if (start == std::string::npos) return defaultVal;
        try {
            return std::stoi(content.substr(start));
        } catch (...) {
            return defaultVal;
        }
    };

    auto findString = [&](const std::string& key, const std::string& defaultVal) -> std::string {
        size_t pos = content.find("\"" + key + "\"");
        if (pos == std::string::npos) return defaultVal;
        size_t colon = content.find(":", pos);
        if (colon == std::string::npos) return defaultVal;
        size_t firstQuote = content.find("\"", colon);
        if (firstQuote == std::string::npos) return defaultVal;
        size_t secondQuote = content.find("\"", firstQuote + 1);
        if (secondQuote == std::string::npos) return defaultVal;
        return content.substr(firstQuote + 1, secondQuote - firstQuote - 1);
    };

    config.bedtimeHour = findInt("bedtime_hour", config.bedtimeHour);
    config.bedtimeMinute = findInt("bedtime_minute", config.bedtimeMinute);
    config.userId = findInt("user_id", config.userId);
    config.discordUserId = findString("discord_user_id", config.discordUserId);
    config.idleThresholdSeconds = findInt("idle_threshold_seconds", config.idleThresholdSeconds);
    config.checkIntervalSeconds = findInt("check_interval_seconds", config.checkIntervalSeconds);

    if (content.find("\"lock_workstation_on_lockdown\": false") != std::string::npos) {
        config.lockWorkstationOnLockdown = false;
    }
}

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
 * Native HTTP presence reporting to SleepOrDie API via WinHTTP
 */
bool SendPresenceHttp(const std::wstring& host, int port, const std::wstring& path, const std::string& jsonPayload) {
    HINTERNET hSession = WinHttpOpen(L"SleepOrDieGuard/1.0", WINHTTP_ACCESS_TYPE_DEFAULT_PROXY, WINHTTP_NO_PROXY_NAME, WINHTTP_NO_PROXY_BYPASS, 0);
    if (!hSession) return false;

    HINTERNET hConnect = WinHttpConnect(hSession, host.c_str(), (INTERNET_PORT)port, 0);
    if (!hConnect) {
        WinHttpCloseHandle(hSession);
        return false;
    }

    HINTERNET hRequest = WinHttpOpenRequest(hConnect, L"POST", path.c_str(), NULL, WINHTTP_NO_REFERER, WINHTTP_DEFAULT_ACCEPT_TYPES, 0);
    if (!hRequest) {
        WinHttpCloseHandle(hConnect);
        WinHttpCloseHandle(hSession);
        return false;
    }

    std::wstring headers = L"Content-Type: application/json\r\nAccept: application/json\r\n";
    BOOL bResults = WinHttpSendRequest(
        hRequest,
        headers.c_str(), (DWORD)headers.length(),
        (LPVOID)jsonPayload.c_str(), (DWORD)jsonPayload.length(),
        (DWORD)jsonPayload.length(), 0
    );

    if (bResults) {
        bResults = WinHttpReceiveResponse(hRequest, NULL);
    }

    WinHttpCloseHandle(hRequest);
    WinHttpCloseHandle(hConnect);
    WinHttpCloseHandle(hSession);
    return bResults == TRUE;
}

void ReportPresence(const std::string& status, int idleSeconds, bool screenLocked) {
    std::string json = "{\"source\":\"desktop_daemon\",\"status\":\"" + status + "\",\"idle_seconds\":" + std::to_string(idleSeconds) + ",\"screen_locked\":" + (screenLocked ? "true" : "false");
    if (!config.discordUserId.empty()) {
        json += ",\"discord_user_id\":\"" + config.discordUserId + "\"";
    }
    if (config.userId > 0) {
        json += ",\"user_id\":" + std::to_string(config.userId);
    }
    json += "}";

    std::thread([json]() {
        SendPresenceHttp(config.apiHost, config.apiPort, config.apiPath, json);
    }).detach();
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

    ReportPresence("shutdown", 0, true);

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

    LoadConfigJson();

    std::cout << "============================================================\n";
    std::cout << "       SLEEP OR DIE - NATIVE WINDOWS DESKTOP GUARD          \n";
    std::cout << "    Hardcore Biological Discipline & Night Curfew Enforcer  \n";
    std::cout << "============================================================\n";
    std::cout << " Target Bedtime: " << config.bedtimeHour << ":" << (config.bedtimeMinute < 10 ? "0" : "") << config.bedtimeMinute << "\n";
    std::cout << " Emergency Window: 30 seconds before HP runs out (100% -> 0%)\n";
    std::cout << " Lockdown Action: Windows Sign Out / LockWorkStation at T-15m\n";
    std::cout << " Monitoring active user presence via Win32 API...\n";
    std::cout << " Type 'SleepOrDieGuard.exe --test' to simulate 3-2-1 bedtime deadline.\n";
    std::cout << "------------------------------------------------------------\n\n";

    if (argc > 1 && std::string(argv[1]) == "--test") {
        RunSimulation321();
        return 0;
    }

    int tickCount = 0;
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

        // Stage transition alerts & physical enforcement
        if (newStage != currentStage) {
            currentStage = newStage;
            PlaySoundForStage(currentStage);

            if (currentStage == SleepStage::Alert) {
                ShowWindowsAlert(L"SleepOrDie เตือนเวลานอน", L"เหลือเวลา 30 นาทีก่อนถึงเส้นตาย เริ่มวางงานและพักสายตา", MB_ICONINFORMATION);
                ReportPresence("idle", (int)idleSeconds, false);
            } else if (currentStage == SleepStage::Lockdown) {
                ShowWindowsAlert(L"SleepOrDie ล็อคดาวน์ (Windows Sign Out)", L"เหลือเวลา 15 นาทีสุดท้าย! กำลังล็อคหน้าจอเพื่อให้ออกจากระบบทันที", MB_ICONWARNING);
                if (config.lockWorkstationOnLockdown) {
                    PrintConsoleUnicode(L"[LOCKDOWN ENFORCED] Windows Sign Out / LockWorkStation initiated!\n");
                    LockWorkStation(); // Native Windows Sign Out / Lock screen!
                }
                ReportPresence("offline", 900, true);
            } else if (currentStage == SleepStage::Sleep) {
                ShowWindowsAlert(L"SleepOrDie เลยเวลานอน", L"เลยเส้นตายแล้ว! มีเวลา 30 วินาทีก่อน HP หมดและเครื่องจะถูกปิดระบบ", MB_ICONERROR);
                ReportPresence("online", (int)idleSeconds, false);
            }
        }

        // Periodic presence heartbeat: detect if user complies and leaves PC (auto-confirms sleep)
        if (++tickCount % 5 == 0) {
            if (currentStage == SleepStage::Alert || currentStage == SleepStage::Lockdown || currentStage == SleepStage::Sleep) {
                if (idleSeconds >= (DWORD)config.idleThresholdSeconds) {
                    // User has not touched mouse/keyboard -> considered sleeping!
                    ReportPresence("offline", (int)idleSeconds, currentStage == SleepStage::Lockdown);
                } else if (idleSeconds < 10) {
                    // User is actively evading and typing
                    ReportPresence("online", (int)idleSeconds, false);
                }
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

        // Sleep for checkIntervalSeconds
        Sleep(config.checkIntervalSeconds * 1000);
    }

    return 0;
}
