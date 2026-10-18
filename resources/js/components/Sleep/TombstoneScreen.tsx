import React from 'react';
import { router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skull, LogOut, Flame, ShieldAlert } from 'lucide-react';

interface TombstoneScreenProps {
    daysSurvived: number;
    userName: string;
}

export const TombstoneScreen: React.FC<TombstoneScreenProps> = ({ daysSurvived, userName }) => {
    const handleLogout = () => {
        router.post('/logout');
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-6 text-center select-none overflow-y-auto animate-in fade-in duration-700">
            <Card className="max-w-md w-full border-destructive/50 bg-card/90 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
                <CardHeader className="flex flex-col items-center pb-2 pt-8">
                    <div className="size-16 rounded-2xl bg-destructive/10 border border-destructive/30 flex items-center justify-center text-destructive mb-3">
                        <Skull className="size-8" />
                    </div>

                    <Badge variant="destructive" className="font-mono text-xs tracking-widest uppercase mb-1">
                        PERMADEATH STRIKE LIMIT EXCEEDED
                    </Badge>

                    <CardTitle className="text-2xl font-mono font-black tracking-tight uppercase text-destructive">
                        Account Terminated
                    </CardTitle>

                    <CardDescription className="text-xs font-mono text-muted-foreground">
                        Disciplinary Failure Protocol Enforced
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 pt-4">
                    <div className="rounded-xl border border-border/80 bg-background/50 p-4 space-y-2.5 text-xs font-mono text-left">
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">DECEASED:</span>
                            <span className="font-bold text-foreground">{userName}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground flex items-center gap-1.5">
                                <Flame className="size-3.5 text-orange-400" />
                                PEAK SURVIVAL:
                            </span>
                            <span className="font-bold text-emerald-400">{daysSurvived} Days</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground flex items-center gap-1.5">
                                <ShieldAlert className="size-3.5 text-destructive" />
                                CAUSE:
                            </span>
                            <span className="font-bold text-destructive">5 Shutdown Strikes</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">ACCOUNT STATUS:</span>
                            <span className="font-black text-destructive">DISABLED</span>
                        </div>
                    </div>

                    <p className="text-xs text-muted-foreground font-mono leading-relaxed px-2">
                        คุณถูกระงับบัญชีอย่างถาวรเนื่องจากสะสมความล้มเหลวครบ 5 ครั้ง ผิดเจตนารมณ์ในการปรับพฤติกรรมการนอน
                    </p>
                </CardContent>

                <CardFooter className="pt-2 pb-6 flex justify-center">
                    <Button
                        variant="outline"
                        onClick={handleLogout}
                        className="w-full font-mono text-xs uppercase tracking-wider gap-2 border-border hover:bg-destructive/10 hover:text-destructive"
                    >
                        <LogOut className="size-4" />
                        Sign Out (ยอมรับผลกรรม)
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};
