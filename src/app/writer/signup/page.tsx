'use client';

import { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function WriterSignupPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'student' | 'landlord'>('student');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // 1. Create Auth User
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 2. Update Profile Display Name
            await updateProfile(user, {
                displayName: name
            });

            // 3. Create User Document in Firestore (Shared with Lodger Main App)
            await setDoc(doc(db, 'users', user.uid), {
                id: user.uid,
                name: name,
                email: email,
                role: role, // 'student' or 'landlord'
                createdAt: serverTimestamp(),
                profileImageUrl: null,
                bio: `Lodger ${role.charAt(0).toUpperCase() + role.slice(1)}`
            });

            router.push('/writer/dashboard');
        } catch (err: any) {
            console.error(err);
            if (err.code === 'auth/email-already-in-use') {
                setError('Email already in use.');
            } else if (err.code === 'auth/weak-password') {
                setError('Password should be at least 6 characters.');
            } else {
                setError('Failed to create account. ' + err.message);
            }
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
                    <p className="text-muted-foreground font-medium">Create your Lodger Account</p>
                </div>

                <form onSubmit={handleSignup} className="space-y-6 bg-white p-8 md:p-12 rounded-[2rem] shadow-xl border border-border/40">
                    {error && (
                        <div className="p-4 rounded-xl bg-destructive/10 text-destructive text-sm font-bold text-center">
                            {error}
                        </div>
                    )}

                    <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl text-sm text-primary-foreground/80 font-medium leading-relaxed">
                        <span className="font-bold text-primary block mb-1">One Account for Everything</span>
                        Creating an account here also creates your <strong>Lodger</strong> account. You'll be able to use these credentials to sign in to both <em>The Commons</em> and the main <em>Lodger App</em>.
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Full Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-black"
                            placeholder="Jane Doe"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-black"
                            placeholder="you@lodger.co"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">I am a...</label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value as 'student' | 'landlord')}
                            className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-black appearance-none"
                        >
                            <option value="student">Student</option>
                            <option value="landlord">Landlord</option>
                        </select>
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
                            minLength={6}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-primary-foreground font-bold h-14 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Create Account <ArrowRight className="h-5 w-5" /></>}
                    </button>

                    <div className="text-center text-sm text-muted-foreground">
                        Already have a Lodger account? <Link href="/writer/login" className="text-primary font-bold hover:underline">Sign In</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
