# 1. Native Windows C++ Desktop Guard Lifecycle and Enforcement Architecture

Date: 2026-10-18

## Status

Accepted

## Context

SleepOrDie requires physical hardware and desktop discipline enforcement beyond simple web notifications. A native desktop client is needed to monitor user presence (keyboard/mouse idle detection) and physically enfore the curfew lifecycle: Alert -> Lockdown -> Sleep Mode -> Shutdown.

Without a clearly defined execution mode, the daemon could either run as an invisible background service (lacking visibility for user alerts) or a intrusive full-screen terminal (disrupting user workflow prior to curfew). Additionally, the exact destructive degree of the 0% HP penalty must be balanced between strict discipline and preventing data catastrophe.

## Decision

We decided to implement the Desktop Guard as a **Windows System Tray Application** with the following lifecycle and enforcement rules:

1. **Execution Model:** Win32 System Tray (`Shell_NotifyIconW`) with a taskbar tray icon, real-time status tooltip (Time Remaining, Current HP), and native Windows Balloon/Toast notifications.
2. **Lockdown Enforcement (T-15m):** When entering the Lockdown stage, the daemon sends a high-priority warning and invokes `LockWorkStation()`, immediately locking the Windows session and forcing the user away from their desk without killing open applications.
3. **Sleep Mode (Deadline T-0m):** Represents the Sleep Stage deadline. Triggers high-frequency emergency siren pulses and starts a strict 30-second emergency grace window before HP begins rapid decay towards 0%.
4. **Final Enforcement (0% HP Shutdown):** When HP reaches 0%, the daemon puts Windows into **Sleep/Suspend State (`SetSuspendState`)** by default, with an option in `config.json` for hard power-off (`shutdown`) or simulated test dialog (`test_msgbox`).
5. **Anti-Evasion Protection:** The System Tray context menu blocks the "Exit" action during curfew hours (T-30m until morning wake-up time), unless an emergency Time Extension Ticket is spent or evasion telemetry is dispatched to the backend.

## Consequences

### Positive
- Transparent user awareness via Taskbar Tray tooltip and non-blocking notifications.
- Strong physiological and physical enforcement through native `LockWorkStation()`.
- Safe yet strict 0% HP penalty using `SetSuspendState` to cut off PC usage without risking unsaved document loss.
- High tamper resistance during active curfew hours.

### Negative / Trade-offs
- Windows `SetSuspendState` requires `PowrProf.lib` / `Powrprof.dll`.
- Requires running with appropriate Windows user permissions.
