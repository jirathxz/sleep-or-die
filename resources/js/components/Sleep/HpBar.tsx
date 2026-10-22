import React from 'react';
import { useTranslation } from '@/lib/i18n';
import { Heart } from 'lucide-react';

interface HpBarProps {
    hp: number;
    stage: string;
    onResetHp?: () => void;
}

export const HpBar: React.FC<HpBarProps> = ({ hp, stage, onResetHp }) => {
    const clampedHp = Math.max(0, Math.min(100, hp));
    const { t, isTactical } = useTranslation();

    // กำหนดสีและข้อความสถานะตามโหมดภาษา
    let barColor = isTactical ? 'bg-[#9ab874]' : 'bg-emerald-500';
    let statusText = t('hp_status_normal');
    let dotColor = isTactical ? 'bg-[#9ab874]' : 'bg-emerald-500';
    let statusTextColor = isTactical ? 'text-[#9ab874]' : 'text-zinc-400';

    if (clampedHp <= 0 || stage === 'shutdown') {
        barColor = 'bg-zinc-700';
        statusText = t('hp_status_dead');
        dotColor = 'bg-zinc-500';
        statusTextColor = 'text-zinc-500';
    } else if (clampedHp <= 30 || stage === 'sleep') {
        barColor = 'bg-rose-500';
        statusText = t('hp_status_critical');
        dotColor = 'bg-rose-500 animate-pulse';
        statusTextColor = 'text-rose-400';
    } else if (clampedHp <= 65 || stage === 'lockdown') {
        barColor = 'bg-amber-500';
        statusText = t('hp_status_caution');
        dotColor = 'bg-amber-500';
        statusTextColor = 'text-amber-400';
    }

    return (
        <section
            className={`bg-[#121215] rounded-2xl p-5 md:p-6 space-y-4 shadow-sm select-none border relative overflow-hidden transition-all ${
                isTactical
                    ? 'border-[#9ab874]/30 shadow-[0_0_30px_rgba(154,184,116,0.06)]'
                    : 'border-white/5'
            }`}
        >
            {/* Tactical HUD Corner Brackets (เฉพาะโหมดชายขายโลก) */}
            {isTactical && (
                <>
                    <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-[#9ab874]" />
                    <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-[#9ab874]" />
                    <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-[#9ab874]" />
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-[#9ab874]" />
                </>
            )}

            {/* Header: Title ตามโหมดที่เลือก */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className={`size-2 rounded-sm ${isTactical ? 'bg-[#9ab874]' : 'bg-white/40'}`} />
                    <h2 className="text-xs font-mono tracking-wider text-zinc-300 uppercase">
                        {t('hp_title')}
                    </h2>
                    {onResetHp && (
                        <button
                            type="button"
                            onClick={onResetHp}
                            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-[11px] font-normal transition-all active:scale-95 ml-1"
                            title="รีเซ็ตพลังชีวิตกลับเป็น 100% เต็มกำลัง"
                        >
                            <Heart className="size-3 fill-emerald-500/30" />
                            <span>รีเซ็ต HP</span>
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-2 text-xs font-mono">
                    <span className={`size-2 rounded-full ${dotColor}`} />
                    <span className={statusTextColor}>{statusText}</span>
                </div>
            </div>

            {/* Readout Display: ตัวเลขอัตราพลังงาน */}
            <div className="flex items-baseline justify-between pt-1">
                <span className="text-xs font-mono text-zinc-500">
                    {isTactical ? 'ENERGY CAPACITY' : 'ความจุพลังงานปัจจุบัน'}
                </span>
                <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl md:text-5xl font-mono font-bold tracking-tight text-white tabular-nums">
                        {clampedHp}
                    </span>
                    <span className="text-xs font-mono text-zinc-500">/ 100 HP</span>
                </div>
            </div>

            {/* Progress Bar พร้อมขีด Segment ยุทธวิธี */}
            <div className="relative w-full h-3.5 bg-[#18181b] rounded-md p-0.5 overflow-hidden border border-white/5">
                <div
                    className={`h-full rounded-sm transition-all duration-700 ease-out ${barColor}`}
                    style={{ width: `${clampedHp}%` }}
                />
                {/* ขีดแบ่งช่องเกจยุทธวิธี (Segment Divider) */}
                <div className="absolute inset-0 flex justify-between pointer-events-none px-1">
                    {[...Array(10)].map((_, i) => (
                        <div key={i} className="w-[1px] h-full bg-black/40" />
                    ))}
                </div>
            </div>

            {/* Scale Markers สเกลวัดระดับตามโหมด */}
            <div className="flex justify-between text-[10px] font-mono text-zinc-500 pt-0.5">
                <span>{isTactical ? '[0% SHUTDOWN]' : '0% ชัตดาวน์'}</span>
                <span>{isTactical ? '[25%]' : '25%'}</span>
                <span>{isTactical ? '[50%]' : '50%'}</span>
                <span>{isTactical ? '[75%]' : '75%'}</span>
                <span>{isTactical ? '[100% OPTIMAL]' : '100% เต็มกำลัง'}</span>
            </div>
        </section>
    );
};

