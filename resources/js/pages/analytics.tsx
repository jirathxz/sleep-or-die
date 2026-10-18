import React from 'react';
import { Head } from '@inertiajs/react';
import { BarChart3, TrendingUp, Calendar, Zap } from 'lucide-react';
import { useSleepStore } from '@/stores/useSleepStore';

export default function Analytics() {
    const { days_survived } = useSleepStore();

    const weeklyData = [
        { day: 'จันทร์', hours: 7.8, percentage: 95 },
        { day: 'อังคาร', hours: 7.5, percentage: 92 },
        { day: 'พุธ', hours: 8.0, percentage: 100 },
        { day: 'พฤหัส', hours: 7.7, percentage: 94 },
        { day: 'ศุกร์', hours: 7.2, percentage: 88 },
        { day: 'เสาร์', hours: 8.2, percentage: 100 },
        { day: 'อาทิตย์', hours: 7.6, percentage: 93 },
    ];

    return (
        <>
            <Head title="สถิติการนอน - SleepOrDie" />

            <div className="max-w-3xl w-full mx-auto p-4 md:p-6 space-y-6 select-none">
                {/* Header */}
                <div>
                    <h1 className="text-xl font-medium tracking-tight text-white">
                        สถิติและการวิเคราะห์
                    </h1>
                    <p className="text-xs text-zinc-500 font-light mt-0.5">
                        วิเคราะห์ความสม่ำเสมอและคุณภาพของการนอนหลับรายสัปดาห์
                    </p>
                </div>

                {/* Metric Summary Pods (No duplicate cards) */}
                <div className="bg-[#121215] rounded-2xl p-5 grid grid-cols-2 sm:grid-cols-4 gap-4 shadow-sm">
                    <div className="space-y-0.5">
                        <span className="text-xs text-zinc-500 font-light">ความสม่ำเสมอ</span>
                        <p className="text-2xl font-medium text-emerald-400 tabular-nums">94%</p>
                    </div>
                    <div className="space-y-0.5">
                        <span className="text-xs text-zinc-500 font-light">ชั่วโมงนอนเฉลี่ย</span>
                        <p className="text-2xl font-medium text-white tabular-nums">7.7 ชม.</p>
                    </div>
                    <div className="space-y-0.5">
                        <span className="text-xs text-zinc-500 font-light">สถิตินอนตรงเวลา</span>
                        <p className="text-2xl font-medium text-white tabular-nums">{days_survived} วัน</p>
                    </div>
                    <div className="space-y-0.5">
                        <span className="text-xs text-zinc-500 font-light">ประสิทธิภาพการฟื้นฟู</span>
                        <p className="text-2xl font-medium text-white">ยอดเยี่ยม</p>
                    </div>
                </div>

                {/* Minimalist Bar Visualization (Tonal & Elegant) */}
                <div className="bg-[#121215] rounded-2xl p-5 space-y-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-white">ระยะเวลาการนอนรอบ 7 วัน</span>
                        <span className="text-xs text-zinc-500 font-light">เป้าหมาย 7.75 ชม.</span>
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
