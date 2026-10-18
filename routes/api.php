<?php

use App\Http\Controllers\SleepController;
use Illuminate\Support\Facades\Route;

Route::post('/discord/presence-update', [SleepController::class, 'handlePresenceUpdate']);
