<?php

use App\Models\User;

test('reset-hp endpoint resets user hp to 100 and clears penalties', function () {
    $user = User::factory()->create([
        'current_hp' => 15,
        'shutdown_stacks' => 3,
        'is_disabled' => false,
        'last_sleep_confirmed_at' => now(),
    ]);

    // Test web authenticated route
    $response = $this->actingAs($user)->postJson('/sleep/reset-hp');

    $response->assertOk()
        ->assertJson([
            'success' => true,
            'current_hp' => 100,
            'shutdown_stacks' => 0,
            'is_disabled' => false,
        ]);

    $freshUser = $user->fresh();
    expect($freshUser->current_hp)->toBe(100)
        ->and($freshUser->shutdown_stacks)->toBe(0)
        ->and($freshUser->is_disabled)->toBeFalse()
        ->and($freshUser->last_sleep_confirmed_at)->toBeNull();
});

test('api reset-hp endpoint allows reset via user_id or email for desktop daemon', function () {
    $user = User::factory()->create([
        'current_hp' => 0,
        'shutdown_stacks' => 5,
        'is_disabled' => true,
    ]);

    // Test via user_id
    $resId = $this->postJson('/api/sleep/reset-hp', [
        'user_id' => $user->id,
    ]);

    $resId->assertOk()
        ->assertJson([
            'success' => true,
            'current_hp' => 100,
            'shutdown_stacks' => 0,
            'is_disabled' => false,
        ]);

    expect($user->fresh()->current_hp)->toBe(100)
        ->and($user->fresh()->is_disabled)->toBeFalse();

    // Damage again
    $user->update(['current_hp' => 20]);

    // Test via email
    $resEmail = $this->postJson('/api/sleep/reset-hp', [
        'email' => $user->email,
    ]);

    $resEmail->assertOk()
        ->assertJson([
            'success' => true,
            'current_hp' => 100,
        ]);

    expect($user->fresh()->current_hp)->toBe(100);
});

test('alert-action supports toggle_pause and update_seconds', function () {
    $user = User::factory()->create([
        'emergency_countdown_seconds' => 60,
    ]);

    // Trigger
    $this->actingAs($user)->postJson('/sleep/alert-action', [
        'action' => 'trigger',
        'seconds' => 60,
    ]);

    // Toggle pause
    $resToggle = $this->actingAs($user)->postJson('/sleep/alert-action', [
        'action' => 'toggle_pause',
    ]);

    $resToggle->assertOk()
        ->assertJson([
            'success' => true,
            'alert_state' => [
                'is_paused' => false,
            ],
        ]);

    // Update seconds
    $resSec = $this->actingAs($user)->postJson('/sleep/alert-action', [
        'action' => 'update_seconds',
        'seconds' => 45,
    ]);

    $resSec->assertOk()
        ->assertJson([
            'success' => true,
            'alert_state' => [
                'seconds_remaining' => 45,
            ],
        ]);
});
