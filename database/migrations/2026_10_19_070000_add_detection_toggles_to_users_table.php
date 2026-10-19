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
            $table->boolean('enable_discord_detection')->default(true)->after('discord_bot_token');
            $table->boolean('enable_cpp_detection')->default(true)->after('enable_discord_detection');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['enable_discord_detection', 'enable_cpp_detection']);
        });
    }
};
