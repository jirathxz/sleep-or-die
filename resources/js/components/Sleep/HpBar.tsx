import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HeartPulse, Skull, AlertTriangle, ShieldCheck } from 'lucide-react';

interface HpBarProps {
    hp: number;
    stage: string;
}

export const HpBar: React.FC<HpBarProps> = ({ hp, stage }) => {
    const clampedHp = Math.max(0, Math.min(100, hp));

    let barGradient = 'bg-gradient-to-r from-emerald-500 to-green-500';
    let statusText = 'STABLE VITALITY';
    let statusBadgeVariant: 'default' | 'secondary' | 'destructive' | 'outline' = 'outline';
    let statusIcon = <ShieldCheck className="size-3.5 text-emerald-400" />;
    let statusColor = 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';

    if (clampedHp <= 0 || stage === 'shutdown') {
        barGradient = 'bg-neutral-800';
        statusText = 'SYSTEM TERMINATED (0 HP)';
        statusBadgeVariant = 'destructive';
        statusIcon = <Skull className="size-3.5 text-neutral-400" />;
        statusColor = 'text-neutral-400 border-neutral-700 bg-neutral-900';
    } else if (clampedHp <= 30 || stage === 'sleep') {
        barGradient = 'bg-gradient-to-r from-red-600 via-rose-500 to-red-700 animate-pulse';
        statusText = 'CRITICAL FAILURE IMMINENT';
        statusBadgeVariant = 'destructive';
        statusIcon = <AlertTriangle className="size-3.5 text-red-400 animate-bounce" />;
        statusColor = 'text-red-400 border-red-500/50 bg-red-500/10 shadow-lg shadow-red-500/20';
    } else if (clampedHp <= 65 || stage === 'lockdown') {
        barGradient = 'bg-gradient-to-r from-amber-500 to-orange-500';
        statusText = 'LOCKDOWN - HP AT RISK';
        statusBadgeVariant = 'secondary';
        statusIcon = <HeartPulse className="size-3.5 text-amber-400" />;
        statusColor = 'text-amber-400 border-amber-500/40 bg-amber-500/10';
    }

    return (
        <Card className="border-border/60 bg-card/60 backdrop-blur-xl shadow-2xl overflow-hidden relative">
            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-2">
                    <HeartPulse className="size-5 text-primary" />
                    <CardTitle className="text-sm font-mono tracking-wider uppercase font-semibold">
                        Vital Health Matrix
                    </CardTitle>
                </div>

                <Badge variant={statusBadgeVariant} className={`font-mono text-[11px] gap-1.5 px-2.5 py-0.5 uppercase ${statusColor}`}>
                    {statusIcon}
                    {statusText}
                </Badge>
            </CardHeader>

            <CardContent className="space-y-3">
                <div className="flex justify-between items-baseline font-mono">
                    <span className="text-xs text-muted-foreground uppercase tracking-widest">
                        Remaining Capacity
                    </span>
                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black tracking-tight font-mono text-foreground">
                            {clampedHp}
                        </span>
                        <span className="text-xs text-muted-foreground">/ 100 HP</span>
                    </div>
                </div>

                {/* Progress bar container */}
                <div className="relative w-full h-4 bg-muted/50 rounded-full overflow-hidden border border-border/80 p-0.5">
                    <div
                        className={`h-full rounded-full transition-all duration-700 ease-out shadow-md ${barGradient}`}
                        style={{ width: `${clampedHp}%` }}
                    />
                </div>

                <div className="flex justify-between px-1 text-[10px] text-muted-foreground font-mono">
                    <span>0% (DIE)</span>
                    <span>25%</span>
                    <span>50%</span>
                    <span>75%</span>
                    <span>100% (STABLE)</span>
                </div>
            </CardContent>
        </Card>
    );
};
