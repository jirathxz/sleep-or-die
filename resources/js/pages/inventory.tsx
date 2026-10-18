import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Briefcase, ShieldCheck, Zap, Heart, Award, Sparkles, Store, Trash2, X, Ticket } from 'lucide-react';
import { useSleepStore } from '@/stores/useSleepStore';
import { useTranslation } from '@/lib/i18n';

export default function Inventory() {
    const {
        current_hp,
        days_survived,
        level,
        exp,
        maxSlots,
        rationCount,
        sprayCount,
        camoCount,
        camoActive,
        useInventoryItem,
        discardInventoryItem,
    } = useSleepStore();

    const { t, isTactical } = useTranslation();

    const [selectedItem, setSelectedItem] = useState<'ration' | 'camo' | null>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const currentLevel = Math.max(1, level || 1);
    const disciplineTitle = t(
        currentLevel >= 5
            ? 'discipline_5'
            : currentLevel >= 4
            ? 'discipline_4'
            : currentLevel >= 3
            ? 'discipline_3'
            : currentLevel >= 2
            ? 'discipline_2'
            : 'discipline_1'
    );

    const usedSlots = (rationCount * 2) + camoCount;
    const totalSlots = maxSlots || 12;

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const handleUse = (type: 'ration' | 'camo') => {
        const res = useInventoryItem(type);
        showToast(res.message);
        setSelectedItem(null);
    };

    const handleDiscard = (type: 'ration' | 'camo') => {
        discardInventoryItem(type);
        showToast(isTactical ? 'ITEM DISCARDED' : 'ทิ้งไอเทมเรียบร้อย');
        setSelectedItem(null);
    };

    // Calculate grid columns based on slot capacity
    const gridCols = totalSlots === 16 ? 'grid-cols-4 sm:grid-cols-8' : totalSlots === 20 ? 'grid-cols-4 sm:grid-cols-5' : 'grid-cols-3 sm:grid-cols-6';

    return (
        <>
            <Head title={`${t('inventory_title')} - SleepOrDie`} />

            <div className="max-w-3xl w-full mx-auto p-4 md:p-6 space-y-6 select-none relative">
                {/* Toast Notification */}
                {toastMessage && (
                    <div className="fixed top-6 right-6 z-50 bg-[#18181b] border border-emerald-500/30 text-emerald-400 text-xs px-4 py-2.5 rounded-xl shadow-lg transition-all animate-in fade-in slide-in-from-top-2">
                        {toastMessage}
                    </div>
                )}

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-medium tracking-tight text-white flex items-center gap-2">
                            <Briefcase className="size-5 text-emerald-400" />
                            {t('inventory_title')}
                        </h1>
                        <p className="text-xs text-zinc-500 font-light mt-0.5">
                            {t('inventory_desc')}
                        </p>
                    </div>

                    <Link
                        href="/market"
                        className="flex items-center gap-2 bg-[#121215] hover:bg-[#18181b] border border-amber-500/20 text-amber-400 rounded-xl px-3.5 py-2 text-xs font-medium transition-colors"
                    >
                        <Store className="size-4" />
                        <span>{t('inventory_btn_market')}</span>
                    </Link>
                </div>

                {/* Stealth Camo Active Shield Banner */}
                {camoActive && (
                    <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-4 flex items-center gap-3">
                        <ShieldCheck className="size-5 text-emerald-400 shrink-0" />
                        <span className="text-xs text-emerald-300 font-medium">
                            {t('inventory_camo_active')}
                        </span>
                    </div>
                )}

                {/* Card 1: Operator Dossier (ข้อมูลสายลับ) */}
                <div className="bg-[#121215] rounded-2xl p-5 space-y-3 shadow-sm">
                    <span className="text-xs text-zinc-500 font-light">{t('inventory_dossier_title')}</span>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                        <div className="bg-[#18181b] rounded-xl p-3.5 space-y-0.5">
                            <span className="text-[11px] text-zinc-500 font-light">{t('stats_survived')}</span>
                            <p className="text-lg font-medium text-white tabular-nums">
                                {days_survived} <span className="text-xs text-zinc-400 font-light">{t('unit_days')}</span>
                            </p>
                        </div>

                        <div className="bg-[#18181b] rounded-xl p-3.5 space-y-0.5">
                            <span className="text-[11px] text-zinc-500 font-light">{t('progression_tier_label')}</span>
                            <p className="text-sm font-medium text-emerald-400 truncate">
                                {disciplineTitle}
                            </p>
                        </div>

                        <div className="bg-[#18181b] rounded-xl p-3.5 space-y-0.5">
                            <span className="text-[11px] text-zinc-500 font-light">{t('hp_title')}</span>
                            <p className="text-lg font-medium text-emerald-400 tabular-nums">
                                {current_hp}%
                            </p>
                        </div>

                        <div className="bg-[#18181b] rounded-xl p-3.5 space-y-0.5">
                            <span className="text-[11px] text-zinc-500 font-light">{t('progression_exp_label')}</span>
                            <p className="text-lg font-medium text-amber-400 tabular-nums">
                                {exp} <span className="text-xs text-zinc-400 font-light">XP</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Card 2: Attaché Case Matrix (กระเป๋าเหล็ก RE4) */}
                <div className="bg-[#121215] rounded-2xl p-5 space-y-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <span className="text-sm font-medium text-white">{t('inventory_case_title')}</span>
                            <p className="text-[11px] text-zinc-500 font-light">
                                {t('inventory_capacity')} <span className="text-white font-medium tabular-nums">{usedSlots}</span> / {totalSlots} {t('inventory_slots')}
                            </p>
                        </div>
                        <span className="text-xs text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-500/20">
                            {t('inventory_status_ready')}
                        </span>
                    </div>

                    {/* Spatial Inventory Grid */}
                    <div className={`grid ${gridCols} gap-2.5 pt-2`}>
                        {/* 1. Rations (Takes 2 slots each) */}
                        {Array.from({ length: rationCount }).map((_, idx) => (
                            <button
                                key={`ration-${idx}`}
                                type="button"
                                onClick={() => setSelectedItem('ration')}
                                className="col-span-2 bg-[#18181b] hover:bg-zinc-800 border border-amber-500/30 rounded-xl p-3 flex flex-col justify-between text-left transition-all hover:scale-[1.02] cursor-pointer min-h-[96px] group"
                            >
                                <div className="flex items-center justify-between w-full">
                                    <span className="text-xs font-semibold text-amber-400 group-hover:text-amber-300">
                                        [{t('item_ration_name')}]
                                    </span>
                                    <span className="text-[10px] text-amber-500/80 bg-amber-950/50 px-1.5 py-0.5 rounded">
                                        2 {t('inventory_slots')}
                                    </span>
                                </div>
                                <p className="text-[10px] text-zinc-400 font-light mt-1">
                                    {t('item_ration_desc')}
                                </p>
                                <span className="text-[9px] text-zinc-600 uppercase font-mono mt-2">
                                    #{idx + 1}
                                </span>
                            </button>
                        ))}


                        {/* 3. Stealth Camo (Takes 1 slot each) */}
                        {Array.from({ length: camoCount }).map((_, idx) => (
                            <button
                                key={`camo-${idx}`}
                                type="button"
                                onClick={() => setSelectedItem('camo')}
                                className="col-span-1 bg-[#18181b] hover:bg-zinc-800 border border-cyan-500/30 rounded-xl p-3 flex flex-col justify-between text-left transition-all hover:scale-[1.02] cursor-pointer min-h-[96px] group"
                            >
                                <div className="flex items-center justify-between w-full">
                                    <span className="text-xs font-semibold text-cyan-400 group-hover:text-cyan-300">
                                        [CAMO]
                                    </span>
                                </div>
                                <p className="text-[10px] text-zinc-400 font-light mt-1 line-clamp-2">
                                    SHIELD
                                </p>
                                <span className="text-[9px] text-zinc-600 uppercase font-mono mt-2">
                                    #{idx + 1}
                                </span>
                            </button>
                        ))}

                        {/* 4. Empty Slots */}
                        {Array.from({ length: Math.max(0, totalSlots - usedSlots) }).map((_, idx) => (
                            <div
                                key={`empty-${idx}`}
                                className="col-span-1 bg-[#151518]/60 border border-dashed border-zinc-800/80 rounded-xl min-h-[96px] flex flex-col items-center justify-center p-2 text-center"
                            >
                                <span className="text-[10px] text-zinc-600 font-mono">
                                    SLOT-{String(usedSlots + idx + 1).padStart(2, '0')}
                                </span>
                                <span className="text-[9px] text-zinc-700 font-light mt-0.5">
                                    {t('item_empty_slot')}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center justify-between pt-2 text-[11px] text-zinc-500 font-light">
                        <span>* {t('inventory_rotate_hint')}</span>
                        <span>{totalSlots} {t('inventory_slots')} MAX</span>
                    </div>
                </div>

                {/* Item Action Modal */}
                {selectedItem && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
                        <div className="bg-[#121215] border border-zinc-800 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl animate-in zoom-in-95">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-white">{t('modal_use_title')}</span>
                                <button
                                    onClick={() => setSelectedItem(null)}
                                    className="text-zinc-500 hover:text-zinc-300"
                                >
                                    <X className="size-4" />
                                </button>
                            </div>

                            <div className="bg-[#18181b] rounded-xl p-4 space-y-1">
                                <span className="text-sm font-semibold text-white">
                                    {selectedItem === 'ration'
                                        ? t('item_ration_name')
                                        : selectedItem === 'spray'
                                        ? t('item_spray_name')
                                        : t('item_camo_name')}
                                </span>
                                <p className="text-xs text-zinc-400 font-light">
                                    {selectedItem === 'ration'
                                        ? t('item_ration_desc')
                                        : selectedItem === 'spray'
                                        ? t('item_spray_desc')
                                        : t('item_camo_desc')}
                                </p>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => handleUse(selectedItem)}
                                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-black font-medium py-2.5 rounded-xl text-xs transition-colors"
                                >
                                    {t('modal_btn_use')}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleDiscard(selectedItem)}
                                    className="px-3 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 text-rose-400 rounded-xl text-xs transition-colors flex items-center justify-center"
                                    title={t('modal_btn_discard')}
                                >
                                    <Trash2 className="size-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSelectedItem(null)}
                                    className="px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs transition-colors"
                                >
                                    {t('modal_btn_cancel')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
