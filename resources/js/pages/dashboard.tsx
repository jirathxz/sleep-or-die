import React, { useEffect, useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { CountdownDisplay } from '@/components/Sleep/CountdownDisplay';
import { HpBar } from '@/components/Sleep/HpBar';
import { SettingsModal } from '@/components/Sleep/SettingsModal';
import { StageOverlay } from '@/components/Sleep/StageOverlay';
import { StatsBadge } from '@/components/Sleep/StatsBadge';
import { TombstoneScreen } from '@/components/Sleep/TombstoneScreen';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { dashboard } from '@/routes';
import { useSleepStore } from '@/stores/useSleepStore';
import { Volume2, VolumeX, Settings, Hourglass, Shield, ShieldAlert } from 'lucide-react';

interface PageProps {
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
            current_hp?: number;
            wake_up_time?: string | null;
            sleep_target_time?: string | null;
            shutdown_stacks?: number;
            days_survived?: number;
            tickets_count?: number;
            is_disabled?: boolean;
            discord_user_id?: string | null;
            last_sleep_confirmed_at?: string | null;
        };
    };
    [key: string]: unknown;
}

export default function Dashboard() {
    const { auth } = usePage<PageProps>().props;
    const [settingsOpen, setSettingsOpen] = useState(false);

    const {
        current_hp,
        wake_up_time,
        sleep_target_time,
        shutdown_stacks,
        days_survived,
        tickets_count,
        is_disabled,
        discord_user_id,
        last_sleep_confirmed_at,
        stage,
        hoursRemaining,
        minutesRemaining,
        secondsRemaining,
        isPastDeadline,
        audioEnabled,
        syncUser,
        tick,
        toggleAudio,
        saveSettings,
        confirmSleep,
        useTicket,
        fetchStatus,
    } = useSleepStore();

    useEffect(() => {
        if (auth?.user) {
            syncUser({
                current_hp: auth.user.current_hp ?? 100,
                wake_up_time: auth.user.wake_up_time ?? '07:00',
                sleep_target_time: auth.user.sleep_target_time ?? '23:15',
                shutdown_stacks: auth.user.shutdown_stacks ?? 0,
                days_survived: auth.user.days_survived ?? 0,
                tickets_count: auth.user.tickets_count ?? 0,
                is_disabled: auth.user.is_disabled ?? false,
                discord_user_id: auth.user.discord_user_id ?? null,
                last_sleep_confirmed_at: auth.user.last_sleep_confirmed_at ?? null,
            });
        }

        fetchStatus();

        const timer = setInterval(() => {
            tick();
        }, 1000);

        return () => clearInterval(timer);
    }, [auth, syncUser, tick, fetchStatus]);

    if (is_disabled) {
        return <TombstoneScreen daysSurvived={days_survived} userName={auth?.user?.name || 'Subject'} />;
    }

    return (
        <>
            <Head title="SleepOrDie - Hardcore Sleep Accountability" />

            <StageOverlay stage={stage} />

            <div className="min-h-screen bg-background text-foreground p-4 md:p-8 flex flex-col justify-between selection:bg-primary selection:text-primary-foreground">
                {/* Header with shadcn Button and Badge */}
                <header className="max-w-4xl w-full mx-auto flex items-center justify-between pb-6 border-b border-border/80">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-sm">
                            <Hourglass className="size-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-lg md:text-xl font-black font-mono tracking-tight text-foreground uppercase">
                                    Sleep Or Die
                                </h1>
                                <Badge variant="secondary" className="font-mono text-[10px] px-1.5 py-0 uppercase">
                                    v1.0-shadcn
                                </Badge>
                            </div>
                            <p className="text-[11px] font-mono text-muted-foreground">
                                Hardcore Biological Discipline Protocol
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {auth?.user ? (
                            <span className="text-xs font-mono text-muted-foreground hidden sm:inline mr-2">
                                Operator: <span className="font-bold text-foreground">{auth.user.name}</span>
                            </span>
                        ) : (
                            <div className="flex items-center gap-1.5 mr-1">
                                <Button variant="ghost" size="sm" asChild className="font-mono text-xs">
                                    <Link href="/login">Log in</Link>
                                </Button>
                                <Button size="sm" asChild className="font-mono text-xs font-bold">
                                    <Link href="/register">Register</Link>
                                </Button>
                            </div>
                        )}

                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => toggleAudio()}
                            className="size-9 rounded-xl border-border/80"
                            title={audioEnabled ? 'Mute Audio' : 'Unmute Audio'}
                        >
                            {audioEnabled ? (
                                <Volume2 className="size-4 text-emerald-400" />
                            ) : (
                                <VolumeX className="size-4 text-muted-foreground" />
                            )}
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSettingsOpen(true)}
                            className="font-mono text-xs gap-2 rounded-xl border-border/80"
                        >
                            <Settings className="size-3.5" />
                            <span className="hidden sm:inline">Settings</span>
                        </Button>
                    </div>
                </header>

                {/* Main Dashboard Space */}
                <main className="max-w-4xl w-full mx-auto my-8 space-y-6">
                    {/* Vitality Matrix HP Bar */}
                    <HpBar hp={current_hp} stage={stage} />

                    {/* Countdown Display & Action Button */}
                    <CountdownDisplay
                        hours={hoursRemaining}
                        minutes={minutesRemaining}
                        seconds={secondsRemaining}
                        isPastDeadline={isPastDeadline}
                        stage={stage}
                        sleepTargetTime={sleep_target_time}
                        wakeUpTime={wake_up_time}
                        onConfirmSleep={confirmSleep}
                        lastConfirmedAt={last_sleep_confirmed_at}
                    />

                    {/* Gamification Badges & Strike Counter */}
                    <StatsBadge
                        daysSurvived={days_survived}
                        shutdownStacks={shutdown_stacks}
                        ticketsCount={tickets_count}
                        onUseTicket={useTicket}
                        stage={stage}
                    />
                </main>

                {/* Footer with shadcn Badges and Separator */}
                <footer className="max-w-4xl w-full mx-auto pt-6 border-t border-border/80 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-muted-foreground gap-3">
                    <div className="flex items-center gap-2">
                        <Shield className="size-3.5 text-primary" />
                        <span>Discord Guard:</span>
                        <Badge variant="outline" className="font-mono text-[10px]">
                            {discord_user_id ? `Target ID: ${discord_user_id}` : 'Unbound'}
                        </Badge>
                    </div>

                    <div className="flex items-center gap-2">
                        <ShieldAlert className="size-3.5 text-destructive" />
                        <span>Account Status:</span>
                        <Badge variant={shutdown_stacks >= 4 ? 'destructive' : 'secondary'} className="font-mono text-[10px]">
                            {shutdown_stacks} / 5 strikes
                        </Badge>
                    </div>
                </footer>

                {/* Settings Configuration Modal */}
                <SettingsModal
                    isOpen={settingsOpen}
                    onClose={() => setSettingsOpen(false)}
                    currentWakeUpTime={wake_up_time}
                    currentDiscordId={discord_user_id}
                    audioEnabled={audioEnabled}
                    onToggleAudio={toggleAudio}
                    onSave={saveSettings}
                />
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'SleepOrDie',
            href: dashboard(),
        },
    ],
};
