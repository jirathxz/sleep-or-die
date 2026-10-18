import React from 'react';
import { Head } from '@inertiajs/react';
import { Trophy, CheckCircle2, Circle, Ticket, Star, Sparkles } from 'lucide-react';
import { useSleepStore } from '@/stores/useSleepStore';

export default function Quests() {
    const { tickets_count, days_survived, stage } = useSleepStore();

    const dailyQuests = [
        {
            title: 'ปิดหน้าจอก่อนเวลาเส้นตาย',
            description: 'กดยืนยันการนอนก่อนถึงเวลาเป้าหมาย 23:15 น.',
            reward: '+100 XP',
            completed: stage === 'normal',
        },
        {
            title: 'ตรวจจับออฟไลน์ผ่าน Discord',
            description: 'คงสถานะออฟไลน์ให้ครบ 10 นาทีแรกหลังยืนยันการนอน',
            reward: '+50 XP',
            completed: false,
        },
        {
            title: 'รักษาพลังชีวิตเต็ม 100%',
            description: 'ไม่ปล่อยให้หลอดเลือดเริ่มลดลงในคืนนี้',
            reward: '+150 XP',
            completed: true,
        },
    ];

    const achievements = [
        {
            title: 'เริ่มต้นการเปลี่ยนแปลง (First Step)',
            description: 'นอนตรงเวลาติดต่อกันครบ 3 วัน',
            progress: `${Math.min(3, days_survived)} / 3 วัน`,
            unlocked: days_survived >= 3,
        },
        {
            title: 'วินัยเหล็กไหล (Iron Will)',
            description: 'รอดชีวิตสะสมครบ 7 วัน รับฟรี 1 ตั๋วขยายเวลา',
            progress: `${Math.min(7, days_survived)} / 7 วัน`,
            unlocked: days_survived >= 7,
        },
        {
            title: 'ผู้พิชิตรัตติกาล (Night Conqueror)',
            description: 'รอดชีวิตสะสมครบ 30 วันโดยไม่มีสไตรค์ชัตดาวน์',
            progress: `${Math.min(30, days_survived)} / 30 วัน`,
            unlocked: days_survived >= 30,
        },
    ];

    return (
        <>
            <Head title="ภารกิจและรางวัล - SleepOrDie" />

            <div className="max-w-3xl w-full mx-auto p-4 md:p-6 space-y-6 select-none">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-medium tracking-tight text-white">
                            ภารกิจและรางวัล (Quests & Rewards)
                        </h1>
                        <p className="text-xs text-zinc-500 font-light mt-0.5">
                            ทำภารกิจประจำวันเพื่อรับ EXP และตั๋วขยายเวลาฉุกเฉิน
                        </p>
                    </div>

                    <div className="flex items-center gap-2 bg-[#121215] rounded-xl px-3.5 py-2">
                        <Ticket className="size-4 text-amber-400" />
                        <span className="text-xs text-zinc-400 font-light">ตั๋วที่มี:</span>
                        <span className="text-sm font-medium text-white tabular-nums">{tickets_count} ใบ</span>
                    </div>
                </div>

                {/* Daily Quests List */}
                <div className="bg-[#121215] rounded-2xl p-5 space-y-3 shadow-sm">
                    <span className="text-sm font-medium text-white">ภารกิจประจำวัน (Daily Tasks)</span>

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
                    <span className="text-sm font-medium text-white">ความสำเร็จสะสม (Achievements)</span>

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
                                        {ach.unlocked ? 'ปลดล็อคแล้ว' : 'กำลังดำเนินการ'}
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
