import React from 'react';
import { Head } from '@inertiajs/react';
import { useSleepStore } from '@/stores/useSleepStore';
import { useTranslation } from '@/lib/i18n';

export default function Analytics() {
    const { days_survived } = useSleepStore();
    const { t } = useTranslation();

    const weeklyData = [
        { day: t('day_mon'), hours: 7.8, percentage: 95 },
        { day: t('day_tue'), hours: 7.5, percentage: 92 },
        { day: t('day_wed'), hours: 8.0, percentage: 100 },
        { day: t('day_thu'), hours: 7.7, percentage: 94 },
        { day: t('day_fri'), hours: 7.2, percentage: 88 },
        { day: t('day_sat'), hours: 8.2, percentage: 100 },
        { day: t('day_sun'), hours: 7.6, percentage: 93 },
    ];

    return (
        <>
            <Head title={`${t('analytics_title')} - SleepOrDie`} />

            <div className="max-w-3xl w-full mx-auto p-4 md:p-6 space-y-6 select-none">
                {/* Header */}
                <div>
                    <h1 className="text-xl font-medium tracking-tight text-white">
                        {t('analytics_title')}
                    </h1>
                    <p className="text-xs text-zinc-500 font-light mt-0.5">
                        {t('analytics_desc')}
                    </p>
                </div>

                {/* Metric Summary Pods (No duplicate cards) */}
                <div className="bg-[#121215] rounded-2xl p-5 grid grid-cols-2 sm:grid-cols-4 gap-4 shadow-sm">
                    <div className="space-y-0.5">
                        <span className="text-xs text-zinc-500 font-light">{t('analytics_consistency')}</span>
                        <p className="text-2xl font-medium text-emerald-400 tabular-nums">94%</p>
                    </div>
                    <div className="space-y-0.5">
                        <span className="text-xs text-zinc-500 font-light">{t('analytics_avg_sleep')}</span>
                        <p className="text-2xl font-medium text-white tabular-nums">
                            7.7 {t('analytics_avg_sleep_unit')}
                        </p>
                    </div>
                    <div className="space-y-0.5">
                        <span className="text-xs text-zinc-500 font-light">{t('analytics_on_time_rate')}</span>
                        <p className="text-2xl font-medium text-white tabular-nums">
                            {days_survived} {t('unit_days')}
                        </p>
                    </div>
                    <div className="space-y-0.5">
                        <span className="text-xs text-zinc-500 font-light">{t('analytics_recovery_title')}</span>
                        <p className="text-2xl font-medium text-white">{t('analytics_recovery_val')}</p>
                    </div>
                </div>

                {/* Minimalist Bar Visualization (Tonal & Elegant) */}
                <div className="bg-[#121215] rounded-2xl p-5 space-y-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-white">{t('analytics_chart_title')}</span>
                        <span className="text-xs text-zinc-500 font-light">{t('analytics_chart_target')}</span>
                    </div>

                    <div className="grid grid-cols-7 gap-2 md:gap-4 items-end h-40 pt-4 px-2">
                        {weeklyData.map((item) => (
                            <div key={item.day} className="flex flex-col items-center gap-2 h-full justify-end">
                                <span className="text-[10px] text-zinc-400 tabular-nums">{item.hours}h</span>
                                <div className="w-full max-w-[28px] bg-[#18181b] rounded-t-lg h-full flex items-end overflow-hidden p-0.5">
                                    <div
                                        className="w-full bg-white rounded-t-md transition-all duration-700"
                                        style={{ height: `${item.percentage}%` }}
                                    />
                                </div>
                                <span className="text-[10px] text-zinc-500 font-light">{item.day}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
