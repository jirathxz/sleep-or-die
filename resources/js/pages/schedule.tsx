import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { Calendar, Moon, Sun, Clock, Zap } from 'lucide-react';
import { useSleepStore } from '@/stores/useSleepStore';

export default function Schedule() {
    const { wake_up_time, sleep_target_time } = useSleepStore();

    const days = [
        { day: 'จันทร์', wake: wake_up_time || '07:00', sleep: sleep_target_time || '23:15', cycles: 5 },
        { day: 'อังคาร', wake: wake_up_time || '07:00', sleep: sleep_target_time || '23:15', cycles: 5 },
        { day: 'พุธ', wake: wake_up_time || '07:00', sleep: sleep_target_time || '23:15', cycles: 5 },
        { day: 'พฤหัสบดี', wake: wake_up_time || '07:00', sleep: sleep_target_time || '23:15', cycles: 5 },
        { day: 'ศุกร์', wake: wake_up_time || '07:00', sleep: sleep_target_time || '23:15', cycles: 5 },
        { day: 'เสาร์', wake: '08:00', sleep: '00:15', cycles: 5 },
        { day: 'อาทิตย์', wake: '07:30', sleep: '23:45', cycles: 5 },
    ];

    return (
        <>
            <Head title="ตารางการนอน - SleepOrDie" />

            <div className="max-w-3xl w-full mx-auto p-4 md:p-6 space-y-6 select-none">
                {/* Header */}
                <div>
                    <h1 className="text-xl font-medium tracking-tight text-white">
                        ตารางเส้นตายการนอน
                    </h1>
                    <p className="text-xs text-zinc-500 font-light mt-0.5">
                        คำนวณและกำหนดเส้นตายเข้านอนรายวัน เพื่อรักษาวินัยและป้องกันการสูญเสียพลังชีวิต
                    </p>
                </div>

                {/* Formula Highlight Pod (No Border, Tonal Surface) */}
                <div className="bg-[#121215] rounded-2xl p-5 space-y-3 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-white flex items-center gap-2">
                            <Zap className="size-4 text-emerald-400" />
                            สูตรคำนวณการนอนตามหลักสรีรวิทยา
                        </span>
                        <span className="text-xs text-zinc-500 font-light">5 รอบการนอน</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                        <div className="bg-[#18181b] rounded-xl p-3 space-y-1">
                            <span className="text-xs text-zinc-500 font-light">รอบการหลับลึก 90 นาที</span>
                            <p className="text-sm font-normal text-white">5 รอบ = 7 ชม. 30 นาที</p>
                        </div>
                        <div className="bg-[#18181b] rounded-xl p-3 space-y-1">
                            <span className="text-xs text-zinc-500 font-light">ระยะเวลาผ่อนคลาย</span>
                            <p className="text-sm font-normal text-white">+15 นาที Latency</p>
                        </div>
                        <div className="bg-[#18181b] rounded-xl p-3 space-y-1">
                            <span className="text-xs text-zinc-500 font-light">เวลานอนรวมที่แนะนำ</span>
                            <p className="text-sm font-normal text-emerald-400">7 ชั่วโมง 45 นาที</p>
                        </div>
                    </div>
                </div>

                {/* Weekly Schedule Table (No Border, Tonal Shift) */}
                <div className="bg-[#121215] rounded-2xl p-5 space-y-4 shadow-sm">
                    <span className="text-sm font-medium text-white">ตารางเวลาประจำสัปดาห์</span>

                    <div className="space-y-2">
                        {days.map((item) => (
                            <div
                                key={item.day}
                                className="bg-[#18181b] rounded-xl p-3.5 flex items-center justify-between text-xs transition-colors hover:bg-zinc-800/50"
                            >
                                <span className="font-normal text-zinc-200 w-24">{item.day}</span>

                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-1.5 text-zinc-400">
                                        <Moon className="size-3.5 text-indigo-400" />
                                        <span>นอน: <span className="text-white font-medium tabular-nums">{item.sleep}</span></span>
                                    </div>

                                    <div className="flex items-center gap-1.5 text-zinc-400">
                                        <Sun className="size-3.5 text-amber-400" />
                                        <span>ตื่น: <span className="text-white font-medium tabular-nums">{item.wake}</span></span>
                                    </div>
                                </div>

                                <span className="text-zinc-500 font-light hidden sm:inline">
                                    {item.cycles} รอบ
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
