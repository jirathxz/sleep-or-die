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
    saveSettings: (wakeUpTime: string, discordUserId?: string, discordBotToken?: string) => Promise<boolean>;
    confirmSleep: () => Promise<boolean>;
    useTicket: () => Promise<boolean>;
    fetchStatus: () => Promise<void>;
    buyMarketItem: (itemKey: 'ration' | 'spray' | 'camo' | 'case_m' | 'case_l') => { success: boolean; message: string };
    useInventoryItem: (itemKey: 'ration' | 'spray' | 'camo') => { success: boolean; message: string };
    discardInventoryItem: (itemKey: 'ration' | 'spray' | 'camo') => void;
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
    exp: 150,

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

            const isConfirmedSleep = Boolean(data.last_sleep_confirmed_at !== undefined ? data.last_sleep_confirmed_at : state.last_sleep_confirmed_at);
            const timer = calculateTimeRemaining(target);
            const newStage = determineStage(currentHp, isDisabled, timer.totalSeconds, isConfirmedSleep);

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
            showDebriefModal: false,
            showOverflowModal: false,
        });
        get().tick();
    },

    openHitmanModal: () => {
        if (get().audioEnabled) {
            audioManager.playHitmanBgm();
        }
        set({ showHitmanModal: true });
    },

    closeHitmanModal: () => {
        audioManager.stopHitmanBgm();
        set({ showHitmanModal: false });
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

            // Trigger Hitman Codec 140.85 screen when critical <= 15s
            if (emergencySecondsLeft <= 15 && !get().showHitmanModal) {
                get().openHitmanModal();
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
                        debriefData: null,
                    });
                    return true;
                }
            }

            // Local fallback for guest
            set({
                simulationActive: false,
                simulationPhase: 'idle',
                last_sleep_confirmed_at: new Date().toISOString(),
                showHitmanModal: false,
                debriefData: null,
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
