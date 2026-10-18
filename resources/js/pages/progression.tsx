import React from 'react';
import { Head } from '@inertiajs/react';
import { ShieldAlert } from 'lucide-react';
import { useSleepStore } from '@/stores/useSleepStore';
import { useTranslation } from '@/lib/i18n';

export default function Progression() {
    const { current_hp, shutdown_stacks, level, exp } = useSleepStore();
    const { t } = useTranslation();

    const currentLevel = Math.max(1, level || 1);
    const currentExp = Math.max(0, exp || 0);
    const nextLevelExp = currentLevel * 500;
    const expPercentage = Math.min(100, Math.round((currentExp / nextLevelExp) * 100));

    const disciplineTitle = t(
        currentLevel >= 5
            ? 'discipline_5'
            : currentLevel >= 4
            ? 'discipline_4'
            : currentLevel >= 3
            ? 'discipline_3'
            : currentLevel >= 2
            ? 'discipline_2'
            : 'discipline_1'
    );

    return (
        <>
            <Head title={`${t('progression_title')} - SleepOrDie`} />

            <div className="max-w-3xl w-full mx-auto p-4 md:p-6 space-y-6 select-none">
                {/* Header */}
                <div>
                    <h1 className="text-xl font-medium tracking-tight text-white">
                        {t('progression_title')}
                    </h1>
                    <p className="text-xs text-zinc-500 font-light mt-0.5">
                        {t('progression_desc')}
                    </p>
                </div>

                {/* Level & Discipline Tier (Tonal Surface, No Border) */}
                <div className="bg-[#121215] rounded-2xl p-5 space-y-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <span className="text-xs text-zinc-500 font-light">{t('progression_tier_label')}</span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-medium text-white">{t('level_label')} {currentLevel}</span>
                                <span className="text-xs text-emerald-400 font-normal">{disciplineTitle}</span>
                            </div>
                        </div>

                        <div className="text-right space-y-0.5">
                            <span className="text-xs text-zinc-500 font-light">{t('progression_exp_label')}</span>
                            <p className="text-xs font-normal text-zinc-300 tabular-nums">
                                {currentExp} / {nextLevelExp} XP
                            </p>
                        </div>
                    </div>

                    {/* EXP Progress Bar */}
                    <div className="w-full h-2 bg-[#18181b] rounded-full overflow-hidden">
                        <div
                            className="h-full bg-white rounded-full transition-all duration-500"
                            style={{ width: `${expPercentage}%` }}
                        />
                    </div>
                </div>

                {/* Vitality Matrix & Disciplinary Penalties */}
                <div className="bg-[#121215] rounded-2xl p-5 space-y-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-white flex items-center gap-2">
                            <ShieldAlert className="size-4 text-rose-400" />
                            {t('progression_shutdown_rules')}
                        </span>
                        <span className="text-xs text-zinc-500 font-light">{t('progression_strike_rule_badge')}</span>
                    </div>

                    <div className="space-y-3 pt-1">
                        <div className="bg-[#18181b] rounded-xl p-4 flex items-center justify-between">
                            <div className="space-y-0.5">
                                <span className="text-xs text-zinc-300 font-normal">{t('progression_hp_current')}</span>
                                <p className="text-[11px] text-zinc-500 font-light">
                                    {t('progression_hp_desc')}
                                </p>
                            </div>
                            <span className="text-xl font-medium text-white tabular-nums">{current_hp}</span>
                        </div>

                        <div className="bg-[#18181b] rounded-xl p-4 flex items-center justify-between">
                            <div className="space-y-0.5">
                                <span className="text-xs text-zinc-300 font-normal">{t('progression_strikes_title')}</span>
                                <p className="text-[11px] text-zinc-500 font-light">
                                    {t('progression_strikes_desc')}
                                </p>
                            </div>
                            <span
                                className={`text-xl font-medium tabular-nums ${
                                    shutdown_stacks >= 4 ? 'text-rose-400' : 'text-zinc-200'
                                }`}
                            >
                                {shutdown_stacks} / 5
                            </span>
                        </div>

                        <div className="bg-[#18181b] rounded-xl p-4 flex items-center justify-between">
                            <div className="space-y-0.5">
                                <span className="text-xs text-zinc-300 font-normal">{t('progression_lockout_title')}</span>
                                <p className="text-[11px] text-zinc-500 font-light">
                                    {t('progression_lockout_desc')}
                                </p>
                            </div>
                            <span className="text-xs font-normal text-emerald-400">{t('progression_status_active')}</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
