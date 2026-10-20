<?php

use App\Models\User;

test('user can save special theme and sharp corners preference', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->postJson('/sleep/settings', [
        'theme_preference' => 'special',
        'border_style' => 'sharp',
    ]);

    $response->assertOk()
        ->assertJson([
            'theme_preference' => 'special',
            'border_style' => 'sharp',
        ]);

    expect($user->fresh()->theme_preference)->toBe('special')
        ->and($user->fresh()->border_style)->toBe('sharp');
});

test('status endpoint returns theme, inventory, and sleep history', function () {
    $user = User::factory()->create([
        'exp' => 225,
        'theme_preference' => 'special',
        'border_style' => 'sharp',
    ]);

    $response = $this->actingAs($user)->getJson('/sleep/status');

    $response->assertOk()
        ->assertJsonStructure([
            'current_hp',
            'theme_preference',
            'border_style',
            'inventory',
            'inventory_capacity',
            'used_slots',
            'sleep_history',
        ]);

    expect($response->json('theme_preference'))->toBe('special')
        ->and($response->json('border_style'))->toBe('sharp')
        ->and($response->json('inventory_capacity'))->toBe(12);
});

test('user can purchase items from black market shop with exp', function () {
    $user = User::factory()->create([
        'exp' => 225,
        'inventory' => [],
        'inventory_capacity' => 12,
    ]);

    // Buy Ration Supply (cost 30 EXP)
    $response = $this->actingAs($user)->postJson('/sleep/buy-item', [
        'item_id' => 'ration_supply',
    ]);

    $response->assertOk()
        ->assertJson([
            'success' => true,
            'exp' => 195,
            'inventory_capacity' => 12,
            'used_slots' => 2,
        ]);

    expect($user->fresh()->exp)->toBe(195)
        ->and(count($user->fresh()->inventory))->toBe(1);
});

test('user cannot buy items without sufficient exp', function () {
    $user = User::factory()->create([
        'exp' => 20,
        'inventory' => [],
    ]);

    $response = $this->actingAs($user)->postJson('/sleep/buy-item', [
        'item_id' => 'first_aid_spray', // costs 60
    ]);

    $response->assertStatus(422)
        ->assertJson([
            'success' => false,
        ]);
});

test('user can upgrade inventory to attaché case m and l', function () {
    $user = User::factory()->create([
        'exp' => 700,
        'inventory' => [],
        'inventory_capacity' => 12,
    ]);

    // Cannot buy Case L without Case M first
    $failL = $this->actingAs($user)->postJson('/sleep/buy-item', [
        'item_id' => 'case_l',
    ]);
    $failL->assertStatus(422);

    // Buy Case M (200 EXP) -> capacity becomes 16
    $buyM = $this->actingAs($user)->postJson('/sleep/buy-item', [
        'item_id' => 'case_m',
    ]);
    $buyM->assertOk()
        ->assertJson([
            'success' => true,
            'inventory_capacity' => 16,
            'exp' => 500,
        ]);

    // Now can buy Case L (400 EXP) -> capacity becomes 20
    $buyL = $this->actingAs($user)->postJson('/sleep/buy-item', [
        'item_id' => 'case_l',
    ]);
    $buyL->assertOk()
        ->assertJson([
            'success' => true,
            'inventory_capacity' => 20,
            'exp' => 100,
        ]);
});

test('user can use inventory item to restore life', function () {
    $user = User::factory()->create([
        'current_hp' => 40,
        'sleep_target_time' => '23:15',
        'inventory' => [
            [
                'id' => 'spray_inst_1',
                'item_id' => 'first_aid_spray',
                'label' => '[ FIRST AID SPRAY ]',
                'slots' => 1,
                'description' => 'heal 50%',
            ],
        ],
    ]);

    $response = $this->actingAs($user)->postJson('/sleep/use-item', [
        'item_instance_id' => 'spray_inst_1',
    ]);

    $response->assertOk()
        ->assertJson([
            'success' => true,
            'current_hp' => 90,
        ]);

    expect($user->fresh()->current_hp)->toBe(90)
        ->and(count($user->fresh()->inventory))->toBe(0);
});
