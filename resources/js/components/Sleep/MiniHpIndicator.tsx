import React from 'react';
import { useSleepStore } from '@/stores/useSleepStore';
import { Heart, Activity } from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export function MiniHpIndicator() {
    const { current_hp, stage, shutdown_stacks } = useSleepStore();
    const { state } = useSidebar();
    const isCollapsed = state === 'collapsed';

    const clampedHp = Math.max(0, Math.min(100, current_hp));

    let barColor = 'bg-emerald-500';
    let dotColor = 'bg-emerald-500';

    if (clampedHp <= 0 || stage === 'shutdown') {
        barColor = 'bg-zinc-600';
        dotColor = 'bg-zinc-600';
    } else if (clampedHp <= 30 || stage === 'sleep') {
        barColor = 'bg-rose-500';
        dotColor = 'bg-rose-500 animate-pulse';
    } else if (clampedHp <= 65 || stage === 'lockdown') {
        barColor = 'bg-amber-500';
        dotColor = 'bg-amber-500';
    }

    if (isCollapsed) {
        return (
            <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                    <div className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-[#18181b] cursor-pointer transition-colors mx-auto">
                        <div className="relative">
                            <Heart className={`size-4 ${clampedHp <= 30 ? 'text-rose-500' : 'text-zinc-400'}`} />
                            <span className={`absolute -top-0.5 -right-0.5 size-1.5 rounded-full ${dotColor}`} />
                        </div>
                    </div>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-[#121215] text-white border-0 text-xs rounded-lg p-2 space-y-1">
                    <p className="font-medium">พลังชีวิต: {clampedHp} / 100 HP</p>
                    <p className="text-[10px] text-zinc-400">สไตรค์: {shutdown_stacks} / 5 ครั้ง</p>
                </TooltipContent>
            </Tooltip>
        );
    }

    return (
        <div className="bg-[#18181b] rounded-xl p-3 mx-2 space-y-2 select-none transition-all">
            {/* Header row */}
            <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                    <Activity className="size-3.5 text-zinc-400" />
                    <span className="text-zinc-400 font-light">ระดับพลังชีวิต</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium tabular-nums">
                    <span className={`size-1.5 rounded-full ${dotColor}`} />
                    <span className="text-white text-xs">{clampedHp} HP</span>
                </div>
            </div>

            {/* Mini Progress Bar */}
            <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden p-0">
                <div
                    className={`h-full rounded-full transition-all duration-500 ease-out ${barColor}`}
                    style={{ width: `${clampedHp}%` }}
                />
            </div>

            {/* Strikes Indicator */}
            <div className="flex items-center justify-between text-[10px] text-zinc-500 font-light pt-0.5">
                <span>สไตรค์ชัตดาวน์</span>
                <div className="flex gap-1 items-center">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <span
                            key={i}
                            className={`size-1.5 rounded-full transition-colors ${
                                i <= shutdown_stacks ? 'bg-rose-500' : 'bg-zinc-700'
                            }`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
