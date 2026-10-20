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
            $table->json('inventory')->nullable()->after('last_sleep_confirmed_at');
            $table->unsignedInteger('inventory_capacity')->default(12)->after('inventory');
            $table->string('theme_preference')->default('dark')->after('inventory_capacity');
            $table->string('border_style')->default('rounded')->after('theme_preference');
            $table->json('sleep_history')->nullable()->after('border_style');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'inventory',
                'inventory_capacity',
                'theme_preference',
                'border_style',
                'sleep_history',
            ]);
        });
    }
};
