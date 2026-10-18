import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SleepStage } from '@/stores/useSleepStore';
import { Clock, Moon, ShieldAlert, Sparkles, Loader2 } from 'lucide-react';

interface CountdownDisplayProps {
    hours: number;
    minutes: number;
    seconds: number;
    isPastDeadline: boolean;
    stage: SleepStage;
    sleepTargetTime: string | null;
    wakeUpTime: string | null;
    onConfirmSleep: () => void;
    lastConfirmedAt: string | null;
}

export const CountdownDisplay: React.FC<CountdownDisplayProps> = ({
    hours,
    minutes,
    seconds,
    isPastDeadline,
    stage,
    sleepTargetTime,
    wakeUpTime,
    onConfirmSleep,
    lastConfirmedAt,
}) => {
    const pad = (n: number) => n.toString().padStart(2, '0');

    let badgeText = 'BEDTIME PROTOCOL ACTIVE';
    let badgeVariant: 'default' | 'secondary' | 'destructive' | 'outline' = 'secondary';
    let badgeClass = 'text-muted-foreground border-border bg-secondary/50';
    let digitsColor = 'text-foreground';

    if (stage === 'alert') {
        badgeText = 'STAGE 1: APPROACHING BEDTIME (30M)';
        badgeVariant = 'secondary';
        badgeClass = 'text-amber-400 border-amber-500/40 bg-amber-500/10';
        digitsColor = 'text-amber-400';
    } else if (stage === 'lockdown') {
        badgeText = 'STAGE 2: SYSTEM LOCKDOWN (15M)';
        badgeVariant = 'destructive';
        badgeClass = 'text-orange-400 border-orange-500/50 bg-orange-500/10 shadow-md shadow-orange-500/20';
        digitsColor = 'text-orange-400';
    } else if (stage === 'sleep') {
        badgeText = 'STAGE 3: DEADLINE EXCEEDED // DRAINING HP';
        badgeVariant = 'destructive';
        badgeClass = 'text-red-400 border-red-500/60 bg-red-500/20 animate-pulse';
        digitsColor = 'text-red-500 animate-pulse';
    } else if (stage === 'shutdown') {
        badgeText = 'STAGE 4: NIGHT SHUTDOWN (HP 0)';
        badgeVariant = 'outline';
        badgeClass = 'text-neutral-500 border-neutral-700 bg-neutral-900';
        digitsColor = 'text-neutral-600';
    }

    const isVerifying = Boolean(lastConfirmedAt);

    return (
        <Card className="border-border/60 bg-card/60 backdrop-blur-xl shadow-2xl relative overflow-hidden text-center transition-all duration-500">
            <CardHeader className="flex flex-col items-center pb-2 pt-6">
                <Badge variant={badgeVariant} className={`font-mono text-xs px-3.5 py-1 tracking-widest gap-2 uppercase ${badgeClass}`}>
                    <Clock className="size-3.5" />
                    {badgeText}
                </Badge>
            </CardHeader>

            <CardContent className="space-y-6 pt-2 pb-8">
                {/* Digits Display */}
                <div className="flex items-center justify-center gap-2 md:gap-5 my-2">
                    <div className="flex flex-col items-center">
                        <span className={`text-6xl md:text-8xl font-black font-mono tracking-tight ${digitsColor}`}>
                            {pad(hours)}
                        </span>
                        <span className="text-[10px] font-mono uppercase text-muted-foreground tracking-widest mt-1">
                            Hours
                        </span>
                    </div>

                    <span className={`text-5xl md:text-7xl font-bold font-mono pb-6 ${digitsColor}`}>:</span>

                    <div className="flex flex-col items-center">
                        <span className={`text-6xl md:text-8xl font-black font-mono tracking-tight ${digitsColor}`}>
                            {pad(minutes)}
                        </span>
                        <span className="text-[10px] font-mono uppercase text-muted-foreground tracking-widest mt-1">
                            Minutes
                        </span>
                    </div>

                    <span className={`text-5xl md:text-7xl font-bold font-mono pb-6 ${digitsColor}`}>:</span>

                    <div className="flex flex-col items-center">
                        <span className={`text-6xl md:text-8xl font-black font-mono tracking-tight ${digitsColor}`}>
                            {pad(seconds)}
                        </span>
                        <span className="text-[10px] font-mono uppercase text-muted-foreground tracking-widest mt-1">
                            Seconds
                        </span>
                    </div>
                </div>

                {/* Sub schedule details with shadcn Separator */}
                <div className="flex justify-center items-center gap-6 text-xs text-muted-foreground font-mono pt-4">
                    <div>
                        Target Sleep: <span className="font-bold text-foreground">{sleepTargetTime || '--:--'}</span>
                    </div>
                    <Separator orientation="vertical" className="h-4" />
                    <div>
                        Target Wake: <span className="font-bold text-foreground">{wakeUpTime || '--:--'}</span>
                    </div>
                </div>

                {/* Action button using shadcn Button */}
                <div className="max-w-md mx-auto pt-2">
                    {isVerifying ? (
                        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono flex items-center justify-center gap-3">
                            <Loader2 className="size-4 animate-spin text-amber-400" />
                            <span>DISCORD PRESENCE VERIFICATION IN PROGRESS (10M)</span>
                        </div>
                    ) : (
                        <Button
                            size="lg"
                            onClick={onConfirmSleep}
                            disabled={stage === 'shutdown'}
                            variant={stage === 'sleep' ? 'destructive' : 'default'}
                            className={`w-full py-6 text-base font-mono font-bold tracking-wide transition-all shadow-xl ${
                                stage === 'sleep'
                                    ? 'bg-red-600 hover:bg-red-500 text-white animate-bounce'
                                    : stage === 'lockdown'
                                      ? 'bg-amber-500 hover:bg-amber-400 text-black font-black'
                                      : 'bg-primary text-primary-foreground'
                            }`}
                        >
                            <Moon className="size-5 mr-2" />
                            Confirm Sleep (เข้าสู่นิทรา)
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
