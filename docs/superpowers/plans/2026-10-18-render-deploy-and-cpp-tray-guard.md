# Render Cloud Deployment & C++ System Tray Desktop Guard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the remaining pending tasks: (1) Architecture documentation (ADR & Glossary update), (2) Native C++ Windows System Tray Daemon with Alert > Lockdown > Sleep Mode > Shutdown lifecycle and Anti-Evasion, and (3) Production Render Cloud deployment bundle (Multi-stage Dockerfile, Nginx config, entrypoint script, and `render.yaml` blueprint with Supabase PostgreSQL connection).

**Architecture:** The project consists of a fullstack Laravel application deployed to Render Web Service connected to Supabase PostgreSQL, paired with a native Win32 C++ System Tray Guard daemon running on client machines monitoring user presence and enforcing sleep curfew via `LockWorkStation` and `SetSuspendState`.

**Tech Stack:** Laravel 11/12 (PHP 8.3+, Inertia, React), Docker, Nginx, C++17 (Win32 API, `Shell_NotifyIconW`, `LockWorkStation`, `SetSuspendState`, `WinHTTP`), Render Cloud, Supabase PostgreSQL.

**Spec:** Confirmed user decisions in Grilling Round 1: System Tray app, `LockWorkStation` at T-15m Lockdown, Sleep Mode at T-0m with 30s emergency window, Windows Suspend State at 0% HP, and Anti-Evasion protection.

## Global Constraints

- Windows Win32 API for C++ daemon, compiled with MSVC 64-bit via `build.bat`.
- Dark/Gray 80% / Crisp White 20% Minimalist Industrial Design (DESIGN.md) preserved across all UI.
- Production Docker container on Render must support both PostgreSQL (Supabase) and SQLite with OPcache and asset caching.
- Zero breaking changes to existing test suite (all 52+ tests must remain green).

## Review Focus

- C++ daemon compilation on MSVC (`cl.exe`) without missing Win32 symbols.
- Tray icon registration and non-blocking Windows message loop (`PeekMessage` / `GetMessage`).
- Docker container startup handling migrations and health check endpoint `/up`.
- Supabase PostgreSQL environment variables mapped properly in `render.yaml`.
- Anti-evasion logic not trapping user indefinitely outside bedtime hours.

---

### Task 1: Record Architectural Decisions (ADR) & Update Glossary

**Files:**
- Create: `sleepordie/docs/adr/0001-cpp-tray-daemon-lifecycle.md`
- Modify: `sleepordie/GLOSSARY.md`

- [x] **Step 1: Write ADR 0001 for C++ System Tray Daemon Lifecycle**
Record the 5 decisions agreed upon during grilling: System Tray mode, `LockWorkStation` enforcement at Lockdown (T-15m), Deadline emergency window at Sleep Mode (T-0m), Windows Suspend at 0% HP Shutdown, and Anti-Evasion tray exit restriction.

- [x] **Step 2: Update GLOSSARY.md with System Tray Guard and Suspend State**
Add definitions for Desktop System Tray Guard, LockWorkStation Curfew, and System Suspend State.

- [x] **Step 3: Verify ADR & Glossary integrity**

---

### Task 2: Implement C++ System Tray Desktop Guard

**Files:**
- Modify: `desktop-daemon/main.cpp`
- Modify: `desktop-daemon/config.json`
- Test: `desktop-daemon/build.bat`

**Interfaces:**
- Consumes: Win32 API (`Shell_NotifyIconW`, `LockWorkStation`, `SetSuspendState`, `WinHTTP`), `config.json`.
- Produces: `SleepOrDieGuard.exe` with System Tray icon, status tooltips, balloon notifications, and enforcement stages.

- [x] **Step 1: Update `config.json`**
Add `enforce_action` ("sleep", "shutdown", "test_msgbox"), `anti_evasion` (true/false).

- [x] **Step 2: Implement System Tray Window & Message Loop in `main.cpp`**
Create a hidden helper window, register `NOTIFYICONDATAW` with custom tray icon and hover status tooltip.
Implement right-click context menu (Status, Simulate Countdown, Exit with Curfew Check).

- [x] **Step 3: Implement Lifecycle Stages in `main.cpp`**
- Normal: Passive presence monitoring.
- Alert (T-30m): Balloon notification ("เหลือเวลา 30 นาที") + Chime.
- Lockdown (T-15m): Balloon warning ("เข้าสู่ช่วง Lockdown") + `LockWorkStation()`.
- Sleep Mode (T-0m): Emergency siren + 30s emergency countdown before HP 0%.
- Shutdown (0% HP): Execute `SetSuspendState` (or test dialog in test mode).

- [x] **Step 4: Build `SleepOrDieGuard.exe`**
Run `build.bat` using MSVC to verify successful compilation with 0 errors.

---

### Task 3: Prepare Render Cloud Production Deployment Package

**Files:**
- Create: `sleepordie/Dockerfile`
- Create: `sleepordie/render.yaml`
- Create: `sleepordie/docker/entrypoint.sh`
- Create: `sleepordie/docker/nginx.conf`
- Create: `sleepordie/.dockerignore`

- [x] **Step 1: Create `Dockerfile` (Multi-stage)**
Stage 1 (Node 22): Build frontend assets (`npm run build`).
Stage 2 (PHP 8.3 FPM + Nginx): Install system dependencies, `pdo_pgsql`, `pdo_sqlite`, `bcmath`, `opcache`, `zip`, copy application, run `composer install --no-dev --optimize-autoloader`.

- [x] **Step 2: Create `docker/nginx.conf`**
Configure Nginx server block to serve `/public/index.php` with gzip, asset caching, and security headers.

- [x] **Step 3: Create `docker/entrypoint.sh`**
Startup script to run `php artisan migrate --force`, cache configurations (`config:cache`, `route:cache`, `view:cache`), and launch PHP-FPM and Nginx.

- [x] **Step 4: Create `render.yaml` Blueprint**
Define:
- Web Service (`sleepordie-web`): Docker runtime, health check path `/up`, env vars mapping (`APP_KEY`, `APP_URL`, `DB_CONNECTION=pgsql`, `DATABASE_URL` / `DB_HOST` to Supabase).
- Cron / Worker Service (`sleepordie-scheduler`): Running `php artisan schedule:work` so bedtime alerts trigger automatically every minute.

- [x] **Step 5: Create `.dockerignore`**

---

### Task 4: Full System Verification

- [x] **Step 1: Run `php artisan test` to verify zero regression**
- [x] **Step 2: Test `SleepOrDieGuard.exe --test` simulation mode**
- [x] **Step 3: Review all deployment and daemon files**
