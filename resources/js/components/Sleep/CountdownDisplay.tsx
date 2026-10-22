import React from 'react';
import { SleepStage, DebriefData } from '@/stores/useSleepStore';
import {
    Moon,
    Sun,
    Award,
    Sparkles,
    CheckCircle2,
    Zap,
    RotateCcw,
    Volume2,
    Shield,
    Bot,
    AlertCircle,
    BellRing,
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

interface CountdownDisplayProps {
    hours: number;
    minutes: number;
    seconds: number;
    isPastDeadline: boolean;
    stage: SleepStage;
    sleepTargetTime: string | null;
    wakeUpTime: string | null;
    onConfirmSleep?: () => void;
    onWakeUp?: () => void;
    onStartNextDay?: () => void;
    lastConfirmedAt: string | null;
    debriefData?: DebriefData | null;
    isInVoice?: boolean;
    voiceChannel?: string | null;
    isPcOnline?: boolean;
    isSystemActive?: boolean;
    enableDiscord?: boolean;
    enableCpp?: boolean;
    simulationActive?: boolean;
    onStartSimulation?: () => void;
    onResetSimulation?: () => void;
    onTriggerAlertSync?: () => void;
    onSetQuickBedtime?: (minutes: number) => void;
    onResetBedtimeDefault?: () => void;
    onResetHp?: () => void;
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
    isInVoice = false,
    voiceChannel = null,
    isPcOnline = false,
    isSystemActive = true,
    enableDiscord = true,
    enableCpp = true,
    simulationActive = false,
    onStartSimulation,
    onResetSimulation,
    onTriggerAlertSync,
    onSetQuickBedtime,
    onResetBedtimeDefault,
    onResetHp,
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

                {/* Status Indicator */}
                <div className="flex items-center justify-center gap-2 text-xs font-mono">
                    <span className="size-2 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="text-cyan-300 font-medium">
                        {isTactical ? '// CRYO-STASIS CHAMBER ACTIVE' : 'กำลังนอนหลับพักผ่อน (Cryo-Stasis Chamber)'}
                    </span>
                </div>

                {/* Stasis Visual Display */}
                <div className="relative py-4 flex flex-col items-center justify-center">
                    <div className="size-20 md:size-24 rounded-full bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-center shadow-[0_0_40px_rgba(6,182,212,0.15)] mb-3 animate-pulse">
                        <Moon className="size-10 text-cyan-300" />
                    </div>

                    <div className="space-y-1">
                        <p className="text-2xl md:text-3xl font-mono font-bold text-white tracking-tight">
                            {isTactical ? 'STASIS IN PROGRESS' : 'ร่างกายกำลังฟื้นฟู'}
                        </p>
                        <p className="text-xs text-zinc-400 font-light">
                            ระบบล็อกเป้าหมายสำเร็จ ตัวเลขเวลานับถอยหลังหยุดทำงาน
                        </p>
                    </div>
                </div>

                {/* Schedule Details during Stasis */}
                <div className="flex items-center justify-center gap-3 text-xs text-zinc-400 font-mono">
                    <span>
                        {t('label_target')}{' '}
                        <span className="text-white font-medium">{sleepTargetTime || '23:15'} {isTactical ? 'HRS' : 'น.'}</span>
                    </span>
                    <span className="text-zinc-700">•</span>
                    <span className="text-cyan-400">
                        {t('label_wake')} {wakeUpTime || '07:00'} {isTactical ? 'HRS' : 'น.'}
                    </span>
                </div>

                {/* Action: Wake Up Button */}
                <div className="max-w-xs mx-auto pt-2">
                    <button
                        type="button"
                        onClick={onWakeUp}
                        className="w-full h-12 px-6 rounded-xl text-sm font-semibold bg-cyan-500 hover:bg-cyan-400 text-zinc-950 transition-all flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer shadow-lg shadow-cyan-500/20"
                    >
                        <Sun className="size-4" />
                        <span>{isTactical ? '[ WAKE UP & DEBRIEF ]' : 'ตื่นนอน (Wake Up)'}</span>
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

    const isVerifying = Boolean(lastConfirmedAt) && !isInVoice && (!enableCpp || !isPcOnline) && isSystemActive;

    if (!isSystemActive) {
        stageText = 'ระบบหยุดการทำงาน • ไม่ได้เปิดใช้งานการตรวจจับ Discord หรือ C++';
        dotColor = 'bg-rose-500';
        stageTextColor = 'text-rose-400 font-medium';
        digitsColor = 'text-zinc-500';
    } else if (isInVoice) {
        stageText = `ตรวจพบอยู่ในห้องคุยเสียง Discord ${voiceChannel ? `("${voiceChannel}")` : ''} • ไม่ถือว่านอน`;
        dotColor = 'bg-rose-500 animate-pulse';
        stageTextColor = 'text-rose-400 font-medium';
        digitsColor = 'text-white';
    } else if (enableCpp && isPcOnline) {
        stageText = 'C++ Guard ตรวจพบ PC ยังออนไลน์และมีการใช้งาน • ไม่ถือว่านอน';
        dotColor = 'bg-amber-400 animate-pulse';
        stageTextColor = 'text-amber-400 font-medium';
        digitsColor = 'text-white';
    } else if (isVerifying) {
        stageText = 'อยู่ในสถานะเข้านอนแล้ว • หากไม่ออนไลน์ระหว่างเวลานอน ถือว่านอนสำเร็จ';
        dotColor = 'bg-emerald-400 animate-pulse';
        stageTextColor = 'text-emerald-400';
        digitsColor = 'text-emerald-400';
    } else if (simulationActive && !isPastDeadline) {
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

            {/* Automated Detection Status & Test Simulation Controls */}
            <div className="max-w-md mx-auto space-y-3 pt-1">
                {stage === 'sleep' && !isVerifying && isSystemActive && (
                    <div className="text-xs text-rose-400 font-normal animate-pulse pb-0.5">
                        {isTactical
                            ? `EMERGENCY ALERT: ${seconds} SECONDS REMAINING! ENGAGE STASIS NOW`
                            : `⚠️ ถึงเวลาเข้านอนแล้ว! กรุณาปิดเครื่องคอมพิวเตอร์ หรือออฟไลน์ Discord ทันที`}
                    </div>
                )}

                {/* Status Indicator Card (No Manual Button) */}
                {!isSystemActive ? (
                    <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-normal flex flex-col items-center justify-center gap-1 text-center">
                        <span className="font-medium text-rose-200 flex items-center gap-1.5">
                            <AlertCircle className="size-4 text-rose-400" />
                            ระบบไม่ได้ทำงาน (ปิดการตรวจจับทั้งหมด)
                        </span>
                        <span className="text-[11px] text-rose-300/80 font-light">
                            กรุณาเปิดการตรวจจับ Discord Bot หรือ C++ Guard ในหน้าตั้งค่าอย่างน้อยหนึ่งช่องทาง
                        </span>
                    </div>
                ) : isInVoice ? (
                    <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-normal flex items-center justify-center gap-2">
                        <Volume2 className="size-4 text-rose-400 shrink-0" />
                        <span>กำลังอยู่ในห้องคุยเสียง {voiceChannel ? `"${voiceChannel}"` : ''} • ไม่ถือว่านอน</span>
                    </div>
                ) : isVerifying ? (
                    <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-normal flex items-center justify-center gap-2.5">
                        <Moon className="size-4 text-emerald-400" />
                        <span>อยู่ในสถานะนอนแล้ว • ตรวจจับผ่าน Discord และ C++ Guard</span>
                    </div>
                ) : (
                    <div className="p-3.5 rounded-xl bg-[#18181b] border border-white/5 text-zinc-300 text-xs flex flex-col items-center justify-center gap-1.5 text-center shadow-sm">
                        <div className="flex items-center gap-2 text-white font-medium">
                            <Shield className="size-3.5 text-emerald-400" />
                            <span>ตรวจจับการนอนอัตโนมัติผ่าน Discord และ C++</span>
                        </div>
                        <p className="text-[11px] text-zinc-400 font-light leading-relaxed">
                            ระบบจะบันทึกสถานะนอนให้โดยอัตโนมัติเมื่อตรวจพบการออฟไลน์ ปิดคอมพิวเตอร์ หรือล็อกหน้าจอ
                        </p>
                        <div className="flex items-center gap-2.5 text-[10px] text-zinc-400 pt-0.5">
                            <span className="flex items-center gap-1">
                                <Bot className="size-3 text-indigo-400" />
                                <span className={enableDiscord ? 'text-indigo-300 font-medium' : 'text-zinc-600 line-through'}>
                                    Discord {enableDiscord ? 'เปิด' : 'ปิด'}
                                </span>
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                                <Shield className={`size-3 ${enableCpp && isPcOnline ? 'text-amber-400 animate-pulse' : 'text-emerald-400'}`} />
                                <span className={enableCpp ? (isPcOnline ? 'text-amber-300 font-medium' : 'text-emerald-300 font-medium') : 'text-zinc-600 line-through'}>
                                    C++ Guard {enableCpp ? (isPcOnline ? 'เปิด (PC Online • ตรวจพบใช้งาน)' : 'เปิด (พร้อมตรวจจับ)') : 'ปิด'}
                                </span>
                            </span>
                        </div>
                    </div>
                )}

                {/* Optional Manual Confirm Sleep Button if provided */}
                {onConfirmSleep && (
                    <button
                        type="button"
                        onClick={onConfirmSleep}
                        disabled={stage === 'shutdown'}
                        className={`w-full h-11 px-6 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 active:scale-[0.98] ${
                            stage === 'sleep'
                                ? 'bg-rose-500 text-white hover:bg-rose-600 animate-pulse shadow-[0_0_20px_rgba(244,63,94,0.3)]'
                                : stage === 'shutdown'
                                  ? 'bg-[#18181b] text-zinc-600 cursor-not-allowed'
                                  : isTactical
                                    ? 'bg-[#9ab874] text-zinc-950 hover:bg-[#a9c783] font-mono tracking-wider'
                                    : 'bg-white text-zinc-950 hover:bg-zinc-200'
                        }`}
                    >
                        <Moon className="size-3.5 shrink-0" />
                        <span>{t('btn_confirm_sleep')}</span>
                    </button>
                )}

                {/* Simulation & Alert Sync Controls */}
                <div className="flex flex-wrap items-center justify-center gap-2 pt-0.5">
                    {!simulationActive ? (
                        <>
                            {onStartSimulation && (
                                <button
                                    type="button"
                                    onClick={onStartSimulation}
                                    className="h-8 px-3 rounded-lg bg-[#18181b] hover:bg-[#27272a] text-zinc-400 hover:text-white text-xs font-normal transition-colors flex items-center gap-1.5 active:scale-[0.98]"
                                    title="ทดสอบนับถอยหลัง 3 2 1 สู่เวลานอนและดูเอฟเฟกต์การลดเลือด"
                                >
                                    <Zap className="size-3.5 text-amber-400" />
                                    <span>ทดสอบตอนถึงเวลานอน 3 2 1</span>
                                </button>
                            )}

                            {onTriggerAlertSync && (
                                <button
                                    type="button"
                                    onClick={onTriggerAlertSync}
                                    className="h-8 px-3.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 hover:border-amber-500/30 text-xs font-normal transition-colors flex items-center gap-1.5 active:scale-[0.98]"
                                    title="ทดสอบการ Alert 60 วิ และ Lockdown Sign Out ที่ซิงค์กับ C++ Guard แบบเรียลไทม์"
                                >
                                    <BellRing className="size-3.5 text-amber-400" />
                                    <span>ทดสอบ Alert 60 วิ (Sync C++)</span>
                                </button>
                            )}
                        </>
                    ) : (
                        onResetSimulation && (
                            <button
                                type="button"
                                onClick={onResetSimulation}
                                className="h-8 px-3.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-normal transition-colors flex items-center gap-1.5 active:scale-[0.98]"
                                title="รีเซ็ตคืนค่าเวลาและพลังชีวิตปกติ"
                            >
                                <RotateCcw className="size-3.5 text-zinc-400" />
                                <span>คืนค่าปกติ</span>
                            </button>
                        )
                    )}
                </div>

                {/* Quick Bedtime Presets for Real Testing */}
                {onSetQuickBedtime && (
                    <div className="pt-2 border-t border-white/5 space-y-2">
                        <div className="flex items-center justify-between text-[11px] text-zinc-500 font-light px-1">
                            <span>ทดสอบเวลานับถอยหลังจริง (ตั้งเวลานอนทันที):</span>
                            {onResetHp && (
                                <button
                                    type="button"
                                    onClick={onResetHp}
                                    className="text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1 font-normal"
                                    title="รีเซ็ตพลังชีวิต (HP 100%)"
                                >
                                    <span>❤️ รีเซ็ต HP (100%)</span>
                                </button>
                            )}
                        </div>
                        <div className="flex flex-wrap items-center justify-center gap-1.5">
                            <button
                                type="button"
                                onClick={() => onSetQuickBedtime(1)}
                                className="h-7 px-2.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-[11px] font-normal transition-colors"
                                title="ตั้งเวลานอนในอีก 1 นาทีข้างหน้า เพื่อนับถอยหลังจริง 60 วิ และทดสอบการลด HP"
                            >
                                ⏱️ +1 นาที (ทดสอบเส้นตาย)
                            </button>
                            <button
                                type="button"
                                onClick={() => onSetQuickBedtime(5)}
                                className="h-7 px-2.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 text-[11px] font-normal transition-colors"
                                title="ตั้งเวลานอนในอีก 5 นาทีข้างหน้า เพื่อทดสอบระยะ Lockdown"
                            >
                                🔒 +5 นาที (Lockdown)
                            </button>
                            <button
                                type="button"
                                onClick={() => onSetQuickBedtime(10)}
                                className="h-7 px-2.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 text-[11px] font-normal transition-colors"
                                title="ตั้งเวลานอนในอีก 10 นาทีข้างหน้า เพื่อทดสอบระยะ Alert"
                            >
                                🔔 +10 นาที (Alert)
                            </button>
                            {onResetBedtimeDefault && (
                                <button
                                    type="button"
                                    onClick={onResetBedtimeDefault}
                                    className="h-7 px-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white text-[11px] font-normal transition-colors"
                                    title="คืนค่าเวลานอนมาตรฐาน 23:15 น."
                                >
                                    🌙 คืนค่า 23:15 น.
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};
