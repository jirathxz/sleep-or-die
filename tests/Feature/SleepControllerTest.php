<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('user can update sleep schedule and receive calculated target', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->postJson('/sleep/settings', [
        'wake_up_time' => '06:30',
        'discord_user_id' => '1234567890',
    ]);

    $response->assertOk()
        ->assertJson([
            'sleep_target_time' => '22:45',
            'wake_up_time' => '06:30',
            'discord_user_id' => '1234567890',
        ]);

    expect($user->fresh()->sleep_target_time)->toBe('22:45');
});

test('user can confirm sleep which sets last_sleep_confirmed_at', function () {
    $user = User::factory()->create(['last_sleep_confirmed_at' => null]);

    $response = $this->actingAs($user)->postJson('/sleep/confirm');

    $response->assertOk();
    expect($user->fresh()->last_sleep_confirmed_at)->not->toBeNull();
});

test('user can use ticket to extend deadline by 30 minutes', function () {
    $user = User::factory()->create([
        'sleep_target_time' => '23:00',
        'tickets_count' => 2,
    ]);

    $response = $this->actingAs($user)->postJson('/sleep/ticket');

    $response->assertOk()
        ->assertJson(['success' => true, 'new_sleep_target_time' => '23:30']);

    expect($user->fresh()->sleep_target_time)->toBe('23:30')
        ->and($user->fresh()->tickets_count)->toBe(1);
});

test('user can retrieve sleep status', function () {
    $user = User::factory()->create([
        'current_hp' => 85,
        'sleep_target_time' => '23:15',
        'shutdown_stacks' => 1,
        'days_survived' => 4,
        'tickets_count' => 1,
    ]);

    $response = $this->actingAs($user)->getJson('/sleep/status');

    $response->assertOk()
        ->assertJson([
            'current_hp' => 85,
            'sleep_target_time' => '23:15',
            'shutdown_stacks' => 1,
            'days_survived' => 4,
            'tickets_count' => 1,
            'is_disabled' => false,
        ]);
});

test('discord presence update triggers penalty if target is online during verification window', function () {
    $user = User::factory()->create([
        'discord_user_id' => '999999',
        'last_sleep_confirmed_at' => now()->subMinutes(2),
        'current_hp' => 100,
    ]);

    $response = $this->postJson('/api/discord/presence-update', [
        'discord_user_id' => '999999',
        'status' => 'online',
    ]);

    $response->assertOk()
        ->assertJson([
            'penalized' => true,
        ]);

    expect($user->fresh()->last_sleep_confirmed_at)->toBeNull()
        ->and($user->fresh()->current_hp)->toBe(75);
});

test('discord presence update ignores offline status during verification window', function () {
    $user = User::factory()->create([
        'discord_user_id' => '999999',
        'last_sleep_confirmed_at' => now()->subMinutes(2),
        'current_hp' => 100,
    ]);

    $response = $this->postJson('/api/discord/presence-update', [
        'discord_user_id' => '999999',
        'status' => 'offline',
    ]);

    $response->assertOk()
        ->assertJson([
            'penalized' => false,
        ]);

    expect($user->fresh()->last_sleep_confirmed_at)->not->toBeNull()
        ->and($user->fresh()->current_hp)->toBe(100);
});
