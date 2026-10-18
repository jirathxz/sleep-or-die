import React from 'react';
import { Head } from '@inertiajs/react';
import { Activity, ShieldAlert, Award, Zap, Skull } from 'lucide-react';
import { useSleepStore } from '@/stores/useSleepStore';

export default function Progression() {
    const { current_hp, shutdown_stacks, days_survived } = useSleepStore();

    const currentLevel = Math.floor(days_survived / 7) + 1;
    const currentExp = (days_survived % 7) * 150;
    const nextLevelExp = 7 * 150;
    const expPercentage = Math.min(100, Math.round((currentExp / nextLevelExp) * 100));

    return (
        <>
            <Head title="สถานะชีวิต - SleepOrDie" />

            <div className="max-w-3xl w-full mx-auto p-4 md:p-6 space-y-6 select-none">
                {/* Header */}
                <div>
                    <h1 className="text-xl font-medium tracking-tight text-white">
                        สถานะชีวิตและความก้าวหน้า (Vital Progression)
                    </h1>
                    <p className="text-xs text-zinc-500 font-light mt-0.5">
                        ระบบระดับวินัย EXP และกฎระเบียบบทลงโทษชัตดาวน์
                    </p>
                </div>

                {/* Level & Discipline Tier (Tonal Surface, No Border) */}
                <div className="bg-[#121215] rounded-2xl p-5 space-y-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <span className="text-xs text-zinc-500 font-light">ระดับผู้ควบคุมวินัย</span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-medium text-white">Level {currentLevel}</span>
                                <span className="text-xs text-emerald-400 font-normal">Circadian Master</span>
                            </div>
                        </div>

                        <div className="text-right space-y-0.5">
                            <span className="text-xs text-zinc-500 font-light">EXP สะสม</span>
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
                            กฎระเบียบบทลงโทษ (Permadeath Protocol)
                        </span>
                        <span className="text-xs text-zinc-500 font-light">5 Strikes Rule</span>
                    </div>

                    <div className="space-y-3 pt-1">
                        <div className="bg-[#18181b] rounded-xl p-4 flex items-center justify-between">
                            <div className="space-y-0.5">
                                <span className="text-xs text-zinc-300 font-normal">พลังชีวิตปัจจุบัน</span>
                                <p className="text-[11px] text-zinc-500 font-light">
                                    ลดลงทันทีที่เลยเวลานอน และลดลง 1 HP ทุก ๆ 2 นาที
                                </p>
                            </div>
                            <span className="text-xl font-medium text-white tabular-nums">{current_hp} HP</span>
                        </div>

                        <div className="bg-[#18181b] rounded-xl p-4 flex items-center justify-between">
                            <div className="space-y-0.5">
                                <span className="text-xs text-zinc-300 font-normal">สถิติสไตรค์ชัตดาวน์</span>
                                <p className="text-[11px] text-zinc-500 font-light">
                                    หากเลือดลดถึง 0% จะถูกบันทึก 1 สไตรค์ (จะล้าง 1 สไตรค์เมื่อนอนตรงเวลา 5 วันติด)
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
                                <span className="text-xs text-zinc-300 font-normal">สถานะการระงับบัญชี (Permanent Death)</span>
                                <p className="text-[11px] text-zinc-500 font-light">
                                    เมื่อครบ 5 สไตรค์ บัญชีจะถูกระงับถาวรและไม่สามารถกู้คืนได้
                                </p>
                            </div>
                            <span className="text-xs font-normal text-emerald-400">ปกติ (ACTIVE)</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
