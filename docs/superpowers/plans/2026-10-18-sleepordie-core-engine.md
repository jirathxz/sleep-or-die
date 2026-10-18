# SleepOrDie Core Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete hardcore SleepOrDie sleep accountability and gamification engine with dynamic HP drain, stage progression (Alert > Lockdown > Sleep > Shutdown), Discord presence verification, and permanent account disabling at 5 strikes.

**Architecture:** Laravel 12 backend with Pest tests managing user sleep state, timestamps, HP penalties, and strikes; Inertia React frontend powered by Zustand, Howler.js, and date-fns for realtime countdowns, animated HP bars, and fullscreen stage transitions; plus a lightweight Node.js Discord bot relaying target presence to an internal webhook.

**Tech Stack:** Laravel, Pest, MySQL/SQLite, Inertia.js (React), Zustand, Howler.js, date-fns, Tailwind CSS, Node.js + discord.js.

**Spec:** `docs/adr/0001-sleepordie-core-engine.md` and `GLOSSARY.md`

## Global Constraints

- PHP 8.5 compatibility with strict types and Pest feature/unit testing.
- Single-context domain layout referencing `GLOSSARY.md`.
- No extraneous dependencies beyond verified requirements (`howler`, `zustand`, `date-fns`).
- Frontend components strictly within `resources/js/` utilizing Tailwind CSS.
- Keep routes typed with Wayfinder conventions.

## Review Focus

- Inputting wake-up time crossing midnight (e.g., wake at 06:00 -> sleep target 22:15 previous day) must calculate correctly without negative timestamp offsets.
- Using a Time Extension Ticket past midnight must extend the target day's deadline accurately.
- Simultaneous Discord presence updates during the 10-minute Verifying window must be idempotent.
- An account reaching 5 Shutdown Stacks must be locked out of all interactive routes immediately.
- A user maintaining a 7-day streak must properly decrement exactly 1 strike down to a minimum of 0.

---

### Task 1: Database Migration and User Sleep Attributes

**Files:**
- Create: `database/migrations/2026_10_18_000001_add_sleep_attributes_to_users_table.php`
- Modify: `app/Models/User.php`
- Test: `tests/Feature/UserSleepAttributesTest.php`

**Interfaces:**
- Consumes: Existing Laravel User schema
- Produces: `User` model with `$casts` for `wake_up_time`, `sleep_target_time`, `current_hp` (int), `shutdown_stacks` (int), `days_survived` (int), `tickets_count` (int), `is_disabled` (bool), `discord_user_id` (string), and `last_sleep_confirmed_at` (datetime)

- [ ] **Step 1: Write the failing test**

```php
test('user has default sleep attributes and casts', function () {
    $user = \App\Models\User::factory()->create([
        'wake_up_time' => '07:00',
        'sleep_target_time' => '23:15',
    ]);

    expect($user->current_hp)->toBe(100)
        ->and($user->shutdown_stacks)->toBe(0)
        ->and($user->days_survived)->toBe(0)
        ->and($user->tickets_count)->toBe(0)
        ->and($user->is_disabled)->toBeFalse()
        ->and($user->wake_up_time)->toBe('07:00')
        ->and($user->sleep_target_time)->toBe('23:15');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `php artisan test --filter=UserSleepAttributesTest`
Expected: FAIL due to missing columns in `users` table.

- [ ] **Step 3: Create migration and update User model**

Create migration with fields:
- `wake_up_time` (string, nullable)
- `sleep_target_time` (string, nullable)
- `current_hp` (integer, default 100)
- `shutdown_stacks` (integer, default 0)
- `days_survived` (integer, default 0)
- `tickets_count` (integer, default 0)
- `is_disabled` (boolean, default false)
- `discord_user_id` (string, nullable)
- `last_sleep_confirmed_at` (timestamp, nullable)

Update `User.php` fillable array and casts. Run `php artisan migrate`.

- [ ] **Step 4: Run test to verify it passes**

Run: `php artisan test --filter=UserSleepAttributesTest`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add database/migrations/ app/Models/User.php tests/Feature/UserSleepAttributesTest.php
git commit -m "feat(sleep): add sleep attributes and casts to user model"
```

---

### Task 2: SleepEngineService (Core Calculation, Drain & Punishment Logic)

**Files:**
- Create: `app/Services/SleepEngineService.php`
- Test: `tests/Unit/SleepEngineServiceTest.php`

**Interfaces:**
- Consumes: `App\Models\User`
- Produces:
  - `calculateSleepTarget(string $wakeUpTime, int $cycles = 5): string`
  - `useTicket(User $user): bool`
  - `recordShutdown(User $user): void`
  - `rewardSurvival(User $user): void`
  - `verifyDiscordPresence(User $user, string $status): bool`

- [ ] **Step 1: Write the failing tests**

```php
test('calculates sleep target 7h45m before wake up time across midnight', function () {
    $service = new \App\Services\SleepEngineService();
    // Wake up 06:00 -> minus 7h45m = 22:15
    expect($service->calculateSleepTarget('06:00', 5))->toBe('22:15');
    // Wake up 08:30 -> minus 7h45m = 00:45
    expect($service->calculateSleepTarget('08:30', 5))->toBe('00:45');
});

test('using ticket adds 30 minutes to sleep target and decrements ticket count', function () {
    $user = \App\Models\User::factory()->create([
        'sleep_target_time' => '23:00',
        'tickets_count' => 2,
    ]);
    $service = new \App\Services\SleepEngineService();
    $result = $service->useTicket($user);

    expect($result)->toBeTrue()
        ->and($user->fresh()->sleep_target_time)->toBe('23:30')
        ->and($user->fresh()->tickets_count)->toBe(1);
});

test('5 shutdown strikes disables account', function () {
    $user = \App\Models\User::factory()->create(['shutdown_stacks' => 4, 'is_disabled' => false]);
    $service = new \App\Services\SleepEngineService();
    $service->recordShutdown($user);

    expect($user->fresh()->shutdown_stacks)->toBe(5)
        ->and($user->fresh()->is_disabled)->toBeTrue()
        ->and($user->fresh()->current_hp)->toBe(0);
});

test('surviving 7 consecutive days rewards ticket and decays 1 strike', function () {
    $user = \App\Models\User::factory()->create([
        'days_survived' => 6,
        'shutdown_stacks' => 2,
        'tickets_count' => 0,
    ]);
    $service = new \App\Services\SleepEngineService();
    $service->rewardSurvival($user);

    expect($user->fresh()->days_survived)->toBe(7)
        ->and($user->fresh()->tickets_count)->toBe(1)
        ->and($user->fresh()->shutdown_stacks)->toBe(1);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `php artisan test --filter=SleepEngineServiceTest`
Expected: FAIL with "Class App\Services\SleepEngineService does not exist".

- [ ] **Step 3: Implement `SleepEngineService`**

Implement methods in `app/Services/SleepEngineService.php`:
- `calculateSleepTarget(string $wakeUpTime, int $cycles = 5): string`: use `Carbon::createFromTimeString` to subtract `($cycles * 90) + 15` minutes and format as `H:i`.
- `useTicket(User $user): bool`: check `tickets_count > 0`, add 30 mins to `sleep_target_time`, decrement `tickets_count`.
- `recordShutdown(User $user)`: set `current_hp = 0`, increment `shutdown_stacks`, if `shutdown_stacks >= 5` set `is_disabled = true`.
- `rewardSurvival(User $user)`: increment `days_survived`, if `days_survived % 7 === 0` increment `tickets_count` and decrement `shutdown_stacks` (min 0), restore `current_hp = 100`.

- [ ] **Step 4: Run test to verify it passes**

Run: `php artisan test --filter=SleepEngineServiceTest`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/Services/SleepEngineService.php tests/Unit/SleepEngineServiceTest.php
git commit -m "feat(sleep): implement SleepEngineService calculations and strike mechanics"
```

---

### Task 3: API Controller and Discord Presence Webhook

**Files:**
- Create: `app/Http/Controllers/SleepController.php`
- Modify: `routes/web.php` and `routes/api.php`
- Test: `tests/Feature/SleepControllerTest.php`

**Interfaces:**
- Consumes: `SleepEngineService`, authenticated `User`
- Produces:
  - `POST /sleep/settings`: updates wake-up time, auto-generates target, stores Discord ID.
  - `POST /sleep/confirm`: marks user sleep confirmation timestamp.
  - `POST /sleep/ticket`: invokes `useTicket`.
  - `POST /api/discord/presence-update`: receives `{ discord_user_id, status, activity }`. If user is in verifying window and status is active/online, resets confirmation and drains HP.

- [ ] **Step 1: Write the failing tests**

```php
test('user can update sleep schedule and receive calculated target', function () {
    $user = \App\Models\User::factory()->create();

    $response = $this->actingAs($user)->postJson('/sleep/settings', [
        'wake_up_time' => '06:30',
        'discord_user_id' => '1234567890',
    ]);

    $response->assertOk();
    expect($user->fresh()->sleep_target_time)->toBe('22:45');
});

test('discord presence update triggers penalty if target is online during verification', function () {
    $user = \App\Models\User::factory()->create([
        'discord_user_id' => '999999',
        'last_sleep_confirmed_at' => now(),
        'current_hp' => 100,
    ]);

    $response = $this->postJson('/api/discord/presence-update', [
        'secret' => config('services.discord.webhook_secret', 'secret123'),
        'discord_user_id' => '999999',
        'status' => 'online',
    ]);

    $response->assertOk();
    expect($user->fresh()->last_sleep_confirmed_at)->toBeNull()
        ->and($user->fresh()->current_hp)->toBeLessThan(100);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `php artisan test --filter=SleepControllerTest`
Expected: FAIL with 404 Route not found.

- [ ] **Step 3: Implement `SleepController` and register routes**

In `app/Http/Controllers/SleepController.php`, implement:
- `saveSettings(Request $request, SleepEngineService $service)`
- `confirmSleep(Request $request)`
- `useTicket(Request $request, SleepEngineService $service)`
- `handlePresenceUpdate(Request $request, SleepEngineService $service)`

Register routes with auth middleware for `/sleep/*` and rate-limited token check for `/api/discord/presence-update`.

- [ ] **Step 4: Run test to verify it passes**

Run: `php artisan test --filter=SleepControllerTest`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/Http/Controllers/SleepController.php routes/ tests/Feature/SleepControllerTest.php
git commit -m "feat(sleep): add SleepController endpoints and presence verification webhook"
```

---

### Task 4: Frontend State and Audio Engine (Zustand + Howler + date-fns)

**Files:**
- Create: `resources/js/stores/useSleepStore.ts`
- Create: `resources/js/lib/audioManager.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: User sleep props from Inertia (`current_hp`, `sleep_target_time`, `shutdown_stacks`, `days_survived`, `is_disabled`)
- Produces: Reactive Zustand store providing:
  - `countdown`: `{ hours, minutes, seconds, isPastDeadline, totalSecondsRemaining }`
  - `stage`: `'normal' | 'alert' | 'lockdown' | 'sleep' | 'shutdown'`
  - `playAlarm()`, `stopAlarm()`, `triggerLockdownAudio()`

- [ ] **Step 1: Install frontend dependencies**

Command:
```bash
npm install zustand howler date-fns
npm install -D @types/howler
```

- [ ] **Step 2: Implement audioManager with Howler**

In `resources/js/lib/audioManager.ts`:
- Define sound instances using web audio oscillator synth fallbacks or Howler sounds (beep, warning siren, ticking loop).
- Implement `playWarningSound()`, `playCriticalAlarm()`, `stopAllAudio()`.

- [ ] **Step 3: Implement useSleepStore**

In `resources/js/stores/useSleepStore.ts`:
- Compute stage:
  - `totalSecondsRemaining > 1800` -> `'normal'`
  - `totalSecondsRemaining <= 1800 && totalSecondsRemaining > 900` -> `'alert'`
  - `totalSecondsRemaining <= 900 && totalSecondsRemaining > 0` -> `'lockdown'`
  - `totalSecondsRemaining <= 0 && current_hp > 0` -> `'sleep'`
  - `current_hp <= 0 || is_disabled` -> `'shutdown'`
- Export reactive tick action to calculate delta every second using `date-fns`.

- [ ] **Step 4: Test store locally via Vite build check**

Run: `npm run build`
Expected: PASS without TypeScript/Vite bundling errors.

- [ ] **Step 5: Commit**

```bash
git add resources/js/stores/useSleepStore.ts resources/js/lib/audioManager.ts package.json package-lock.json
git commit -m "feat(sleep): add Zustand sleep store and Howler audio manager"
```

---

### Task 5: Frontend UI Components & Tombstone Screen

**Files:**
- Create: `resources/js/components/Sleep/HpBar.tsx`
- Create: `resources/js/components/Sleep/CountdownDisplay.tsx`
- Create: `resources/js/components/Sleep/StatsBadge.tsx`
- Create: `resources/js/components/Sleep/StageOverlay.tsx`
- Create: `resources/js/components/Sleep/TombstoneScreen.tsx`
- Create: `resources/js/pages/Sleep/Dashboard.tsx`
- Modify: `routes/web.php`

**Interfaces:**
- Consumes: `useSleepStore`, Inertia router
- Produces: Complete SleepOrDie gaming UI with dynamic HP bar, countdown, stage overlays, and disabled account tombstone.

- [ ] **Step 1: Create `HpBar.tsx`**

- Smooth transition width percentage `current_hp%`
- Color gradient based on HP:
  - `> 60%`: `#22c55e` (green)
  - `30% - 60%`: `#f97316` (orange)
  - `< 30%`: `#ef4444` (red with `@keyframes pulse` blink)

- [ ] **Step 2: Create `CountdownDisplay.tsx` and `StatsBadge.tsx`**

- Giant digital clock displaying time until sleep deadline.
- Days Survived badge with streak fire icon.
- Shutdown Stacks indicator showing `X / 5 Stacks`.
- Ticket button: displays remaining count, button disabled when count = 0 or already used tonight.

- [ ] **Step 3: Create `StageOverlay.tsx` and `TombstoneScreen.tsx`**

- When `stage === 'lockdown'`: pulsing orange border, audible heartbeat tick.
- When `stage === 'shutdown'`: full screen blacked out with warning text.
- If `is_disabled === true`: render `TombstoneScreen` showing:
  - Skull/tombstone icon
  - "ACCOUNT ELIMINATED - DISCIPLINE FAILED"
  - Peak Days Survived record
  - Inactive disabled message.

- [ ] **Step 4: Create `Sleep/Dashboard.tsx` and attach route**

Assemble all components on `Sleep/Dashboard.tsx`. Render via `Inertia::render('Sleep/Dashboard')` on `/` or `/dashboard`.

- [ ] **Step 5: Verify build**

Run: `npm run build`
Expected: Build succeeds with all components bundled.

- [ ] **Step 6: Commit**

```bash
git add resources/js/components/Sleep/ resources/js/pages/Sleep/
git commit -m "feat(sleep): implement interactive SleepOrDie dashboard and Tombstone screen"
```

---

### Task 6: Lightweight Discord Bot Microservice

**Files:**
- Create: `discord-bot/package.json`
- Create: `discord-bot/index.js`
- Create: `discord-bot/.env.example`
- Create: `discord-bot/README.md`

**Interfaces:**
- Consumes: Discord Gateway WebSocket events (`presenceUpdate`)
- Produces: Webhook POST payload to `http://127.0.0.1:8000/api/discord/presence-update`

- [ ] **Step 1: Initialize bot directory**

Create `discord-bot/package.json` with dependencies `discord.js`, `dotenv`, and `undici`.

- [ ] **Step 2: Implement gateway listener in `discord-bot/index.js`**

- Connect client with `GatewayIntentBits.Guilds` and `GatewayIntentBits.GuildPresences`.
- On `presenceUpdate (oldPresence, newPresence)`:
  - If `newPresence.userId` matches a registered target, send HTTP POST to Laravel webhook with user ID, status (`online`, `idle`, `dnd`, `offline`), and game activities.

- [ ] **Step 3: Document setup in `discord-bot/README.md`**

Provide one-line start instructions: `npm install && npm start`.

- [ ] **Step 4: Commit**

```bash
git add discord-bot/
git commit -m "feat(discord): add Discord presence worker microservice"
```
