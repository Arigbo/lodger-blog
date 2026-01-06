'use client';

import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function WriterLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.push('/writer/dashboard');
        } catch (err: any) {
            console.error(err);
            setError('Invalid email or password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center space-y-2">
                    <Link href="/" className="font-headline font-black text-3xl tracking-tighter">
                        THE COMMONS<span className="text-primary text-4xl">.</span>
                    </Link>
                    <p className="text-muted-foreground font-medium">Writer Access Portal</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6 bg-white p-8 md:p-12 rounded-[2rem] shadow-xl border border-border/40">
                    {error && (
                        <div className="p-4 rounded-xl bg-destructive/10 text-destructive text-sm font-bold text-center">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-black"
                            placeholder="writer@lodger.co"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-black"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-primary-foreground font-bold h-14 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Sign In <ArrowRight className="h-5 w-5" /></>}
                    </button>
                </form>

                <div className="space-y-4 text-center">
                    <p className="text-sm text-muted-foreground">
                        Please use your existing <strong>Lodger</strong> account credentials.
                    </p>
                    <div className="text-sm text-muted-foreground">
                        Don't have an account? <Link href="/writer/signup" className="text-primary font-bold hover:underline">Sign Up</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
