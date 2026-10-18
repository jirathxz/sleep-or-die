import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Flame, Ticket, Skull, AlertCircle } from 'lucide-react';

interface StatsBadgeProps {
    daysSurvived: number;
    shutdownStacks: number;
    ticketsCount: number;
    onUseTicket: () => void;
    stage: string;
}

export const StatsBadge: React.FC<StatsBadgeProps> = ({
    daysSurvived,
    shutdownStacks,
    ticketsCount,
    onUseTicket,
    stage,
}) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
            {/* Days Survived Card */}
            <Card className="border-border/60 bg-card/60 backdrop-blur-xl shadow-lg">
                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-xs font-mono uppercase text-muted-foreground tracking-wider">
                        Days Survived
                    </CardTitle>
                    <div className="size-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                        <Flame className="size-4" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-black font-mono text-foreground">
                        {daysSurvived}{' '}
                        <span className="text-xs font-normal text-muted-foreground">Days</span>
                    </div>
                    <p className="text-[11px] text-emerald-400 font-mono mt-1">
                        +1 Ticket every 7-day streak
                    </p>
                </CardContent>
            </Card>

            {/* Shutdown Strikes Gauge Card */}
            <Card className="border-border/60 bg-card/60 backdrop-blur-xl shadow-lg flex flex-col justify-between">
                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-xs font-mono uppercase text-muted-foreground tracking-wider">
                        Shutdown Strikes
                    </CardTitle>
                    <Badge variant={shutdownStacks >= 4 ? 'destructive' : 'secondary'} className="font-mono text-xs">
                        {shutdownStacks} / 5
                    </Badge>
                </CardHeader>
                <CardContent className="space-y-2">
                    {/* Visual Strike Blocks */}
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((index) => {
                            const filled = index <= shutdownStacks;
                            return (
                                <div
                                    key={index}
                                    className={`h-2.5 flex-1 rounded-sm transition-all duration-300 ${
                                        filled
                                            ? 'bg-destructive shadow-sm shadow-destructive/50'
                                            : 'bg-muted border border-border/80'
                                    }`}
                                />
                            );
                        })}
                    </div>
                    <p className="text-[10px] text-muted-foreground font-mono">
                        {shutdownStacks >= 4
                            ? '⚠️ 1 STRIKE AWAY FROM PERMADEATH'
                            : '5 strikes = Account Termination'}
                    </p>
                </CardContent>
            </Card>

            {/* Ticket Extension Widget Card */}
            <Card className="border-border/60 bg-card/60 backdrop-blur-xl shadow-lg flex flex-col justify-between">
                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-xs font-mono uppercase text-muted-foreground tracking-wider">
                        Extension Tickets
                    </CardTitle>
                    <div className="size-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                        <Ticket className="size-4" />
                    </div>
                </CardHeader>
                <CardContent className="flex items-center justify-between pt-1">
                    <div>
                        <div className="text-3xl font-black font-mono text-amber-400">
                            {ticketsCount}
                        </div>
                        <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                            +30 mins per ticket
                        </p>
                    </div>

                    <Button
                        size="sm"
                        variant="outline"
                        onClick={onUseTicket}
                        disabled={ticketsCount <= 0 || stage === 'shutdown'}
                        className="font-mono text-xs border-amber-500/30 text-amber-400 hover:bg-amber-500/10 hover:text-amber-300 disabled:opacity-30"
                    >
                        <Ticket className="size-3.5 mr-1.5" />
                        Use Ticket
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};
