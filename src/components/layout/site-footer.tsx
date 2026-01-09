'use client';

import Link from 'next/link';

export function SiteFooter() {
    return (
        <footer className="bg-black text-white pt-32 pb-16 px-6 overflow-hidden relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <div className="absolute top-0 right-0 p-60 bg-primary/10 blur-[150px] rounded-full -mr-40 -mt-40" />

            <div className="max-w-7xl mx-auto flex flex-col items-center text-center space-y-20 relative z-10">
                <div className="space-y-8 max-w-2xl">
                    <h2 className="font-headline font-black text-5xl md:text-7xl tracking-tight leading-none uppercase">
                        The future of <br /> <span className="text-primary">living</span> together.
                    </h2>
                    <p className="text-xl text-white/50 leading-relaxed font-medium">
                        Exploring the intersection of community, space, and modern home life.
                    </p>
                </div>

                <div className="w-full max-w-xl bg-white/5 backdrop-blur-2xl p-2 rounded-[2rem] border border-white/10 flex flex-col sm:flex-row gap-2">
                    <input
                        type="email"
                        placeholder="YOUR@EMAIL.COM"
                        className="flex-1 bg-transparent px-8 py-5 text-sm font-black tracking-widest outline-none uppercase placeholder:text-white/20"
                    />
                    <button className="bg-white text-black font-black px-10 py-5 rounded-[1.5rem] uppercase tracking-widest hover:bg-primary hover:text-white transition-all transform active:scale-95">
                        Subscribe
                    </button>
                </div>

                <div className="w-full pt-20 border-t border-white/10 grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
                    <div className="text-left">
                        <Link href="/" className="font-headline font-black text-2xl tracking-tighter">
                            LODGER BLOG<span className="text-primary truncate">.</span>
                        </Link>
                    </div>
                    <div className="flex justify-center gap-10 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                        <Link href="/about" className="hover:text-primary transition-colors">About</Link>
                        <Link href="https://twitter.com/lodger" className="hover:text-primary transition-colors">Twitter</Link>
                        <Link href="mailto:contact@lodger.com" className="hover:text-primary transition-colors">Contact</Link>
                    </div>
                    <div className="text-right text-[10px] font-black uppercase tracking-widest text-white/20">
                        © 2026 LODGER TECHNOLOGY GROUP
                    </div>
                </div>
            </div>
        </footer>
    );
}
