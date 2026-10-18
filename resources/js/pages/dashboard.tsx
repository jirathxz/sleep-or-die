import React, { useEffect, useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { CountdownDisplay } from '@/components/Sleep/CountdownDisplay';
import { HpBar } from '@/components/Sleep/HpBar';
import { LevelExpBar } from '@/components/Sleep/LevelExpBar';
import { StageOverlay } from '@/components/Sleep/StageOverlay';
import { StatsBadge } from '@/components/Sleep/StatsBadge';
import { TombstoneScreen } from '@/components/Sleep/TombstoneScreen';
import { SimulationBar } from '@/components/Sleep/SimulationBar';
import { HitmanCodecModal } from '@/components/Sleep/HitmanCodecModal';
import { InventoryOverflowModal } from '@/components/Sleep/InventoryOverflowModal';
import { useSleepStore, getAgentRank } from '@/stores/useSleepStore';
import { Volume2, VolumeX, Shield } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

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
            discord_bot_token?: string | null;
            last_sleep_confirmed_at?: string | null;
        };
    };
    [key: string]: unknown;
}

export default function Dashboard() {
    const { auth } = usePage<PageProps>().props;
    const { t } = useTranslation();

    const [toastMessage, setToastMessage] = useState<string | null>(null);

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
        saveSettings,
        discord_user_id,
        discord_bot_token,
        bestStreak,
        showHitmanModal,
        closeHitmanModal,
        debriefData,
        showOverflowModal,
        overflowMessage,
        closeOverflowModal,
        triggerMorningDebrief,
        startNextDay,
        simulationActive,
        startSimulation321,
        resetSimulation,
    } = useSleepStore();

    const handleUseTicket = async () => {
        const success = await useTicket();
        if (success) {
            const nextTarget = useSleepStore.getState().sleep_target_time;
            setToastMessage(`[ ยืนยัน ] ใช้ตั๋วฉุกเฉินสำเร็จ: เลื่อนเวลาเข้านอนออกไปอีก +30 นาที (เวลาเป้าหมายใหม่: ${nextTarget} น.)`);
            setTimeout(() => setToastMessage(null), 4000);
        } else {
            setToastMessage('ไม่สามารถใช้ตั๋วได้ (ไม่มีตั๋วคงเหลือ หรืออยู่นอกช่วงเวลา)');
            setTimeout(() => setToastMessage(null), 3000);
        }
    };


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
                tickets_count: auth.user.tickets_count ?? 0,
                is_disabled: auth.user.is_disabled ?? false,
                discord_user_id: auth.user.discord_user_id ?? null,
                discord_bot_token: auth.user.discord_bot_token ?? null,
                last_sleep_confirmed_at: auth.user.last_sleep_confirmed_at ?? null,
            });
        }

        fetchStatus();

        const handleFocus = () => {
            fetchStatus();
        };

        const pollTimer = setInterval(() => {
            fetchStatus();
        }, 15000);

        window.addEventListener('focus', handleFocus);

        return () => {
            window.removeEventListener('focus', handleFocus);
            clearInterval(pollTimer);
        };
    }, [auth?.user?.id]);

    useEffect(() => {
        const timer = setInterval(() => {
            tick();
        }, 1000);

        return () => clearInterval(timer);
    }, [tick]);

    if (is_disabled) {
        return <TombstoneScreen daysSurvived={days_survived} userName={auth?.user?.name || 'ผู้ใช้งาน'} />;
    }

    return (
        <>
            <Head title={`${t('dashboard_title')} - SleepOrDie`} />

            {/* Toast Feedback */}
            {toastMessage && (
                <div className="fixed top-6 right-6 z-50 bg-[#18181b] border border-emerald-500/40 text-emerald-300 text-xs px-4 py-2.5 rounded-xl shadow-2xl transition-all animate-in fade-in slide-in-from-top-2 font-mono">
                    {toastMessage}
                </div>
            )}

            {/* Emergency Alerts & Vignette Overlays */}
            <StageOverlay
                stage={stage}
                secondsRemaining={secondsRemaining}
                isConfirmed={Boolean(last_sleep_confirmed_at)}
                simulationActive={simulationActive}
            />

            <div className="max-w-3xl w-full mx-auto p-4 md:p-6 space-y-5 select-none">
                {/* Header: Pure focus on Dashboard role & Quick audio toggle */}
                <div className="flex items-center justify-between pb-1">
                    <div>
                        <h1 className="text-xl font-medium tracking-tight text-white">
                            {t('dashboard_title')}
                        </h1>
                        <p className="text-xs text-zinc-500 font-light mt-0.5">
                            {t('dashboard_desc')}
                        </p>
                        {/* Agent Rank Badge by Survival Streak */}
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 font-semibold tracking-wider flex items-center gap-1">
                                <Shield className="size-3" />
                                {getAgentRank(days_survived)}
                            </span>
                            {bestStreak > 0 && (
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/40 border border-amber-500/30 text-amber-400">
                                    TOP RECORD: {bestStreak} DAYS
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => toggleAudio()}
                            className="size-8 rounded-lg bg-[#121215] hover:bg-[#18181b] text-zinc-400 hover:text-white flex items-center justify-center transition-colors border border-white/5"
                            title={audioEnabled ? 'ปิดเสียงแจ้งเตือน' : 'เปิดเสียงแจ้งเตือน'}
                        >
                            {audioEnabled ? (
                                <Volume2 className="size-4 text-emerald-400" />
                            ) : (
                                <VolumeX className="size-4 text-zinc-500" />
                            )}
                        </button>
                    </div>
                </div>

                {/* 1. Vitality Matrix HP Bar (100% Health Status) */}
                <HpBar hp={current_hp} stage={stage} />

                {/* 2. Level & EXP Progression Progress Bar */}
                <LevelExpBar level={level} exp={exp} />

                {/* 3. Countdown Display & Primary Sleep Action (3 Daily Phases: Prepare -> Sleeping -> Debrief) */}
                <CountdownDisplay
                    hours={hoursRemaining}
                    minutes={minutesRemaining}
                    seconds={secondsRemaining}
                    isPastDeadline={isPastDeadline}
                    stage={stage}
                    sleepTargetTime={sleep_target_time}
                    wakeUpTime={wake_up_time}
                    onConfirmSleep={confirmSleep}
                    onWakeUp={triggerMorningDebrief}
                    onStartNextDay={startNextDay}
                    lastConfirmedAt={last_sleep_confirmed_at}
                    debriefData={debriefData}
                    simulationActive={simulationActive}
                />

                {/* 4. Daily Summary & Streak Progression Module */}
                <StatsBadge
                    daysSurvived={days_survived}
                    shutdownStacks={shutdown_stacks}
                    ticketsCount={tickets_count}
                    onUseTicket={handleUseTicket}
                    stage={stage}
                />

                {/* 5. Tactical Simulation Bar (แผงจำลองสถานะครบวงจร) */}
                <SimulationBar />
            </div>

            {/* Extended Prototype Modals */}
            <HitmanCodecModal
                isOpen={showHitmanModal}
                onClose={closeHitmanModal}
                onConfirmSleep={confirmSleep}
                secondsRemaining={secondsRemaining}
            />

            <InventoryOverflowModal
                isOpen={showOverflowModal}
                message={overflowMessage}
                onClose={closeOverflowModal}
            />
        </>
    );
}
