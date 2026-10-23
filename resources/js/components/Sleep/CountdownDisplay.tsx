import React, { useState } from 'react';
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
    ChevronDown,
    Sliders,
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
    const [showTestMenu, setShowTestMenu] = useState(false);

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
                        <span>{isTactical ? '// MORNING DEBRIEFING REPORT' : 'รายงานผลการนอนยามเช้า'}</span>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                        <Award className="size-3.5" />
                        <span>RANK {debriefData.rank}</span>
                    </div>
                </div>

                {/* Mission Pass Message */}
                <div className="space-y-1">
                    <h3 className="text-xl font-medium text-white tracking-tight">
                        {isTactical ? 'MISSION ACCOMPLISHED' : 'ภารกิจเข้านอนสำเร็จ'}
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
                        <span>{isTactical ? '[ เริ่มรอบวันใหม่ ]' : 'เริ่มรอบวันใหม่'}</span>
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
                        {isTactical ? '// CRYO-STASIS CHAMBER ACTIVE' : 'กำลังนอนหลับพักผ่อน'}
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
                            ล็อกเวลาเป้าหมายแล้ว ตัวเลขนับถอยหลังหยุดทำงาน
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
                        <span>{isTactical ? '[ WAKE UP & DEBRIEF ]' : 'ตื่นนอน'}</span>
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
        stageText = 'หยุดการทำงานชั่วคราว • ไม่ได้เปิดใช้งานการตรวจจับ Discord หรือ C++';
        dotColor = 'bg-rose-500';
        stageTextColor = 'text-rose-400 font-medium';
        digitsColor = 'text-zinc-500';
    } else if (isInVoice && enableCpp && isPcOnline) {
        stageText = `ตรวจพบอยู่ในห้องคุยเสียง Discord ${voiceChannel ? `("${voiceChannel}")` : ''} และ C++ Guard (PC มีการใช้งาน) • ไม่ถือว่านอน`;
        dotColor = 'bg-rose-500 animate-pulse';
        stageTextColor = 'text-rose-400 font-medium';
        digitsColor = 'text-white';
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
                            : 'ถึงเวลาเข้านอนแล้ว กรุณาปิดเครื่องคอมพิวเตอร์ หรือออฟไลน์ Discord ทันที'}
                    </div>
                )}

                {/* Active Status Alert: Displays only when there is an active event/warning */}
                {(!isSystemActive || isInVoice || isVerifying || (enableCpp && isPcOnline)) && (
                    <div className="flex flex-wrap items-center justify-center gap-2">
                        {!isSystemActive && (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-800/60 border border-white/5 text-[11px] text-zinc-400">
                                <AlertCircle className="size-3.5 text-zinc-500" />
                                <span>ปิดการตรวจจับทั้งหมด</span>
                            </div>
                        )}
                        {isSystemActive && isInVoice && (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-300">
                                <Volume2 className="size-3.5 text-rose-400 shrink-0" />
                                <span>อยู่ในห้องคุยเสียง {voiceChannel ? `"${voiceChannel}"` : ''} • ยังไม่ถือว่านอน</span>
                            </div>
                        )}
                        {isSystemActive && (enableCpp && isPcOnline) && (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300">
                                <Shield className="size-3.5 text-amber-400 shrink-0" />
                                <span>C++ Guard ตรวจพบ PC มีการใช้งาน • ยังไม่ถือว่านอน</span>
                            </div>
                        )}
                        {isSystemActive && isVerifying && (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-400">
                                <Moon className="size-3.5 text-emerald-400 shrink-0" />
                                <span>บันทึกสถานะนอนแล้ว • ตรวจจับผ่าน Discord & C++</span>
                            </div>
                        )}
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

                {/* Progressive Disclosure: Compact Status & Test Simulation Actions */}
                <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-light">
                        <span className={`size-1.5 rounded-full ${isSystemActive ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
                        <span>
                            {isTactical
                                ? 'TELEMETRY STANDBY'
                                : isSystemActive
                                  ? 'ตรวจจับอัตโนมัติ: Discord • C++ Guard พร้อม'
                                  : 'ปิดการตรวจจับอัตโนมัติ'}
                        </span>
                    </div>

                    {simulationActive && onResetSimulation ? (
                        <button
                            type="button"
                            onClick={onResetSimulation}
                            className="h-7 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-[11px] font-normal transition-colors flex items-center gap-1.5 active:scale-[0.98] cursor-pointer border border-white/10"
                            title="รีเซ็ตคืนค่าเวลาและพลังชีวิตปกติ"
                        >
                            <RotateCcw className="size-3 text-zinc-400" />
                            <span>คืนค่าปกติ</span>
                        </button>
                    ) : (
                        (onStartSimulation || onTriggerAlertSync || onSetQuickBedtime) && (
                            <div className="relative inline-block text-left">
                                <button
                                    type="button"
                                    onClick={() => setShowTestMenu((prev) => !prev)}
                                    className="h-7 px-2.5 rounded-lg bg-[#18181b] hover:bg-[#27272a] text-zinc-400 hover:text-white text-[11px] font-normal transition-colors flex items-center gap-1.5 border border-white/5 cursor-pointer"
                                    title="เครื่องมือทดสอบระบบและจำลองเวลา"
                                >
                                    <Sliders className="size-3 text-zinc-400" />
                                    <span>ทดสอบระบบ</span>
                                    <ChevronDown className={`size-3 text-zinc-500 transition-transform ${showTestMenu ? 'rotate-180' : ''}`} />
                                </button>

                                {showTestMenu && (
                                    <div className="absolute right-0 bottom-full mb-1.5 w-60 bg-[#121215] border border-white/10 rounded-xl shadow-2xl p-1.5 space-y-0.5 z-30 animate-in fade-in zoom-in-95 duration-150">
                                        <div className="px-2 py-1 text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                                            จำลองเหตุการณ์
                                        </div>
                                        {onStartSimulation && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowTestMenu(false);
                                                    onStartSimulation();
                                                }}
                                                className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-zinc-300 hover:bg-[#18181b] hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
                                            >
                                                <Zap className="size-3.5 text-amber-400 shrink-0" />
                                                <span>นับถอยหลัง 3 2 1 สู่เวลานอน</span>
                                            </button>
                                        )}
                                        {onTriggerAlertSync && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowTestMenu(false);
                                                    onTriggerAlertSync();
                                                }}
                                                className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-amber-300 hover:bg-[#18181b] flex items-center gap-2 transition-colors cursor-pointer"
                                            >
                                                <BellRing className="size-3.5 text-amber-400 shrink-0" />
                                                <span>ทดสอบ Alert 60 วิ (Sync C++)</span>
                                            </button>
                                        )}

                                        {onSetQuickBedtime && (
                                            <>
                                                <div className="px-2 pt-1.5 pb-1 text-[10px] font-medium text-zinc-500 uppercase tracking-wider border-t border-white/5">
                                                    ทดสอบเวลานอนทันที
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setShowTestMenu(false);
                                                        onSetQuickBedtime(1);
                                                    }}
                                                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-rose-300 hover:bg-[#18181b] flex items-center gap-2 transition-colors cursor-pointer"
                                                >
                                                    <span className="size-1.5 rounded-full bg-rose-400" />
                                                    <span>+1 นาที (เส้นตายฉุกเฉิน)</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setShowTestMenu(false);
                                                        onSetQuickBedtime(5);
                                                    }}
                                                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-amber-300 hover:bg-[#18181b] flex items-center gap-2 transition-colors cursor-pointer"
                                                >
                                                    <span className="size-1.5 rounded-full bg-amber-400" />
                                                    <span>+5 นาที (Lockdown)</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setShowTestMenu(false);
                                                        onSetQuickBedtime(10);
                                                    }}
                                                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-amber-300 hover:bg-[#18181b] flex items-center gap-2 transition-colors cursor-pointer"
                                                >
                                                    <span className="size-1.5 rounded-full bg-amber-400" />
                                                    <span>+10 นาที (Alert)</span>
                                                </button>
                                                {onResetBedtimeDefault && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setShowTestMenu(false);
                                                            onResetBedtimeDefault();
                                                        }}
                                                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-white hover:bg-[#18181b] flex items-center gap-2 transition-colors cursor-pointer"
                                                    >
                                                        <RotateCcw className="size-3 text-zinc-500 shrink-0" />
                                                        <span>คืนค่าเวลา 23:15 น.</span>
                                                    </button>
                                                )}
                                            </>
                                        )}

                                        {onResetHp && (
                                            <div className="pt-1 border-t border-white/5">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setShowTestMenu(false);
                                                        onResetHp();
                                                    }}
                                                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-emerald-400 hover:bg-[#18181b] flex items-center gap-2 transition-colors cursor-pointer"
                                                >
                                                    <Shield className="size-3.5 text-emerald-400 shrink-0" />
                                                    <span>ฟื้นฟูพลังชีวิต 100%</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )
                    )}
                </div>
            </div>
        </section>
    );
};
