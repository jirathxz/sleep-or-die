<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\SleepEngineService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;

class SleepController extends Controller
{
    public function __construct(
        protected SleepEngineService $sleepEngine
    ) {}

    public function saveSettings(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'wake_up_time' => ['nullable', 'string', 'date_format:H:i'],
            'sleep_target_time' => ['nullable', 'string', 'date_format:H:i'],
            'emergency_countdown_seconds' => ['nullable', 'integer', 'min:10', 'max:300'],
            'discord_user_id' => ['nullable', 'max:50'],
            'discord_bot_token' => ['nullable', 'string', 'max:255'],
            'enable_discord_detection' => ['nullable', 'boolean'],
            'enable_cpp_detection' => ['nullable', 'boolean'],
        ]);

        $user = $request->user();

        $wakeUp = $validated['wake_up_time'] ?? null;
        $sleepTarget = $validated['sleep_target_time'] ?? null;

        if ($wakeUp && empty($sleepTarget)) {
            $sleepTarget = $this->sleepEngine->calculateSleepTarget($wakeUp);
        } elseif ($sleepTarget && empty($wakeUp)) {
            $wakeUp = \Illuminate\Support\Carbon::createFromTimeString($sleepTarget)->addMinutes((5 * 90) + 15)->format('H:i');
        }

        // If neither was provided and user doesn't have existing target, fall back to default
        if (empty($wakeUp) && empty($sleepTarget) && empty($user->sleep_target_time)) {
            $wakeUp = '07:00';
            $sleepTarget = '23:15';
        }

        $updateData = [];
        if ($wakeUp) {
            $updateData['wake_up_time'] = $wakeUp;
        }
        if ($sleepTarget) {
            $updateData['sleep_target_time'] = $sleepTarget;
        }
        if (array_key_exists('emergency_countdown_seconds', $validated) && $validated['emergency_countdown_seconds'] !== null) {
            $updateData['emergency_countdown_seconds'] = $validated['emergency_countdown_seconds'];
        }
        if (array_key_exists('discord_user_id', $validated)) {
            $updateData['discord_user_id'] = $validated['discord_user_id'] !== null ? trim((string)$validated['discord_user_id']) : null;
        }
        if (array_key_exists('discord_bot_token', $validated)) {
            $updateData['discord_bot_token'] = $validated['discord_bot_token'] !== null ? trim((string)$validated['discord_bot_token']) : null;
        }
        if (array_key_exists('enable_discord_detection', $validated)) {
            $updateData['enable_discord_detection'] = (bool)$validated['enable_discord_detection'];
        }
        if (array_key_exists('enable_cpp_detection', $validated)) {
            $updateData['enable_cpp_detection'] = (bool)$validated['enable_cpp_detection'];
        }

        $user->update($updateData);
        $user->refresh();

        $enableDiscord = (bool)($user->enable_discord_detection ?? true);
        $enableCpp = (bool)($user->enable_cpp_detection ?? true);

        return response()->json([
            'message' => 'Settings updated successfully',
            'wake_up_time' => $user->wake_up_time,
            'sleep_target_time' => $user->sleep_target_time,
            'emergency_countdown_seconds' => $user->emergency_countdown_seconds,
            'discord_user_id' => $user->discord_user_id,
            'discord_bot_token' => $user->discord_bot_token,
            'enable_discord_detection' => $enableDiscord,
            'enable_cpp_detection' => $enableCpp,
            'is_system_active' => $enableDiscord || $enableCpp,
        ]);
    }

    public function testAlert(Request $request): JsonResponse
    {
        $user = $request->user();
        $stage = $request->input('stage', 'test');

        // Allow passing credentials directly in the request or falling back to saved user credentials
        $token = $request->input('discord_bot_token') ?: $user?->discord_bot_token;
        $userId = $request->input('discord_user_id') ?: $user?->discord_user_id;

        if (empty($token) || empty($userId)) {
            return response()->json([
                'success' => false,
                'message' => 'กรุณากรอกทั้ง Discord Bot Token และ Discord User ID ก่อนทดสอบส่งการแจ้งเตือน',
            ], 422);
        }

        // Auto-save to user if authenticated so it persists immediately
        if ($user) {
            $user->update([
                'discord_bot_token' => trim((string)$token),
                'discord_user_id' => trim((string)$userId),
            ]);
            $user->refresh();
        }

        $target = $user?->sleep_target_time ?? '23:15';
        $messages = [
            'alert' => "🔔 [SleepOrDie] เหลืออีก 10 นาทีจะถึงเวลานอนเป้าหมาย ({$target} น.) กรุณาเตรียมตัวพักผ่อน",
            'lockdown' => "⚠️ [SleepOrDie] เหลืออีก 5 นาที! เข้าสู่ช่วง Lockdown กรุณาปิดหน้าจอและเตรียมเข้านอน",
            'deadline' => "🚨 [SleepOrDie] ถึงเวลาเข้านอนแล้ว ({$target} น.)! กรุณาเข้านอนทันที มิเช่นนั้นระบบจะถือว่าทำผิดวินัย",
            'test' => "✨ [SleepOrDie] ทดสอบระบบสำเร็จ! บอทสามารถส่งข้อความแจ้งเตือนเข้า Discord ของคุณได้เรียบร้อยแล้ว",
        ];

        $message = $messages[$stage] ?? $messages['test'];
        $result = $this->sleepEngine->sendDiscordDm($token, $userId, $message);

        return response()->json([
            'success' => $result['success'],
            'stage' => $stage,
            'message' => $result['message'],
            'error_code' => $result['error_code'] ?? null,
            'discord_bot_token' => $user?->discord_bot_token,
            'discord_user_id' => $user?->discord_user_id,
        ], $result['success'] ? 200 : 400);
    }

    public function confirmSleep(Request $request): JsonResponse
    {
        $user = $request->user();

        // Rule: หากอยู่ในห้องคุยไม่ถือว่านอน
        $voiceState = $this->sleepEngine->checkUserVoiceState($user);
        if ($voiceState['in_voice']) {
            $channelName = $voiceState['voice_channel'] ?? 'ห้องคุยเสียง';
            return response()->json([
                'success' => false,
                'message' => "คุณยังเชื่อมต่ออยู่ในห้องคุยเสียง Discord (\"{$channelName}\") ไม่ถือว่านอน! กรุณาออกจากห้องคุยก่อนยืนยันการนอน",
                'is_in_voice' => true,
                'voice_channel' => $channelName,
            ], 422);
        }

        $newExp = ($user->exp ?? 0) + 150;
        $level = $user->level ?? 1;
        $expThreshold = $level * 500;

        while ($newExp >= $expThreshold) {
            $newExp -= $expThreshold;
            $level += 1;
            $expThreshold = $level * 500;
        }

        $newPoints = ($user->points ?? 0) + 50;

        $user->update([
            'last_sleep_confirmed_at' => now(),
            'exp' => $newExp,
            'level' => $level,
            'points' => $newPoints,
        ]);

        return response()->json([
            'message' => 'Sleep confirmed. Entering verification window.',
            'last_sleep_confirmed_at' => $user->last_sleep_confirmed_at,
            'level' => $user->level,
            'exp' => $user->exp,
            'points' => $user->points,
            'exp_gained' => 150,
            'points_gained' => 50,
        ]);
    }

    public function useTicket(Request $request): JsonResponse
    {
        $user = $request->user();
        $success = $this->sleepEngine->useTicket($user);

        if (! $success) {
            return response()->json([
                'success' => false,
                'message' => 'Unable to use ticket (none available or deadline not set)',
            ], 422);
        }

        return response()->json([
            'success' => true,
            'new_sleep_target_time' => $user->fresh()->sleep_target_time,
            'remaining_tickets' => $user->fresh()->tickets_count,
        ]);
    }

    public function redeemTicket(Request $request): JsonResponse
    {
        $user = $request->user();
        $cost = 100;

        if (($user->points ?? 0) < $cost) {
            return response()->json([
                'success' => false,
                'message' => 'แต้มไม่เพียงพอ ต้องการ 100 แต้มเพื่อแลก 1 ตั๋วขยายเวลา',
                'points' => $user->points ?? 0,
                'tickets_count' => $user->tickets_count ?? 0,
            ], 422);
        }

        $user->update([
            'points' => $user->points - $cost,
            'tickets_count' => ($user->tickets_count ?? 0) + 1,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'แลกตั๋วขยายเวลาเรียบร้อยแล้ว (+30 นาที)',
            'points' => $user->points,
            'tickets_count' => $user->tickets_count,
        ]);
    }

    public function status(Request $request): JsonResponse
    {
        $user = $request->user();

        $enableDiscord = (bool)($user->enable_discord_detection ?? true);
        $enableCpp = (bool)($user->enable_cpp_detection ?? true);
        $isSystemActive = $enableDiscord || $enableCpp;

        // Check if user survived the night and award morning reward (only if system active)
        $rewarded = false;
        if ($isSystemActive) {
            $rewarded = $this->sleepEngine->checkMorningReward($user);
            if ($rewarded) {
                $user->refresh();
            }
        }

        $inBedtimeHours = $this->sleepEngine->isWithinBedtimeHours($user);

        // Rule: หากอยู่ในห้องคุยไม่ถือว่านอน (เฉพาะเมื่อเปิดตรวจจับ Discord)
        $voiceState = ['in_voice' => false, 'voice_channel' => null, 'guild_name' => null];
        if ($enableDiscord) {
            $voiceState = $this->sleepEngine->checkUserVoiceState($user);
            if ($voiceState['in_voice'] && $user->last_sleep_confirmed_at) {
                $user->update(['last_sleep_confirmed_at' => null]);
                $user->refresh();
            }
        }

        $isSleeping = $isSystemActive && !empty($user->last_sleep_confirmed_at) && (!$enableDiscord || !$voiceState['in_voice']);

        return response()->json([
            'current_hp' => $user->current_hp,
            'sleep_target_time' => $user->sleep_target_time,
            'wake_up_time' => $user->wake_up_time,
            'shutdown_stacks' => $user->shutdown_stacks,
            'days_survived' => $user->days_survived,
            'level' => $user->level ?? 1,
            'exp' => $user->exp ?? 0,
            'points' => $user->points ?? 0,
            'tickets_count' => $user->tickets_count,
            'is_disabled' => $user->is_disabled,
            'last_sleep_confirmed_at' => $isSleeping ? $user->last_sleep_confirmed_at : null,
            'discord_user_id' => $user->discord_user_id,
            'discord_bot_token' => $user->discord_bot_token,
            'enable_discord_detection' => $enableDiscord,
            'enable_cpp_detection' => $enableCpp,
            'is_system_active' => $isSystemActive,
            'discord_presence' => [
                'is_in_voice' => $voiceState['in_voice'],
                'voice_channel' => $voiceState['voice_channel'],
                'guild_name' => $voiceState['guild_name'] ?? null,
                'effective_status' => $voiceState['in_voice'] ? 'online' : (\Illuminate\Support\Facades\Cache::get("discord_presence_{$user->id}")['raw_status'] ?? 'offline'),
            ],
            'emergency_countdown_seconds' => $user->emergency_countdown_seconds ?? 60,
            'is_sleeping' => $isSleeping,
            'is_within_bedtime_hours' => $inBedtimeHours,
            'morning_rewarded' => $rewarded,
        ]);
    }

    public function testDiscord(Request $request): JsonResponse
    {
        $token = $request->input('discord_bot_token') ?: $request->user()?->discord_bot_token;
        $targetUserId = $request->input('discord_user_id') ?: $request->user()?->discord_user_id;

        if (empty($token)) {
            return response()->json([
                'success' => false,
                'message' => 'ไม่พบ Discord Bot Token กรุณากรอกข้อมูลในช่อง Token ก่อนทดสอบ',
            ], 422);
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bot ' . trim($token),
                'Accept' => 'application/json',
            ])->timeout(8)->get('https://discord.com/api/v10/users/@me');

            if (!$response->successful()) {
                $errorData = $response->json();
                $detail = $errorData['message'] ?? 'รหัส Token ไม่ถูกต้อง หรือไม่ได้รับสิทธิ์จากระบบ Discord';
                return response()->json([
                    'success' => false,
                    'message' => 'เชื่อมต่อกับ Discord ล้มเหลว ' . $detail,
                    'status_code' => $response->status(),
                ], 400);
            }

            $botData = $response->json();
            $botName = $botData['username'] ?? 'Discord Bot';
            $botId = $botData['id'] ?? '';

            $targetUserResult = null;
            if (!empty($targetUserId)) {
                $userResponse = Http::withHeaders([
                    'Authorization' => 'Bot ' . trim($token),
                    'Accept' => 'application/json',
                ])->timeout(8)->get("https://discord.com/api/v10/users/{$targetUserId}");

                if ($userResponse->successful()) {
                    $targetUserData = $userResponse->json();

                    // Check bot guilds and voice status
                    $isInVoice = false;
                    $voiceChannelName = null;
                    $guildName = null;

                    $guildsResponse = Http::withHeaders([
                        'Authorization' => 'Bot ' . trim($token),
                        'Accept' => 'application/json',
                    ])->timeout(8)->get("https://discord.com/api/v10/users/@me/guilds");

                    if ($guildsResponse->successful()) {
                        $guilds = $guildsResponse->json();
                        foreach ($guilds as $guild) {
                            $guildId = $guild['id'];
                            $voiceRes = Http::withHeaders([
                                'Authorization' => 'Bot ' . trim($token),
                                'Accept' => 'application/json',
                            ])->timeout(5)->get("https://discord.com/api/v10/guilds/{$guildId}/voice-states/{$targetUserId}");

                            if ($voiceRes->successful()) {
                                $voiceData = $voiceRes->json();
                                if (!empty($voiceData['channel_id'])) {
                                    $isInVoice = true;
                                    $guildName = $guild['name'] ?? 'Discord Server';
                                    $channelRes = Http::withHeaders([
                                        'Authorization' => 'Bot ' . trim($token),
                                        'Accept' => 'application/json',
                                    ])->timeout(5)->get("https://discord.com/api/v10/channels/{$voiceData['channel_id']}");
                                    if ($channelRes->successful()) {
                                        $voiceChannelName = $channelRes->json('name') ?? 'Voice Room';
                                    }
                                    break;
                                }
                            }
                        }
                    }

                    $cachedPresence = \Illuminate\Support\Facades\Cache::get("discord_presence_{$request->user()?->id}");
                    $rawStatus = $cachedPresence['raw_status'] ?? ($isInVoice ? 'online' : 'offline');

                    // Rule 2: If in voice room, effective status is online
                    $effectiveStatus = $isInVoice ? 'online' : $rawStatus;
                    $isConsideredOnline = $isInVoice || in_array($rawStatus, ['online', 'dnd']);

                    $targetUserResult = [
                        'found' => true,
                        'username' => $targetUserData['username'] ?? '',
                        'global_name' => $targetUserData['global_name'] ?? $targetUserData['username'] ?? '',
                        'id' => $targetUserData['id'] ?? $targetUserId,
                        'raw_status' => $rawStatus,
                        'is_in_voice' => $isInVoice,
                        'voice_channel' => $voiceChannelName,
                        'guild_name' => $guildName,
                        'effective_status' => $effectiveStatus,
                        'is_considered_online' => $isConsideredOnline,
                        'reason' => $isInVoice
                            ? "กำลังอยู่ในห้องคุยเสียง \"{$voiceChannelName}\" (ถือว่าออนไลน์ตามกฎข้อ 2)"
                            : "สถานะที่ตั้งไว้: " . strtoupper($rawStatus) . " (ไม่ได้อยู่ในห้องคุย)",
                    ];

                    if ($request->user()) {
                        \Illuminate\Support\Facades\Cache::put("discord_presence_{$request->user()->id}", [
                            'discord_user_id' => $targetUserId,
                            'effective_status' => $effectiveStatus,
                            'raw_status' => $rawStatus,
                            'is_in_voice' => $isInVoice,
                            'voice_channel' => $voiceChannelName,
                            'guild_name' => $guildName,
                            'updated_at' => now()->toIso8601String(),
                        ], now()->addDay());
                    }
                } else {
                    $targetUserResult = [
                        'found' => false,
                        'message' => 'ไม่พบข้อมูลผู้ใช้จาก Discord User ID ที่ระบุ หรือบอทยังไม่ได้แชร์เซิร์ฟเวอร์ร่วมกัน',
                    ];
                }
            }

            if ($request->user() && !empty($token)) {
                $updateData = ['discord_bot_token' => trim($token)];
                if (!empty($targetUserId)) {
                    $updateData['discord_user_id'] = trim($targetUserId);
                }
                $request->user()->update($updateData);
                $request->user()->refresh();
            }

            return response()->json([
                'success' => true,
                'message' => 'เชื่อมต่อ Discord สำเร็จ บอทออนไลน์และพร้อมทำงาน',
                'bot' => [
                    'id' => $botId,
                    'username' => $botName,
                ],
                'target_user' => $targetUserResult,
                'discord_bot_token' => $request->user()?->discord_bot_token,
                'discord_user_id' => $request->user()?->discord_user_id,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'เกิดข้อผิดพลาดในการเชื่อมต่อไปยัง Discord API ' . $e->getMessage(),
            ], 500);
        }
    }

    public function handlePresenceUpdate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'discord_user_id' => ['nullable', 'string'],
            'user_id' => ['nullable', 'integer'],
            'email' => ['nullable', 'string'],
            'status' => ['required', 'string'],
            'raw_status' => ['nullable', 'string'],
            'is_in_voice' => ['nullable', 'boolean'],
            'voice_channel' => ['nullable', 'string'],
            'guild_name' => ['nullable', 'string'],
            'source' => ['nullable', 'string'],
            'idle_seconds' => ['nullable', 'numeric'],
            'screen_locked' => ['nullable', 'boolean'],
            'is_active' => ['nullable', 'boolean'],
            'simulate_sleep' => ['nullable', 'boolean'],
            'wake_up_simulation' => ['nullable', 'boolean'],
        ]);

        $user = null;
        if (!empty($validated['discord_user_id'])) {
            $user = User::where('discord_user_id', $validated['discord_user_id'])->first();
        } elseif (!empty($validated['user_id'])) {
            $user = User::find($validated['user_id']);
        } elseif (!empty($validated['email'])) {
            $user = User::where('email', $validated['email'])->first();
        }

        if (!$user && $request->user()) {
            $user = $request->user();
        }

        if (! $user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $source = $validated['source'] ?? 'discord';
        $meta = [
            'idle_seconds' => $validated['idle_seconds'] ?? null,
            'screen_locked' => $validated['screen_locked'] ?? false,
            'is_active' => $validated['is_active'] ?? null,
            'is_in_voice' => (bool)($validated['is_in_voice'] ?? false),
            'voice_channel' => $validated['voice_channel'] ?? null,
            'guild_name' => $validated['guild_name'] ?? null,
            'simulate_sleep' => (bool)($validated['simulate_sleep'] ?? false),
            'wake_up_simulation' => (bool)($validated['wake_up_simulation'] ?? false),
        ];

        // Cache live presence for quick dashboard feedback
        $effectiveStatus = !empty($validated['is_in_voice']) ? 'online' : strtolower($validated['status']);
        \Illuminate\Support\Facades\Cache::put("discord_presence_{$user->id}", [
            'discord_user_id' => $user->discord_user_id,
            'effective_status' => $effectiveStatus,
            'raw_status' => strtolower($validated['raw_status'] ?? $validated['status']),
            'is_in_voice' => (bool)($validated['is_in_voice'] ?? false),
            'voice_channel' => $validated['voice_channel'] ?? null,
            'guild_name' => $validated['guild_name'] ?? null,
            'updated_at' => now()->toIso8601String(),
        ], now()->addDay());

        $result = $this->sleepEngine->handlePresence($user, $validated['status'], $source, $meta);

        $bedtimeHour = 23;
        $bedtimeMinute = 15;
        if (!empty($user->sleep_target_time)) {
            $parts = explode(':', $user->sleep_target_time);
            $bedtimeHour = (int)$parts[0];
            $bedtimeMinute = (int)($parts[1] ?? 0);
        }

        $wakeUpHour = 7;
        $wakeUpMinute = 0;
        if (!empty($user->wake_up_time)) {
            $parts = explode(':', $user->wake_up_time);
            $wakeUpHour = (int)$parts[0];
            $wakeUpMinute = (int)($parts[1] ?? 0);
        }

        $enableDiscord = (bool)($user->enable_discord_detection ?? true);
        $enableCpp = (bool)($user->enable_cpp_detection ?? true);

        $result['daemon_config'] = [
            'emergency_countdown_seconds' => $user->emergency_countdown_seconds ?? 60,
            'bedtime_hour' => $bedtimeHour,
            'bedtime_minute' => $bedtimeMinute,
            'wake_up_hour' => $wakeUpHour,
            'wake_up_minute' => $wakeUpMinute,
            'current_hp' => $user->current_hp ?? 100,
            'enable_discord_detection' => $enableDiscord,
            'enable_cpp_detection' => $enableCpp,
            'is_system_active' => $enableDiscord || $enableCpp,
        ];

        return response()->json($result);
    }

    public function daemonLogin(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
            ], 401);
        }

        $bedtimeHour = 23;
        $bedtimeMinute = 15;
        if (!empty($user->sleep_target_time)) {
            $parts = explode(':', $user->sleep_target_time);
            $bedtimeHour = (int)$parts[0];
            $bedtimeMinute = (int)($parts[1] ?? 0);
        }

        $wakeUpHour = 7;
        $wakeUpMinute = 0;
        if (!empty($user->wake_up_time)) {
            $parts = explode(':', $user->wake_up_time);
            $wakeUpHour = (int)$parts[0];
            $wakeUpMinute = (int)($parts[1] ?? 0);
        }

        $token = bin2hex(random_bytes(24));
        $enableDiscord = (bool)($user->enable_discord_detection ?? true);
        $enableCpp = (bool)($user->enable_cpp_detection ?? true);

        return response()->json([
            'success' => true,
            'user_id' => $user->id,
            'email' => $user->email,
            'name' => $user->name,
            'token' => $token,
            'bedtime_hour' => $bedtimeHour,
            'bedtime_minute' => $bedtimeMinute,
            'wake_up_hour' => $wakeUpHour,
            'wake_up_minute' => $wakeUpMinute,
            'emergency_countdown_seconds' => $user->emergency_countdown_seconds ?? 60,
            'current_hp' => $user->current_hp ?? 100,
            'enable_discord_detection' => $enableDiscord,
            'enable_cpp_detection' => $enableCpp,
            'is_system_active' => $enableDiscord || $enableCpp,
        ]);
    }
}
