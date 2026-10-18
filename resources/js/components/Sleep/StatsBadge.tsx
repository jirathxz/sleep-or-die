import React from 'react';

interface StatsBadgeProps {
    daysSurvived: number;
    shutdownStacks: number;
    ticketsCount: number;
    onUseTicket: () => void;
    stage: string;
}

export const StatsBadge: React.FC<StatsBadgeProps> = ({
    daysSurvived,
    shutdownStacks,
    ticketsCount,
    onUseTicket,
    stage,
}) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
            {/* Days Survived Badge */}
            <div className="bg-neutral-950/80 p-5 rounded-2xl border border-neutral-800/80 backdrop-blur-md flex items-center justify-between">
                <div>
                    <div className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">
                        Days Survived
                    </div>
                    <div className="text-3xl font-black font-mono text-white mt-1">
                        {daysSurvived}{' '}
                        <span className="text-xs font-normal text-neutral-400">Days</span>
                    </div>
                    <div className="text-[10px] text-emerald-400 mt-1">
                        +1 Ticket every 7-day streak
                    </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-2xl">
                    🔥
                </div>
            </div>

            {/* Shutdown Stacks Gauge */}
            <div className="bg-neutral-950/80 p-5 rounded-2xl border border-neutral-800/80 backdrop-blur-md flex flex-col justify-between">
                <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">
                        Shutdown Strikes
                    </span>
                    <span className="text-xs font-mono font-bold text-red-400">
                        {shutdownStacks} / 5
                    </span>
                </div>

                {/* Stacks visual pips */}
                <div className="flex gap-2 my-2">
                    {[1, 2, 3, 4, 5].map((index) => {
                        const filled = index <= shutdownStacks;
                        return (
                            <div
                                key={index}
                                className={`h-3 flex-1 rounded-md transition-all duration-300 ${
                                    filled
                                        ? 'bg-red-600 shadow-md shadow-red-600/50'
                                        : 'bg-neutral-800 border border-neutral-700/50'
                                }`}
                            />
                        );
                    })}
                </div>

                <div className="text-[10px] text-neutral-500 font-mono">
                    {shutdownStacks >= 4
                        ? '⚠️ 1 STRIKE AWAY FROM ACCOUNT TERMINATION'
                        : '5 strikes = Account Disabled (Permadeath)'}
                </div>
            </div>

            {/* Ticket Extension Widget */}
            <div className="bg-neutral-950/80 p-5 rounded-2xl border border-neutral-800/80 backdrop-blur-md flex items-center justify-between">
                <div>
                    <div className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">
                        Extension Tickets
                    </div>
                    <div className="text-3xl font-black font-mono text-amber-400 mt-1">
                        {ticketsCount}{' '}
                        <span className="text-xs font-normal text-neutral-400">Available</span>
                    </div>
                    <div className="text-[10px] text-neutral-400 mt-1">
                        Extends bedtime deadline +30m
                    </div>
                </div>

                <button
                    type="button"
                    onClick={onUseTicket}
                    disabled={ticketsCount <= 0 || stage === 'shutdown'}
                    className="px-4 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 font-mono text-xs font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105"
                >
                    🎟️ Use Ticket
                </button>
            </div>
        </div>
    );
};
