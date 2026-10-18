import React from 'react';
import { router } from '@inertiajs/react';

interface TombstoneScreenProps {
    daysSurvived: number;
    userName: string;
}

export const TombstoneScreen: React.FC<TombstoneScreenProps> = ({ daysSurvived, userName }) => {
    const handleLogout = () => {
        router.post('/logout');
    };

    return (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-6 text-center select-none overflow-y-auto">
            {/* Tombstone Card */}
            <div className="max-w-md w-full bg-neutral-950 border-2 border-neutral-800 rounded-3xl p-8 shadow-2xl relative">
                {/* Cracks / skull */}
                <div className="text-6xl mb-4">🪦</div>

                <div className="text-xs font-mono tracking-widest text-red-500 uppercase font-black mb-1">
                    [ PERMADEATH STRIKE LIMIT REACHED ]
                </div>

                <h1 className="text-3xl font-black font-mono text-neutral-100 tracking-tight uppercase mb-4">
                    ACCOUNT TERMINATED
                </h1>

                <div className="w-full h-px bg-neutral-900 my-4" />

                <div className="space-y-3 text-left font-mono text-xs text-neutral-400 bg-neutral-900/50 p-4 rounded-xl border border-neutral-900">
                    <div className="flex justify-between">
                        <span>DECEASED:</span>
                        <span className="text-white font-bold">{userName}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>PEAK SURVIVAL:</span>
                        <span className="text-emerald-400 font-bold">{daysSurvived} Days</span>
                    </div>
                    <div className="flex justify-between">
                        <span>CAUSE OF DEATH:</span>
                        <span className="text-red-400 font-bold">5 Shutdown Strikes</span>
                    </div>
                    <div className="flex justify-between">
                        <span>ACCOUNT STATUS:</span>
                        <span className="text-red-500 font-black">DISABLED</span>
                    </div>
                </div>

                <p className="text-xs text-neutral-500 font-mono mt-6 leading-relaxed">
                    คุณถูกกำจัดออกจากระบบเนื่องจากสะสมความล้มเหลวครบ 5 ครั้ง
                    ผิดเจตนารมณ์ในการปรับพฤติกรรมการนอน
                </p>

                <div className="mt-8">
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full py-3 px-6 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-mono text-xs uppercase tracking-wider transition-all border border-neutral-800 hover:text-white"
                    >
                        Sign Out (ยอมรับผลกรรม)
                    </button>
                </div>
            </div>
        </div>
    );
};
