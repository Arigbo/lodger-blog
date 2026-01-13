'use client';

import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { SiteHeaderAuth } from './site-header-auth';
import { Logo } from '@/components/logo';

export function SiteHeader() {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-black/5 h-20">
            <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
                <Link href="/" className="font-serif font-black text-2xl tracking-tighter group flex items-center gap-3">
                    <Logo className="w-10 h-10" />
                    <span className="italic">THE COMMONS</span>
                </Link>
                <div className="hidden lg:flex items-center gap-10 text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                    <Link href="/" className="hover:text-primary transition-all relative group">
                        Posts
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
                    </Link>
                    <Link href="/about" className="hover:text-primary transition-all relative group">
                        About
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
                    </Link>
                    <Link href="/category/guides" className="hover:text-primary transition-all relative group">
                        Guides
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
                    </Link>
                </div>
                <SiteHeaderAuth />
            </div>
        </nav>
    );
}
