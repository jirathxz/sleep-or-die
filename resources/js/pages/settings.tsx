import React, { useState } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import { Sliders, Volume2, VolumeX, Moon, Shield, User, Key, Bell, Check, Loader2 } from 'lucide-react';
import { useSleepStore } from '@/stores/useSleepStore';

export default function SettingsPage() {
    const { auth } = usePage().props as { auth?: { user?: any } };
    const user = auth?.user;

    const {
        wake_up_time,
        discord_user_id,
        discord_bot_token,
        audioEnabled,
        toggleAudio,
        saveSettings,
    } = useSleepStore();

    const [wakeTime, setWakeTime] = useState(wake_up_time || '07:00');
    const [discordId, setDiscordId] = useState(discord_user_id || '');
    const [discordToken, setDiscordToken] = useState(discord_bot_token || '');
    const [showToken, setShowToken] = useState(false);
    const [savedSuccess, setSavedSuccess] = useState(false);
    const [saving, setSaving] = useState(false);

    // Profile state
    const [name, setName] = useState(user?.name || 'Guest');
    const [email, setEmail] = useState(user?.email || '');

    const handleSaveSleep = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        const ok = await saveSettings(wakeTime, discordId, discordToken);
        setSaving(false);
        if (ok) {
            setSavedSuccess(true);
            setTimeout(() => setSavedSuccess(false), 3000);
        }
    };

    return (
        <>
            <Head title="ตั้งค่าระบบ - SleepOrDie" />

            <div className="max-w-3xl w-full mx-auto p-4 md:p-6 space-y-6 select-none">
                {/* Header */}
                <div>
                    <h1 className="text-xl font-medium tracking-tight text-white">
                        การตั้งค่าระบบ
                    </h1>
                    <p className="text-xs text-zinc-500 font-light mt-0.5">
                        รวมศูนย์การควบคุมพารามิเตอร์การนอนหลับ เสียง และบัญชีผู้ใช้ไว้ในหน้าเดียว
                    </p>
                </div>

                {/* Section 1: Sleep Target & Discord Guard */}
                <form onSubmit={handleSaveSleep} className="bg-[#121215] rounded-2xl p-5 md:p-6 space-y-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-white flex items-center gap-2">
                            <Moon className="size-4 text-emerald-400" />
                            พารามิเตอร์การนอนหลับและการตรวจจับ
                        </span>
                        {savedSuccess && (
                            <span className="text-xs text-emerald-400 flex items-center gap-1">
                                <Check className="size-3.5" /> บันทึกสำเร็จ
                            </span>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                        <div className="space-y-1.5">
                            <label className="text-xs text-zinc-400 font-light">เวลาตื่นเป้าหมาย</label>
                            <input
                                type="time"
                                value={wakeTime}
                                onChange={(e) => setWakeTime(e.target.value)}
                                required
                                className="w-full h-11 px-3 bg-[#18181b] text-white rounded-lg border-0 text-base tabular-nums focus:outline-none focus:ring-1 focus:ring-white/20"
                            />
                            <p className="text-[11px] text-zinc-500 font-light">
                                คำนวณเวลานอนอัตโนมัติ 5 รอบการนอน เผื่อเวลาหลับ 15 นาที
                            </p>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs text-zinc-400 font-light">Discord User ID</label>
                            <input
                                type="text"
                                value={discordId}
                                onChange={(e) => setDiscordId(e.target.value)}
                                placeholder="เช่น 123456789012345678"
                                className="w-full h-11 px-3 bg-[#18181b] text-white rounded-lg border-0 text-sm focus:outline-none focus:ring-1 focus:ring-white/20"
                            />
                            <p className="text-[11px] text-zinc-500 font-light">
                                บอท Discord จะตรวจจับสถานะออฟไลน์ในช่วงเวลานอน
                            </p>
                        </div>

                        <div className="space-y-1.5 sm:col-span-2">
                            <div className="flex items-center justify-between">
                                <label className="text-xs text-zinc-400 font-light flex items-center gap-1.5">
                                    <Key className="size-3 text-zinc-400" />
                                    Token Bot Discord
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setShowToken(!showToken)}
                                    className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors"
                                >
                                    {showToken ? 'ซ่อน' : 'แสดง'}
                                </button>
                            </div>
                            <input
                                type={showToken ? 'text' : 'password'}
                                value={discordToken}
                                onChange={(e) => setDiscordToken(e.target.value)}
                                placeholder="เช่น MTIzNDU2Nzg5MDEyMzQ1Njc4.xxxxxx.xxxxxx"
                                className="w-full h-11 px-3 bg-[#18181b] text-white rounded-lg border-0 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-white/20"
                            />
                            <p className="text-[11px] text-zinc-500 font-light">
                                โทเค็นบอท Discord สำหรับการเฝ้าระวังสถานะอัตโนมัติ
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <button
                            type="submit"
                            disabled={saving}
                            className="h-10 px-5 rounded-lg bg-white text-zinc-950 text-xs font-medium hover:bg-zinc-200 transition-colors flex items-center gap-2 active:scale-[0.99]"
                        >
                            {saving && <Loader2 className="size-3.5 animate-spin" />}
                            <span>บันทึกพารามิเตอร์การนอน</span>
                        </button>
                    </div>
                </form>

                {/* Section 2: Audio & Alert Notifications */}
                <div className="bg-[#121215] rounded-2xl p-5 md:p-6 space-y-4 shadow-sm">
                    <span className="text-sm font-medium text-white flex items-center gap-2">
                        <Volume2 className="size-4 text-zinc-400" />
                        เสียงเตือนและสัญญาณไซเรน
                    </span>

                    <div className="bg-[#18181b] rounded-xl p-4 flex items-center justify-between text-xs">
                        <div className="space-y-0.5">
                            <span className="font-normal text-white">เสียงไซเรนฉุกเฉินความถี่สูง</span>
                            <p className="text-[11px] text-zinc-500 font-light">
                                บังคับเล่นเสียงเตือนเมื่อหลอดเลือดลดลง หรือเลยเวลาเส้นตาย
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => toggleAudio()}
                            className={`h-9 px-4 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                                audioEnabled
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : 'bg-zinc-800 text-zinc-500'
                            }`}
                        >
                            {audioEnabled ? <Volume2 className="size-3.5" /> : <VolumeX className="size-3.5" />}
                            <span>{audioEnabled ? 'เปิดใช้งานอยู่' : 'ปิดเสียง'}</span>
                        </button>
                    </div>
                </div>

                {/* Section 3: Profile & Security (Unified) */}
                <div className="bg-[#121215] rounded-2xl p-5 md:p-6 space-y-4 shadow-sm">
                    <span className="text-sm font-medium text-white flex items-center gap-2">
                        <User className="size-4 text-zinc-400" />
                        ข้อมูลบัญชีผู้ใช้และความปลอดภัย
                    </span>

                    {user ? (
                        <div className="space-y-3 pt-1 text-xs">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <span className="text-zinc-500 font-light">ชื่อผู้ใช้งาน</span>
                                    <p className="text-sm font-normal text-white">{user.name}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-zinc-500 font-light">อีเมล</span>
                                    <p className="text-sm font-normal text-white">{user.email}</p>
                                </div>
                            </div>

                            <div className="pt-2 flex justify-end">
                                <button
                                    onClick={() => router.post('/logout')}
                                    className="h-9 px-4 rounded-lg bg-[#18181b] text-zinc-400 hover:text-rose-400 text-xs font-normal transition-colors"
                                >
                                    ออกจากระบบ
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-[#18181b] rounded-xl p-4 flex items-center justify-between text-xs">
                            <div className="space-y-0.5">
                                <span className="font-normal text-white">กำลังใช้งานในฐานะ Guest</span>
                                <p className="text-[11px] text-zinc-500 font-light">
                                    สมัครสมาชิกเพื่อบันทึกประวัติการนอน สถิติ และเลเวลอย่างถาวร
                                </p>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => router.visit('/login')}
                                    className="h-8 px-3 rounded-lg text-xs text-zinc-400 hover:text-white"
                                >
                                    เข้าสู่ระบบ
                                </button>
                                <button
                                    onClick={() => router.visit('/register')}
                                    className="h-8 px-3.5 rounded-lg bg-white text-zinc-950 font-medium text-xs hover:bg-zinc-200"
                                >
                                    สมัครสมาชิก
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
