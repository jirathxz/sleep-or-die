<?php

use App\Models\User;

test('user has default emergency countdown seconds of 60', function () {
    $user = User::factory()->create();
    expect($user->emergency_countdown_seconds)->toBe(60);
});
