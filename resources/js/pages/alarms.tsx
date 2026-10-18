import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { BellRing, Moon, Plus, Repeat, Trash2, Clock, Send, Check, Loader2, AlertCircle } from 'lucide-react';
import { useSleepStore } from '@/stores/useSleepStore';
import { useTranslation } from '@/lib/i18n';

interface BedtimeAlertRule {
    id: string;
    title: string;
    timeBeforeMinutes: number;
    description: string;
    sound: string;
    enabled: boolean;
    stage: 'alert' | 'lockdown' | 'deadline';
}

interface CustomBedtimeSchedule {
    id: string;
    bedtime: string;
    label: string;
    days: string[];
    enabled: boolean;
}

export default function BedtimeAlerts() {
    const { t, isTactical } = useTranslation();
    const {
        sleep_target_time,
        wake_up_time,
        saveSettings,
        testAlert,
    } = useSleepStore();

    const [activeTarget, setActiveTarget] = useState(sleep_target_time || '23:15');
    const [activeWake, setActiveWake] = useState(wake_up_time || '07:00');
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // Testing alert state
    const [testingStage, setTestingStage] = useState<string | null>(null);
    const [alertFeedback, setAlertFeedback] = useState<{
        success: boolean;
        message: string;
    } | null>(null);

    useEffect(() => {
        if (sleep_target_time) {
            setActiveTarget(sleep_target_time);
        }
        if (wake_up_time) {
            setActiveWake(wake_up_time);
        }
    }, [sleep_target_time, wake_up_time]);

    // Built-in Discipline Protocols
    const [alertRules, setAlertRules] = useState<BedtimeAlertRule[]>([
        {
            id: 'rule-1',
            title: 'แจ้งเตือนผ่อนคลายก่อนนอน • 30 นาทีก่อนเส้นตาย',
            timeBeforeMinutes: 30,
            description: 'ส่งสัญญาณกระตุ้นให้เริ่มวางงาน สรุปกิจกรรมประจำวัน และเตรียมตัวเข้านอน',
            sound: 'Chime Melodic Pulse',
            enabled: true,
            stage: 'alert',
        },
        {
            id: 'rule-2',
            title: 'แจ้งเตือนล็อคดาวน์หน้าจอ • 15 นาทีก่อนเส้นตาย',
            timeBeforeMinutes: 15,
            description: 'เร่งจังหวะเตือนขั้นสูง บังคับปิดแสงสีฟ้า ปิดหน้าจอคอม และหยุดใช้งานโซเชียลมีเดีย',
            sound: 'Heartbeat Rhythm',
            enabled: true,
            stage: 'lockdown',
        },
        {
            id: 'rule-3',
            title: 'สัญญาณไซเรนเส้นตายเข้านอน',
            timeBeforeMinutes: 0,
            description: 'ส่งเสียงไซเรนฉุกเฉินและแจ้งเตือน Discord เมื่อถึงเวลา หากไม่เข้านอน HP จะเริ่มลดลงทันที',
            sound: 'Emergency Alarm',
            enabled: true,
            stage: 'deadline',
        },
    ]);

    // Custom Bedtime Targets
    const [bedtimeSchedules, setBedtimeSchedules] = useState<CustomBedtimeSchedule[]>([
        {
            id: 'sched-1',
            bedtime: sleep_target_time || '23:15',
            label: 'เวลาเข้านอนวันธรรมดา จันทร์ - ศุกร์',
            days: ['จ', 'อ', 'พ', 'พฤ', 'ศ'],
            enabled: true,
        },
        {
            id: 'sched-2',
            bedtime: '00:00',
            label: 'เวลาเข้านอนสุดสัปดาห์ เสาร์ - อาทิตย์',
            days: ['ส', 'อา'],
            enabled: true,
        },
    ]);

    const [isAddingSchedule, setIsAddingSchedule] = useState(false);
    const [newTime, setNewTime] = useState('23:00');
    const [newLabel, setNewLabel] = useState('เวลาเตือนนอนพิเศษ');

    const toggleRule = (id: string) => {
        setAlertRules((prev) =>
            prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
        );
    };

    const toggleSchedule = (id: string) => {
        setBedtimeSchedules((prev) =>
            prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
        );
    };

    const handleSavePrimarySchedule = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setSaveSuccess(false);

        // Save settings to backend with wake up time and sleep target
        const ok = await saveSettings(activeWake);
        setIsSaving(false);
        if (ok) {
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        }
    };

    const handleTriggerTest = async (stage: 'alert' | 'lockdown' | 'deadline') => {
        setTestingStage(stage);
        setAlertFeedback(null);

        const res = await testAlert(stage);
        setTestingStage(null);
        setAlertFeedback(res);
        setTimeout(() => setAlertFeedback(null), 5000);
    };

    const addSchedule = (e: React.FormEvent) => {
        e.preventDefault();
        const created: CustomBedtimeSchedule = {
            id: Date.now().toString(),
            bedtime: newTime,
            label: newLabel,
            days: ['จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส', 'อา'],
            enabled: true,
        };
        setBedtimeSchedules((prev) => [...prev, created]);
        setIsAddingSchedule(false);
    };

    const deleteSchedule = (id: string) => {
        setBedtimeSchedules((prev) => prev.filter((s) => s.id !== id));
    };

    return (
        <>
            <Head title={`${t('alarms_title')} - SleepOrDie`} />

            <div className="max-w-3xl w-full mx-auto p-4 md:p-6 space-y-6 select-none">
                {/* Header: Focused on Bedtime Discipline */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-medium tracking-tight text-white flex items-center gap-2">
                            <Moon className="size-5 text-indigo-400" />
                            {t('alarms_title')}
                        </h1>
                        <p className="text-xs text-zinc-500 font-light mt-0.5">
                            {t('alarms_desc')}
                        </p>
                    </div>

                    <button
                        onClick={() => setIsAddingSchedule(!isAddingSchedule)}
                        className="h-9 px-3.5 rounded-lg bg-white text-zinc-950 text-xs font-medium hover:bg-zinc-200 transition-colors flex items-center gap-1.5 active:scale-[0.99]"
                    >
                        <Plus className="size-4" />
                        <span>{t('alarms_add_btn')}</span>
                    </button>
                </div>

                {/* Section 0: Primary Bedtime Target Card */}
                <form onSubmit={handleSavePrimarySchedule} className="bg-[#121215] rounded-2xl p-5 md:p-6 space-y-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-white flex items-center gap-2">
                            <Clock className="size-4 text-emerald-400" />
                            {t('alarms_primary_target')}
                        </span>
                        {saveSuccess && (
                            <span className="text-xs text-emerald-400 flex items-center gap-1">
                                <Check className="size-3.5" />
                                {isTactical ? 'SAVED' : 'บันทึกสำเร็จ'}
                            </span>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                        <div className="space-y-1.5">
                            <label className="text-xs text-zinc-400 font-light flex items-center justify-between">
                                <span>{t('alarms_wake_label')}</span>
                                <span className="text-[11px] text-zinc-500">{isTactical ? '5 CYCLES' : '(คำนวณ 5 Sleep Cycles)'}</span>
                            </label>
                            <input
                                type="time"
                                value={activeWake}
                                onChange={(e) => setActiveWake(e.target.value)}
                                required
                                className="w-full h-11 px-3 bg-[#18181b] text-white rounded-lg border-0 text-lg tabular-nums focus:outline-none focus:ring-1 focus:ring-white/20"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs text-zinc-400 font-light flex items-center justify-between">
                                <span>{t('alarms_sleep_label')}</span>
                                <span className="text-[11px] text-emerald-400 font-medium">{isTactical ? 'DEADLINE' : 'เส้นตายเข้านอน'}</span>
                            </label>
                            <div className="w-full h-11 px-3 bg-[#18181b] text-white rounded-lg flex items-center text-lg tabular-nums">
                                {activeTarget} {isTactical ? 'HRS' : 'น.'}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <span className="text-[11px] text-zinc-500 font-light">
                            {isTactical
                                ? 'CALCULATED: 7 HRS 45 MIN (90 MIN × 5 CYCLES + 15 MIN LATENCY)'
                                : 'คำนวณถอยหลัง 7 ชั่วโมง 45 นาที (90 นาที × 5 รอบ + 15 นาทีเพื่อผล็อยหลับ)'}
                        </span>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="h-9 px-5 rounded-lg bg-white text-zinc-950 text-xs font-medium hover:bg-zinc-200 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                        >
                            {isSaving ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
                            <span>{t('alarms_save_btn')}</span>
                        </button>
                    </div>
                </form>

                {/* Alert Feedback Toast */}
                {alertFeedback && (
                    <div
                        className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
                            alertFeedback.success
                                ? 'bg-emerald-950/60 text-emerald-300'
                                : 'bg-rose-950/60 text-rose-300'
                        }`}
                    >
                        {alertFeedback.success ? (
                            <Check className="size-4 shrink-0 text-emerald-400" />
                        ) : (
                            <AlertCircle className="size-4 shrink-0 text-rose-400" />
                        )}
                        <span>{alertFeedback.message}</span>
                    </div>
                )}

                {/* Section 1: Pre-Bedtime Notification Stages (Core Enforcer) */}
                <div className="bg-[#121215] rounded-2xl p-5 md:p-6 space-y-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-white flex items-center gap-2">
                            <BellRing className="size-4 text-emerald-400" />
                            {t('alarms_rules_title')}
                        </span>
                        <span className="text-xs text-zinc-500 font-light">
                            {isTactical ? '3 ESCALATION TIERS' : '3 ระดับความเข้มข้น'}
                        </span>
                    </div>

                    <div className="space-y-3 pt-1">
                        {alertRules.map((rule) => (
                            <div
                                key={rule.id}
                                className="bg-[#18181b] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors"
                            >
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={`size-2 rounded-full ${
                                                rule.stage === 'deadline'
                                                    ? 'bg-rose-500'
                                                    : rule.stage === 'lockdown'
                                                      ? 'bg-amber-500'
                                                      : 'bg-emerald-500'
                                            }`}
                                        />
                                        <span className="text-xs font-medium text-white">
                                            {rule.title}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-zinc-400 font-light pl-4 leading-relaxed">
                                        {rule.description}
                                    </p>
                                </div>

                                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                                    <button
                                        type="button"
                                        disabled={testingStage === rule.stage}
                                        onClick={() => handleTriggerTest(rule.stage)}
                                        className="h-8 px-3 rounded-lg bg-[#27272a] text-zinc-300 hover:text-white hover:bg-zinc-700 text-[11px] font-normal flex items-center gap-1.5 transition-colors disabled:opacity-50"
                                        title="ทดสอบส่งการแจ้งเตือนไปยัง Discord หรือระบบ"
                                    >
                                        {testingStage === rule.stage ? (
                                            <Loader2 className="size-3 animate-spin" />
                                        ) : (
                                            <Send className="size-3" />
                                        )}
                                        <span>{t('alarms_test_alert')}</span>
                                    </button>

                                    <button
                                        onClick={() => toggleRule(rule.id)}
                                        className={`w-12 h-6 rounded-full transition-colors relative flex items-center p-0.5 shrink-0 ${
                                            rule.enabled ? 'bg-white' : 'bg-zinc-800'
                                        }`}
                                    >
                                        <div
                                            className={`size-5 rounded-full transition-transform ${
                                                rule.enabled
                                                    ? 'bg-zinc-950 translate-x-6'
                                                    : 'bg-zinc-500 translate-x-0'
                                            }`}
                                        />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Section 2: Form to add Custom Bedtime Schedule */}
                {isAddingSchedule && (
                    <form onSubmit={addSchedule} className="bg-[#121215] rounded-2xl p-5 space-y-4 shadow-sm animate-in fade-in">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-white">กำหนดเป้าหมายเวลาเข้านอนใหม่</span>
                            <span className="text-xs text-zinc-500 font-light">คำนวณถอยหลังเพื่อสุขภาพที่ดี</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs text-zinc-400 font-light">เวลาเข้านอนเป้าหมาย</label>
                                <input
                                    type="time"
                                    value={newTime}
                                    onChange={(e) => setNewTime(e.target.value)}
                                    required
                                    className="w-full h-11 px-3 bg-[#18181b] text-white rounded-lg border-0 text-lg tabular-nums focus:outline-none focus:ring-1 focus:ring-white/20"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs text-zinc-400 font-light">ชื่อกำหนดการ</label>
                                <input
                                    type="text"
                                    value={newLabel}
                                    onChange={(e) => setNewLabel(e.target.value)}
                                    placeholder="เช่น วันที่มีเวรดึก"
                                    className="w-full h-11 px-3 bg-[#18181b] text-white rounded-lg border-0 text-sm focus:outline-none focus:ring-1 focus:ring-white/20"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setIsAddingSchedule(false)}
                                className="h-9 px-4 rounded-lg bg-[#18181b] text-zinc-400 hover:text-white text-xs font-normal"
                            >
                                ยกเลิก
                            </button>
                            <button
                                type="submit"
                                className="h-9 px-5 rounded-lg bg-white text-zinc-950 text-xs font-medium hover:bg-zinc-200"
                            >
                                บันทึกเวลาเข้านอน
                            </button>
                        </div>
                    </form>
                )}

                {/* Section 3: Active Bedtime Target List */}
                <div className="bg-[#121215] rounded-2xl p-5 md:p-6 space-y-4 shadow-sm">
                    <span className="text-sm font-medium text-white flex items-center gap-2">
                        <Clock className="size-4 text-zinc-400" />
                        กำหนดการเวลาเข้านอนรายสัปดาห์
                    </span>

                    <div className="space-y-3 pt-1">
                        {bedtimeSchedules.map((item) => (
                            <div
                                key={item.id}
                                className="bg-[#18181b] rounded-xl p-4 flex items-center justify-between text-xs"
                            >
                                <div className="space-y-1">
                                    <div className="flex items-baseline gap-3">
                                        <span
                                            className={`text-2xl md:text-3xl font-medium tracking-tight tabular-nums ${
                                                item.enabled ? 'text-white' : 'text-zinc-600'
                                            }`}
                                        >
                                            {item.bedtime} น.
                                        </span>
                                        <span className="text-xs text-zinc-300 font-normal">{item.label}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[11px] text-zinc-500 font-light">
                                        <Repeat className="size-3 text-zinc-400" />
                                        <span>วันที่มีผล: {item.days.join(', ')}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => deleteSchedule(item.id)}
                                        className="size-8 rounded-lg text-zinc-600 hover:text-rose-400 hover:bg-[#27272a] flex items-center justify-center transition-colors"
                                        title="ลบกำหนดการ"
                                    >
                                        <Trash2 className="size-4" />
                                    </button>

                                    <button
                                        onClick={() => toggleSchedule(item.id)}
                                        className={`w-12 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
                                            item.enabled ? 'bg-white' : 'bg-zinc-800'
                                        }`}
                                    >
                                        <div
                                            className={`size-5 rounded-full transition-transform ${
                                                item.enabled
                                                    ? 'bg-zinc-950 translate-x-6'
                                                    : 'bg-zinc-500 translate-x-0'
                                            }`}
                                        />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
