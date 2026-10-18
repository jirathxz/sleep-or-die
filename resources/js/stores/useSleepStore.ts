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
    discord_bot_token: string | null;
    last_sleep_confirmed_at: string | null;
    level: number;
    exp: number;

    // Derived timer values
    stage: SleepStage;
    totalSecondsRemaining: number;
    hoursRemaining: number;
    minutesRemaining: number;
    secondsRemaining: number;
    isPastDeadline: boolean;
    audioEnabled: boolean;
    simulationActive: boolean;
    simulationPhase: 'idle' | 'countdown_321' | 'grace_30s' | 'shutdown';
    simulationRemaining: number;
    simulationElapsedPast: number;

    // Actions
    syncUser: (data: Partial<SleepState>) => void;
    tick: () => void;
    toggleAudio: (enabled?: boolean) => void;
    startSimulation321: () => void;
    resetSimulation: () => void;
    saveSettings: (wakeUpTime: string, discordUserId?: string, discordBotToken?: string) => Promise<boolean>;
    confirmSleep: () => Promise<boolean>;
    useTicket: () => Promise<boolean>;
    fetchStatus: () => Promise<void>;
    testDiscordConnection: (token?: string, userId?: string) => Promise<{
        success: boolean;
        message: string;
        bot?: { id: string; username: string };
        target_user?: { found: boolean; username?: string; global_name?: string; message?: string } | null;
    }>;
    testAlert: (stage?: string) => Promise<{
        success: boolean;
        message: string;
    }>;
}

function getCsrfToken(): string | null {
    if (typeof document === 'undefined') return null;
    const meta = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (meta) return meta;
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
    if (match) return decodeURIComponent(match[1]);
    return null;
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
    const targetStr = targetTimeString || defaultSleepTarget;
    const now = new Date();
    const parts = targetStr.split(':').map(Number);
    const targetHours = !isNaN(parts[0]) ? parts[0] : 23;
    const targetMinutes = !isNaN(parts[1]) ? parts[1] : 15;

    const target = new Date(now);
    target.setHours(targetHours, targetMinutes, 0, 0);

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
    discord_bot_token: null,
    last_sleep_confirmed_at: null,
    level: 1,
    exp: 150,

    stage: 'normal',
    totalSecondsRemaining: 86400,
    hoursRemaining: 24,
    minutesRemaining: 0,
    secondsRemaining: 0,
    isPastDeadline: false,
    audioEnabled: true,
    simulationActive: false,
    simulationPhase: 'idle',
    simulationRemaining: 0,
    simulationElapsedPast: 0,

    syncUser: (data) => {
        set((state) => {
            const currentHp = data.current_hp ?? state.current_hp;
            const isDisabled = data.is_disabled ?? state.is_disabled;
            const wakeUp = data.wake_up_time || state.wake_up_time || defaultWakeUp;
            const target = data.sleep_target_time || state.sleep_target_time || calculateSleepTargetLocal(wakeUp);

            // If simulation is running, do NOT clobber running simulation countdown!
            if (state.simulationActive) {
                return {
                    ...data,
                    wake_up_time: wakeUp,
                    sleep_target_time: target,
                    current_hp: state.current_hp,
                    is_disabled: isDisabled,
                };
            }

            const timer = calculateTimeRemaining(target);
            const newStage = determineStage(currentHp, isDisabled, timer.totalSeconds);

            return {
                ...data,
                wake_up_time: wakeUp,
                sleep_target_time: target,
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
            simulationPhase: 'countdown_321',
            simulationRemaining: 3,
            totalSecondsRemaining: 3,
            hoursRemaining: 0,
            minutesRemaining: 0,
            secondsRemaining: 3,
            isPastDeadline: false,
            stage: 'lockdown',
            current_hp: 100,
        });
    },

    resetSimulation: () => {
        audioManager.stopAllAudio();
        const target = get().sleep_target_time || defaultSleepTarget;
        const timer = calculateTimeRemaining(target);
        const newStage = determineStage(100, false, timer.totalSeconds);
        set({
            simulationActive: false,
            simulationPhase: 'idle',
            simulationRemaining: 0,
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
            simulationPhase,
            simulationRemaining,
            sleep_target_time,
            current_hp,
            is_disabled,
            last_sleep_confirmed_at,
            stage: oldStage,
            audioEnabled,
        } = get();

        if (simulationActive) {
            if (simulationPhase === 'countdown_321') {
                const next = simulationRemaining - 1;
                if (next > 0) {
                    if (audioEnabled) {
                        audioManager.playAlertChime();
                    }
                    set({
                        simulationRemaining: next,
                        secondsRemaining: next,
                        totalSecondsRemaining: next,
                        hoursRemaining: 0,
                        minutesRemaining: 0,
                        isPastDeadline: false,
                        stage: 'lockdown',
                    });
                    return;
                } else {
                    // Reached deadline (0): transition into 30s emergency window
                    if (audioEnabled) {
                        audioManager.startEmergencyAlarm();
                    }
                    set({
                        simulationPhase: 'grace_30s',
                        simulationRemaining: 30,
                        secondsRemaining: 30,
                        totalSecondsRemaining: 0,
                        hoursRemaining: 0,
                        minutesRemaining: 0,
                        isPastDeadline: true,
                        stage: 'sleep',
                        current_hp: 100,
                    });
                    return;
                }
            } else if (simulationPhase === 'grace_30s') {
                const next = simulationRemaining - 1;
                const safeSeconds = Math.max(0, next);
                const newHp = Math.max(0, Math.round((safeSeconds / 30) * 100));
                const newStage = safeSeconds <= 0 || newHp <= 0 ? 'shutdown' : 'sleep';

                if (newStage === 'shutdown' && oldStage !== 'shutdown') {
                    if (audioEnabled) {
                        audioManager.playShutdownSound();
                    }
                }

                set({
                    simulationPhase: newStage === 'shutdown' ? 'shutdown' : 'grace_30s',
                    simulationRemaining: safeSeconds,
                    secondsRemaining: safeSeconds,
                    totalSecondsRemaining: -(30 - safeSeconds),
                    hoursRemaining: 0,
                    minutesRemaining: 0,
                    current_hp: newHp,
                    stage: newStage,
                    isPastDeadline: true,
                });
                return;
            } else {
                return;
            }
        }

        const target = sleep_target_time || defaultSleepTarget;
        const timer = calculateTimeRemaining(target);
        let activeHp = current_hp;
        let displaySeconds = timer.seconds;
        let displayMinutes = timer.minutes;
        let displayHours = timer.hours;

        if (timer.isPast && !last_sleep_confirmed_at) {
            // Bedtime breached: exactly 30 seconds emergency countdown before HP hits 0
            const elapsed = Math.abs(timer.totalSeconds);
            const emergencySecondsLeft = Math.max(0, 30 - elapsed);
            activeHp = Math.max(0, Math.round((emergencySecondsLeft / 30) * 100));
            displaySeconds = emergencySecondsLeft;
            displayMinutes = 0;
            displayHours = 0;
        }

        const newStage = determineStage(activeHp, is_disabled, timer.totalSeconds);

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
            current_hp: activeHp,
            stage: newStage,
            totalSecondsRemaining: timer.totalSeconds,
            hoursRemaining: displayHours,
            minutesRemaining: displayMinutes,
            secondsRemaining: displaySeconds,
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

    saveSettings: async (wakeUpTime: string, discordUserId?: string, discordBotToken?: string) => {
        try {
            const calculatedTarget = calculateSleepTargetLocal(wakeUpTime);
            const csrfToken = getCsrfToken();

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
                        discord_bot_token: discordBotToken,
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
                discord_bot_token: discordBotToken || null,
            });
            return true;
        } catch {
            return false;
        }
    },

    confirmSleep: async () => {
        try {
            const csrfToken = getCsrfToken();
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
            const { level, exp } = get();
            let newExp = (exp || 0) + 150;
            let currentLvl = level || 1;
            let threshold = currentLvl * 500;
            while (newExp >= threshold) {
                newExp -= threshold;
                currentLvl += 1;
                threshold = currentLvl * 500;
            }

            get().syncUser({
                last_sleep_confirmed_at: new Date().toISOString(),
                level: currentLvl,
                exp: newExp,
            });
            return true;
        } catch {
            return false;
        }
    },

    useTicket: async () => {
        try {
            const csrfToken = getCsrfToken();

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

    testDiscordConnection: async (token?: string, userId?: string) => {
        try {
            const csrfToken = getCsrfToken();
            const res = await fetch('/sleep/test-discord', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...(csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {}),
                },
                body: JSON.stringify({
                    discord_bot_token: token ?? get().discord_bot_token,
                    discord_user_id: userId ?? get().discord_user_id,
                }),
            });

            const data = await res.json();
            if (data.success) {
                if (token) set({ discord_bot_token: token });
                if (userId) set({ discord_user_id: userId });
            }
            return data;
        } catch (e: any) {
            return {
                success: false,
                message: 'ไม่สามารถส่งคำขอตรวจสอบไปยังเซิร์ฟเวอร์ได้ ' + (e?.message || ''),
            };
        }
    },

    testAlert: async (stage = 'deadline') => {
        try {
            const csrfToken = getCsrfToken();
            const res = await fetch('/sleep/test-alert', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...(csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {}),
                },
                body: JSON.stringify({ stage }),
            });

            return await res.json();
        } catch (e: any) {
            return {
                success: false,
                message: 'ไม่สามารถส่งการแจ้งเตือนได้: ' + (e?.message || ''),
            };
        }
    },
}));
