import React from 'react';
import { router } from '@inertiajs/react';
import { Skull, LogOut } from 'lucide-react';

interface TombstoneScreenProps {
    daysSurvived: number;
    userName: string;
}

export const TombstoneScreen: React.FC<TombstoneScreenProps> = ({ daysSurvived, userName }) => {
    const handleLogout = () => {
        router.post('/logout');
    };

    return (
        <div className="fixed inset-0 z-50 bg-[#09090b] flex flex-col items-center justify-center p-6 text-center select-none overflow-y-auto">
            <div className="max-w-md w-full bg-[#121215] rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl">
                {/* Header */}
                <div className="flex flex-col items-center space-y-3">
                    <div className="size-12 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                        <Skull className="size-6" />
                    </div>

                    <div className="space-y-1">
                        <h1 className="text-xl font-medium text-white tracking-tight">
                            บัญชีถูกระงับการใช้งานถาวร
                        </h1>
                        <p className="text-xs text-zinc-400 font-light">
                            สะสมโทษชัตดาวน์ครบ 5 ครั้ง ผิดเจตนารมณ์วินัยการนอน
                        </p>
                    </div>
                </div>

                {/* Subject dossier (No Border, Tonal Surface) */}
                <div className="bg-[#18181b] rounded-xl p-4 space-y-2.5 text-xs text-left">
                    <div className="flex justify-between items-center">
                        <span className="text-zinc-500 font-light">ชื่อผู้ใช้งาน:</span>
                        <span className="font-normal text-white">{userName}</span>
                    </div>
                    <div className="h-px bg-white/[0.04]" />
                    <div className="flex justify-between items-center">
                        <span className="text-zinc-500 font-light">สถิติรอดชีวิตสูงสุด:</span>
                        <span className="font-normal text-emerald-400">{daysSurvived} วัน</span>
                    </div>
                    <div className="h-px bg-white/[0.04]" />
                    <div className="flex justify-between items-center">
                        <span className="text-zinc-500 font-light">สาเหตุการระงับ:</span>
                        <span className="font-normal text-rose-400">ชัตดาวน์สะสม 5/5 ครั้ง</span>
                    </div>
                    <div className="h-px bg-white/[0.04]" />
                    <div className="flex justify-between items-center">
                        <span className="text-zinc-500 font-light">สถานะบัญชี:</span>
                        <span className="font-medium text-rose-500">DISABLED (PERMADEATH)</span>
                    </div>
                </div>

                <p className="text-xs text-zinc-500 font-light leading-relaxed">
                    วินัยการนอนคือความรับผิดชอบพื้นฐานของร่างกาย การพักผ่อนไม่เพียงพอส่งผลกระทบโดยตรงต่อชีวิตจริง
                </p>

                <button
                    onClick={handleLogout}
                    className="w-full h-10 rounded-lg bg-white text-zinc-950 font-medium text-xs hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
                >
                    <LogOut className="size-4" />
                    <span>ออกจากระบบ</span>
                </button>
            </div>
        </div>
    );
};
