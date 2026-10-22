<?php

use App\Models\User;

test('user has default points attribute', function () {
    $user = User::factory()->create();
    expect($user->points)->toBeGreaterThanOrEqual(0);
});

test('user can redeem ticket using 100 points', function () {
    $user = User::factory()->create([
        'points' => 150,
        'tickets_count' => 0,
    ]);

    $response = $this->actingAs($user)->postJson('/sleep/redeem-ticket');

    $response->assertOk()
        ->assertJson([
            'success' => true,
            'points' => 50,
            'tickets_count' => 1,
        ]);

    expect($user->fresh()->points)->toBe(50);
    expect($user->fresh()->tickets_count)->toBe(1);
});

test('user cannot redeem ticket without enough points', function () {
    $user = User::factory()->create([
        'points' => 40,
        'tickets_count' => 0,
    ]);

    $response = $this->actingAs($user)->postJson('/sleep/redeem-ticket');

    $response->assertStatus(422)
        ->assertJson([
            'success' => false,
        ]);

    expect($user->fresh()->tickets_count)->toBe(0);
});

test('confirming sleep awards points and exp', function () {
    $user = User::factory()->create([
        'points' => 0,
        'exp' => 0,
        'sleep_target_time' => '23:00',
    ]);

    $response = $this->actingAs($user)->postJson('/sleep/confirm');

    $response->assertOk();
    expect($user->fresh()->points)->toBe(50);
    expect($user->fresh()->exp)->toBe(150);
});
