import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { LayoutGrid, BellRing, Calendar, History, Menu } from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar';

import { useTranslation } from '@/lib/i18n';

export function BottomNavigation() {
    const { url } = usePage();
    const { setOpenMobile } = useSidebar();
    const { t } = useTranslation();

    const navItems = [
        {
            key: 'nav_dashboard',
            href: '/dashboard',
            match: ['/', '/dashboard'],
            icon: LayoutGrid,
        },
        {
            key: 'nav_alarms',
            href: '/alarms',
            match: ['/alarms', '/bedtime-alerts'],
            icon: BellRing,
        },
        {
            key: 'nav_schedule',
            href: '/schedule',
            match: ['/schedule'],
            icon: Calendar,
        },
        {
            key: 'nav_history',
            href: '/history',
            match: ['/history'],
            icon: History,
        },
    ];

    const isCurrent = (matches: string[]) => {
        return matches.some((path) => (path === '/' ? url === '/' : url.startsWith(path)));
    };

    return (
        <nav className="md:hidden fixed bottom-0 inset-x-0 h-16 bg-[#09090b]/95 backdrop-blur-xl border-t border-white/[0.06] z-40 flex items-center justify-around px-2 select-none safe-bottom">
            {navItems.map((item) => {
                const active = isCurrent(item.match);
                const Icon = item.icon;
                const title = t(item.key);
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-colors ${
                            active ? 'text-white font-medium' : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                    >
                        <Icon className={`size-5 ${active ? 'text-white' : 'text-zinc-500'}`} />
                        <span className="text-[10px] tracking-tight">{title}</span>
                    </Link>
                );
            })}

            {/* Menu Drawer button for Progression & Settings */}
            <button
                type="button"
                onClick={() => setOpenMobile(true)}
                className="flex flex-col items-center justify-center gap-1 flex-1 py-1 text-zinc-500 hover:text-zinc-300 transition-colors"
            >
                <Menu className="size-5" />
                <span className="text-[10px] tracking-tight">เพิ่มเติม</span>
            </button>
        </nav>
    );
}
