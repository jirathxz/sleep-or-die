import React, { useState } from 'react';
import { useSleepStore } from '@/stores/useSleepStore';
import {
    ShoppingBag,
    AlertTriangle,
    CheckCircle2,
    Shield,
    Heart,
    Clock,
    Lock,
    Package,
    ArrowUpRight,
    Loader2,
} from 'lucide-react';

interface BlackMarketViewProps {
    onSwitchTab: (tabIndex: number) => void;
}

interface MarketItemData {
    id: string;
    nameEn: string;
    nameTh: string;
    icon: string;
    cost: number;
    slots: number;
    badge: string;
    desc: string;
    isUpgrade?: boolean;
}

const MARKET_ITEMS: MarketItemData[] = [
    {
        id: 'ration_supply',
        nameEn: 'Ration Supply',
        nameTh: 'อาหารฉุกเฉิน MRE',
        icon: '/images/items/ration.jpg',
        cost: 30,
        slots: 2,
        badge: 'เสบียงฟื้นฟู',
        desc: 'ฟื้นฟูพลังชีวิต LIFE +30% ทันที และขยายเวลานอนผ่อนผัน +5 นาที',
    },
    {
        id: 'first_aid_spray',
        nameEn: 'First Aid Spray',
        nameTh: 'สเปรย์ปฐมพยาบาล',
        icon: '/images/items/first_aid_spray.jpg',
        cost: 60,
        slots: 1,
        badge: 'การแพทย์ฉุกเฉิน',
        desc: 'ฟื้นฟูพลังชีวิตฉุกเฉิน LIFE +50% ชะลออาการหลับฝ่าฝืน',
    },
    {
        id: 'stealth_camo',
        nameEn: 'Stealth Camo',
        nameTh: 'เกราะพรางตัวล่องหน',
        icon: '/images/items/stealth_camo.jpg',
        cost: 100,
        slots: 1,
        badge: 'อุปกรณ์พรางตัว',
        desc: 'พรางตัว ป้องกันสถิติหลุดและการหักแต้มสไตรค์ 1 คืน',
    },
    {
        id: 'case_m',
        nameEn: 'Attaché Case (M)',
        nameTh: 'กระเป๋าเดินทาง M',
        icon: '/images/items/case_m.jpg',
        cost: 200,
        slots: 0,
        badge: 'อัปเกรดกระเป๋า',
        desc: 'ขยายความจุช่องเก็บของจาก 12 -> 16 ช่อง (+4 ช่องถาวร)',
        isUpgrade: true,
    },
    {
        id: 'case_l',
        nameEn: 'Attaché Case (L)',
        nameTh: 'กระเป๋าเดินทาง L',
        icon: '/images/items/case_l.jpg',
        cost: 400,
        slots: 0,
        badge: 'อัปเกรดกระเป๋าสูงสุด',
        desc: 'ขยายความจุช่องเก็บของจาก 16 -> 20 ช่อง (+4 ช่องถาวร • ต้องมี Case M ก่อน)',
        isUpgrade: true,
    },
];

export function BlackMarketView({ onSwitchTab }: BlackMarketViewProps) {
    const {
        exp,
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
            {/* Top Subbar: Telemetry Status */}
            <div className={`${isSpecial ? 'bg-[#070e07] border border-[#8cf044]/30' : 'bg-[#121215] border border-white/5'} ${cornerRadius} p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner`}>
                <div className="flex flex-wrap items-center gap-6 text-xs sm:text-sm">
                    {/* EXP Balance */}
                    <div className="flex flex-col">
                        <span className={`text-[11px] ${isSpecial ? 'text-[#5a8a40]' : 'text-zinc-400'} tracking-wide`}>
                            {isSpecial ? '// EXP ที่มี' : 'EXP ที่มี'}
                        </span>
                        <div className="flex items-center gap-2">
                            <span className="size-5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                                XP
                            </span>
                            <span className={`text-xl sm:text-2xl font-bold font-mono ${isSpecial ? 'text-[#ffb700] drop-shadow-[0_0_8px_rgba(255,183,0,0.3)]' : 'text-amber-400'} tracking-wider`}>
                                {exp.toLocaleString()} EXP
                            </span>
                        </div>
                    </div>

                    {/* Inventory Slots */}
                    <div className={`flex flex-col border-l ${isSpecial ? 'border-[#8cf044]/20' : 'border-white/10'} pl-4 sm:pl-6`}>
                        <span className={`text-[11px] ${isSpecial ? 'text-[#5a8a40]' : 'text-zinc-400'} tracking-wide`}>
                            {isSpecial ? '// ช่องกระเป๋า' : 'ช่องกระเป๋า'}
                        </span>
                        <div className="flex items-center gap-1.5 pt-0.5">
                            <Package className={`size-4 ${isSpecial ? 'text-[#8cf044]' : 'text-zinc-400'}`} />
                            <span className={`text-sm sm:text-base font-semibold font-mono ${isSpecial ? 'text-[#8cf044]' : 'text-white'} tracking-wide`}>
                                {used_slots}/{inventory_capacity}
                            </span>
                            <span className="text-[11px] text-zinc-500">ช่อง</span>
                        </div>
                    </div>

                    {/* Military Rank */}
                    <div className={`flex flex-col border-l ${isSpecial ? 'border-[#8cf044]/20' : 'border-white/10'} pl-4 sm:pl-6`}>
                        <span className={`text-[11px] ${isSpecial ? 'text-[#5a8a40]' : 'text-zinc-400'} tracking-wide`}>
                            {isSpecial ? '// ยศปัจจุบัน' : 'ยศปัจจุบัน'}
                        </span>
                        <span className="text-xs sm:text-sm font-semibold tracking-wider pt-0.5">
                            FOXHOUND {isSpecial ? (
                                <span className="text-[#8cf044] font-bold">[OPERATIVE {level}]</span>
                            ) : (
                                <span className="text-emerald-400 font-medium">Operative {level}</span>
                            )}
                        </span>
                    </div>
                </div>

                {/* Right: Switch to Inventory Tab Button */}
                <button
                    type="button"
                    onClick={() => onSwitchTab(2)}
                    className={`self-start sm:self-center px-4 py-2 border ${
                        isSpecial
                            ? 'border-[#8cf044]/40 hover:border-[#8cf044] bg-[#0c180c] hover:bg-[#132613] text-[#8cf044] hover:text-[#afff69]'
                            : 'border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white'
                    } text-xs font-medium tracking-wide transition-colors active:scale-[0.98] ${btnCornerRadius} flex items-center gap-1.5 cursor-pointer`}
                >
                    <ShoppingBag className="size-3.5" />
                    <span>{isSpecial ? '[ ดูกระเป๋าเก็บของ ]' : 'ดูกระเป๋าเก็บของ'}</span>
                </button>
            </div>

            {/* Notification alert banner */}
            {actionFeedback && (
                <div
                    className={`p-3 border text-xs flex items-center gap-2 ${subCornerRadius} transition-all animate-in fade-in ${
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
            <div className={`${isSpecial ? 'bg-[#050b05] border border-[#8cf044]/30' : 'bg-[#121215] border border-white/5'} ${cornerRadius} p-4 sm:p-5 space-y-4 shadow-sm`}>
                {/* Header title */}
                <div className={`border-b ${isSpecial ? 'border-[#8cf044]/20' : 'border-white/10'} pb-3 flex items-center justify-between`}>
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

                    <span className="text-[11px] font-mono text-zinc-500">
                        {isSpecial ? 'SUPPLY PROTOCOL 141.80' : 'รายการเสบียงยุทธวิธี'}
                    </span>
                </div>

                {/* CODEC Radio transmission dialog box */}
                <div className={`border ${
                    isSpecial
                        ? 'border-[#8cf044]/40 bg-[#071107]'
                        : 'border-white/5 bg-zinc-900/40'
                } p-3 sm:p-4 ${subCornerRadius} flex flex-col sm:flex-row gap-3.5 items-start sm:items-center relative overflow-hidden`}>
                    {/* CRT Scanline glow backdrop - only for special theme */}
                    {isSpecial && (
                        <div className="absolute inset-0 bg-gradient-to-b from-[#8cf044]/5 to-transparent pointer-events-none" />
                    )}

                    {/* Left: Avatar */}
                    <div className={`relative shrink-0 border-2 ${
                        isSpecial
                            ? 'border-[#8cf044]/60 shadow-[0_0_12px_rgba(140,240,68,0.2)]'
                            : 'border-white/10 shadow-sm'
                    } bg-black size-16 sm:size-20 ${subCornerRadius} overflow-hidden`}>
                        <img
                            src="/images/codec_merchant.jpg"
                            alt="Merchant CODEC"
                            className="w-full h-full object-cover grayscale contrast-125 brightness-90 hover:grayscale-0 transition-all duration-300"
                        />
                        <div className="absolute top-1 left-1 bg-black/80 px-1 py-0.2 rounded text-[9px] font-mono text-emerald-400 font-bold border border-emerald-500/40">
                            CODEC
                        </div>
                    </div>

                    {/* Right: CODEC Dialog lines */}
                    <div className="space-y-1 text-xs sm:text-sm flex-1 z-10">
                        <p className={`text-[11px] ${isSpecial ? 'text-[#5a8a40]' : 'text-zinc-400'} tracking-wide`}>
                            {isSpecial ? '// สัญญาณวิทยุ CODEC: 141.80 [พ่อค้าตลาดมืด]' : 'สัญญาณวิทยุ CODEC: 141.80 • พ่อค้าตลาดมืด'}
                        </p>
                        <p className={`font-semibold ${isSpecial ? 'text-[#8cf044]' : 'text-zinc-200'} tracking-wide`}>
                            &ldquo;ยินดีต้อนรับ สหาย... หึๆๆ... วันนี้จะซื้ออะไรดีล่ะ?&rdquo;
                        </p>
                        <p className={`text-[11px] ${isSpecial ? 'text-[#ff5555]' : 'text-rose-400/90'} font-normal leading-relaxed`}>
                            {isSpecial ? '> ' : ''}คำเตือน: ซื้อของจะหักแต้ม EXP ทันที และอาจทำให้เลเวลลดลงได้หากแต้มไม่พอ
                        </p>
                    </div>
                </div>

                {/* GAME ITEM LIST VIEW (Resident Evil 4 Merchant List Style) */}
                <div className={`border ${isSpecial ? 'border-[#8cf044]/20' : 'border-white/5'} ${subCornerRadius} overflow-hidden bg-black/40 divide-y ${isSpecial ? 'divide-[#8cf044]/15' : 'divide-white/5'}`}>
                    {/* List Header Row */}
                    <div className={`px-3.5 py-2 text-[10px] uppercase font-mono tracking-wider ${isSpecial ? 'bg-[#091509] text-[#5a8a40]' : 'bg-[#16161a] text-zinc-500'} flex items-center justify-between`}>
                        <div className="flex items-center gap-3">
                            <span className="w-16 text-center">ไอเทม</span>
                            <span>รายละเอียด</span>
                        </div>
                        <div className="flex items-center gap-8 pr-2">
                            <span className="hidden md:inline w-24 text-center">ช่องกระเป๋า</span>
                            <span className="w-20 text-right">ราคา</span>
                            <span className="w-24 text-center">คำสั่ง</span>
                        </div>
                    </div>

                    {/* List Rows */}
                    {MARKET_ITEMS.map((item) => {
                        const isInstalled = item.id === 'case_m' ? hasCaseM : item.id === 'case_l' ? hasCaseL : false;
                        const isLocked = item.id === 'case_l' && !hasCaseM;
                        const hasSpace = item.slots === 0 || (used_slots + item.slots <= inventory_capacity);
                        const canAfford = exp >= item.cost;
                        const isProcessing = buyingId === item.id;
                        const canBuy = !isInstalled && !isLocked && hasSpace && canAfford && !isProcessing;

                        return (
                            <div
                                key={item.id}
                                className={`group p-3 sm:p-3.5 transition-all duration-150 flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                                    isSpecial
                                        ? 'hover:bg-gradient-to-r hover:from-[#8cf044]/15 hover:via-[#8cf044]/5 hover:to-transparent'
                                        : 'hover:bg-gradient-to-r hover:from-white/10 hover:via-white/5 hover:to-transparent'
                                } ${isInstalled || isLocked ? 'opacity-60' : ''}`}
                            >
                                {/* Left Section: Item Icon & Text Description */}
                                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                                    {/* Item Icon Thumbnail */}
                                    <div className={`relative shrink-0 size-14 sm:size-16 ${subCornerRadius} overflow-hidden bg-black/80 border ${
                                        isSpecial
                                            ? 'border-[#8cf044]/30 group-hover:border-[#8cf044]'
                                            : 'border-white/10 group-hover:border-white/25'
                                    } p-1 flex items-center justify-center shadow-md transition-colors`}>
                                        <img
                                            src={item.icon}
                                            alt={item.nameEn}
                                            className="w-full h-full object-contain filter contrast-110 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] group-hover:scale-105 transition-transform duration-200"
                                            onError={(e) => {
                                                // Fallback if image not ready
                                                e.currentTarget.style.display = 'none';
                                            }}
                                        />
                                        {/* Fallback Icon if image fails */}
                                        <Package className="size-6 text-zinc-600 hidden peer-only:block" />
                                    </div>

                                    {/* Item Titles & Description */}
                                    <div className="space-y-1 min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className={`text-sm sm:text-base font-semibold tracking-wide ${
                                                isSpecial ? 'text-[#8cf044]' : 'text-white'
                                            }`}>
                                                {isSpecial ? `[ ${item.nameEn.toUpperCase()} ]` : item.nameEn}
                                            </span>
                                            <span className="text-xs text-zinc-400 font-normal">
                                                • {item.nameTh}
                                            </span>
                                            <span className={`text-[10px] px-1.5 py-0.2 rounded border font-mono ${
                                                isSpecial
                                                    ? 'bg-[#0f250f] text-[#ffb700] border-[#ffb700]/30'
                                                    : 'bg-zinc-800 text-zinc-400 border-white/5'
                                            }`}>
                                                {item.badge}
                                            </span>
                                        </div>

                                        <p className="text-xs text-zinc-400 font-light leading-relaxed truncate-2-lines">
                                            {item.desc}
                                        </p>
                                    </div>
                                </div>

                                {/* Right Section: Slots Indicator, Price, and Buy Action */}
                                <div className="flex items-center justify-between md:justify-end gap-4 sm:gap-6 pt-2 md:pt-0 border-t md:border-t-0 border-white/5">
                                    {/* Inventory Space Indicator (Resident Evil 4 Style Grid Blocks) */}
                                    <div className="flex flex-col items-start md:items-center min-w-[90px] shrink-0">
                                        {item.slots > 0 ? (
                                            <>
                                                {!hasSpace ? (
                                                    <div className="space-y-0.5 text-center">
                                                        <span className="text-rose-500 font-mono text-xs font-bold tracking-wider animate-pulse flex items-center gap-1">
                                                            NO SPACE
                                                        </span>
                                                        <span className="text-[10px] font-mono text-rose-400/80">
                                                            กระเป๋าเต็ม
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-1 text-center">
                                                        <div className="flex items-center justify-center gap-1">
                                                            {Array.from({ length: item.slots }).map((_, i) => (
                                                                <span
                                                                    key={i}
                                                                    className={`size-3 rounded-xs border ${
                                                                        isSpecial
                                                                            ? 'bg-[#8cf044]/30 border-[#8cf044]/60'
                                                                            : 'bg-zinc-700 border-zinc-500'
                                                                    }`}
                                                                    title={`${item.slots} ช่อง`}
                                                                />
                                                            ))}
                                                        </div>
                                                        <span className="text-[10px] font-mono text-zinc-400 block">
                                                            {item.slots} ช่อง
                                                        </span>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="text-center space-y-0.5">
                                                <span className={`text-xs font-mono font-medium ${isSpecial ? 'text-[#8cf044]' : 'text-emerald-400'}`}>
                                                    +4 ช่อง
                                                </span>
                                                <span className="text-[10px] font-mono text-zinc-500 block">
                                                    ขยายกระเป๋า
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Price Column */}
                                    <div className="flex items-center gap-1.5 min-w-[80px] justify-end shrink-0">
                                        <span className="size-4 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-[9px] font-bold flex items-center justify-center">
                                            XP
                                        </span>
                                        <span className={`text-sm sm:text-base font-bold font-mono tracking-tight ${
                                            !canAfford
                                                ? 'text-zinc-500 line-through'
                                                : isSpecial
                                                ? 'text-[#ffb700]'
                                                : 'text-amber-400'
                                        }`}>
                                            {item.cost.toLocaleString()}
                                        </span>
                                    </div>

                                    {/* Action Button */}
                                    <div className="min-w-[100px] flex justify-end shrink-0">
                                        {isInstalled ? (
                                            <span className="h-8 px-3 rounded-lg bg-zinc-800/40 text-zinc-500 text-xs font-mono border border-white/5 cursor-default flex items-center justify-center gap-1.5">
                                                <CheckCircle2 className="size-3.5 text-zinc-500" />
                                                <span>ติดตั้งแล้ว</span>
                                            </span>
                                        ) : isLocked ? (
                                            <span className="h-8 px-3 rounded-lg bg-zinc-900/60 text-zinc-600 text-xs font-mono border border-white/5 cursor-not-allowed flex items-center justify-center gap-1.5" title="ต้องมีกระเป๋า Case M ก่อน">
                                                <Lock className="size-3" />
                                                <span>ล็อก</span>
                                            </span>
                                        ) : !hasSpace ? (
                                            <span className="h-8 px-3 rounded-lg bg-rose-950/20 text-rose-400/60 text-xs font-mono border border-rose-500/20 cursor-not-allowed flex items-center justify-center">
                                                ไม่มีที่ว่าง
                                            </span>
                                        ) : !canAfford ? (
                                            <span className="h-8 px-3 rounded-lg bg-zinc-900/60 text-zinc-500 text-xs font-mono border border-white/5 cursor-not-allowed flex items-center justify-center">
                                                EXP ไม่พอ
                                            </span>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => handleBuy(item.id)}
                                                disabled={!canBuy}
                                                className={`h-8 px-4 text-xs font-semibold tracking-wider transition-all ${btnCornerRadius} active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm ${
                                                    isSpecial
                                                        ? 'bg-[#0d220d] hover:bg-[#8cf044] text-[#8cf044] hover:text-black border border-[#8cf044]/60 font-bold hover:shadow-[0_0_12px_rgba(140,240,68,0.4)]'
                                                        : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-emerald-500/20'
                                                }`}
                                            >
                                                {isProcessing ? (
                                                    <Loader2 className="size-3.5 animate-spin" />
                                                ) : (
                                                    <span>{item.isUpgrade ? 'อัปเกรด' : 'ซื้อ'}</span>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
