# Configurable Emergency Countdown & C++ Win32 Login Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow users to configure the emergency countdown seconds (default 60s, changed from 30s) on the web dashboard settings, and enforce C++ desktop daemon authentication via a native Win32 login dialog with countdown synchronization.

**Architecture:** Laravel backend stores `emergency_countdown_seconds` on `User` and exposes `POST /api/daemon/login` and updated `/api/presence/update`. Frontend React/Zustand store updates countdown timers and provides a settings input. C++ Desktop Guard implements a Win32 GUI login dialog, stores auth token/user config in `config.json`, and runs the emergency countdown loop according to `emergencyCountdownSeconds`.

**Tech Stack:** PHP 8.2+ / Laravel 12 (Fortify), TypeScript / React 19 / Inertia.js / Zustand, C++17 Win32 API (`winhttp`, `user32`, `shell32`, `powrprof`).

**Spec:** `docs/superpowers/specs/2026-10-19-configurable-countdown-and-cpp-login-design.md`

## Global Constraints
- Default countdown duration must be 60 seconds (replacing previous hardcoded 30 seconds).
- Valid countdown bounds: 10 to 300 seconds.
- C++ daemon must not run enforcement loop without authenticating first or having valid saved credentials.
- All code changes must preserve existing anti-evasion, lock workstation, and sound alarm mechanics.

## Review Focus
1. Invalid email/password submitted in C++ login dialog -> Show error message in dialog without crashing or saving bad credentials.
2. Network down / API unreachable when C++ launches -> Display network error alert and permit retry without infinite hang.
3. User changes countdown on web settings -> C++ daemon gets updated countdown on next presence heartbeat without restarting.
4. Edge case countdown value (e.g. 10s or 300s) -> HP formula correctly scales from 100% to 0% linearly over the configured duration.
5. Missing or corrupt `config.json` -> Gracefully fallback to default 60s countdown and prompt Win32 login dialog.

---

### Task 1: Database Migration & User Model for `emergency_countdown_seconds`

**Files:**
- Create: `database/migrations/2026_10_19_050000_add_emergency_countdown_seconds_to_users_table.php`
- Modify: `app/Models/User.php:27-84`
- Test: `tests/Feature/UserCountdownModelTest.php`

**Interfaces:**
- Consumes: Eloquent User model
- Produces: `$user->emergency_countdown_seconds` (integer, default 60)

- [ ] **Step 1: Write the failing test**
Create `tests/Feature/UserCountdownModelTest.php`:
```php
<?php

use App\Models\User;

test('user has default emergency countdown seconds of 60', function () {
    $user = User::factory()->create();
    expect($user->emergency_countdown_seconds)->toBe(60);
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `php artisan test --filter=UserCountdownModelTest`
Expected: FAIL due to missing column `emergency_countdown_seconds`.

- [ ] **Step 3: Create migration and update User model**
Create migration:
```php
Schema::table('users', function (Blueprint $table) {
    $table->unsignedSmallInteger('emergency_countdown_seconds')->default(60)->after('sleep_target_time');
});
```
Update `app/Models/User.php`:
- Add `'emergency_countdown_seconds'` to `#[Fillable]`
- Add `'emergency_countdown_seconds' => 60` to `$attributes`
- Add `'emergency_countdown_seconds' => 'integer'` to `casts()`

- [ ] **Step 4: Run migration and test to verify it passes**
Run: `php artisan migrate --force && php artisan test --filter=UserCountdownModelTest`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add database/migrations app/Models/User.php tests/Feature/UserCountdownModelTest.php
git commit -m "feat(db): add emergency_countdown_seconds to users table"
```

---

### Task 2: API Endpoints for Daemon Login, Presence Sync & Web Settings

**Files:**
- Modify: `routes/api.php:1-8`
- Modify: `app/Http/Controllers/SleepController.php:15-58,230-275`
- Test: `tests/Feature/DaemonAuthTest.php`
- Modify: `tests/Feature/SleepControllerTest.php`

**Interfaces:**
- Consumes: User credentials (`email`, `password`)
- Produces:
  - `POST /api/daemon/login` -> `{ success: bool, user_id: int, token: string, bedtime_hour: int, bedtime_minute: int, wake_up_hour: int, wake_up_minute: int, emergency_countdown_seconds: int }`
  - `POST /api/presence/update` -> includes `{ config: { emergency_countdown_seconds: int, bedtime_hour: int, bedtime_minute: int } }`
  - `POST /sleep/settings` -> saves `emergency_countdown_seconds`

- [ ] **Step 1: Write the failing tests**
Create `tests/Feature/DaemonAuthTest.php`:
```php
<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;

test('daemon login succeeds with valid email and password', function () {
    $user = User::factory()->create([
        'email' => 'guard@test.com',
        'password' => Hash::make('password123'),
        'wake_up_time' => '07:00',
        'sleep_target_time' => '23:15',
        'emergency_countdown_seconds' => 75,
    ]);

    $response = $this->postJson('/api/daemon/login', [
        'email' => 'guard@test.com',
        'password' => 'password123',
    ]);

    $response->assertOk()
        ->assertJson([
            'success' => true,
            'user_id' => $user->id,
            'bedtime_hour' => 23,
            'bedtime_minute' => 15,
            'wake_up_hour' => 7,
            'wake_up_minute' => 0,
            'emergency_countdown_seconds' => 75,
        ]);
});

test('daemon login fails with invalid password', function () {
    User::factory()->create([
        'email' => 'guard@test.com',
        'password' => Hash::make('password123'),
    ]);

    $response = $this->postJson('/api/daemon/login', [
        'email' => 'guard@test.com',
        'password' => 'wrong',
    ]);

    $response->assertStatus(401)
        ->assertJson(['success' => false]);
});
```

- [ ] **Step 2: Run tests to verify they fail**
Run: `php artisan test --filter=DaemonAuthTest`
Expected: FAIL (404 route not found).

- [ ] **Step 3: Implement `daemonLogin` and update `handlePresenceUpdate` & `saveSettings`**
In `routes/api.php`:
Add `Route::post('/daemon/login', [SleepController::class, 'daemonLogin']);`

In `app/Http/Controllers/SleepController.php`:
1. Implement `daemonLogin(Request $request)`:
   - Validate `email` (required, email) and `password` (required, string).
   - Find User by email; verify with `Hash::check`.
   - Return user bedtime, wake up, and `emergency_countdown_seconds`.
2. Update `saveSettings(Request $request)`:
   - Validate `'emergency_countdown_seconds' => ['nullable', 'integer', 'min:10', 'max:300']`.
   - If provided, save to `$user->emergency_countdown_seconds`.
3. In `handlePresenceUpdate`:
   - Include `'daemon_config' => ['emergency_countdown_seconds' => $user->emergency_countdown_seconds ?? 60, ...]` in JSON response.

- [ ] **Step 4: Run tests to verify they pass**
Run: `php artisan test --filter=DaemonAuthTest`
Run: `php artisan test --filter=SleepControllerTest`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add routes/api.php app/Http/Controllers/SleepController.php tests/Feature/DaemonAuthTest.php
git commit -m "feat(api): add daemon login endpoint and countdown sync"
```

---

### Task 3: Frontend Store & Settings Page Integration

**Files:**
- Modify: `resources/js/stores/useSleepStore.ts:15-53,320-335,260-310`
- Modify: `resources/js/pages/settings.tsx:20-135`
- Test: Verify build with `pnpm run build` or `npm run build`

**Interfaces:**
- Consumes: `$user.emergency_countdown_seconds`
- Produces: `useSleepStore.getState().emergency_countdown_seconds` & settings input field

- [ ] **Step 1: Update `useSleepStore.ts`**
- Add `emergency_countdown_seconds: number;` to `SleepState` (default: 60).
- Update `saveSettings`: accept optional `emergencyCountdownSeconds?: number` and send in payload.
- In `tick()`:
  - Replace hardcoded `30` in `Math.max(0, 30 - elapsed)` with `get().emergency_countdown_seconds || 60`.
  - Replace `(emergencySecondsLeft / 30) * 100` with `(emergencySecondsLeft / countdownSec) * 100`.
- In `startSimulation321()` and simulation transitions:
  - Use `emergency_countdown_seconds` instead of `30`.

- [ ] **Step 2: Update `resources/js/pages/settings.tsx`**
- Add state `const [countdownSeconds, setCountdownSeconds] = useState(user?.emergency_countdown_seconds || 60);`
- Add input in Settings Page form:
  - Label: "เวลานับถอยหลังฉุกเฉิน (วินาที)"
  - Type: number, min: 10, max: 300
  - Description: "ระยะเวลานับถอยหลังก่อนระบบปิด/สลีปเมื่อเลยเวลาเข้านอน (มีผลต่อโปรแกรม C++ และหน้าเว็บ)"
- Wire `handleSaveSleep` to pass `countdownSeconds`.

- [ ] **Step 3: Build verification**
Run: `npm run build`
Expected: Build succeeds with 0 errors.

- [ ] **Step 4: Commit**
```bash
git add resources/js/stores/useSleepStore.ts resources/js/pages/settings.tsx
git commit -m "feat(frontend): configurable emergency countdown in store and settings"
```

---

### Task 4: Desktop Daemon (C++) - Win32 Login Dialog & Configurable Countdown

**Files:**
- Modify: `desktop-daemon/main.cpp`
- Modify: `desktop-daemon/config.json`
- Test: Build with `desktop-daemon/build.bat`

**Interfaces:**
- Consumes: `/api/daemon/login` and `/api/presence/update`
- Produces: `SleepOrDieGuard.exe` with GUI login dialog and dynamic countdown logic

- [ ] **Step 1: Update `DaemonConfig` and `LoadConfigJson()` in `desktop-daemon/main.cpp`**
- Add to `DaemonConfig`:
  ```cpp
  int emergencyCountdownSeconds = 60;
  std::string userEmail = "";
  std::string authToken = "";
  ```
- Parse `emergency_countdown_seconds` in `LoadConfigJson()`.
- If `/api/presence/update` response contains `emergency_countdown_seconds`, dynamically update `config.emergencyCountdownSeconds`.

- [ ] **Step 2: Implement Win32 Login Dialog**
- Create in-memory dialog template (or native dialog) for Email and Password inputs with "Login" and "Cancel" buttons.
- On "Login" click:
  - Read email and password text fields.
  - Call `POST /api/daemon/login` using `WinHttp`.
  - If 200 OK: extract `user_id`, `emergency_countdown_seconds`, bedtime/wake-up hours, save to `config.json`, and close dialog with `IDOK`.
  - If failed: display `MessageBoxW` with error description.
- In `WinMain`:
  - Check if `config.authToken.empty() && config.userEmail.empty()`.
  - If not logged in, call `ShowLoginDialog(NULL)`. If user cancels, exit gracefully.

- [ ] **Step 3: Update Countdown and HP Calculation**
- In `RunSimulation321()`:
  - Replace hardcoded `30` with `config.emergencyCountdownSeconds`.
  - Calculate `hp = (sec * 100) / config.emergencyCountdownSeconds`.
- In `DaemonLoop()` during `SleepStage::Sleep`:
  - `long emergencySecondsLeft = std::max(0L, (long)config.emergencyCountdownSeconds - secondsPast);`
  - `config.currentHp = std::max(0, (int)((emergencySecondsLeft * 100) / config.emergencyCountdownSeconds));`

- [ ] **Step 4: Add Tray Menu "เข้าสู่ระบบใหม่" (Switch User)**
- Append menu item `ID_TRAY_LOGIN` ("🔑 เข้าสู่ระบบใหม่ (Switch User)").
- When clicked, prompt `ShowLoginDialog` and update daemon config.

- [ ] **Step 5: Compile and verify**
Run: `cmd /c "cd desktop-daemon && build.bat"`
Expected: Compilation success -> `SleepOrDieGuard.exe` generated.

- [ ] **Step 6: Commit**
```bash
git add desktop-daemon/main.cpp desktop-daemon/config.json
git commit -m "feat(daemon): Win32 login dialog and configurable countdown for C++ guard"
```

---

### Task 5: End-to-End System Verification

**Files:**
- Test: Automated test suites and manual daemon simulation run

- [ ] **Step 1: Run full PHP test suite**
Run: `php artisan test`
Expected: All tests pass.

- [ ] **Step 2: Run C++ test simulation**
Run: `desktop-daemon/SleepOrDieGuard.exe --test` (verify 60s countdown starts).

- [ ] **Step 3: Final commit & verify git status clean**
Run: `git status`
Expected: Clean working tree.
