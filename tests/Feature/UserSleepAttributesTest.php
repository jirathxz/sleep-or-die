<?php

use App\Models\User;

test('user has default sleep attributes and casts', function () {
    $user = User::factory()->create([
        'wake_up_time' => '07:00',
        'sleep_target_time' => '23:15',
    ]);

    expect($user->current_hp)->toBe(100)
        ->and($user->shutdown_stacks)->toBe(0)
        ->and($user->days_survived)->toBe(0)
        ->and($user->level)->toBe(1)
        ->and($user->exp)->toBe(0)
        ->and($user->tickets_count)->toBe(0)
        ->and($user->is_disabled)->toBeFalse()
        ->and($user->wake_up_time)->toBe('07:00')
        ->and($user->sleep_target_time)->toBe('23:15');
});
