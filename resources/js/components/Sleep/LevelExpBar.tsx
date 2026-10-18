import React from 'react';

interface LevelExpBarProps {
    level: number;
    exp: number;
}

export const LevelExpBar: React.FC<LevelExpBarProps> = ({ level, exp }) => {
    const currentLevel = Math.max(1, level || 1);
    const currentExp = Math.max(0, exp || 0);
    const expThreshold = currentLevel * 500;
    const expPercentage = Math.min(100, Math.round((currentExp / expThreshold) * 100));
    const remainingExp = Math.max(0, expThreshold - currentExp);

    // Dynamic discipline titles based on level
    let disciplineTitle = 'มือใหม่หัดนอน (Novice)';
    if (currentLevel >= 5) {
        disciplineTitle = 'เทพแห่งการพักผ่อน (Immortal Sleeper)';
    } else if (currentLevel >= 4) {
        disciplineTitle = 'ปรมาจารย์วินัยนิทรา (Sleep Master)';
    } else if (currentLevel >= 3) {
        disciplineTitle = 'ผู้เชี่ยวชาญการฟื้นฟู (Vitality Guardian)';
    } else if (currentLevel >= 2) {
        disciplineTitle = 'ผู้ควบคุมวงจรสลีป (Circadian Adept)';
    }

    return (
        <section className="bg-[#121215] rounded-2xl p-5 md:p-6 space-y-4 shadow-sm select-none">
            {/* Header: Title and Status Indicator (Strictly No Badge) */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <span className="size-2 rounded-full bg-cyan-400" />
                    <h2 className="text-sm font-medium text-zinc-300">
                        ระดับและแต้มประสบการณ์ (Level & EXP)
                    </h2>
                </div>

                <div className="flex items-center gap-2 text-xs font-normal">
                    <span className="text-zinc-500 font-light">ฉายาวินัย:</span>
                    <span className="text-cyan-400 font-normal">{disciplineTitle}</span>
                </div>
            </div>

            {/* Readout Display */}
            <div className="flex items-baseline justify-between pt-1">
                <div className="space-y-0.5">
                    <span className="text-xs text-zinc-500 font-light">
                        ระดับวินัยปัจจุบัน
                    </span>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl md:text-4xl font-medium tracking-tight text-white tabular-nums">
                            Level {currentLevel}
                        </span>
                    </div>
                </div>

                <div className="text-right space-y-0.5">
                    <span className="text-xs text-zinc-500 font-light">
                        ความก้าวหน้าแต้ม EXP
                    </span>
                    <div className="flex items-baseline justify-end gap-1.5">
                        <span className="text-lg md:text-xl font-medium text-zinc-200 tabular-nums">
                            {currentExp}
                        </span>
                        <span className="text-xs text-zinc-500 font-normal">/ {expThreshold} XP</span>
                    </div>
                </div>
            </div>

            {/* EXP Progress Bar Container (Concentric Radius: rounded-lg with inner rounded-md) */}
            <div className="w-full h-3 bg-[#18181b] rounded-lg p-0.5 overflow-hidden">
                <div
                    className="h-full rounded-md bg-gradient-to-r from-teal-500 via-cyan-400 to-sky-400 transition-all duration-700 ease-out"
                    style={{ width: `${expPercentage}%` }}
                />
            </div>

            {/* Footer Markers */}
            <div className="flex justify-between items-center text-[11px] text-zinc-500 font-light pt-0.5">
                <span>+150 XP ทุกการเข้านอนตรงเวลา</span>
                <span className="tabular-nums">
                    {remainingExp === 0
                        ? 'พร้อมอัปเลเวลถัดไป'
                        : `อีก ${remainingExp} XP สู่ Level ${currentLevel + 1} (${expPercentage}%)`}
                </span>
            </div>
        </section>
    );
};
