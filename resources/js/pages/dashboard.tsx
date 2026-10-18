import React, { useEffect, useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { CountdownDisplay } from '@/components/Sleep/CountdownDisplay';
import { HpBar } from '@/components/Sleep/HpBar';
import { SettingsModal } from '@/components/Sleep/SettingsModal';
import { StageOverlay } from '@/components/Sleep/StageOverlay';
import { StatsBadge } from '@/components/Sleep/StatsBadge';
import { TombstoneScreen } from '@/components/Sleep/TombstoneScreen';
import { dashboard } from '@/routes';
import { useSleepStore } from '@/stores/useSleepStore';

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
    const [settingsOpen, setSettingsOpen] = useState(false);

    const {
        current_hp,
        wake_up_time,
        sleep_target_time,
        shutdown_stacks,
        days_survived,
        tickets_count,
        is_disabled,
        discord_user_id,
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
        saveSettings,
        confirmSleep,
        useTicket,
        fetchStatus,
    } = useSleepStore();

    // Initialize store with user props and start 1-second tick loop
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
        return <TombstoneScreen daysSurvived={days_survived} userName={auth?.user?.name || 'Subject'} />;
    }

    return (
        <>
            <Head title="SleepOrDie - Hardcore Sleep Accountability" />

            {/* Ambient Alert / Lockdown / Shutdown Overlays */}
            <StageOverlay stage={stage} />

            <div className="min-h-screen bg-black text-neutral-200 p-4 md:p-8 flex flex-col justify-between">
                {/* Header Bar */}
                <header className="max-w-4xl w-full mx-auto flex items-center justify-between pb-6 border-b border-neutral-900">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">⏳</span>
                        <div>
                            <h1 className="text-lg md:text-xl font-black font-mono tracking-tight text-white flex items-center gap-2">
                                SLEEP OR DIE <span className="text-xs px-2 py-0.5 rounded bg-neutral-900 text-neutral-400 font-normal">v1.0</span>
                            </h1>
                            <p className="text-[11px] font-mono text-neutral-500">
                                Hardcore Biological Discipline Protocol
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => toggleAudio()}
                            className="p-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-sm"
                            title={audioEnabled ? 'Mute' : 'Unmute'}
                        >
                            {audioEnabled ? '🔊' : '🔇'}
                        </button>

                        <button
                            type="button"
                            onClick={() => setSettingsOpen(true)}
                            className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-mono text-neutral-300 flex items-center gap-2 transition-all"
                        >
                            <span>⚙️</span>
                            <span className="hidden sm:inline">Settings</span>
                        </button>
                    </div>
                </header>

                {/* Main Dashboard Space */}
                <main className="max-w-4xl w-full mx-auto my-8 space-y-6">
                    {/* Vitality HP Bar */}
                    <HpBar hp={current_hp} stage={stage} />

                    {/* Giant Countdown & Action Center */}
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
                    />

                    {/* Statistics and Items */}
                    <StatsBadge
                        daysSurvived={days_survived}
                        shutdownStacks={shutdown_stacks}
                        ticketsCount={tickets_count}
                        onUseTicket={useTicket}
                        stage={stage}
                    />
                </main>

                {/* Footer notes */}
                <footer className="max-w-4xl w-full mx-auto pt-6 border-t border-neutral-900 flex flex-col sm:flex-row justify-between text-center sm:text-left text-xs font-mono text-neutral-600 gap-2">
                    <div>Discord Guard: {discord_user_id ? `Target ID ${discord_user_id} active` : 'No target bound'}</div>
                    <div>Account Status: {shutdown_stacks} / 5 strikes</div>
                </footer>

                {/* Configuration Modal */}
                <SettingsModal
                    isOpen={settingsOpen}
                    onClose={() => setSettingsOpen(false)}
                    currentWakeUpTime={wake_up_time}
                    currentDiscordId={discord_user_id}
                    audioEnabled={audioEnabled}
                    onToggleAudio={toggleAudio}
                    onSave={saveSettings}
                />
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'SleepOrDie',
            href: dashboard(),
        },
    ],
};
