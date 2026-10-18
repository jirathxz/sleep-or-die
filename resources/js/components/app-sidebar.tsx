import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    LayoutGrid,
    AlarmClock,
    Calendar,
    History,
    Activity,
    Trophy,
    BarChart3,
    Sliders,
    HelpCircle,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavUser } from '@/components/nav-user';
import { MiniHpIndicator } from '@/components/Sleep/MiniHpIndicator';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';

interface MenuItem {
    title: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    matches?: string[];
}

const mainItems: MenuItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
        matches: ['/', '/dashboard'],
    },
    {
        title: 'นาฬิกาปลุก',
        href: '/alarms',
        icon: AlarmClock,
        matches: ['/alarms'],
    },
    {
        title: 'ตารางการนอน',
        href: '/schedule',
        icon: Calendar,
        matches: ['/schedule'],
    },
    {
        title: 'ประวัติการนอน',
        href: '/history',
        icon: History,
        matches: ['/history'],
    },
];

const progressionItems: MenuItem[] = [
    {
        title: 'สถานะชีวิต',
        href: '/progression',
        icon: Activity,
        matches: ['/progression'],
    },
    {
        title: 'ภารกิจและรางวัล',
        href: '/quests',
        icon: Trophy,
        matches: ['/quests'],
    },
    {
        title: 'สถิติการนอน',
        href: '/analytics',
        icon: BarChart3,
        matches: ['/analytics'],
    },
];

const systemItems: MenuItem[] = [
    {
        title: 'ตั้งค่า',
        href: '/settings',
        icon: Sliders,
        matches: ['/settings'],
    },
    {
        title: 'ช่วยเหลือ',
        href: '/help',
        icon: HelpCircle,
        matches: ['/help'],
    },
];

export function AppSidebar() {
    const { url } = usePage();

    const isItemActive = (item: MenuItem) => {
        if (item.matches) {
            return item.matches.some((path) => (path === '/' ? url === '/' : url.startsWith(path)));
        }
        return url === item.href;
    };

    const renderNavGroup = (label: string, items: MenuItem[]) => (
        <SidebarGroup className="px-2 py-1.5">
            <SidebarGroupLabel className="text-[10px] font-medium tracking-wider text-zinc-500 uppercase px-2 mb-1">
                {label}
            </SidebarGroupLabel>
            <SidebarMenu className="space-y-0.5">
                {items.map((item) => {
                    const active = isItemActive(item);
                    const Icon = item.icon;

                    return (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                isActive={active}
                                tooltip={{ children: item.title }}
                                className={`rounded-xl px-2.5 py-2 text-xs font-normal transition-colors ${
                                    active
                                        ? 'bg-[#18181b] text-white font-medium'
                                        : 'text-zinc-400 hover:text-white hover:bg-[#18181b]/60'
                                }`}
                            >
                                <Link href={item.href} prefetch className="flex items-center gap-3">
                                    <Icon className={`size-4 shrink-0 ${active ? 'text-white' : 'text-zinc-400'}`} />
                                    <span className="truncate">{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );

    return (
        <Sidebar
            collapsible="icon"
            className="w-64 border-r border-white/[0.04] bg-[#09090b] text-white select-none"
        >
            {/* Header with SleepOrDie Brand Identity */}
            <SidebarHeader className="p-3 pb-1">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="hover:bg-transparent p-1.5">
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
                <div className="h-px bg-white/[0.06] my-2 mx-1" />
            </SidebarHeader>

            {/* Sidebar Content with 3 Groups matching user design */}
            <SidebarContent className="space-y-1">
                {renderNavGroup('MAIN', mainItems)}
                {renderNavGroup('PROGRESSION', progressionItems)}
                {renderNavGroup('SYSTEM', systemItems)}
            </SidebarContent>

            {/* Sidebar Footer with Mini HP Indicator & User Profile */}
            <SidebarFooter className="p-2 space-y-2 mt-auto">
                {/* Mini HP Indicator (Requirement #4) */}
                <MiniHpIndicator />

                <div className="h-px bg-white/[0.06] mx-1" />

                {/* User / Guest Account (Requirement #1 & #4) */}
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
