import React from 'react';

interface HpBarProps {
    hp: number;
    stage: string;
}

export const HpBar: React.FC<HpBarProps> = ({ hp, stage }) => {
    const clampedHp = Math.max(0, Math.min(100, hp));

    let barColor = 'from-emerald-500 to-green-600';
    let glowColor = 'shadow-emerald-500/30';
    let statusText = 'NORMAL VITALITY';
    let textColor = 'text-emerald-400';

    if (clampedHp <= 0 || stage === 'shutdown') {
        barColor = 'from-neutral-700 to-neutral-900';
        glowColor = 'shadow-black';
        statusText = 'SYSTEM TERMINATED (0 HP)';
        textColor = 'text-neutral-500';
    } else if (clampedHp <= 30 || stage === 'sleep') {
        barColor = 'from-red-600 via-rose-500 to-red-700';
        glowColor = 'shadow-red-600/60 animate-pulse';
        statusText = 'CRITICAL FAILURE IMMINENT';
        textColor = 'text-red-500 animate-pulse';
    } else if (clampedHp <= 65 || stage === 'lockdown') {
        barColor = 'from-amber-500 to-orange-600';
        glowColor = 'shadow-amber-500/40';
        statusText = 'LOCKDOWN - HP AT RISK';
        textColor = 'text-amber-400';
    }

    return (
        <div className="w-full bg-neutral-950/80 p-5 rounded-2xl border border-neutral-800 shadow-2xl backdrop-blur-md">
            <div className="flex items-center justify-between mb-3 text-xs font-mono uppercase tracking-widest">
                <span className={`font-bold flex items-center gap-2 ${textColor}`}>
                    <span className="w-2.5 h-2.5 rounded-full bg-current animate-ping" />
                    {statusText}
                </span>
                <span className="text-neutral-300 font-bold text-sm">
                    {clampedHp} <span className="text-neutral-500 text-xs">/ 100 HP</span>
                </span>
            </div>

            {/* Main Bar Track */}
            <div className="relative w-full h-7 bg-neutral-900 rounded-xl overflow-hidden border border-neutral-800/80 p-1">
                <div
                    className={`h-full rounded-lg bg-gradient-to-r transition-all duration-700 ease-out shadow-lg ${barColor} ${glowColor}`}
                    style={{ width: `${clampedHp}%` }}
                >
                    {/* Gloss scanline effect */}
                    <div className="w-full h-full bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.25)_50%,transparent_100%)] opacity-30 animate-[pulse_2s_infinite]" />
                </div>
            </div>

            {/* Segment markers */}
            <div className="flex justify-between px-1 mt-1.5 text-[10px] text-neutral-600 font-mono">
                <span>0% (DIE)</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100% (STABLE)</span>
            </div>
        </div>
    );
};
