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
        <section className="bg-[#121215] rounded-xl px-4 py-3 space-y-2 shadow-sm select-none">
            {/* Row 1: Level, Title, and EXP readout */}
            <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 min-w-0">
                    <span className="size-2 rounded-full bg-cyan-400 shrink-0" />
                    <span className="font-semibold text-white text-sm tracking-tight tabular-nums">
                        Level {currentLevel}
                    </span>
                    <span className="text-zinc-600 font-light">•</span>
                    <span className="text-cyan-400 font-normal truncate">
                        {disciplineTitle}
                    </span>
                </div>

                <div className="flex items-baseline gap-1.5 shrink-0 pl-2">
                    <span className="text-white font-medium tabular-nums text-xs">
                        {currentExp}
                    </span>
                    <span className="text-zinc-500 font-light text-[11px]">
                        / {expThreshold} XP
                    </span>
                    <span className="text-zinc-600 font-light text-[11px] tabular-nums">
                        ({expPercentage}%)
                    </span>
                </div>
            </div>

            {/* Row 2: Sleek Slim Progress Bar */}
            <div className="w-full h-1.5 bg-[#18181b] rounded-full overflow-hidden">
                <div
                    className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-400 transition-all duration-700 ease-out"
                    style={{ width: `${expPercentage}%` }}
                />
            </div>

            {/* Row 3: Subtle Micro Hint */}
            <div className="flex items-center justify-between text-[10px] text-zinc-500 font-light">
                <span>+150 XP เมื่อเข้านอนตรงเวลา</span>
                <span className="tabular-nums">
                    {remainingExp === 0
                        ? 'พร้อมเลื่อนขั้น'
                        : `ต้องการอีก ${remainingExp} XP สู่ Level ${currentLevel + 1}`}
                </span>
            </div>
        </section>
    );
};
