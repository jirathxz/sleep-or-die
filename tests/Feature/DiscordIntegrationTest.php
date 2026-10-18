<?php

use App\Models\User;
use Illuminate\Support\Facades\Http;

test('each user can save and persist distinct discord user id and bot token', function () {
    $userA = User::factory()->create([
        'discord_user_id' => null,
        'discord_bot_token' => null,
    ]);

    $userB = User::factory()->create([
        'discord_user_id' => null,
        'discord_bot_token' => null,
    ]);

    // User A sets credentials
    $responseA = $this->actingAs($userA)->postJson('/sleep/settings', [
        'discord_user_id' => '111111111111111111',
        'discord_bot_token' => 'bot_token_user_A',
    ]);

    $responseA->assertOk()
        ->assertJson([
            'discord_user_id' => '111111111111111111',
            'discord_bot_token' => 'bot_token_user_A',
        ]);

    // User B sets credentials
    $responseB = $this->actingAs($userB)->postJson('/sleep/settings', [
        'discord_user_id' => '222222222222222222',
        'discord_bot_token' => 'bot_token_user_B',
    ]);

    $responseB->assertOk()
        ->assertJson([
            'discord_user_id' => '222222222222222222',
            'discord_bot_token' => 'bot_token_user_B',
        ]);

    // Verify isolation in database
    expect($userA->fresh()->discord_user_id)->toBe('111111111111111111')
        ->and($userA->fresh()->discord_bot_token)->toBe('bot_token_user_A')
        ->and($userB->fresh()->discord_user_id)->toBe('222222222222222222')
        ->and($userB->fresh()->discord_bot_token)->toBe('bot_token_user_B');

    // Verify /sleep/status returns authenticated user's own credentials
    $statusA = $this->actingAs($userA)->getJson('/sleep/status');
    $statusA->assertOk()
        ->assertJson([
            'discord_user_id' => '111111111111111111',
            'discord_bot_token' => 'bot_token_user_A',
        ]);

    $statusB = $this->actingAs($userB)->getJson('/sleep/status');
    $statusB->assertOk()
        ->assertJson([
            'discord_user_id' => '222222222222222222',
            'discord_bot_token' => 'bot_token_user_B',
        ]);
});

test('test-alert saves credentials immediately to authenticated user and dispatches dm', function () {
    Http::fake([
        'https://discord.com/api/v10/users/@me/channels' => Http::response(['id' => 'dm_chan_abc'], 200),
        'https://discord.com/api/v10/channels/dm_chan_abc/messages' => Http::response(['id' => 'msg_xyz'], 200),
    ]);

    $user = User::factory()->create([
        'discord_user_id' => null,
        'discord_bot_token' => null,
    ]);

    $response = $this->actingAs($user)->postJson('/sleep/test-alert', [
        'discord_user_id' => '333333333333333333',
        'discord_bot_token' => 'bot_token_test_direct',
        'stage' => 'test',
    ]);

    $response->assertOk()
        ->assertJson([
            'success' => true,
            'stage' => 'test',
            'discord_user_id' => '333333333333333333',
            'discord_bot_token' => 'bot_token_test_direct',
        ]);

    // Ensure database was updated
    expect($user->fresh()->discord_user_id)->toBe('333333333333333333')
        ->and($user->fresh()->discord_bot_token)->toBe('bot_token_test_direct');

    Http::assertSent(function ($request) {
        return str_contains($request->url(), '/users/@me/channels')
            && $request['recipient_id'] === '333333333333333333'
            && $request->hasHeader('Authorization', 'Bot bot_token_test_direct');
    });
});

test('test-alert returns clear 400 error when discord returns 50007 cannot send messages', function () {
    Http::fake([
        'https://discord.com/api/v10/users/@me/channels' => Http::response([
            'code' => 50007,
            'message' => 'Cannot send messages to this user',
        ], 403),
    ]);

    $user = User::factory()->create([
        'discord_user_id' => '444444444444444444',
        'discord_bot_token' => 'bot_token_valid_no_shared_guild',
    ]);

    $response = $this->actingAs($user)->postJson('/sleep/test-alert', [
        'stage' => 'test',
    ]);

    $response->assertStatus(400)
        ->assertJson([
            'success' => false,
            'error_code' => 50007,
        ]);

    expect($response->json('message'))->toContain('บอทและคุณอยู่ในเซิร์ฟเวอร์เดียวกัน');
});

test('test-alert returns 422 if credentials are missing', function () {
    $user = User::factory()->create([
        'discord_user_id' => null,
        'discord_bot_token' => null,
    ]);

    $response = $this->actingAs($user)->postJson('/sleep/test-alert', [
        'stage' => 'test',
    ]);

    $response->assertStatus(422)
        ->assertJson([
            'success' => false,
        ]);
});

test('test-discord endpoint validates bot token and saves credentials', function () {
    Http::fake([
        'https://discord.com/api/v10/users/@me' => Http::response([
            'id' => 'bot_id_123',
            'username' => 'SleepGuardianBot',
        ], 200),
        'https://discord.com/api/v10/users/555555555555555555' => Http::response([
            'id' => '555555555555555555',
            'username' => 'TestDiscordUser',
            'global_name' => 'Discord Tester',
        ], 200),
    ]);

    $user = User::factory()->create([
        'discord_user_id' => null,
        'discord_bot_token' => null,
    ]);

    $response = $this->actingAs($user)->postJson('/sleep/test-discord', [
        'discord_bot_token' => 'bot_token_verified',
        'discord_user_id' => '555555555555555555',
    ]);

    $response->assertOk()
        ->assertJson([
            'success' => true,
            'bot' => [
                'id' => 'bot_id_123',
                'username' => 'SleepGuardianBot',
            ],
            'target_user' => [
                'found' => true,
                'username' => 'TestDiscordUser',
            ],
            'discord_bot_token' => 'bot_token_verified',
            'discord_user_id' => '555555555555555555',
        ]);

    expect($user->fresh()->discord_bot_token)->toBe('bot_token_verified')
        ->and($user->fresh()->discord_user_id)->toBe('555555555555555555');
});
