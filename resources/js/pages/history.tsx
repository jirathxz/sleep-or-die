import React from 'react';
import { Head } from '@inertiajs/react';
import { History as HistoryIcon, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { useSleepStore } from '@/stores/useSleepStore';
import { useTranslation } from '@/lib/i18n';

export default function History() {
    const { days_survived } = useSleepStore();
    const { t, isTactical } = useTranslation();

    const logs = [
        {
            date: isTactical ? 'T-1 DAY (YESTERDAY)' : 'เมื่อวานนี้',
            sleepTime: isTactical ? '23:14 HRS' : '23:14 น.',
            wakeTime: isTactical ? '07:02 HRS' : '07:02 น.',
            duration: isTactical ? '7h 48m' : '7 ชม. 48 นาที',
            status: isTactical ? 'NOMINAL // ON TIME' : 'ตรงเวลา',
            reward: isTactical ? '+1 SURVIVAL DAY' : '+1 วันสะสม',
            statusColor: 'text-emerald-400',
        },
        {
            date: isTactical ? 'T-2 DAYS AGO' : '2 วันที่แล้ว',
            sleepTime: isTactical ? '23:10 HRS' : '23:10 น.',
            wakeTime: isTactical ? '06:55 HRS' : '06:55 น.',
            duration: isTactical ? '7h 45m' : '7 ชม. 45 นาที',
            status: isTactical ? 'NOMINAL // ON TIME' : 'ตรงเวลา',
            reward: isTactical ? '+1 SURVIVAL DAY' : '+1 วันสะสม',
            statusColor: 'text-emerald-400',
        },
        {
            date: isTactical ? 'T-3 DAYS AGO' : '3 วันที่แล้ว',
            sleepTime: isTactical ? '23:40 HRS' : '23:40 น.',
            wakeTime: isTactical ? '07:30 HRS' : '07:30 น.',
            duration: isTactical ? '7h 50m' : '7 ชม. 50 นาที',
            status: isTactical ? 'BREACH +25m // OVERRIDE KEY' : 'สาย 25 นาที • ใช้ตั๋วฉุกเฉิน',
            reward: isTactical ? '-1 OVERRIDE KEY' : '-1 ตั๋ว',
            statusColor: 'text-amber-400',
        },
        {
            date: isTactical ? 'T-4 DAYS AGO' : '4 วันที่แล้ว',
            sleepTime: isTactical ? '23:12 HRS' : '23:12 น.',
            wakeTime: isTactical ? '07:05 HRS' : '07:05 น.',
            duration: isTactical ? '7h 53m' : '7 ชม. 53 นาที',
            status: isTactical ? 'NOMINAL // ON TIME' : 'ตรงเวลา',
            reward: isTactical ? '+1 SURVIVAL DAY' : '+1 วันสะสม',
            statusColor: 'text-emerald-400',
        },
    ];

    return (
        <>
            <Head title={`${t('history_title')} - SleepOrDie`} />

            <div className="max-w-3xl w-full mx-auto p-4 md:p-6 space-y-6 select-none">
                {/* Header */}
                <div>
                    <h1 className="text-xl font-medium tracking-tight text-white">
                        {t('history_title')}
                    </h1>
                    <p className="text-xs text-zinc-500 font-light mt-0.5">
                        {t('history_desc')}
                    </p>
                </div>

                {/* Summary Metrics */}
                <div className="bg-[#121215] rounded-2xl p-5 grid grid-cols-2 sm:grid-cols-3 gap-4 shadow-sm">
                    <div className="space-y-0.5">
                        <span className="text-xs text-zinc-500 font-light">{t('stats_survived')}</span>
                        <p className="text-2xl font-medium text-white tabular-nums">
                            {days_survived} {isTactical ? 'DAYS' : 'วัน'}
                        </p>
                    </div>
                    <div className="space-y-0.5">
                        <span className="text-xs text-zinc-500 font-light">
                            {isTactical ? 'PUNCTUALITY RATE' : 'ความตรงต่อเวลาเฉลี่ย'}
                        </span>
                        <p className="text-2xl font-medium text-emerald-400 tabular-nums">94%</p>
                    </div>
                    <div className="space-y-0.5 col-span-2 sm:col-span-1">
                        <span className="text-xs text-zinc-500 font-light">
                            {isTactical ? 'AVERAGE SLEEP' : 'เวลานอนเฉลี่ย'}
                        </span>
                        <p className="text-2xl font-medium text-white tabular-nums">7h 46m</p>
                    </div>
                </div>

                {/* History Log Entries */}
                <div className="bg-[#121215] rounded-2xl p-5 space-y-3 shadow-sm">
                    <span className="text-sm font-medium text-white">
                        {t('history_table_title')}
                    </span>

                    <div className="space-y-2 pt-1">
                        {logs.map((log, index) => (
                            <div
                                key={index}
                                className="bg-[#18181b] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                            >
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-normal text-white">{log.date}</span>
                                        <span className="text-zinc-500">•</span>
                                        <span className="text-zinc-400 font-light">{log.duration}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-[11px] text-zinc-500 font-light font-mono">
                                        <span>{isTactical ? 'BEDTIME:' : 'เข้านอน:'} <span className="text-zinc-300 font-normal">{log.sleepTime}</span></span>
                                        <span>{isTactical ? 'WAKE:' : 'ตื่น:'} <span className="text-zinc-300 font-normal">{log.wakeTime}</span></span>
                                    </div>
                                </div>

                                <div className="flex sm:flex-col items-start sm:items-end justify-between sm:justify-center font-mono">
                                    <span className={`font-medium ${log.statusColor}`}>{log.status}</span>
                                    <span className="text-[11px] text-zinc-500 font-light mt-0.5">{log.reward}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
