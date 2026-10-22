<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;
use Laravel\Fortify\TwoFactorAuthenticatable;

/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $two_factor_secret
 * @property string|null $two_factor_recovery_codes
 * @property Carbon|null $two_factor_confirmed_at
 * @property string|null $remember_token
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'name',
    'email',
    'password',
    'wake_up_time',
    'sleep_target_time',
    'emergency_countdown_seconds',
    'current_hp',
    'shutdown_stacks',
    'days_survived',
    'level',
    'exp',
    'points',
    'tickets_count',
    'is_disabled',
    'discord_user_id',
    'discord_bot_token',
    'enable_discord_detection',
    'enable_cpp_detection',
    'last_sleep_confirmed_at',
    'inventory',
    'inventory_capacity',
    'theme_preference',
    'border_style',
    'sleep_history',
])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token', 'discord_bot_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

    /**
     * The model's default values for attributes.
     *
     * @var array<string, mixed>
     */
    protected $attributes = [
        'emergency_countdown_seconds' => 60,
        'enable_discord_detection' => true,
        'enable_cpp_detection' => true,
        'current_hp' => 100,
        'shutdown_stacks' => 0,
        'days_survived' => 0,
        'level' => 1,
        'exp' => 225, // default starting EXP to match screenshot
        'points' => 100,
        'tickets_count' => 0,
        'is_disabled' => false,
        'inventory_capacity' => 12,
        'theme_preference' => 'dark',
        'border_style' => 'rounded',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'emergency_countdown_seconds' => 'integer',
            'enable_discord_detection' => 'boolean',
            'enable_cpp_detection' => 'boolean',
            'current_hp' => 'integer',
            'shutdown_stacks' => 'integer',
            'days_survived' => 'integer',
            'points' => 'integer',
            'tickets_count' => 'integer',
            'is_disabled' => 'boolean',
            'last_sleep_confirmed_at' => 'datetime',
            'inventory' => 'array',
            'inventory_capacity' => 'integer',
            'sleep_history' => 'array',
            'discord_bot_token' => 'encrypted',
        ];
    }
}
