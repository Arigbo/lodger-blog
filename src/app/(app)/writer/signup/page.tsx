'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function WriterSignupPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/?auth=signup');
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-pulse font-headline font-black uppercase tracking-[0.2em] text-muted-foreground/40 italic">
                Redirecting to The Commons...
            </div>
        </div>
    );
}
