import React, { useState } from 'react';
import {
    Zap,
    FastForward,
    HeartCrack,
    Bell,
    ShieldAlert,
    Skull,
    RotateCcw,
    AlertTriangle,
    Radio,
    Award,
    ChevronDown,
} from 'lucide-react';
import { useSleepStore } from '@/stores/useSleepStore';
import { useTranslation } from '@/lib/i18n';

export const SimulationBar: React.FC = () => {
    const {
        simulationActive,
        stage,
        decreaseHp,
        fastForward5s,
        simulateStage,
        resetSimulation,
        triggerMorningDebrief,
        openHitmanModal,
        theme_preference,
        corner_style,
    } = useSleepStore();

    const { t, isTactical } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);

    const isSpecial = theme_preference === 'special';
    const isSharp = corner_style === 'sharp';
    const cornerRadius = isSharp ? 'rounded-none' : 'rounded-xl';
    const btnCornerRadius = isSharp ? 'rounded-none' : 'rounded-lg';

    return (
        <>
            {/* Compact Simulation Toolbar */}
            <div
                className={`select-none transition-all duration-200 border relative overflow-hidden ${cornerRadius} ${
                    isSpecial
                        ? 'bg-[#060c06] border-[#8cf044]/30 shadow-[0_0_15px_rgba(140,240,68,0.06)]'
                        : 'bg-[#121215] border-white/5 shadow-sm'
                } p-2.5 sm:p-3`}
            >
                {/* Tactical Corner Brackets (Special Theme only) */}
                {isSpecial && (
                    <>
                        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#8cf044]" />
                        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#8cf044]" />
                        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[#8cf044]" />
                        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#8cf044]" />
                    </>
                )}

                {/* Minimal Header Bar */}
                <div className="flex items-center justify-between gap-2">
                    {/* Left: Title & Status Badge */}
                    <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                        <Zap className="size-3.5 text-amber-400 shrink-0" />
                        <span className={`text-xs font-medium truncate ${isSpecial ? 'text-[#8cf044]' : 'text-zinc-200'}`}>
                            {t('sim_lab_title')}
                        </span>

                        <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded-full border flex items-center gap-1.5 shrink-0 ${
                                simulationActive
                                    ? isSpecial
                                        ? 'bg-[#0f240f] text-[#ffb700] border-[#ffb700]/40'
                                        : 'bg-amber-950/50 text-amber-300 border-amber-500/30'
                                    : 'bg-[#18181b] text-zinc-500 border-zinc-800'
                            }`}
                        >
                            <span
                                className={`size-1.5 rounded-full ${
                                    simulationActive
                                        ? 'bg-amber-400 animate-ping'
                                        : 'bg-zinc-600'
                                }`}
                            />
                            <span>
                                {simulationActive
                                    ? isTactical
                                        ? `SIM: ${stage.toUpperCase()}`
                                        : `จำลอง: ${stage}`
                                    : isTactical
                                    ? 'STANDBY'
                                    : 'สแตนด์บาย'}
                            </span>
                        </span>
                    </div>

                    {/* Right: Quick Reset (if active) & Expand/Collapse Toggle */}
                    <div className="flex items-center gap-1.5 shrink-0">
                        {simulationActive && (
                            <button
                                type="button"
                                onClick={resetSimulation}
                                className={`h-7 px-2.5 ${btnCornerRadius} text-[11px] font-mono transition-colors flex items-center gap-1.5 active:scale-[0.98] ${
                                    isSpecial
                                        ? 'bg-[#0d1f0d] text-[#8cf044] hover:bg-[#8cf044] hover:text-black border border-[#8cf044]/40 font-bold'
                                        : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                                }`}
                                title={isTactical ? 'Restore defaults' : 'คืนค่าระบบปกติ'}
                            >
                                <RotateCcw className="size-3" />
                                <span className="hidden xs:inline">{t('sim_btn_reset')}</span>
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={() => setIsOpen((prev) => !prev)}
                            className={`h-7 px-2.5 ${btnCornerRadius} text-[11px] font-mono transition-all flex items-center gap-1.5 active:scale-[0.98] ${
                                isOpen
                                    ? isSpecial
                                        ? 'bg-[#8cf044] text-black font-bold'
                                        : 'bg-zinc-800 text-white border border-white/10'
                                    : isSpecial
                                    ? 'bg-[#0a140a] text-[#8cf044] hover:bg-[#0f240f] border border-[#8cf044]/30'
                                    : 'bg-[#18181b] hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/5'
                            }`}
                            aria-expanded={isOpen}
                        >
                            <span>{isOpen ? (isTactical ? 'HIDE' : 'ซ่อน') : (isTactical ? 'TEST' : 'ทดสอบ')}</span>
                            <ChevronDown
                                className={`size-3 transition-transform duration-200 ${
                                    isOpen ? 'rotate-180' : ''
                                }`}
                            />
                        </button>
                    </div>
                </div>

                {/* Collapsible Controls Panel */}
                {isOpen && (
                    <div className="pt-2.5 mt-2.5 border-t border-white/5 space-y-2 animate-in fade-in slide-in-from-top-1 duration-150">
                        {/* Row 1: Stage Simulation Segmented Controls */}
                        <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider pr-1">
                                {isTactical ? 'STAGE:' : 'จำลองระยะ:'}
                            </span>

                            {/* Alert */}
                            <button
                                type="button"
                                onClick={() => simulateStage('alert')}
                                className={`h-7 px-2.5 ${btnCornerRadius} text-[11px] font-mono transition-all flex items-center gap-1.5 active:scale-[0.98] border ${
                                    stage === 'alert' && simulationActive
                                        ? isSpecial
                                            ? 'bg-[#ffb700] text-black font-bold border-[#ffb700]'
                                            : 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
                                        : isSpecial
                                        ? 'bg-[#081208] hover:bg-[#0e200e] text-zinc-300 border-[#8cf044]/20'
                                        : 'bg-[#18181b] hover:bg-zinc-800 text-zinc-300 border-white/5'
                                }`}
                            >
                                <Bell className="size-3 text-amber-400" />
                                <span>{t('sim_btn_alert')}</span>
                            </button>

                            {/* Lockdown */}
                            <button
                                type="button"
                                onClick={() => simulateStage('lockdown')}
                                className={`h-7 px-2.5 ${btnCornerRadius} text-[11px] font-mono transition-all flex items-center gap-1.5 active:scale-[0.98] border ${
                                    stage === 'lockdown' && simulationActive
                                        ? isSpecial
                                            ? 'bg-[#ff8800] text-black font-bold border-[#ff8800]'
                                            : 'bg-amber-600/20 text-amber-300 border-amber-600/50 shadow-sm'
                                        : isSpecial
                                        ? 'bg-[#081208] hover:bg-[#0e200e] text-zinc-300 border-[#8cf044]/20'
                                        : 'bg-[#18181b] hover:bg-zinc-800 text-zinc-300 border-white/5'
                                }`}
                            >
                                <ShieldAlert className="size-3 text-amber-500" />
                                <span>{t('sim_btn_lockdown')}</span>
                            </button>

                            {/* Emergency */}
                            <button
                                type="button"
                                onClick={() => simulateStage('sleep')}
                                className={`h-7 px-2.5 ${btnCornerRadius} text-[11px] font-mono transition-all flex items-center gap-1.5 active:scale-[0.98] border ${
                                    stage === 'sleep' && simulationActive
                                        ? isSpecial
                                            ? 'bg-[#ff4444] text-black font-bold border-[#ff4444]'
                                            : 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-sm'
                                        : isSpecial
                                        ? 'bg-[#081208] hover:bg-[#0e200e] text-zinc-300 border-[#8cf044]/20'
                                        : 'bg-[#18181b] hover:bg-zinc-800 text-zinc-300 border-white/5'
                                }`}
                            >
                                <AlertTriangle className="size-3 text-rose-400" />
                                <span>{t('sim_btn_emergency')}</span>
                            </button>

                            {/* Shutdown */}
                            <button
                                type="button"
                                onClick={() => simulateStage('shutdown')}
                                className={`h-7 px-2.5 ${btnCornerRadius} text-[11px] font-mono transition-all flex items-center gap-1.5 active:scale-[0.98] border ${
                                    stage === 'shutdown' && simulationActive
                                        ? isSpecial
                                            ? 'bg-rose-600 text-white font-bold border-rose-600 shadow-[0_0_12px_rgba(244,63,94,0.4)]'
                                            : 'bg-rose-600/30 text-rose-200 border-rose-500 shadow-sm'
                                        : isSpecial
                                        ? 'bg-[#081208] hover:bg-[#150a0a] text-rose-400 border-rose-500/30'
                                        : 'bg-[#18181b] hover:bg-zinc-800 text-rose-400 border-rose-500/20'
                                }`}
                            >
                                <Skull className="size-3 text-rose-400" />
                                <span>{t('sim_btn_shutdown')}</span>
                            </button>
                        </div>

                        {/* Row 2: Quick Parameters & Extended Prototype Triggers */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider pr-1">
                                {isTactical ? 'ACTIONS:' : 'คำสั่ง:'}
                            </span>

                            {/* -25% HP */}
                            <button
                                type="button"
                                onClick={() => decreaseHp(25)}
                                className={`h-7 px-2.5 ${btnCornerRadius} text-[11px] font-mono transition-all flex items-center gap-1.5 active:scale-[0.98] border ${
                                    isSpecial
                                        ? 'bg-[#081208] hover:bg-[#150a0a] text-rose-400 border-rose-500/30'
                                        : 'bg-[#18181b] hover:bg-zinc-800 text-rose-400 border-white/5 hover:border-rose-500/30'
                                }`}
                                title={isTactical ? 'Decrease vitality by 25%' : 'ลดพลังชีวิตลง 25%'}
                            >
                                <HeartCrack className="size-3" />
                                <span>{t('sim_btn_hp_minus')}</span>
                            </button>

                            {/* Fast Forward 5s */}
                            <button
                                type="button"
                                onClick={fastForward5s}
                                className={`h-7 px-2.5 ${btnCornerRadius} text-[11px] font-mono transition-all flex items-center gap-1.5 active:scale-[0.98] border ${
                                    isSpecial
                                        ? 'bg-[#081208] hover:bg-[#0e200e] text-[#ffb700] border-[#ffb700]/30'
                                        : 'bg-[#18181b] hover:bg-zinc-800 text-amber-400 border-white/5 hover:border-amber-500/30'
                                }`}
                                title={isTactical ? 'Fast forward to 5s' : 'กรอเวลานับถอยหลังเหลือ 5 วินาที'}
                            >
                                <FastForward className="size-3" />
                                <span>{t('sim_btn_ff5s')}</span>
                            </button>

                            {/* Morning Debrief */}
                            <button
                                type="button"
                                onClick={triggerMorningDebrief}
                                className={`h-7 px-2.5 ${btnCornerRadius} text-[11px] font-mono transition-all flex items-center gap-1.5 active:scale-[0.98] border ${
                                    isSpecial
                                        ? 'bg-[#081208] hover:bg-[#0e200e] text-[#8cf044] border-[#8cf044]/30'
                                        : 'bg-[#18181b] hover:bg-zinc-800 text-amber-400 border-white/5 hover:border-amber-500/30'
                                }`}
                                title="จำลองการตื่นนอนเพื่อทดสอบหน้าต่างสรุปผล S/A/B Rank"
                            >
                                <Award className="size-3" />
                                <span>{isTactical ? 'DEBRIEF' : 'สรุปผลยามเช้า'}</span>
                            </button>

                            {/* CODEC 140.85 */}
                            <button
                                type="button"
                                onClick={openHitmanModal}
                                className={`h-7 px-2.5 ${btnCornerRadius} text-[11px] font-mono transition-all flex items-center gap-1.5 active:scale-[0.98] border ${
                                    isSpecial
                                        ? 'bg-[#081208] hover:bg-[#0e200e] text-[#8cf044] border-[#8cf044]/30'
                                        : 'bg-[#18181b] hover:bg-zinc-800 text-emerald-400 border-white/5 hover:border-emerald-500/30'
                                }`}
                                title="จำลองหน้าต่างวิทยุฉุกเฉิน Codec 140.85 & เพลง invisible.mp3"
                            >
                                <Radio className="size-3" />
                                <span>CODEC 140.85</span>
                            </button>

                            {/* Reset System */}
                            <button
                                type="button"
                                onClick={resetSimulation}
                                className={`h-7 px-2.5 ${btnCornerRadius} text-[11px] font-mono transition-all flex items-center gap-1.5 active:scale-[0.98] border ${
                                    isSpecial
                                        ? 'bg-[#0d1f0d] hover:bg-[#8cf044] text-[#8cf044] hover:text-black border-[#8cf044]/40 font-bold'
                                        : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700'
                                }`}
                                title={isTactical ? 'Restore normal state' : 'คืนค่าระบบกลับสู่สถานะปกติ'}
                            >
                                <RotateCcw className="size-3 text-emerald-400" />
                                <span>{t('sim_btn_reset')}</span>
                            </button>
                        </div>
                    </div>
                )}
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
