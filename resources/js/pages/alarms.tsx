import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { AlarmClock, Plus, Bell, Volume2, Repeat, Check, Trash2 } from 'lucide-react';
import { useSleepStore } from '@/stores/useSleepStore';

interface AlarmItem {
    id: string;
    time: string;
    label: string;
    enabled: boolean;
    repeatDays: string[];
    sound: string;
    snoozeMinutes: number;
}

export default function Alarms() {
    const { wake_up_time } = useSleepStore();

    const [alarms, setAlarms] = useState<AlarmItem[]>([
        {
            id: '1',
            time: wake_up_time || '07:00',
            label: 'เวลาตื่นหลักตามรอบการนอน',
            enabled: true,
            repeatDays: ['จ', 'อ', 'พ', 'พฤ', 'ศ'],
            sound: 'Siren Emergency Pulse',
            snoozeMinutes: 5,
        },
        {
            id: '2',
            time: '06:45',
            label: 'เตรียมตัวตื่นล่วงหน้า',
            enabled: false,
            repeatDays: ['จ', 'อ', 'พ', 'พฤ', 'ศ'],
            sound: 'Gentle Chime',
            snoozeMinutes: 10,
        },
    ]);

    const [newTime, setNewTime] = useState('07:00');
    const [newLabel, setNewLabel] = useState('เวลาตื่นใหม่');
    const [isCreating, setIsCreating] = useState(false);

    const toggleAlarm = (id: string) => {
        setAlarms((prev) =>
            prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a))
        );
    };

    const addAlarm = (e: React.FormEvent) => {
        e.preventDefault();
        const created: AlarmItem = {
            id: Date.now().toString(),
            time: newTime,
            label: newLabel,
            enabled: true,
            repeatDays: ['จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส', 'อา'],
            sound: 'Standard Tone',
            snoozeMinutes: 5,
        };
        setAlarms((prev) => [...prev, created]);
        setIsCreating(false);
    };

    const deleteAlarm = (id: string) => {
        setAlarms((prev) => prev.filter((a) => a.id !== id));
    };

    return (
        <>
            <Head title="นาฬิกาปลุก - SleepOrDie" />

            <div className="max-w-3xl w-full mx-auto p-4 md:p-6 space-y-6 select-none">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-medium tracking-tight text-white">
                            นาฬิกาปลุก (Smart Alarms)
                        </h1>
                        <p className="text-xs text-zinc-500 font-light mt-0.5">
                            จัดการเวลาปลุกตามรอบการหลับลึกเพื่อความสดชื่นสูงสุด
                        </p>
                    </div>

                    <button
                        onClick={() => setIsCreating(!isCreating)}
                        className="h-9 px-3.5 rounded-lg bg-white text-zinc-950 text-xs font-medium hover:bg-zinc-200 transition-colors flex items-center gap-1.5 active:scale-[0.99]"
                    >
                        <Plus className="size-4" />
                        <span>เพิ่มเวลาปลุก</span>
                    </button>
                </div>

                {/* Create Form Drawer / Tonal Surface */}
                {isCreating && (
                    <form onSubmit={addAlarm} className="bg-[#121215] rounded-2xl p-5 space-y-4 shadow-sm animate-in fade-in">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-white">กำหนดเวลาปลุกใหม่</span>
                            <span className="text-xs text-zinc-500 font-light">คำนวณตามรอบ 90 นาที</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs text-zinc-400 font-light">เวลาปลุก</label>
                                <input
                                    type="time"
                                    value={newTime}
                                    onChange={(e) => setNewTime(e.target.value)}
                                    required
                                    className="w-full h-11 px-3 bg-[#18181b] text-white rounded-lg border-0 text-lg tabular-nums focus:outline-none focus:ring-1 focus:ring-white/20"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs text-zinc-400 font-light">ชื่อการปลุก</label>
                                <input
                                    type="text"
                                    value={newLabel}
                                    onChange={(e) => setNewLabel(e.target.value)}
                                    placeholder="เช่น ตื่นไปออกกำลังกาย"
                                    className="w-full h-11 px-3 bg-[#18181b] text-white rounded-lg border-0 text-sm focus:outline-none focus:ring-1 focus:ring-white/20"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setIsCreating(false)}
                                className="h-9 px-4 rounded-lg bg-[#18181b] text-zinc-400 hover:text-white text-xs font-normal"
                            >
                                ยกเลิก
                            </button>
                            <button
                                type="submit"
                                className="h-9 px-5 rounded-lg bg-white text-zinc-950 text-xs font-medium hover:bg-zinc-200"
                            >
                                บันทึก
                            </button>
                        </div>
                    </form>
                )}

                {/* Alarm List (No Border, Tonal Surface) */}
                <div className="space-y-3">
                    {alarms.map((alarm) => (
                        <div
                            key={alarm.id}
                            className="bg-[#121215] rounded-2xl p-5 flex items-center justify-between shadow-sm transition-all"
                        >
                            <div className="space-y-1">
                                <div className="flex items-baseline gap-3">
                                    <span
                                        className={`text-3xl md:text-4xl font-medium tracking-tight tabular-nums ${
                                            alarm.enabled ? 'text-white' : 'text-zinc-600'
                                        }`}
                                    >
                                        {alarm.time}
                                    </span>
                                    <span className="text-xs text-zinc-400 font-light">{alarm.label}</span>
                                </div>

                                <div className="flex items-center gap-3 text-xs text-zinc-500 font-light pt-1">
                                    <span className="flex items-center gap-1">
                                        <Repeat className="size-3 text-zinc-400" />
                                        <span>{alarm.repeatDays.join(', ')}</span>
                                    </span>
                                    <span>•</span>
                                    <span>Snooze {alarm.snoozeMinutes} นาที</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => deleteAlarm(alarm.id)}
                                    className="size-8 rounded-lg text-zinc-600 hover:text-rose-400 hover:bg-[#18181b] flex items-center justify-center transition-colors"
                                    title="ลบเวลาปลุก"
                                >
                                    <Trash2 className="size-4" />
                                </button>

                                <button
                                    onClick={() => toggleAlarm(alarm.id)}
                                    className={`w-12 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
                                        alarm.enabled ? 'bg-white' : 'bg-zinc-800'
                                    }`}
                                >
                                    <div
                                        className={`size-5 rounded-full transition-transform ${
                                            alarm.enabled
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
        </>
    );
}
