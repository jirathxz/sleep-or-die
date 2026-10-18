import React, { useState } from 'react';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentWakeUpTime: string | null;
    currentDiscordId: string | null;
    audioEnabled: boolean;
    onToggleAudio: () => void;
    onSave: (wakeUpTime: string, discordId?: string) => Promise<boolean>;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
    isOpen,
    onClose,
    currentWakeUpTime,
    currentDiscordId,
    audioEnabled,
    onToggleAudio,
    onSave,
}) => {
    const [wakeUpTime, setWakeUpTime] = useState(currentWakeUpTime || '07:00');
    const [discordId, setDiscordId] = useState(currentDiscordId || '');
    const [saving, setSaving] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        const success = await onSave(wakeUpTime, discordId);
        setSaving(false);
        if (success) {
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-neutral-950 border border-neutral-800 rounded-3xl p-6 shadow-2xl">
                <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
                    <h2 className="text-lg font-mono font-bold text-white uppercase tracking-wider">
                        ⚙️ Sleep Parameters
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-neutral-500 hover:text-white font-mono text-sm"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                    <div>
                        <label className="block text-xs font-mono uppercase text-neutral-400 mb-2">
                            Wake-up Time (เวลาตื่นเป้าหมาย)
                        </label>
                        <input
                            type="time"
                            value={wakeUpTime}
                            onChange={(e) => setWakeUpTime(e.target.value)}
                            required
                            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 font-mono text-white text-lg focus:outline-none focus:border-emerald-500"
                        />
                        <p className="text-[11px] text-neutral-500 font-mono mt-1.5">
                            ระบบจะคำนวณเวลานอน 5 Sleep Cycles (7h 30m) + 15m buffer ให้อัตโนมัติ
                        </p>
                    </div>

                    <div>
                        <label className="block text-xs font-mono uppercase text-neutral-400 mb-2">
                            Target Discord User ID (สำหรับตรวจจับ)
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. 123456789012345678"
                            value={discordId}
                            onChange={(e) => setDiscordId(e.target.value)}
                            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 font-mono text-white text-sm focus:outline-none focus:border-emerald-500"
                        />
                        <p className="text-[11px] text-neutral-500 font-mono mt-1.5">
                            บอทจะเช็คสถานะ Discord ของ ID นี้หลังกดยืนยันนอน
                        </p>
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-neutral-900">
                        <span className="text-xs font-mono text-neutral-300">Audio Alarm & Sirens:</span>
                        <button
                            type="button"
                            onClick={onToggleAudio}
                            className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold border ${
                                audioEnabled
                                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                    : 'bg-neutral-900 border-neutral-800 text-neutral-500'
                            }`}
                        >
                            {audioEnabled ? '🔊 Sound ON' : '🔇 Muted'}
                        </button>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 font-mono text-xs uppercase"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-mono text-xs font-black uppercase transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Save Settings'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
