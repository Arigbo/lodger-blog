'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from "@/components/providers/auth-provider";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { AlertCircle, ExternalLink } from "lucide-react";

export function LayoutContent({ children }: { children: React.ReactNode }) {
    const { openAuthModal, user } = useAuth();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const isAppRoute = pathname?.startsWith('/writer') ||
        pathname?.startsWith('/home') ||
        pathname?.startsWith('/post') ||
        pathname?.startsWith('/explore') ||
        pathname?.startsWith('/notifications') ||
        pathname?.startsWith('/search') ||
        pathname?.startsWith('/settings') ||
        pathname?.startsWith('/u');

    useEffect(() => {
        const authAction = searchParams.get('auth');
        if (authAction === 'login') openAuthModal('login');
        if (authAction === 'signup') openAuthModal('signup');
    }, [searchParams, openAuthModal]);

    if (isAppRoute) {
        return <>{children}</>;
    }

    return (
        <div className="flex flex-col min-h-screen">
            {user?.isIncomplete && (
                <div className="bg-primary text-white py-3 px-6 text-center text-[10px] font-black uppercase tracking-[0.2em] relative z-[60] flex items-center justify-center gap-4 animate-in slide-in-from-top duration-500">
                    <AlertCircle className="h-3 w-3" />
                    <span>Your Lodger profile is incomplete. Finish it to unlock all features.</span>
                    <a href="https://lodger-ancients.vercel.app/student/account" className="flex items-center gap-1.5 hover:underline decoration-2 underline-offset-4">
                        Complete Now <ExternalLink className="h-3 w-3" />
                    </a>
                </div>
            )}
            <SiteHeader />
            <main className="flex-grow pt-32 pb-20">
                {children}
            </main>
            <SiteFooter />
        </div>
    );
}
