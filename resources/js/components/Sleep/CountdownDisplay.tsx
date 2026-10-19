import React from 'react';
import { SleepStage } from '@/stores/useSleepStore';
import { Moon, Zap, RotateCcw, Volume2, Shield, Bot, AlertCircle } from 'lucide-react';

interface CountdownDisplayProps {
    hours: number;
    minutes: number;
    seconds: number;
    isPastDeadline: boolean;
    stage: SleepStage;
    sleepTargetTime: string | null;
    wakeUpTime: string | null;
    lastConfirmedAt: string | null;
    isInVoice?: boolean;
    voiceChannel?: string | null;
    isSystemActive?: boolean;
    enableDiscord?: boolean;
    enableCpp?: boolean;
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
    lastConfirmedAt,
    isInVoice = false,
    voiceChannel = null,
    isSystemActive = true,
    enableDiscord = true,
    enableCpp = true,
    simulationActive = false,
    onStartSimulation,
    onResetSimulation,
}) => {
    const pad = (n: number) => n.toString().padStart(2, '0');

    let stageText = 'นับถอยหลังสู่เส้นตายเข้านอนคืนนี้';
    let dotColor = 'bg-white/40';
    let stageTextColor = 'text-zinc-400';
    let digitsColor = 'text-white';

    const isVerifying = Boolean(lastConfirmedAt) && !isInVoice && isSystemActive;

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
    } else if (isVerifying) {
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
            {/* Status Indicator */}
            <div className="flex items-center justify-center gap-2 text-xs font-normal">
                <span className={`size-2 rounded-full ${dotColor}`} />
                <span className={stageTextColor}>{stageText}</span>
            </div>

            {/* Countdown Digits */}
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

            {/* Target Schedule Details */}
            <div className="flex items-center justify-center gap-3 text-xs text-zinc-400 font-light">
                <span>
                    เส้นตายเข้านอนคืนนี้: <span className="text-white font-medium">{sleepTargetTime || '23:15'} น.</span>
                </span>
                <span className="text-zinc-700">•</span>
                <span className="text-zinc-500 font-light">
                    เวลาตื่นอ้างอิง: {wakeUpTime || '07:00'} น. • 5 รอบการนอน
                </span>
            </div>

            {/* Automated Detection Status & Test Simulation Controls */}
            <div className="max-w-md mx-auto space-y-3 pt-1">
                {stage === 'sleep' && !isVerifying && isSystemActive && (
                    <div className="text-xs text-rose-400 font-normal animate-pulse pb-0.5">
                        ⚠️ ถึงเวลาเข้านอนแล้ว! กรุณาปิดเครื่องคอมพิวเตอร์ หรือออฟไลน์ Discord ทันที
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
                                <Shield className="size-3 text-emerald-400" />
                                <span className={enableCpp ? 'text-emerald-300 font-medium' : 'text-zinc-600 line-through'}>
                                    C++ Guard {enableCpp ? 'เปิด' : 'ปิด'}
                                </span>
                            </span>
                        </div>
                    </div>
                )}

                {/* Simulation 3 2 1 Test Button */}
                <div className="flex items-center justify-center pt-0.5">
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
