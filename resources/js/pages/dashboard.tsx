import React, { useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { CountdownDisplay } from '@/components/Sleep/CountdownDisplay';
import { HpBar } from '@/components/Sleep/HpBar';
import { LevelExpBar } from '@/components/Sleep/LevelExpBar';
import { StageOverlay } from '@/components/Sleep/StageOverlay';
import { StatsBadge } from '@/components/Sleep/StatsBadge';
import { TombstoneScreen } from '@/components/Sleep/TombstoneScreen';
import { dashboard } from '@/routes';
import { useSleepStore } from '@/stores/useSleepStore';
import { Volume2, VolumeX } from 'lucide-react';

interface PageProps {
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
            current_hp?: number;
            wake_up_time?: string | null;
            sleep_target_time?: string | null;
            shutdown_stacks?: number;
            days_survived?: number;
            level?: number;
            exp?: number;
            tickets_count?: number;
            is_disabled?: boolean;
            discord_user_id?: string | null;
            last_sleep_confirmed_at?: string | null;
        };
    };
    [key: string]: unknown;
}

export default function Dashboard() {
    const { auth } = usePage<PageProps>().props;

    const {
        current_hp,
        wake_up_time,
        sleep_target_time,
        shutdown_stacks,
        days_survived,
        level,
        exp,
        tickets_count,
        is_disabled,
        last_sleep_confirmed_at,
        stage,
        hoursRemaining,
        minutesRemaining,
        secondsRemaining,
        isPastDeadline,
        audioEnabled,
        syncUser,
        tick,
        toggleAudio,
        confirmSleep,
        useTicket,
        fetchStatus,
        simulationActive,
        startSimulation321,
        resetSimulation,
    } = useSleepStore();

    useEffect(() => {
        if (auth?.user) {
            syncUser({
                current_hp: auth.user.current_hp ?? 100,
                wake_up_time: auth.user.wake_up_time ?? '07:00',
                sleep_target_time: auth.user.sleep_target_time ?? '23:15',
                shutdown_stacks: auth.user.shutdown_stacks ?? 0,
                days_survived: auth.user.days_survived ?? 0,
                tickets_count: auth.user.tickets_count ?? 0,
                is_disabled: auth.user.is_disabled ?? false,
                discord_user_id: auth.user.discord_user_id ?? null,
                last_sleep_confirmed_at: auth.user.last_sleep_confirmed_at ?? null,
            });
        }

        fetchStatus();

        const timer = setInterval(() => {
            tick();
        }, 1000);

        return () => clearInterval(timer);
    }, [auth, syncUser, tick, fetchStatus]);

    if (is_disabled) {
        return <TombstoneScreen daysSurvived={days_survived} userName={auth?.user?.name || 'ผู้ใช้งาน'} />;
    }

    return (
        <>
            <Head title="แดชบอร์ด - SleepOrDie" />

            {/* Emergency Alerts & Vignette Overlays */}
            <StageOverlay stage={stage} secondsRemaining={secondsRemaining} />

            <div className="max-w-3xl w-full mx-auto p-4 md:p-6 space-y-5 select-none">
                {/* Header: Pure focus on Dashboard role & Quick audio toggle */}
                <div className="flex items-center justify-between pb-1">
                    <div>
                        <h1 className="text-xl font-medium tracking-tight text-white">
                            แผงควบคุม (Dashboard)
                        </h1>
                        <p className="text-xs text-zinc-500 font-light mt-0.5">
                            ระดับพลังชีวิตและเวลานับถอยหลังสู่เส้นตายเข้านอนคืนนี้
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => toggleAudio()}
                        className="size-8 rounded-lg bg-[#121215] hover:bg-[#18181b] text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
                        title={audioEnabled ? 'ปิดเสียงแจ้งเตือน' : 'เปิดเสียงแจ้งเตือน'}
                    >
                        {audioEnabled ? (
                            <Volume2 className="size-4 text-emerald-400" />
                        ) : (
                            <VolumeX className="size-4 text-zinc-500" />
                        )}
                    </button>
                </div>

                {/* 1. Vitality Matrix HP Bar (100% Health Status) */}
                <HpBar hp={current_hp} stage={stage} />

                {/* 2. Level & EXP Progression Progress Bar */}
                <LevelExpBar level={level} exp={exp} />

                {/* 3. Countdown Display & Primary Sleep Action + 3-2-1 Test Simulation */}
                <CountdownDisplay
                    hours={hoursRemaining}
                    minutes={minutesRemaining}
                    seconds={secondsRemaining}
                    isPastDeadline={isPastDeadline}
                    stage={stage}
                    sleepTargetTime={sleep_target_time}
                    wakeUpTime={wake_up_time}
                    onConfirmSleep={confirmSleep}
                    lastConfirmedAt={last_sleep_confirmed_at}
                    simulationActive={simulationActive}
                    onStartSimulation={startSimulation321}
                    onResetSimulation={resetSimulation}
                />

                {/* 3. Daily Summary & Streak Progression Module */}
                <StatsBadge
                    daysSurvived={days_survived}
                    shutdownStacks={shutdown_stacks}
                    ticketsCount={tickets_count}
                    onUseTicket={useTicket}
                    stage={stage}
                />
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
