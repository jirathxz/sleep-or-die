<?php

use App\Models\User;
use Illuminate\Support\Facades\Cache;

beforeEach(function () {
    Cache::flush();
});

test('rule 1: if C++ detects PC is online, user is not sleeping and sleep status is cleared', function () {
    $user = User::factory()->create([
        'enable_cpp_detection' => true,
        'enable_discord_detection' => false,
        'last_sleep_confirmed_at' => now(),
    ]);

    // Send C++ presence indicating PC is active (mouse/keyboard used)
    $response = $this->postJson('/api/presence/update', [
        'user_id' => $user->id,
        'source' => 'desktop_daemon',
        'status' => 'online',
        'idle_seconds' => 5,
        'screen_locked' => false,
    ]);

    $response->assertOk()
        ->assertJson([
            'is_sleeping' => false,
            'is_system_active' => true,
        ]);

    expect($user->fresh()->last_sleep_confirmed_at)->toBeNull();

    // Check status endpoint as authenticated user
    $statusRes = $this->actingAs($user)->getJson('/sleep/status');
    $statusRes->assertOk()
        ->assertJson([
            'is_sleeping' => false,
            'cpp_presence' => [
                'is_pc_online' => true,
            ],
        ]);
});

test('alert sync state machine: alert (60s paused) -> lockdown -> sleep warning (-25 HP) -> shutdown', function () {
    $user = User::factory()->create([
        'emergency_countdown_seconds' => 60,
        'current_hp' => 100,
    ]);

    // 1. Trigger Alert (60s, paused)
    $res1 = $this->actingAs($user)->postJson('/sleep/alert-action', [
        'action' => 'trigger',
        'seconds' => 60,
    ]);

    $res1->assertOk()
        ->assertJson([
            'success' => true,
            'alert_state' => [
                'phase' => 'alert',
                'seconds_remaining' => 60,
                'is_paused' => true,
                'step_index' => 1,
            ],
        ]);

    // 2. User clicks "เข้าใจแล้ว" on Alert: escalates to Lockdown (Mock Windows Sign Out, paused)
    $res2 = $this->actingAs($user)->postJson('/sleep/alert-action', [
        'action' => 'acknowledge',
    ]);

    $res2->assertOk()
        ->assertJson([
            'success' => true,
            'alert_state' => [
                'phase' => 'lockdown',
                'is_paused' => true,
                'step_index' => 2,
            ],
        ]);

    // 3. User clicks "เข้าใจแล้ว" on Lockdown
    $res3 = $this->actingAs($user)->postJson('/sleep/alert-action', [
        'action' => 'acknowledge_lockdown',
    ]);

    $res3->assertOk()
        ->assertJson([
            'success' => true,
            'alert_state' => [
                'phase' => 'acknowledged_lockdown',
                'acknowledged' => true,
            ],
        ]);

    // 4. User still returns to PC! C++ reports PC online -> escalates to sleep_warning (-25 HP)
    $res4 = $this->postJson('/api/presence/update', [
        'user_id' => $user->id,
        'source' => 'desktop_daemon',
        'status' => 'online',
        'idle_seconds' => 2,
        'screen_locked' => false,
    ]);

    $res4->assertOk()
        ->assertJson([
            'alert_state' => [
                'phase' => 'sleep_warning',
                'step_index' => 3,
            ],
        ]);

    expect($user->fresh()->current_hp)->toBe(75);

    // 5. User acknowledges sleep warning -> dismisses alert modal (phase: idle)
    $res5 = $this->actingAs($user)->postJson('/sleep/alert-action', [
        'action' => 'acknowledge_sleep_warning',
    ]);

    $res5->assertOk()
        ->assertJson([
            'alert_state' => [
                'phase' => 'idle',
                'acknowledged' => true,
            ],
        ]);

    // Final shutdown action
    $res6 = $this->actingAs($user)->postJson('/sleep/alert-action', [
        'action' => 'shutdown',
    ]);

    $res6->assertOk()
        ->assertJson([
            'alert_state' => [
                'phase' => 'shutdown',
                'seconds_remaining' => 0,
            ],
            'current_hp' => 0,
        ]);

    expect($user->fresh()->current_hp)->toBe(0);

    // 6. Reset brings back to idle
    $resReset = $this->actingAs($user)->postJson('/sleep/alert-action', [
        'action' => 'reset',
    ]);

    $resReset->assertOk()
        ->assertJson([
            'alert_state' => [
                'phase' => 'idle',
            ],
        ]);
});
