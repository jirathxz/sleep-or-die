/**
 * SleepOrDie Native Windows Desktop Guard Daemon
 * Hardcore Biological Discipline & Night Curfew Enforcer
 *
 * Win32 System Tray & Lifecycle Enforcer:
 * - Shell_NotifyIconW: System Tray Icon with status tooltips & balloon alerts
 * - GetLastInputInfo: Detects keyboard/mouse evasion
 * - LockWorkStation: Enforces Lockdown at T-15m
 * - SetSuspendState: Puts PC to sleep upon 0% HP shutdown
 * - WinHTTP: Telemetry reporting to SleepOrDie API
 */

#define NOMINMAX
#define WIN32_LEAN_AND_MEAN
#include <windows.h>
#include <shellapi.h>
#include <mmsystem.h>
#include <winhttp.h>
#include <powrprof.h>
#include <algorithm>
#include <iostream>
#include <fstream>
#include <string>
#include <sstream>
#include <ctime>
#include <chrono>
#include <thread>
#include <atomic>

#pragma comment(lib, "user32.lib")
#pragma comment(lib, "shell32.lib")
#pragma comment(lib, "winmm.lib")
#pragma comment(lib, "winhttp.lib")
#pragma comment(lib, "powrprof.lib")

#define WM_TRAYICON (WM_USER + 101)
#define ID_TRAY_STATUS 2001
#define ID_TRAY_SIMULATE 2002
#define ID_TRAY_EXIT 2003

enum class SleepStage {
    Normal,
    Alert,      // T-30m
    Lockdown,   // T-15m (Windows Screen Lock)
    Sleep,      // Deadline Exceeded (30s emergency window)
    Shutdown    // HP 0% (Disciplinary PC Sleep / Suspend)
};

struct DaemonConfig {
    int bedtimeHour = 23;
    int bedtimeMinute = 15;
    int wakeUpHour = 7;
    int wakeUpMinute = 0;
    std::wstring apiHost = L"127.0.0.1";
    int apiPort = 8000;
    std::wstring apiPath = L"/api/presence/update";
    std::string discordUserId = "";
    int userId = 1;
    bool enableAudio = true;
    bool lockWorkstationOnLockdown = true;
    std::string enforceAction = "sleep"; // "sleep", "shutdown", "test_msgbox"
    bool antiEvasion = true;
    int idleThresholdSeconds = 60;
    int checkIntervalSeconds = 2;
    int currentHp = 100;
};

// Global daemon state
DaemonConfig config;
SleepStage currentStage = SleepStage::Normal;
NOTIFYICONDATAW g_nid = {};
HWND g_hWnd = NULL;
std::atomic<bool> g_simulationRunning(false);

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
    config.wakeUpHour = findInt("wake_up_hour", config.wakeUpHour);
    config.wakeUpMinute = findInt("wake_up_minute", config.wakeUpMinute);
    config.userId = findInt("user_id", config.userId);
    config.discordUserId = findString("discord_user_id", config.discordUserId);
    config.enforceAction = findString("enforce_action", config.enforceAction);
    config.idleThresholdSeconds = findInt("idle_threshold_seconds", config.idleThresholdSeconds);
    config.checkIntervalSeconds = findInt("check_interval_seconds", config.checkIntervalSeconds);

    if (content.find("\"lock_workstation_on_lockdown\": false") != std::string::npos) {
        config.lockWorkstationOnLockdown = false;
    }
    if (content.find("\"anti_evasion\": false") != std::string::npos) {
        config.antiEvasion = false;
    }
}

DWORD GetUserIdleSeconds() {
    LASTINPUTINFO lii;
    lii.cbSize = sizeof(LASTINPUTINFO);
    if (GetLastInputInfo(&lii)) {
        DWORD currentTick = GetTickCount();
        return (currentTick - lii.dwTime) / 1000;
    }
    return 0;
}

long GetSecondsUntilBedtime(int targetHour, int targetMin) {
    auto now = std::chrono::system_clock::now();
    std::time_t nowTime = std::chrono::system_clock::to_time_t(now);
    std::tm localTm;
    localtime_s(&localTm, &nowTime);

    int nowSeconds = localTm.tm_hour * 3600 + localTm.tm_min * 60 + localTm.tm_sec;
    int targetSeconds = targetHour * 3600 + targetMin * 60;

    long diff = targetSeconds - nowSeconds;

    if (diff < -43200) {
        diff += 86400;
    } else if (diff > 43200) {
        diff -= 86400;
    }

    return diff;
}

bool IsWithinCurfewHours() {
    auto now = std::chrono::system_clock::now();
    std::time_t nowTime = std::chrono::system_clock::to_time_t(now);
    std::tm localTm;
    localtime_s(&localTm, &nowTime);

    int nowMinutes = localTm.tm_hour * 60 + localTm.tm_min;
    int bedMinutes = config.bedtimeHour * 60 + config.bedtimeMinute;
    int alertMinutes = bedMinutes - 30;
    if (alertMinutes < 0) alertMinutes += 1440;
    int wakeMinutes = config.wakeUpHour * 60 + config.wakeUpMinute;

    if (alertMinutes > wakeMinutes) {
        return nowMinutes >= alertMinutes || nowMinutes <= wakeMinutes;
    } else {
        return nowMinutes >= alertMinutes && nowMinutes <= wakeMinutes;
    }
}

void PlaySoundForStage(SleepStage stage) {
    if (!config.enableAudio) return;

    switch (stage) {
        case SleepStage::Alert:
            Beep(587, 250);
            Sleep(80);
            Beep(880, 350);
            break;

        case SleepStage::Lockdown:
            Beep(440, 150);
            Sleep(100);
            Beep(440, 200);
            break;

        case SleepStage::Sleep:
            for (int i = 0; i < 3; ++i) {
                Beep(988, 120);
                Sleep(50);
                Beep(1318, 180);
                Sleep(60);
            }
            break;

        case SleepStage::Shutdown:
            Beep(659, 250);
            Beep(494, 250);
            Beep(330, 400);
            Beep(165, 700);
            break;

        default:
            break;
    }
}

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

void UpdateTrayTooltip(const std::wstring& tooltip) {
    wcsncpy_s(g_nid.szTip, tooltip.c_str(), _TRUNCATE);
    g_nid.uFlags = NIF_TIP;
    Shell_NotifyIconW(NIM_MODIFY, &g_nid);
}

void ShowTrayBalloon(const std::wstring& title, const std::wstring& message, DWORD infoFlags = NIIF_INFO) {
    g_nid.uFlags = NIF_INFO;
    wcsncpy_s(g_nid.szInfoTitle, title.c_str(), _TRUNCATE);
    wcsncpy_s(g_nid.szInfo, message.c_str(), _TRUNCATE);
    g_nid.dwInfoFlags = infoFlags;
    Shell_NotifyIconW(NIM_MODIFY, &g_nid);
}

void ExecuteFinalEnforcement() {
    ReportPresence("shutdown", 0, true);
    PlaySoundForStage(SleepStage::Shutdown);

    ShowTrayBalloon(L"SleepOrDie — 0% HP SHUTDOWN", L"หมดเวลาฉุกเฉินแล้ว! เริ่มดำเนินการสั่งพักระบบคอมพิวเตอร์", NIIF_ERROR);

    if (config.enforceAction == "sleep") {
        Sleep(2000);
        // SetSuspendState(bHibernate, bForce, bWakeupEventsDisabled)
        SetSuspendState(FALSE, FALSE, FALSE);
    } else if (config.enforceAction == "shutdown") {
        Sleep(2000);
        ExitWindowsEx(EWX_SHUTDOWN | EWX_FORCE, SHTDN_REASON_MAJOR_SYSTEM);
    } else {
        // Test Dialog mode
        MessageBoxW(
            NULL,
            L"🚨 [SleepOrDie: HARDCORE DISCIPLINARY SHUTDOWN]\n\n"
            L"พลังชีวิต (HP) ของคุณลดลงเหลือ 0% แล้ว!\n"
            L"หมดเวลาช่วงฉุกเฉิน 30 วินาที และเลยเส้นตายเข้านอน\n\n"
            L"[โหมดทดสอบ: จำลองคำสั่ง Shutdown สำเร็จ]\n"
            L"(ในโหมดปกติเครื่องจะถูกสั่ง SetSuspendState เข้าสู่โหมดสลีปทันที)",
            L"SleepOrDie — SYSTEM SHUTDOWN (0% HP)",
            MB_OK | MB_ICONERROR | MB_SYSTEMMODAL
        );
    }
}

void RunSimulation321() {
    if (g_simulationRunning) return;
    g_simulationRunning = true;

    std::thread([]() {
        ShowTrayBalloon(L"SleepOrDie จำลองการทดสอบ", L"เริ่มนับถอยหลัง 3 - 2 - 1 จำลองเส้นตายเข้านอน", NIIF_INFO);

        for (int sec = 3; sec >= 1; --sec) {
            Beep(587, 200);
            Sleep(1000);
        }

        ShowTrayBalloon(L"🚨 เลยเส้นตายเข้านอน!", L"เข้าสู่ช่วงฉุกเฉิน 30 วินาทีก่อน HP ลดเหลือ 0%!", NIIF_ERROR);
        PlaySoundForStage(SleepStage::Sleep);

        for (int sec = 30; sec >= 1; --sec) {
            int hp = (sec * 100) / 30;
            std::wstring tip = L"SleepOrDie - ฉุกเฉินเหลือ " + std::to_wstring(sec) + L"s (HP: " + std::to_wstring(hp) + L"%)";
            UpdateTrayTooltip(tip);
            Beep(1175, 120);
            Sleep(1000);
        }

        ExecuteFinalEnforcement();
        g_simulationRunning = false;
    }).detach();
}

LRESULT CALLBACK WndProc(HWND hWnd, UINT message, WPARAM wParam, LPARAM lParam) {
    switch (message) {
        case WM_TRAYICON: {
            if (LOWORD(lParam) == WM_RBUTTONUP || LOWORD(lParam) == WM_LBUTTONDBLCLK) {
                POINT pt;
                GetCursorPos(&pt);
                HMENU hMenu = CreatePopupMenu();

                long secLeft = GetSecondsUntilBedtime(config.bedtimeHour, config.bedtimeMinute);
                long hours = std::max(0L, secLeft / 3600);
                long mins = std::max(0L, (secLeft % 3600) / 60);

                std::wstring statusText = L"🛡️ SleepOrDie Guard (HP: " + std::to_wstring(config.currentHp) + L"%)";
                std::wstring timeText = L"⏱️ เวลานอนเป้าหมาย: " + std::to_wstring(config.bedtimeHour) + L":" + (config.bedtimeMinute < 10 ? L"0" : L"") + std::to_wstring(config.bedtimeMinute) + L" (เหลือ " + std::to_wstring(hours) + L"h " + std::to_wstring(mins) + L"m)";

                AppendMenuW(hMenu, MF_STRING | MF_GRAYED, 0, statusText.c_str());
                AppendMenuW(hMenu, MF_STRING | MF_GRAYED, 0, timeText.c_str());
                AppendMenuW(hMenu, MF_SEPARATOR, 0, NULL);
                AppendMenuW(hMenu, MF_STRING, ID_TRAY_STATUS, L"📊 ดูข้อมูลสถานะการนอน");
                AppendMenuW(hMenu, MF_STRING, ID_TRAY_SIMULATE, L"🧪 ทดสอบจำลองเส้นตาย 3-2-1");
                AppendMenuW(hMenu, MF_SEPARATOR, 0, NULL);
                AppendMenuW(hMenu, MF_STRING, ID_TRAY_EXIT, L"🚪 ออกจากโปรแกรม (Exit)");

                SetForegroundWindow(hWnd);
                int cmd = TrackPopupMenu(hMenu, TPM_RETURNCMD | TPM_NONOTIFY, pt.x, pt.y, 0, hWnd, NULL);
                DestroyMenu(hMenu);

                if (cmd == ID_TRAY_STATUS) {
                    std::wstring info = L"SleepOrDie Desktop Guard\n\n"
                                        L"• เวลานอนเป้าหมาย: " + std::to_wstring(config.bedtimeHour) + L":" + (config.bedtimeMinute < 10 ? L"0" : L"") + std::to_wstring(config.bedtimeMinute) + L" น.\n"
                                        L"• เวลาตื่นนอน: " + std::to_wstring(config.wakeUpHour) + L":" + (config.wakeUpMinute < 10 ? L"0" : L"") + std::to_wstring(config.wakeUpMinute) + L" น.\n"
                                        L"• ลำดับการทำงาน: Alert (T-30m) > Lockdown LockWorkStation (T-15m) > Sleep Deadline (T-0m) > Suspend\n"
                                        L"• พลังชีวิต (HP): " + std::to_wstring(config.currentHp) + L"%\n"
                                        L"• สถานะเคอร์ฟิว: " + (IsWithinCurfewHours() ? L"กำลังอยู่ในช่วงเคอร์ฟิวเข้านอน" : L"ช่วงเวลาปกติ");
                    MessageBoxW(hWnd, info.c_str(), L"สถานะระบบ SleepOrDie", MB_OK | MB_ICONINFORMATION);
                } else if (cmd == ID_TRAY_SIMULATE) {
                    RunSimulation321();
                } else if (cmd == ID_TRAY_EXIT) {
                    if (config.antiEvasion && IsWithinCurfewHours()) {
                        MessageBoxW(hWnd, L"⚠️ ไม่อนุญาตให้ออกจากโปรแกรมในช่วงเคอร์ฟิวเวลานอน!\n\nระบบวินัย SleepOrDie เปิดใช้งานการป้องกัน Anti-Evasion กรุณาปฏิบัติตามวินัยการพักผ่อน", L"Anti-Evasion Enforced", MB_OK | MB_ICONWARNING | MB_SYSTEMMODAL);
                        ReportPresence("online", (int)GetUserIdleSeconds(), false);
                    } else {
                        Shell_NotifyIconW(NIM_DELETE, &g_nid);
                        PostQuitMessage(0);
                    }
                }
            }
            break;
        }
        case WM_DESTROY:
            Shell_NotifyIconW(NIM_DELETE, &g_nid);
            PostQuitMessage(0);
            break;
        default:
            return DefWindowProcW(hWnd, message, wParam, lParam);
    }
    return 0;
}

void DaemonLoop() {
    int tickCount = 0;

    while (true) {
        if (g_simulationRunning) {
            Sleep(1000);
            continue;
        }

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

        // Update Tray Tooltip
        long hoursLeft = std::max(0L, secondsRemaining / 3600);
        long minsLeft = std::max(0L, (secondsRemaining % 3600) / 60);
        std::wstring tip = L"SleepOrDie: " + std::to_wstring(hoursLeft) + L"h " + std::to_wstring(minsLeft) + L"m to Bedtime | HP: " + std::to_wstring(config.currentHp) + L"%";
        UpdateTrayTooltip(tip);

        // Stage transition events
        if (newStage != currentStage) {
            currentStage = newStage;
            PlaySoundForStage(currentStage);

            if (currentStage == SleepStage::Alert) {
                ShowTrayBalloon(L"SleepOrDie เตือนเวลานอน (T-30m)", L"เหลือเวลา 30 นาทีก่อนถึงเส้นตาย กรุณาเริ่มวางงานและเตรียมตัวเข้านอน", NIIF_INFO);
                ReportPresence("idle", (int)idleSeconds, false);
            } else if (currentStage == SleepStage::Lockdown) {
                ShowTrayBalloon(L"SleepOrDie ล็อคดาวน์ (T-15m)", L"เหลือเวลา 15 นาทีสุดท้าย! บังคับล็อกหน้าจอ Windows ออกจากระบบทันที", NIIF_WARNING);
                if (config.lockWorkstationOnLockdown) {
                    LockWorkStation();
                }
                ReportPresence("offline", 900, true);
            } else if (currentStage == SleepStage::Sleep) {
                ShowTrayBalloon(L"🚨 SleepOrDie ถึงเส้นตายเข้านอน!", L"เลยเส้นตายแล้ว! มีเวลา 30 วินาทีฉุกเฉินก่อนเครื่องจะเข้าสู่โหมดพักระบบ", NIIF_ERROR);
                ReportPresence("online", (int)idleSeconds, false);
            }
        }

        // Emergency countdown if past deadline
        if (currentStage == SleepStage::Sleep) {
            long secondsPast = -secondsRemaining;
            long emergencySecondsLeft = std::max(0L, 30L - secondsPast);
            config.currentHp = std::max(0, (int)((emergencySecondsLeft * 100) / 30));

            PlaySoundForStage(SleepStage::Sleep);

            if (emergencySecondsLeft <= 0 || config.currentHp <= 0) {
                currentStage = SleepStage::Shutdown;
                ExecuteFinalEnforcement();
                break;
            }
        }

        // Periodic presence sync
        if (++tickCount % 5 == 0) {
            if (currentStage != SleepStage::Normal) {
                if (idleSeconds >= (DWORD)config.idleThresholdSeconds) {
                    ReportPresence("offline", (int)idleSeconds, currentStage == SleepStage::Lockdown);
                } else if (idleSeconds < 10) {
                    ReportPresence("online", (int)idleSeconds, false);
                }
            }
        }

        Sleep(config.checkIntervalSeconds * 1000);
    }
}

int WINAPI WinMain(HINSTANCE hInstance, HINSTANCE hPrevInstance, LPSTR lpCmdLine, int nCmdShow) {
    LoadConfigJson();

    std::string cmd = lpCmdLine ? lpCmdLine : "";
    if (cmd.find("--test") != std::string::npos) {
        // Run standalone test simulation
        RunSimulation321();
        Sleep(35000);
        return 0;
    }

    // Register hidden window class for System Tray message loop
    WNDCLASSEXW wcex = {};
    wcex.cbSize = sizeof(WNDCLASSEXW);
    wcex.lpfnWndProc = WndProc;
    wcex.hInstance = hInstance;
    wcex.lpszClassName = L"SleepOrDieGuardTrayClass";

    RegisterClassExW(&wcex);

    g_hWnd = CreateWindowExW(0, L"SleepOrDieGuardTrayClass", L"SleepOrDie Guard", 0, 0, 0, 0, 0, NULL, NULL, hInstance, NULL);
    if (!g_hWnd) {
        return 1;
    }

    // Initialize System Tray Icon
    g_nid.cbSize = sizeof(NOTIFYICONDATAW);
    g_nid.hWnd = g_hWnd;
    g_nid.uID = 1;
    g_nid.uFlags = NIF_MESSAGE | NIF_ICON | NIF_TIP | NIF_INFO;
    g_nid.uCallbackMessage = WM_TRAYICON;
    g_nid.hIcon = LoadIcon(NULL, IDI_SHIELD);
    wcsncpy_s(g_nid.szTip, L"SleepOrDie Desktop Guard — สแตนด์บาย", _TRUNCATE);

    Shell_NotifyIconW(NIM_ADD, &g_nid);

    // Initial greeting balloon
    ShowTrayBalloon(L"SleepOrDie Desktop Guard", L"ระบบเริ่มทำงานเงียบ ๆ บน System Tray เฝ้าระวังวินัยเวลานอน", NIIF_INFO);

    // Launch daemon evaluation loop on worker thread
    std::thread daemonThread(DaemonLoop);
    daemonThread.detach();

    // Standard Win32 Message Loop
    MSG msg;
    while (GetMessageW(&msg, NULL, 0, 0)) {
        TranslateMessage(&msg);
        DispatchMessageW(&msg);
    }

    Shell_NotifyIconW(NIM_DELETE, &g_nid);
    return (int)msg.wParam;
}

// Fallback main for console compilation
int main(int argc, char* argv[]) {
    // Hide console window if run from explorer
    HWND hConsole = GetConsoleWindow();
    if (hConsole) {
        if (argc <= 1 || std::string(argv[1]) != "--console") {
            ShowWindow(hConsole, SW_HIDE);
        }
    }
    return WinMain(GetModuleHandle(NULL), NULL, GetCommandLineA(), SW_HIDE);
}
