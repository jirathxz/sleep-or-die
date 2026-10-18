import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentWakeUpTime: string | null;
    currentDiscordId: string | null;
    currentDiscordBotToken?: string | null;
    audioEnabled: boolean;
    onToggleAudio: () => void;
    onSave: (wakeUpTime: string, discordId?: string, discordBotToken?: string) => Promise<boolean>;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
    isOpen,
    onClose,
    currentWakeUpTime,
    currentDiscordId,
    currentDiscordBotToken,
    audioEnabled,
    onToggleAudio,
    onSave,
}) => {
    const [wakeUpTime, setWakeUpTime] = useState(currentWakeUpTime || '07:00');
    const [discordId, setDiscordId] = useState(currentDiscordId || '');
    const [discordToken, setDiscordToken] = useState(currentDiscordBotToken || '');
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        const success = await onSave(wakeUpTime, discordId, discordToken);
        setSaving(false);
        if (success) {
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md bg-[#121215] text-white border-0 rounded-2xl p-6 shadow-2xl">
                <DialogHeader className="space-y-1">
                    <DialogTitle className="text-base font-medium text-white tracking-normal">
                        ตั้งค่าพารามิเตอร์การนอนหลับ
                    </DialogTitle>
                    <DialogDescription className="text-xs text-zinc-400 font-light">
                        กำหนดเวลาตื่นเพื่อคำนวณเวลานอนอัตโนมัติ และเชื่อมต่อ Discord ตรวจจับ
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-2">
                    {/* Wake Up Time Input */}
                    <div className="space-y-1.5">
                        <label htmlFor="wake_time" className="text-xs text-zinc-300 font-normal">
                            เวลาตื่นเป้าหมาย
                        </label>
                        <input
                            id="wake_time"
                            type="time"
                            value={wakeUpTime}
                            onChange={(e) => setWakeUpTime(e.target.value)}
                            required
                            className="w-full h-11 px-3.5 bg-[#18181b] text-white rounded-lg border-0 text-base font-normal tabular-nums focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
                        />
                        <p className="text-[11px] text-zinc-500 font-light">
                            ระบบคำนวณอัตโนมัติ: 5 รอบการนอน 7 ชั่วโมง 30 นาที เผื่อเวลาหลับ 15 นาที
                        </p>
                    </div>

                    {/* Discord User ID Input */}
                    <div className="space-y-1.5">
                        <label htmlFor="discord_id" className="text-xs text-zinc-300 font-normal">
                            Discord User ID สำหรับตรวจจับสถานะ
                        </label>
                        <input
                            id="discord_id"
                            type="text"
                            placeholder="เช่น 123456789012345678"
                            value={discordId}
                            onChange={(e) => setDiscordId(e.target.value)}
                            className="w-full h-11 px-3.5 bg-[#18181b] text-white placeholder:text-zinc-600 rounded-lg border-0 text-sm font-normal focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
                        />
                        <p className="text-[11px] text-zinc-500 font-light">
                            บอท Discord จะตรวจจับสถานะออฟไลน์ในช่วงเวลานอน
                        </p>
                    </div>

                    {/* Discord Bot Token Input */}
                    <div className="space-y-1.5">
                        <label htmlFor="discord_token" className="text-xs text-zinc-300 font-normal">
                            Token Bot Discord
                        </label>
                        <input
                            id="discord_token"
                            type="password"
                            placeholder="เช่น MTIzNDU2Nzg5MDEyMzQ1Njc4.xxxxxx.xxxxxx"
                            value={discordToken}
                            onChange={(e) => setDiscordToken(e.target.value)}
                            className="w-full h-11 px-3.5 bg-[#18181b] text-white placeholder:text-zinc-600 rounded-lg border-0 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
                        />
                        <p className="text-[11px] text-zinc-500 font-light">
                            โทเค็นสำหรับบอท Discord ในการตรวจจับสถานะ Presence อัตโนมัติ
                        </p>
                    </div>

                    {/* Audio Toggle Row */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-[#18181b] text-xs">
                        <div className="space-y-0.5">
                            <span className="text-zinc-200 font-normal">เสียงไซเรนเตือนภัย</span>
                            <p className="text-[11px] text-zinc-500 font-light">
                                ส่งเสียงสัญญาณความถี่สูงเมื่อเข้าสู่สถานะวิกฤต
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={onToggleAudio}
                            className={`size-8 rounded-md flex items-center justify-center transition-colors ${
                                audioEnabled
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : 'bg-zinc-800 text-zinc-500'
                            }`}
                        >
                            {audioEnabled ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
                        </button>
                    </div>

                    <DialogFooter className="pt-3 gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="h-10 px-4 rounded-lg bg-[#18181b] text-zinc-300 hover:bg-[#27272a] text-xs font-normal transition-colors"
                        >
                            ยกเลิก
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="h-10 px-5 rounded-lg bg-white text-zinc-950 hover:bg-zinc-200 text-xs font-medium transition-colors flex items-center justify-center gap-2 active:scale-[0.99]"
                        >
                            {saving && <Loader2 className="size-3.5 animate-spin" />}
                            <span>บันทึกการตั้งค่า</span>
                        </button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
