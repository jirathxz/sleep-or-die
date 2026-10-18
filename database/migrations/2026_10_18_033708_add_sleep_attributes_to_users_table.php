<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('wake_up_time')->nullable();
            $table->string('sleep_target_time')->nullable();
            $table->integer('current_hp')->default(100);
            $table->integer('shutdown_stacks')->default(0);
            $table->integer('days_survived')->default(0);
            $table->integer('tickets_count')->default(0);
            $table->boolean('is_disabled')->default(false);
            $table->string('discord_user_id')->nullable();
            $table->timestamp('last_sleep_confirmed_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'wake_up_time',
                'sleep_target_time',
                'current_hp',
                'shutdown_stacks',
                'days_survived',
                'tickets_count',
                'is_disabled',
                'discord_user_id',
                'last_sleep_confirmed_at',
            ]);
        });
    }
};
