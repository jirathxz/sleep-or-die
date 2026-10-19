/**
 * SleepOrDie Native Windows Desktop Guard Daemon
 * Hardcore Biological Discipline & Night Curfew Enforcer
 *
 * Win32 System Tray & Lifecycle Enforcer:
 * - Shell_NotifyIconW: System Tray Icon with status tooltips & balloon alerts
 * - Win32 Login Dialog: Authentication against SleepOrDie API
 * - GetLastInputInfo: Detects keyboard/mouse evasion
 * - LockWorkStation: Enforces Lockdown at T-15m
 * - SetSuspendState: Puts PC to sleep upon 0% HP shutdown
 * - WinHTTP: Telemetry reporting and config sync with SleepOrDie API
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
#pragma comment(lib, "gdi32.lib")
#pragma comment(lib, "shell32.lib")
#pragma comment(lib, "winmm.lib")
#pragma comment(lib, "winhttp.lib")
#pragma comment(lib, "powrprof.lib")

#define WM_TRAYICON (WM_USER + 101)
#define ID_TRAY_STATUS 2001
#define ID_TRAY_SIMULATE 2002
#define ID_TRAY_TEST_SLEEP 2005
#define ID_TRAY_LOGIN 2003
#define ID_TRAY_EXIT 2004

#define IDC_DLG_EMAIL 3001
#define IDC_DLG_PASSWORD 3002
#define IDC_DLG_BTN_LOGIN 3003
#define IDC_DLG_BTN_CANCEL 3004
#define IDC_DLG_STATUS 3005

enum class SleepStage {
    Normal,
    Alert,          // T-10m: แจ้งเตือนธรรมดา
    Lockdown,       // T-5m: Lockdown (MSGBOX จำลอง)
    SleepWarning,   // T-2m: Windows Sleep Mode (MSGBOX จำลอง)
    Sleep,          // T-0m: ถึงเวลานอน เริ่มนับถอยหลังฉุกเฉิน
    Shutdown        // HP 0%: Shutdown (MSGBOX จำลอง)
};

struct DaemonConfig {
    int bedtimeHour = 23;
    int bedtimeMinute = 15;
    int wakeUpHour = 7;
    int wakeUpMinute = 0;
    int emergencyCountdownSeconds = 60;
    std::wstring apiHost = L"127.0.0.1";
    int apiPort = 8000;
    std::wstring apiPath = L"/api/presence/update";
    std::string discordUserId = "";
    int userId = 0;
    std::string authToken = "";
    std::string userEmail = "";
    bool enableAudio = true;
    bool lockWorkstationOnLockdown = true;
    std::string enforceAction = "sleep"; // "sleep", "shutdown", "test_msgbox"
    bool antiEvasion = true;
    int idleThresholdSeconds = 60;
    int checkIntervalSeconds = 2;
    int currentHp = 100;
    bool enableDiscordDetection = true;
    bool enableCppDetection = true;
    bool isSystemActive = true;
};

// Global daemon state
DaemonConfig config;
SleepStage currentStage = SleepStage::Normal;
NOTIFYICONDATAW g_nid = {};
HWND g_hWnd = NULL;
std::atomic<bool> g_simulationRunning(false);
std::atomic<bool> g_simulatedSleeping(false);

void SaveConfigJson() {
    std::ofstream file("config.json");
    if (!file.is_open()) return;
    file << "{\n";
    file << "  \"bedtime_hour\": " << config.bedtimeHour << ",\n";
    file << "  \"bedtime_minute\": " << config.bedtimeMinute << ",\n";
    file << "  \"wake_up_hour\": " << config.wakeUpHour << ",\n";
    file << "  \"wake_up_minute\": " << config.wakeUpMinute << ",\n";
    file << "  \"emergency_countdown_seconds\": " << config.emergencyCountdownSeconds << ",\n";
    file << "  \"api_url\": \"http://127.0.0.1:8000/api/presence/update\",\n";
    file << "  \"discord_user_id\": \"" << config.discordUserId << "\",\n";
    file << "  \"user_id\": " << config.userId << ",\n";
    file << "  \"auth_token\": \"" << config.authToken << "\",\n";
    file << "  \"email\": \"" << config.userEmail << "\",\n";
    file << "  \"enable_audio\": " << (config.enableAudio ? "true" : "false") << ",\n";
    file << "  \"lock_workstation_on_lockdown\": " << (config.lockWorkstationOnLockdown ? "true" : "false") << ",\n";
    file << "  \"enforce_action\": \"" << config.enforceAction << "\",\n";
    file << "  \"anti_evasion\": " << (config.antiEvasion ? "true" : "false") << ",\n";
    file << "  \"idle_threshold_seconds\": " << config.idleThresholdSeconds << ",\n";
    file << "  \"check_interval_seconds\": " << config.checkIntervalSeconds << "\n";
    file << "}\n";
    file.close();
}

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
    config.emergencyCountdownSeconds = findInt("emergency_countdown_seconds", config.emergencyCountdownSeconds);
    config.userId = findInt("user_id", config.userId);
    config.authToken = findString("auth_token", config.authToken);
    config.userEmail = findString("email", config.userEmail);
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

        case SleepStage::SleepWarning:
            Beep(659, 150);
            Sleep(80);
            Beep(587, 200);
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

bool SendHttpJson(const std::wstring& host, int port, const std::wstring& path, const std::string& jsonPayload, std::string& responseOut, DWORD& statusCodeOut) {
    statusCodeOut = 0;
    responseOut.clear();
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

    if (bResults) {
        DWORD statusCode = 0;
        DWORD statusSize = sizeof(statusCode);
        WinHttpQueryHeaders(hRequest, WINHTTP_QUERY_STATUS_CODE | WINHTTP_QUERY_FLAG_NUMBER, WINHTTP_HEADER_NAME_BY_INDEX, &statusCode, &statusSize, WINHTTP_NO_HEADER_INDEX);
        statusCodeOut = statusCode;

        DWORD dwSize = 0;
        do {
            dwSize = 0;
            if (!WinHttpQueryDataAvailable(hRequest, &dwSize)) break;
            if (dwSize == 0) break;
            std::string buffer(dwSize, 0);
            DWORD dwDownloaded = 0;
            if (WinHttpReadData(hRequest, &buffer[0], dwSize, &dwDownloaded)) {
                responseOut.append(buffer.c_str(), dwDownloaded);
            }
        } while (dwSize > 0);
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
        std::string resp;
        DWORD code = 0;
        if (SendHttpJson(config.apiHost, config.apiPort, config.apiPath, json, resp, code)) {
            // Check if response contains updated countdown
            size_t pos = resp.find("\"emergency_countdown_seconds\"");
            if (pos != std::string::npos) {
                size_t colon = resp.find(":", pos);
                if (colon != std::string::npos) {
                    size_t start = resp.find_first_of("0123456789", colon);
                    if (start != std::string::npos) {
                        try {
                            int sec = std::stoi(resp.substr(start));
                            if (sec >= 10 && sec <= 300) {
                                config.emergencyCountdownSeconds = sec;
                            }
                        } catch (...) {}
                    }
                }
            }
        }
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

void ReportPresenceTestSleep(bool sleeping) {
    std::string json = "{\"source\":\"desktop_daemon\",\"status\":\"" + std::string(sleeping ? "offline" : "online") + "\",\"idle_seconds\":" + (sleeping ? "3600" : "0") + ",\"screen_locked\":" + (sleeping ? "true" : "false") + ",\"simulate_sleep\":" + (sleeping ? "true" : "false") + ",\"wake_up_simulation\":" + (sleeping ? "false" : "true");
    if (!config.discordUserId.empty()) {
        json += ",\"discord_user_id\":\"" + config.discordUserId + "\"";
    }
    if (config.userId > 0) {
        json += ",\"user_id\":" + std::to_string(config.userId);
    }
    json += "}";

    std::thread([json, sleeping]() {
        std::string resp;
        DWORD code = 0;
        if (SendHttpJson(config.apiHost, config.apiPort, config.apiPath, json, resp, code)) {
            if (sleeping) {
                ShowTrayBalloon(L"SleepOrDie ทดสอบเข้านอน", L"ส่งสัญญาณจำลองสถานะนอนแล้ว (Sleep) เรียบร้อย", NIIF_INFO);
            } else {
                ShowTrayBalloon(L"SleepOrDie ทดสอบตื่นนอน", L"ส่งสัญญาณจำลองสถานะตื่น (Awake) เรียบร้อย", NIIF_INFO);
            }
        }
    }).detach();
}

void ExecuteFinalEnforcement() {
    ReportPresence("shutdown", 0, true);
    PlaySoundForStage(SleepStage::Shutdown);

    ShowTrayBalloon(L"SleepOrDie — 0% HP SHUTDOWN", L"ถึงเวลานอนที่ตั้งไว้และหมดเวลาฉุกเฉินแล้ว! เริ่มดำเนินการ Shutdown (จำลอง)", NIIF_ERROR);

    MessageBoxW(
        NULL,
        L"💀 [SleepOrDie: HARDCORE SHUTDOWN WARNING]\n\n"
        L"ถึงเวลานอนที่ตั้งไว้แล้ว และหมดเวลาผ่อนผันฉุกเฉิน!\n"
        L"พลังชีวิต (HP) ของคุณลดลงเหลือ 0% แล้ว\n\n"
        L"[ระบบจำลอง: แสดงแจ้งเตือน Shutdown สำเร็จโดยไม่ปิดเครื่องจริง]",
        L"SleepOrDie — SHUTDOWN (Mock 0% HP)",
        MB_OK | MB_ICONERROR | MB_SYSTEMMODAL
    );
}

void RunSimulation321() {
    if (g_simulationRunning) return;
    g_simulationRunning = true;

    std::thread([]() {
        ShowTrayBalloon(L"SleepOrDie จำลองการทดสอบ", L"เริ่มจำลองลำดับ 1.Alert(T-10m) > 2.Lockdown(T-5m) > 3.Sleep(T-2m) > 4.Shutdown", NIIF_INFO);

        // 1. Alert (T-10m)
        ShowTrayBalloon(L"1/4. SleepOrDie Alert (T-10m)", L"แจ้งเตือนให้นอนตามปกติ (Alert ธรรมดา)", NIIF_INFO);
        PlaySoundForStage(SleepStage::Alert);
        Sleep(2000);

        // 2. Lockdown (T-5m) Mock MSGBOX
        PlaySoundForStage(SleepStage::Lockdown);
        MessageBoxW(
            NULL,
            L"🚨 [ขั้นตอน 2/4: จำลอง LOCKDOWN (T-5m)]\n\n"
            L"หากผู้ใช้ยังไม่ยอมนอน ระบบเข้าสู่โหมด Lockdown\n\n"
            L"[โหมดจำลอง: แสดงแจ้งเตือนโดยไม่ล็อกหน้าจอจริง]\n"
            L"กด OK เพื่อดูขั้นตอนถัดไป",
            L"SleepOrDie Lockdown (Mock)",
            MB_OK | MB_ICONWARNING | MB_SYSTEMMODAL
        );

        // 3. Windows Sleep Mode (T-2m) Mock MSGBOX
        PlaySoundForStage(SleepStage::SleepWarning);
        MessageBoxW(
            NULL,
            L"⚠️ [ขั้นตอน 3/4: จำลอง WINDOWS SLEEP MODE (T-2m)]\n\n"
            L"หากฝ่าฝืนอีก ระบบจะเข้าสู่ Windows Sleep Mode\n\n"
            L"[โหมดจำลอง: แสดงแจ้งเตือนโดยไม่สลีปเครื่องจริง]\n"
            L"กด OK เพื่อดูขั้นตอนนับถอยหลังฉุกเฉินและ Shutdown",
            L"SleepOrDie Sleep Mode (Mock)",
            MB_OK | MB_ICONWARNING | MB_SYSTEMMODAL
        );

        // 4. Emergency Countdown before Shutdown
        int countdown = 5; // Fast demo countdown 5s
        ShowTrayBalloon(L"🚨 ถึงเวลานอนที่ตั้งไว้!", L"เริ่มช่วงนับถอยหลังฉุกเฉินก่อน Shutdown", NIIF_ERROR);
        PlaySoundForStage(SleepStage::Sleep);

        for (int sec = countdown; sec >= 1; --sec) {
            int hp = (sec * 100) / countdown;
            std::wstring tip = L"SleepOrDie - ฉุกเฉินเหลือ " + std::to_wstring(sec) + L"s (HP: " + std::to_wstring(hp) + L"%)";
            UpdateTrayTooltip(tip);
            Beep(1175, 120);
            Sleep(1000);
        }

        // 5. Final Shutdown Mock MSGBOX
        ExecuteFinalEnforcement();
        g_simulationRunning = false;
    }).detach();
}

struct LoginDialogState {
    bool success = false;
    HWND hEditEmail = NULL;
    HWND hEditPassword = NULL;
    HWND hBtnLogin = NULL;
    HWND hBtnCancel = NULL;
    HWND hStatus = NULL;
    HFONT hFont = NULL;
};

LRESULT CALLBACK LoginDialogWndProc(HWND hWnd, UINT msg, WPARAM wParam, LPARAM lParam) {
    LoginDialogState* pState = (LoginDialogState*)GetWindowLongPtrW(hWnd, GWLP_USERDATA);

    switch (msg) {
        case WM_CREATE: {
            CREATESTRUCTW* pCS = (CREATESTRUCTW*)lParam;
            pState = (LoginDialogState*)pCS->lpCreateParams;
            SetWindowLongPtrW(hWnd, GWLP_USERDATA, (LONG_PTR)pState);

            HFONT hFont = (HFONT)GetStockObject(DEFAULT_GUI_FONT);
            pState->hFont = hFont;

            HWND hLblHeader = CreateWindowExW(0, L"STATIC", L"🔒 เข้าสู่ระบบ SleepOrDie Guard", WS_CHILD | WS_VISIBLE | SS_LEFT, 20, 15, 360, 24, hWnd, NULL, pCS->hInstance, NULL);
            SendMessageW(hLblHeader, WM_SETFONT, (WPARAM)hFont, TRUE);

            HWND hLblSub = CreateWindowExW(0, L"STATIC", L"กรุณากรอก Email และ Password เดียวกับบัญชีบนเว็บ", WS_CHILD | WS_VISIBLE | SS_LEFT, 20, 42, 360, 20, hWnd, NULL, pCS->hInstance, NULL);
            SendMessageW(hLblSub, WM_SETFONT, (WPARAM)hFont, TRUE);

            HWND hLblEmail = CreateWindowExW(0, L"STATIC", L"อีเมล (Email):", WS_CHILD | WS_VISIBLE | SS_LEFT, 20, 75, 360, 18, hWnd, NULL, pCS->hInstance, NULL);
            SendMessageW(hLblEmail, WM_SETFONT, (WPARAM)hFont, TRUE);

            pState->hEditEmail = CreateWindowExW(WS_EX_CLIENTEDGE, L"EDIT", L"", WS_CHILD | WS_VISIBLE | WS_TABSTOP | ES_AUTOHSCROLL, 20, 95, 350, 26, hWnd, (HMENU)IDC_DLG_EMAIL, pCS->hInstance, NULL);
            SendMessageW(pState->hEditEmail, WM_SETFONT, (WPARAM)hFont, TRUE);
            if (!config.userEmail.empty()) {
                int wlen = MultiByteToWideChar(CP_UTF8, 0, config.userEmail.c_str(), -1, NULL, 0);
                std::wstring wEmail(wlen, 0);
                MultiByteToWideChar(CP_UTF8, 0, config.userEmail.c_str(), -1, &wEmail[0], wlen);
                SetWindowTextW(pState->hEditEmail, wEmail.c_str());
            }

            HWND hLblPass = CreateWindowExW(0, L"STATIC", L"รหัสผ่าน (Password):", WS_CHILD | WS_VISIBLE | SS_LEFT, 20, 130, 360, 18, hWnd, NULL, pCS->hInstance, NULL);
            SendMessageW(hLblPass, WM_SETFONT, (WPARAM)hFont, TRUE);

            pState->hEditPassword = CreateWindowExW(WS_EX_CLIENTEDGE, L"EDIT", L"", WS_CHILD | WS_VISIBLE | WS_TABSTOP | ES_PASSWORD | ES_AUTOHSCROLL, 20, 150, 350, 26, hWnd, (HMENU)IDC_DLG_PASSWORD, pCS->hInstance, NULL);
            SendMessageW(pState->hEditPassword, WM_SETFONT, (WPARAM)hFont, TRUE);

            pState->hStatus = CreateWindowExW(0, L"STATIC", L"", WS_CHILD | WS_VISIBLE | SS_LEFT, 20, 185, 350, 35, hWnd, (HMENU)IDC_DLG_STATUS, pCS->hInstance, NULL);
            SendMessageW(pState->hStatus, WM_SETFONT, (WPARAM)hFont, TRUE);

            pState->hBtnLogin = CreateWindowExW(0, L"BUTTON", L"เข้าสู่ระบบ (Login)", WS_CHILD | WS_VISIBLE | WS_TABSTOP | BS_DEFPUSHBUTTON, 150, 230, 120, 30, hWnd, (HMENU)IDC_DLG_BTN_LOGIN, pCS->hInstance, NULL);
            SendMessageW(pState->hBtnLogin, WM_SETFONT, (WPARAM)hFont, TRUE);

            pState->hBtnCancel = CreateWindowExW(0, L"BUTTON", L"ยกเลิก", WS_CHILD | WS_VISIBLE | WS_TABSTOP | BS_PUSHBUTTON, 280, 230, 90, 30, hWnd, (HMENU)IDC_DLG_BTN_CANCEL, pCS->hInstance, NULL);
            SendMessageW(pState->hBtnCancel, WM_SETFONT, (WPARAM)hFont, TRUE);

            SetFocus(config.userEmail.empty() ? pState->hEditEmail : pState->hEditPassword);
            return 0;
        }
        case WM_COMMAND: {
            int wmId = LOWORD(wParam);
            if (wmId == IDC_DLG_BTN_CANCEL) {
                pState->success = false;
                DestroyWindow(hWnd);
                return 0;
            }
            if (wmId == IDC_DLG_BTN_LOGIN) {
                wchar_t szEmail[256] = {};
                wchar_t szPass[256] = {};
                GetWindowTextW(pState->hEditEmail, szEmail, 255);
                GetWindowTextW(pState->hEditPassword, szPass, 255);

                if (wcslen(szEmail) == 0 || wcslen(szPass) == 0) {
                    SetWindowTextW(pState->hStatus, L"⚠️ กรุณากรอกอีเมลและรหัสผ่านให้ครบถ้วน");
                    return 0;
                }

                SetWindowTextW(pState->hStatus, L"⏳ กำลังตรวจสอบข้อมูลเข้าสู่ระบบ...");
                EnableWindow(pState->hBtnLogin, FALSE);
                UpdateWindow(hWnd);

                int emailLen = WideCharToMultiByte(CP_UTF8, 0, szEmail, -1, NULL, 0, NULL, NULL);
                std::string sEmail(emailLen - 1, 0);
                WideCharToMultiByte(CP_UTF8, 0, szEmail, -1, &sEmail[0], emailLen, NULL, NULL);

                int passLen = WideCharToMultiByte(CP_UTF8, 0, szPass, -1, NULL, 0, NULL, NULL);
                std::string sPass(passLen - 1, 0);
                WideCharToMultiByte(CP_UTF8, 0, szPass, -1, &sPass[0], passLen, NULL, NULL);

                std::string jsonReq = "{\"email\":\"" + sEmail + "\",\"password\":\"" + sPass + "\"}";
                std::string resp;
                DWORD statusCode = 0;

                bool sent = SendHttpJson(config.apiHost, config.apiPort, L"/api/daemon/login", jsonReq, resp, statusCode);
                if (sent && statusCode == 200) {
                    auto findInt = [&](const std::string& key, int defaultVal) -> int {
                        size_t pos = resp.find("\"" + key + "\"");
                        if (pos == std::string::npos) return defaultVal;
                        size_t colon = resp.find(":", pos);
                        if (colon == std::string::npos) return defaultVal;
                        size_t start = resp.find_first_of("0123456789", colon);
                        if (start == std::string::npos) return defaultVal;
                        try { return std::stoi(resp.substr(start)); } catch (...) { return defaultVal; }
                    };
                    auto findString = [&](const std::string& key, const std::string& defaultVal) -> std::string {
                        size_t pos = resp.find("\"" + key + "\"");
                        if (pos == std::string::npos) return defaultVal;
                        size_t colon = resp.find(":", pos);
                        if (colon == std::string::npos) return defaultVal;
                        size_t firstQuote = resp.find("\"", colon);
                        if (firstQuote == std::string::npos) return defaultVal;
                        size_t secondQuote = resp.find("\"", firstQuote + 1);
                        if (secondQuote == std::string::npos) return defaultVal;
                        return resp.substr(firstQuote + 1, secondQuote - firstQuote - 1);
                    };

                    config.userId = findInt("user_id", config.userId);
                    config.emergencyCountdownSeconds = findInt("emergency_countdown_seconds", config.emergencyCountdownSeconds);
                    config.bedtimeHour = findInt("bedtime_hour", config.bedtimeHour);
                    config.bedtimeMinute = findInt("bedtime_minute", config.bedtimeMinute);
                    config.wakeUpHour = findInt("wake_up_hour", config.wakeUpHour);
                    config.wakeUpMinute = findInt("wake_up_minute", config.wakeUpMinute);
                    config.authToken = findString("token", config.authToken);
                    config.userEmail = sEmail;

                    SaveConfigJson();
                    pState->success = true;
                    DestroyWindow(hWnd);
                    return 0;
                } else {
                    EnableWindow(pState->hBtnLogin, TRUE);
                    if (statusCode == 401) {
                        SetWindowTextW(pState->hStatus, L"❌ อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่");
                    } else {
                        std::wstring err = L"❌ ไม่สามารถเชื่อมต่อ API ได้ (HTTP " + std::to_wstring(statusCode) + L")";
                        SetWindowTextW(pState->hStatus, err.c_str());
                    }
                    return 0;
                }
            }
            break;
        }
        case WM_CLOSE: {
            pState->success = false;
            DestroyWindow(hWnd);
            return 0;
        }
        case WM_DESTROY: {
            PostQuitMessage(0);
            return 0;
        }
        default:
            return DefWindowProcW(hWnd, msg, wParam, lParam);
    }
    return 0;
}

bool PromptLoginDialog(HWND hParent) {
    HINSTANCE hInstance = GetModuleHandle(NULL);
    WNDCLASSEXW wc = {};
    wc.cbSize = sizeof(WNDCLASSEXW);
    wc.lpfnWndProc = LoginDialogWndProc;
    wc.hInstance = hInstance;
    wc.lpszClassName = L"SleepOrDieLoginDialogClass";
    wc.hCursor = LoadCursor(NULL, IDC_ARROW);
    wc.hbrBackground = (HBRUSH)(COLOR_WINDOW + 1);

    RegisterClassExW(&wc);

    LoginDialogState state;

    int screenW = GetSystemMetrics(SM_CXSCREEN);
    int screenH = GetSystemMetrics(SM_CYSCREEN);
    int dlgW = 410;
    int dlgH = 320;
    int posX = (screenW - dlgW) / 2;
    int posY = (screenH - dlgH) / 2;

    HWND hDlg = CreateWindowExW(
        WS_EX_DLGMODALFRAME | WS_EX_TOPMOST,
        L"SleepOrDieLoginDialogClass",
        L"เข้าสู่ระบบ SleepOrDie Desktop Guard",
        WS_POPUP | WS_CAPTION | WS_SYSMENU | WS_VISIBLE,
        posX, posY, dlgW, dlgH,
        hParent, NULL, hInstance, &state
    );

    if (!hDlg) return false;

    if (hParent) EnableWindow(hParent, FALSE);

    MSG msg;
    while (IsWindow(hDlg) && GetMessageW(&msg, NULL, 0, 0)) {
        if (msg.message == WM_KEYDOWN && msg.wParam == VK_RETURN) {
            SendMessageW(hDlg, WM_COMMAND, MAKEWPARAM(IDC_DLG_BTN_LOGIN, BN_CLICKED), 0);
            continue;
        }
        if (msg.message == WM_KEYDOWN && msg.wParam == VK_ESCAPE) {
            SendMessageW(hDlg, WM_COMMAND, MAKEWPARAM(IDC_DLG_BTN_CANCEL, BN_CLICKED), 0);
            continue;
        }
        TranslateMessage(&msg);
        DispatchMessageW(&msg);
    }

    if (hParent) {
        EnableWindow(hParent, TRUE);
        SetForegroundWindow(hParent);
    }

    UnregisterClassW(L"SleepOrDieLoginDialogClass", hInstance);
    return state.success;
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

                std::wstring testSleepText = g_simulatedSleeping.load()
                    ? L"☀️ ทดสอบ: ยกเลิกโหมดจำลองนอน (Wake Up)"
                    : L"🌙 ทดสอบ: จำลองสถานะนอนแล้ว (Test Sleep)";
                AppendMenuW(hMenu, MF_STRING, ID_TRAY_TEST_SLEEP, testSleepText.c_str());

                AppendMenuW(hMenu, MF_STRING, ID_TRAY_SIMULATE, L"🧪 ทดสอบจำลองเส้นตาย 3-2-1");
                AppendMenuW(hMenu, MF_STRING, ID_TRAY_LOGIN, L"🔑 เข้าสู่ระบบใหม่ (Switch User)");
                AppendMenuW(hMenu, MF_SEPARATOR, 0, NULL);
                AppendMenuW(hMenu, MF_STRING, ID_TRAY_EXIT, L"🚪 ออกจากโปรแกรม (Exit)");

                SetForegroundWindow(hWnd);
                int cmd = TrackPopupMenu(hMenu, TPM_RETURNCMD | TPM_NONOTIFY, pt.x, pt.y, 0, hWnd, NULL);
                DestroyMenu(hMenu);

                if (cmd == ID_TRAY_STATUS) {
                    int wlen = MultiByteToWideChar(CP_UTF8, 0, config.userEmail.c_str(), -1, NULL, 0);
                    std::wstring wEmail = (wlen > 1) ? std::wstring(wlen - 1, 0) : L"(ยังไม่ล็อกอิน)";
                    if (wlen > 1) {
                        MultiByteToWideChar(CP_UTF8, 0, config.userEmail.c_str(), -1, &wEmail[0], wlen);
                    }

                    std::wstring info = L"SleepOrDie Desktop Guard\n\n"
                                        L"• บัญชีผู้ใช้: " + wEmail + L"\n"
                                        L"• เวลานอนเป้าหมาย: " + std::to_wstring(config.bedtimeHour) + L":" + (config.bedtimeMinute < 10 ? L"0" : L"") + std::to_wstring(config.bedtimeMinute) + L" น.\n"
                                        L"• เวลาตื่นนอน: " + std::to_wstring(config.wakeUpHour) + L":" + (config.wakeUpMinute < 10 ? L"0" : L"") + std::to_wstring(config.wakeUpMinute) + L" น.\n"
                                        L"• เวลานับถอยหลังฉุกเฉิน: " + std::to_wstring(config.emergencyCountdownSeconds) + L" วินาที\n"
                                        L"• พลังชีวิต (HP): " + std::to_wstring(config.currentHp) + L"%\n"
                                        L"• โหมดทดสอบจำลองนอน: " + (g_simulatedSleeping.load() ? L"เปิดใช้งานอยู่ (Simulated Sleeping)" : L"ไม่ได้เปิด") + L"\n"
                                        L"• สถานะเคอร์ฟิว: " + (IsWithinCurfewHours() ? L"กำลังอยู่ในช่วงเคอร์ฟิวเข้านอน" : L"ช่วงเวลาปกติ");
                    MessageBoxW(hWnd, info.c_str(), L"สถานะระบบ SleepOrDie", MB_OK | MB_ICONINFORMATION);
                } else if (cmd == ID_TRAY_TEST_SLEEP) {
                    bool sleeping = !g_simulatedSleeping.load();
                    g_simulatedSleeping.store(sleeping);
                    ReportPresenceTestSleep(sleeping);
                } else if (cmd == ID_TRAY_SIMULATE) {
                    RunSimulation321();
                } else if (cmd == ID_TRAY_LOGIN) {
                    if (PromptLoginDialog(hWnd)) {
                        ShowTrayBalloon(L"SleepOrDie", L"เข้าสู่ระบบใหม่สำเร็จ บันทึกการตั้งค่าเรียบร้อยแล้ว", NIIF_INFO);
                    }
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

        if (g_simulatedSleeping.load()) {
            std::wstring tip = L"SleepOrDie: โหมดจำลองว่านอนแล้ว (Test Sleeping) | HP: " + std::to_wstring(config.currentHp) + L"%";
            UpdateTrayTooltip(tip);
            Sleep(2000);
            continue;
        }

        long secondsRemaining = GetSecondsUntilBedtime(config.bedtimeHour, config.bedtimeMinute);
        DWORD idleSeconds = GetUserIdleSeconds();
        SleepStage newStage = SleepStage::Normal;

        if (secondsRemaining <= 0) {
            newStage = SleepStage::Sleep;
        } else if (secondsRemaining <= 120) {
            newStage = SleepStage::SleepWarning;
        } else if (secondsRemaining <= 300) {
            newStage = SleepStage::Lockdown;
        } else if (secondsRemaining <= 600) {
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
                ShowTrayBalloon(L"SleepOrDie เตือนเวลานอน (T-10m)", L"เหลือเวลา 10 นาทีก่อนถึงเวลานอน กรุณาเริ่มวางงานและเตรียมตัวเข้านอน", NIIF_INFO);
                ReportPresence("idle", (int)idleSeconds, false);
            } else if (currentStage == SleepStage::Lockdown) {
                ShowTrayBalloon(L"SleepOrDie ล็อคดาวน์ (T-5m)", L"เหลือเวลา 5 นาทีสุดท้าย! หากยังไม่ยอมนอน ระบบเข้าสู่โหมด Lockdown", NIIF_WARNING);
                ReportPresence("offline", 300, true);

                std::thread([]() {
                    MessageBoxW(
                        NULL,
                        L"🚨 [SleepOrDie: LOCKDOWN WARNING (T-5m)]\n\n"
                        L"เหลือเวลา 5 นาทีก่อนถึงเวลานอน!\n"
                        L"หากผู้ใช้ยังไม่ยอมนอน ระบบเข้าสู่โหมด Lockdown\n\n"
                        L"[โหมดจำลอง: แสดงแจ้งเตือนโดยไม่ล็อกหน้าจอจริง]",
                        L"SleepOrDie Lockdown (Mock)",
                        MB_OK | MB_ICONWARNING | MB_SYSTEMMODAL
                    );
                }).detach();
            } else if (currentStage == SleepStage::SleepWarning) {
                ShowTrayBalloon(L"SleepOrDie สลีปโหมด (T-2m)", L"เหลือเวลา 2 นาที! หากฝ่าฝืนอีกระบบจะสั่ง Windows Sleep Mode", NIIF_WARNING);
                ReportPresence("offline", 120, true);

                std::thread([]() {
                    MessageBoxW(
                        NULL,
                        L"⚠️ [SleepOrDie: WINDOWS SLEEP WARNING (T-2m)]\n\n"
                        L"เหลือเวลา 2 นาทีสุดท้ายก่อนเวลานอน!\n"
                        L"คุณยังคงฝ่าฝืนการใช้งาน ระบบเตรียมเข้าสู่ Windows Sleep Mode\n\n"
                        L"[โหมดจำลอง: แสดงแจ้งเตือนโดยไม่สลีปเครื่องจริง]",
                        L"SleepOrDie Sleep Mode (Mock)",
                        MB_OK | MB_ICONWARNING | MB_SYSTEMMODAL
                    );
                }).detach();
            } else if (currentStage == SleepStage::Sleep) {
                int countdown = config.emergencyCountdownSeconds > 0 ? config.emergencyCountdownSeconds : 60;
                std::wstring msg = L"ถึงเวลานอนที่ตั้งไว้แล้ว! มีเวลา " + std::to_wstring(countdown) + L" วินาทีฉุกเฉินก่อน HP ลดเหลือ 0%";
                ShowTrayBalloon(L"🚨 SleepOrDie ถึงเส้นตายเข้านอน!", msg.c_str(), NIIF_ERROR);
                ReportPresence("online", (int)idleSeconds, false);
            }
        }

        // Emergency countdown if past deadline
        if (currentStage == SleepStage::Sleep) {
            long secondsPast = -secondsRemaining;
            long countdown = config.emergencyCountdownSeconds > 0 ? config.emergencyCountdownSeconds : 60;
            long emergencySecondsLeft = std::max(0L, countdown - secondsPast);
            config.currentHp = std::max(0, (int)((emergencySecondsLeft * 100) / countdown));

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
        int waitSec = (config.emergencyCountdownSeconds > 0 ? config.emergencyCountdownSeconds : 60) + 5;
        Sleep(waitSec * 1000);
        return 0;
    }

    // Require login if no valid user_id or auth token
    if (config.userId <= 0 || config.authToken.empty()) {
        bool ok = PromptLoginDialog(NULL);
        if (!ok || config.userId <= 0) {
            MessageBoxW(NULL, L"จำเป็นต้องเข้าสู่ระบบก่อนเริ่มใช้งาน SleepOrDie Guard\nโปรแกรมจะปิดการทำงาน", L"SleepOrDie Guard", MB_OK | MB_ICONWARNING);
            return 0;
        }
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
    std::wstring greetMsg = L"ระบบเริ่มทำงานเงียบ ๆ บน System Tray (นับถอยหลังฉุกเฉิน " + std::to_wstring(config.emergencyCountdownSeconds) + L"s)";
    ShowTrayBalloon(L"SleepOrDie Desktop Guard", greetMsg.c_str(), NIIF_INFO);

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
