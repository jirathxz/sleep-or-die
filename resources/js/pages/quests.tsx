import React from 'react';
import { Head } from '@inertiajs/react';
import { CheckCircle2, Circle, Ticket } from 'lucide-react';
import { useSleepStore } from '@/stores/useSleepStore';
import { useTranslation } from '@/lib/i18n';

export default function Quests() {
    const { tickets_count, days_survived, stage } = useSleepStore();
    const { t } = useTranslation();

    const dailyQuests = [
        {
            title: t('quest_d1_title'),
            description: t('quest_d1_desc'),
            reward: '+100 XP',
            completed: stage === 'normal',
        },
        {
            title: t('quest_d2_title'),
            description: t('quest_d2_desc'),
            reward: '+50 XP',
            completed: false,
        },
        {
            title: t('quest_d3_title'),
            description: t('quest_d3_desc'),
            reward: '+150 XP',
            completed: true,
        },
    ];

    const achievements = [
        {
            title: t('ach_1_title'),
            description: t('ach_1_desc'),
            progress: `${Math.min(3, days_survived)} / 3 ${t('unit_days')}`,
            unlocked: days_survived >= 3,
        },
        {
            title: t('ach_2_title'),
            description: t('ach_2_desc'),
            progress: `${Math.min(7, days_survived)} / 7 ${t('unit_days')}`,
            unlocked: days_survived >= 7,
        },
        {
            title: t('ach_3_title'),
            description: t('ach_3_desc'),
            progress: `${Math.min(30, days_survived)} / 30 ${t('unit_days')}`,
            unlocked: days_survived >= 30,
        },
    ];

    return (
        <>
            <Head title={`${t('quests_title')} - SleepOrDie`} />

            <div className="max-w-3xl w-full mx-auto p-4 md:p-6 space-y-6 select-none">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-medium tracking-tight text-white">
                            {t('quests_title')}
                        </h1>
                        <p className="text-xs text-zinc-500 font-light mt-0.5">
                            {t('quests_desc')}
                        </p>
                    </div>

                    <div className="flex items-center gap-2 bg-[#121215] rounded-xl px-3.5 py-2">
                        <Ticket className="size-4 text-amber-400" />
                        <span className="text-xs text-zinc-400 font-light">{t('quests_my_tickets')}</span>
                        <span className="text-sm font-medium text-white tabular-nums">
                            {tickets_count} {t('quests_tickets_unit')}
                        </span>
                    </div>
                </div>

                {/* Daily Quests List */}
                <div className="bg-[#121215] rounded-2xl p-5 space-y-3 shadow-sm">
                    <span className="text-sm font-medium text-white">{t('quests_daily_title')}</span>

                    <div className="space-y-2 pt-1">
                        {dailyQuests.map((quest, index) => (
                            <div
                                key={index}
                                className="bg-[#18181b] rounded-xl p-4 flex items-center justify-between text-xs"
                            >
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        {quest.completed ? (
                                             <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                                        ) : (
                                            <Circle className="size-4 text-zinc-600 shrink-0" />
                                        )}
                                        <span className={`font-normal ${quest.completed ? 'text-zinc-400 line-through' : 'text-white'}`}>
                                            {quest.title}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-zinc-500 font-light pl-6">
                                        {quest.description}
                                    </p>
                                </div>

                                <span className="text-xs font-normal text-emerald-400 shrink-0">
                                    {quest.reward}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Achievements List */}
                <div className="bg-[#121215] rounded-2xl p-5 space-y-3 shadow-sm">
                    <span className="text-sm font-medium text-white">{t('quests_achievements_title')}</span>

                    <div className="space-y-2 pt-1">
                        {achievements.map((ach, index) => (
                            <div
                                key={index}
                                className="bg-[#18181b] rounded-xl p-4 flex items-center justify-between text-xs"
                            >
                                <div className="space-y-0.5">
                                    <span className="font-normal text-white">{ach.title}</span>
                                    <p className="text-[11px] text-zinc-500 font-light">{ach.description}</p>
                                </div>

                                <div className="text-right shrink-0">
                                    <span className="text-xs font-medium text-zinc-300 tabular-nums">
                                        {ach.progress}
                                    </span>
                                    <p className="text-[10px] text-zinc-500 font-light">
                                        {ach.unlocked ? t('ach_status_unlocked') : t('ach_status_progress')}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
