<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\SleepEngineService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
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
            'discord_user_id' => ['nullable', 'string', 'max:50'],
            'discord_bot_token' => ['nullable', 'string', 'max:255'],
        ]);

        if (empty($validated['wake_up_time']) && empty($validated['sleep_target_time'])) {
            return response()->json([
                'message' => 'The wake up time or sleep target time field is required.',
                'errors' => ['wake_up_time' => ['กรุณาระบุเวลาตื่นนอนหรือเวลาเข้านอน']],
            ], 422);
        }

        $wakeUp = $validated['wake_up_time'] ?? null;
        $sleepTarget = $validated['sleep_target_time'] ?? null;

        if ($wakeUp && empty($sleepTarget)) {
            $sleepTarget = $this->sleepEngine->calculateSleepTarget($wakeUp);
        } elseif ($sleepTarget && empty($wakeUp)) {
            $wakeUp = \Illuminate\Support\Carbon::createFromTimeString($sleepTarget)->addMinutes((5 * 90) + 15)->format('H:i');
        }

        $user = $request->user();
        $user->update([
            'wake_up_time' => $wakeUp,
            'sleep_target_time' => $sleepTarget,
            'discord_user_id' => array_key_exists('discord_user_id', $validated) ? $validated['discord_user_id'] : $user->discord_user_id,
            'discord_bot_token' => array_key_exists('discord_bot_token', $validated) ? $validated['discord_bot_token'] : $user->discord_bot_token,
        ]);

        return response()->json([
            'message' => 'Settings updated successfully',
            'wake_up_time' => $user->wake_up_time,
            'sleep_target_time' => $user->sleep_target_time,
            'discord_user_id' => $user->discord_user_id,
            'discord_bot_token' => $user->discord_bot_token,
        ]);
    }

    public function testAlert(Request $request): JsonResponse
    {
        $user = $request->user();
        $stage = $request->input('stage', 'deadline');

        $sent = $this->sleepEngine->sendBedtimeAlert($user, $stage);

        return response()->json([
            'success' => $sent,
            'stage' => $stage,
            'message' => $sent
                ? "ส่งการแจ้งเตือนระดับ {$stage} เรียบร้อยแล้ว"
                : "ไม่สามารถส่งการแจ้งเตือนได้ กรุณาตรวจสอบการตั้งค่า Discord",
        ]);
    }

    public function confirmSleep(Request $request): JsonResponse
    {
        $user = $request->user();

        $newExp = ($user->exp ?? 0) + 150;
        $level = $user->level ?? 1;
        $expThreshold = $level * 500;

        while ($newExp >= $expThreshold) {
            $newExp -= $expThreshold;
            $level += 1;
            $expThreshold = $level * 500;
        }

        $user->update([
            'last_sleep_confirmed_at' => now(),
            'exp' => $newExp,
            'level' => $level,
        ]);

        return response()->json([
            'message' => 'Sleep confirmed. Entering verification window.',
            'last_sleep_confirmed_at' => $user->last_sleep_confirmed_at,
            'level' => $user->level,
            'exp' => $user->exp,
            'exp_gained' => 150,
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

    public function status(Request $request): JsonResponse
    {
        $user = $request->user();

        // Check if user survived the night and award morning reward
        $rewarded = $this->sleepEngine->checkMorningReward($user);
        if ($rewarded) {
            $user->refresh();
        }

        $inBedtimeHours = $this->sleepEngine->isWithinBedtimeHours($user);

        return response()->json([
            'current_hp' => $user->current_hp,
            'sleep_target_time' => $user->sleep_target_time,
            'wake_up_time' => $user->wake_up_time,
            'shutdown_stacks' => $user->shutdown_stacks,
            'days_survived' => $user->days_survived,
            'level' => $user->level ?? 1,
            'exp' => $user->exp ?? 0,
            'tickets_count' => $user->tickets_count,
            'is_disabled' => $user->is_disabled,
            'last_sleep_confirmed_at' => $user->last_sleep_confirmed_at,
            'discord_user_id' => $user->discord_user_id,
            'discord_bot_token' => $user->discord_bot_token,
            'is_sleeping' => !empty($user->last_sleep_confirmed_at),
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
                    $targetUserResult = [
                        'found' => true,
                        'username' => $targetUserData['username'] ?? '',
                        'global_name' => $targetUserData['global_name'] ?? $targetUserData['username'] ?? '',
                        'id' => $targetUserData['id'] ?? $targetUserId,
                    ];
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
            }

            return response()->json([
                'success' => true,
                'message' => 'เชื่อมต่อ Discord สำเร็จ บอทออนไลน์และพร้อมทำงาน',
                'bot' => [
                    'id' => $botId,
                    'username' => $botName,
                ],
                'target_user' => $targetUserResult,
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
            'source' => ['nullable', 'string'],
            'idle_seconds' => ['nullable', 'numeric'],
            'screen_locked' => ['nullable', 'boolean'],
            'is_active' => ['nullable', 'boolean'],
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
        ];

        $result = $this->sleepEngine->handlePresence($user, $validated['status'], $source, $meta);

        return response()->json($result);
    }
}
