<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Carbon;

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
}
