import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Store, Briefcase, Zap, ShieldAlert, Sparkles, Check, ArrowRight, Ticket } from 'lucide-react';
import { useSleepStore } from '@/stores/useSleepStore';
import { useTranslation } from '@/lib/i18n';

export default function Market() {
    const {
        exp,
        maxSlots,
        rationCount,
        sprayCount,
        camoCount,
        level,
        buyMarketItem,
    } = useSleepStore();

    const { t, isTactical } = useTranslation();

    const [toastMessage, setToastMessage] = useState<{ text: string; success: boolean } | null>(null);

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

    const showToast = (text: string, success: boolean) => {
        setToastMessage({ text, success });
        setTimeout(() => setToastMessage(null), 3000);
    };

    const handleBuy = (itemKey: 'ration' | 'camo' | 'case_m' | 'case_l') => {
        const res = buyMarketItem(itemKey);
        showToast(res.message, res.success);
    };

    return (
        <>
            <Head title={`${t('market_title')} - SleepOrDie`} />

            <div className="max-w-3xl w-full mx-auto p-4 md:p-6 space-y-6 select-none relative">
                {/* Toast Notification */}
                {toastMessage && (
                    <div
                        className={`fixed top-6 right-6 z-50 text-xs px-4 py-2.5 rounded-xl shadow-lg transition-all animate-in fade-in slide-in-from-top-2 border ${
                            toastMessage.success
                                ? 'bg-[#18181b] border-emerald-500/30 text-emerald-400'
                                : 'bg-[#18181b] border-rose-500/30 text-rose-400'
                        }`}
                    >
                        {toastMessage.text}
                    </div>
                )}

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-medium tracking-tight text-white flex items-center gap-2">
                            <Store className="size-5 text-amber-400" />
                            {t('market_title')}
                        </h1>
                        <p className="text-xs text-zinc-500 font-light mt-0.5">
                            {t('market_desc')}
                        </p>
                    </div>

                    <Link
                        href="/inventory"
                        className="flex items-center gap-2 bg-[#121215] hover:bg-[#18181b] border border-emerald-500/20 text-emerald-400 rounded-xl px-3.5 py-2 text-xs font-medium transition-colors"
                    >
                        <Briefcase className="size-4" />
                        <span>{t('market_btn_inventory')}</span>
                    </Link>
                </div>

                {/* Card 1: Balance & Bag Summary */}
                <div className="bg-[#121215] rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-3 gap-4 shadow-sm">
                    <div className="space-y-0.5">
                        <span className="text-[11px] text-zinc-500 font-light">{t('market_exp_available')}</span>
                        <p className="text-2xl font-medium text-amber-400 tabular-nums">
                            {exp} <span className="text-xs text-zinc-500 font-light">XP</span>
                        </p>
                    </div>

                    <div className="space-y-0.5">
                        <span className="text-[11px] text-zinc-500 font-light">{t('market_bag_slots')}</span>
                        <p className="text-2xl font-medium text-emerald-400 tabular-nums">
                            {usedSlots} <span className="text-xs text-zinc-400 font-light">/ {totalSlots} {t('inventory_slots')}</span>
                        </p>
                    </div>

                    <div className="space-y-0.5">
                        <span className="text-[11px] text-zinc-500 font-light">{t('market_rank_label')}</span>
                        <p className="text-base font-medium text-zinc-200 truncate">
                            {disciplineTitle}
                        </p>
                    </div>
                </div>

                {/* Card 2: Merchant Codec Profile */}
                <div className="bg-[#121215] rounded-2xl p-5 md:p-6 space-y-4 shadow-sm">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="size-20 rounded-2xl overflow-hidden bg-black/60 shrink-0 border border-amber-500/20 shadow-md">
                            <img
                                src="/merchant.png"
                                alt="Underground Merchant"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    (e.target as HTMLElement).style.display = 'none';
                                }}
                            />
                        </div>

                        <div className="space-y-1.5 flex-1">
                            <div className="text-[11px] font-mono text-emerald-400 font-medium tracking-wider">
                                {t('market_codec_freq')} • {t('market_merchant_name')}
                            </div>
                            <blockquote className="text-sm font-medium text-white italic">
                                {t('market_quote')}
                            </blockquote>
                            <p className="text-[11px] text-zinc-500 font-light">
                                {t('market_warning')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Card 3: Shop Grid */}
                <div className="space-y-3">
                    <span className="text-sm font-medium text-white">รายการเสบียงและอัปเกรด</span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        {/* Item 1: Ration */}
                        <div className="bg-[#121215] rounded-2xl p-4 flex flex-col justify-between space-y-3 shadow-sm hover:bg-[#151518] transition-colors">
                            <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-white">
                                        [{t('item_ration_name')}]
                                    </span>
                                    <span className="text-xs font-semibold text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-500/20">
                                        30 XP
                                    </span>
                                </div>
                                <p className="text-xs text-zinc-400 font-light">
                                    {t('item_ration_desc')}
                                </p>
                                <span className="text-[10px] text-zinc-500 font-light block">
                                    ขนาด: 2 {t('inventory_slots')}
                                </span>
                            </div>

                            <button
                                type="button"
                                onClick={() => handleBuy('ration')}
                                disabled={exp < 30 || usedSlots + 2 > totalSlots}
                                className="w-full bg-[#18181b] hover:bg-zinc-800 disabled:opacity-40 disabled:hover:bg-[#18181b] border border-zinc-700/60 text-white rounded-xl py-2 text-xs font-medium transition-colors"
                            >
                                {t('market_btn_buy')} // 30 XP
                            </button>
                        </div>


                        {/* Item 3: Stealth Camo */}
                        <div className="bg-[#121215] rounded-2xl p-4 flex flex-col justify-between space-y-3 shadow-sm hover:bg-[#151518] transition-colors">
                            <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-white">
                                        [{t('item_camo_name')}]
                                    </span>
                                    <span className="text-xs font-semibold text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded-full border border-cyan-500/20">
                                        100 XP
                                    </span>
                                </div>
                                <p className="text-xs text-zinc-400 font-light">
                                    {t('item_camo_desc')}
                                </p>
                                <span className="text-[10px] text-zinc-500 font-light block">
                                    ขนาด: 1 {t('inventory_slots')}
                                </span>
                            </div>

                            <button
                                type="button"
                                onClick={() => handleBuy('camo')}
                                disabled={exp < 100 || usedSlots + 1 > totalSlots}
                                className="w-full bg-[#18181b] hover:bg-zinc-800 disabled:opacity-40 disabled:hover:bg-[#18181b] border border-zinc-700/60 text-white rounded-xl py-2 text-xs font-medium transition-colors"
                            >
                                {t('market_btn_buy')} // 100 XP
                            </button>
                        </div>

                        {/* Item 4: Case M Upgrade */}
                        <div className="bg-[#121215] rounded-2xl p-4 flex flex-col justify-between space-y-3 shadow-sm hover:bg-[#151518] transition-colors">
                            <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-white">
                                        [{t('market_case_m_title')}]
                                    </span>
                                    <span className="text-xs font-semibold text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-500/20">
                                        200 XP
                                    </span>
                                </div>
                                <p className="text-xs text-zinc-400 font-light">
                                    {t('market_case_m_desc')}
                                </p>
                                <span className="text-[10px] text-zinc-500 font-light block">
                                    {totalSlots >= 16 ? t('market_upgraded') : '12 -> 16 ช่อง'}
                                </span>
                            </div>

                            <button
                                type="button"
                                onClick={() => handleBuy('case_m')}
                                disabled={exp < 200 || totalSlots >= 16}
                                className="w-full bg-[#18181b] hover:bg-zinc-800 disabled:opacity-40 disabled:hover:bg-[#18181b] border border-zinc-700/60 text-white rounded-xl py-2 text-xs font-medium transition-colors"
                            >
                                {totalSlots >= 16 ? t('market_upgraded') : `${t('market_btn_upgrade')} // 200 XP`}
                            </button>
                        </div>

                        {/* Item 5: Case L Upgrade (Full Width) */}
                        <div className="sm:col-span-2 bg-[#121215] rounded-2xl p-4 flex flex-col justify-between space-y-3 shadow-sm hover:bg-[#151518] transition-colors">
                            <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-white">
                                        [{t('market_case_l_title')}]
                                    </span>
                                    <span className="text-xs font-semibold text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-500/20">
                                        400 XP
                                    </span>
                                </div>
                                <p className="text-xs text-zinc-400 font-light">
                                    {t('market_case_l_desc')}
                                </p>
                                <span className="text-[10px] text-zinc-500 font-light block">
                                    {totalSlots >= 20 ? t('market_upgraded') : '16 -> 20 ช่อง (ระดับสูงสุด)'}
                                </span>
                            </div>

                            <button
                                type="button"
                                onClick={() => handleBuy('case_l')}
                                disabled={exp < 400 || totalSlots < 16 || totalSlots >= 20}
                                className="w-full bg-[#18181b] hover:bg-zinc-800 disabled:opacity-40 disabled:hover:bg-[#18181b] border border-zinc-700/60 text-white rounded-xl py-2 text-xs font-medium transition-colors"
                            >
                                {totalSlots >= 20 ? t('market_upgraded') : `${t('market_btn_upgrade')} // 400 XP`}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
