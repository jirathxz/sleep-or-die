<?php

use App\Http\Controllers\SleepController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'dashboard')->name('home');

// Sleep & Lifestyle Management Modules (MAIN)
Route::inertia('alarms', 'alarms')->name('alarms');
Route::inertia('schedule', 'schedule')->name('schedule');
Route::inertia('history', 'history')->name('history');

// Progression & Gamification Modules (PROGRESSION)
Route::inertia('progression', 'progression')->name('progression');
Route::inertia('quests', 'quests')->name('quests');
Route::inertia('analytics', 'analytics')->name('analytics');

// System Modules (SYSTEM)
Route::inertia('settings', 'settings')->name('settings');
Route::inertia('help', 'help')->name('help');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    Route::prefix('sleep')->name('sleep.')->group(function () {
        Route::post('settings', [SleepController::class, 'saveSettings'])->name('settings');
        Route::post('confirm', [SleepController::class, 'confirmSleep'])->name('confirm');
        Route::post('ticket', [SleepController::class, 'useTicket'])->name('ticket');
        Route::get('status', [SleepController::class, 'status'])->name('status');
    });
});

require __DIR__.'/settings.php';
