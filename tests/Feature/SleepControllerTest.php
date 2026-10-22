<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('user can update sleep schedule and receive calculated target', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->postJson('/sleep/settings', [
        'wake_up_time' => '06:30',
        'discord_user_id' => '1234567890',
        'discord_bot_token' => 'bot_token_secret_123',
    ]);

    $response->assertOk()
        ->assertJson([
            'sleep_target_time' => '22:45',
            'wake_up_time' => '06:30',
            'discord_user_id' => '1234567890',
            'discord_bot_token' => 'bot_token_secret_123',
        ]);

    expect($user->fresh()->sleep_target_time)->toBe('22:45')
        ->and($user->fresh()->discord_bot_token)->toBe('bot_token_secret_123');
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

test('going offline during bedtime hours automatically confirms sleep', function () {
    // Current time is within bedtime hours (e.g. 23:30 with bedtime 23:15, wake 07:00)
    $now = now()->setTime(23, 30);
    Carbon\Carbon::setTestNow($now);

    $user = User::factory()->create([
        'discord_user_id' => 'user_auto_sleep',
        'sleep_target_time' => '23:15',
        'wake_up_time' => '07:00',
        'last_sleep_confirmed_at' => null,
        'current_hp' => 100,
    ]);

    $response = $this->postJson('/api/presence/update', [
        'discord_user_id' => 'user_auto_sleep',
        'status' => 'offline',
    ]);

    $response->assertOk()
        ->assertJson([
            'penalized' => false,
            'auto_confirmed' => true,
            'is_sleeping' => true,
        ]);

    expect($user->fresh()->last_sleep_confirmed_at)->not->toBeNull();

    Carbon\Carbon::setTestNow();
});

test('desktop daemon can report screen lock or idle to auto confirm sleep', function () {
    $now = now()->setTime(23, 00); // 23:00 is within Alert window (T-30m = 22:45)
    Carbon\Carbon::setTestNow($now);

    $user = User::factory()->create([
        'sleep_target_time' => '23:15',
        'wake_up_time' => '07:00',
        'last_sleep_confirmed_at' => null,
        'current_hp' => 100,
    ]);

    $response = $this->postJson('/api/presence/update', [
        'user_id' => $user->id,
        'source' => 'desktop_daemon',
        'status' => 'idle',
        'screen_locked' => true,
        'idle_seconds' => 120,
    ]);

    $response->assertOk()
        ->assertJson([
            'penalized' => false,
            'auto_confirmed' => true,
            'is_sleeping' => true,
        ]);

    expect($user->fresh()->last_sleep_confirmed_at)->not->toBeNull();

    Carbon\Carbon::setTestNow();
});

test('morning wake up time automatically awards survival reward if slept through night', function () {
    // Night sleep confirmed at 23:15
    $night = now()->setTime(23, 15);
    Carbon\Carbon::setTestNow($night);

    $user = User::factory()->create([
        'sleep_target_time' => '23:15',
        'wake_up_time' => '07:00',
        'last_sleep_confirmed_at' => $night,
        'days_survived' => 3,
        'level' => 1,
        'exp' => 100,
        'current_hp' => 90,
    ]);

    // Morning at 07:30
    $morning = now()->addDay()->setTime(7, 30);
    Carbon\Carbon::setTestNow($morning);

    $response = $this->actingAs($user)->getJson('/sleep/status');

    $response->assertOk()
        ->assertJson([
            'days_survived' => 4,
            'current_hp' => 100,
            'morning_rewarded' => true,
        ]);

    expect($user->fresh()->days_survived)->toBe(4)
        ->and($user->fresh()->current_hp)->toBe(100)
        ->and($user->fresh()->exp)->toBe(250);

    Carbon\Carbon::setTestNow();
});

test('user can test discord connection successfully and persists token', function () {
    Illuminate\Support\Facades\Http::fake([
        'https://discord.com/api/v10/users/@me' => Illuminate\Support\Facades\Http::response([
            'id' => '999888777',
            'username' => 'SleepOrDieBot',
        ], 200),
        'https://discord.com/api/v10/users/123456' => Illuminate\Support\Facades\Http::response([
            'id' => '123456',
            'username' => 'TestDiscordUser',
            'global_name' => 'Tester',
        ], 200),
    ]);

    $user = User::factory()->create();

    $response = $this->actingAs($user)->postJson('/sleep/test-discord', [
        'discord_bot_token' => 'mock_valid_token_xyz',
        'discord_user_id' => '123456',
    ]);

    $response->assertOk()
        ->assertJson([
            'success' => true,
            'bot' => [
                'id' => '999888777',
                'username' => 'SleepOrDieBot',
            ],
            'target_user' => [
                'found' => true,
                'username' => 'TestDiscordUser',
            ],
        ]);

    expect($user->fresh()->discord_bot_token)->toBe('mock_valid_token_xyz')
        ->and($user->fresh()->discord_user_id)->toBe('123456');
});

test('test discord connection returns error if token is invalid', function () {
    Illuminate\Support\Facades\Http::fake([
        'https://discord.com/api/v10/users/@me' => Illuminate\Support\Facades\Http::response([
            'message' => '401: Unauthorized',
            'code' => 0,
        ], 401),
    ]);

    $user = User::factory()->create();

    $response = $this->actingAs($user)->postJson('/sleep/test-discord', [
        'discord_bot_token' => 'invalid_token_123',
    ]);

    $response->assertStatus(400)
        ->assertJson([
            'success' => false,
        ]);
});

test('user can update sleep schedule by providing direct sleep target time', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->postJson('/sleep/settings', [
        'sleep_target_time' => '23:30',
    ]);

    $response->assertOk()
        ->assertJson([
            'sleep_target_time' => '23:30',
        ]);

    expect($user->fresh()->sleep_target_time)->toBe('23:30');
});

test('user can trigger test alert endpoint', function () {
    Illuminate\Support\Facades\Http::fake([
        'https://discord.com/api/v10/users/@me/channels' => Illuminate\Support\Facades\Http::response(['id' => 'dm_ch_999'], 200),
        'https://discord.com/api/v10/channels/dm_ch_999/messages' => Illuminate\Support\Facades\Http::response(['id' => 'msg_111'], 200),
    ]);

    $user = User::factory()->create([
        'sleep_target_time' => '23:00',
        'discord_user_id' => '123456789012345678',
        'discord_bot_token' => 'sample_bot_token_abc',
    ]);

    $response = $this->actingAs($user)->postJson('/sleep/test-alert', [
        'stage' => 'deadline',
    ]);

    $response->assertOk()
        ->assertJson([
            'success' => true,
            'stage' => 'deadline',
        ]);
});

test('bedtime alert command dispatches notification at scheduled target time', function () {
    Illuminate\Support\Facades\Http::fake([
        'https://discord.com/api/v10/users/@me/channels' => Illuminate\Support\Facades\Http::response(['id' => 'dm_ch_999'], 200),
        'https://discord.com/api/v10/channels/dm_ch_999/messages' => Illuminate\Support\Facades\Http::response(['id' => 'msg_111'], 200),
    ]);

    // Create user whose target time matches current time exactly
    $currentTime = now()->format('H:i');
    $user = User::factory()->create([
        'sleep_target_time' => $currentTime,
        'discord_user_id' => 'discord_user_123',
        'discord_bot_token' => 'discord_bot_token_abc',
        'last_sleep_confirmed_at' => null,
    ]);

    $this->artisan('sleep:check-alerts')
        ->expectsOutput('Checking bedtime alert schedules...')
        ->expectsOutput('Completed. Alerts dispatched: 1')
        ->assertSuccessful();
});

test('user can update enable_discord_detection and enable_cpp_detection toggles', function () {
    $user = User::factory()->create([
        'enable_discord_detection' => true,
        'enable_cpp_detection' => true,
    ]);

    $response = $this->actingAs($user)->postJson('/sleep/settings', [
        'enable_discord_detection' => false,
        'enable_cpp_detection' => true,
    ]);

    $response->assertOk()
        ->assertJson([
            'enable_discord_detection' => false,
            'enable_cpp_detection' => true,
            'is_system_active' => true,
        ]);

    expect($user->fresh()->enable_discord_detection)->toBeFalse()
        ->and($user->fresh()->enable_cpp_detection)->toBeTrue();
});

test('when both detection toggles are disabled system is inactive', function () {
    $user = User::factory()->create([
        'enable_discord_detection' => false,
        'enable_cpp_detection' => false,
        'last_sleep_confirmed_at' => now(),
    ]);

    $response = $this->actingAs($user)->getJson('/sleep/status');

    $response->assertOk()
        ->assertJson([
            'enable_discord_detection' => false,
            'enable_cpp_detection' => false,
            'is_system_active' => false,
            'is_sleeping' => false,
        ]);

    // Presence update when both are false is ignored and system is reported inactive
    $updateResponse = $this->postJson('/api/presence/update', [
        'user_id' => $user->id,
        'status' => 'online',
        'source' => 'desktop_daemon',
    ]);

    $updateResponse->assertOk()
        ->assertJson([
            'is_system_active' => false,
        ]);
});

test('cpp desktop guard can send simulate_sleep to confirm sleep mode', function () {
    $user = User::factory()->create([
        'enable_cpp_detection' => true,
        'last_sleep_confirmed_at' => null,
    ]);

    $response = $this->postJson('/api/presence/update', [
        'user_id' => $user->id,
        'status' => 'offline',
        'source' => 'desktop_daemon',
        'simulate_sleep' => true,
    ]);

    $response->assertOk()
        ->assertJson([
            'auto_confirmed' => true,
            'is_sleeping' => true,
        ]);

    expect($user->fresh()->last_sleep_confirmed_at)->not->toBeNull();

    // Now test waking up via C++ tray
    $wakeResponse = $this->postJson('/api/presence/update', [
        'user_id' => $user->id,
        'status' => 'online',
        'source' => 'desktop_daemon',
        'wake_up_simulation' => true,
    ]);

    $wakeResponse->assertOk()
        ->assertJson([
            'is_sleeping' => false,
        ]);

    expect($user->fresh()->last_sleep_confirmed_at)->toBeNull();
});

