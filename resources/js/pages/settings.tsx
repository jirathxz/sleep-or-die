import React, { useState, useEffect } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import { Sliders, Volume2, VolumeX, Moon, Shield, User, Key, Bell, Check, Loader2, Bot, AlertCircle, CheckCircle2 } from 'lucide-react';
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
        testDiscordConnection,
    } = useSleepStore();

    const [wakeTime, setWakeTime] = useState(wake_up_time || user?.wake_up_time || '07:00');
    const [discordId, setDiscordId] = useState(discord_user_id || user?.discord_user_id || '');
    const [discordToken, setDiscordToken] = useState(discord_bot_token || user?.discord_bot_token || '');
    const [showToken, setShowToken] = useState(false);
    const [savedSuccess, setSavedSuccess] = useState(false);
    const [saving, setSaving] = useState(false);

    // Discord test state
    const [testingDiscord, setTestingDiscord] = useState(false);
    const [testResult, setTestResult] = useState<{
        success: boolean;
        message: string;
        bot?: { id: string; username: string };
        target_user?: { found: boolean; username?: string; global_name?: string; message?: string } | null;
    } | null>(null);

    // Sync from user if auth loads or updates
    useEffect(() => {
        if (user?.discord_bot_token && !discordToken) {
            setDiscordToken(user.discord_bot_token);
        }
        if (user?.discord_user_id && !discordId) {
            setDiscordId(user.discord_user_id);
        }
        if (user?.wake_up_time && wakeTime === '07:00') {
            setWakeTime(user.wake_up_time);
        }
    }, [user?.discord_bot_token, user?.discord_user_id, user?.wake_up_time]);

    const handleTestDiscord = async () => {
        if (!discordToken) {
            setTestResult({
                success: false,
                message: 'กรุณากรอก Token บอท Discord ก่อนกดทดสอบการเชื่อมต่อ',
            });
            return;
        }

        setTestingDiscord(true);
        setTestResult(null);

        const res = await testDiscordConnection(discordToken, discordId);
        setTestingDiscord(false);
        setTestResult(res);
    };

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

                        <div className="space-y-2 sm:col-span-2">
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
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-1">
                                <p className="text-[11px] text-zinc-500 font-light">
                                    โทเค็นบอท Discord สำหรับการเฝ้าระวังสถานะอัตโนมัติ
                                </p>
                                <button
                                    type="button"
                                    onClick={handleTestDiscord}
                                    disabled={testingDiscord || !discordToken}
                                    className="h-8 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-normal transition-colors flex items-center gap-1.5 self-start sm:self-auto disabled:opacity-40 active:scale-[0.98]"
                                >
                                    {testingDiscord ? (
                                        <Loader2 className="size-3.5 animate-spin" />
                                    ) : (
                                        <Bot className="size-3.5 text-indigo-400" />
                                    )}
                                    <span>{testingDiscord ? 'กำลังตรวจสอบการเชื่อมต่อ' : 'ทดสอบการเชื่อมต่อ Discord'}</span>
                                </button>
                            </div>

                            {/* Test Result Feedback */}
                            {testResult && (
                                <div
                                    className={`p-3.5 rounded-xl text-xs flex flex-col gap-1.5 transition-all mt-1 ${
                                        testResult.success
                                            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
                                            : 'bg-rose-500/10 border border-rose-500/20 text-rose-300'
                                    }`}
                                >
                                    <div className="flex items-center gap-2 font-medium">
                                        {testResult.success ? (
                                            <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                                        ) : (
                                            <AlertCircle className="size-4 text-rose-400 shrink-0" />
                                        )}
                                        <span>{testResult.message}</span>
                                    </div>

                                    {testResult.success && testResult.bot && (
                                        <div className="pl-6 text-[11px] text-zinc-300 space-y-0.5 font-light">
                                            <p>ชื่อบอท: <span className="font-medium text-white">{testResult.bot.username}</span></p>
                                            <p className="font-mono text-zinc-400 text-[10px]">ID บอท: {testResult.bot.id}</p>
                                            {testResult.target_user && (
                                                <p className={testResult.target_user.found ? 'text-emerald-400' : 'text-amber-400'}>
                                                    {testResult.target_user.found
                                                        ? `ตรวจพบผู้ใช้เป้าหมาย: ${testResult.target_user.global_name || testResult.target_user.username}`
                                                        : testResult.target_user.message}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
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
