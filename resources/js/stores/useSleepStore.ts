import { create } from 'zustand';
import { audioManager } from '@/lib/audioManager';

export type SleepStage = 'normal' | 'alert' | 'lockdown' | 'sleep' | 'shutdown';

export interface AlertSyncState {
    phase: 'idle' | 'alert' | 'acknowledged_alert' | 'lockdown' | 'acknowledged_lockdown' | 'sleep_warning' | 'shutdown';
    seconds_remaining: number;
    total_seconds: number;
    is_paused: boolean;
    step_index: number;
    step_title: string;
    step_message: string;
    acknowledged: boolean;
    updated_at?: string;
}

export interface CppPresenceState {
    is_pc_online: boolean;
    idle_seconds: number | null;
    screen_locked: boolean;
    status: string;
    updated_at: string | null;
}

export interface InventoryItem {
    id: string;
    item_id: string;
    label: string;
    slots: number;
    description: string;
    acquired_at?: string;
}

export interface SleepHistoryItem {
    id: string;
    date: string;
    date_display?: string;
    target_time: string;
    actual_time: string;
    wake_time?: string;
    duration: string;
    duration_hours?: number;
    status: 'ON_TIME' | 'LATE' | 'MISSED' | string;
    status_label?: string;
    status_color?: string;
    reward: string;
    life_change?: string;
}

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
    points: number;
    emergency_countdown_seconds: number;
    is_in_voice: boolean;
    voice_channel: string | null;
    enable_discord_detection: boolean;
    enable_cpp_detection: boolean;
    is_system_active: boolean;

    // Theme & UI Preferences
    theme_preference: 'dark' | 'special';
    border_style: 'rounded' | 'sharp';

    // Black Market Inventory & Capacity
    inventory: InventoryItem[];
    inventory_capacity: number;
    used_slots: number;

    // Sleep Mission History
    sleep_history: SleepHistoryItem[];

    // Real-time synchronization state
    alert_state: AlertSyncState;
    cpp_presence: CppPresenceState;

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
    setThemePreference: (theme: 'dark' | 'special') => Promise<void>;
    setBorderStyle: (style: 'rounded' | 'sharp') => Promise<void>;
    buyShopItem: (itemId: string) => Promise<{ success: boolean; message: string }>;
    useInventoryItem: (itemInstanceId: string) => Promise<{ success: boolean; message: string }>;
    saveSettings: (
        wakeUpTime?: string | null,
        discordUserId?: string,
        discordBotToken?: string,
        emergencyCountdownSeconds?: number,
        sleepTargetTime?: string | null,
        enableDiscordDetection?: boolean,
        enableCppDetection?: boolean,
        themePreference?: 'dark' | 'special',
        borderStyle?: 'rounded' | 'sharp'
    ) => Promise<boolean>;
    confirmSleep: () => Promise<boolean>;
    useTicket: () => Promise<boolean>;
    redeemTicket: () => Promise<boolean>;
    fetchStatus: () => Promise<void>;
    triggerAlertSequence: (seconds?: number) => Promise<boolean>;
    acknowledgeAlert: () => Promise<boolean>;
    acknowledgeLockdown: () => Promise<boolean>;
    acknowledgeSleepWarning: () => Promise<boolean>;
    resetAlertSequence: () => Promise<boolean>;
    resetHp: () => Promise<boolean>;
    toggleAlertPause: () => Promise<boolean>;
    setQuickBedtime: (minutesFromNow: number) => Promise<boolean>;
    testDiscordConnection: (token?: string, userId?: string) => Promise<{
        success: boolean;
        message: string;
        bot?: { id: string; username: string };
        target_user?: {
            found: boolean;
            username?: string;
            global_name?: string;
            message?: string;
            raw_status?: string;
            is_in_voice?: boolean;
            voice_channel?: string;
            is_considered_online?: boolean;
            reason?: string;
        } | null;
    }>;
    testAlert: (stage?: string, token?: string, userId?: string) => Promise<{
        success: boolean;
        message: string;
        error_code?: number;
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

    // If target on the current day has already passed by more than 30 minutes,
    // the deadline has elapsed and belongs to the next occurrence (tomorrow).
    if (diffSeconds < -1800) {
        target.setDate(target.getDate() + 1);
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

    if (totalSecondsRemaining <= 300) {
        // <= 5 minutes (Lockdown stage)
        return 'lockdown';
    }

    if (totalSecondsRemaining <= 600) {
        // <= 10 minutes (Alert stage)
        return 'alert';
    }

    return 'normal';
}

const defaultWakeUp = '07:00';
const defaultSleepTarget = calculateSleepTargetLocal(defaultWakeUp);

function applyDomThemeAndCorners(theme?: 'dark' | 'special', border?: 'rounded' | 'sharp') {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    if (theme === 'special') {
        root.classList.add('theme-special');
        root.setAttribute('data-theme', 'special');
    } else if (theme === 'dark') {
        root.classList.remove('theme-special');
        root.removeAttribute('data-theme');
    }

    if (border === 'sharp') {
        root.classList.add('corners-sharp');
        root.setAttribute('data-corners', 'sharp');
    } else if (border === 'rounded') {
        root.classList.remove('corners-sharp');
        root.removeAttribute('data-corners');
    }
}

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
    exp: 225, // default to 225 EXP to match tactical screenshot
    points: 100,
    emergency_countdown_seconds: 60,
    is_in_voice: false,
    voice_channel: null,
    enable_discord_detection: true,
    enable_cpp_detection: true,
    is_system_active: true,

    theme_preference: 'dark',
    border_style: 'rounded',
    inventory: [
        {
            id: 'item_ration_init_1',
            item_id: 'ration_supply',
            label: '[ RATION SUPPLY ]',
            slots: 2,
            description: 'ขนาด: 2 ช่อง | ฟื้นฟู LIFE +30% & ขยายเวลา +5 นาที',
        },
        {
            id: 'item_spray_init_1',
            item_id: 'first_aid_spray',
            label: '[ FIRST AID SPRAY ]',
            slots: 1,
            description: 'ขนาด: 1 ช่อง | ฟื้นฟูพลังชีวิตฉุกเฉิน LIFE +50%',
        },
        {
            id: 'item_spray_init_2',
            item_id: 'first_aid_spray',
            label: '[ FIRST AID SPRAY ]',
            slots: 1,
            description: 'ขนาด: 1 ช่อง | ฟื้นฟูพลังชีวิตฉุกเฉิน LIFE +50%',
        },
    ],
    inventory_capacity: 12,
    used_slots: 4,
    sleep_history: [],

    alert_state: {
        phase: 'idle',
        seconds_remaining: 60,
        total_seconds: 60,
        is_paused: false,
        step_index: 0,
        step_title: '',
        step_message: '',
        acknowledged: false,
    },
    cpp_presence: {
        is_pc_online: false,
        idle_seconds: null,
        screen_locked: false,
        status: 'offline',
        updated_at: null,
    },

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

            const themePref = (data as any).theme_preference ?? state.theme_preference ?? 'dark';
            const borderStyle = (data as any).border_style ?? state.border_style ?? 'rounded';
            applyDomThemeAndCorners(themePref, borderStyle);

            const inventory = (data as any).inventory ?? state.inventory ?? [];
            const capacity = (data as any).inventory_capacity ?? state.inventory_capacity ?? 12;
            const usedSlots = inventory.reduce((sum: number, it: any) => sum + (it.slots || 0), 0);
            const history = (data as any).sleep_history ?? state.sleep_history ?? [];

            const enableDiscord = data.enable_discord_detection !== undefined
                ? Boolean(data.enable_discord_detection)
                : (state.enable_discord_detection ?? true);
            const enableCpp = data.enable_cpp_detection !== undefined
                ? Boolean(data.enable_cpp_detection)
                : (state.enable_cpp_detection ?? true);
            const isSystemActive = (data as any).is_system_active !== undefined
                ? Boolean((data as any).is_system_active)
                : (enableDiscord || enableCpp);

            const presence = (data as any).discord_presence;
            const isInVoice = Boolean(enableDiscord && (presence?.is_in_voice ?? (data as any).is_in_voice ?? state.is_in_voice));
            const voiceChannel = presence?.voice_channel ?? (data as any).voice_channel ?? state.voice_channel;

            const cppPresence = (data as any).cpp_presence ?? state.cpp_presence;
            const isPcOnline = Boolean(enableCpp && cppPresence?.is_pc_online);
            const alertState = (data as any).alert_state ?? state.alert_state;

            // Rule: หากอยู่ในห้องคุยไม่ถือว่านอน, หาก C++ ตรวจพบว่า PC ออนไลน์ไม่ถือว่านอน, หรือหากไม่ได้เปิดใช้งานระบบเลย
            const lastConfirmed = (!isSystemActive || isInVoice || isPcOnline)
                ? null
                : (data.last_sleep_confirmed_at !== undefined ? data.last_sleep_confirmed_at : state.last_sleep_confirmed_at);

            // If system inactive, reset audio and maintain normal stage
            if (!isSystemActive) {
                audioManager.stopAllAudio();
                const timer = calculateTimeRemaining(target);
                return {
                    ...data,
                    theme_preference: themePref,
                    border_style: borderStyle,
                    inventory,
                    inventory_capacity: capacity,
                    used_slots: usedSlots,
                    sleep_history: history,
                    enable_discord_detection: enableDiscord,
                    enable_cpp_detection: enableCpp,
                    is_system_active: false,
                    is_in_voice: isInVoice,
                    voice_channel: voiceChannel,
                    cpp_presence: cppPresence,
                    alert_state: alertState,
                    last_sleep_confirmed_at: null,
                    wake_up_time: wakeUp,
                    sleep_target_time: target,
                    current_hp: 100,
                    stage: 'normal',
                    totalSecondsRemaining: timer.totalSeconds,
                    hoursRemaining: timer.hours,
                    minutesRemaining: timer.minutes,
                    secondsRemaining: timer.seconds,
                    isPastDeadline: false,
                };
            }

            // If simulation is running, do NOT clobber running simulation countdown!
            if (state.simulationActive) {
                return {
                    ...data,
                    theme_preference: themePref,
                    border_style: borderStyle,
                    inventory,
                    inventory_capacity: capacity,
                    used_slots: usedSlots,
                    sleep_history: history,
                    enable_discord_detection: enableDiscord,
                    enable_cpp_detection: enableCpp,
                    is_system_active: true,
                    is_in_voice: isInVoice,
                    voice_channel: voiceChannel,
                    cpp_presence: cppPresence,
                    alert_state: alertState,
                    last_sleep_confirmed_at: lastConfirmed,
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
                theme_preference: themePref,
                border_style: borderStyle,
                inventory,
                inventory_capacity: capacity,
                used_slots: usedSlots,
                sleep_history: history,
                enable_discord_detection: enableDiscord,
                enable_cpp_detection: enableCpp,
                is_system_active: isSystemActive,
                is_in_voice: isInVoice,
                voice_channel: voiceChannel,
                cpp_presence: cppPresence,
                alert_state: alertState,
                last_sleep_confirmed_at: lastConfirmed,
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
                    // Reached deadline (0): transition into emergency window
                    const countdownSec = get().emergency_countdown_seconds || 60;
                    if (audioEnabled) {
                        audioManager.startEmergencyAlarm();
                    }
                    set({
                        simulationPhase: 'grace_30s',
                        simulationRemaining: countdownSec,
                        secondsRemaining: countdownSec,
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
                const countdownSec = get().emergency_countdown_seconds || 60;
                const next = simulationRemaining - 1;
                const safeSeconds = Math.max(0, next);
                const newHp = Math.max(0, Math.round((safeSeconds / countdownSec) * 100));
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
                    totalSecondsRemaining: -(countdownSec - safeSeconds),
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

        // 1. Alert sequence real countdown ticking
        const { alert_state } = get();
        if (alert_state && alert_state.phase !== 'idle' && !alert_state.is_paused) {
            const currentSec = alert_state.seconds_remaining ?? 60;
            const nextSec = currentSec - 1;
            if (nextSec > 0) {
                set({
                    alert_state: {
                        ...alert_state,
                        seconds_remaining: nextSec,
                    },
                });
            } else {
                // Countdown reached 0: auto-escalate!
                if (alert_state.phase === 'alert') {
                    get().acknowledgeAlert();
                } else if (alert_state.phase === 'lockdown' || alert_state.phase === 'acknowledged_alert') {
                    get().acknowledgeSleepWarning();
                } else if (alert_state.phase === 'sleep_warning' || alert_state.phase === 'acknowledged_lockdown') {
                    const csrfToken = getCsrfToken();
                    fetch('/sleep/alert-action', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            ...(csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {}),
                        },
                        body: JSON.stringify({ action: 'shutdown' }),
                    }).then(res => res.json()).then(data => {
                        if (data.alert_state) set({ alert_state: data.alert_state, current_hp: 0, stage: 'shutdown' });
                    }).catch(() => {});
                }
            }
        }

        const target = sleep_target_time || defaultSleepTarget;
        const timer = calculateTimeRemaining(target);

        // If system is disabled (neither Discord nor C++ enabled), pause enforcement!
        if (get().is_system_active === false) {
            audioManager.stopAllAudio();
            set({
                stage: 'normal',
                current_hp: 100,
                totalSecondsRemaining: timer.totalSeconds,
                hoursRemaining: timer.hours,
                minutesRemaining: timer.minutes,
                secondsRemaining: timer.seconds,
                isPastDeadline: timer.isPast,
            });
            return;
        }

        let activeHp = current_hp;
        let displaySeconds = timer.seconds;
        let displayMinutes = timer.minutes;
        let displayHours = timer.hours;

        if (timer.isPast && !last_sleep_confirmed_at) {
            // Bedtime breached: dynamic emergency countdown before HP hits 0
            const countdownSec = get().emergency_countdown_seconds || 60;
            const elapsed = Math.abs(timer.totalSeconds);
            const emergencySecondsLeft = Math.max(0, countdownSec - elapsed);
            activeHp = Math.max(0, Math.round((emergencySecondsLeft / countdownSec) * 100));
            displaySeconds = emergencySecondsLeft;
            displayMinutes = 0;
            displayHours = 0;

            if (emergencySecondsLeft <= 0 && activeHp <= 0 && current_hp > 0) {
                const csrfToken = getCsrfToken();
                fetch('/sleep/alert-action', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        ...(csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {}),
                    },
                    body: JSON.stringify({ action: 'shutdown' }),
                }).then(res => res.json()).then(data => {
                    if (data.alert_state) set({ alert_state: data.alert_state, current_hp: 0, stage: 'shutdown' });
                }).catch(() => {});
            }
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

    saveSettings: async (
        wakeUpTime?: string | null,
        discordUserId?: string,
        discordBotToken?: string,
        emergencyCountdownSeconds?: number,
        sleepTargetTime?: string | null,
        enableDiscordDetection?: boolean,
        enableCppDetection?: boolean,
        themePreference?: 'dark' | 'special',
        borderStyle?: 'rounded' | 'sharp'
    ) => {
        try {
            let calculatedTarget = sleepTargetTime || null;
            let finalWakeUp = wakeUpTime || null;

            if (finalWakeUp && !calculatedTarget) {
                calculatedTarget = calculateSleepTargetLocal(finalWakeUp);
            } else if (calculatedTarget && !finalWakeUp) {
                const [h, m] = calculatedTarget.split(':').map(Number);
                const d = new Date();
                d.setHours(h || 23, m || 0, 0, 0);
                d.setMinutes(d.getMinutes() + (5 * 90) + 15);
                finalWakeUp = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
            }

            const currentTheme = themePreference ?? get().theme_preference;
            const currentBorder = borderStyle ?? get().border_style;
            applyDomThemeAndCorners(currentTheme, currentBorder);

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
                        wake_up_time: finalWakeUp,
                        sleep_target_time: calculatedTarget,
                        discord_user_id: discordUserId,
                        discord_bot_token: discordBotToken,
                        emergency_countdown_seconds: emergencyCountdownSeconds,
                        enable_discord_detection: enableDiscordDetection,
                        enable_cpp_detection: enableCppDetection,
                        theme_preference: currentTheme,
                        border_style: currentBorder,
                    }),
                });

                if (res.ok) {
                    const data = await res.json();
                    get().syncUser(data);
                    return true;
                } else {
                    return false;
                }
            }

            // Local fallback for guest
            get().syncUser({
                wake_up_time: finalWakeUp || defaultWakeUp,
                sleep_target_time: calculatedTarget || defaultSleepTarget,
                discord_user_id: discordUserId || null,
                discord_bot_token: discordBotToken || null,
                emergency_countdown_seconds: emergencyCountdownSeconds || 60,
                enable_discord_detection: enableDiscordDetection ?? true,
                enable_cpp_detection: enableCppDetection ?? true,
                theme_preference: currentTheme,
                border_style: currentBorder,
            });
            return true;
        } catch {
            return false;
        }
    },

    confirmSleep: async () => {
        try {
            if (get().is_in_voice) {
                alert(`คุณกำลังอยู่ในห้องคุยเสียง Discord ${get().voice_channel ? `("${get().voice_channel}")` : ''} ไม่สามารถยืนยันการนอนได้! กรุณาออกจากห้องคุยก่อน`);
                return false;
            }

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
                } else {
                    const err = await res.json().catch(() => ({}));
                    alert(err.message || 'ไม่สามารถยืนยันการนอนได้');
                    return false;
                }
            }

            // Local fallback for guest
            const { level, exp, points } = get();
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
                points: (points || 0) + 50,
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

    redeemTicket: async () => {
        try {
            const csrfToken = getCsrfToken();

            if (csrfToken) {
                const res = await fetch('/sleep/redeem-ticket', {
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
                            points: data.points,
                            tickets_count: data.tickets_count,
                        });
                        return true;
                    }
                }
            }

            // Local fallback for guest
            const { points, tickets_count } = get();
            if ((points ?? 0) >= 100) {
                set({
                    points: (points ?? 0) - 100,
                    tickets_count: (tickets_count ?? 0) + 1,
                });
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

    triggerAlertSequence: async (seconds = 60) => {
        try {
            const csrfToken = getCsrfToken();
            const res = await fetch('/sleep/alert-action', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...(csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {}),
                },
                body: JSON.stringify({ action: 'trigger', seconds }),
            });
            if (res.ok) {
                const data = await res.json();
                if (data.alert_state) {
                    set({ alert_state: data.alert_state });
                }
                return true;
            }
            return false;
        } catch {
            return false;
        }
    },

    acknowledgeAlert: async () => {
        try {
            const csrfToken = getCsrfToken();
            const res = await fetch('/sleep/alert-action', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...(csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {}),
                },
                body: JSON.stringify({ action: 'acknowledge' }),
            });
            if (res.ok) {
                const data = await res.json();
                if (data.alert_state) {
                    set({ alert_state: data.alert_state });
                }
                return true;
            }
            return false;
        } catch {
            return false;
        }
    },

    acknowledgeLockdown: async () => {
        try {
            const csrfToken = getCsrfToken();
            const res = await fetch('/sleep/alert-action', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...(csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {}),
                },
                body: JSON.stringify({ action: 'acknowledge_lockdown' }),
            });
            if (res.ok) {
                const data = await res.json();
                if (data.alert_state) {
                    set({ alert_state: data.alert_state });
                }
                return true;
            }
            return false;
        } catch {
            return false;
        }
    },

    acknowledgeSleepWarning: async () => {
        try {
            const csrfToken = getCsrfToken();
            const res = await fetch('/sleep/alert-action', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...(csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {}),
                },
                body: JSON.stringify({ action: 'acknowledge_sleep_warning' }),
            });
            if (res.ok) {
                const data = await res.json();
                if (data.alert_state) {
                    set({ alert_state: data.alert_state });
                }
                if (data.current_hp !== undefined) {
                    set({ current_hp: data.current_hp });
                }
                return true;
            }
            return false;
        } catch {
            return false;
        }
    },

    resetAlertSequence: async () => {
        try {
            const csrfToken = getCsrfToken();
            const res = await fetch('/sleep/alert-action', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...(csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {}),
                },
                body: JSON.stringify({ action: 'reset' }),
            });
            if (res.ok) {
                const data = await res.json();
                if (data.alert_state) {
                    set({ alert_state: data.alert_state });
                }
                return true;
            }
            return false;
        } catch {
            return false;
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

    testAlert: async (stage = 'test', token?: string, userId?: string) => {
        try {
            const csrfToken = getCsrfToken();
            const res = await fetch('/sleep/test-alert', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...(csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {}),
                },
                body: JSON.stringify({
                    stage,
                    discord_bot_token: token ?? get().discord_bot_token,
                    discord_user_id: userId ?? get().discord_user_id,
                }),
            });

            const data = await res.json();
            if (data.discord_bot_token !== undefined || data.discord_user_id !== undefined) {
                set({
                    discord_bot_token: data.discord_bot_token ?? get().discord_bot_token,
                    discord_user_id: data.discord_user_id ?? get().discord_user_id,
                });
            }
            return data;
        } catch (e: any) {
            return {
                success: false,
                message: 'ไม่สามารถส่งการแจ้งเตือนได้: ' + (e?.message || ''),
            };
        }
    },

    resetHp: async () => {
        try {
            audioManager.stopAllAudio();
            const csrfToken = getCsrfToken();
            if (csrfToken) {
                const res = await fetch('/sleep/reset-hp', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': csrfToken,
                    },
                });
                if (res.ok) {
                    const data = await res.json();
                    set({
                        current_hp: 100,
                        shutdown_stacks: 0,
                        is_disabled: false,
                        stage: 'normal',
                        alert_state: data.alert_state || {
                            phase: 'idle',
                            seconds_remaining: 60,
                            total_seconds: 60,
                            is_paused: false,
                            step_index: 0,
                            step_title: '',
                            step_message: '',
                            acknowledged: false,
                        },
                    });
                    if (get().audioEnabled) {
                        audioManager.playLevelUpChime();
                    }
                    return true;
                }
            }

            // Guest fallback
            set({
                current_hp: 100,
                shutdown_stacks: 0,
                is_disabled: false,
                stage: 'normal',
                alert_state: {
                    phase: 'idle',
                    seconds_remaining: 60,
                    total_seconds: 60,
                    is_paused: false,
                    step_index: 0,
                    step_title: '',
                    step_message: '',
                    acknowledged: false,
                },
            });
            if (get().audioEnabled) {
                audioManager.playLevelUpChime();
            }
            return true;
        } catch {
            return false;
        }
    },

    toggleAlertPause: async () => {
        try {
            const { alert_state } = get();
            if (!alert_state || alert_state.phase === 'idle') return false;

            const nextPaused = !alert_state.is_paused;
            set({
                alert_state: {
                    ...alert_state,
                    is_paused: nextPaused,
                },
            });

            const csrfToken = getCsrfToken();
            if (csrfToken) {
                fetch('/sleep/alert-action', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': csrfToken,
                    },
                    body: JSON.stringify({ action: 'toggle_pause' }),
                }).catch(() => {});
            }
            return true;
        } catch {
            return false;
        }
    },

    setQuickBedtime: async (minutesFromNow: number) => {
        try {
            const now = new Date();
            now.setMinutes(now.getMinutes() + minutesFromNow);
            const h = now.getHours().toString().padStart(2, '0');
            const m = now.getMinutes().toString().padStart(2, '0');
            const newBedtime = `${h}:${m}`;

            return await get().saveSettings(
                undefined,
                undefined,
                undefined,
                undefined,
                newBedtime
            );
        } catch {
            return false;
        }
    },

    setThemePreference: async (theme: 'dark' | 'special') => {
        applyDomThemeAndCorners(theme, get().border_style);
        set({ theme_preference: theme });
        await get().saveSettings(
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            theme,
            get().border_style
        );
    },

    setBorderStyle: async (style: 'rounded' | 'sharp') => {
        applyDomThemeAndCorners(get().theme_preference, style);
        set({ border_style: style });
        await get().saveSettings(
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            get().theme_preference,
            style
        );
    },

    buyShopItem: async (itemId: string) => {
        try {
            const csrfToken = getCsrfToken();
            if (csrfToken) {
                const res = await fetch('/sleep/buy-item', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': csrfToken,
                    },
                    body: JSON.stringify({ item_id: itemId }),
                });

                const data = await res.json();
                if (res.ok && data.success) {
                    get().syncUser(data);
                    if (get().audioEnabled) {
                        audioManager.playLevelUpChime();
                    }
                    return { success: true, message: data.message };
                } else {
                    return { success: false, message: data.message || 'ไม่สามารถสั่งซื้อไอเทมนี้ได้' };
                }
            }

            // Local fallback for guest
            const { exp, inventory, inventory_capacity } = get();
            const costs: Record<string, number> = {
                ration_supply: 30,
                first_aid_spray: 60,
                stealth_camo: 100,
                case_m: 200,
                case_l: 400,
            };
            const cost = costs[itemId] || 0;
            if (exp < cost) {
                return { success: false, message: `แต้ม EXP ไม่พอ (ขาดอีก ${cost - exp} EXP)` };
            }

            if (itemId === 'case_m') {
                set({ exp: exp - cost, inventory_capacity: 16 });
                return { success: true, message: 'อัปเกรดกระเป๋า Attaché Case (M) 16 ช่องสำเร็จ!' };
            } else if (itemId === 'case_l') {
                if (inventory_capacity < 16) {
                    return { success: false, message: 'ต้องมีกระเป๋า Case (M) ก่อน จึงจะอัปเกรดเป็น Case (L) ได้' };
                }
                set({ exp: exp - cost, inventory_capacity: 20 });
                return { success: true, message: 'อัปเกรดกระเป๋า Attaché Case (L) 20 ช่องสำเร็จ!' };
            }

            const slotsMap: Record<string, number> = { ration_supply: 2, first_aid_spray: 1, stealth_camo: 1 };
            const labelMap: Record<string, string> = {
                ration_supply: '[ RATION SUPPLY ]',
                first_aid_spray: '[ FIRST AID SPRAY ]',
                stealth_camo: '[ STEALTH CAMO ]',
            };
            const used = inventory.reduce((a, b) => a + (b.slots || 0), 0);
            const reqSlots = slotsMap[itemId] || 1;
            if (used + reqSlots > inventory_capacity) {
                return { success: false, message: 'ช่องกระเป๋าไม่พอ!' };
            }

            const newItem: InventoryItem = {
                id: 'guest_' + Date.now(),
                item_id: itemId,
                label: labelMap[itemId] || itemId,
                slots: reqSlots,
                description: 'ไอเทมยุทธภัณฑ์ตลาดมืด',
            };
            const nextInv = [...inventory, newItem];
            set({
                exp: exp - cost,
                inventory: nextInv,
                used_slots: used + reqSlots,
            });
            if (get().audioEnabled) {
                audioManager.playLevelUpChime();
            }
            return { success: true, message: `ซื้อ ${newItem.label} สำเร็จ!` };
        } catch {
            return { success: false, message: 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์' };
        }
    },

    useInventoryItem: async (itemInstanceId: string) => {
        try {
            const csrfToken = getCsrfToken();
            if (csrfToken) {
                const res = await fetch('/sleep/use-item', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': csrfToken,
                    },
                    body: JSON.stringify({ item_instance_id: itemInstanceId }),
                });

                const data = await res.json();
                if (res.ok && data.success) {
                    get().syncUser(data);
                    if (get().audioEnabled) {
                        audioManager.playAlertChime();
                    }
                    return { success: true, message: data.message };
                } else {
                    return { success: false, message: data.message || 'ไม่สามารถใช้งานไอเทมนี้ได้' };
                }
            }

            // Guest fallback
            const { inventory, current_hp } = get();
            const idx = inventory.findIndex(i => i.id === itemInstanceId);
            if (idx === -1) return { success: false, message: 'ไม่พบไอเทม' };
            const item = inventory[idx];
            const nextInv = [...inventory];
            nextInv.splice(idx, 1);
            let nextHp = current_hp;
            if (item.item_id === 'ration_supply') nextHp = Math.min(100, current_hp + 30);
            if (item.item_id === 'first_aid_spray') nextHp = Math.min(100, current_hp + 50);
            const used = nextInv.reduce((a, b) => a + (b.slots || 0), 0);
            set({ inventory: nextInv, current_hp: nextHp, used_slots: used });
            return { success: true, message: `ใช้งาน ${item.label} สำเร็จ!` };
        } catch {
            return { success: false, message: 'เกิดข้อผิดพลาดในการใช้งานไอเทม' };
        }
    },
}));

