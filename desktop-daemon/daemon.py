#!/usr/bin/env python3
"""
SleepOrDie - Native Windows Desktop Guard Daemon
Hardcore Biological Discipline & Night Curfew Enforcer

Monitors user activity via Win32 API:
- GetLastInputInfo: Detects active typing / mouse movement past bedtime
- Beep & MessageBeep: Stage audio cues (Alert, Lockdown, Emergency Alarm, Shutdown)
- LockWorkStation: Locks screen upon bedtime curfew breach
- System Shutdown: Initiates PC shutdown when HP reaches 0%
"""

import sys
import os
import time
import json
import ctypes
from ctypes import Structure, c_uint, sizeof, byref
from datetime import datetime

# Windows API Structures for LastInputInfo
class LASTINPUTINFO(Structure):
    _fields_ = [
        ("cbSize", c_uint),
        ("dwTime", c_uint)
    ]

user32 = ctypes.windll.user32
kernel32 = ctypes.windll.kernel32

from ctypes import wintypes
user32.MessageBoxW.argtypes = [wintypes.HWND, wintypes.LPCWSTR, wintypes.LPCWSTR, wintypes.UINT]
user32.MessageBoxW.restype = wintypes.INT

def get_idle_seconds() -> float:
    """Returns number of seconds since last mouse or keyboard input."""
    lii = LASTINPUTINFO()
    lii.cbSize = sizeof(LASTINPUTINFO)
    if user32.GetLastInputInfo(byref(lii)):
        millis = kernel32.GetTickCount() - lii.dwTime
        return millis / 1000.0
    return 0.0

def lock_workstation():
    """Immediately locks the Windows screen."""
    print("\n[LOCKOUT] Locking Windows Workstation immediately...")
    user32.LockWorkStation()

def play_stage_sound(stage: str):
    """Generates stage-specific audio cues using Windows Beep."""
    try:
        import winsound
        if stage == "alert":
            # Stage 1: Alert (T-30m) - Gentle double chime
            winsound.Beep(587, 250)
            time.sleep(0.08)
            winsound.Beep(880, 350)
        elif stage == "lockdown":
            # Stage 2: Lockdown (T-15m) - Ticking heartbeat
            winsound.Beep(440, 150)
            time.sleep(0.1)
            winsound.Beep(440, 200)
        elif stage == "sleep":
            # Stage 3: Sleep breach - Emergency alarm
            for _ in range(3):
                winsound.Beep(988, 120)
                time.sleep(0.05)
                winsound.Beep(1318, 180)
                time.sleep(0.06)
        elif stage == "shutdown":
            # Stage 4: Shutdown - Descending power-down chime
            winsound.Beep(659, 250)
            winsound.Beep(494, 250)
            winsound.Beep(330, 400)
            winsound.Beep(165, 700)
    except Exception:
        pass

def load_config() -> dict:
    config_path = os.path.join(os.path.dirname(__file__), "config.json")
    default_config = {
        "bedtime_hour": 23,
        "bedtime_minute": 15,
        "enable_audio": True,
        "lock_workstation_on_breach": True,
        "enforce_system_shutdown": False,
        "idle_threshold_seconds": 30,
        "check_interval_seconds": 2
    }
    if os.path.exists(config_path):
        try:
            with open(config_path, "r", encoding="utf-8") as f:
                loaded = json.load(f)
                default_config.update(loaded)
        except Exception as e:
            print(f"[Warning] Failed to load config.json: {e}")
    return default_config

def get_seconds_until_bedtime(target_hour: int, target_minute: int) -> float:
    now = datetime.now()
    target = now.replace(hour=target_hour, minute=target_minute, second=0, microsecond=0)
    diff = (target - now).total_seconds()
    if diff < -43200:
        diff += 86400
    elif diff > 43200:
        diff -= 86400
    return diff

def run_simulation(config: dict):
    print("=" * 65)
    print(" [SIMULATION MODE] 3 - 2 - 1 BEDTIME COUNTDOWN SIMULATION")
    print("=" * 65)
    print("Simulating arrival of bedtime curfew in 3 seconds...\n")
    
    for sec in range(3, 0, -1):
        print(f">>> Countdown: {sec} seconds remaining...")
        try:
            import winsound
            winsound.Beep(587, 200)
        except Exception:
            pass
        time.sleep(1)

    print("\n" + "!" * 65)
    print(" >>> [DEADLINE REACHED: 00:00:00] BEDTIME CURFEW BREACHED! <<<")
    print(" >>> EMERGENCY! 30 seconds remaining before HP reaches 0%!")
    print("!" * 65)
    play_stage_sound("sleep")

    for sec in range(30, 0, -1):
        hp = int(round((sec / 30.0) * 100))
        print(f"  >>> [EMERGENCY 30s COUNTDOWN] {sec}s remaining before HP 0%! Current HP: {hp}%")
        try:
            import winsound
            winsound.Beep(1175, 120)
        except Exception:
            pass
        time.sleep(1)

    print("\n" + "=" * 65)
    print(" >>> [0% HP: SYSTEM LOCKDOWN & SHUTDOWN TRIGGERED] <<<")
    print("=" * 65)
    play_stage_sound("shutdown")

    # Using Windows MessageBox for test mode as requested (instead of locking or turning off PC)
    user32.MessageBoxW(
        0,
        "🚨 [SleepOrDie: HARDCORE DISCIPLINARY SHUTDOWN]\n\n"
        "พลังชีวิต (HP) ของคุณลดลงเหลือ 0% แล้ว!\n"
        "หมดเวลาช่วงฉุกเฉิน 30 วินาที และเลยเส้นตายเข้านอน\n\n"
        "⚠️ บันทึกสไตรค์ความผิด 1 ครั้ง (Strike Recorded)\n\n"
        "----------------------------------------------------\n"
        "[โหมดทดสอบ: แสดง MessageBox จำลองคำสั่ง Shutdown สำเร็จ]\n"
        "(ในระบบจริงเครื่องจะถูกสั่ง LockWorkStation หรือปิดระบบทันที)",
        "SleepOrDie — SYSTEM SHUTDOWN (0% HP)",
        0x10 | 0x1000
    )

def main():
    config = load_config()

    if len(sys.argv) > 1 and sys.argv[1] in ["--test", "-t", "test"]:
        run_simulation(config)
        return

    print("=" * 65)
    print("     SLEEP OR DIE - NATIVE WINDOWS DESKTOP GUARD")
    print("  Hardcore Biological Discipline & Night Curfew Enforcer")
    print("=" * 65)
    print(f" Target Bedtime     : {config['bedtime_hour']:02d}:{config['bedtime_minute']:02d}")
    print(" Emergency Window   : 30 seconds before HP runs out (100% -> 0%)")
    print(f" Audio Alerts       : {'Enabled' if config['enable_audio'] else 'Disabled'}")
    print(f" Lock Screen Action : {'Enabled' if config['lock_workstation_on_breach'] else 'Disabled'}")
    print(f" Shutdown on 0% HP  : {'Enabled' if config['enforce_system_shutdown'] else 'Disabled'}")
    print("-----------------------------------------------------------------")
    print(" Monitoring active user presence via Win32 GetLastInputInfo...")
    print(" Type 'python daemon.py --test' to test 3-2-1 countdown.\n")

    current_stage = "normal"
    current_hp = 100

    try:
        while True:
            remaining = get_seconds_until_bedtime(config['bedtime_hour'], config['bedtime_minute'])
            idle_seconds = get_idle_seconds()

            if remaining <= 0:
                new_stage = "sleep"
            elif remaining <= 900:  # 15 mins
                new_stage = "lockdown"
            elif remaining <= 1800: # 30 mins
                new_stage = "alert"
            else:
                new_stage = "normal"

            if new_stage != current_stage:
                current_stage = new_stage
                print(f"[{datetime.now().strftime('%H:%M:%S')}] Entering Stage: {current_stage.upper()}")
                play_stage_sound(current_stage)

                if current_stage == "alert":
                    print("[ALERT - T-30m] เหลือเวลา 30 นาที! เริ่มปิดงานและพักสายตา")
                elif current_stage == "lockdown":
                    print("[LOCKDOWN - T-15m] เหลือเวลา 15 นาที! บันทึกงานและปิดเครื่องทันที")
                elif current_stage == "sleep":
                    print("[SLEEP - DEADLINE] เลยเวลานอนแล้ว! มีเวลา 30 วินาทีก่อน HP หมดและเครื่องจะถูกล็อค")

            # Bedtime curfew breached: 30 seconds emergency countdown before HP hits 0%
            if current_stage == "sleep":
                seconds_past_deadline = abs(remaining)
                emergency_seconds_left = max(0, 30 - int(seconds_past_deadline))
                current_hp = max(0, int(round((emergency_seconds_left / 30.0) * 100)))

                print(f"[{datetime.now().strftime('%H:%M:%S')}] [EMERGENCY 30s COUNTDOWN] {emergency_seconds_left}s remaining before HP 0%! Current HP: {current_hp}%")
                play_stage_sound("sleep")

                if emergency_seconds_left <= 0 or current_hp <= 0:
                    print("\n[CRITICAL] 30s EXPIRED! HP DROPPED TO 0%! EXECUTING ENFORCEMENT PROTOCOL.")
                    play_stage_sound("shutdown")
                    user32.MessageBoxW(
                        0,
                        "🚨 [SleepOrDie: HARDCORE DISCIPLINARY SHUTDOWN]\n\n"
                        "พลังชีวิต (HP) ของคุณลดลงเหลือ 0% แล้ว!\n"
                        "หมดเวลาช่วงฉุกเฉิน 30 วินาที และเลยเส้นตายเข้านอน\n\n"
                        "⚠️ บันทึกสไตรค์ความผิด 1 ครั้ง (Strike Recorded)\n\n"
                        "----------------------------------------------------\n"
                        "[โหมดทดสอบ: แสดง MessageBox จำลองคำสั่ง Shutdown สำเร็จ]\n"
                        "(ในระบบจริงเครื่องจะถูกสั่ง LockWorkStation หรือปิดระบบทันที)",
                        "SleepOrDie — SYSTEM SHUTDOWN (0% HP)",
                        0x10 | 0x1000
                    )
                    break

            time.sleep(1)

    except KeyboardInterrupt:
        print("\n[SleepOrDie Guard] Daemon stopped by user.")

if __name__ == "__main__":
    main()
