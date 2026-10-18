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
    simulationActive: boolean;
    simulationElapsedPast: number;

    // Actions
    syncUser: (data: Partial<SleepState>) => void;
    tick: () => void;
    toggleAudio: (enabled?: boolean) => void;
    startSimulation321: () => void;
    resetSimulation: () => void;
    saveSettings: (wakeUpTime: string, discordUserId?: string) => Promise<boolean>;
    confirmSleep: () => Promise<boolean>;
    useTicket: () => Promise<boolean>;
    fetchStatus: () => Promise<void>;
}

function calculateSleepTargetLocal(wakeUpTime: string, cycles: number = 5): string {
    const [hours, minutes] = wakeUpTime.split(':').map(Number);
    const date = new Date();
    date.setHours(hours || 7, minutes || 0, 0, 0);
    const totalMinutesToSubtract = (cycles * 90) + 15;
    date.setMinutes(date.getMinutes() - totalMinutesToSubtract);
    const h = date.getHours().toString().padStart(2, '0');
    const m = date.getMinutes().toString().padStart(2, '0');
    return `${h}:${m}`;
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

const defaultWakeUp = '07:00';
const defaultSleepTarget = calculateSleepTargetLocal(defaultWakeUp);

export const useSleepStore = create<SleepState>((set, get) => ({
    current_hp: 100,
    wake_up_time: defaultWakeUp,
    sleep_target_time: defaultSleepTarget,
    shutdown_stacks: 0,
    days_survived: 3, // Initial demo streak for guests
    tickets_count: 1, // 1 emergency ticket
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
    simulationActive: false,
    simulationElapsedPast: 0,

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

    startSimulation321: () => {
        audioManager.stopAllAudio();
        if (get().audioEnabled) {
            audioManager.playAlertChime();
        }
        set({
            simulationActive: true,
            simulationElapsedPast: 0,
            totalSecondsRemaining: 3,
            hoursRemaining: 0,
            minutesRemaining: 0,
            secondsRemaining: 3,
            isPastDeadline: false,
            stage: 'lockdown',
        });
    },

    resetSimulation: () => {
        audioManager.stopAllAudio();
        const { sleep_target_time } = get();
        const timer = calculateTimeRemaining(sleep_target_time);
        const newStage = determineStage(100, false, timer.totalSeconds);
        set({
            simulationActive: false,
            simulationElapsedPast: 0,
            current_hp: 100,
            stage: newStage,
            totalSecondsRemaining: timer.totalSeconds,
            hoursRemaining: timer.hours,
            minutesRemaining: timer.minutes,
            secondsRemaining: timer.seconds,
            isPastDeadline: timer.isPast,
        });
    },

    tick: () => {
        const {
            simulationActive,
            simulationElapsedPast,
            sleep_target_time,
            current_hp,
            is_disabled,
            totalSecondsRemaining,
            stage: oldStage,
            audioEnabled,
        } = get();

        if (simulationActive) {
            if (totalSecondsRemaining > 1) {
                const nextSec = totalSecondsRemaining - 1;
                if (audioEnabled) {
                    audioManager.playAlertChime();
                }
                set({
                    totalSecondsRemaining: nextSec,
                    secondsRemaining: nextSec,
                    hoursRemaining: 0,
                    minutesRemaining: 0,
                    isPastDeadline: false,
                    stage: 'lockdown',
                });
                return;
            } else if (totalSecondsRemaining === 1) {
                if (audioEnabled) {
                    audioManager.startEmergencyAlarm();
                }
                set({
                    totalSecondsRemaining: 0,
                    secondsRemaining: 0,
                    hoursRemaining: 0,
                    minutesRemaining: 0,
                    isPastDeadline: true,
                    stage: 'sleep',
                    simulationElapsedPast: 1,
                });
                return;
            } else {
                // Past deadline during simulation: HP drains visibly by 4% per second
                const newElapsed = (simulationElapsedPast || 0) + 1;
                const newHp = Math.max(0, current_hp - 4);
                const newStage = determineStage(newHp, is_disabled, 0);

                if (newStage === 'shutdown' && oldStage !== 'shutdown') {
                    if (audioEnabled) {
                        audioManager.playShutdownSound();
                    }
                }

                set({
                    current_hp: newHp,
                    stage: newStage,
                    isPastDeadline: true,
                    simulationElapsedPast: newElapsed,
                    totalSecondsRemaining: -newElapsed,
                    secondsRemaining: newElapsed % 60,
                    minutesRemaining: Math.floor(newElapsed / 60),
                    hoursRemaining: 0,
                });
                return;
            }
        }

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
            const calculatedTarget = calculateSleepTargetLocal(wakeUpTime);
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

            // Attempt server save if authenticated
            if (csrfToken) {
                const res = await fetch('/sleep/settings', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': csrfToken,
                    },
                    body: JSON.stringify({
                        wake_up_time: wakeUpTime,
                        discord_user_id: discordUserId,
                    }),
                });

                if (res.ok) {
                    const data = await res.json();
                    get().syncUser(data);
                    return true;
                }
            }

            // Local fallback for guest
            get().syncUser({
                wake_up_time: wakeUpTime,
                sleep_target_time: calculatedTarget,
                discord_user_id: discordUserId || null,
            });
            return true;
        } catch {
            return false;
        }
    },

    confirmSleep: async () => {
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            audioManager.stopAllAudio();

            if (csrfToken) {
                const res = await fetch('/sleep/confirm', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': csrfToken,
                    },
                });

                if (res.ok) {
                    const data = await res.json();
                    get().syncUser(data);
                    return true;
                }
            }

            // Local fallback for guest
            get().syncUser({
                last_sleep_confirmed_at: new Date().toISOString(),
            });
            return true;
        } catch {
            return false;
        }
    },

    useTicket: async () => {
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

            if (csrfToken) {
                const res = await fetch('/sleep/ticket', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': csrfToken,
                    },
                });

                if (res.ok) {
                    const data = await res.json();
                    if (data.success) {
                        set({
                            sleep_target_time: data.new_sleep_target_time,
                            tickets_count: data.remaining_tickets,
                        });
                        get().tick();
                        return true;
                    }
                }
            }

            // Local fallback for guest
            const { tickets_count, sleep_target_time } = get();
            if (tickets_count > 0 && sleep_target_time) {
                const [h, m] = sleep_target_time.split(':').map(Number);
                const d = new Date();
                d.setHours(h, m + 30, 0, 0);
                const newTarget = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
                set({
                    sleep_target_time: newTarget,
                    tickets_count: tickets_count - 1,
                });
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
            // Guest mode
        }
    },
}));
