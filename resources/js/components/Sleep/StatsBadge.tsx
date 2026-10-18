import React from 'react';
import { useTranslation } from '@/lib/i18n';

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
    const { t, isTactical } = useTranslation();

    return (
        <section className="bg-[#121215] rounded-2xl p-5 md:p-6 shadow-sm select-none">
            {/* Unified 3-column Tonal Layout (Anti-AI Cliché: No repetitive cards, No badges) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-white/[0.04]">
                {/* 1. Days Survived */}
                <div className="space-y-1 md:pr-4">
                    <span className="text-xs text-zinc-500 font-light">
                        {t('stats_survived')}
                    </span>
                    <div className="flex items-baseline gap-1.5 pt-1">
                        <span className="text-3xl font-medium text-white tabular-nums">
                            {daysSurvived}
                        </span>
                        <span className="text-xs text-zinc-500 font-light">{t('stats_survived_unit')}</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 font-light pt-0.5">
                        {t('stats_streak_reward')}
                    </p>
                </div>

                {/* 2. Shutdown Strikes */}
                <div className="space-y-2 pt-4 md:pt-0 md:px-4">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-zinc-500 font-light">
                            {t('stats_strikes')}
                        </span>
                        <span
                            className={`text-xs font-medium tabular-nums ${
                                shutdownStacks >= 4 ? 'text-rose-400' : 'text-zinc-300'
                            }`}
                        >
                            {shutdownStacks} / 5 {t('stats_strikes_unit')}
                        </span>
                    </div>

                    {/* Minimalist 5-segment indicator */}
                    <div className="flex gap-1.5 pt-1">
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

                    <p className="text-[11px] text-zinc-500 font-light">
                        {shutdownStacks >= 4
                            ? t('stats_strikes_critical')
                            : t('stats_strikes_warn')}
                    </p>
                </div>

                {/* 3. Extension Tickets */}
                <div className="flex items-center justify-between pt-4 md:pt-0 md:pl-4">
                    <div className="space-y-0.5">
                        <span className="text-xs text-zinc-500 font-light">
                            {t('stats_tickets')}
                        </span>
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-3xl font-medium text-white tabular-nums">
                                {ticketsCount}
                            </span>
                            <span className="text-xs text-zinc-500 font-light">{t('stats_tickets_unit')}</span>
                        </div>
                        <p className="text-[11px] text-zinc-500 font-light">
                            {t('stats_tickets_desc')}
                        </p>
                    </div>

                    <button
                        onClick={onUseTicket}
                        disabled={ticketsCount <= 0 || stage === 'shutdown'}
                        className={`h-9 px-4 rounded-lg text-xs font-medium transition-colors ${
                            ticketsCount > 0 && stage !== 'shutdown'
                                ? 'bg-[#18181b] text-white hover:bg-[#27272a] active:scale-[0.98]'
                                : 'bg-[#18181b] text-zinc-600 cursor-not-allowed opacity-60'
                        }`}
                    >
                        {t('stats_btn_ticket')}
                    </button>
                </div>
            </div>
        </section>
    );
};
