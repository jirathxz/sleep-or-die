import React from 'react';

interface HpBarProps {
    hp: number;
    stage: string;
}

export const HpBar: React.FC<HpBarProps> = ({ hp, stage }) => {
    const clampedHp = Math.max(0, Math.min(100, hp));

    // Determine status text, color, and indicator dot based on HP and stage
    let barColor = 'bg-emerald-500';
    let statusText = 'ระบบเสถียร';
    let dotColor = 'bg-emerald-500';
    let statusTextColor = 'text-zinc-400';

    if (clampedHp <= 0 || stage === 'shutdown') {
        barColor = 'bg-zinc-700';
        statusText = 'ระบบหยุดทำงาน • พลังชีวิตหมด';
        dotColor = 'bg-zinc-500';
        statusTextColor = 'text-zinc-500';
    } else if (clampedHp <= 30 || stage === 'sleep') {
        barColor = 'bg-rose-500';
        statusText = 'วิกฤต: เลือดลดต่อเนื่อง';
        dotColor = 'bg-rose-500 animate-pulse';
        statusTextColor = 'text-rose-400';
    } else if (clampedHp <= 65 || stage === 'lockdown') {
        barColor = 'bg-amber-500';
        statusText = 'ล็อคดาวน์: เตรียมปิดเครื่อง';
        dotColor = 'bg-amber-500';
        statusTextColor = 'text-amber-400';
    }

    return (
        <section className="bg-[#121215] rounded-2xl p-5 md:p-6 space-y-4 shadow-sm select-none">
            {/* Header: Title and Status Dot (Strictly No Badge) */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <span className="size-2 rounded-full bg-white/40" />
                    <h2 className="text-sm font-medium text-zinc-300">
                        ระดับพลังชีวิต
                    </h2>
                </div>

                <div className="flex items-center gap-2 text-xs font-normal">
                    <span className={`size-2 rounded-full ${dotColor}`} />
                    <span className={statusTextColor}>{statusText}</span>
                </div>
            </div>

            {/* Readout Display */}
            <div className="flex items-baseline justify-between pt-1">
                <span className="text-xs text-zinc-500 font-light">
                    ความจุพลังงานปัจจุบัน
                </span>
                <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl md:text-5xl font-medium tracking-tight text-white tabular-nums">
                        {clampedHp}
                    </span>
                    <span className="text-xs text-zinc-500 font-normal">/ 100</span>
                </div>
            </div>

            {/* Progress Bar Container (Concentric Radius: rounded-lg with inner rounded-md) */}
            <div className="w-full h-3 bg-[#18181b] rounded-lg p-0.5 overflow-hidden">
                <div
                    className={`h-full rounded-md transition-all duration-700 ease-out ${barColor}`}
                    style={{ width: `${clampedHp}%` }}
                />
            </div>

            {/* Scale Markers */}
            <div className="flex justify-between text-[11px] text-zinc-500 font-light pt-0.5">
                <span>0% ชัตดาวน์</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100% เต็มกำลัง</span>
            </div>
        </section>
    );
};
