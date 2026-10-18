import React from 'react';
import { SleepStage } from '@/stores/useSleepStore';
import { Moon, Loader2, Zap, RotateCcw } from 'lucide-react';

interface CountdownDisplayProps {
    hours: number;
    minutes: number;
    seconds: number;
    isPastDeadline: boolean;
    stage: SleepStage;
    sleepTargetTime: string | null;
    wakeUpTime: string | null;
    onConfirmSleep: () => void;
    lastConfirmedAt: string | null;
    simulationActive?: boolean;
    onStartSimulation?: () => void;
    onResetSimulation?: () => void;
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
    lastConfirmedAt,
    simulationActive = false,
    onStartSimulation,
    onResetSimulation,
}) => {
    const pad = (n: number) => n.toString().padStart(2, '0');

    let stageText = 'นับถอยหลังสู่เส้นตายเข้านอนคืนนี้';
    let dotColor = 'bg-white/40';
    let stageTextColor = 'text-zinc-400';
    let digitsColor = 'text-white';

    const isVerifying = Boolean(lastConfirmedAt);

    if (isVerifying) {
        stageText = 'อยู่ในสถานะเข้านอนแล้ว • หากไม่ออนไลน์ระหว่างเวลานอน ถือว่านอนสำเร็จ';
        dotColor = 'bg-emerald-400 animate-pulse';
        stageTextColor = 'text-emerald-400';
        digitsColor = 'text-emerald-400';
    } else if (simulationActive && !isPastDeadline) {
        stageText = `โหมดจำลอง: นับถอยหลังสู่เวลานอน • เหลือ ${seconds} วินาที`;
        dotColor = 'bg-amber-400 animate-ping';
        stageTextColor = 'text-amber-400';
        digitsColor = 'text-amber-400';
    } else if (stage === 'alert') {
        stageText = 'ระยะเตือน: เหลือเวลาอีก 10 นาทีก่อนนอน';
        dotColor = 'bg-amber-400';
        stageTextColor = 'text-amber-400';
    } else if (stage === 'lockdown') {
        stageText = 'ระยะเตือนล็อคดาวน์: เหลือเวลาอีก 5 นาที (เตรียมตัวนอน)';
        dotColor = 'bg-amber-500';
        stageTextColor = 'text-amber-400';
    } else if (stage === 'sleep') {
        stageText = `ฉุกเฉิน! มีเวลาอีก ${seconds} วินาทีก่อนระบบชัตดาวน์`;
        dotColor = 'bg-rose-500 animate-pulse';
        stageTextColor = 'text-rose-400 font-medium';
        digitsColor = 'text-rose-400';
    } else if (stage === 'shutdown') {
        stageText = 'เข้าสู่สภาวะชัตดาวน์ ปิดระบบ';
        dotColor = 'bg-zinc-600';
        stageTextColor = 'text-zinc-500';
        digitsColor = 'text-zinc-600';
    }

    return (
        <section className="bg-[#121215] rounded-2xl p-6 md:p-8 text-center space-y-6 shadow-sm select-none">
            {/* Status Indicator (Strictly No Badge) */}
            <div className="flex items-center justify-center gap-2 text-xs font-normal">
                <span className={`size-2 rounded-full ${dotColor}`} />
                <span className={stageTextColor}>{stageText}</span>
            </div>

            {/* Countdown Digits (20% Crisp White & High Contrast) */}
            <div className="flex items-center justify-center gap-3 md:gap-6 my-2">
                <div className="flex flex-col items-center min-w-[70px] md:min-w-[90px]">
                    <span className={`text-5xl md:text-7xl font-medium tracking-tight tabular-nums ${digitsColor}`}>
                        {pad(hours)}
                    </span>
                    <span className="text-[11px] text-zinc-500 font-light mt-1">
                        ชั่วโมง
                    </span>
                </div>

                <span className={`text-4xl md:text-6xl font-light pb-4 ${digitsColor} opacity-40`}>:</span>

                <div className="flex flex-col items-center min-w-[70px] md:min-w-[90px]">
                    <span className={`text-5xl md:text-7xl font-medium tracking-tight tabular-nums ${digitsColor}`}>
                        {pad(minutes)}
                    </span>
                    <span className="text-[11px] text-zinc-500 font-light mt-1">
                        นาที
                    </span>
                </div>

                <span className={`text-4xl md:text-6xl font-light pb-4 ${digitsColor} opacity-40`}>:</span>

                <div className="flex flex-col items-center min-w-[70px] md:min-w-[90px]">
                    <span className={`text-5xl md:text-7xl font-medium tracking-tight tabular-nums ${digitsColor}`}>
                        {pad(seconds)}
                    </span>
                    <span className="text-[11px] text-zinc-500 font-light mt-1">
                        วินาที
                    </span>
                </div>
            </div>

            {/* Target Schedule Details: Emphasize Bedtime Deadline */}
            <div className="flex items-center justify-center gap-3 text-xs text-zinc-400 font-light">
                <span>
                    เส้นตายเข้านอนคืนนี้: <span className="text-white font-medium">{sleepTargetTime || '23:15'} น.</span>
                </span>
                <span className="text-zinc-700">•</span>
                <span className="text-zinc-500 font-light">
                    เวลาตื่นอ้างอิง: {wakeUpTime || '07:00'} น. • 5 รอบการนอน
                </span>
            </div>

            {/* Action Trigger & Test Simulation Controls */}
            <div className="max-w-xs mx-auto space-y-2 pt-2">
                {stage === 'sleep' && !isVerifying && (
                    <div className="text-xs text-rose-400 font-normal animate-pulse pb-0.5">
                        ⚠️ มีเวลาอีก {seconds} วินาทีก่อนพลังชีวิตหมด! รีบกดเข้านอนทันที
                    </div>
                )}
                {isVerifying ? (
                    <div className="p-3.5 rounded-lg bg-[#18181b] text-emerald-300 text-xs font-normal flex items-center justify-center gap-2.5">
                        <Moon className="size-4 text-emerald-400" />
                        <span>อยู่ในสถานะนอน • ตรวจจับออฟไลน์ผ่าน Discord และ C++ Guard</span>
                    </div>
                ) : (
                    <button
                        onClick={onConfirmSleep}
                        disabled={stage === 'shutdown'}
                        className={`w-full h-11 px-6 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 shadow-sm ${
                            stage === 'sleep'
                                ? 'bg-rose-500 text-white hover:bg-rose-600 animate-pulse'
                                : stage === 'shutdown'
                                  ? 'bg-[#18181b] text-zinc-600 cursor-not-allowed'
                                  : 'bg-white text-zinc-950 hover:bg-zinc-200 active:scale-[0.99]'
                        }`}
                    >
                        <Moon className="size-4" />
                        <span>ยืนยันการเข้านอน</span>
                    </button>
                )}

                {/* Simulation 3 2 1 Test Button */}
                <div className="flex items-center justify-center pt-1">
                    {!simulationActive ? (
                        <button
                            type="button"
                            onClick={onStartSimulation}
                            className="h-8 px-3.5 rounded-lg bg-[#18181b] hover:bg-[#27272a] text-zinc-400 hover:text-white text-xs font-normal transition-colors flex items-center gap-1.5 active:scale-[0.98]"
                            title="ทดสอบนับถอยหลัง 3 2 1 สู่เวลานอนและดูเอฟเฟกต์การลดเลือด"
                        >
                            <Zap className="size-3.5 text-amber-400" />
                            <span>ทดสอบตอนถึงเวลานอน 3 2 1</span>
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={onResetSimulation}
                            className="h-8 px-3.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-normal transition-colors flex items-center gap-1.5 active:scale-[0.98]"
                            title="รีเซ็ตคืนค่าเวลาและพลังชีวิตปกติ"
                        >
                            <RotateCcw className="size-3.5 text-zinc-400" />
                            <span>คืนค่าปกติ</span>
                        </button>
                    )}
                </div>
            </div>
        </section>
    );
};
