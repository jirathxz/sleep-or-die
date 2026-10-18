import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { ChevronsUpDown, LogIn, UserPlus, LogOut, Settings, User as UserIcon } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { UserInfo } from '@/components/user-info';
import { UserMenuContent } from '@/components/user-menu-content';
import { useIsMobile } from '@/hooks/use-mobile';

export function NavUser() {
    const { auth } = usePage().props as { auth?: { user?: any } };
    const { state } = useSidebar();
    const isMobile = useIsMobile();

    const user = auth?.user;

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="group text-sidebar-accent-foreground data-[state=open]:bg-sidebar-accent rounded-xl hover:bg-[#18181b] transition-colors"
                            data-test="sidebar-menu-button"
                        >
                            {user ? (
                                <UserInfo user={user} />
                            ) : (
                                <>
                                    <div className="size-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 shrink-0">
                                        <UserIcon className="size-4" />
                                    </div>
                                    <div className="grid flex-1 text-left text-sm leading-tight ml-2">
                                        <span className="truncate font-medium text-white">Guest</span>
                                        <span className="truncate text-xs text-zinc-500 font-light">
                                            บัญชีผู้ใช้
                                        </span>
                                    </div>
                                </>
                            )}
                            <ChevronsUpDown className="ml-auto size-4 text-zinc-500" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-xl bg-[#121215] text-white border-0 shadow-2xl p-1.5"
                        align="end"
                        side={
                            isMobile
                                ? 'bottom'
                                : state === 'collapsed'
                                  ? 'left'
                                  : 'bottom'
                        }
                    >
                        {user ? (
                            <UserMenuContent user={user} />
                        ) : (
                            <div className="space-y-1">
                                <DropdownMenuLabel className="text-xs text-zinc-400 font-normal px-2 py-1.5">
                                    เข้าใช้งานแบบ Guest ชั่วคราว
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-white/[0.04]" />
                                <DropdownMenuItem asChild className="rounded-lg hover:bg-zinc-800 focus:bg-zinc-800 cursor-pointer">
                                    <Link href="/login" className="flex items-center gap-2 text-xs py-1.5">
                                        <LogIn className="size-3.5 text-zinc-400" />
                                        <span>เข้าสู่ระบบ</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild className="rounded-lg hover:bg-zinc-800 focus:bg-zinc-800 cursor-pointer">
                                    <Link href="/register" className="flex items-center gap-2 text-xs py-1.5">
                                        <UserPlus className="size-3.5 text-zinc-400" />
                                        <span>สมัครสมาชิก</span>
                                    </Link>
                                </DropdownMenuItem>
                            </div>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
