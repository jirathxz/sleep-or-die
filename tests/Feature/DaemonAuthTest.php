<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;

test('daemon login succeeds with valid email and password', function () {
    $user = User::factory()->create([
        'email' => 'guard@test.com',
        'password' => Hash::make('password123'),
        'wake_up_time' => '07:00',
        'sleep_target_time' => '23:15',
        'emergency_countdown_seconds' => 75,
    ]);

    $response = $this->postJson('/api/daemon/login', [
        'email' => 'guard@test.com',
        'password' => 'password123',
    ]);

    $response->assertOk()
        ->assertJson([
            'success' => true,
            'user_id' => $user->id,
            'bedtime_hour' => 23,
            'bedtime_minute' => 15,
            'wake_up_hour' => 7,
            'wake_up_minute' => 0,
            'emergency_countdown_seconds' => 75,
        ]);
});

test('daemon login fails with invalid password', function () {
    User::factory()->create([
        'email' => 'guard@test.com',
        'password' => Hash::make('password123'),
    ]);

    $response = $this->postJson('/api/daemon/login', [
        'email' => 'guard@test.com',
        'password' => 'wrong',
    ]);

    $response->assertStatus(401)
        ->assertJson(['success' => false]);
});

test('presence update includes daemon config with emergency countdown seconds', function () {
    $user = User::factory()->create([
        'wake_up_time' => '07:00',
        'sleep_target_time' => '23:15',
        'emergency_countdown_seconds' => 90,
    ]);

    $response = $this->postJson('/api/presence/update', [
        'user_id' => $user->id,
        'status' => 'online',
    ]);

    $response->assertOk();
    $data = $response->json();
    expect($data)->toHaveKey('daemon_config');
    expect($data['daemon_config']['emergency_countdown_seconds'])->toBe(90);
});
