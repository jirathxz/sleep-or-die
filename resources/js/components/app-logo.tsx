import React from 'react';
import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    return (
        <div className="flex items-center gap-3 w-full select-none">
            {/* White rounded squircle icon container matching user design */}
            <div className="flex aspect-square size-9 items-center justify-center rounded-xl bg-white text-zinc-950 shadow-sm shrink-0">
                <AppLogoIcon className="size-4.5 text-zinc-950 fill-zinc-950" />
            </div>
            
            <div className="flex flex-col text-left group-data-[collapsible=icon]:hidden">
                <span className="text-sm font-semibold tracking-tight text-white leading-tight">
                    SleepOrDie
                </span>
                <span className="text-[9px] font-medium tracking-wider text-zinc-500 uppercase leading-none mt-0.5">
                    SLEEP MANAGEMENT
                </span>
            </div>
        </div>
    );
}
