import React, { useState, useEffect } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import { Sliders, Volume2, VolumeX, Moon, Shield, User, Key, Bell, Check, Loader2, Bot, AlertCircle, CheckCircle2, Send, HelpCircle, Palette, Square, Circle, Languages } from 'lucide-react';
import { useSleepStore } from '@/stores/useSleepStore';

export default function SettingsPage() {
    const { auth } = usePage().props as { auth?: { user?: any } };
    const user = auth?.user;

    const {
        wake_up_time,
        sleep_target_time,
        discord_user_id,
        discord_bot_token,
        emergency_countdown_seconds,
        enable_discord_detection,
        enable_cpp_detection,
        test_mode,
        is_system_active,
        theme_preference,
        border_style,
        setThemePreference,
        setBorderStyle,
        audioEnabled,
        toggleAudio,
        saveSettings,
        testDiscordConnection,
        testAlert,
        fetchStatus,
    } = useSleepStore();

    const [bedtime, setBedtime] = useState(sleep_target_time || user?.sleep_target_time || '23:00');
    const [wakeTime, setWakeTime] = useState(wake_up_time || user?.wake_up_time || '07:00');
    const [discordId, setDiscordId] = useState(discord_user_id || user?.discord_user_id || '');
    const [discordToken, setDiscordToken] = useState(discord_bot_token || user?.discord_bot_token || '');
    const [countdownSeconds, setCountdownSeconds] = useState(
        emergency_countdown_seconds || user?.emergency_countdown_seconds || 60
    );
    const [enableDiscord, setEnableDiscord] = useState(
        enable_discord_detection !== undefined ? enable_discord_detection : (user?.enable_discord_detection ?? true)
    );
    const [enableCpp, setEnableCpp] = useState(
        enable_cpp_detection !== undefined ? enable_cpp_detection : (user?.enable_cpp_detection ?? true)
    );
    const [testMode, setTestMode] = useState(
        test_mode !== undefined ? test_mode : (user?.test_mode ?? true)
    );
    const [showToken, setShowToken] = useState(false);
    const [savedSuccess, setSavedSuccess] = useState(false);
    const [saving, setSaving] = useState(false);
    const [languageMode, setLanguageMode] = useState<string>(() => {
        return typeof window !== 'undefined' ? localStorage.getItem('sleep_language_mode') || 'normal' : 'normal';
    });

    const handleLanguageChange = (mode: 'normal' | 'tactical') => {
        setLanguageMode(mode);
        if (typeof window !== 'undefined') {
            localStorage.setItem('sleep_language_mode', mode);
            window.dispatchEvent(new Event('sleep_language_mode_changed'));
        }
    };

    // Discord test states
    const [testingDiscord, setTestingDiscord] = useState(false);
    const [testResult, setTestResult] = useState<{
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
    } | null>(null);

    const [sendingTestDm, setSendingTestDm] = useState(false);
    const [dmResult, setDmResult] = useState<{
        success: boolean;
        message: string;
        error_code?: number;
    } | null>(null);

    // Initial fetch on mount to pull latest persisted user settings
    useEffect(() => {
        fetchStatus();
    }, []);

    // Sync from store or user prop when updated
    useEffect(() => {
        if (sleep_target_time) {
            setBedtime(sleep_target_time);
        } else if (user?.sleep_target_time) {
            setBedtime(user.sleep_target_time);
        }

        if (discord_bot_token) {
            setDiscordToken(discord_bot_token);
        } else if (user?.discord_bot_token) {
            setDiscordToken(user.discord_bot_token);
        }

        if (discord_user_id) {
            setDiscordId(discord_user_id);
        } else if (user?.discord_user_id) {
            setDiscordId(user.discord_user_id);
        }

        if (wake_up_time) {
            setWakeTime(wake_up_time);
        } else if (user?.wake_up_time) {
            setWakeTime(user.wake_up_time);
        }

        if (emergency_countdown_seconds) {
            setCountdownSeconds(emergency_countdown_seconds);
        } else if (user?.emergency_countdown_seconds) {
            setCountdownSeconds(user.emergency_countdown_seconds);
        }

        if (enable_discord_detection !== undefined) {
            setEnableDiscord(enable_discord_detection);
        } else if (user?.enable_discord_detection !== undefined) {
            setEnableDiscord(user.enable_discord_detection);
        }

        if (enable_cpp_detection !== undefined) {
            setEnableCpp(enable_cpp_detection);
        } else if (user?.enable_cpp_detection !== undefined) {
            setEnableCpp(user.enable_cpp_detection);
        }

        if (test_mode !== undefined) {
            setTestMode(test_mode);
        } else if (user?.test_mode !== undefined) {
            setTestMode(user.test_mode);
        }
    }, [sleep_target_time, discord_bot_token, discord_user_id, wake_up_time, emergency_countdown_seconds, enable_discord_detection, enable_cpp_detection, test_mode, user]);

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

    const handleSendTestDm = async () => {
        if (!discordToken || !discordId) {
            setDmResult({
                success: false,
                message: 'กรุณากรอกทั้ง Discord Bot Token และ Discord User ID ก่อนทดสอบส่งข้อความ',
            });
            return;
        }

        setSendingTestDm(true);
        setDmResult(null);

        const res = await testAlert('test', discordToken, discordId);
        setSendingTestDm(false);
        setDmResult(res);
    };

    const handleSaveSleep = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        const ok = await saveSettings(
            wakeTime,
            discordId,
            discordToken,
            Number(countdownSeconds),
            bedtime,
            enableDiscord,
            enableCpp,
            testMode
        );
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
                            <label className="text-xs text-zinc-400 font-light flex items-center justify-between">
                                <span>เวลานอนที่ต้องการ (Target Bedtime)</span>
                                <span className="text-[11px] text-emerald-400 font-normal">ตั้งเพียงเวลาเดียว</span>
                            </label>
                            <input
                                type="time"
                                value={bedtime}
                                onChange={(e) => setBedtime(e.target.value)}
                                required
                                className="w-full h-11 px-3 bg-[#18181b] text-white rounded-lg border-0 text-base tabular-nums focus:outline-none focus:ring-1 focus:ring-white/20"
                            />
                            <p className="text-[11px] text-zinc-500 font-light">
                                กำหนดเวลานอนเพียงเวลาเดียว ระบบเฝ้าระวัง C++ และแจ้งเตือนจะเริ่มนับถอยหลังสู่นาทีเข้านอนนี้
                            </p>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs text-zinc-400 font-light flex items-center justify-between">
                                <span>Discord User ID (ID บัญชีของคุณ)</span>
                                <span className="text-[10px] text-zinc-500 font-mono">ตัวเลข 17-19 หลัก</span>
                            </label>
                            <input
                                type="text"
                                value={discordId}
                                onChange={(e) => setDiscordId(e.target.value)}
                                placeholder="เช่น 249539345269784576"
                                className="w-full h-11 px-3 bg-[#18181b] text-white rounded-lg border-0 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-white/20"
                            />
                            <p className="text-[11px] text-zinc-500 font-light">
                                วิธีคัดลอก: ใน Discord ไปที่ Settings &gt; Advanced &gt; เปิด Developer Mode &gt; คลิกขวาที่โปรไฟล์ตัวเอง &gt; กด "Copy User ID"
                            </p>
                        </div>

                        <div className="space-y-1.5 sm:col-span-2">
                            <label className="text-xs text-zinc-400 font-light flex items-center justify-between">
                                <span>เวลานับถอยหลังฉุกเฉิน (วินาที)</span>
                                <span className="text-xs text-amber-400 font-mono font-medium">{countdownSeconds} วินาที</span>
                            </label>
                            <input
                                type="number"
                                min={10}
                                max={300}
                                value={countdownSeconds}
                                onChange={(e) => setCountdownSeconds(Math.max(10, Math.min(300, parseInt(e.target.value) || 60)))}
                                required
                                className="w-full h-11 px-3 bg-[#18181b] text-white rounded-lg border-0 text-base tabular-nums focus:outline-none focus:ring-1 focus:ring-white/20"
                            />
                            <p className="text-[11px] text-zinc-500 font-light">
                                ระยะเวลาผ่อนผันก่อนเครื่องสลีป/ชัตดาวน์ (10 - 300 วินาที, ค่าเริ่มต้น 60 วินาที มีผลต่อโปรแกรม C++ และ Dashboard)
                            </p>
                        </div>

                        {/* Detection Channels Toggles (Discord Bot & C++ Desktop Guard) */}
                        <div className="space-y-3 sm:col-span-2 pt-2 border-t border-white/5">
                            <div className="flex items-center justify-between">
                                <label className="text-xs text-zinc-300 font-medium flex items-center gap-1.5">
                                    <Shield className="size-3.5 text-emerald-400" />
                                    <span>ช่องทางการตรวจจับการนอน (Detection Channels)</span>
                                </label>
                                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                                    (enableDiscord || enableCpp)
                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse'
                                }`}>
                                    {(enableDiscord || enableCpp) ? '● ระบบทำงาน' : '● ระบบไม่ทำงาน (หยุดชั่วคราว)'}
                                </span>
                            </div>

                            {/* Warning if both toggles are off */}
                            {!enableDiscord && !enableCpp && (
                                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-300 flex items-start gap-2">
                                    <AlertCircle className="size-4 text-rose-400 shrink-0 mt-0.5" />
                                    <div className="space-y-0.5">
                                        <p className="font-medium text-rose-200">ระบบไม่ถือว่าทำงาน (Inactive)</p>
                                        <p className="text-[11px] text-rose-300/80 font-light">
                                            หากคุณปิดการตรวจจับทั้ง Discord และ C++ Guard ระบบจะไม่บังคับเวลานอน ไม่มีการนับถอยหลังฉุกเฉิน และไม่หักเลือด กรุณาเปิดใช้งานอย่างน้อย 1 ช่องทาง
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {/* Toggle 1: Discord Bot */}
                                <div className={`p-3.5 rounded-xl border transition-all ${
                                    enableDiscord
                                        ? 'bg-[#18181b] border-white/10'
                                        : 'bg-[#141416] border-white/5 opacity-70'
                                }`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Bot className={`size-4 ${enableDiscord ? 'text-indigo-400' : 'text-zinc-500'}`} />
                                            <span className="text-xs font-medium text-white">ตรวจจับผ่าน Discord Bot</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setEnableDiscord(!enableDiscord)}
                                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                                enableDiscord ? 'bg-indigo-600' : 'bg-zinc-700'
                                            }`}
                                        >
                                            <span
                                                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                                                    enableDiscord ? 'translate-x-4' : 'translate-x-0'
                                                }`}
                                            />
                                        </button>
                                    </div>
                                    <p className="text-[11px] text-zinc-400 font-light mt-1.5 leading-relaxed">
                                        ตรวจจับสถานะออฟไลน์ และเฝ้าระวังไม่ให้อยู่ในห้องคุยเสียง Discord ในช่วงเวลานอน
                                    </p>
                                </div>

                                {/* Toggle 2: C++ Guard */}
                                <div className={`p-3.5 rounded-xl border transition-all ${
                                    enableCpp
                                        ? 'bg-[#18181b] border-white/10'
                                        : 'bg-[#141416] border-white/5 opacity-70'
                                }`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Shield className={`size-4 ${enableCpp ? 'text-emerald-400' : 'text-zinc-500'}`} />
                                            <span className="text-xs font-medium text-white">ตรวจจับผ่าน C++ Guard</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setEnableCpp(!enableCpp)}
                                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                                enableCpp ? 'bg-emerald-600' : 'bg-zinc-700'
                                            }`}
                                        >
                                            <span
                                                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                                                    enableCpp ? 'translate-x-4' : 'translate-x-0'
                                                }`}
                                            />
                                        </button>
                                    </div>
                                    <p className="text-[11px] text-zinc-400 font-light mt-1.5 leading-relaxed">
                                        เฝ้าระวังการใช้งานเมาส์/คีย์บอร์ด, การล็อกหน้าจอ LockWorkStation และสั่งสลีปเครื่องผ่าน C++ Tray
                                    </p>
                                </div>
                            </div>

                            {/* Toggle 3: Test Mode Toggle (Safe Mock Mode vs Live Hardcore Mode) */}
                            <div className={`p-4 rounded-xl border transition-all ${
                                testMode
                                    ? 'bg-[#18181b] border-amber-500/30'
                                    : 'bg-[#18181b] border-rose-500/40'
                            }`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Shield className={`size-4 ${testMode ? 'text-amber-400' : 'text-rose-500'}`} />
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-medium text-white">โหมดทดสอบ (Test Mode Toggle)</span>
                                                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase ${
                                                    testMode
                                                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                                }`}>
                                                    {testMode ? 'Mock Only (จำลอง)' : 'Live Hardcore (จริง)'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setTestMode(!testMode)}
                                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                            testMode ? 'bg-amber-500' : 'bg-zinc-700'
                                        }`}
                                    >
                                        <span
                                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                                                testMode ? 'translate-x-4' : 'translate-x-0'
                                            }`}
                                        />
                                    </button>
                                </div>
                                <div className="mt-2 text-[11px] leading-relaxed">
                                    {testMode ? (
                                        <p className="text-amber-300/90 font-light">
                                            🟡 <span className="font-medium text-amber-200">เปิดอยู่ (ON):</span> ปลอดภัยสำหรับทดสอบ — เมื่อเข้าสู่ช่วง Lockdown หรือ Shutdown โปรแกรม C++ จะแสดงเพียงกล่องข้อความ <strong>MessageBox</strong> แจ้งเตือนเท่านั้น โดยไม่ล็อกหน้าจอหรือปิดคอมพิวเตอร์จริง
                                        </p>
                                    ) : (
                                        <p className="text-rose-300/90 font-light">
                                            🔴 <span className="font-medium text-rose-200">ปิดอยู่ (OFF):</span> โหมดวินัยเข้มงวด — โปรแกรม C++ จะทำการล็อกหน้าจอจริง (<strong>LockWorkStation</strong>) และสั่งปิดเครื่องจริง (<strong>System Shutdown</strong>) เมื่อ HP หมดหรือถึงเส้นตาย!
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2 sm:col-span-2">
                            <div className="flex items-center justify-between">
                                <label className="text-xs text-zinc-400 font-light flex items-center gap-1.5">
                                    <Key className="size-3 text-zinc-400" />
                                    <span>Token Bot Discord (โทเค็นบอทประจำบัญชีคุณ)</span>
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
                                แหล่งที่มา: <a href="https://discord.com/developers/applications" target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline">Discord Developer Portal</a> &gt; Application ของคุณ &gt; แท็บ Bot &gt; Reset Token / Copy
                            </p>

                            {/* Dual action buttons: Verify Bot status & Send real test DM */}
                            <div className="flex flex-wrap items-center gap-2 pt-1">
                                <button
                                    type="button"
                                    onClick={handleTestDiscord}
                                    disabled={testingDiscord || sendingTestDm || !discordToken}
                                    className="h-8 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-normal transition-colors flex items-center gap-1.5 disabled:opacity-40 active:scale-[0.98]"
                                >
                                    {testingDiscord ? (
                                        <Loader2 className="size-3.5 animate-spin" />
                                    ) : (
                                        <Bot className="size-3.5 text-indigo-400" />
                                    )}
                                    <span>{testingDiscord ? 'กำลังตรวจสอบ...' : 'ตรวจสอบสถานะบอท'}</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={handleSendTestDm}
                                    disabled={testingDiscord || sendingTestDm || !discordToken || !discordId}
                                    className="h-8 px-3.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors flex items-center gap-1.5 disabled:opacity-40 active:scale-[0.98] shadow-sm"
                                >
                                    {sendingTestDm ? (
                                        <Loader2 className="size-3.5 animate-spin" />
                                    ) : (
                                        <Send className="size-3.5" />
                                    )}
                                    <span>{sendingTestDm ? 'กำลังส่ง DM...' : 'ส่งข้อความทดสอบเข้า Discord ของฉัน'}</span>
                                </button>
                            </div>

                            {/* Connection Check Result Feedback */}
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
                                        <div className="pl-6 text-[11px] text-zinc-300 space-y-1 font-light">
                                            <p>ชื่อบอท: <span className="font-medium text-white">{testResult.bot.username}</span> <span className="text-[10px] text-emerald-400 ml-1">● บอทเชื่อมต่อสำเร็จ</span></p>
                                            <p className="font-mono text-zinc-400 text-[10px]">ID บอท: {testResult.bot.id}</p>
                                            {testResult.target_user && (
                                                testResult.target_user.found ? (
                                                    <div className="mt-2 pt-2 border-t border-white/10 space-y-1">
                                                        <p className="text-white font-medium">
                                                            ผู้ใช้เป้าหมาย: {testResult.target_user.global_name || testResult.target_user.username}
                                                        </p>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px]">
                                                            <p className="text-zinc-300">
                                                                1. สถานะที่ตั้งไว้: <span className="font-mono text-white uppercase">{testResult.target_user.raw_status || 'OFFLINE'}</span>
                                                            </p>
                                                            <p className="text-zinc-300">
                                                                2. ห้องคุยเสียง: <span className={testResult.target_user.is_in_voice ? 'text-emerald-400 font-medium' : 'text-zinc-400'}>
                                                                    {testResult.target_user.is_in_voice
                                                                        ? `อยู่ในห้อง "${testResult.target_user.voice_channel}"`
                                                                        : 'ไม่ได้อยู่ในห้องคุย'}
                                                                </span>
                                                            </p>
                                                        </div>
                                                        <p className="text-xs pt-1 flex items-center gap-1.5 font-medium">
                                                            <span className="text-zinc-300">ผลการประเมิน:</span>
                                                            <span className={testResult.target_user.is_considered_online ? 'text-emerald-400 flex items-center gap-1.5' : 'text-zinc-400 flex items-center gap-1.5'}>
                                                                <span className={`size-2 rounded-full ${testResult.target_user.is_considered_online ? 'bg-emerald-400' : 'bg-zinc-500'}`} />
                                                                {testResult.target_user.is_considered_online ? 'ถือว่าออนไลน์ (ONLINE)' : 'ถือว่าออฟไลน์ (OFFLINE)'}
                                                            </span>
                                                        </p>
                                                        {testResult.target_user.reason && (
                                                            <p className="text-[10px] text-zinc-400 font-light italic">
                                                                {testResult.target_user.reason}
                                                            </p>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <p className="text-amber-400">{testResult.target_user.message}</p>
                                                )
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Test DM Send Result Feedback */}
                            {dmResult && (
                                <div
                                    className={`p-3.5 rounded-xl text-xs flex flex-col gap-1.5 transition-all mt-1 ${
                                        dmResult.success
                                            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
                                            : 'bg-rose-500/10 border border-rose-500/20 text-rose-300'
                                    }`}
                                >
                                    <div className="flex items-center gap-2 font-medium">
                                        {dmResult.success ? (
                                            <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                                        ) : (
                                            <AlertCircle className="size-4 text-rose-400 shrink-0" />
                                        )}
                                        <span>{dmResult.message}</span>
                                    </div>

                                    {dmResult.error_code === 50007 && (
                                        <div className="mt-1.5 p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-[11px] text-amber-300 space-y-1">
                                            <p className="font-semibold">คำแนะนำในการแก้ไขปัญหา Error 50007:</p>
                                            <ol className="list-decimal list-inside space-y-0.5 text-zinc-300 font-light">
                                                <li>บอทและคุณต้องแชร์ Discord Server เดียวกันอย่างน้อย 1 เซิร์ฟเวอร์ (เชิญบอทเข้า Discord Server ที่คุณอยู่)</li>
                                                <li>เปิดรับข้อความส่วนตัว: ไปที่ Server Settings &gt; Privacy Settings หรือ User Settings &gt; Privacy &amp; Safety &gt; เปิด "Allow direct messages from server members"</li>
                                            </ol>
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

                {/* Section: Theme & Interface Styling */}
                <div className="bg-[#121215] rounded-2xl p-5 md:p-6 space-y-4 shadow-sm border border-white/5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span className="text-sm font-medium text-white flex items-center gap-2">
                            <Palette className="size-4 text-zinc-400" />
                            ธีมสีและรูปแบบอินเตอร์เฟซ (Theme &amp; Corner Style)
                        </span>
                        <span className="text-[11px] text-zinc-500 font-light">
                            ปรับเปลี่ยนโทนสีหน้าจอและรูปทรงขอบของระบบ
                        </span>
                    </div>

                    {/* Color Theme Selector */}
                    <div className="space-y-2">
                        <label className="text-xs font-normal text-zinc-300">
                            1. ธีมสีของระบบ (Color Theme)
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            {/* Dark Theme */}
                            <button
                                type="button"
                                onClick={() => setThemePreference('dark')}
                                className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between gap-2.5 ${
                                    theme_preference === 'dark'
                                        ? 'border-white bg-[#18181b] shadow-md ring-1 ring-white/20'
                                        : 'border-white/5 bg-[#141417] hover:border-white/20 text-zinc-400'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-medium text-white flex items-center gap-2">
                                        <span>Dark Theme</span>
                                        <span className="text-[10px] text-zinc-500 font-normal">(ค่าเริ่มต้น)</span>
                                    </span>
                                    {theme_preference === 'dark' && <Check className="size-4 text-emerald-400" />}
                                </div>
                                <p className="text-[11px] text-zinc-400 font-light leading-relaxed">
                                    สไตล์ Minimal Dark UI โมเดิร์น โทนสี Zinc เทาเข้ม ดำ และมรกต Emerald
                                </p>
                                <div className="flex items-center gap-1.5 pt-1">
                                    <div className="size-3.5 rounded-full bg-[#09090b] border border-white/20" />
                                    <div className="size-3.5 rounded-full bg-[#18181b]" />
                                    <div className="size-3.5 rounded-full bg-emerald-500" />
                                    <div className="size-3.5 rounded-full bg-white" />
                                </div>
                            </button>

                            {/* Special Theme */}
                            <button
                                type="button"
                                onClick={() => setThemePreference('special')}
                                className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between gap-2.5 ${
                                    theme_preference === 'special'
                                        ? 'border-[#8cf044] bg-[#071307] shadow-[0_0_15px_rgba(140,240,68,0.25)] ring-1 ring-[#8cf044]/50'
                                        : 'border-[#8cf044]/20 bg-[#060c06] hover:border-[#8cf044]/50 text-zinc-400'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-medium text-[#8cf044] flex items-center gap-2">
                                        <span>Special Theme</span>
                                        <span className="text-[10px] text-[#ffb700] font-normal">[TACTICAL TERMINAL]</span>
                                    </span>
                                    {theme_preference === 'special' && <Check className="size-4 text-[#8cf044]" />}
                                </div>
                                <p className="text-[11px] text-zinc-300 font-light leading-relaxed">
                                    สไตล์จอเขียวทหารเรดาร์ Phosphor CRT (#8cf044), สีอำพัน Amber (#ffb700) และเส้นสแกนไลน์เหมือนในตลาดมืด
                                </p>
                                <div className="flex items-center gap-1.5 pt-1">
                                    <div className="size-3.5 rounded-full bg-[#050a05] border border-[#8cf044]/40" />
                                    <div className="size-3.5 rounded-full bg-[#0f200f]" />
                                    <div className="size-3.5 rounded-full bg-[#8cf044]" />
                                    <div className="size-3.5 rounded-full bg-[#ffb700]" />
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Corner / Border Style Selector */}
                    <div className="space-y-2 pt-2 border-t border-white/5">
                        <label className="text-xs font-normal text-zinc-300">
                            2. รูปแบบขอบหน้าจอ (Border &amp; Corner Style)
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            {/* Rounded Corners */}
                            <button
                                type="button"
                                onClick={() => setBorderStyle('rounded')}
                                className={`p-3.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                                    border_style === 'rounded'
                                        ? 'border-white bg-[#18181b] shadow-md ring-1 ring-white/20'
                                        : 'border-white/5 bg-[#141417] hover:border-white/20 text-zinc-400'
                                }`}
                            >
                                <div className="space-y-0.5">
                                    <span className="font-medium text-white flex items-center gap-1.5">
                                        <Circle className="size-3.5 text-zinc-400" />
                                        <span>ขอบมนปกติ (Rounded Corners)</span>
                                    </span>
                                    <p className="text-[11px] text-zinc-400 font-light">
                                        รูปทรงขอบโค้งมนนุ่มนวล ดีไซน์โมเดิร์น
                                    </p>
                                </div>
                                {border_style === 'rounded' && <Check className="size-4 text-emerald-400 shrink-0 ml-2" />}
                            </button>

                            {/* Sharp Corners */}
                            <button
                                type="button"
                                onClick={() => setBorderStyle('sharp')}
                                className={`p-3.5 border text-left transition-all flex items-center justify-between ${
                                    border_style === 'sharp'
                                        ? 'border-[#8cf044] bg-[#071307] shadow-[0_0_12px_rgba(140,240,68,0.2)] ring-1 ring-[#8cf044]/50'
                                        : 'border-white/5 bg-[#141417] hover:border-white/20 text-zinc-400'
                                }`}
                            >
                                <div className="space-y-0.5">
                                    <span className="font-medium text-white flex items-center gap-1.5">
                                        <Square className="size-3.5 text-[#8cf044]" />
                                        <span>ขอบเหลี่ยม (Sharp Tactical Corners)</span>
                                    </span>
                                    <p className="text-[11px] text-zinc-400 font-light">
                                        ขอบตัดเหลี่ยม 90 องศา ดุดันสไตล์อุปกรณ์ฮาร์ดแวร์ทหาร
                                    </p>
                                </div>
                                {border_style === 'sharp' && <Check className="size-4 text-[#8cf044] shrink-0 ml-2" />}
                            </button>
                        </div>
                    </div>
                </div>

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

                {/* Section 2.5: Language & Display Mode */}
                <div className="bg-[#121215] rounded-2xl p-5 md:p-6 space-y-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-white flex items-center gap-2">
                            <Languages className="size-4 text-zinc-400" />
                            โหมดภาษาและการแสดงผล
                        </span>
                        <span className="text-[11px] font-mono text-zinc-500">
                            {languageMode === 'tactical' ? '[ TACTICAL ACTIVE ]' : '[ STANDARD ]'}
                        </span>
                    </div>

                    <div className="bg-[#18181b] rounded-xl p-4 space-y-3">
                        <div className="space-y-0.5">
                            <span className="font-normal text-white text-xs">สไตล์การใช้คำในระบบ</span>
                            <p className="text-[11px] text-zinc-500 font-light">
                                เลือกระหว่างภาษาปกติเข้าใจง่าย หรือโหมดชายขายโลกแบบ Tactical HUD
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                            <button
                                type="button"
                                onClick={() => handleLanguageChange('normal')}
                                className={`p-3.5 rounded-xl border text-left transition-all ${
                                    languageMode === 'normal'
                                        ? 'bg-zinc-800/80 border-emerald-500/50 text-white ring-1 ring-emerald-500/30'
                                        : 'bg-[#121215] border-white/5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-white">ภาษาไทย (คนปกติ)</span>
                                    {languageMode === 'normal' && (
                                        <Check className="size-3.5 text-emerald-400" />
                                    )}
                                </div>
                                <p className="text-[11px] text-zinc-500 font-light mt-1">
                                    ภาษาทางการ ชัดเจน อ่านง่าย ไม่ซับซ้อน (ภาษาไทย 100%)
                                </p>
                            </button>

                            <button
                                type="button"
                                onClick={() => handleLanguageChange('tactical')}
                                className={`p-3.5 rounded-xl border text-left transition-all font-mono ${
                                    languageMode === 'tactical'
                                        ? 'bg-zinc-800/80 border-emerald-500/50 text-white ring-1 ring-emerald-500/30'
                                        : 'bg-[#121215] border-white/5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-emerald-400">TACTICAL HUD (ชายขายโลก)</span>
                                    {languageMode === 'tactical' && (
                                        <Check className="size-3.5 text-emerald-400" />
                                    )}
                                </div>
                                <p className="text-[11px] text-zinc-500 font-light mt-1 font-sans">
                                    Full Tactical Military HUD Interface (English 100%)
                                </p>
                            </button>
                        </div>
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
