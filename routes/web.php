<?php

use App\Http\Controllers\SleepController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

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
