import React from 'react';
import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    return (
        <div className="flex items-center gap-3 w-full select-none">
            {/* Pure Brand Icon without background */}
            <AppLogoIcon className="size-6 text-white fill-white shrink-0" />
            
            <div className="flex flex-col text-left group-data-[collapsible=icon]:hidden">
                <span className="text-sm font-semibold tracking-tight text-white leading-tight">
                    SleepOrDie
                </span>
                <span className="text-[10px] font-normal tracking-wide text-zinc-500 leading-none mt-0.5">
                    ระบบควบคุมการนอน
                </span>
            </div>
        </div>
    );
}
