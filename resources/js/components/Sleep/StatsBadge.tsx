import React, { useState } from 'react';
import { Coins, Ticket, Loader2 } from 'lucide-react';

interface StatsBadgeProps {
    daysSurvived: number;
    shutdownStacks: number;
    ticketsCount: number;
    points: number;
    onUseTicket: () => void;
    onRedeemTicket: () => Promise<boolean> | void;
    stage: string;
}

export const StatsBadge: React.FC<StatsBadgeProps> = ({
    daysSurvived,
    shutdownStacks,
    ticketsCount,
    points,
    onUseTicket,
    onRedeemTicket,
    stage,
}) => {
    const [isRedeeming, setIsRedeeming] = useState(false);

    const handleRedeem = async () => {
        if (points < 100 || isRedeeming) return;
        setIsRedeeming(true);
        try {
            await onRedeemTicket();
        } finally {
            setIsRedeeming(false);
        }
    };

    return (
        <section className="bg-[#121215] rounded-2xl p-5 md:p-6 shadow-sm select-none">
            {/* Unified 4-column Tonal Layout with vertical stacking for buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 divide-y sm:divide-y-0 lg:divide-x divide-white/[0.04]">
                {/* 1. Days Survived */}
                <div className="flex flex-col justify-between space-y-3 min-w-0 lg:pr-4">
                    <div className="space-y-1">
                        <span className="text-xs text-zinc-500 font-light truncate block">
                            วันรอดชีวิตสะสม
                        </span>
                        <div className="flex items-baseline gap-1.5 pt-1">
                            <span className="text-3xl font-medium text-white tabular-nums">
                                {daysSurvived}
                            </span>
                            <span className="text-xs text-zinc-500 font-light">วันต่อเนื่อง</span>
                        </div>
                    </div>
                    <p className="text-[11px] text-zinc-400 font-light pt-1">
                        รับฟรี 1 ตั๋วขยายเวลา ทุก 7 วัน
                    </p>
                </div>

                {/* 2. Shutdown Strikes */}
                <div className="flex flex-col justify-between space-y-3 min-w-0 pt-4 sm:pt-0 lg:px-4">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between gap-1">
                            <span className="text-xs text-zinc-500 font-light whitespace-nowrap">
                                สถิติชัตดาวน์
                            </span>
                            <span
                                className={`text-xs font-medium tabular-nums shrink-0 ${
                                    shutdownStacks >= 4 ? 'text-rose-400' : 'text-zinc-300'
                                }`}
                            >
                                {shutdownStacks} / 5 ครั้ง
                            </span>
                        </div>

                        {/* Minimalist 5-segment indicator */}
                        <div className="flex gap-1.5 pt-0.5">
                            {[1, 2, 3, 4, 5].map((index) => {
                                const filled = index <= shutdownStacks;
                                return (
                                    <div
                                        key={index}
                                        className={`h-2 flex-1 rounded transition-colors duration-300 ${
                                            filled ? 'bg-rose-500' : 'bg-[#18181b]'
                                        }`}
                                    />
                                );
                            })}
                        </div>
                    </div>

                    <p className="text-[11px] text-zinc-500 font-light">
                        {shutdownStacks >= 4
                            ? 'เตือน: อีก 1 ครั้งบัญชีจะถูกระงับ'
                            : 'หากครบ 5 ครั้ง บัญชีจะถูกระงับ'}
                    </p>
                </div>

                {/* 3. Points Economy */}
                <div className="flex flex-col justify-between space-y-3 min-w-0 pt-4 sm:pt-0 lg:px-4">
                    <div className="space-y-1">
                        <span className="text-xs text-zinc-500 font-light flex items-center gap-1 truncate">
                            <Coins className="size-3 text-amber-400 shrink-0" />
                            แต้มสะสม
                        </span>
                        <div className="flex items-baseline gap-1.5 pt-1">
                            <span className="text-3xl font-medium text-amber-300 tabular-nums">
                                {points ?? 0}
                            </span>
                            <span className="text-xs text-zinc-500 font-light">แต้ม</span>
                        </div>
                        <p className="text-[11px] text-zinc-500 font-light">
                            +50 แต้ม / นอนสำเร็จ
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleRedeem}
                        disabled={(points ?? 0) < 100 || isRedeeming}
                        className={`w-full h-8 px-2.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5 shrink-0 ${
                            (points ?? 0) >= 100 && !isRedeeming
                                ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 active:scale-[0.98]'
                                : 'bg-[#18181b] text-zinc-600 cursor-not-allowed opacity-60'
                        }`}
                        title="แลก 100 แต้มเป็น 1 ตั๋วขยายเวลา"
                    >
                        {isRedeeming ? (
                            <Loader2 className="size-3 animate-spin" />
                        ) : (
                            <Ticket className="size-3 shrink-0" />
                        )}
                        <span className="whitespace-nowrap">แลกตั๋ว (100 แต้ม)</span>
                    </button>
                </div>

                {/* 4. Extension Tickets */}
                <div className="flex flex-col justify-between space-y-3 min-w-0 pt-4 sm:pt-0 lg:pl-4">
                    <div className="space-y-1">
                        <span className="text-xs text-zinc-500 font-light truncate block">
                            ตั๋วขยายเวลา
                        </span>
                        <div className="flex items-baseline gap-1.5 pt-1">
                            <span className="text-3xl font-medium text-white tabular-nums">
                                {ticketsCount}
                            </span>
                            <span className="text-xs text-zinc-500 font-light">ใบพร้อมใช้</span>
                        </div>
                        <p className="text-[11px] text-zinc-500 font-light">
                            +30 นาที / ใบ
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onUseTicket}
                        disabled={ticketsCount <= 0}
                        className={`w-full h-8 px-2.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5 shrink-0 ${
                            ticketsCount > 0
                                ? 'bg-[#18181b] text-white hover:bg-[#27272a] active:scale-[0.98]'
                                : 'bg-[#18181b] text-zinc-600 cursor-not-allowed opacity-60'
                        }`}
                    >
                        <span className="whitespace-nowrap">กดใช้ตั๋ว (+30 นาที)</span>
                    </button>
                </div>
            </div>
        </section>
    );
};

