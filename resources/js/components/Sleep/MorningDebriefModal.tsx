import React, { useEffect } from 'react';
import { DebriefData } from '@/stores/useSleepStore';
import { useTranslation } from '@/lib/i18n';
import { Award, CheckCircle2, Flame, Gift, Sparkles, X } from 'lucide-react';

interface MorningDebriefModalProps {
    isOpen: boolean;
    data: DebriefData | null;
    onClose: () => void;
}

export const MorningDebriefModal: React.FC<MorningDebriefModalProps> = ({
    isOpen,
    data,
    onClose,
}) => {
    const { isTactical } = useTranslation();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen || !data) return null;

    const rankColorClass =
        data.rank === 'S'
            ? 'text-amber-400 drop-shadow-[0_0_25px_rgba(251,191,36,0.6)]'
            : data.rank === 'A'
            ? 'text-emerald-400 drop-shadow-[0_0_20px_rgba(52,211,153,0.5)]'
            : 'text-sky-400 drop-shadow-[0_0_15px_rgba(56,189,248,0.4)]';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm select-none">
            <div className="relative w-full max-w-lg bg-[#0e140e] border border-emerald-500/40 border-t-4 border-t-emerald-400 rounded-xl p-6 sm:p-7 shadow-[0_15px_50px_rgba(0,0,0,0.95)] animate-in fade-in zoom-in-95 duration-200 text-center">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-md hover:bg-zinc-800/50 transition-colors"
                    aria-label="Close modal"
                >
                    <X className="size-5" />
                </button>

                {/* Header */}
                <div className="text-xs font-mono font-semibold tracking-wider text-emerald-400 uppercase mb-1">
                    // {isTactical ? 'MISSION DEBRIEFING' : 'สรุปผลภารกิจยามเช้า'}
                </div>
                <h2 className="text-lg font-bold text-white tracking-wide">
                    {isTactical ? 'MISSION ACCOMPLISHED' : 'ภารกิจสำเร็จ • เข้านอนตรงเวลา'}
                </h2>

                {/* New Record Badge */}
                {data.isNewRecord && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 mt-2 rounded bg-amber-500/15 border border-amber-500/40 text-amber-400 font-mono text-xs font-bold tracking-wider animate-pulse">
                        <Sparkles className="size-3.5" />
                        <span>{isTactical ? '[ NEW TOP RECORD! ]' : '[ สถิติสูงสุดใหม่! ]'}</span>
                    </div>
                )}

                {/* Huge Rank Display */}
                <div className="my-5 p-4 rounded-lg bg-black/50 border border-emerald-500/20">
                    <div className={`text-6xl font-mono font-black tracking-widest ${rankColorClass}`}>
                        {data.rank}
                    </div>
                    <div className="font-mono text-xs tracking-widest text-zinc-300 mt-1 uppercase">
                        {data.rankTitle}
                    </div>
                </div>

                {/* Mission Details Box */}
                <div className="space-y-2 bg-black/40 border border-emerald-950/80 rounded-lg p-3.5 text-xs font-mono mb-5 text-left">
                    <div className="flex justify-between items-center text-zinc-400">
                        <span>[TARGET TIME] {isTactical ? 'TARGET' : 'เวลาเป้าหมาย'}:</span>
                        <span className="text-zinc-200 font-semibold">{data.targetTime}</span>
                    </div>
                    <div className="flex justify-between items-center text-zinc-400">
                        <span>[ACTUAL SLEEP] {isTactical ? 'SLEEP TIME' : 'เข้านอนจริง'}:</span>
                        <span className="text-zinc-200 font-semibold">{data.actualSleepTime}</span>
                    </div>
                    <div className="flex justify-between items-center text-zinc-400">
                        <span>[REST DURATION] {isTactical ? 'DURATION' : 'พักผ่อน'}:</span>
                        <span className="text-zinc-200 font-semibold">{data.durationHours}</span>
                    </div>
                    <div className="flex justify-between items-center text-zinc-400">
                        <span>[STREAK] {isTactical ? 'SURVIVAL STREAK' : 'นอนตรงเวลาต่อเนื่อง'}:</span>
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <Flame className="size-3.5" />
                            {data.streak} {isTactical ? 'DAYS' : 'วันติด'}
                        </span>
                    </div>
                    <div className="flex justify-between items-center text-zinc-400">
                        <span>[TOP RECORD] {isTactical ? 'BEST STREAK' : 'สถิติสูงสุด'}:</span>
                        <span className="text-amber-400 font-semibold">{data.bestStreak} {isTactical ? 'DAYS' : 'วัน'}</span>
                    </div>

                    {/* Rewards Summary */}
                    <div className="border-t border-dashed border-emerald-500/20 pt-2.5 mt-2 flex justify-between items-start text-zinc-300">
                        <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                            <Gift className="size-3.5" />
                            <span>{isTactical ? 'REWARDS' : 'รางวัลที่ได้รับ'}:</span>
                        </span>
                        <span className="text-right text-emerald-300 font-medium">
                            +50 EXP
                            {data.bonusExp > 0 && ` (+${data.bonusExp} ${data.rank}-Rank)`}
                            {data.itemsGiven.length > 0 && `, ${data.itemsGiven.join(', ')}`}
                        </span>
                    </div>
                </div>

                {/* Primary Action Button */}
                <button
                    onClick={onClose}
                    className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] cursor-pointer"
                >
                    <CheckCircle2 className="size-4" />
                    <span>{isTactical ? '[ CLAIM REWARDS & START DAY ]' : '[ รับรางวัลและเริ่มวันใหม่ ]'}</span>
                </button>
            </div>
        </div>
    );
};
