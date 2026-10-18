<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SleepEngineService
{
    /**
     * Calculate optimal sleep deadline based on wake-up time and sleep cycles.
     */
    public function calculateSleepTarget(string $wakeUpTime, int $cycles = 5): string
    {
        $minutesToSubtract = ($cycles * 90) + 15;
        $wakeTime = Carbon::createFromTimeString($wakeUpTime);

        return $wakeTime->subMinutes($minutesToSubtract)->format('H:i');
    }

    /**
     * Consume a Time Extension Ticket to delay the sleep deadline by 30 minutes.
     */
    public function useTicket(User $user): bool
    {
        if ($user->tickets_count <= 0 || empty($user->sleep_target_time) || $user->is_disabled) {
            return false;
        }

        $currentTime = Carbon::createFromTimeString($user->sleep_target_time);
        $newTarget = $currentTime->addMinutes(30)->format('H:i');

        return $user->update([
            'sleep_target_time' => $newTarget,
            'tickets_count' => $user->tickets_count - 1,
        ]);
    }

    /**
     * Record a night shutdown when HP drains to zero.
     */
    public function recordShutdown(User $user): void
    {
        $newStacks = $user->shutdown_stacks + 1;

        $user->update([
            'current_hp' => 0,
            'shutdown_stacks' => $newStacks,
            'is_disabled' => $newStacks >= 5,
            'last_sleep_confirmed_at' => null,
        ]);
    }

    /**
     * Drain HP by a specified amount, triggering shutdown if HP reaches zero.
     */
    public function drainHp(User $user, int $amount = 25): void
    {
        $newHp = max(0, $user->current_hp - $amount);

        if ($newHp <= 0) {
            $this->recordShutdown($user);
        } else {
            $user->update(['current_hp' => $newHp]);
        }
    }

    /**
     * Reward successful on-time sleep, resetting HP and granting streak/tickets.
     */
    public function rewardSurvival(User $user): void
    {
        if ($user->is_disabled) {
            return;
        }

        $days = $user->days_survived + 1;
        $tickets = $user->tickets_count;
        $stacks = $user->shutdown_stacks;

        if ($days % 7 === 0) {
            $tickets += 1;
            $stacks = max(0, $stacks - 1);
        }

        $newExp = ($user->exp ?? 0) + 150;
        $level = $user->level ?? 1;
        $expThreshold = $level * 500;

        while ($newExp >= $expThreshold) {
            $newExp -= $expThreshold;
            $level += 1;
            $expThreshold = $level * 500;
        }

        $user->update([
            'days_survived' => $days,
            'tickets_count' => $tickets,
            'shutdown_stacks' => $stacks,
            'current_hp' => 100,
            'level' => $level,
            'exp' => $newExp,
            'last_sleep_confirmed_at' => null,
        ]);
    }

    /**
     * Determine if current time falls within bedtime / sleep hours (from Alert T-30m until wake up time).
     */
    public function isWithinBedtimeHours(User $user, mixed $now = null): bool
    {
        $now = $now ? Carbon::parse($now) : now();
        $wakeUpTime = $user->wake_up_time ?? '07:00';
        $sleepTarget = $user->sleep_target_time ?? $this->calculateSleepTarget($wakeUpTime);

        $targetCarbon = Carbon::createFromTimeString($sleepTarget);
        $alertCarbon = $targetCarbon->copy()->subMinutes(30);
        $wakeCarbon = Carbon::createFromTimeString($wakeUpTime);

        $nowMinutes = $now->hour * 60 + $now->minute;
        $alertMinutes = $alertCarbon->hour * 60 + $alertCarbon->minute;
        $wakeMinutes = $wakeCarbon->hour * 60 + $wakeCarbon->minute;

        if ($alertMinutes > $wakeMinutes) {
            // Crosses midnight (e.g. Alert 22:45 to Wake 07:00)
            return $nowMinutes >= $alertMinutes || $nowMinutes <= $wakeMinutes;
        } else {
            // Same day (e.g. Alert 07:30 to Wake 16:00)
            return $nowMinutes >= $alertMinutes && $nowMinutes <= $wakeMinutes;
        }
    }

    /**
     * Process presence update from Discord bot or C++ desktop daemon.
     * Auto-confirms sleep if offline during bedtime hours, or penalizes if caught active.
     */
    public function handlePresence(User $user, string $status, string $source = 'discord', array $meta = []): array
    {
        $status = strtolower($status);
        $isOffline = in_array($status, ['offline', 'idle', 'invisible']) ||
            (!empty($meta['screen_locked'])) ||
            (isset($meta['idle_seconds']) && $meta['idle_seconds'] >= 60);

        $isOnline = in_array($status, ['online', 'dnd']) ||
            (!empty($meta['is_active']) && empty($meta['screen_locked']) && (!isset($meta['idle_seconds']) || $meta['idle_seconds'] < 60));

        $inBedtimeHours = $this->isWithinBedtimeHours($user);

        // Verification window check (10 mins after manual or auto confirm)
        $isInVerifyingWindow = $user->last_sleep_confirmed_at &&
            $user->last_sleep_confirmed_at->diffInMinutes(now()) <= 10;

        // Case 1: In bedtime hours and user goes offline / locks PC -> Auto-confirm sleep ("ถือว่าผู้ใช้ไปนอนแล้ว")
        if ($inBedtimeHours && $isOffline) {
            if (!$user->last_sleep_confirmed_at) {
                $user->update([
                    'last_sleep_confirmed_at' => now(),
                ]);

                return [
                    'penalized' => false,
                    'auto_confirmed' => true,
                    'is_sleeping' => true,
                    'message' => 'ตรวจพบผู้ใช้ออฟไลน์/ล็อคหน้าจอในช่วงเวลานอน ถือว่าเข้านอนเรียบร้อยแล้ว',
                    'current_hp' => $user->current_hp,
                ];
            }

            return [
                'penalized' => false,
                'auto_confirmed' => false,
                'is_sleeping' => true,
                'message' => 'ผู้ใช้ยังคงอยู่ในสถานะเข้านอนอย่างปลอดภัย',
                'current_hp' => $user->current_hp,
            ];
        }

        // Case 2: User was marked sleeping, but came back online during sleep hours or verification window (Cheating detected!)
        if (($inBedtimeHours || $isInVerifyingWindow) && $isOnline && $user->last_sleep_confirmed_at) {
            $user->update(['last_sleep_confirmed_at' => null]);
            $this->drainHp($user, 25);

            return [
                'penalized' => true,
                'auto_confirmed' => false,
                'is_sleeping' => false,
                'message' => 'ตรวจพบผู้ใช้กลับมาออนไลน์หรือใช้งานคอมพิวเตอร์ระหว่างเวลานอน! หัก HP 25 แต้ม',
                'current_hp' => $user->fresh()->current_hp,
            ];
        }

        return [
            'penalized' => false,
            'auto_confirmed' => false,
            'is_sleeping' => (bool)$user->last_sleep_confirmed_at,
            'message' => 'อัปเดตสถานะ Presence เรียบร้อย',
            'current_hp' => $user->current_hp,
        ];
    }

    /**
     * Check and reward night survival if user slept through the night and it is now morning.
     */
    public function checkMorningReward(User $user, mixed $now = null): bool
    {
        $now = $now ? Carbon::parse($now) : now();
        if (!$user->last_sleep_confirmed_at || $user->is_disabled) {
            return false;
        }

        if (!$this->isWithinBedtimeHours($user, $now)) {
            if ($user->last_sleep_confirmed_at->diffInMinutes($now) >= 60) {
                $this->rewardSurvival($user);
                return true;
            }
        }

        return false;
    }

    /**
     * Send Discord Direct Message to user using bot token.
     */
    public function sendDiscordDm(string $botToken, string $userId, string $message): bool
    {
        if (empty($botToken) || empty($userId)) {
            return false;
        }

        try {
            $channelRes = Http::withHeaders([
                'Authorization' => 'Bot ' . trim($botToken),
                'Accept' => 'application/json',
                'Content-Type' => 'application/json',
            ])->timeout(8)->post('https://discord.com/api/v10/users/@me/channels', [
                'recipient_id' => trim($userId),
            ]);

            if (! $channelRes->successful()) {
                Log::warning('Discord create DM channel failed', [
                    'status' => $channelRes->status(),
                    'body' => $channelRes->body(),
                ]);
                return false;
            }

            $channelId = $channelRes->json('id');

            $msgRes = Http::withHeaders([
                'Authorization' => 'Bot ' . trim($botToken),
                'Accept' => 'application/json',
                'Content-Type' => 'application/json',
            ])->timeout(8)->post("https://discord.com/api/v10/channels/{$channelId}/messages", [
                'content' => $message,
            ]);

            return $msgRes->successful();
        } catch (\Throwable $e) {
            Log::error('Discord DM send error: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Send bedtime notification to a user via Discord DM or system log.
     */
    public function sendBedtimeAlert(User $user, string $stage = 'deadline'): bool
    {
        $target = $user->sleep_target_time ?? '23:00';
        $messages = [
            'alert' => "🔔 [SleepOrDie] เหลืออีก 30 นาทีจะถึงเวลานอนเป้าหมาย ({$target}) กรุณาเตรียมตัวพักผ่อน",
            'lockdown' => "⚠️ [SleepOrDie] เหลืออีก 15 นาที! เข้าสู่ช่วง Lockdown กรุณาปิดหน้าจอและเตรียมเข้านอน",
            'deadline' => "🚨 [SleepOrDie] ถึงเวลาเข้านอนแล้ว ({$target})! กรุณาเข้านอนทันที มิเช่นนั้นระบบจะถือว่าทำผิดวินัย",
        ];

        $message = $messages[$stage] ?? $messages['deadline'];

        if (!empty($user->discord_bot_token) && !empty($user->discord_user_id)) {
            return $this->sendDiscordDm($user->discord_bot_token, $user->discord_user_id, $message);
        }

        Log::info("Bedtime {$stage} alert triggered for User #{$user->id}: {$message}");
        return true;
    }

    /**
     * Check users and trigger bedtime alerts based on target time.
     * shortcut: exact minute match assumes scheduler runs every minute, add last_alerted_at if missed runs need catchup
     */
    public function checkAndSendBedtimeAlerts(?Carbon $now = null): int
    {
        $now = $now ? Carbon::parse($now) : now();
        $currentTime = $now->format('H:i');
        $sentCount = 0;

        $users = User::whereNotNull('sleep_target_time')
            ->where('is_disabled', false)
            ->get();

        foreach ($users as $user) {
            // Skip if user already confirmed sleep within the last 12 hours
            if ($user->last_sleep_confirmed_at && $user->last_sleep_confirmed_at->diffInHours($now) < 12) {
                continue;
            }

            $targetCarbon = Carbon::createFromTimeString($user->sleep_target_time);
            $alert30 = $targetCarbon->copy()->subMinutes(30)->format('H:i');
            $alert15 = $targetCarbon->copy()->subMinutes(15)->format('H:i');
            $deadline = $targetCarbon->format('H:i');

            if ($currentTime === $alert30) {
                $this->sendBedtimeAlert($user, 'alert');
                $sentCount++;
            } elseif ($currentTime === $alert15) {
                $this->sendBedtimeAlert($user, 'lockdown');
                $sentCount++;
            } elseif ($currentTime === $deadline) {
                $this->sendBedtimeAlert($user, 'deadline');
                $sentCount++;
            }
        }

        return $sentCount;
    }
}
