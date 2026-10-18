import React from 'react';
import { SleepStage, DebriefData } from '@/stores/useSleepStore';
import { Moon, Sun, Award, Sparkles, CheckCircle2 } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

interface CountdownDisplayProps {
    hours: number;
    minutes: number;
    seconds: number;
    isPastDeadline: boolean;
    stage: SleepStage;
    sleepTargetTime: string | null;
    wakeUpTime: string | null;
    onConfirmSleep: () => void;
    onWakeUp?: () => void;
    onStartNextDay?: () => void;
    lastConfirmedAt: string | null;
    debriefData?: DebriefData | null;
    simulationActive?: boolean;
}

export const CountdownDisplay: React.FC<CountdownDisplayProps> = ({
    hours,
    minutes,
    seconds,
    isPastDeadline,
    stage,
    sleepTargetTime,
    wakeUpTime,
    onConfirmSleep,
    onWakeUp,
    onStartNextDay,
    lastConfirmedAt,
    debriefData,
    simulationActive = false,
}) => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    const { t, isTactical } = useTranslation();

    // PHASE 3: MORNING DEBRIEFING (สรุปผลภารกิจยามเช้า แสดงผลในจุดเดียว)
    if (debriefData) {
        return (
            <section
                className={`bg-[#121215] rounded-2xl p-6 md:p-8 space-y-6 shadow-sm select-none border relative overflow-hidden transition-all text-left ${
                    isTactical
                        ? 'border-[#9ab874]/40 shadow-[0_0_30px_rgba(154,184,116,0.08)]'
                        : 'border-emerald-500/30'
                }`}
            >
                {/* Header Badge */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
                        <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span>// MORNING DEBRIEFING REPORT</span>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                        <Award className="size-3.5" />
                        <span>RANK {debriefData.rank}</span>
                    </div>
                </div>

                {/* Mission Pass Message */}
                <div className="space-y-1">
                    <h3 className="text-xl font-medium text-white tracking-tight">
                        ภารกิจเข้านอนสำเร็จ (Mission Accomplished)
                    </h3>
                    <p className="text-xs text-zinc-400 font-light">
                        ร่างกายได้รับการฟื้นฟูเต็มที่ เลือด (LIFE) ฟื้นเต็ม 100% พร้อมรับรอบวันใหม่
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#18181b]/80 border border-white/5 rounded-xl p-4">
                    <div className="space-y-1">
                        <span className="text-[11px] text-zinc-500 font-light">เวลาพักผ่อน</span>
                        <p className="text-sm font-semibold text-emerald-400 font-mono">
                            {debriefData.durationHours || '7.5 ชม.'}
                        </p>
                        <span className="text-[10px] text-zinc-500 font-light block">5 รอบการนอน (REM/Deep)</span>
                    </div>

                    <div className="space-y-1">
                        <span className="text-[11px] text-zinc-500 font-light">รางวัลภารกิจ</span>
                        <p className="text-sm font-semibold text-amber-400 font-mono">
                            +{debriefData.bonusExp || 50} EXP • รอด {debriefData.streak} วัน
                        </p>
                        <span className="text-[10px] text-zinc-500 font-light block">
                            {debriefData.isNewRecord ? 'สถิติสูงสุดใหม่!' : 'สถิติต่อเนื่อง'}
                        </span>
                    </div>

                    <div className="space-y-1">
                        <span className="text-[11px] text-zinc-500 font-light">เสบียงที่ได้รับ</span>
                        <p className="text-sm font-semibold text-zinc-200 font-mono">
                            {debriefData.itemsGiven?.length > 0 ? debriefData.itemsGiven.join(', ') : 'ไม่มี'}
                        </p>
                        {debriefData.itemsMissed?.length > 0 && (
                            <span className="text-[10px] text-rose-400 font-light block">
                                กระเป๋าเต็ม: {debriefData.itemsMissed.join(', ')}
                            </span>
                        )}
                    </div>
                </div>

                {/* Single Hero Action: Start Next Day */}
                <div className="max-w-xs mx-auto pt-2">
                    <button
                        type="button"
                        onClick={onStartNextDay}
                        className="w-full h-12 px-6 rounded-xl text-sm font-semibold bg-white hover:bg-zinc-200 text-zinc-950 transition-all flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer shadow-lg"
                    >
                        <Sun className="size-4 text-amber-500" />
                        <span>[ เริ่มรอบวันใหม่ ]</span>
                    </button>
                </div>
            </section>
        );
    }

    // PHASE 2: SLEEPING / CRYOSLEEP (กำลังนอนหลับพักผ่อน ตัวเลขหยุดนับ)
    const isSleeping = Boolean(lastConfirmedAt);

    if (isSleeping) {
        return (
            <section
                className={`bg-[#121215] rounded-2xl p-6 md:p-8 text-center space-y-6 shadow-sm select-none border relative overflow-hidden transition-all ${
                    isTactical
                        ? 'border-[#9ab874]/30 shadow-[0_0_30px_rgba(154,184,116,0.06)]'
                        : 'border-emerald-500/20'
                }`}
            >
                {/* Status Indicator */}
                <div className="flex items-center justify-center gap-2 text-xs font-mono text-emerald-400 pt-1">
                    <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>กำลังจำศีลนอนหลับพักผ่อน [CRYOSLEEP] • ระงับการหักเลือด LIFE</span>
                </div>

                {/* Cryosleep Stasis Status Card */}
                <div className="bg-[#18181b]/70 border border-emerald-500/20 rounded-2xl p-6 max-w-md mx-auto space-y-4">
                    <div className="flex items-center justify-center gap-2 text-emerald-400">
                        <Moon className="size-5 text-emerald-400 animate-pulse" />
                        <span className="text-base font-mono font-bold tracking-wider">
                            STASIS CHAMBER ACTIVE
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-left pt-2 border-t border-white/5">
                        <div className="space-y-0.5">
                            <span className="text-[11px] text-zinc-500 font-light">เข้านอนสำเร็จเมื่อ</span>
                            <p className="text-sm font-mono font-semibold text-white">
                                {lastConfirmedAt
                                    ? new Date(lastConfirmedAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
                                    : (sleepTargetTime || '23:15')} น.
                            </p>
                        </div>
                        <div className="space-y-0.5">
                            <span className="text-[11px] text-zinc-500 font-light">เป้าหมายเวลาตื่นนอน</span>
                            <p className="text-sm font-mono font-semibold text-emerald-400">
                                {wakeUpTime || '07:00'} น.
                            </p>
                        </div>
                    </div>

                    <p className="text-[11px] text-zinc-400 font-light">
                        ระบบเรดาร์หยุดนับถอยหลังชั่วคราว • ร่างกายกำลังพักผ่อนเต็มที่ เมื่อตื่นนอนให้กดปุ่มด้านล่างเพื่อสรุปผลภารกิจ
                    </p>
                </div>

                {/* Single Hero Action: Wake Up & Debrief */}
                <div className="max-w-xs mx-auto pt-2">
                    <button
                        type="button"
                        onClick={onWakeUp}
                        className="w-full h-12 px-6 rounded-xl text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-black transition-all flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer shadow-lg"
                    >
                        <Sun className="size-4 text-black" />
                        <span>[ ตื่นนอน & รายงานตัว ]</span>
                    </button>
                </div>
            </section>
        );
    }

    // PHASE 1: PREPARE (โหมดเตรียมตัวก่อนนอน / กลางวัน)
    let stageText = t('countdown_title');
    let dotColor = 'bg-white/40';
    let stageTextColor = 'text-zinc-400';
    let digitsColor = 'text-white';

    if (simulationActive && !isPastDeadline) {
        stageText = isTactical
            ? `SIMULATION IN PROGRESS: ${seconds} SECONDS REMAINING`
            : `โหมดจำลอง: นับถอยหลังสู่เวลานอน • เหลือ ${seconds} วินาที`;
        dotColor = 'bg-amber-400 animate-ping';
        stageTextColor = 'text-amber-400';
        digitsColor = 'text-amber-400';
    } else if (stage === 'alert') {
        stageText = t('countdown_warning');
        dotColor = 'bg-amber-400';
        stageTextColor = 'text-amber-400';
    } else if (stage === 'lockdown') {
        stageText = t('countdown_lockdown');
        dotColor = 'bg-amber-500';
        stageTextColor = 'text-amber-400';
    } else if (stage === 'sleep') {
        stageText = isTactical
            ? `EMERGENCY: ${seconds} SECONDS BEFORE ZERO VITALITY`
            : `ฉุกเฉิน: มีเวลาอีก ${seconds} วินาทีก่อนพลังชีวิตหมด`;
        dotColor = 'bg-rose-500 animate-pulse';
        stageTextColor = 'text-rose-400 font-medium';
        digitsColor = 'text-rose-400';
    } else if (stage === 'shutdown') {
        stageText = t('countdown_shutdown');
        dotColor = 'bg-zinc-600';
        stageTextColor = 'text-zinc-500';
        digitsColor = 'text-zinc-600';
    }

    return (
        <section
            className={`bg-[#121215] rounded-2xl p-6 md:p-8 text-center space-y-6 shadow-sm select-none border relative overflow-hidden transition-all ${
                isTactical
                    ? 'border-[#9ab874]/30 shadow-[0_0_30px_rgba(154,184,116,0.06)]'
                    : 'border-white/5'
            }`}
        >
            {/* Tactical HUD Corner Brackets */}
            {isTactical && (
                <>
                    <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#9ab874]" />
                    <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#9ab874]" />
                    <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#9ab874]" />
                    <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#9ab874]" />
                </>
            )}

            {/* Countdown Stage Title */}
            <div className="flex items-center justify-center gap-2 text-xs font-mono pt-1">
                <span className={`size-2 rounded-full ${dotColor}`} />
                <span className={stageTextColor}>{stageText}</span>
            </div>

            {/* Digital Radar Countdown Digits */}
            <div className="flex items-center justify-center gap-3 md:gap-6 my-2">
                <div className="flex flex-col items-center min-w-[70px] md:min-w-[90px]">
                    <span className={`text-5xl md:text-7xl font-mono font-bold tracking-tight tabular-nums ${digitsColor}`}>
                        {pad(hours)}
                    </span>
                    <span className="text-[11px] font-mono text-zinc-500 mt-1">
                        {t('unit_hours')}
                    </span>
                </div>

                <span className={`text-4xl md:text-6xl font-mono font-light pb-4 ${digitsColor} opacity-40`}>:</span>

                <div className="flex flex-col items-center min-w-[70px] md:min-w-[90px]">
                    <span className={`text-5xl md:text-7xl font-mono font-bold tracking-tight tabular-nums ${digitsColor}`}>
                        {pad(minutes)}
                    </span>
                    <span className="text-[11px] font-mono text-zinc-500 mt-1">
                        {t('unit_minutes')}
                    </span>
                </div>

                <span className={`text-4xl md:text-6xl font-mono font-light pb-4 ${digitsColor} opacity-40`}>:</span>

                <div className="flex flex-col items-center min-w-[70px] md:min-w-[90px]">
                    <span className={`text-5xl md:text-7xl font-mono font-bold tracking-tight tabular-nums ${digitsColor}`}>
                        {pad(seconds)}
                    </span>
                    <span className="text-[11px] font-mono text-zinc-500 mt-1">
                        {t('unit_seconds')}
                    </span>
                </div>
            </div>

            {/* Target & Wake Time Info */}
            <div className="flex items-center justify-center gap-3 text-xs text-zinc-400 font-mono">
                <span>
                    {t('label_target')}{' '}
                    <span className="text-white font-medium">{sleepTargetTime || '23:15'} {isTactical ? 'HRS' : 'น.'}</span>
                </span>
                <span className="text-zinc-700">•</span>
                <span className="text-zinc-500">
                    {t('label_wake')} {wakeUpTime || '07:00'} {isTactical ? 'HRS' : 'น.'} • {t('sleep_cycles')}
                </span>
            </div>

            {/* Hero Action Button: Enter Sleep */}
            <div className="max-w-xs mx-auto space-y-2 pt-2">
                {stage === 'sleep' && (
                    <div className="text-xs text-rose-400 font-mono font-medium animate-pulse pb-0.5">
                        {isTactical
                            ? `EMERGENCY ALERT: ${seconds} SECONDS REMAINING! ENGAGE STASIS NOW`
                            : `แจ้งเตือนฉุกเฉิน: มีเวลาอีก ${seconds} วินาทีก่อนพลังชีวิตหมด! รีบกดเข้านอนทันที`}
                    </div>
                )}
                <button
                    onClick={onConfirmSleep}
                    disabled={stage === 'shutdown'}
                    className={`w-full h-12 px-6 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2.5 active:scale-[0.98] ${
                        stage === 'sleep'
                            ? 'bg-rose-500 text-white hover:bg-rose-600 animate-pulse shadow-[0_0_30px_rgba(244,63,94,0.4)]'
                            : stage === 'shutdown'
                              ? 'bg-[#18181b] text-zinc-600 cursor-not-allowed'
                              : isTactical
                                ? 'bg-[#9ab874] text-zinc-950 hover:bg-[#a9c783] shadow-[0_0_20px_rgba(154,184,116,0.25)] hover:shadow-[0_0_30px_rgba(154,184,116,0.4)] font-mono tracking-wider'
                                : 'bg-white text-zinc-950 hover:bg-zinc-200 shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_25px_rgba(255,255,255,0.25)]'
                    }`}
                >
                    <Moon className="size-4 shrink-0" />
                    <span>{t('btn_confirm_sleep')}</span>
                </button>
            </div>
        </section>
    );
};

