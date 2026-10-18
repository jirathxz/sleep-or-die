import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Settings, Volume2, VolumeX, Clock, Bot, Loader2 } from 'lucide-react';

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
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-2xl border-border/70 shadow-2xl">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <Settings className="size-5 text-primary" />
                        <DialogTitle className="font-mono uppercase tracking-wider text-base">
                            Sleep Engine Parameters
                        </DialogTitle>
                    </div>
                    <DialogDescription className="text-xs font-mono text-muted-foreground">
                        Configure target wake-up time and Discord presence verification guard.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label htmlFor="wake_time" className="font-mono text-xs uppercase flex items-center gap-1.5">
                            <Clock className="size-3.5" />
                            Target Wake-up Time (เวลาตื่นเป้าหมาย)
                        </Label>
                        <Input
                            id="wake_time"
                            type="time"
                            value={wakeUpTime}
                            onChange={(e) => setWakeUpTime(e.target.value)}
                            required
                            className="font-mono text-lg py-5 bg-background/50 border-input"
                        />
                        <p className="text-[11px] text-muted-foreground font-mono">
                            Auto-calculates bedtime: 5 Sleep Cycles (7h 30m) + 15m latency.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="discord_id" className="font-mono text-xs uppercase flex items-center gap-1.5">
                            <Bot className="size-3.5" />
                            Target Discord User ID (สำหรับตรวจจับ)
                        </Label>
                        <Input
                            id="discord_id"
                            type="text"
                            placeholder="e.g. 123456789012345678"
                            value={discordId}
                            onChange={(e) => setDiscordId(e.target.value)}
                            className="font-mono text-sm bg-background/50 border-input"
                        />
                        <p className="text-[11px] text-muted-foreground font-mono">
                            Discord Presence Guard will track if this account is online during the 10-minute sleep verification window.
                        </p>
                    </div>

                    <Separator className="my-2" />

                    <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-muted-foreground">Audio Sirens & Warning Bells:</span>
                        <Button
                            type="button"
                            variant={audioEnabled ? 'outline' : 'secondary'}
                            size="sm"
                            onClick={onToggleAudio}
                            className="font-mono text-xs gap-1.5"
                        >
                            {audioEnabled ? (
                                <>
                                    <Volume2 className="size-3.5 text-emerald-400" />
                                    Sound ON
                                </>
                            ) : (
                                <>
                                    <VolumeX className="size-3.5 text-muted-foreground" />
                                    Muted
                                </>
                            )}
                        </Button>
                    </div>

                    <DialogFooter className="pt-4 flex gap-2">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={onClose}
                            className="font-mono text-xs uppercase"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={saving}
                            className="font-mono text-xs font-bold uppercase gap-2"
                        >
                            {saving && <Loader2 className="size-4 animate-spin" />}
                            Save Parameters
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
