import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { SleepStage } from '@/stores/useSleepStore';
import { AlertTriangle, Siren, Skull } from 'lucide-react';

interface StageOverlayProps {
    stage: SleepStage;
}

export const StageOverlay: React.FC<StageOverlayProps> = ({ stage }) => {
    if (stage === 'normal') return null;

    if (stage === 'alert') {
        return (
            <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-4 animate-in fade-in slide-in-from-top-4 duration-300">
                <Alert className="border-amber-500/40 bg-card/95 text-foreground backdrop-blur-xl shadow-xl flex items-center gap-3">
                    <AlertTriangle className="size-5 text-amber-400 shrink-0" />
                    <div>
                        <AlertTitle className="font-mono text-xs font-bold text-amber-400 uppercase tracking-wider">
                            Bedtime Approaching (30m Remaining)
                        </AlertTitle>
                        <AlertDescription className="font-mono text-[11px] text-muted-foreground">
                            Wind down your tasks and prepare to shut off your monitors.
                        </AlertDescription>
                    </div>
                </Alert>
            </div>
        );
    }

    if (stage === 'lockdown') {
        return (
            <div className="pointer-events-none fixed inset-0 z-40">
                {/* Orange glowing border */}
                <div className="absolute inset-0 border-[6px] border-amber-500/40 animate-pulse shadow-[inset_0_0_80px_rgba(245,158,11,0.25)]" />
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-full max-w-xl px-4 pointer-events-auto">
                    <Alert className="border-orange-500/50 bg-card/95 text-foreground backdrop-blur-xl shadow-2xl flex items-center gap-3">
                        <Siren className="size-5 text-orange-400 animate-spin shrink-0" />
                        <div>
                            <AlertTitle className="font-mono text-xs font-bold text-orange-400 uppercase tracking-wider">
                                Stage 2: Lockdown Protocol Active (15m)
                            </AlertTitle>
                            <AlertDescription className="font-mono text-[11px] text-muted-foreground">
                                High urgency! Sleep deadline arrives shortly.
                            </AlertDescription>
                        </div>
                    </Alert>
                </div>
            </div>
        );
    }

    if (stage === 'sleep') {
        return (
            <div className="pointer-events-none fixed inset-0 z-40">
                {/* Red pulsing emergency vignette */}
                <div className="absolute inset-0 border-[8px] border-red-600/80 animate-ping shadow-[inset_0_0_120px_rgba(220,38,38,0.4)]" />
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-full max-w-xl px-4 pointer-events-auto">
                    <Alert variant="destructive" className="bg-destructive/90 text-white backdrop-blur-xl shadow-2xl animate-bounce flex items-center gap-3">
                        <AlertTriangle className="size-6 text-white shrink-0 animate-pulse" />
                        <div>
                            <AlertTitle className="font-mono text-xs font-black uppercase tracking-widest">
                                Critical Alert: Deadline Exceeded!
                            </AlertTitle>
                            <AlertDescription className="font-mono text-[11px] text-white/90">
                                HP is draining rapidly. Confirm sleep now before reaching 0 HP!
                            </AlertDescription>
                        </div>
                    </Alert>
                </div>
            </div>
        );
    }

    if (stage === 'shutdown') {
        return (
            <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center text-center p-6 select-none animate-in fade-in duration-500">
                <Skull className="size-16 text-destructive mb-4 animate-pulse" />
                <h1 className="text-3xl md:text-5xl font-black font-mono text-destructive tracking-widest uppercase mb-2">
                    Night Shutdown
                </h1>
                <p className="text-sm font-mono text-muted-foreground max-w-md mb-6">
                    HP depleted to 0%. One strike has been recorded against your account.
                </p>
                <div className="text-xs font-mono text-muted-foreground/80 border border-border px-5 py-2.5 rounded-full bg-card/50">
                    GO TO SLEEP. SYSTEM WILL RESET TOMORROW MORNING.
                </div>
            </div>
        );
    }

    return null;
};
