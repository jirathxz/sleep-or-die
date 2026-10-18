import React from 'react';
import { Zap, FastForward, HeartCrack, Bell, ShieldAlert, Skull, RotateCcw, AlertTriangle, Radio, Award } from 'lucide-react';
import { useSleepStore } from '@/stores/useSleepStore';
import { useTranslation } from '@/lib/i18n';

export const SimulationBar: React.FC = () => {
    const {
        simulationActive,
        stage,
        current_hp,
        decreaseHp,
        fastForward5s,
        simulateStage,
        resetSimulation,
        triggerMorningDebrief,
        openHitmanModal,
    } = useSleepStore();

    const { t, isTactical } = useTranslation();

    return (
        <>
            {/* Simulation Toolbar Card */}
            <div
                className={`bg-[#121215] rounded-2xl p-4 md:p-5 space-y-3.5 shadow-sm select-none border relative overflow-hidden transition-all ${
                    isTactical
                        ? 'border-[#9ab874]/30 shadow-[0_0_20px_rgba(154,184,116,0.05)]'
                        : 'border-white/5'
                }`}
            >
                {/* Tactical HUD Corner Brackets */}
                {isTactical && (
                    <>
                        <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-[#9ab874]" />
                        <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-[#9ab874]" />
                        <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-[#9ab874]" />
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-[#9ab874]" />
                    </>
                )}

                {/* Header */}
                <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-white flex items-center gap-2">
                        <Zap className="size-4 text-amber-400" />
                        {t('sim_lab_title')}
                    </span>

                    <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                            simulationActive
                                ? 'bg-amber-950/50 text-amber-400 border-amber-500/30 animate-pulse'
                                : 'bg-[#18181b] text-zinc-500 border-zinc-800'
                        }`}
                    >
                        {simulationActive
                            ? isTactical
                                ? 'SIMULATION: ACTIVE'
                                : 'สถานะ: กำลังจำลอง'
                            : isTactical
                            ? 'STANDBY'
                            : 'สแตนด์บาย'}
                    </span>
                </div>

                {/* Simulation Control Buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                    {/* 1. Decrease HP */}
                    <button
                        type="button"
                        onClick={() => decreaseHp(25)}
                        className="h-9 px-2 rounded-xl bg-[#18181b] hover:bg-zinc-800 text-rose-400 hover:text-rose-300 text-xs font-mono transition-all flex items-center justify-center gap-1.5 border border-rose-500/20 active:scale-[0.98]"
                        title={isTactical ? 'Decrease vitality by 25%' : 'ลดพลังชีวิตลง 25%'}
                    >
                        <HeartCrack className="size-3.5" />
                        <span className="truncate">{t('sim_btn_hp_minus')}</span>
                    </button>

                    {/* 2. Fast Forward 5s */}
                    <button
                        type="button"
                        onClick={fastForward5s}
                        className="h-9 px-2 rounded-xl bg-[#18181b] hover:bg-zinc-800 text-amber-400 hover:text-amber-300 text-xs font-mono transition-all flex items-center justify-center gap-1.5 border border-amber-500/20 active:scale-[0.98]"
                        title={isTactical ? 'Fast forward to 5 seconds remaining' : 'กรอเวลานับถอยหลังเหลือ 5 วินาที'}
                    >
                        <FastForward className="size-3.5" />
                        <span className="truncate">{t('sim_btn_ff5s')}</span>
                    </button>

                    {/* 3. Alert Stage */}
                    <button
                        type="button"
                        onClick={() => simulateStage('alert')}
                        className={`h-9 px-2 rounded-xl text-xs font-mono transition-all flex items-center justify-center gap-1.5 active:scale-[0.98] border ${
                            stage === 'alert' && simulationActive
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                                : 'bg-[#18181b] hover:bg-zinc-800 text-zinc-300 border-white/5'
                        }`}
                    >
                        <Bell className="size-3.5 text-amber-400" />
                        <span className="truncate">{t('sim_btn_alert')}</span>
                    </button>

                    {/* 4. Lockdown Stage */}
                    <button
                        type="button"
                        onClick={() => simulateStage('lockdown')}
                        className={`h-9 px-2 rounded-xl text-xs font-mono transition-all flex items-center justify-center gap-1.5 active:scale-[0.98] border ${
                            stage === 'lockdown' && simulationActive
                                ? 'bg-amber-600/20 text-amber-300 border-amber-600'
                                : 'bg-[#18181b] hover:bg-zinc-800 text-zinc-300 border-white/5'
                        }`}
                    >
                        <ShieldAlert className="size-3.5 text-amber-500" />
                        <span className="truncate">{t('sim_btn_lockdown')}</span>
                    </button>

                    {/* 5. Emergency Stage */}
                    <button
                        type="button"
                        onClick={() => simulateStage('sleep')}
                        className={`h-9 px-2 rounded-xl text-xs font-mono transition-all flex items-center justify-center gap-1.5 active:scale-[0.98] border ${
                            stage === 'sleep' && simulationActive
                                ? 'bg-rose-500/20 text-rose-300 border-rose-500'
                                : 'bg-[#18181b] hover:bg-zinc-800 text-zinc-300 border-white/5'
                        }`}
                    >
                        <AlertTriangle className="size-3.5 text-rose-400" />
                        <span className="truncate">{t('sim_btn_emergency')}</span>
                    </button>

                    {/* 6. Shutdown Failed Stage */}
                    <button
                        type="button"
                        onClick={() => simulateStage('shutdown')}
                        className={`h-9 px-2 rounded-xl text-xs font-mono transition-all flex items-center justify-center gap-1.5 active:scale-[0.98] border ${
                            stage === 'shutdown' && simulationActive
                                ? 'bg-rose-600/30 text-rose-300 border-rose-600'
                                : 'bg-[#18181b] hover:bg-zinc-800 text-rose-400 border-rose-500/20'
                        }`}
                    >
                        <Skull className="size-3.5 text-rose-500" />
                        <span className="truncate">{t('sim_btn_shutdown')}</span>
                    </button>

                    {/* 7. Reset System */}
                    <button
                        type="button"
                        onClick={resetSimulation}
                        className="col-span-2 sm:col-span-4 md:col-span-1 h-9 px-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono transition-all flex items-center justify-center gap-1.5 border border-zinc-700 active:scale-[0.98]"
                        title={isTactical ? 'Reset simulation and restore normal parameters' : 'คืนค่าระบบกลับสู่สถานะปกติ'}
                    >
                        <RotateCcw className="size-3.5 text-emerald-400" />
                        <span className="truncate">{t('sim_btn_reset')}</span>
                    </button>
                </div>

                {/* Extended Prototype Simulations Row */}
                <div className="pt-2 border-t border-white/5 flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-mono text-zinc-500">// EXTENDED:</span>
                    <button
                        type="button"
                        onClick={triggerMorningDebrief}
                        className="h-7 px-3 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-[11px] font-mono border border-amber-500/30 flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="จำลองการตื่นนอนเพื่อทดสอบหน้าต่างสรุปผล S/A/B Rank"
                    >
                        <Award className="size-3" />
                        <span>[ {isTactical ? 'SIMULATE DEBRIEFING (S/A/B)' : 'จำลองสรุปผลยามเช้า (S/A/B)'} ]</span>
                    </button>
                    <button
                        type="button"
                        onClick={openHitmanModal}
                        className="h-7 px-3 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[11px] font-mono border border-emerald-500/30 flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="จำลองหน้าต่างวิทยุฉุกเฉิน Codec 140.85 & เพลง invisible.mp3"
                    >
                        <Radio className="size-3" />
                        <span>[ {isTactical ? 'TEST CODEC 140.85 (BIG BOSS)' : 'ทดสอบ CODEC 140.85 (BIG BOSS)'} ]</span>
                    </button>
                </div>
            </div>

            {/* Mission Failed Overlay (when stage === 'shutdown' and simulationActive) */}
            {stage === 'shutdown' && simulationActive && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
                    <div className="bg-[#121215] border border-rose-500/40 rounded-2xl p-6 md:p-8 max-w-md w-full text-center space-y-5 shadow-2xl relative">
                        {/* Corner brackets */}
                        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-rose-500" />
                        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-rose-500" />
                        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-rose-500" />
                        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-rose-500" />

                        <div className="size-14 rounded-2xl bg-rose-950/50 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
                            <Skull className="size-8" />
                        </div>

                        <div className="space-y-1">
                            <h2 className="text-xl font-bold font-mono text-rose-500 tracking-wider">
                                {t('sim_failed_title')}
                            </h2>
                            <p className="text-xs font-mono text-zinc-400">
                                SNAKE? SNAKE?! SNAAAAAAAKE!
                            </p>
                        </div>

                        <div className="bg-[#18181b] rounded-xl p-3.5 text-xs text-left space-y-1.5 font-mono">
                            <p className="text-rose-400">&gt; TIME PARADOX: HP REACHED 0%</p>
                            <p className="text-zinc-400">&gt; {t('sim_failed_desc')}</p>
                            <p className="text-zinc-500">&gt; STATUS: STANDBY DISABLED</p>
                        </div>

                        <button
                            type="button"
                            onClick={resetSimulation}
                            className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-semibold py-3 rounded-xl text-xs font-mono transition-colors flex items-center justify-center gap-2 active:scale-[0.98] shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                        >
                            <RotateCcw className="size-4" />
                            <span>{t('sim_failed_respawn')}</span>
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};
