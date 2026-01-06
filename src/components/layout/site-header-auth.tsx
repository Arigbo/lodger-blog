'use client';

import Link from 'next/link';
import { useWriterAuth } from '@/hooks/useWriterAuth';
import { UserProfileDropdown } from '@/components/auth/user-profile-dropdown';
import { NotificationBell } from '@/components/notifications/notification-bell';
import { Loader2 } from 'lucide-react';

export function SiteHeaderAuth() {
    const { user, loading } = useWriterAuth();

    if (loading) {
        return <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />;
    }

    if (user) {
        return (
            <div className="flex items-center gap-4">
                <NotificationBell />
                <UserProfileDropdown user={user} />
            </div>
        );
    }

    return (
        <div className="flex items-center gap-4">
            <Link href="/writer/login" className="hidden sm:inline-block font-bold text-sm hover:text-primary transition-colors">
                Log in
            </Link>
            <Link href="/writer/signup" className="bg-primary text-primary-foreground px-6 py-2.5 rounded-full font-bold text-sm hover:shadow-lg hover:-translate-y-0.5 transition-all">
                Sign up
            </Link>
        </div>
    );
}
