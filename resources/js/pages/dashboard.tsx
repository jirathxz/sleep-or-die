import React, { useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { CountdownDisplay } from '@/components/Sleep/CountdownDisplay';
import { HpBar } from '@/components/Sleep/HpBar';
import { LevelExpBar } from '@/components/Sleep/LevelExpBar';
import { StageOverlay } from '@/components/Sleep/StageOverlay';
import { StatsBadge } from '@/components/Sleep/StatsBadge';
import { TombstoneScreen } from '@/components/Sleep/TombstoneScreen';
import { SyncAlertModal } from '@/components/Sleep/SyncAlertModal';
import { InventoryView } from '@/components/Sleep/InventoryView';
import { BlackMarketView } from '@/components/Sleep/BlackMarketView';
import { MissionHistoryView } from '@/components/Sleep/MissionHistoryView';
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
            points?: number;
            tickets_count?: number;
            is_disabled?: boolean;
            discord_user_id?: string | null;
            discord_bot_token?: string | null;
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
        points,
        tickets_count,
        is_disabled,
        last_sleep_confirmed_at,
        is_in_voice,
        voice_channel,
        enable_discord_detection,
        enable_cpp_detection,
        is_system_active,
        alert_state,
        cpp_presence,
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
        redeemTicket,
        fetchStatus,
        simulationActive,
        startSimulation321,
        resetSimulation,
        triggerAlertSequence,
        acknowledgeAlert,
        acknowledgeLockdown,
        acknowledgeSleepWarning,
        resetAlertSequence,
        resetHp,
        toggleAlertPause,
        theme_preference,
        border_style,
        setQuickBedtime,
        saveSettings,
    } = useSleepStore();

    useEffect(() => {
        if (auth?.user) {
            syncUser({
                current_hp: auth.user.current_hp ?? 100,
                wake_up_time: auth.user.wake_up_time || '07:00',
                sleep_target_time: auth.user.sleep_target_time || '23:15',
                shutdown_stacks: auth.user.shutdown_stacks ?? 0,
                days_survived: auth.user.days_survived ?? 0,
                level: auth.user.level ?? 1,
                exp: auth.user.exp ?? 0,
                points: auth.user.points ?? 100,
                tickets_count: auth.user.tickets_count ?? 0,
                is_disabled: auth.user.is_disabled ?? false,
                discord_user_id: auth.user.discord_user_id ?? null,
                discord_bot_token: auth.user.discord_bot_token ?? null,
                enable_discord_detection: (auth.user as any).enable_discord_detection ?? true,
                enable_cpp_detection: (auth.user as any).enable_cpp_detection ?? true,
                is_system_active: (auth.user as any).is_system_active ?? true,
                last_sleep_confirmed_at: auth.user.last_sleep_confirmed_at ?? null,
                theme_preference: (auth.user as any).theme_preference || (typeof window !== 'undefined' ? localStorage.getItem('sleep_theme_preference') : 'dark') || 'dark',
                border_style: (auth.user as any).border_style || (typeof window !== 'undefined' ? localStorage.getItem('sleep_border_style') : 'rounded') || 'rounded',
            });
        }

        fetchStatus();

        const handleFocus = () => {
            fetchStatus();
        };

        const pollTimer = setInterval(() => {
            fetchStatus();
        }, (alert_state && alert_state.phase !== 'idle') ? 2000 : 3000);

        window.addEventListener('focus', handleFocus);

        return () => {
            window.removeEventListener('focus', handleFocus);
            clearInterval(pollTimer);
        };
    }, [auth?.user?.id, alert_state?.phase]);

    useEffect(() => {
        const timer = setInterval(() => {
            tick();
        }, 1000);

        return () => clearInterval(timer);
    }, [tick]);

    const [activeTab, setActiveTab] = React.useState<number>(1);

    const isSpecial = theme_preference === 'special';
    const isSharp = border_style === 'sharp';

    if (is_disabled) {
        return <TombstoneScreen daysSurvived={days_survived} userName={auth?.user?.name || 'ผู้ใช้งาน'} onResetHp={resetHp} />;
    }

    return (
        <>
            <Head title="แผงควบคุม - SleepOrDie" />

            {/* Emergency Alerts & Vignette Overlays */}
            <StageOverlay stage={stage} secondsRemaining={secondsRemaining} />

            <div className="max-w-4xl w-full mx-auto p-4 md:p-6 space-y-5 select-none">
                {/* Header Tabs matching active theme */}
                <div className="flex flex-wrap items-center justify-between gap-2.5 pb-1">
                    <div className={`flex flex-wrap items-center gap-2 text-xs sm:text-sm ${isSpecial ? 'font-mono' : 'font-sans'}`}>
                        {[
                            { id: 1, label: isSpecial ? '[ 1. เรดาร์ & พลังชีวิต ]' : '1. เรดาร์ & พลังชีวิต' },
                            { id: 2, label: isSpecial ? '[ 2. กระเป๋าเก็บของ ]' : '2. กระเป๋าเก็บของ' },
                            { id: 3, label: isSpecial ? '[ 3. ตลาดมืด ]' : '3. ตลาดมืด' },
                            { id: 4, label: isSpecial ? '[ 4. ประวัติภารกิจ ]' : '4. ประวัติภารกิจ' },
                        ].map((tab) => {
                            const isActive = activeTab === tab.id;
                            let btnClasses = '';
                            if (isSpecial) {
                                btnClasses = isActive
                                    ? 'bg-[#8cf044] text-black font-bold border-[#8cf044] shadow-[0_0_12px_rgba(140,240,68,0.35)]'
                                    : 'bg-[#060c06] text-[#8cf044] border-[#8cf044]/30 hover:border-[#8cf044]/70 hover:bg-[#0c180c]';
                            } else {
                                btnClasses = isActive
                                    ? 'bg-zinc-800 text-white font-medium border-zinc-700 shadow-sm ring-1 ring-white/10'
                                    : 'bg-[#121215] text-zinc-400 border-white/5 hover:bg-zinc-800/60 hover:text-zinc-200 hover:border-white/10';
                            }

                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-3 sm:px-4 py-2 border transition-all ${isSharp ? 'rounded-none' : 'rounded-lg'} ${btnClasses}`}
                                >
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>

                    <button
                        type="button"
                        onClick={() => toggleAudio()}
                        className={`size-8 ${isSharp ? 'rounded-none' : 'rounded-lg'} bg-[#121215] hover:bg-[#18181b] text-zinc-400 hover:text-white flex items-center justify-center transition-colors border border-white/5`}
                        title={audioEnabled ? 'ปิดเสียงแจ้งเตือน' : 'เปิดเสียงแจ้งเตือน'}
                    >
                        {audioEnabled ? (
                            <Volume2 className="size-4 text-emerald-400" />
                        ) : (
                            <VolumeX className="size-4 text-zinc-500" />
                        )}
                    </button>
                </div>

                {/* TAB 1: RADAR & VITALITY */}
                {activeTab === 1 && (
                    <div className="space-y-5">
                        {/* 1. Vitality Matrix HP Bar (100% Health Status) */}
                        <HpBar hp={current_hp} stage={stage} onResetHp={resetHp} />

                        {/* 2. Level & EXP Progression Progress Bar */}
                        <LevelExpBar level={level} exp={exp} />

                        {/* 3. Countdown Display & Automated Presence Status + 3-2-1 Test Simulation */}
                        <CountdownDisplay
                            hours={hoursRemaining}
                            minutes={minutesRemaining}
                            seconds={secondsRemaining}
                            isPastDeadline={isPastDeadline}
                            stage={stage}
                            sleepTargetTime={sleep_target_time}
                            wakeUpTime={wake_up_time}
                            lastConfirmedAt={last_sleep_confirmed_at}
                            isInVoice={is_in_voice}
                            voiceChannel={voice_channel}
                            isPcOnline={cpp_presence?.is_pc_online}
                            isSystemActive={is_system_active}
                            enableDiscord={enable_discord_detection}
                            enableCpp={enable_cpp_detection}
                            simulationActive={simulationActive}
                            onStartSimulation={startSimulation321}
                            onResetSimulation={resetSimulation}
                            onTriggerAlertSync={() => triggerAlertSequence(60)}
                            onSetQuickBedtime={setQuickBedtime}
                            onResetBedtimeDefault={() => saveSettings(undefined, undefined, undefined, undefined, '23:15')}
                            onResetHp={resetHp}
                        />

                        {/* 4. Daily Summary & Streak Progression Module */}
                        <StatsBadge
                            daysSurvived={days_survived}
                            shutdownStacks={shutdown_stacks}
                            ticketsCount={tickets_count}
                            points={points}
                            onUseTicket={useTicket}
                            onRedeemTicket={redeemTicket}
                            stage={stage}
                        />
                    </div>
                )}

                {/* TAB 2: INVENTORY */}
                {activeTab === 2 && (
                    <InventoryView onSwitchTab={setActiveTab} />
                )}

                {/* TAB 3: BLACK MARKET */}
                {activeTab === 3 && (
                    <BlackMarketView onSwitchTab={setActiveTab} />
                )}

                {/* TAB 4: MISSION LOGS & SLEEP HISTORY */}
                {activeTab === 4 && (
                    <MissionHistoryView />
                )}

                {/* Synchronized Alert & Lockdown Modals across Web and C++ */}
                <SyncAlertModal
                    alertState={alert_state}
                    onAcknowledgeAlert={acknowledgeAlert}
                    onAcknowledgeLockdown={acknowledgeLockdown}
                    onAcknowledgeSleepWarning={acknowledgeSleepWarning}
                    onReset={resetAlertSequence}
                    onTogglePause={toggleAlertPause}
                    onResetHp={resetHp}
                />
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'แผงควบคุม',
            href: dashboard(),
        },
    ],
};
