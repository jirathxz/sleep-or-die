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
