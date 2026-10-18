<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\SleepEngineService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SleepController extends Controller
{
    public function __construct(
        protected SleepEngineService $sleepEngine
    ) {}

    public function saveSettings(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'wake_up_time' => ['required', 'string', 'date_format:H:i'],
            'discord_user_id' => ['nullable', 'string', 'max:50'],
        ]);

        $sleepTarget = $this->sleepEngine->calculateSleepTarget($validated['wake_up_time']);

        $user = $request->user();
        $user->update([
            'wake_up_time' => $validated['wake_up_time'],
            'sleep_target_time' => $sleepTarget,
            'discord_user_id' => $validated['discord_user_id'] ?? $user->discord_user_id,
        ]);

        return response()->json([
            'message' => 'Settings updated successfully',
            'wake_up_time' => $user->wake_up_time,
            'sleep_target_time' => $user->sleep_target_time,
            'discord_user_id' => $user->discord_user_id,
        ]);
    }

    public function confirmSleep(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->update([
            'last_sleep_confirmed_at' => now(),
        ]);

        return response()->json([
            'message' => 'Sleep confirmed. Entering verification window.',
            'last_sleep_confirmed_at' => $user->last_sleep_confirmed_at,
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

        return response()->json([
            'current_hp' => $user->current_hp,
            'sleep_target_time' => $user->sleep_target_time,
            'wake_up_time' => $user->wake_up_time,
            'shutdown_stacks' => $user->shutdown_stacks,
            'days_survived' => $user->days_survived,
            'tickets_count' => $user->tickets_count,
            'is_disabled' => $user->is_disabled,
            'last_sleep_confirmed_at' => $user->last_sleep_confirmed_at,
        ]);
    }

    public function handlePresenceUpdate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'discord_user_id' => ['required', 'string'],
            'status' => ['required', 'string'],
        ]);

        $user = User::where('discord_user_id', $validated['discord_user_id'])->first();

        if (! $user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $isInVerifyingWindow = $user->last_sleep_confirmed_at &&
            $user->last_sleep_confirmed_at->diffInMinutes(now()) <= 10;

        if ($isInVerifyingWindow && in_array($validated['status'], ['online', 'dnd'])) {
            $user->update(['last_sleep_confirmed_at' => null]);
            $this->sleepEngine->drainHp($user, 25);

            return response()->json([
                'penalized' => true,
                'message' => 'Target detected active during sleep verification window. HP penalized.',
                'current_hp' => $user->fresh()->current_hp,
            ]);
        }

        return response()->json([
            'penalized' => false,
            'message' => 'Target status received.',
        ]);
    }
}
