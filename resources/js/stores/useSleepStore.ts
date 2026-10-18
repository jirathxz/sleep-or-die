import { create } from 'zustand';
import { audioManager } from '@/lib/audioManager';

export type SleepStage = 'normal' | 'alert' | 'lockdown' | 'sleep' | 'shutdown';

export interface SleepState {
    current_hp: number;
    wake_up_time: string | null;
    sleep_target_time: string | null;
    shutdown_stacks: number;
    days_survived: number;
    tickets_count: number;
    is_disabled: boolean;
    discord_user_id: string | null;
    last_sleep_confirmed_at: string | null;

    // Derived timer values
    stage: SleepStage;
    totalSecondsRemaining: number;
    hoursRemaining: number;
    minutesRemaining: number;
    secondsRemaining: number;
    isPastDeadline: boolean;
    audioEnabled: boolean;

    // Actions
    syncUser: (data: Partial<SleepState>) => void;
    tick: () => void;
    toggleAudio: (enabled?: boolean) => void;
    saveSettings: (wakeUpTime: string, discordUserId?: string) => Promise<boolean>;
    confirmSleep: () => Promise<boolean>;
    useTicket: () => Promise<boolean>;
    fetchStatus: () => Promise<void>;
}

function calculateTimeRemaining(targetTimeString: string | null): {
    totalSeconds: number;
    hours: number;
    minutes: number;
    seconds: number;
    isPast: boolean;
} {
    if (!targetTimeString) {
        return { totalSeconds: 86400, hours: 24, minutes: 0, seconds: 0, isPast: false };
    }

    const now = new Date();
    const [hours, minutes] = targetTimeString.split(':').map(Number);

    const target = new Date(now);
    target.setHours(hours, minutes, 0, 0);

    // If target was early morning and now is late evening, or vice versa, adjust day
    let diffSeconds = Math.floor((target.getTime() - now.getTime()) / 1000);

    // If deadline was more than 12 hours ago, assume it's for today/tomorrow
    if (diffSeconds < -43200) {
        target.setDate(target.getDate() + 1);
        diffSeconds = Math.floor((target.getTime() - now.getTime()) / 1000);
    } else if (diffSeconds > 43200) {
        target.setDate(target.getDate() - 1);
        diffSeconds = Math.floor((target.getTime() - now.getTime()) / 1000);
    }

    const isPast = diffSeconds <= 0;
    const absSeconds = Math.abs(diffSeconds);

    return {
        totalSeconds: diffSeconds,
        hours: Math.floor(absSeconds / 3600),
        minutes: Math.floor((absSeconds % 3600) / 60),
        seconds: absSeconds % 60,
        isPast,
    };
}

function determineStage(
    currentHp: number,
    isDisabled: boolean,
    totalSecondsRemaining: number
): SleepStage {
    if (isDisabled || currentHp <= 0) {
        return 'shutdown';
    }

    if (totalSecondsRemaining <= 0) {
        return 'sleep';
    }

    if (totalSecondsRemaining <= 900) {
        // <= 15 minutes
        return 'lockdown';
    }

    if (totalSecondsRemaining <= 1800) {
        // <= 30 minutes
        return 'alert';
    }

    return 'normal';
}

export const useSleepStore = create<SleepState>((set, get) => ({
    current_hp: 100,
    wake_up_time: null,
    sleep_target_time: null,
    shutdown_stacks: 0,
    days_survived: 0,
    tickets_count: 0,
    is_disabled: false,
    discord_user_id: null,
    last_sleep_confirmed_at: null,

    stage: 'normal',
    totalSecondsRemaining: 86400,
    hoursRemaining: 24,
    minutesRemaining: 0,
    secondsRemaining: 0,
    isPastDeadline: false,
    audioEnabled: true,

    syncUser: (data) => {
        set((state) => {
            const currentHp = data.current_hp ?? state.current_hp;
            const isDisabled = data.is_disabled ?? state.is_disabled;
            const target = data.sleep_target_time !== undefined ? data.sleep_target_time : state.sleep_target_time;

            const timer = calculateTimeRemaining(target);
            const newStage = determineStage(currentHp, isDisabled, timer.totalSeconds);

            return {
                ...data,
                stage: newStage,
                totalSecondsRemaining: timer.totalSeconds,
                hoursRemaining: timer.hours,
                minutesRemaining: timer.minutes,
                secondsRemaining: timer.seconds,
                isPastDeadline: timer.isPast,
            };
        });
    },

    tick: () => {
        const { sleep_target_time, current_hp, is_disabled, stage: oldStage, audioEnabled } = get();
        const timer = calculateTimeRemaining(sleep_target_time);
        const newStage = determineStage(current_hp, is_disabled, timer.totalSeconds);

        if (newStage !== oldStage) {
            if (audioEnabled) {
                if (newStage === 'alert') {
                    audioManager.playAlertChime();
                } else if (newStage === 'lockdown') {
                    audioManager.startLockdownHeartbeat();
                } else if (newStage === 'sleep') {
                    audioManager.startEmergencyAlarm();
                } else if (newStage === 'shutdown') {
                    audioManager.playShutdownSound();
                } else if (newStage === 'normal') {
                    audioManager.stopAllAudio();
                }
            }
        }

        set({
            stage: newStage,
            totalSecondsRemaining: timer.totalSeconds,
            hoursRemaining: timer.hours,
            minutesRemaining: timer.minutes,
            secondsRemaining: timer.seconds,
            isPastDeadline: timer.isPast,
        });
    },

    toggleAudio: (enabled) => {
        const next = enabled !== undefined ? enabled : !get().audioEnabled;
        if (!next) {
            audioManager.stopAllAudio();
        }
        set({ audioEnabled: next });
    },

    saveSettings: async (wakeUpTime: string, discordUserId?: string) => {
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const res = await fetch('/sleep/settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                },
                body: JSON.stringify({
                    wake_up_time: wakeUpTime,
                    discord_user_id: discordUserId,
                }),
            });

            if (!res.ok) return false;
            const data = await res.json();
            get().syncUser(data);
            return true;
        } catch {
            return false;
        }
    },

    confirmSleep: async () => {
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const res = await fetch('/sleep/confirm', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                },
            });

            if (!res.ok) return false;
            const data = await res.json();
            audioManager.stopAllAudio();
            get().syncUser(data);
            return true;
        } catch {
            return false;
        }
    },

    useTicket: async () => {
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const res = await fetch('/sleep/ticket', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                },
            });

            if (!res.ok) return false;
            const data = await res.json();
            if (data.success) {
                set((state) => ({
                    sleep_target_time: data.new_sleep_target_time,
                    tickets_count: data.remaining_tickets,
                }));
                get().tick();
                return true;
            }
            return false;
        } catch {
            return false;
        }
    },

    fetchStatus: async () => {
        try {
            const res = await fetch('/sleep/status', {
                headers: { Accept: 'application/json' },
            });
            if (res.ok) {
                const data = await res.json();
                get().syncUser(data);
            }
        } catch {
            // Offline or unauthenticated
        }
    },
}));
