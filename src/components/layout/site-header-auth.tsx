'use client';

import Link from 'next/link';
import { useAuth } from '@/components/providers/auth-provider';
import { UserProfileDropdown } from '@/components/auth/user-profile-dropdown';
import { NotificationBell } from '@/components/notifications/notification-bell';
import { LayoutDashboard, LogOut, Sparkles, Loader2 } from 'lucide-react';

export function SiteHeaderAuth() {
    const { user, loading, openAuthModal } = useAuth();

    if (loading) {
        return <Loader2 className="h-5 w-5 animate-spin text-muted-foreground/30" />;
    }

    if (user) {
        return (
            <div className="flex items-center gap-6">
                <NotificationBell />
                <UserProfileDropdown user={user} />
            </div>
        );
    }

    return (
        <div className="flex items-center gap-6">
            <button
                onClick={() => openAuthModal('login')}
                className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-black transition-colors"
            >
                Log in
            </button>
            <button
                onClick={() => openAuthModal('signup')}
                className="bg-black text-white text-[11px] font-black uppercase tracking-[0.2em] px-8 py-4 rounded-xl hover:bg-primary transition-all shadow-xl hover:shadow-primary/20 active:scale-95 flex items-center gap-2 group"
            >
                Join the Community <Sparkles className="h-3 w-3 group-hover:animate-pulse" />
            </button>
        </div>
    );
}
