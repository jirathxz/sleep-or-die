import React from 'react';
import { SleepStage } from '@/stores/useSleepStore';

interface StageOverlayProps {
    stage: SleepStage;
}

export const StageOverlay: React.FC<StageOverlayProps> = ({ stage }) => {
    if (stage === 'normal') return null;

    if (stage === 'alert') {
        return (
            <div className="fixed top-0 left-0 right-0 z-40 bg-neutral-900/90 border-b border-amber-500/30 px-4 py-2 text-center text-xs font-mono text-amber-300 backdrop-blur-md flex items-center justify-center gap-2">
                <span>⚠️</span>
                <span>BEDTIME APPROACHING (30m REMAINING) - WIND DOWN ALL WORK</span>
            </div>
        );
    }

    if (stage === 'lockdown') {
        return (
            <div className="pointer-events-none fixed inset-0 z-40">
                {/* Orange vignette border */}
                <div className="absolute inset-0 border-[6px] border-amber-500/40 animate-pulse shadow-[inset_0_0_80px_rgba(245,158,11,0.25)]" />
                <div className="absolute top-0 left-0 right-0 bg-amber-500/95 text-neutral-950 px-4 py-2 text-center text-xs font-mono font-black tracking-widest uppercase shadow-lg">
                    ⚠️ SYSTEM LOCKDOWN: 15 MINUTES BEFORE DEADLINE - SHUTDOWN IMMINENT
                </div>
            </div>
        );
    }

    if (stage === 'sleep') {
        return (
            <div className="pointer-events-none fixed inset-0 z-40">
                {/* Red flashing border */}
                <div className="absolute inset-0 border-[8px] border-red-600/80 animate-ping shadow-[inset_0_0_120px_rgba(220,38,38,0.4)]" />
                <div className="absolute top-0 left-0 right-0 bg-red-600 text-white px-4 py-2 text-center text-xs font-mono font-black tracking-widest uppercase shadow-2xl animate-pulse">
                    🚨 CRITICAL: DEADLINE EXCEEDED! HP IS DRAINING! CONFIRM SLEEP NOW!
                </div>
            </div>
        );
    }

    if (stage === 'shutdown') {
        return (
            <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center text-center p-6 select-none">
                <div className="text-6xl mb-4">💀</div>
                <h1 className="text-3xl md:text-5xl font-black font-mono text-red-600 tracking-wider mb-2">
                    NIGHT SHUTDOWN
                </h1>
                <p className="text-sm font-mono text-neutral-500 max-w-md mb-6">
                    HP depleted to 0%. One strike has been recorded against your account.
                </p>
                <div className="text-xs font-mono text-neutral-600 border border-neutral-900 px-4 py-2 rounded-lg">
                    GO TO SLEEP IMMEDIATELY. SYSTEM WILL REBOOT TOMORROW MORNING.
                </div>
            </div>
        );
    }

    return null;
};
