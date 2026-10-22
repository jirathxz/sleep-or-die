import React, { useState } from 'react';
import { useSleepStore } from '@/stores/useSleepStore';
import { ShoppingBag, AlertTriangle, CheckCircle2, Shield, Heart, Clock, PackageCheck, Lock } from 'lucide-react';

interface BlackMarketViewProps {
    onSwitchTab: (tabIndex: number) => void;
}

export function BlackMarketView({ onSwitchTab }: BlackMarketViewProps) {
    const {
        exp,
        inventory,
        inventory_capacity,
        used_slots,
        buyShopItem,
        level,
        theme_preference,
        border_style,
    } = useSleepStore();

    const isSpecial = theme_preference === 'special';
    const isSharp = border_style === 'sharp';
    const cornerRadius = isSharp ? 'rounded-none' : 'rounded-xl';
    const subCornerRadius = isSharp ? 'rounded-none' : 'rounded-lg';
    const btnCornerRadius = isSharp ? 'rounded-none' : 'rounded-md';

    const [buyingId, setBuyingId] = useState<string | null>(null);
    const [actionFeedback, setActionFeedback] = useState<{
        success: boolean;
        message: string;
    } | null>(null);

    const handleBuy = async (itemId: string) => {
        setBuyingId(itemId);
        setActionFeedback(null);
        const res = await buyShopItem(itemId);
        setBuyingId(null);
        setActionFeedback(res);
        setTimeout(() => {
            setActionFeedback(null);
        }, 4000);
    };

    const hasCaseM = inventory_capacity >= 16;
    const hasCaseL = inventory_capacity >= 20;

    return (
        <div className={`space-y-4 select-none ${isSpecial ? 'font-mono text-zinc-100' : 'font-sans text-zinc-100'}`}>
            {/* Top Subbar */}
            <div className={`${isSpecial ? 'bg-[#070e07] border border-[#8cf044]/30' : 'bg-[#121215] border border-white/5'} ${cornerRadius} p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner`}>
                <div className="flex flex-wrap items-center gap-6 text-xs sm:text-sm">
                    {/* EXP */}
                    <div className="flex flex-col">
                        <span className={`text-[11px] ${isSpecial ? 'text-[#5a8a40]' : 'text-zinc-400'} tracking-wide`}>
                            {isSpecial ? '// EXP ที่มี' : 'EXP ที่มี'}
                        </span>
                        <span className={`text-xl sm:text-2xl font-bold ${isSpecial ? 'text-[#ffb700] drop-shadow-[0_0_8px_rgba(255,183,0,0.3)]' : 'text-amber-400'} tracking-wider`}>
                            {exp} EXP
                        </span>
                    </div>

                    {/* Inventory Slots */}
                    <div className={`flex flex-col border-l ${isSpecial ? 'border-[#8cf044]/20' : 'border-white/10'} pl-4 sm:pl-6`}>
                        <span className={`text-[11px] ${isSpecial ? 'text-[#5a8a40]' : 'text-zinc-400'} tracking-wide`}>
                            {isSpecial ? '// ช่องกระเป๋า' : 'ช่องกระเป๋า'}
                        </span>
                        <span className={`text-sm sm:text-base font-semibold ${isSpecial ? 'text-[#8cf044]' : 'text-white'} tracking-wide`}>
                            {used_slots}/{inventory_capacity} ช่อง
                        </span>
                    </div>

                    {/* Rank */}
                    <div className={`flex flex-col border-l ${isSpecial ? 'border-[#8cf044]/20' : 'border-white/10'} pl-4 sm:pl-6`}>
                        <span className={`text-[11px] ${isSpecial ? 'text-[#5a8a40]' : 'text-zinc-400'} tracking-wide`}>
                            {isSpecial ? '// ยศปัจจุบัน' : 'ยศปัจจุบัน'}
                        </span>
                        <span className="text-xs sm:text-sm font-semibold text-zinc-200 tracking-wider">
                            FOXHOUND {isSpecial ? (
                                <span className="text-[#8cf044]">[OPERATIVE {level}]</span>
                            ) : (
                                <span className="text-emerald-400 font-medium">Operative {level}</span>
                            )}
                        </span>
                    </div>
                </div>

                {/* Right button */}
                <button
                    type="button"
                    onClick={() => onSwitchTab(2)}
                    className={`self-start sm:self-center px-4 py-2 border ${
                        isSpecial
                            ? 'border-[#8cf044]/40 hover:border-[#8cf044] bg-[#0c180c] hover:bg-[#132613] text-[#8cf044] hover:text-[#afff69]'
                            : 'border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white'
                    } text-xs font-medium tracking-wide transition-colors active:scale-[0.98] ${btnCornerRadius} flex items-center gap-1.5`}
                >
                    <ShoppingBag className="size-3.5" />
                    <span>{isSpecial ? '[ ดูกระเป๋าเก็บของ ]' : 'ดูกระเป๋าเก็บของ'}</span>
                </button>
            </div>

            {/* Notification alert banner */}
            {actionFeedback && (
                <div
                    className={`p-3 border text-xs flex items-center gap-2 ${subCornerRadius} transition-all ${
                        actionFeedback.success
                            ? isSpecial
                                ? 'bg-emerald-950/80 border-[#8cf044] text-[#8cf044]'
                                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                            : 'bg-rose-950/80 border-rose-500 text-rose-300'
                    }`}
                >
                    {actionFeedback.success ? (
                        <CheckCircle2 className={`size-4 shrink-0 ${isSpecial ? 'text-[#8cf044]' : 'text-emerald-400'}`} />
                    ) : (
                        <AlertTriangle className="size-4 shrink-0 text-rose-400" />
                    )}
                    <span>{actionFeedback.message}</span>
                </div>
            )}

            {/* Main Shop Container */}
            <div className={`${isSpecial ? 'bg-[#050b05] border border-[#8cf044]/30' : 'bg-[#121215] border border-white/5'} ${cornerRadius} p-4 sm:p-5 space-y-5`}>
                {/* Header title */}
                <div className={`border-b ${isSpecial ? 'border-[#8cf044]/20' : 'border-white/10'} pb-3`}>
                    <h2 className={`text-base sm:text-lg font-bold ${isSpecial ? 'text-[#8cf044]' : 'text-white'} tracking-wider flex items-center gap-2`}>
                        {isSpecial ? (
                            <>
                                <span>[BLACK MARKET]</span>
                                <span className="text-zinc-200">ตลาดมืดเสบียง</span>
                            </>
                        ) : (
                            <>
                                <ShoppingBag className="size-5 text-emerald-400" />
                                <span>ตลาดมืดเสบียง</span>
                                <span className="text-xs font-normal text-zinc-400 ml-1">Black Market</span>
                            </>
                        )}
                    </h2>
                </div>

                {/* CODEC Radio transmission dialog box */}
                <div className={`border ${
                    isSpecial
                        ? 'border-[#8cf044]/40 bg-[#071107]'
                        : 'border-white/5 bg-zinc-900/40'
                } p-3 sm:p-4 ${subCornerRadius} flex flex-col sm:flex-row gap-4 items-start relative overflow-hidden`}>
                    {/* CRT Scanline glow backdrop - only for special theme */}
                    {isSpecial && (
                        <div className="absolute inset-0 bg-gradient-to-b from-[#8cf044]/5 to-transparent pointer-events-none" />
                    )}

                    {/* Left: Avatar */}
                    <div className={`relative shrink-0 border-2 ${
                        isSpecial
                            ? 'border-[#8cf044]/60 shadow-[0_0_12px_rgba(140,240,68,0.2)]'
                            : 'border-white/10 shadow-sm'
                    } bg-black size-20 sm:size-24 ${subCornerRadius} overflow-hidden`}>
                        <img
                            src="/images/codec_merchant.jpg"
                            alt="CODEC Merchant"
                            className="size-full object-cover filter contrast-125 brightness-95"
                            onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                            }}
                        />
                        {isSpecial && (
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] pointer-events-none" />
                        )}
                        <div className={`absolute top-1 left-1 ${
                            isSpecial
                                ? 'bg-black/70 text-[#8cf044] border border-[#8cf044]/40'
                                : 'bg-black/80 text-zinc-300 border border-white/10'
                        } px-1 py-0.5 text-[8px] font-bold ${isSharp ? 'rounded-none' : 'rounded-sm'}`}>
                            CODEC
                        </div>
                    </div>

                    {/* Right: CODEC Dialog lines */}
                    <div className="space-y-1.5 text-xs sm:text-sm flex-1 z-10">
                        <p className={`text-[11px] ${isSpecial ? 'text-[#5a8a40]' : 'text-zinc-400'} tracking-wide`}>
                            {isSpecial ? '// สัญญาณวิทยุ CODEC: 141.80 [พ่อค้าตลาดมืด]' : 'สัญญาณวิทยุติดต่อ CODEC: 141.80 (พ่อค้าตลาดมืด)'}
                        </p>
                        <p className={`font-semibold ${isSpecial ? 'text-[#8cf044]' : 'text-zinc-200'} tracking-wide`}>
                            &ldquo;ยินดีต้อนรับ สหาย... หึๆๆ... วันนี้จะซื้ออะไรดีล่ะ?&rdquo;
                        </p>
                        <p className={`text-xs ${isSpecial ? 'text-[#ff5555]' : 'text-rose-400'} font-normal leading-relaxed`}>
                            {isSpecial ? '> ' : '⚠ '}คำเตือน: ซื้อของจะหักแต้ม EXP ทันที และอาจทำให้เลเวลลดลงได้หากแต้มไม่พอ
                        </p>
                        <div className="pt-1 flex flex-wrap items-center gap-4 text-xs">
                            <span className="text-zinc-300">
                                แต้ม EXP ที่มี: <span className={`font-bold ${isSpecial ? 'text-[#ffb700]' : 'text-amber-400'}`}>{exp} EXP</span>
                            </span>
                            <span className="text-zinc-300">
                                ช่องกระเป๋า: <span className={`font-semibold ${isSpecial ? 'text-[#8cf044]' : 'text-white'}`}>{used_slots}/{inventory_capacity} ช่อง</span>
                            </span>
                        </div>
                    </div>
                </div>

                {/* Items Grid (Matching the 5 cards) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
                    {/* 1. RATION SUPPLY */}
                    <div className={`${
                        isSpecial
                            ? 'bg-[#071007] border border-[#8cf044]/30 hover:border-[#8cf044]/60'
                            : 'bg-zinc-900/50 border border-white/5 hover:border-white/15'
                    } p-4 ${subCornerRadius} flex flex-col justify-between gap-3 transition-colors shadow-sm`}>
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <span className={`font-bold tracking-wide text-xs sm:text-sm ${
                                    isSpecial ? 'text-[#8cf044]' : 'text-white'
                                }`}>
                                    {isSpecial ? '[ RATION SUPPLY ]' : 'Ration Supply (อาหารฉุกเฉิน)'}
                                </span>
                                <span className={`font-bold text-xs sm:text-sm ${
                                    isSpecial ? 'text-[#ffb700]' : 'text-amber-400'
                                }`}>
                                    30 EXP
                                </span>
                            </div>
                            <p className={`text-[11px] sm:text-xs leading-relaxed ${
                                isSpecial ? 'text-zinc-300 font-light' : 'text-zinc-400'
                            }`}>
                                ขนาด: 2 ช่อง | ฟื้นฟู LIFE +30% &amp; ขยายเวลา +5 นาที
                            </p>
                        </div>

                        <button
                            type="button"
                            disabled={buyingId === 'ration_supply' || exp < 30}
                            onClick={() => handleBuy('ration_supply')}
                            className={`w-full py-2.5 px-3 border text-xs font-semibold tracking-wider transition-all ${btnCornerRadius} active:scale-[0.99] flex items-center justify-center gap-1.5 ${
                                exp >= 30
                                    ? isSpecial
                                        ? 'border-[#8cf044]/50 bg-[#0d1f0d] hover:bg-[#8cf044] text-[#8cf044] hover:text-black hover:font-bold'
                                        : 'border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-black font-medium'
                                    : isSpecial
                                    ? 'border-zinc-700 bg-zinc-900/60 text-zinc-500 cursor-not-allowed'
                                    : 'border-white/5 bg-zinc-900/40 text-zinc-600 cursor-not-allowed'
                            }`}
                        >
                            {buyingId === 'ration_supply'
                                ? 'กำลังดำเนินการ...'
                                : isSpecial
                                ? '[ ซื้อ // 30 EXP ]'
                                : 'ซื้อ (30 EXP)'}
                        </button>
                    </div>

                    {/* 2. FIRST AID SPRAY */}
                    <div className={`${
                        isSpecial
                            ? 'bg-[#071007] border border-[#8cf044]/30 hover:border-[#8cf044]/60'
                            : 'bg-zinc-900/50 border border-white/5 hover:border-white/15'
                    } p-4 ${subCornerRadius} flex flex-col justify-between gap-3 transition-colors shadow-sm`}>
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <span className={`font-bold tracking-wide text-xs sm:text-sm ${
                                    isSpecial ? 'text-[#8cf044]' : 'text-white'
                                }`}>
                                    {isSpecial ? '[ FIRST AID SPRAY ]' : 'First Aid Spray (สเปรย์ปฐมพยาบาล)'}
                                </span>
                                <span className={`font-bold text-xs sm:text-sm ${
                                    isSpecial ? 'text-[#ffb700]' : 'text-amber-400'
                                }`}>
                                    60 EXP
                                </span>
                            </div>
                            <p className={`text-[11px] sm:text-xs leading-relaxed ${
                                isSpecial ? 'text-zinc-300 font-light' : 'text-zinc-400'
                            }`}>
                                ขนาด: 1 ช่อง | ฟื้นฟูพลังชีวิตฉุกเฉิน LIFE +50%
                            </p>
                        </div>

                        <button
                            type="button"
                            disabled={buyingId === 'first_aid_spray' || exp < 60}
                            onClick={() => handleBuy('first_aid_spray')}
                            className={`w-full py-2.5 px-3 border text-xs font-semibold tracking-wider transition-all ${btnCornerRadius} active:scale-[0.99] flex items-center justify-center gap-1.5 ${
                                exp >= 60
                                    ? isSpecial
                                        ? 'border-[#8cf044]/50 bg-[#0d1f0d] hover:bg-[#8cf044] text-[#8cf044] hover:text-black hover:font-bold'
                                        : 'border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-black font-medium'
                                    : isSpecial
                                    ? 'border-zinc-700 bg-zinc-900/60 text-zinc-500 cursor-not-allowed'
                                    : 'border-white/5 bg-zinc-900/40 text-zinc-600 cursor-not-allowed'
                            }`}
                        >
                            {buyingId === 'first_aid_spray'
                                ? 'กำลังดำเนินการ...'
                                : isSpecial
                                ? '[ ซื้อ // 60 EXP ]'
                                : 'ซื้อ (60 EXP)'}
                        </button>
                    </div>

                    {/* 3. STEALTH CAMO */}
                    <div className={`${
                        isSpecial
                            ? 'bg-[#071007] border border-[#8cf044]/30 hover:border-[#8cf044]/60'
                            : 'bg-zinc-900/50 border border-white/5 hover:border-white/15'
                    } p-4 ${subCornerRadius} flex flex-col justify-between gap-3 transition-colors shadow-sm`}>
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <span className={`font-bold tracking-wide text-xs sm:text-sm ${
                                    isSpecial ? 'text-[#8cf044]' : 'text-white'
                                }`}>
                                    {isSpecial ? '[ STEALTH CAMO ]' : 'Stealth Camo (เกราะพรางตัว)'}
                                </span>
                                <span className={`font-bold text-xs sm:text-sm ${
                                    isSpecial ? 'text-[#ffb700]' : 'text-amber-400'
                                }`}>
                                    100 EXP
                                </span>
                            </div>
                            <p className={`text-[11px] sm:text-xs leading-relaxed ${
                                isSpecial ? 'text-zinc-300 font-light' : 'text-zinc-400'
                            }`}>
                                ขนาด: 1 ช่อง | เกราะพรางตัว ป้องกันสถิติหลุด 1 คืน
                            </p>
                        </div>

                        <button
                            type="button"
                            disabled={buyingId === 'stealth_camo' || exp < 100}
                            onClick={() => handleBuy('stealth_camo')}
                            className={`w-full py-2.5 px-3 border text-xs font-semibold tracking-wider transition-all ${btnCornerRadius} active:scale-[0.99] flex items-center justify-center gap-1.5 ${
                                exp >= 100
                                    ? isSpecial
                                        ? 'border-[#8cf044]/50 bg-[#0d1f0d] hover:bg-[#8cf044] text-[#8cf044] hover:text-black hover:font-bold'
                                        : 'border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-black font-medium'
                                    : isSpecial
                                    ? 'border-zinc-700 bg-zinc-900/60 text-zinc-500 cursor-not-allowed'
                                    : 'border-white/5 bg-zinc-900/40 text-zinc-600 cursor-not-allowed'
                            }`}
                        >
                            {buyingId === 'stealth_camo'
                                ? 'กำลังดำเนินการ...'
                                : isSpecial
                                ? '[ ซื้อ // 100 EXP ]'
                                : 'ซื้อ (100 EXP)'}
                        </button>
                    </div>

                    {/* 4. ATTACHÉ CASE (M) */}
                    <div className={`${
                        isSpecial
                            ? 'bg-[#071007] border border-[#8cf044]/30 hover:border-[#8cf044]/60'
                            : 'bg-zinc-900/50 border border-white/5 hover:border-white/15'
                    } p-4 ${subCornerRadius} flex flex-col justify-between gap-3 transition-colors shadow-sm`}>
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <span className={`font-bold tracking-wide text-xs sm:text-sm ${
                                    isSpecial ? 'text-[#8cf044]' : 'text-white'
                                }`}>
                                    {isSpecial ? '[ ATTACHÉ CASE (M) ]' : 'Attaché Case (M) (กระเป๋าเดินทาง M)'}
                                </span>
                                <span className={`font-bold text-xs sm:text-sm ${
                                    isSpecial ? 'text-[#ffb700]' : 'text-amber-400'
                                }`}>
                                    200 EXP
                                </span>
                            </div>
                            <p className={`text-[11px] sm:text-xs leading-relaxed ${
                                isSpecial ? 'text-zinc-300 font-light' : 'text-zinc-400'
                            }`}>
                                อัปเกรดกระเป๋า: 16 ช่อง | เพิ่มที่เก็บของ +4 ช่องถาวร
                            </p>
                        </div>

                        <button
                            type="button"
                            disabled={hasCaseM || buyingId === 'case_m' || exp < 200}
                            onClick={() => handleBuy('case_m')}
                            className={`w-full py-2.5 px-3 border text-xs font-semibold tracking-wider transition-all ${btnCornerRadius} active:scale-[0.99] flex items-center justify-center gap-1.5 ${
                                hasCaseM
                                    ? isSpecial
                                        ? 'border-[#8cf044]/30 bg-[#0d1f0d]/40 text-[#8cf044]/60 cursor-default'
                                        : 'border-white/5 bg-zinc-800/40 text-zinc-400 cursor-default'
                                    : exp >= 200
                                    ? isSpecial
                                        ? 'border-[#8cf044]/50 bg-[#0d1f0d] hover:bg-[#8cf044] text-[#8cf044] hover:text-black hover:font-bold'
                                        : 'border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-black font-medium'
                                    : isSpecial
                                    ? 'border-zinc-700 bg-zinc-900/60 text-zinc-500 cursor-not-allowed'
                                    : 'border-white/5 bg-zinc-900/40 text-zinc-600 cursor-not-allowed'
                            }`}
                        >
                            {hasCaseM
                                ? (isSpecial ? '[ ติดตั้งแล้ว // 16 ช่อง ]' : 'ติดตั้งแล้ว (16 ช่อง)')
                                : buyingId === 'case_m'
                                ? 'กำลังอัปเกรด...'
                                : (isSpecial ? '[ อัปเกรด // 200 EXP ]' : 'อัปเกรด (200 EXP)')}
                        </button>
                    </div>

                    {/* 5. ATTACHÉ CASE (L) */}
                    <div className={`${
                        isSpecial
                            ? 'bg-[#071007] border border-[#8cf044]/30 hover:border-[#8cf044]/60'
                            : 'bg-zinc-900/50 border border-white/5 hover:border-white/15'
                    } p-4 ${subCornerRadius} flex flex-col justify-between gap-3 transition-colors shadow-sm`}>
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <span className={`font-bold tracking-wide text-xs sm:text-sm ${
                                    isSpecial ? 'text-[#8cf044]' : 'text-white'
                                }`}>
                                    {isSpecial ? '[ ATTACHÉ CASE (L) ]' : 'Attaché Case (L) (กระเป๋าเดินทาง L)'}
                                </span>
                                <span className={`font-bold text-xs sm:text-sm ${
                                    isSpecial ? 'text-[#ffb700]' : 'text-amber-400'
                                }`}>
                                    400 EXP
                                </span>
                            </div>
                            <p className={`text-[11px] sm:text-xs leading-relaxed ${
                                isSpecial ? 'text-zinc-300 font-light' : 'text-zinc-400'
                            }`}>
                                อัปเกรดกระเป๋า: 20 ช่อง | ขยายความจุสูงสุด +4 ช่องถาวร (ต้องมี Case M ก่อน)
                            </p>
                        </div>

                        <button
                            type="button"
                            disabled={hasCaseL || !hasCaseM || buyingId === 'case_l' || exp < 400}
                            onClick={() => handleBuy('case_l')}
                            className={`w-full py-2.5 px-3 border text-xs font-semibold tracking-wider transition-all ${btnCornerRadius} active:scale-[0.99] flex items-center justify-center gap-1.5 ${
                                hasCaseL
                                    ? isSpecial
                                        ? 'border-[#8cf044]/30 bg-[#0d1f0d]/40 text-[#8cf044]/60 cursor-default'
                                        : 'border-white/5 bg-zinc-800/40 text-zinc-400 cursor-default'
                                    : !hasCaseM
                                    ? isSpecial
                                        ? 'border-zinc-800 bg-[#0a0d0a] text-zinc-500 cursor-not-allowed'
                                        : 'border-white/5 bg-zinc-900/40 text-zinc-600 cursor-not-allowed'
                                    : exp >= 400
                                    ? isSpecial
                                        ? 'border-[#8cf044]/50 bg-[#0d1f0d] hover:bg-[#8cf044] text-[#8cf044] hover:text-black hover:font-bold'
                                        : 'border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-black font-medium'
                                    : isSpecial
                                    ? 'border-zinc-700 bg-zinc-900/60 text-zinc-500 cursor-not-allowed'
                                    : 'border-white/5 bg-zinc-900/40 text-zinc-600 cursor-not-allowed'
                            }`}
                        >
                            {hasCaseL
                                ? (isSpecial ? '[ ติดตั้งแล้ว // สูงสุด 20 ช่อง ]' : 'ติดตั้งแล้ว (สูงสุด 20 ช่อง)')
                                : !hasCaseM
                                ? (isSpecial ? '[ ล็อก // ต้องมีกระเป๋า M ก่อน ]' : 'ล็อก (ต้องมีกระเป๋า M ก่อน)')
                                : buyingId === 'case_l'
                                ? 'กำลังอัปเกรด...'
                                : (isSpecial ? '[ อัปเกรด // 400 EXP ]' : 'อัปเกรด (400 EXP)')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
