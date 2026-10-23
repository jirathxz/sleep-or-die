import React from 'react';
import { AlertSyncState } from '@/stores/useSleepStore';
import { AlertTriangle, ShieldAlert, LogOut, CheckCircle2, RotateCcw, PauseCircle, PlayCircle, Moon, Heart, Play, Pause } from 'lucide-react';

interface SyncAlertModalProps {
    alertState: AlertSyncState;
    onAcknowledgeAlert: () => void;
    onAcknowledgeLockdown: () => void;
    onAcknowledgeSleepWarning: () => void;
    onReset: () => void;
    onTogglePause?: () => void;
    onResetHp?: () => void;
}

export const SyncAlertModal: React.FC<SyncAlertModalProps> = ({
    alertState,
    onAcknowledgeAlert,
    onAcknowledgeLockdown,
    onAcknowledgeSleepWarning,
    onReset,
    onTogglePause,
    onResetHp,
}) => {
    if (!alertState || alertState.phase === 'idle') {
        return null;
    }

    const { phase, seconds_remaining, total_seconds, is_paused } = alertState;
    const currentSec = seconds_remaining ?? 60;
    const totalSec = total_seconds || 60;
    const progressPercent = Math.max(0, Math.min(100, Math.round((currentSec / totalSec) * 100)));

    // 1. Phase 1: Bedtime Alert (60s, real countdown ticking, pauseable)
    if (phase === 'alert') {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
                <div className="relative w-full max-w-lg rounded-2xl bg-[#141417] border border-amber-500/30 p-6 md:p-8 shadow-2xl text-center space-y-6">
                    {/* Glowing Accent */}
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-32 h-32 bg-amber-500/20 blur-3xl rounded-full pointer-events-none" />

                    {/* Header Tag */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium">
                        <AlertTriangle className="size-3.5" />
                        <span>ขั้นตอนที่ 1/4: แจ้งเตือนเวลาเข้านอน (Alert)</span>
                    </div>

                    {/* Timer & Pause/Resume Toggle */}
                    <div className="flex flex-col items-center justify-center space-y-2">
                        <div className="text-5xl md:text-6xl font-medium tracking-tight text-amber-400 tabular-nums">
                            {currentSec}
                            <span className="text-xl font-light text-amber-300/70 ml-2">วินาที</span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-48 h-1.5 bg-zinc-800 rounded-full overflow-hidden mt-1">
                            <div
                                className="h-full bg-amber-400 transition-all duration-300 ease-linear rounded-full"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>

                        {/* Pause / Resume Controls */}
                        <div className="flex items-center gap-2 pt-1">
                            {onTogglePause && (
                                <button
                                    type="button"
                                    onClick={onTogglePause}
                                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-normal border transition-colors ${
                                        is_paused
                                            ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                            : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/30'
                                    }`}
                                >
                                    {is_paused ? <Play className="size-3 text-emerald-400" /> : <Pause className="size-3 text-amber-400" />}
                                    <span>{is_paused ? 'เริ่มนับถอยหลังต่อ (Resume)' : 'หยุดนับถอยหลัง (Pause)'}</span>
                                </button>
                            )}

                            {is_paused && (
                                <span className="text-[11px] text-zinc-400 font-light">
                                    • เวลารอการตัดสินใจของคุณ
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Content Body */}
                    <div className="space-y-2 text-zinc-300 text-sm leading-relaxed font-light">
                        <h2 className="text-lg font-medium text-white">ถึงเวลาพักผ่อนและเข้านอนแล้ว</h2>
                        <p className="text-xs text-zinc-400">
                            ระบบ C++ Guard และเว็บตรวจพบว่าคุณยังคงใช้งานคอมพิวเตอร์อยู่
                            เวลากำลังนับถอยหลัง {currentSec} วินาที กรุณากดเข้าใจแล้วและปิดเครื่องเพื่อเข้านอน
                        </p>
                        <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 text-amber-200/90 text-xs text-left">
                            <span className="font-medium text-amber-300">ข้อกำหนดวินัย:</span> หากเวลานับถอยหลังหมดลง หรือกด <span className="underline font-normal">&quot;เข้าใจแล้ว&quot;</span> แต่ยังไม่ยอมนอนและ C++ ยังตรวจพบว่า PC ออนไลน์ ระบบจะยกระดับเข้าสู่โหมด <span className="font-medium text-amber-300">Lockdown (จำลอง Sign Out Windows)</span> ทันที
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                        <button
                            type="button"
                            onClick={onAcknowledgeAlert}
                            className="w-full sm:w-auto min-w-[200px] h-11 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-medium text-sm transition-all duration-200 shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 active:scale-[0.98]"
                        >
                            <CheckCircle2 className="size-4" />
                            <span>เข้าใจแล้ว (เตรียมตัวเข้านอน)</span>
                        </button>
                        <button
                            type="button"
                            onClick={onReset}
                            className="w-full sm:w-auto h-11 px-4 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white text-xs transition-colors flex items-center justify-center gap-1.5"
                        >
                            <RotateCcw className="size-3.5" />
                            <span>รีเซ็ต</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // 2. Phase 2: Lockdown (Mock Windows Sign Out Screen, countdown ticking, pauseable)
    if (phase === 'lockdown' || phase === 'acknowledged_alert') {
        return (
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 bg-[#001833] text-white animate-in fade-in duration-300 select-none">
                {/* Windows 11 Sign Out Ambient Background */}
                <div className="absolute inset-0 bg-radial from-[#003366]/40 via-transparent to-black pointer-events-none" />

                <div className="relative z-10 max-w-xl w-full text-center space-y-7">
                    {/* Windows Loading Spinner Animation */}
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="relative size-16 flex items-center justify-center">
                            <div className="size-16 rounded-full border-4 border-white/20 border-t-cyan-400 animate-spin" />
                            <LogOut className="size-6 text-cyan-300 absolute" />
                        </div>
                        <div className="text-xl md:text-2xl font-light tracking-wide text-zinc-100">
                            กำลังออกจากระบบ Windows...
                        </div>
                        <div className="text-xs text-cyan-400 font-mono tracking-wider bg-cyan-950/60 px-3 py-1 rounded-full border border-cyan-800/50">
                            [ โหมดจำลอง Sign Out Windows • ไม่ล็อกเอาท์จริง ]
                        </div>
                    </div>

                    {/* Lockdown Card */}
                    <div className="bg-[#0b1d33]/90 border border-cyan-500/30 rounded-2xl p-6 shadow-2xl space-y-4 text-left">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm font-medium text-cyan-300">
                                <ShieldAlert className="size-4 text-cyan-400 shrink-0" />
                                <span>ขั้นตอนที่ 2/4: เข้าสู่โหมด Lockdown (จำลอง Sign Out)</span>
                            </div>
                            <span className="text-xs text-cyan-300/80 font-mono tabular-nums">
                                เหลือ {currentSec} วินาที
                            </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-1.5 bg-[#002244] rounded-full overflow-hidden">
                            <div
                                className="h-full bg-cyan-400 transition-all duration-300 ease-linear rounded-full"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>

                        <div className="text-xs text-zinc-300 leading-relaxed font-light space-y-2">
                            <p>
                                คุณได้กดรับทราบการแจ้งเตือนไปแล้ว แต่ระบบ C++ Guard ยังตรวจพบว่า <strong className="text-cyan-200">คอมพิวเตอร์ (PC) ยังคงออนไลน์และมีการใช้งานอยู่</strong>
                            </p>
                            <p>
                                ระบบจึงเข้าสู่ขั้นตอน Lockdown โดยจำลองการ Sign Out หน้าจอ Windows เพื่อตัดสิ่งรบกวนและเตือนให้หยุดใช้งาน
                            </p>

                            <div className="flex items-center justify-between p-2.5 rounded-lg bg-cyan-950/60 border border-cyan-500/20 text-cyan-200 text-xs mt-2">
                                <div className="flex items-center gap-2">
                                    <PauseCircle className="size-4 text-cyan-400 shrink-0" />
                                    <span>
                                        {is_paused ? 'เวลานับถอยหลังถูกหยุดชั่วคราว (Pause)' : `เวลากำลังนับถอยหลัง: ${currentSec} วินาที`}
                                    </span>
                                </div>
                                {onTogglePause && (
                                    <button
                                        type="button"
                                        onClick={onTogglePause}
                                        className="px-2.5 py-0.5 rounded-md bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-[11px] font-normal transition-colors"
                                    >
                                        {is_paused ? (
                                            <span className="inline-flex items-center gap-1.5"><Play className="size-3.5" /> นับต่อ</span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5"><Pause className="size-3.5" /> พักชั่วคราว</span>
                                        )}
                                    </button>
                                )}
                            </div>

                            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs mt-2">
                                <strong>ขั้นตอนต่อไป:</strong> หากเวลาหมดหรือคุณกด &quot;เข้าใจแล้ว&quot; แต่ยังคงกลับมาเปิดคอมพิวเตอร์ใช้งานต่อ ระบบจะ <span className="font-semibold text-rose-200">หักพลังชีวิต (HP) 25 แต้ม</span> และจำลองเข้าสู่ Windows Sleep Mode
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                            <button
                                type="button"
                                onClick={onAcknowledgeLockdown}
                                className="w-full sm:w-auto min-w-[220px] h-11 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium text-sm transition-all duration-200 shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 active:scale-[0.98]"
                            >
                                <Moon className="size-4" />
                                <span>เข้าใจแล้ว (ปิดหน้าจอและไปนอนจริง)</span>
                            </button>
                            <button
                                type="button"
                                onClick={onReset}
                                className="h-9 px-3 rounded-lg text-xs text-zinc-400 hover:text-white transition-colors"
                            >
                                ยกเลิกการจำลอง (Reset)
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // 3. Phase 3: Sleep Warning (-25 HP deducted, mock Windows Sleep)
    if (phase === 'sleep_warning' || phase === 'acknowledged_lockdown') {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
                <div className="relative w-full max-w-lg rounded-2xl bg-[#161214] border border-rose-500/40 p-6 md:p-8 shadow-2xl text-center space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
                        <AlertTriangle className="size-3.5" />
                        <span>ขั้นตอนที่ 3/4: ตรวจพบกลับมาใช้งาน! หัก HP 25 แต้ม</span>
                    </div>

                    <div className="space-y-2 text-zinc-300 text-sm leading-relaxed font-light">
                        <h2 className="text-xl font-medium text-rose-400">หักพลังชีวิต 25 HP เรียบร้อยแล้ว!</h2>
                        <p className="text-xs text-zinc-400">
                            ตรวจพบคุณกลับมาใช้งานคอมพิวเตอร์หลังได้รับคำเตือน Lockdown ระบบจึงจำลองเข้าสู่ <strong className="text-white">Windows Sleep Mode</strong>
                        </p>
                        <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/20 text-rose-200 text-xs text-left">
                            <strong>เส้นตายสุดท้าย:</strong> หากยังคงฝ่าฝืนใช้งานต่อ ระบบจะยกระดับสู่ <span className="font-semibold text-rose-400">ขั้นตอนที่ 4: Shutdown</span> และหัก HP ทั้งหมดเหลือ 0% ทันที
                        </div>
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                        <button
                            type="button"
                            onClick={onAcknowledgeSleepWarning}
                            className="h-11 px-6 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium text-sm transition-colors flex items-center justify-center gap-2"
                        >
                            <CheckCircle2 className="size-4" />
                            <span>เข้าใจแล้ว (ยอมรับวินัยและไปนอน)</span>
                        </button>
                        {onResetHp && (
                            <button
                                type="button"
                                onClick={onResetHp}
                                className="h-11 px-4 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-normal transition-colors flex items-center justify-center gap-1.5"
                            >
                                <Heart className="size-3.5 fill-emerald-500/30" />
                                <span>รีเซ็ต HP 100%</span>
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={onReset}
                            className="h-11 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white text-xs transition-colors"
                        >
                            รีเซ็ต
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // 4. Phase 4: Final Shutdown (0% HP)
    if (phase === 'shutdown') {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 text-white animate-in fade-in duration-300">
                <div className="max-w-md w-full text-center space-y-5 p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
                    <div className="size-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-500 text-2xl font-bold">
                        0%
                    </div>
                    <h2 className="text-lg font-medium text-white">พลังชีวิตลดลงเหลือ 0% (Shutdown จำลอง)</h2>
                    <p className="text-xs text-zinc-400 font-light">
                        คุณได้ฝ่าฝืนการนอนหลับครบทุกขั้นตอน ระบบได้จำลองการปิดระบบ Shutdown สมบูรณ์แบบเพื่อรักษาวินัย
                    </p>
                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                        {onResetHp && (
                            <button
                                type="button"
                                onClick={onResetHp}
                                className="w-full sm:w-auto h-11 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 active:scale-[0.98]"
                            >
                                <Heart className="size-4 fill-white/20" />
                                <span>ชุบชีวิต / รีเซ็ต HP (100%)</span>
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={onReset}
                            className="w-full sm:w-auto h-11 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors"
                        >
                            คืนค่าระบบปกติ (Reset)
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return null;
};
