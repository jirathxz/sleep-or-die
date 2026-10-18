import React from 'react';
import { SleepStage } from '@/stores/useSleepStore';
import { AlertTriangle, AlertCircle } from 'lucide-react';

interface StageOverlayProps {
    stage: SleepStage;
}

export const StageOverlay: React.FC<StageOverlayProps> = ({ stage }) => {
    if (stage === 'normal') return null;

    if (stage === 'alert') {
        return (
            <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4 pointer-events-auto">
                <div className="bg-[#18181b] text-white rounded-xl shadow-2xl p-4 flex items-center gap-3">
                    <span className="size-2 rounded-full bg-amber-400 shrink-0" />
                    <div>
                        <h3 className="text-xs font-medium text-amber-400">
                            เข้าสู่ช่วงเตือนการนอน (เหลืออีก 30 นาที)
                        </h3>
                        <p className="text-[11px] text-zinc-400 font-light mt-0.5">
                            กรุณาเคลียร์งาน เตรียมปิดหน้าจอและอุปกรณ์สื่อสาร
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (stage === 'lockdown') {
        return (
            <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4 pointer-events-auto">
                <div className="bg-[#18181b] text-white rounded-xl shadow-2xl p-4 flex items-center gap-3">
                    <span className="size-2 rounded-full bg-amber-500 animate-ping shrink-0" />
                    <div>
                        <h3 className="text-xs font-medium text-amber-400">
                            ระบบเข้าสู่สถานะล็อคดาวน์ (เหลืออีก 15 นาที)
                        </h3>
                        <p className="text-[11px] text-zinc-400 font-light mt-0.5">
                            เวลาใกล้หมดแล้ว หากเลยเวลา เลือดจะเริ่มลดลงทันที
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (stage === 'sleep') {
        return (
            <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4 pointer-events-auto">
                <div className="bg-[#18181b] text-white rounded-xl shadow-2xl p-4 flex items-center gap-3">
                    <span className="size-2 rounded-full bg-rose-500 animate-ping shrink-0" />
                    <div>
                        <h3 className="text-xs font-medium text-rose-400">
                            เลยเวลานอนแล้ว (DRAINING HP)
                        </h3>
                        <p className="text-[11px] text-zinc-400 font-light mt-0.5">
                            พลังชีวิตลดลงต่อเนื่อง หากลดจนถึง 0% จะถูกบันทึก 1 สไตรค์
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return null;
};
