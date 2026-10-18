import React from 'react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    return (
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-white/[0.04] bg-[#09090b] px-4 md:px-6 transition-all select-none">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
        </header>
    );
}
