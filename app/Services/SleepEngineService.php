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
        $enableDiscord = (bool)($user->enable_discord_detection ?? true);
        $enableCpp = (bool)($user->enable_cpp_detection ?? true);
        $isSystemActive = $enableDiscord || $enableCpp;

        // If neither is enabled, system is completely inactive
        if (!$isSystemActive) {
            return [
                'penalized' => false,
                'auto_confirmed' => false,
                'is_sleeping' => false,
                'is_system_active' => false,
                'message' => 'ระบบไม่ได้ทำงาน: ปิดการตรวจจับทั้ง Discord และ C++',
                'current_hp' => $user->current_hp,
            ];
        }

        // Filter out signals from disabled sources
        if ($source === 'discord' && !$enableDiscord) {
            return [
                'penalized' => false,
                'auto_confirmed' => false,
                'is_sleeping' => (bool)$user->last_sleep_confirmed_at,
                'is_system_active' => true,
                'message' => 'ปิดการตรวจจับผ่าน Discord Bot ตามการตั้งค่า',
                'current_hp' => $user->current_hp,
            ];
        }

        if ($source === 'desktop_daemon' && !$enableCpp) {
            return [
                'penalized' => false,
                'auto_confirmed' => false,
                'is_sleeping' => (bool)$user->last_sleep_confirmed_at,
                'is_system_active' => true,
                'message' => 'ปิดการตรวจจับผ่าน C++ Guard ตามการตั้งค่า',
                'current_hp' => $user->current_hp,
            ];
        }

        // C++ Tray Test Mode: Simulate Sleeping / Wake up
        if ($source === 'desktop_daemon' && !empty($meta['simulate_sleep'])) {
            $voiceState = $enableDiscord ? $this->checkUserVoiceState($user) : ['in_voice' => false];
            if ($voiceState['in_voice']) {
                $chName = $voiceState['voice_channel'] ?? 'ห้องคุยเสียง';
                return [
                    'penalized' => false,
                    'auto_confirmed' => false,
                    'is_sleeping' => false,
                    'is_system_active' => true,
                    'message' => "โหมดทดสอบ C++: ตรวจพบอยู่ในห้องคุยเสียง Discord (\"{$chName}\") ไม่ถือว่านอน",
                    'current_hp' => $user->current_hp,
                ];
            }

            $user->update(['last_sleep_confirmed_at' => now()]);
            return [
                'penalized' => false,
                'auto_confirmed' => true,
                'is_sleeping' => true,
                'is_system_active' => true,
                'message' => 'C++ Tray: เปิดใช้งานโหมดทดสอบเข้านอนสำเร็จ (บันทึกสถานะนอนแล้ว)',
                'current_hp' => $user->current_hp,
            ];
        }

        if ($source === 'desktop_daemon' && !empty($meta['wake_up_simulation'])) {
            $user->update(['last_sleep_confirmed_at' => null]);
            return [
                'penalized' => false,
                'auto_confirmed' => false,
                'is_sleeping' => false,
                'is_system_active' => true,
                'message' => 'C++ Tray: ยกเลิกโหมดทดสอบเข้านอน กลับสู่สถานะตื่นปกติ',
                'current_hp' => $user->current_hp,
            ];
        }

        $status = strtolower($status);
        $isInVoice = $enableDiscord && !empty($meta['is_in_voice']);

        $isScreenLocked = !empty($meta['screen_locked']);
        $idleSeconds = isset($meta['idle_seconds']) ? (int)$meta['idle_seconds'] : null;
        $isPcActive = ($source === 'desktop_daemon') && empty($meta['simulate_sleep']) && !$isScreenLocked && ($idleSeconds === null || $idleSeconds < 60);

        if ($source === 'desktop_daemon') {
            \Illuminate\Support\Facades\Cache::put("cpp_presence_{$user->id}", [
                'is_pc_online' => $isPcActive,
                'idle_seconds' => $idleSeconds,
                'screen_locked' => $isScreenLocked,
                'status' => $status,
                'updated_at' => now()->toIso8601String(),
            ], now()->addMinutes(5));
        }

        // Process alert action if triggered from C++ or API
        if (!empty($meta['alert_action'])) {
            if ($meta['alert_action'] === 'acknowledge') {
                $this->acknowledgeAlert($user);
            } elseif ($meta['alert_action'] === 'acknowledge_lockdown') {
                $this->acknowledgeLockdown($user);
            } elseif ($meta['alert_action'] === 'acknowledge_sleep_warning') {
                $this->escalateToShutdown($user);
            } elseif ($meta['alert_action'] === 'trigger') {
                $this->triggerAlertSequence($user, $user->emergency_countdown_seconds ?? 60);
            } elseif ($meta['alert_action'] === 'reset') {
                $this->resetAlertState($user);
            }
        }

        // Check if user returned to PC after acknowledging alert or lockdown
        $currentAlert = $this->getAlertState($user);
        if ($enableCpp && $isPcActive) {
            if ($currentAlert['phase'] === 'acknowledged_alert') {
                $this->acknowledgeAlert($user, true); // Escalate to lockdown (Mock Sign Out)
            } elseif ($currentAlert['phase'] === 'acknowledged_lockdown') {
                $this->escalateToSleepWarning($user); // Escalate to sleep_warning (-25 HP)
            }
        }

        $isOffline = in_array($status, ['offline', 'idle', 'invisible']) ||
            (!empty($meta['screen_locked'])) ||
            (isset($meta['idle_seconds']) && $meta['idle_seconds'] >= 60);

        $isOnline = in_array($status, ['online', 'dnd']) ||
            (!empty($meta['is_active']) && empty($meta['screen_locked']) && (!isset($meta['idle_seconds']) || $meta['idle_seconds'] < 60)) ||
            ($enableCpp && $isPcActive);

        $inBedtimeHours = $this->isWithinBedtimeHours($user);
        $isInVerifyingWindow = $user->last_sleep_confirmed_at &&
            $user->last_sleep_confirmed_at->diffInMinutes(now()) <= 10;

        // Rule 1: หาก C++ ยังตรวจเจอว่า PC ยัง online อยู่คือแสดงว่ายังไม่นอน
        if ($enableCpp && $isPcActive) {
            $isOnline = true;
            $isOffline = false;

            if ($user->last_sleep_confirmed_at) {
                $user->update(['last_sleep_confirmed_at' => null]);
            }
        }

        // Rule 2: If user is currently in a voice channel, always considered online and NEVER sleeping
        if ($isInVoice) {
            $isOnline = true;
            $isOffline = false;

            if ($user->last_sleep_confirmed_at) {
                $user->update(['last_sleep_confirmed_at' => null]);

                if ($inBedtimeHours || $isInVerifyingWindow) {
                    $this->drainHp($user, 25);
                    return [
                        'penalized' => true,
                        'auto_confirmed' => false,
                        'is_sleeping' => false,
                        'is_system_active' => true,
                        'alert_state' => $this->getAlertState($user),
                        'message' => 'ตรวจพบผู้ใช้อยู่ในห้องคุยเสียง Discord ระหว่างเวลานอน! ไม่ถือว่านอน และหัก HP 25 แต้ม',
                        'current_hp' => $user->fresh()->current_hp,
                    ];
                }

                return [
                    'penalized' => false,
                    'auto_confirmed' => false,
                    'is_sleeping' => false,
                    'is_system_active' => true,
                    'alert_state' => $this->getAlertState($user),
                    'message' => 'ตรวจพบผู้ใช้อยู่ในห้องคุยเสียง Discord ไม่ถือว่านอน ยกเลิกสถานะการนอนทันที',
                    'current_hp' => $user->current_hp,
                ];
            }
        }

        // Case 1: In bedtime hours and user goes offline / locks PC -> Auto-confirm sleep ("ถือว่าผู้ใช้ไปนอนแล้ว")
        if ($inBedtimeHours && $isOffline && !$isInVoice) {
            if (!$user->last_sleep_confirmed_at) {
                $user->update([
                    'last_sleep_confirmed_at' => now(),
                ]);

                return [
                    'penalized' => false,
                    'auto_confirmed' => true,
                    'is_sleeping' => true,
                    'is_system_active' => true,
                    'alert_state' => $this->getAlertState($user),
                    'message' => 'ตรวจพบผู้ใช้ออฟไลน์/ล็อคหน้าจอในช่วงเวลานอน ถือว่าเข้านอนเรียบร้อยแล้ว',
                    'current_hp' => $user->current_hp,
                ];
            }

            return [
                'penalized' => false,
                'auto_confirmed' => false,
                'is_sleeping' => true,
                'is_system_active' => true,
                'alert_state' => $this->getAlertState($user),
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
                'is_system_active' => true,
                'alert_state' => $this->getAlertState($user),
                'message' => 'ตรวจพบผู้ใช้กลับมาออนไลน์หรือใช้งานคอมพิวเตอร์ระหว่างเวลานอน! หัก HP 25 แต้ม',
                'current_hp' => $user->fresh()->current_hp,
            ];
        }

        return [
            'penalized' => false,
            'auto_confirmed' => false,
            'is_sleeping' => !$isInVoice && (bool)$user->last_sleep_confirmed_at,
            'is_system_active' => true,
            'alert_state' => $this->getAlertState($user),
            'message' => $isInVoice ? 'ตรวจพบผู้ใช้อยู่ในห้องคุยเสียง Discord ไม่ถือว่านอน' : 'อัปเดตสถานะ Presence เรียบร้อย',
            'current_hp' => $user->current_hp,
        ];
    }

    /**
     * Check if user is currently connected to a Discord voice channel.
     */
    public function checkUserVoiceState(User $user): array
    {
        $cached = \Illuminate\Support\Facades\Cache::get("discord_presence_{$user->id}");
        if ($cached && isset($cached['is_in_voice'])) {
            return [
                'in_voice' => (bool)$cached['is_in_voice'],
                'voice_channel' => $cached['voice_channel'] ?? null,
                'guild_name' => $cached['guild_name'] ?? null,
            ];
        }

        if (empty($user->discord_bot_token) || empty($user->discord_user_id)) {
            return ['in_voice' => false, 'voice_channel' => null, 'guild_name' => null];
        }

        try {
            $token = trim($user->discord_bot_token);
            $userId = trim($user->discord_user_id);

            $guildsRes = \Illuminate\Support\Facades\Http::withHeaders([
                'Authorization' => 'Bot ' . $token,
                'Accept' => 'application/json',
            ])->timeout(4)->get('https://discord.com/api/v10/users/@me/guilds');

            if ($guildsRes->successful()) {
                foreach ($guildsRes->json() as $guild) {
                    $guildId = $guild['id'];
                    $voiceRes = \Illuminate\Support\Facades\Http::withHeaders([
                        'Authorization' => 'Bot ' . $token,
                        'Accept' => 'application/json',
                    ])->timeout(3)->get("https://discord.com/api/v10/guilds/{$guildId}/voice-states/{$userId}");

                    if ($voiceRes->successful()) {
                        $voiceData = $voiceRes->json();
                        if (!empty($voiceData['channel_id'])) {
                            $channelName = 'Voice Room';
                            $channelRes = \Illuminate\Support\Facades\Http::withHeaders([
                                'Authorization' => 'Bot ' . $token,
                                'Accept' => 'application/json',
                            ])->timeout(3)->get("https://discord.com/api/v10/channels/{$voiceData['channel_id']}");
                            if ($channelRes->successful()) {
                                $channelName = $channelRes->json('name') ?? $channelName;
                            }

                            $result = [
                                'in_voice' => true,
                                'voice_channel' => $channelName,
                                'guild_name' => $guild['name'] ?? 'Discord Server',
                            ];

                            \Illuminate\Support\Facades\Cache::put("discord_presence_{$user->id}", [
                                'discord_user_id' => $userId,
                                'effective_status' => 'online',
                                'raw_status' => 'online',
                                'is_in_voice' => true,
                                'voice_channel' => $channelName,
                                'guild_name' => $guild['name'] ?? null,
                                'updated_at' => now()->toIso8601String(),
                            ], now()->addDay());

                            return $result;
                        }
                    }
                }
            }
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning('Error checking user voice state: ' . $e->getMessage());
        }

        return ['in_voice' => false, 'voice_channel' => null, 'guild_name' => null];
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

        // Must now be morning (outside bedtime hours) AND sleep must have started during bedtime hours
        if (!$this->isWithinBedtimeHours($user, $now) && $this->isWithinBedtimeHours($user, $user->last_sleep_confirmed_at)) {
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
    public function sendDiscordDm(string $botToken, string $userId, string $message): array
    {
        $botToken = trim($botToken);
        $userId = trim($userId);

        if (empty($botToken)) {
            return [
                'success' => false,
                'message' => 'ไม่พบ Discord Bot Token กรุณากรอก Token บอทในช่องการตั้งค่า',
            ];
        }

        if (empty($userId)) {
            return [
                'success' => false,
                'message' => 'ไม่พบ Discord User ID กรุณากรอก Discord User ID ของคุณ',
            ];
        }

        try {
            $channelRes = Http::withHeaders([
                'Authorization' => 'Bot ' . $botToken,
                'Accept' => 'application/json',
                'Content-Type' => 'application/json',
            ])->timeout(8)->post('https://discord.com/api/v10/users/@me/channels', [
                'recipient_id' => $userId,
            ]);

            if (! $channelRes->successful()) {
                $err = $channelRes->json() ?? [];
                $code = $err['code'] ?? 0;
                $errMsg = $err['message'] ?? 'เปิดห้องแชท DM ไม่สำเร็จ';

                if ($code === 50007) {
                    $explanation = 'บอทไม่สามารถส่งข้อความถึงคุณได้: โปรดตรวจสอบว่าบอทและคุณอยู่ในเซิร์ฟเวอร์เดียวกัน และเปิดรับข้อความ Direct Message จากสมาชิกเซิร์ฟเวอร์';
                } elseif ($code === 10013) {
                    $explanation = 'ไม่พบบัญชีผู้ใช้จาก Discord User ID นี้ โปรดตรวจสอบว่าคัดลอก User ID ถูกต้อง (เป็นตัวเลข 17-19 หลัก)';
                } elseif ($channelRes->status() === 401) {
                    $explanation = 'Bot Token ไม่ถูกต้อง หรือไม่ได้รับสิทธิ์ Bot จาก Discord Developer Portal';
                } else {
                    $explanation = "Discord ปฏิเสธ: {$errMsg} (รหัส {$code})";
                }

                Log::warning('Discord create DM channel failed', [
                    'status' => $channelRes->status(),
                    'body' => $channelRes->body(),
                    'user_id' => $userId,
                ]);

                return [
                    'success' => false,
                    'message' => $explanation,
                    'error_code' => $code,
                ];
            }

            $channelId = $channelRes->json('id');

            $msgRes = Http::withHeaders([
                'Authorization' => 'Bot ' . $botToken,
                'Accept' => 'application/json',
                'Content-Type' => 'application/json',
            ])->timeout(8)->post("https://discord.com/api/v10/channels/{$channelId}/messages", [
                'content' => $message,
            ]);

            if (! $msgRes->successful()) {
                $err = $msgRes->json() ?? [];
                $code = $err['code'] ?? 0;
                $errMsg = $err['message'] ?? 'ส่งข้อความไม่สำเร็จ';

                return [
                    'success' => false,
                    'message' => "ส่งข้อความเข้าห้อง DM ไม่สำเร็จ: {$errMsg} (รหัส {$code})",
                    'error_code' => $code,
                ];
            }

            return [
                'success' => true,
                'message' => 'ส่งข้อความแจ้งเตือนเข้า Discord Direct Message สำเร็จเรียบร้อยแล้ว!',
                'channel_id' => $channelId,
            ];
        } catch (\Throwable $e) {
            Log::error('Discord DM send error: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'เกิดข้อผิดพลาดในการเชื่อมต่อกับ Discord API: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Send bedtime notification to a user via Discord DM.
     */
    public function sendBedtimeAlert(User $user, string $stage = 'deadline'): array
    {
        $target = $user->sleep_target_time ?? '23:15';
        $messages = [
            'alert' => "🔔 [SleepOrDie] เหลืออีก 30 นาทีจะถึงเวลานอนเป้าหมาย ({$target} น.) กรุณาเตรียมตัวพักผ่อน",
            'lockdown' => "⚠️ [SleepOrDie] เหลืออีก 15 นาที! เข้าสู่ช่วง Lockdown กรุณาปิดหน้าจอและเตรียมเข้านอน",
            'deadline' => "🚨 [SleepOrDie] ถึงเวลาเข้านอนแล้ว ({$target} น.)! กรุณาเข้านอนทันที มิเช่นนั้นระบบจะถือว่าทำผิดวินัย",
            'test' => "✨ [SleepOrDie] ยินดีด้วย! การเชื่อมต่อ Discord ของคุณทำงานได้สมบูรณ์แบบ บอทสามารถส่งแจ้งเตือนถึงคุณได้จริง",
        ];

        $message = $messages[$stage] ?? $messages['deadline'];

        if (empty($user->discord_bot_token) || empty($user->discord_user_id)) {
            return [
                'success' => false,
                'message' => 'ยังไม่ได้ระบุ Discord Bot Token หรือ Discord User ID ของบัญชีนี้',
            ];
        }

        return $this->sendDiscordDm($user->discord_bot_token, $user->discord_user_id, $message);
    }

    /**
     * Check users and trigger bedtime alerts based on target time.
     */
    public function checkAndSendBedtimeAlerts(?Carbon $now = null): int
    {
        $now = $now ? Carbon::parse($now) : now();
        $currentTime = $now->format('H:i');
        $sentCount = 0;

        $users = User::whereNotNull('sleep_target_time')
            ->whereNotNull('discord_bot_token')
            ->whereNotNull('discord_user_id')
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

            $stage = match ($currentTime) {
                $alert30 => 'alert',
                $alert15 => 'lockdown',
                $deadline => 'deadline',
                default => null,
            };

            if ($stage) {
                // Dispatch queued closure or execute safely without hanging cron
                if (app()->runningUnitTests()) {
                    $this->sendBedtimeAlert($user, $stage);
                } else {
                    dispatch(fn() => app(SleepEngineService::class)->sendBedtimeAlert($user, $stage));
                }
                $sentCount++;
            }
        }

        return $sentCount;
    }

    /**
     * Get the active alert synchronization state for a user.
     */
    public function getAlertState(User $user): array
    {
        $cached = \Illuminate\Support\Facades\Cache::get("alert_state_{$user->id}");
        if ($cached && is_array($cached)) {
            return $cached;
        }

        $countdown = $user->emergency_countdown_seconds ?? 60;
        return [
            'phase' => 'idle', // 'idle' | 'alert' | 'lockdown' | 'sleep_warning' | 'shutdown'
            'seconds_remaining' => $countdown,
            'total_seconds' => $countdown,
            'is_paused' => false,
            'step_index' => 0,
            'step_title' => '',
            'step_message' => '',
            'acknowledged' => false,
            'updated_at' => now()->toIso8601String(),
        ];
    }

    /**
     * Trigger Phase 1 Alert (60 seconds, real countdown ticking, pauseable).
     */
    public function triggerAlertSequence(User $user, ?int $seconds = null, bool $paused = true): array
    {
        $total = $seconds ?? ($user->emergency_countdown_seconds ?? 60);
        $state = [
            'phase' => 'alert',
            'seconds_remaining' => $total,
            'total_seconds' => $total,
            'is_paused' => $paused,
            'step_index' => 1,
            'step_title' => '🚨 แจ้งเตือนเวลาเข้านอน (Alert)',
            'step_message' => 'ถึงเวลาพักผ่อนและเข้านอนแล้ว กรุณากดเข้าใจแล้วและปิดเครื่องเพื่อเข้านอน',
            'acknowledged' => false,
            'triggered_at' => now()->toIso8601String(),
            'updated_at' => now()->toIso8601String(),
        ];

        \Illuminate\Support\Facades\Cache::put("alert_state_{$user->id}", $state, now()->addHours(2));
        return $state;
    }

    /**
     * User clicked "เข้าใจแล้ว" on Alert:
     * If user does NOT sleep / PC is still online, escalate to Lockdown (Mock Sign Out).
     */
    public function acknowledgeAlert(User $user, bool $forceEscalate = true): array
    {
        $total = $user->emergency_countdown_seconds ?? 60;

        if ($forceEscalate) {
            $state = [
                'phase' => 'lockdown',
                'seconds_remaining' => $total,
                'total_seconds' => $total,
                'is_paused' => true,
                'step_index' => 2,
                'step_title' => '🔒 เข้าสู่โหมด Lockdown (จำลอง Sign Out Windows)',
                'step_message' => 'ระบบจำลองการออกจากระบบ Windows (Sign Out) เพื่อบังคับวินัยการเข้านอน หากยังฝ่าฝืนกลับมาใช้งานอีกจะถูกตัด HP 25 แต้ม',
                'acknowledged' => false,
                'triggered_at' => now()->toIso8601String(),
                'updated_at' => now()->toIso8601String(),
            ];
        } else {
            $state = [
                'phase' => 'acknowledged_alert',
                'seconds_remaining' => $total,
                'total_seconds' => $total,
                'is_paused' => true,
                'step_index' => 1,
                'step_title' => 'รับทราบการแจ้งเตือนแล้ว',
                'step_message' => 'กรุณาปิดเครื่องคอมพิวเตอร์และเข้านอนทันที',
                'acknowledged' => true,
                'acknowledged_at' => now()->toIso8601String(),
                'updated_at' => now()->toIso8601String(),
            ];
        }

        \Illuminate\Support\Facades\Cache::put("alert_state_{$user->id}", $state, now()->addHours(2));
        return $state;
    }

    /**
     * User clicked "เข้าใจแล้ว" on Lockdown:
     * Next step if they return to PC is sleep_warning (-25 HP).
     */
    public function acknowledgeLockdown(User $user): array
    {
        $total = $user->emergency_countdown_seconds ?? 60;
        $state = [
            'phase' => 'acknowledged_lockdown',
            'seconds_remaining' => $total,
            'total_seconds' => $total,
            'is_paused' => false,
            'step_index' => 2,
            'step_title' => 'รับทราบโหมด Lockdown แล้ว',
            'step_message' => 'หากตรวจพบการกลับมาใช้งานคอมพิวเตอร์ ระบบจะตัด HP 25 แต้มและจำลอง Sleep Mode',
            'acknowledged' => true,
            'acknowledged_at' => now()->toIso8601String(),
            'updated_at' => now()->toIso8601String(),
        ];

        \Illuminate\Support\Facades\Cache::put("alert_state_{$user->id}", $state, now()->addHours(2));
        return $state;
    }

    /**
     * Escalate to Sleep Warning (-25 HP) when user returns after lockdown.
     */
    public function escalateToSleepWarning(User $user): array
    {
        $this->drainHp($user, 25);
        $total = $user->emergency_countdown_seconds ?? 60;

        $state = [
            'phase' => 'sleep_warning',
            'seconds_remaining' => $total,
            'total_seconds' => $total,
            'is_paused' => false,
            'step_index' => 3,
            'step_title' => '⚠️ ตรวจพบกลับมาใช้งาน! หัก HP 25 แต้ม (จำลอง Sleep Mode)',
            'step_message' => 'ตรวจพบการกลับมาใช้งานคอมพิวเตอร์! ระบบทำการหัก HP 25 แต้ม และจำลอง Windows Sleep Mode หากยังฝ่าฝืนจะถูก Shutdown',
            'acknowledged' => false,
            'updated_at' => now()->toIso8601String(),
        ];

        \Illuminate\Support\Facades\Cache::put("alert_state_{$user->id}", $state, now()->addHours(2));
        return $state;
    }

    /**
     * Escalate to Shutdown (0% HP).
     */
    public function escalateToShutdown(User $user): array
    {
        $user->update(['current_hp' => 0]);
        $state = [
            'phase' => 'shutdown',
            'seconds_remaining' => 0,
            'total_seconds' => $user->emergency_countdown_seconds ?? 60,
            'is_paused' => true,
            'step_index' => 4,
            'step_title' => '🚨 เข้าสู่สถานะ Shutdown (จำลองปิดระบบ 0% HP)',
            'step_message' => 'พลังชีวิตหมดลง! ระบบจำลองการปิดเครื่อง Shutdown สมบูรณ์แบบเพื่อรักษาวินัย',
            'acknowledged' => true,
            'updated_at' => now()->toIso8601String(),
        ];

        \Illuminate\Support\Facades\Cache::put("alert_state_{$user->id}", $state, now()->addHours(2));
        return $state;
    }

    /**
     * Toggle pause / resume on alert countdown.
     */
    public function toggleAlertPause(User $user): array
    {
        $state = $this->getAlertState($user);
        if ($state['phase'] !== 'idle') {
            $state['is_paused'] = !($state['is_paused'] ?? false);
            $state['updated_at'] = now()->toIso8601String();
            \Illuminate\Support\Facades\Cache::put("alert_state_{$user->id}", $state, now()->addHours(2));
        }
        return $state;
    }

    /**
     * Update remaining seconds for alert countdown from client sync.
     */
    public function updateAlertSeconds(User $user, int $secondsRemaining): array
    {
        $state = $this->getAlertState($user);
        if ($state['phase'] !== 'idle') {
            $state['seconds_remaining'] = max(0, $secondsRemaining);
            $state['updated_at'] = now()->toIso8601String();
            \Illuminate\Support\Facades\Cache::put("alert_state_{$user->id}", $state, now()->addHours(2));
        }
        return $state;
    }

    /**
     * Reset alert state back to idle.
     */
    public function resetAlertState(User $user): array
    {
        \Illuminate\Support\Facades\Cache::forget("alert_state_{$user->id}");
        return $this->getAlertState($user);
    }

    /**
     * Reset user HP back to 100%, clear penalties, and reset alert state.
     */
    public function resetHp(User $user): void
    {
        $user->update([
            'current_hp' => 100,
            'shutdown_stacks' => 0,
            'is_disabled' => false,
            'last_sleep_confirmed_at' => null,
        ]);

        $this->resetAlertState($user);
    }
}
