import React from 'react';
import { SleepStage } from '@/stores/useSleepStore';

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
}) => {
    const pad = (n: number) => n.toString().padStart(2, '0');

    let borderColor = 'border-neutral-800';
    let digitsColor = 'text-white';
    let banner = 'COUNTDOWN TO BEDTIME';

    if (stage === 'lockdown') {
        borderColor = 'border-amber-500/50 shadow-amber-500/10';
        digitsColor = 'text-amber-400';
        banner = '⚠️ LOCKDOWN ACTIVE - PREPARE FOR SLEEP';
    } else if (stage === 'sleep') {
        borderColor = 'border-red-600/70 shadow-red-600/20 animate-pulse';
        digitsColor = 'text-red-500';
        banner = '🚨 DEADLINE EXCEEDED - SLEEP IMMEDIATELY';
    } else if (stage === 'shutdown') {
        borderColor = 'border-neutral-800';
        digitsColor = 'text-neutral-600';
        banner = '💀 SYSTEM SHUTDOWN';
    }

    const isVerifying = Boolean(lastConfirmedAt);

    return (
        <div className={`w-full bg-neutral-950/90 rounded-3xl p-8 border ${borderColor} shadow-2xl backdrop-blur-xl text-center relative overflow-hidden transition-all duration-500`}>
            {/* Header Stage Notice */}
            <div className="inline-block px-4 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-xs font-mono tracking-widest text-neutral-300 uppercase mb-6">
                {banner}
            </div>

            {/* Giant Clock Digits */}
            <div className="flex items-center justify-center gap-2 md:gap-4 my-2">
                <div className="flex flex-col items-center">
                    <span className={`text-6xl md:text-8xl font-black font-mono tracking-tight ${digitsColor}`}>
                        {pad(hours)}
                    </span>
                    <span className="text-[11px] font-mono uppercase text-neutral-500 tracking-wider mt-1">Hours</span>
                </div>

                <span className={`text-5xl md:text-7xl font-bold font-mono pb-6 ${digitsColor}`}>:</span>

                <div className="flex flex-col items-center">
                    <span className={`text-6xl md:text-8xl font-black font-mono tracking-tight ${digitsColor}`}>
                        {pad(minutes)}
                    </span>
                    <span className="text-[11px] font-mono uppercase text-neutral-500 tracking-wider mt-1">Minutes</span>
                </div>

                <span className={`text-5xl md:text-7xl font-bold font-mono pb-6 ${digitsColor}`}>:</span>

                <div className="flex flex-col items-center">
                    <span className={`text-6xl md:text-8xl font-black font-mono tracking-tight ${digitsColor}`}>
                        {pad(seconds)}
                    </span>
                    <span className="text-[11px] font-mono uppercase text-neutral-500 tracking-wider mt-1">Seconds</span>
                </div>
            </div>

            {/* Schedule Info */}
            <div className="flex justify-center items-center gap-6 text-xs text-neutral-400 font-mono mt-6 pt-6 border-t border-neutral-900">
                <div>
                    Target Sleep:{' '}
                    <span className="text-white font-bold">{sleepTargetTime || '--:--'}</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-neutral-700" />
                <div>
                    Target Wake:{' '}
                    <span className="text-white font-bold">{wakeUpTime || '--:--'}</span>
                </div>
            </div>

            {/* Primary Action Button */}
            <div className="mt-8">
                {isVerifying ? (
                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm font-mono flex items-center justify-center gap-3">
                        <span className="w-3 h-3 rounded-full bg-amber-400 animate-ping" />
                        VERIFYING SLEEP WITH DISCORD... (DO NOT GO ONLINE)
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={onConfirmSleep}
                        disabled={stage === 'shutdown'}
                        className={`w-full py-4 px-6 rounded-2xl font-bold tracking-wider text-base uppercase transition-all duration-300 shadow-xl ${
                            stage === 'sleep'
                                ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/40 animate-bounce'
                                : stage === 'lockdown'
                                  ? 'bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black shadow-amber-500/30'
                                  : 'bg-white hover:bg-neutral-200 text-neutral-950 shadow-white/10'
                        } disabled:opacity-30 disabled:cursor-not-allowed`}
                    >
                        🌙 I am going to sleep now (เข้าสู่นิทรา)
                    </button>
                )}
            </div>
        </div>
    );
};
