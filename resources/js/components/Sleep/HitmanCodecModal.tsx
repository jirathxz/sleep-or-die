import React, { useEffect } from 'react';
import { useSleepStore } from '@/stores/useSleepStore';
import { useTranslation } from '@/lib/i18n';
import { Moon, Radio, X } from 'lucide-react';

interface HitmanCodecModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirmSleep: () => void;
    secondsRemaining: number;
}

export const HitmanCodecModal: React.FC<HitmanCodecModalProps> = ({
    isOpen,
    onClose,
    onConfirmSleep,
    secondsRemaining,
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

    // Automatically close when countdown has expired (<= 0) after 1 second grace
    useEffect(() => {
        if (isOpen && secondsRemaining <= 0) {
            const timer = setTimeout(() => {
                onClose();
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [isOpen, secondsRemaining, onClose]);

    if (!isOpen) return null;

    const pad = (n: number) => n.toString().padStart(2, '0');
    const displayTime = `00:${pad(Math.max(0, secondsRemaining))}`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md select-none">
            {/* CRT Scanline Simulation Overlay */}
            <div
                className="absolute inset-0 pointer-events-none opacity-40"
                style={{
                    backgroundImage:
                        'repeating-linear-gradient(transparent, transparent 2px, rgba(0, 40, 10, 0.5) 2px, rgba(0, 40, 10, 0.5) 4px)',
                }}
            />

            <div className="relative z-10 w-full max-w-lg bg-[#08120a] border-2 border-emerald-500/60 rounded-xl p-6 text-center shadow-[0_0_50px_rgba(16,185,129,0.3)] animate-in fade-in zoom-in-95 duration-200">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-emerald-500/70 hover:text-emerald-300 p-1 rounded-md hover:bg-emerald-950/50 transition-colors"
                    aria-label="Close transmission"
                >
                    <X className="size-5" />
                </button>

                {/* Codec Header */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-emerald-950/70 border border-emerald-500/30 text-emerald-400 font-mono text-xs tracking-widest mb-4">
                    <Radio className="size-3.5 animate-pulse text-emerald-400" />
                    <span>CODEC FREQ: 140.85 [BIG BOSS TRANSMISSION]</span>
                </div>

                {/* Snake / Big Boss Salute GIF with Night Vision Green CRT Filter */}
                <div className="relative mx-auto w-64 h-36 rounded-lg overflow-hidden border-2 border-emerald-500/50 shadow-inner bg-black mb-4">
                    <img
                        src="https://media1.tenor.com/m/3t_DdMd5vYwAAAAd/metal-gear.gif"
                        alt="Metal Gear Snake Salute"
                        className="w-full h-full object-cover"
                        style={{
                            filter: 'sepia(100%) hue-rotate(90deg) saturate(280%) contrast(1.15)',
                        }}
                    />
                    <div className="absolute inset-0 bg-emerald-500/10 mix-blend-overlay pointer-events-none" />
                </div>

                {/* Title & Transmission Message */}
                <h2 className="text-xl font-bold tracking-wider text-emerald-400 font-mono mb-2">
                    WHEN YOU CAN'T EVEN SLEEP...
                </h2>

                <div className="bg-black/60 border border-emerald-900/60 rounded p-3 text-xs text-emerald-200/90 font-mono leading-relaxed mb-5 text-left">
                    <p className="text-emerald-400 font-bold mb-1">
                        "SNAKE, YOU'VE BEEN AWAKE TOO LONG! MISSION TIMEOUT IMMINENT."
                    </p>
                    <p className="text-zinc-400 font-light text-[11px]">
                        บิ๊กบอส คุณตื่นอยู่นานเกินไปแล้ว! เวลาสำหรับภารกิจใกล้จะหมดลงทุกที รีบยืนยันการนอนก่อนสัญญาณขาดหาย!
                    </p>
                </div>

                {/* Big Final Countdown Timer */}
                <div className="text-5xl font-mono font-bold tracking-widest text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)] mb-6">
                    {displayTime}
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                        onClick={async () => {
                            onClose();
                            await onConfirmSleep();
                        }}
                        className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs tracking-wide transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)] cursor-pointer"
                    >
                        <Moon className="size-4" />
                        <span>{isTactical ? '[ INITIATE CRYOSLEEP NOW ]' : '[ เข้าใจแล้ว ยืนยันการนอนทันที ]'}</span>
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full sm:w-auto px-4 py-3 rounded-lg border border-emerald-500/30 text-emerald-400/80 hover:text-emerald-300 hover:bg-emerald-950/40 font-mono text-xs tracking-wider transition-colors cursor-pointer"
                    >
                        {isTactical ? '[ DISMISS CODEC ]' : '[ ปิดการติดต่อ ]'}
                    </button>
                </div>
            </div>
        </div>
    );
};
