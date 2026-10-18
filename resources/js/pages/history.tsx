import React from 'react';
import { Head } from '@inertiajs/react';
import { History as HistoryIcon, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { useSleepStore } from '@/stores/useSleepStore';

export default function History() {
    const { days_survived } = useSleepStore();

    const logs = [
        {
            date: 'เมื่อวานนี้',
            sleepTime: '23:14 น.',
            wakeTime: '07:02 น.',
            duration: '7 ชม. 48 นาที',
            status: 'ตรงเวลา (On Time)',
            reward: '+1 วันสะสม',
            statusColor: 'text-emerald-400',
        },
        {
            date: '2 วันที่แล้ว',
            sleepTime: '23:10 น.',
            wakeTime: '06:55 น.',
            duration: '7 ชม. 45 นาที',
            status: 'ตรงเวลา (On Time)',
            reward: '+1 วันสะสม',
            statusColor: 'text-emerald-400',
        },
        {
            date: '3 วันที่แล้ว',
            sleepTime: '23:40 น.',
            wakeTime: '07:30 น.',
            duration: '7 ชม. 50 นาที',
            status: 'สาย 25 นาที (ใช้ตั๋วฉุกเฉิน)',
            reward: '-1 ตั๋ว',
            statusColor: 'text-amber-400',
        },
        {
            date: '4 วันที่แล้ว',
            sleepTime: '23:12 น.',
            wakeTime: '07:05 น.',
            duration: '7 ชม. 53 นาที',
            status: 'ตรงเวลา (On Time)',
            reward: '+1 วันสะสม',
            statusColor: 'text-emerald-400',
        },
    ];

    return (
        <>
            <Head title="ประวัติการนอน - SleepOrDie" />

            <div className="max-w-3xl w-full mx-auto p-4 md:p-6 space-y-6 select-none">
                {/* Header */}
                <div>
                    <h1 className="text-xl font-medium tracking-tight text-white">
                        ประวัติการนอน (Sleep Logs)
                    </h1>
                    <p className="text-xs text-zinc-500 font-light mt-0.5">
                        บันทึกเวลาเข้านอนจริงและประวัติการตื่นย้อนหลัง
                    </p>
                </div>

                {/* Summary Metrics (No duplicate cards) */}
                <div className="bg-[#121215] rounded-2xl p-5 grid grid-cols-2 sm:grid-cols-3 gap-4 shadow-sm">
                    <div className="space-y-0.5">
                        <span className="text-xs text-zinc-500 font-light">วันรอดชีวิตสะสม</span>
                        <p className="text-2xl font-medium text-white tabular-nums">{days_survived} วัน</p>
                    </div>
                    <div className="space-y-0.5">
                        <span className="text-xs text-zinc-500 font-light">ความตรงต่อเวลาเฉลี่ย</span>
                        <p className="text-2xl font-medium text-emerald-400 tabular-nums">94%</p>
                    </div>
                    <div className="space-y-0.5 col-span-2 sm:col-span-1">
                        <span className="text-xs text-zinc-500 font-light">เวลานอนเฉลี่ย</span>
                        <p className="text-2xl font-medium text-white tabular-nums">7h 46m</p>
                    </div>
                </div>

                {/* History Log Entries */}
                <div className="bg-[#121215] rounded-2xl p-5 space-y-3 shadow-sm">
                    <span className="text-sm font-medium text-white">รายการบันทึกล่าสุด</span>

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
                                    <div className="flex items-center gap-3 text-[11px] text-zinc-500 font-light">
                                        <span>เข้านอน: <span className="text-zinc-300 font-normal">{log.sleepTime}</span></span>
                                        <span>ตื่น: <span className="text-zinc-300 font-normal">{log.wakeTime}</span></span>
                                    </div>
                                </div>

                                <div className="flex sm:flex-col items-start sm:items-end justify-between sm:justify-center">
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
