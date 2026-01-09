'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, PenSquare, User, Bell, BookOpen, Settings, LogOut, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';

export function LeftSidebar() {
    const pathname = usePathname();
    const { user, signOut } = useAuth();

    const navItems = [
        { icon: Home, label: 'Home', href: '/home' },
        { icon: Search, label: 'Explore', href: '/explore' },
        { icon: Bell, label: 'Notifications', href: '/notifications' },
        { icon: BookOpen, label: 'My Stories', href: '/writer/dashboard' },
        { icon: User, label: 'Profile', href: `/u/${user?.uid}` },
        { icon: Settings, label: 'Settings', href: '/settings' },
    ];

    return (
        <div className="flex flex-col h-full px-4 lg:w-[275px] w-[88px]">
            {/* Logo */}
            <div className="py-4 lg:py-6">
                <Link href="/home" className="flex items-center gap-2 lg:px-4">
                    <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center shrink-0">
                        <BookOpen className="h-5 w-5 text-white" />
                    </div>
                </Link>
            </div>

            {/* Nav */}
            <nav className="flex-1 space-y-2 mt-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-4 p-3 lg:px-6 lg:py-3 rounded-full hover:bg-black/5 transition-all w-fit lg:w-full group",
                                isActive && "font-bold"
                            )}
                        >
                            <item.icon className={cn("h-7 w-7", isActive ? "stroke-[2.5px]" : "stroke-[1.5px]")} />
                            <span className={cn("hidden lg:block text-xl", isActive ? "font-bold" : "font-normal")}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}

                {/* Mobile/Tablet "Post" Icon only */}
                <div className="lg:hidden mt-4 flex justify-center">
                    <Link href="/writer/create">
                        <div className="h-14 w-14 bg-primary rounded-full flex items-center justify-center text-white shadow-lg">
                            <PenSquare className="h-6 w-6" />
                        </div>
                    </Link>
                </div>

                {/* Desktop "Post" Button */}
                <div className="hidden lg:block mt-8 w-full">
                    <Link href="/writer/create">
                        <button className="w-full bg-primary text-white font-bold text-lg py-3.5 rounded-full shadow-lg hover:bg-primary/90 transition-all">
                            Post
                        </button>
                    </Link>
                </div>
            </nav>

            {/* User Profile / Logout */}
            <div className="py-4 lg:mb-4">
                <div className="flex items-center gap-3 p-3 rounded-full hover:bg-black/5 transition-all cursor-pointer group w-full">
                    <div className="h-10 w-10 rounded-full bg-muted overflow-hidden shrink-0">
                        {user?.photoURL ? (
                            <img src={user.photoURL} alt={user.displayName || 'User'} className="h-full w-full object-cover" />
                        ) : (
                            <div className="h-full w-full bg-black/5 flex items-center justify-center">
                                <User className="h-5 w-5 text-muted-foreground" />
                            </div>
                        )}
                    </div>
                    <div className="hidden lg:block flex-1 min-w-0">
                        <div className="font-bold truncate text-sm">{user?.displayName || 'Ghost Writer'}</div>
                        <div className="text-muted-foreground text-sm truncate">@{user?.email?.split('@')[0]}</div>
                    </div>
                    <MoreHorizontal className="hidden lg:block h-5 w-5 text-muted-foreground" />
                </div>
            </div>
        </div>
    );
}
