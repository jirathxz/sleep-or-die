import React, { useEffect } from 'react';
import { router } from '@inertiajs/react';
import { useTranslation } from '@/lib/i18n';
import { AlertTriangle, Briefcase, X } from 'lucide-react';

interface InventoryOverflowModalProps {
    isOpen: boolean;
    message?: string;
    onClose: () => void;
}

export const InventoryOverflowModal: React.FC<InventoryOverflowModalProps> = ({
    isOpen,
    message,
    onClose,
}) => {
    const { isTactical } = useTranslation();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm select-none">
            <div className="relative w-full max-w-md bg-[#121008] border border-amber-500/50 border-t-4 border-t-amber-400 rounded-xl p-6 text-center shadow-[0_15px_50px_rgba(0,0,0,0.95)] animate-in fade-in zoom-in-95 duration-200">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-md hover:bg-zinc-800/50 transition-colors"
                    aria-label="Close modal"
                >
                    <X className="size-5" />
                </button>

                {/* Header Icon */}
                <div className="mx-auto size-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3">
                    <AlertTriangle className="size-6" />
                </div>

                <div className="text-xs font-mono font-semibold tracking-wider text-amber-400 uppercase mb-1">
                    // {isTactical ? 'INVENTORY OVERFLOW' : 'แจ้งเตือนกระเป๋าเต็ม'}
                </div>
                <h2 className="text-lg font-bold text-white tracking-wide mb-2">
                    {isTactical ? 'ATTACHÉ CASE FULL' : 'พื้นที่กระเป๋าเก็บของเต็มแล้ว!'}
                </h2>

                <p className="text-xs text-zinc-300 font-light leading-relaxed mb-5">
                    {message || (isTactical
                        ? '> Case slots are completely occupied. Items cannot be received until you organize or expand bag capacity.'
                        : '> ช่องเก็บของในกระเป๋าเต็มแล้ว! ไม่สามารถรับไอเทมรางวัลเพิ่มได้ในขณะนี้ กรุณาเคลียร์หรืออัปเกรดกระเป๋า')}
                </p>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center gap-2.5">
                    <button
                        onClick={() => {
                            onClose();
                            router.visit('/inventory');
                        }}
                        className="w-full sm:flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs tracking-wide transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] cursor-pointer"
                    >
                        <Briefcase className="size-4" />
                        <span>{isTactical ? '[ OPEN ATTACHÉ CASE ]' : '[ ไปจัดการกระเป๋า ]'}</span>
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full sm:w-auto px-4 py-2.5 rounded-lg border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 font-mono text-xs tracking-wider transition-colors cursor-pointer"
                    >
                        {isTactical ? '[ DISMISS ]' : '[ ปิด ]'}
                    </button>
                </div>
            </div>
        </div>
    );
};
