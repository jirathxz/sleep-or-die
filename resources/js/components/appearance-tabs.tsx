import { Moon } from 'lucide-react';
import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export default function AppearanceToggleTab({
    className = '',
    ...props
}: HTMLAttributes<HTMLDivElement>) {
    return (
        <div className="flex flex-col gap-3">
            <div
                className={cn(
                    'inline-flex items-center gap-2 rounded-xl bg-zinc-900 border border-white/[0.06] p-1.5 w-fit',
                    className,
                )}
                {...props}
            >
                <div className="flex items-center gap-2 rounded-lg bg-zinc-800 px-3.5 py-1.5 text-white font-medium text-xs shadow-xs">
                    <Moon className="h-4 w-4 text-indigo-400" />
                    <span>Dark Theme (ถาวร)</span>
                </div>
            </div>
            <p className="text-xs text-zinc-500 max-w-md">
                SleepOrDie ถูกกำหนดให้ทำงานในโหมดมืด (Dark Theme) ล้วนเท่านั้น เพื่อลดแสงสะท้อน ถนอมสายตา และสร้างสภาพแวดล้อมที่เหมาะสมต่อการนอนหลับ
            </p>
        </div>
    );
}
