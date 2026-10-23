import { create } from 'zustand';
import { audioManager } from '@/lib/audioManager';

export type SleepStage = 'normal' | 'alert' | 'lockdown' | 'sleep' | 'shutdown';

// คำนวณยศสายลับตามจำนวนวันรอดชีวิตต่อเนื่อง (Streak)
export function getAgentRank(days: number): string {
    if (days <= 0) return 'TIME PARADOX [SLEEP DEPRIVED]';
    if (days <= 2) return 'ROOKIE [CADET]';
    if (days <= 6) return 'FOXHOUND [OPERATIVE]';
    if (days <= 13) return 'SOLID SNAKE [VETERAN]';
    return 'BIG BOSS [SUPREME COMMANDER]';
}

export interface DebriefData {
    rank: 'S' | 'A' | 'B';
    rankTitle: string;
    targetTime: string;
    actualSleepTime: string;
    durationHours: string;
    streak: number;
    bestStreak: number;
    isNewRecord: boolean;
    bonusExp: number;
    itemsGiven: string[];
    itemsMissed: string[];
}

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
    test_mode: boolean;
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

    // Inventory & Market State
    maxSlots: number;
    rationCount: number;
    sprayCount: number;
    camoCount: number;
    camoActive: boolean;

    // Derived timer values
    stage: SleepStage;
    totalSecondsRemaining: number;
    hoursRemaining: number;
    minutesRemaining: number;
    secondsRemaining: number;
    isPastDeadline: boolean;
    audioEnabled: boolean;
    simulationActive: boolean;
    simulationPhase: 'idle' | 'countdown_321' | 'grace_30s' | 'shutdown' | 'stage_countdown';
    simulationRemaining: number;
    simulationElapsedPast: number;

    // Modals & Debrief State
    bestStreak: number;
    showHitmanModal: boolean;
    hitmanDismissed: boolean;
    showDebriefModal: boolean;
    debriefData: DebriefData | null;
    showOverflowModal: boolean;
    overflowMessage: string;

    // Actions
    syncUser: (data: Partial<SleepState>) => void;
    tick: () => void;
    toggleAudio: (enabled?: boolean) => void;
    startSimulation321: () => void;
    fastForward5s: () => void;
    decreaseHp: (amount?: number) => void;
    simulateStage: (targetStage: 'alert' | 'lockdown' | 'sleep' | 'shutdown') => void;
    resetSimulation: () => void;
    startNextDay: () => void;
    openHitmanModal: () => void;
    closeHitmanModal: () => void;
    triggerMorningDebrief: () => void;
    closeDebriefModal: () => void;
    closeOverflowModal: () => void;
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
    buyMarketItem: (itemKey: 'ration' | 'spray' | 'camo' | 'case_m' | 'case_l') => { success: boolean; message: string };
    discardInventoryItem: (itemKey: 'ration' | 'spray' | 'camo') => void;
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

    // หากเลยเวลานอนเป้าหมายเกิน 4 ชั่วโมง (-14400s) ให้ถือว่าเป็นเป้าหมายของคืนถัดไป (+24 ชม.)
    if (diffSeconds < -14400) {
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
    totalSecondsRemaining: number,
    isConfirmedSleep: boolean = false
): SleepStage {
    if (isDisabled || currentHp <= 0) {
        return 'shutdown';
    }

    // หากผู้ใช้ยืนยันการนอนแล้ว ให้คงสถานะ normal เสมอ เพื่อไม่ให้เด้งเตือนฉุกเฉิน
    if (isConfirmedSleep) {
        return 'normal';
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

interface InventoryData {
    maxSlots: number;
    rationCount: number;
    sprayCount: number;
    camoCount: number;
    camoActive: boolean;
}

function loadSavedInventory(): InventoryData {
    if (typeof window === 'undefined') {
        return { maxSlots: 12, rationCount: 1, sprayCount: 0, camoCount: 0, camoActive: false };
    }
    try {
        const raw = localStorage.getItem('sleep_inventory_data');
        if (raw) {
            const parsed = JSON.parse(raw);
            return {
                maxSlots: parsed.maxSlots || 12,
                rationCount: parsed.rationCount ?? 1,
                sprayCount: 0,
                camoCount: parsed.camoCount ?? 0,
                camoActive: Boolean(parsed.camoActive),
            };
        }
    } catch {}
    return { maxSlots: 12, rationCount: 1, sprayCount: 0, camoCount: 0, camoActive: false };
}

function saveInventoryToStorage(data: InventoryData) {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem('sleep_inventory_data', JSON.stringify(data));
    } catch {}
}

function getSafeStoredBestStreak(): number {
    if (typeof window === 'undefined') return 3;
    try {
        const val = localStorage.getItem('sleep_best_streak');
        return val ? Number(val) : 3;
    } catch {
        return 3;
    }
}

const initialInventory = loadSavedInventory();

function applyDomThemeAndCorners(theme?: 'dark' | 'special', border?: 'rounded' | 'sharp') {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;

    if (theme) {
        try { localStorage.setItem('sleep_theme_preference', theme); } catch (e) {}
    }
    if (border) {
        try { localStorage.setItem('sleep_border_style', border); } catch (e) {}
    }

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

const getInitialTheme = (): 'dark' | 'special' => {
    if (typeof window === 'undefined') return 'dark';
    try {
        const stored = localStorage.getItem('sleep_theme_preference');
        if (stored === 'special') return 'special';
    } catch (e) {}
    return 'dark';
};

const getInitialBorder = (): 'rounded' | 'sharp' => {
    if (typeof window === 'undefined') return 'rounded';
    try {
        const stored = localStorage.getItem('sleep_border_style');
        if (stored === 'sharp') return 'sharp';
    } catch (e) {}
    return 'rounded';
};

export const useSleepStore = create<SleepState>((set, get) => ({
    current_hp: 100,
    wake_up_time: defaultWakeUp,
    sleep_target_time: defaultSleepTarget,
    shutdown_stacks: 0,
    days_survived: 3, // Initial demo streak for guests
    bestStreak: getSafeStoredBestStreak(),
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
    test_mode: true,
    is_system_active: true,

    theme_preference: getInitialTheme(),
    border_style: getInitialBorder(),
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

    maxSlots: initialInventory.maxSlots,
    rationCount: initialInventory.rationCount,
    sprayCount: initialInventory.sprayCount,
    camoCount: initialInventory.camoCount,
    camoActive: initialInventory.camoActive,

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

    showHitmanModal: false,
    hitmanDismissed: false,
    showDebriefModal: false,
    debriefData: null,
    showOverflowModal: false,
    overflowMessage: '',

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

            let alertState = state.alert_state;
            const incomingAlert = (data as any).alert_state;
            if (incomingAlert) {
                // If phase is the same and client is actively counting down (not paused),
                // do NOT allow stale higher seconds_remaining from server polling to overwrite our countdown!
                if (
                    state.alert_state &&
                    state.alert_state.phase === incomingAlert.phase &&
                    !state.alert_state.is_paused &&
                    typeof state.alert_state.seconds_remaining === 'number'
                ) {
                    alertState = {
                        ...incomingAlert,
                        // Always keep the lower countdown value to avoid looping backwards
                        seconds_remaining: Math.min(
                            state.alert_state.seconds_remaining,
                            incomingAlert.seconds_remaining ?? state.alert_state.seconds_remaining
                        ),
                    };
                } else {
                    alertState = incomingAlert;
                }
            }

            const lastConfirmed = data.last_sleep_confirmed_at !== undefined
                ? data.last_sleep_confirmed_at
                : state.last_sleep_confirmed_at;

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
                    last_sleep_confirmed_at: lastConfirmed,
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

            const isConfirmedSleep = Boolean(data.last_sleep_confirmed_at !== undefined ? data.last_sleep_confirmed_at : state.last_sleep_confirmed_at);
            const timer = calculateTimeRemaining(target);
            const newStage = determineStage(currentHp, isDisabled, timer.totalSeconds, isConfirmedSleep);

            return {
                ...data,
                current_hp: currentHp,
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

    fastForward5s: () => {
        audioManager.stopAllAudio();
        if (get().audioEnabled) {
            audioManager.playAlertChime();
        }
        set({
            simulationActive: true,
            simulationPhase: 'countdown_321',
            simulationRemaining: 5,
            totalSecondsRemaining: 5,
            hoursRemaining: 0,
            minutesRemaining: 0,
            secondsRemaining: 5,
            isPastDeadline: false,
            stage: 'lockdown',
            current_hp: 100,
        });
    },

    decreaseHp: (amount = 25) => {
        const { current_hp, camoActive, maxSlots, rationCount, sprayCount, camoCount } = get();
        const nextHp = Math.max(0, current_hp - amount);
        if (nextHp <= 0) {
            // Stealth Camo protection: absorbs fatal strike once!
            if (camoActive) {
                set({
                    camoActive: false,
                    current_hp: 50,
                });
                saveInventoryToStorage({
                    maxSlots,
                    rationCount,
                    sprayCount,
                    camoCount,
                    camoActive: false,
                });
                audioManager.playAlertChime();
                return;
            }

            audioManager.stopAllAudio();
            if (get().audioEnabled) {
                audioManager.startEmergencyAlarm();
            }
            set({
                current_hp: 0,
                stage: 'shutdown',
                simulationActive: true,
            });
        } else {
            set({ current_hp: nextHp });
        }
    },

    simulateStage: (targetStage) => {
        audioManager.stopAllAudio();
        if (targetStage === 'alert') {
            if (get().audioEnabled) audioManager.playAlertChime();
            set({
                simulationActive: true,
                simulationPhase: 'stage_countdown',
                stage: 'alert',
                totalSecondsRemaining: 1800,
                hoursRemaining: 0,
                minutesRemaining: 30,
                secondsRemaining: 0,
                isPastDeadline: false,
                current_hp: 100,
            });
        } else if (targetStage === 'lockdown') {
            if (get().audioEnabled) audioManager.startLockdownHeartbeat();
            set({
                simulationActive: true,
                simulationPhase: 'stage_countdown',
                stage: 'lockdown',
                totalSecondsRemaining: 900,
                hoursRemaining: 0,
                minutesRemaining: 15,
                secondsRemaining: 0,
                isPastDeadline: false,
                current_hp: 100,
            });
        } else if (targetStage === 'sleep') {
            if (get().audioEnabled) audioManager.startEmergencyAlarm();
            set({
                simulationActive: true,
                simulationPhase: 'grace_30s',
                simulationRemaining: 30,
                stage: 'sleep',
                totalSecondsRemaining: 0,
                hoursRemaining: 0,
                minutesRemaining: 0,
                secondsRemaining: 30,
                isPastDeadline: true,
                current_hp: 100,
            });
        } else if (targetStage === 'shutdown') {
            if (get().audioEnabled) audioManager.playShutdownSound();
            set({
                simulationActive: true,
                simulationPhase: 'shutdown',
                stage: 'shutdown',
                current_hp: 0,
                totalSecondsRemaining: 0,
                hoursRemaining: 0,
                minutesRemaining: 0,
                secondsRemaining: 0,
                isPastDeadline: true,
            });
        }
    },

    resetSimulation: () => {
        audioManager.stopAllAudio();
        const target = get().sleep_target_time || defaultSleepTarget;
        const timer = calculateTimeRemaining(target);
        // ล้างทั้งโหมดจำลองและสถานะนอน เพื่อให้ผู้ใช้/ผู้ทดสอบกลับสู่โหมดกลางวันปกติได้ทันที
        set({
            simulationActive: false,
            simulationPhase: 'idle',
            simulationRemaining: 0,
            last_sleep_confirmed_at: null,
            debriefData: null,
            current_hp: 100,
            stage: 'normal',
            totalSecondsRemaining: timer.totalSeconds,
            hoursRemaining: timer.hours,
            minutesRemaining: timer.minutes,
            secondsRemaining: timer.seconds,
            isPastDeadline: timer.isPast,
            showHitmanModal: false,
            hitmanDismissed: false,
            showDebriefModal: false,
            showOverflowModal: false,
        });
    },

    startNextDay: () => {
        audioManager.stopAllAudio();
        const target = get().sleep_target_time || defaultSleepTarget;
        const timer = calculateTimeRemaining(target);
        set({
            simulationActive: false,
            simulationPhase: 'idle',
            simulationRemaining: 0,
            last_sleep_confirmed_at: null,
            debriefData: null,
            stage: 'normal',
            totalSecondsRemaining: timer.totalSeconds,
            hoursRemaining: timer.hours,
            minutesRemaining: timer.minutes,
            secondsRemaining: timer.seconds,
            isPastDeadline: timer.isPast,
            showHitmanModal: false,
            hitmanDismissed: false,
            showDebriefModal: false,
            showOverflowModal: false,
        });
        get().tick();
    },

    openHitmanModal: () => {
        if (get().audioEnabled) {
            audioManager.playHitmanBgm();
        }
        set({
            showHitmanModal: true,
            hitmanDismissed: false,
            secondsRemaining: get().secondsRemaining > 0 ? get().secondsRemaining : 15,
        });
    },

    closeHitmanModal: () => {
        audioManager.stopHitmanBgm();
        set({ showHitmanModal: false, hitmanDismissed: true });
    },

    closeOverflowModal: () => {
        set({ showOverflowModal: false });
    },

    closeDebriefModal: () => {
        const state = get();
        set({ showDebriefModal: false });
        if (state.debriefData?.itemsMissed && state.debriefData.itemsMissed.length > 0) {
            set({
                showOverflowModal: true,
                overflowMessage: `กระเป๋าเต็ม! พลาดการรับ: ${state.debriefData.itemsMissed.join(', ')}`,
            });
        }
    },

    triggerMorningDebrief: () => {
        const state = get();
        const hpBeforeHeal = state.current_hp;
        let rank: 'S' | 'A' | 'B' = 'S';
        let rankTitle = 'S-RANK // ไร้ที่ติ [PERFECT]';
        let bonusExp = 0;

        if (hpBeforeHeal >= 100) {
            rank = 'S';
            rankTitle = 'S-RANK // ไร้ที่ติ [PERFECT]';
            bonusExp = 25;
        } else if (hpBeforeHeal >= 50) {
            rank = 'A';
            rankTitle = 'A-RANK // พร้อมรบ [COMBAT READY]';
            bonusExp = 10;
        } else {
            rank = 'B';
            rankTitle = 'B-RANK // ผู้รอดชีวิต [SURVIVOR]';
            bonusExp = 0;
        }

        const newStreak = state.days_survived + 1;
        const currentBest = state.bestStreak || 0;
        const best = Math.max(newStreak, currentBest);
        const isNewRecord = newStreak > currentBest;
        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem('sleep_best_streak', String(best));
            } catch {}
        }

        // EXP & Level Up calculation
        let newExp = (state.exp || 0) + 50 + bonusExp;
        let newLevel = state.level || 1;
        let threshold = newLevel * 500;
        let didLevelUp = false;
        while (newExp >= threshold) {
            newExp -= threshold;
            newLevel += 1;
            threshold = newLevel * 500;
            didLevelUp = true;
        }

        // Inventory Milestone rewards:
        // 1. Daily Ration (+2 slots)
        // 2. Streak % 3 === 0: Emergency Ticket (+1 ticket count)
        // 3. Level up: Camo (+1 slot)
        const maxSlots = state.maxSlots;
        let usedSlots = (state.rationCount * 2) + state.camoCount;
        let newRations = state.rationCount;
        let newCamos = state.camoCount;
        let nextTickets = state.tickets_count;
        const itemsGiven: string[] = [];
        const itemsMissed: string[] = [];

        // Daily Ration
        if (usedSlots + 2 <= maxSlots) {
            newRations += 1;
            usedSlots += 2;
            itemsGiven.push('Ration (+1)');
        } else {
            itemsMissed.push('Ration (2 ช่อง)');
        }

        // Streak Milestone (ทุก 3 วัน: เพิ่มตั๋วฉุกเฉิน)
        if (newStreak % 3 === 0) {
            nextTickets += 1;
            itemsGiven.push('ตั๋วฉุกเฉิน (+1 ใบ)');
        }

        // Level Up Milestone
        if (didLevelUp) {
            if (usedSlots + 1 <= maxSlots) {
                newCamos += 1;
                usedSlots += 1;
                itemsGiven.push('Stealth Camo (+1)');
            } else {
                itemsMissed.push('Stealth Camo (1 ช่อง)');
            }
        }

        saveInventoryToStorage({
            maxSlots,
            rationCount: newRations,
            sprayCount: 0,
            camoCount: newCamos,
            camoActive: state.camoActive,
        });

        audioManager.playCodecBeep(987, 0.08, 'sine');
        setTimeout(() => audioManager.playCodecBeep(1318, 0.15, 'triangle'), 120);

        const debrief: DebriefData = {
            rank,
            rankTitle,
            targetTime: state.sleep_target_time || '23:15',
            actualSleepTime: state.last_sleep_confirmed_at
                ? new Date(state.last_sleep_confirmed_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
                : '23:10',
            durationHours: '7.5 ชม.',
            streak: newStreak,
            bestStreak: best,
            isNewRecord,
            bonusExp,
            itemsGiven,
            itemsMissed,
        };

        set({
            current_hp: 100,
            days_survived: newStreak,
            bestStreak: best,
            exp: newExp,
            level: newLevel,
            tickets_count: nextTickets,
            rationCount: newRations,
            sprayCount: 0,
            camoCount: newCamos,
            stage: 'normal',
            showDebriefModal: false,
            debriefData: debrief,
            overflowMessage: itemsMissed.length > 0 ? `กระเป๋าเต็ม! ไม่สามารถรับ: ${itemsMissed.join(', ')}` : '',
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
            } else if (simulationPhase === 'stage_countdown') {
                const nextTotal = (get().totalSecondsRemaining || 0) - 1;
                if (nextTotal > 0) {
                    const hours = Math.floor(nextTotal / 3600);
                    const minutes = Math.floor((nextTotal % 3600) / 60);
                    const seconds = nextTotal % 60;
                    const nextStage: SleepStage = nextTotal <= 900 ? 'lockdown' : 'alert';

                    if (nextStage !== oldStage && audioEnabled) {
                        if (nextStage === 'lockdown') {
                            audioManager.startLockdownHeartbeat();
                        }
                    }

                    set({
                        totalSecondsRemaining: nextTotal,
                        hoursRemaining: hours,
                        minutesRemaining: minutes,
                        secondsRemaining: seconds,
                        stage: nextStage,
                    });
                    return;
                } else {
                    // เมื่อนับถอยหลังถึง 0: ไหลเข้าสู่ช่วงฉุกเฉิน 30 วินาทีอัตโนมัติ
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
                    const csrfToken = getCsrfToken();
                    fetch('/sleep/alert-action', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            ...(csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {}),
                        },
                        body: JSON.stringify({ action: 'sleep_warning' }),
                    }).then(res => res.json()).then(data => {
                        if (data.alert_state) set({ alert_state: data.alert_state });
                        if (data.current_hp !== undefined) set({ current_hp: data.current_hp });
                    }).catch(() => {});
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

        // Re-arm Hitman Codec when prior to bedtime target
        if (!timer.isPast && get().hitmanDismissed) {
            set({ hitmanDismissed: false });
        }

        if (timer.isPast && !last_sleep_confirmed_at) {
            // Bedtime breached: dynamic emergency countdown before HP hits 0
            const countdownSec = get().emergency_countdown_seconds || 60;
            const elapsed = Math.abs(timer.totalSeconds);
            const emergencySecondsLeft = Math.max(0, countdownSec - elapsed);
            activeHp = Math.max(0, Math.round((emergencySecondsLeft / countdownSec) * 100));
            displaySeconds = emergencySecondsLeft;
            displayMinutes = 0;
            displayHours = 0;

            // Trigger Hitman Codec 140.85 screen when critical <= 15s (and > 0, not already dismissed)
            if (emergencySecondsLeft <= 15 && emergencySecondsLeft > 0 && !get().showHitmanModal && !get().hitmanDismissed) {
                get().openHitmanModal();
            }

            // Auto-close Hitman modal if open and time has completely run out (<= 0)
            if (emergencySecondsLeft <= 0 && get().showHitmanModal) {
                get().closeHitmanModal();
            }

            // Stealth Camo protection if activeHp reaches 0
            if (activeHp <= 0 && get().camoActive) {
                activeHp = 50;
                set({ camoActive: false, current_hp: 50 });
                saveInventoryToStorage({
                    maxSlots: get().maxSlots,
                    rationCount: get().rationCount,
                    sprayCount: get().sprayCount,
                    camoCount: get().camoCount,
                    camoActive: false,
                });
                audioManager.playAlertChime();
            } else if (emergencySecondsLeft <= 0 && activeHp <= 0 && current_hp > 0) {
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

        const isConfirmed = Boolean(last_sleep_confirmed_at);
        const newStage = determineStage(activeHp, is_disabled, timer.totalSeconds, isConfirmed);

        if (isConfirmed) {
            audioManager.stopAllAudio();
        } else if (newStage !== oldStage) {
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
        testMode?: boolean,
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
                        test_mode: testMode,
                        theme_preference: currentTheme,
                        border_style: currentBorder,
                    }),
                });

                if (res.ok) {
                    const data = await res.json();
                    get().syncUser(data);

                    // Send instant sync signal to C++ desktop daemon local server (port 8008)
                    try {
                        fetch('http://127.0.0.1:8008/sync', { mode: 'no-cors' }).catch(() => {});
                    } catch (_) {}

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
                test_mode: testMode ?? true,
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

            const state = get();
            audioManager.stopAllAudio();

            // หากอยู่ในโหมดจำลอง: หยุดเวลานับถอยหลังทันที และไม่ส่งคำขอไปเพิ่ม EXP มั่วในฐานข้อมูล
            if (state.simulationActive) {
                set({
                    simulationActive: false,
                    simulationPhase: 'idle',
                    simulationRemaining: 0,
                    totalSecondsRemaining: 0,
                    hoursRemaining: 0,
                    minutesRemaining: 0,
                    secondsRemaining: 0,
                    last_sleep_confirmed_at: new Date().toISOString(),
                    debriefData: null,
                    stage: 'sleep',
                    showHitmanModal: false,
                    hitmanDismissed: true,
                });
                return true;
            }

            const csrfToken = getCsrfToken();
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
                    set({
                        simulationActive: false,
                        simulationPhase: 'idle',
                        showHitmanModal: false,
                        hitmanDismissed: true,
                        debriefData: null,
                    });
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
                simulationActive: false,
                simulationPhase: 'idle',
                last_sleep_confirmed_at: new Date().toISOString(),
                showHitmanModal: false,
                hitmanDismissed: true,
                debriefData: null,
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
            const state = get();
            const { tickets_count, sleep_target_time, simulationActive, totalSecondsRemaining } = state;

            // In simulation mode: Add 1,800s (+30m) to the simulation countdown directly!
            if (simulationActive && tickets_count > 0) {
                const nextTotalSeconds = totalSecondsRemaining + 1800;
                const nextTickets = tickets_count - 1;
                const [h, m] = (sleep_target_time || '23:15').split(':').map(Number);
                const d = new Date();
                d.setHours(h, m + 30, 0, 0);
                const newTarget = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;

                set({
                    sleep_target_time: newTarget,
                    tickets_count: nextTickets,
                    totalSecondsRemaining: nextTotalSeconds,
                    hoursRemaining: Math.floor(nextTotalSeconds / 3600),
                    minutesRemaining: Math.floor((nextTotalSeconds % 3600) / 60),
                    secondsRemaining: nextTotalSeconds % 60,
                    stage: nextTotalSeconds > 1800 ? 'normal' : 'lockdown',
                });
                return true;
            }

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
        // Optimistically dismiss modal immediately so clicking "เข้าใจแล้ว" responds with 0ms lag
        set((state) => ({
            alert_state: {
                ...state.alert_state,
                phase: 'idle',
                acknowledged: true,
            },
        }));

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

    buyMarketItem: (itemKey) => {
        const state = get();
        const prices: Record<string, number> = {
            ration: 30,
            camo: 100,
            case_m: 200,
            case_l: 400,
        };

        const price = prices[itemKey] ?? 0;
        if (!price) {
            return { success: false, message: 'ไม่พบรายการสินค้านี้ในร้านค้า' };
        }
        if (state.exp < price) {
            return { success: false, message: 'EXP ไม่เพียงพอสำหรับซื้อสินค้านี้' };
        }

        const usedSlots = (state.rationCount * 2) + state.camoCount;

        if (itemKey === 'ration') {
            if (usedSlots + 2 > state.maxSlots) {
                return { success: false, message: 'ช่องกระเป๋าไม่เพียงพอ (Ration ใช้ 2 ช่อง)' };
            }
            const newExp = state.exp - price;
            const updated = {
                exp: newExp,
                rationCount: state.rationCount + 1,
            };
            set(updated);
            saveInventoryToStorage({
                maxSlots: state.maxSlots,
                rationCount: updated.rationCount,
                sprayCount: 0,
                camoCount: state.camoCount,
                camoActive: state.camoActive,
            });
            return { success: true, message: 'ซื้อ Ration สำเร็จ (+1 เสบียง)' };
        }

        if (itemKey === 'camo') {
            if (usedSlots + 1 > state.maxSlots) {
                return { success: false, message: 'ช่องกระเป๋าไม่เพียงพอ (Stealth Camo ใช้ 1 ช่อง)' };
            }
            const newExp = state.exp - price;
            const updated = {
                exp: newExp,
                camoCount: state.camoCount + 1,
            };
            set(updated);
            saveInventoryToStorage({
                maxSlots: state.maxSlots,
                rationCount: state.rationCount,
                sprayCount: state.sprayCount,
                camoCount: updated.camoCount,
                camoActive: state.camoActive,
            });
            return { success: true, message: 'ซื้อ Stealth Camo สำเร็จ (+1 เกราะพรางตัว)' };
        }

        if (itemKey === 'case_m') {
            if (state.maxSlots >= 16) {
                return { success: false, message: 'คุณได้รับการอัปเกรดกระเป๋าขนาด M อยู่แล้ว' };
            }
            const newExp = state.exp - price;
            set({ exp: newExp, maxSlots: 16 });
            saveInventoryToStorage({
                maxSlots: 16,
                rationCount: state.rationCount,
                sprayCount: state.sprayCount,
                camoCount: state.camoCount,
                camoActive: state.camoActive,
            });
            return { success: true, message: 'อัปเกรดกระเป๋าเป็น 16 ช่องสำเร็จ!' };
        }

        if (itemKey === 'case_l') {
            if (state.maxSlots < 16) {
                return { success: false, message: 'ต้องอัปเกรดกระเป๋าขนาด M (16 ช่อง) ก่อนจึงจะอัปเกรดขนาด L ได้' };
            }
            if (state.maxSlots >= 20) {
                return { success: false, message: 'คุณมีความจุกระเป๋าสูงสุดแล้ว (20 ช่อง)' };
            }
            const newExp = state.exp - price;
            set({ exp: newExp, maxSlots: 20 });
            saveInventoryToStorage({
                maxSlots: 20,
                rationCount: state.rationCount,
                sprayCount: state.sprayCount,
                camoCount: state.camoCount,
                camoActive: state.camoActive,
            });
            return { success: true, message: 'อัปเกรดกระเป๋าเป็น 20 ช่องสำเร็จ!' };
        }

        return { success: false, message: 'ไม่พบรายการสินค้านี้' };
    },

    useInventoryItem: (itemKey) => {
        const state = get();
        if (itemKey === 'ration') {
            if (state.rationCount <= 0) return { success: false, message: 'ไม่มีเสบียง Ration ในกระเป๋า' };
            const newHp = Math.min(100, state.current_hp + 30);
            const newTickets = state.tickets_count + 1;
            const newCount = state.rationCount - 1;
            set({ current_hp: newHp, tickets_count: newTickets, rationCount: newCount });
            saveInventoryToStorage({
                maxSlots: state.maxSlots,
                rationCount: newCount,
                sprayCount: 0,
                camoCount: state.camoCount,
                camoActive: state.camoActive,
            });

            // บันทึก tickets_count และ current_hp ลงฐานข้อมูลจริง
            const csrfToken = getCsrfToken();
            if (csrfToken) {
                fetch('/sleep/use-ration', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': csrfToken,
                    },
                })
                    .then((res) => res.json())
                    .then((data) => {
                        if (data.success) {
                            set({
                                current_hp: data.current_hp,
                                tickets_count: data.tickets_count,
                            });
                        }
                    })
                    .catch(() => {});
            }

            return { success: true, message: 'ใช้ Ration: ฟื้นฟู HP +30% และได้รับตั๋วฉุกเฉิน +1 ใบ' };
        }

        if (itemKey === 'camo') {
            if (state.camoCount <= 0) return { success: false, message: 'ไม่มี Stealth Camo ในกระเป๋า' };
            if (state.camoActive) return { success: false, message: 'เกราะพรางตัว Stealth Camo กำลังทำงานอยู่แล้ว' };
            const newCount = state.camoCount - 1;
            set({ camoActive: true, camoCount: newCount });
            saveInventoryToStorage({
                maxSlots: state.maxSlots,
                rationCount: state.rationCount,
                sprayCount: state.sprayCount,
                camoCount: newCount,
                camoActive: true,
            });
            return { success: true, message: 'เปิดใช้งาน Stealth Camo: ป้องกันสถิติหลุด 1 คืน' };
        }

        return { success: false, message: 'ไม่พบไอเทม' };
    },

    discardInventoryItem: (itemKey) => {
        const state = get();
        let updated: Partial<SleepState> = {};
        if (itemKey === 'ration') updated = { rationCount: Math.max(0, state.rationCount - 1) };
        if (itemKey === 'spray') updated = { sprayCount: Math.max(0, state.sprayCount - 1) };
        if (itemKey === 'camo') updated = { camoCount: Math.max(0, state.camoCount - 1) };
        set(updated);
        saveInventoryToStorage({
            maxSlots: state.maxSlots,
            rationCount: updated.rationCount ?? state.rationCount,
            sprayCount: updated.sprayCount ?? state.sprayCount,
            camoCount: updated.camoCount ?? state.camoCount,
            camoActive: state.camoActive,
        });
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
                    try {
                        fetch('http://127.0.0.1:8008/sync', { mode: 'no-cors' }).catch(() => {});
                    } catch {}
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
                    body: JSON.stringify({ action: 'toggle_pause', seconds: alert_state.seconds_remaining }),
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

