'use client';

import Link from 'next/link';
import { useWriterAuth } from '@/hooks/useWriterAuth';
import { UserProfileDropdown } from '@/components/auth/user-profile-dropdown';
import { NotificationBell } from '@/components/notifications/notification-bell';
import { Loader2, Sparkles, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SiteHeaderAuth() {
    const { user, loading } = useWriterAuth();

    if (loading) {
        return <Loader2 className="h-5 w-5 animate-spin text-muted-foreground/30" />;
    }

    if (user) {
        return (
            <div className="flex items-center gap-6">
                <Link
                    href="/writer/dashboard"
                    className="hidden lg:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-all bg-[#f8f8f8] px-5 py-3 rounded-full border border-black/5"
                >
                    <LayoutDashboard className="h-3 w-3" />
                    Dashboard
                </Link>
                <NotificationBell />
                <UserProfileDropdown user={user} />
            </div>
        );
    }

    return (
        <div className="flex items-center gap-6">
            <Link href="/writer/login" className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-black transition-colors">
                Log in
            </Link>
            <Link
                href="/writer/signup"
                className="bg-black text-white text-[11px] font-black uppercase tracking-[0.2em] px-8 py-4 rounded-xl hover:bg-primary transition-all shadow-xl hover:shadow-primary/20 active:scale-95 flex items-center gap-2 group"
            >
                Join as Writer <Sparkles className="h-3 w-3 group-hover:animate-pulse" />
            </Link>
        </div>
    );
}
