import React from 'react';
import { useSleepStore, SleepHistoryItem } from '@/stores/useSleepStore';
import { History as HistoryIcon, CheckCircle2, AlertCircle, Clock, ShieldCheck, Award } from 'lucide-react';

export function MissionHistoryView() {
    const {
        days_survived,
        sleep_history,
        level,
        exp,
        theme_preference,
        border_style,
    } = useSleepStore();

    const isSpecial = theme_preference === 'special';
    const isSharp = border_style === 'sharp';

    const cornerRadius = isSharp ? 'rounded-none' : 'rounded-xl';
    const subCornerRadius = isSharp ? 'rounded-none' : 'rounded-lg';

    // Default sample fallback if no records yet
    const displayLogs: SleepHistoryItem[] = sleep_history && sleep_history.length > 0 ? sleep_history : [
        {
            id: 'demo_1',
            date: '2026-10-18',
            date_display: 'เมื่อวานนี้ (18 ต.ค.)',
            target_time: '23:15',
            actual_time: '23:14 น.',
            wake_time: '07:02 น.',
            duration: '7 ชม. 48 นาที',
            status: 'ON_TIME',
            status_label: 'ภารกิจสำเร็จ • ตรงเวลา',
            status_color: 'text-emerald-400',
            reward: '+150 EXP • รักษาสถิติ 1 วัน',
            life_change: 'LIFE 100% (สมบูรณ์)',
        },
        {
            id: 'demo_2',
            date: '2026-10-17',
            date_display: '2 วันที่แล้ว (17 ต.ค.)',
            target_time: '23:15',
            actual_time: '23:10 น.',
            wake_time: '06:55 น.',
            duration: '7 ชม. 45 นาที',
            status: 'ON_TIME',
            status_label: 'ภารกิจสำเร็จ • ตรงเวลา',
            status_color: 'text-emerald-400',
            reward: '+150 EXP',
            life_change: 'LIFE 100% (สมบูรณ์)',
        },
        {
            id: 'demo_3',
            date: '2026-10-16',
            date_display: '3 วันที่แล้ว (16 ต.ค.)',
            target_time: '23:15',
            actual_time: '23:42 น.',
            wake_time: '07:30 น.',
            duration: '7 ชม. 48 นาที',
            status: 'LATE',
            status_label: 'เลยเวลา 27 นาที • ใช้ตั๋วฉุกเฉิน',
            status_color: 'text-amber-400',
            reward: '+50 EXP • -1 ตั๋วฉุกเฉิน',
            life_change: 'LIFE -10% (ฟื้นฟูแล้ว)',
        },
        {
            id: 'demo_4',
            date: '2026-10-15',
            date_display: '4 วันที่แล้ว (15 ต.ค.)',
            target_time: '23:15',
            actual_time: '23:12 น.',
            wake_time: '07:05 น.',
            duration: '7 ชม. 53 นาที',
            status: 'ON_TIME',
            status_label: 'ภารกิจสำเร็จ • ตรงเวลา',
            status_color: 'text-emerald-400',
            reward: '+150 EXP',
            life_change: 'LIFE 100% (สมบูรณ์)',
        },
    ];

    return (
        <div className={`space-y-4 select-none ${isSpecial ? 'font-mono text-zinc-100' : 'font-sans text-zinc-100'}`}>
            {/* Header metrics */}
            <div className={`${isSpecial ? 'bg-[#070e07] border border-[#8cf044]/30' : 'bg-[#121215] border border-white/5'} ${cornerRadius} p-3 sm:p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 shadow-inner`}>
                <div className="flex flex-col">
                    <span className={`text-[11px] ${isSpecial ? 'text-[#5a8a40]' : 'text-zinc-400'} tracking-wide`}>
                        {isSpecial ? '// วันรอดชีวิตสะสม' : 'วันรอดชีวิตสะสม'}
                    </span>
                    <span className={`text-xl sm:text-2xl font-bold ${isSpecial ? 'text-[#8cf044]' : 'text-white'} tracking-wider`}>
                        {days_survived} วัน
                    </span>
                </div>

                <div className={`flex flex-col border-l ${isSpecial ? 'border-[#8cf044]/20' : 'border-white/10'} pl-4`}>
                    <span className={`text-[11px] ${isSpecial ? 'text-[#5a8a40]' : 'text-zinc-400'} tracking-wide`}>
                        {isSpecial ? '// ความตรงต่อเวลา' : 'ความตรงต่อเวลา'}
                    </span>
                    <span className="text-xl sm:text-2xl font-bold text-[#ffb700] tracking-wider">
                        95%
                    </span>
                </div>

                <div className={`flex flex-col border-l ${isSpecial ? 'border-[#8cf044]/20' : 'border-white/10'} pl-4`}>
                    <span className={`text-[11px] ${isSpecial ? 'text-[#5a8a40]' : 'text-zinc-400'} tracking-wide`}>
                        {isSpecial ? '// เวลานอนเฉลี่ย' : 'เวลานอนเฉลี่ย'}
                    </span>
                    <span className="text-lg sm:text-xl font-bold text-zinc-200 tracking-wider">
                        7h 46m
                    </span>
                </div>

                <div className={`flex flex-col border-l ${isSpecial ? 'border-[#8cf044]/20' : 'border-white/10'} pl-4`}>
                    <span className={`text-[11px] ${isSpecial ? 'text-[#5a8a40]' : 'text-zinc-400'} tracking-wide`}>
                        {isSpecial ? '// ระดับยศ OPERATIVE' : 'ระดับผู้ใช้'}
                    </span>
                    <span className={`text-lg sm:text-xl font-bold ${isSpecial ? 'text-[#8cf044]' : 'text-white'} tracking-wider`}>
                        LV.{level} ({exp} EXP)
                    </span>
                </div>
            </div>

            {/* Main History Table Box */}
            <div className={`${isSpecial ? 'bg-[#050b05] border border-[#8cf044]/30' : 'bg-[#121215] border border-white/5'} ${cornerRadius} p-4 sm:p-5 space-y-4`}>
                <div className={`border-b ${isSpecial ? 'border-[#8cf044]/20' : 'border-white/10'} pb-3 flex items-center justify-between`}>
                    <h2 className={`text-base sm:text-lg font-bold ${isSpecial ? 'text-[#8cf044]' : 'text-white'} tracking-wider flex items-center gap-2`}>
                        {isSpecial && <span>[MISSION LOGS]</span>}
                        <span>ประวัติการเข้านอนและบันทึกภารกิจ</span>
                    </h2>
                    <span className={`text-xs ${isSpecial ? 'text-[#5a8a40]' : 'text-zinc-500'}`}>
                        บันทึก {displayLogs.length} รายการ
                    </span>
                </div>

                {/* Log list entries */}
                <div className="space-y-2.5">
                    {displayLogs.map((log) => {
                        const isOnTime = log.status === 'ON_TIME';
                        return (
                            <div
                                key={log.id}
                                className={`${isSpecial ? 'bg-[#071007] border border-[#8cf044]/25 hover:border-[#8cf044]/60' : 'bg-[#18181c] border border-white/5 hover:border-white/20'} p-3.5 sm:p-4 ${subCornerRadius} flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors`}
                            >
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className={`font-bold ${isSpecial ? 'text-[#8cf044]' : 'text-white'} text-xs sm:text-sm`}>
                                            {log.date_display || log.date}
                                        </span>
                                        <span className="text-zinc-600">•</span>
                                        <span className="text-xs text-zinc-300">
                                            {log.duration}
                                        </span>
                                    </div>

                                    <div className={`flex flex-wrap items-center gap-3 text-xs ${isSpecial ? 'text-[#5a8a40]' : 'text-zinc-400'}`}>
                                        <span>
                                            เป้าหมาย: <span className="text-zinc-200">{log.target_time}</span>
                                        </span>
                                        <span>•</span>
                                        <span>
                                            นอนจริง: <span className="text-zinc-200">{log.actual_time}</span>
                                        </span>
                                        {log.wake_time && (
                                            <>
                                                <span>•</span>
                                                <span>
                                                    เวลาตื่น: <span className="text-zinc-200">{log.wake_time}</span>
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className={`flex sm:flex-col items-start sm:items-end justify-between sm:justify-center border-t sm:border-t-0 ${isSpecial ? 'border-[#8cf044]/15' : 'border-white/10'} pt-2 sm:pt-0`}>
                                    <span className={`text-xs font-bold tracking-wide ${isOnTime ? (isSpecial ? 'text-[#8cf044]' : 'text-emerald-400') : 'text-[#ffb700]'}`}>
                                        {log.status_label || (isOnTime ? (isSpecial ? '[ ภารกิจสำเร็จ • ตรงเวลา ]' : 'ตรงเวลา') : (isSpecial ? '[ ภารกิจสำเร็จ • สาย ]' : 'เลยเวลา'))}
                                    </span>
                                    <span className="text-[11px] text-zinc-400 mt-0.5">
                                        {log.reward}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
