import React, { useEffect, useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { CountdownDisplay } from '@/components/Sleep/CountdownDisplay';
import { HpBar } from '@/components/Sleep/HpBar';
import { SettingsModal } from '@/components/Sleep/SettingsModal';
import { StageOverlay } from '@/components/Sleep/StageOverlay';
import { StatsBadge } from '@/components/Sleep/StatsBadge';
import { TombstoneScreen } from '@/components/Sleep/TombstoneScreen';
import { dashboard } from '@/routes';
import { useSleepStore } from '@/stores/useSleepStore';
import { Volume2, VolumeX, Settings, Shield, ShieldAlert } from 'lucide-react';

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
            <Head title="SleepOrDie - ระบบควบคุมวินัยการนอนหลับ" />

            <StageOverlay stage={stage} />

            <div className="min-h-screen bg-[#09090b] text-[#ffffff] p-4 md:p-8 flex flex-col justify-between selection:bg-white selection:text-zinc-950">
                {/* Header: Minimalist, No Badge, No Border */}
                <header className="max-w-3xl w-full mx-auto flex items-center justify-between pb-5">
                    <div>
                        <h1 className="text-lg md:text-xl font-medium tracking-tight text-white uppercase">
                            Sleep Or Die
                        </h1>
                        <p className="text-xs text-zinc-500 font-light">
                            ระบบควบคุมและตรวจจับวินัยการนอนหลับ
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        {auth?.user ? (
                            <span className="text-xs text-zinc-400 font-light hidden sm:inline mr-2">
                                ผู้ใช้งาน: <span className="font-normal text-white">{auth.user.name}</span>
                            </span>
                        ) : (
                            <div className="flex items-center gap-2 mr-1">
                                <Link
                                    href="/login"
                                    className="h-8 px-3 rounded-lg text-xs font-normal text-zinc-400 hover:text-white transition-colors flex items-center"
                                >
                                    เข้าสู่ระบบ
                                </Link>
                                <Link
                                    href="/register"
                                    className="h-8 px-3.5 rounded-lg bg-white text-zinc-950 text-xs font-medium hover:bg-zinc-200 transition-colors flex items-center"
                                >
                                    สมัครสมาชิก
                                </Link>
                            </div>
                        )}

                        <button
                            onClick={() => toggleAudio()}
                            className="size-9 rounded-lg bg-[#18181b] hover:bg-[#27272a] text-zinc-300 flex items-center justify-center transition-colors"
                            title={audioEnabled ? 'ปิดเสียงแจ้งเตือน' : 'เปิดเสียงแจ้งเตือน'}
                        >
                            {audioEnabled ? (
                                <Volume2 className="size-4 text-emerald-400" />
                            ) : (
                                <VolumeX className="size-4 text-zinc-500" />
                            )}
                        </button>

                        <button
                            onClick={() => setSettingsOpen(true)}
                            className="h-9 px-3 rounded-lg bg-[#18181b] hover:bg-[#27272a] text-xs font-normal text-zinc-300 flex items-center gap-2 transition-colors"
                        >
                            <Settings className="size-3.5" />
                            <span className="hidden sm:inline">ตั้งค่า</span>
                        </button>
                    </div>
                </header>

                {/* Main Space: Compact Proximity, Single Focal Point */}
                <main className="max-w-3xl w-full mx-auto my-4 space-y-4">
                    {/* Vitality Matrix HP Bar */}
                    <HpBar hp={current_hp} stage={stage} />

                    {/* Countdown Display & Primary Sleep Action */}
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

                    {/* Unified Stats & Extension Module (No duplicate cards, No badges) */}
                    <StatsBadge
                        daysSurvived={days_survived}
                        shutdownStacks={shutdown_stacks}
                        ticketsCount={tickets_count}
                        onUseTicket={useTicket}
                        stage={stage}
                    />
                </main>

                {/* Footer: Subtle Divider, Clean Inline Typography (Strictly No Badge) */}
                <footer className="max-w-3xl w-full mx-auto pt-5 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 font-light gap-2">
                    <div className="flex items-center gap-2">
                        <Shield className="size-3.5 text-zinc-400" />
                        <span>Discord Guard:</span>
                        <span className="text-zinc-300 font-normal">
                            {discord_user_id ? `ID: ${discord_user_id}` : 'ยังไม่เชื่อมต่อ'}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <ShieldAlert className="size-3.5 text-zinc-400" />
                        <span>สถานะบัญชี:</span>
                        <span
                            className={`font-normal ${
                                shutdown_stacks >= 4 ? 'text-rose-400' : 'text-zinc-300'
                            }`}
                        >
                            {shutdown_stacks} / 5 สไตรค์
                        </span>
                    </div>
                </footer>

                {/* Settings Configuration Modal */}
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
