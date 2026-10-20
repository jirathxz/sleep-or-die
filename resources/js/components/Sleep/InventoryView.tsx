import React, { useState } from 'react';
import { useSleepStore, InventoryItem } from '@/stores/useSleepStore';
import { Package, Shield, Heart, PlusCircle, CheckCircle2, AlertCircle, ShoppingCart } from 'lucide-react';

interface InventoryViewProps {
    onSwitchTab: (tabIndex: number) => void;
}

export function InventoryView({ onSwitchTab }: InventoryViewProps) {
    const {
        inventory,
        inventory_capacity,
        used_slots,
        current_hp,
        useInventoryItem,
    } = useSleepStore();

    const [usingId, setUsingId] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);

    const handleUse = async (instanceId: string) => {
        setUsingId(instanceId);
        setFeedback(null);
        const res = await useInventoryItem(instanceId);
        setUsingId(null);
        setFeedback(res);
        setTimeout(() => {
            setFeedback(null);
        }, 4000);
    };

    // Generate grid slots for visualization
    const totalSlots = inventory_capacity || 12;
    const freeSlots = Math.max(0, totalSlots - used_slots);

    return (
        <div className="space-y-4 select-none font-mono text-zinc-100">
            {/* Header info */}
            <div className="bg-[#070e07] border border-[#8cf044]/30 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner">
                <div className="flex flex-wrap items-center gap-6 text-xs sm:text-sm">
                    <div className="flex flex-col">
                        <span className="text-[11px] text-[#5a8a40] tracking-wide">// ความจุช่องกระเป๋า</span>
                        <span className="text-xl sm:text-2xl font-bold text-[#8cf044] tracking-wider">
                            {used_slots}/{totalSlots} ช่อง
                        </span>
                    </div>

                    <div className="flex flex-col border-l border-[#8cf044]/20 pl-4 sm:pl-6">
                        <span className="text-[11px] text-[#5a8a40] tracking-wide">// ช่องว่างที่เหลือ</span>
                        <span className="text-sm sm:text-base font-semibold text-zinc-200">
                            {freeSlots} ช่อง
                        </span>
                    </div>

                    <div className="flex flex-col border-l border-[#8cf044]/20 pl-4 sm:pl-6">
                        <span className="text-[11px] text-[#5a8a40] tracking-wide">// LIFE ปัจจุบัน</span>
                        <span className={`text-sm sm:text-base font-semibold ${current_hp > 50 ? 'text-emerald-400' : current_hp > 25 ? 'text-amber-400' : 'text-rose-400'}`}>
                            {current_hp}%
                        </span>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => onSwitchTab(3)}
                    className="self-start sm:self-center px-4 py-2 border border-[#8cf044]/40 hover:border-[#8cf044] bg-[#0c180c] hover:bg-[#132613] text-[#8cf044] hover:text-[#afff69] text-xs font-medium tracking-wide transition-colors active:scale-[0.98] rounded-md flex items-center gap-2"
                >
                    <ShoppingCart className="size-3.5" />
                    <span>[ ไปตลาดมืดซื้อของ ]</span>
                </button>
            </div>

            {/* Notification alert banner */}
            {feedback && (
                <div
                    className={`p-3 border text-xs flex items-center gap-2 rounded-lg transition-all ${
                        feedback.success
                            ? 'bg-emerald-950/80 border-[#8cf044] text-[#8cf044]'
                            : 'bg-rose-950/80 border-rose-500 text-rose-300'
                    }`}
                >
                    {feedback.success ? (
                        <CheckCircle2 className="size-4 shrink-0 text-[#8cf044]" />
                    ) : (
                        <AlertCircle className="size-4 shrink-0 text-rose-400" />
                    )}
                    <span>{feedback.message}</span>
                </div>
            )}

            {/* Main Inventory Box */}
            <div className="bg-[#050b05] border border-[#8cf044]/30 rounded-xl p-4 sm:p-5 space-y-5">
                <div className="border-b border-[#8cf044]/20 pb-3 flex items-center justify-between">
                    <h2 className="text-base sm:text-lg font-bold text-[#8cf044] tracking-wider flex items-center gap-2">
                        <span>[TACTICAL INVENTORY]</span>
                        <span className="text-zinc-200">กระเป๋าเก็บยุทธภัณฑ์</span>
                    </h2>
                    <span className="text-xs text-[#5a8a40]">
                        จัดเก็บได้สูงสุด {totalSlots} ช่อง
                    </span>
                </div>

                {/* Items in bag */}
                {inventory.length === 0 ? (
                    <div className="p-8 border border-dashed border-[#8cf044]/20 rounded-lg text-center space-y-3">
                        <Package className="size-8 text-[#5a8a40] mx-auto" />
                        <p className="text-xs text-zinc-400">ยังไม่มีไอเทมในกระเป๋า</p>
                        <button
                            type="button"
                            onClick={() => onSwitchTab(3)}
                            className="px-4 py-2 border border-[#8cf044]/40 bg-[#0c180c] hover:bg-[#132613] text-[#8cf044] text-xs font-medium rounded-md"
                        >
                            [ เปิดตลาดมืดซื้อเสบียง ]
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                        {inventory.map((item) => (
                            <div
                                key={item.id}
                                className="bg-[#071007] border border-[#8cf044]/30 hover:border-[#8cf044]/60 p-4 rounded-lg flex flex-col justify-between gap-3 transition-colors"
                            >
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-[#8cf044] tracking-wide text-xs sm:text-sm">
                                            {item.label}
                                        </span>
                                        <span className="text-[10px] px-2 py-0.5 rounded border border-[#8cf044]/30 bg-[#0d1f0d] text-[#8cf044]">
                                            {item.slots} ช่อง
                                        </span>
                                    </div>
                                    <p className="text-[11px] sm:text-xs text-zinc-300 leading-relaxed font-light">
                                        {item.description}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    disabled={usingId === item.id}
                                    onClick={() => handleUse(item.id)}
                                    className="w-full py-2.5 px-3 border border-[#8cf044]/50 bg-[#0d1f0d] hover:bg-[#8cf044] text-[#8cf044] hover:text-black hover:font-bold text-xs font-semibold tracking-wider transition-all rounded active:scale-[0.99] flex items-center justify-center gap-1.5"
                                >
                                    {usingId === item.id ? 'กำลังใช้งาน...' : '[ ใช้งานไอเทม ]'}
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Tactical slot matrix visualizer */}
                <div className="pt-2 border-t border-[#8cf044]/20 space-y-2">
                    <span className="text-xs text-[#5a8a40] tracking-wide">// แผนผังช่องเก็บของ ({used_slots}/{totalSlots})</span>
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-1.5">
                        {Array.from({ length: totalSlots }).map((_, i) => {
                            const isOccupied = i < used_slots;
                            return (
                                <div
                                    key={i}
                                    className={`h-9 border flex items-center justify-center text-[10px] font-bold rounded transition-colors ${
                                        isOccupied
                                            ? 'bg-[#8cf044]/20 border-[#8cf044]/70 text-[#8cf044]'
                                            : 'bg-[#030603] border-[#8cf044]/15 text-[#5a8a40]/40'
                                    }`}
                                >
                                    {isOccupied ? `SLOT ${i + 1}` : 'EMPTY'}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
