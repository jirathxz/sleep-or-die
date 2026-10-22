<?php

use App\Models\User;
use App\Services\SleepEngineService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

test('calculates sleep target 7h45m before wake up time across midnight', function () {
    $service = new SleepEngineService;
    // Wake up 06:00 -> minus 7h45m (465 minutes) = 22:15 previous day
    expect($service->calculateSleepTarget('06:00', 5))->toBe('22:15');
    // Wake up 08:30 -> minus 7h45m = 00:45 same day
    expect($service->calculateSleepTarget('08:30', 5))->toBe('00:45');
});

test('using ticket adds 30 minutes to sleep target and decrements ticket count', function () {
    $user = User::factory()->create([
        'sleep_target_time' => '23:00',
        'tickets_count' => 2,
    ]);
    $service = new SleepEngineService;
    $result = $service->useTicket($user);

    expect($result)->toBeTrue()
        ->and($user->fresh()->sleep_target_time)->toBe('23:30')
        ->and($user->fresh()->tickets_count)->toBe(1);
});

test('using ticket fails when ticket count is zero', function () {
    $user = User::factory()->create([
        'sleep_target_time' => '23:00',
        'tickets_count' => 0,
    ]);
    $service = new SleepEngineService;
    $result = $service->useTicket($user);

    expect($result)->toBeFalse()
        ->and($user->fresh()->sleep_target_time)->toBe('23:00')
        ->and($user->fresh()->tickets_count)->toBe(0);
});

test('5 shutdown strikes disables account', function () {
    $user = User::factory()->create([
        'shutdown_stacks' => 4,
        'is_disabled' => false,
        'current_hp' => 50,
    ]);
    $service = new SleepEngineService;
    $service->recordShutdown($user);

    expect($user->fresh()->shutdown_stacks)->toBe(5)
        ->and($user->fresh()->is_disabled)->toBeTrue()
        ->and($user->fresh()->current_hp)->toBe(0);
});

test('surviving 7 consecutive days rewards ticket and decays 1 strike', function () {
    $user = User::factory()->create([
        'days_survived' => 6,
        'shutdown_stacks' => 2,
        'tickets_count' => 0,
        'current_hp' => 30,
    ]);
    $service = new SleepEngineService;
    $service->rewardSurvival($user);

    expect($user->fresh()->days_survived)->toBe(7)
        ->and($user->fresh()->tickets_count)->toBe(1)
        ->and($user->fresh()->shutdown_stacks)->toBe(1)
        ->and($user->fresh()->current_hp)->toBe(100);
});

test('drain hp reduces hp and triggers shutdown at 0', function () {
    $user = User::factory()->create([
        'current_hp' => 20,
        'shutdown_stacks' => 0,
    ]);
    $service = new SleepEngineService;
    $service->drainHp($user, 25);

    expect($user->fresh()->current_hp)->toBe(0)
        ->and($user->fresh()->shutdown_stacks)->toBe(1);
});

test('checkMorningReward rejects daytime sleep confirmations', function () {
    $service = new SleepEngineService;
    $user = User::factory()->create([
        'wake_up_time' => '07:00',
        'sleep_target_time' => '23:15',
        // Sleep confirmed at 13:00 (afternoon outside bedtime hours)
        'last_sleep_confirmed_at' => \Illuminate\Support\Carbon::parse('2026-10-21 13:00:00'),
    ]);

    // Checked at 15:00 afternoon
    $result = $service->checkMorningReward($user, '2026-10-21 15:00:00');

    expect($result)->toBeFalse()
        ->and($user->fresh()->days_survived)->toBe(0)
        ->and($user->fresh()->last_sleep_confirmed_at)->not->toBeNull();
});

test('checkMorningReward awards survival when slept during bedtime hours and woke in morning', function () {
    $service = new SleepEngineService;
    $user = User::factory()->create([
        'wake_up_time' => '07:00',
        'sleep_target_time' => '23:15',
        'days_survived' => 0,
        // Sleep confirmed at 23:20 (during bedtime hours)
        'last_sleep_confirmed_at' => \Illuminate\Support\Carbon::parse('2026-10-21 23:20:00'),
    ]);

    // Checked at 07:30 morning (outside bedtime hours, >60 min after sleep)
    $result = $service->checkMorningReward($user, '2026-10-22 07:30:00');

    expect($result)->toBeTrue()
        ->and($user->fresh()->days_survived)->toBe(1)
        ->and($user->fresh()->last_sleep_confirmed_at)->toBeNull();
});

test('checkAndSendBedtimeAlerts matches T-30m and T-15m spec', function () {
    $service = new SleepEngineService;
    $user = User::factory()->create([
        'sleep_target_time' => '23:15',
        'discord_user_id' => '123456',
        'discord_bot_token' => 'test_token',
        'is_disabled' => false,
        'last_sleep_confirmed_at' => null,
    ]);

    \Illuminate\Support\Facades\Http::fake();

    // 22:45 is T-30m before 23:15
    $sent30 = $service->checkAndSendBedtimeAlerts(\Illuminate\Support\Carbon::parse('2026-10-21 22:45:00'));
    expect($sent30)->toBe(1);

    // 23:00 is T-15m before 23:15
    $sent15 = $service->checkAndSendBedtimeAlerts(\Illuminate\Support\Carbon::parse('2026-10-21 23:00:00'));
    expect($sent15)->toBe(1);

    // 23:15 is deadline
    $sent0 = $service->checkAndSendBedtimeAlerts(\Illuminate\Support\Carbon::parse('2026-10-21 23:15:00'));
    expect($sent0)->toBe(1);

    // 23:10 is not an alert minute
    $sentNone = $service->checkAndSendBedtimeAlerts(\Illuminate\Support\Carbon::parse('2026-10-21 23:10:00'));
    expect($sentNone)->toBe(0);
});
