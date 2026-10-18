<?php

namespace App\Console\Commands;

use App\Services\SleepEngineService;
use Illuminate\Console\Command;

class CheckBedtimeAlertsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'sleep:check-alerts';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check users bedtime target schedule and dispatch warnings (T-30m, T-15m, Deadline)';

    /**
     * Execute the console command.
     */
    public function handle(SleepEngineService $sleepEngine): int
    {
        $this->info('Checking bedtime alert schedules...');
        $sentCount = $sleepEngine->checkAndSendBedtimeAlerts();
        $this->info("Completed. Alerts dispatched: {$sentCount}");

        return self::SUCCESS;
    }
}
