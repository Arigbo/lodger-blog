'use client';

import { useState, FormEvent } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowRight, User as UserIcon, Palette, Image as ImageIcon, Sparkles, Check, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const AVATARS = [
    { id: 'av-1', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200' },
    { id: 'av-2', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200' },
    { id: 'av-3', url: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=200' },
    { id: 'av-4', url: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&q=80&w=200' },
    { id: 'av-5', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200' },
    { id: 'av-6', url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200' },
];

const CHARACTERS = [
    { id: 'ch-1', url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Felix' },
    { id: 'ch-2', url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Aner' },
    { id: 'ch-3', url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Ane' },
    { id: 'ch-4', url: 'https://api.dicebear.com/7.x/big-ears/svg?seed=Bear' },
    { id: 'ch-5', url: 'https://api.dicebear.com/7.x/big-ears/svg?seed=Lion' },
    { id: 'ch-6', url: 'https://api.dicebear.com/7.x/big-ears/svg?seed=Tiger' },
];

export default function WriterSignupPage() {
    const [step, setStep] = useState(1);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'student' | 'landlord'>('student');
    const [avatarType, setAvatarType] = useState<'photo' | 'avatar' | 'character'>('photo');
    const [avatarValue, setAvatarValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSignup = async (e: FormEvent) => {
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

            // 3. Determine Final Avatar URL
            let finalAvatar = null;
            if (avatarType === 'avatar') {
                finalAvatar = AVATARS.find(a => a.id === avatarValue)?.url || null;
            } else if (avatarType === 'character') {
                finalAvatar = CHARACTERS.find(c => c.id === avatarValue)?.url || null;
            }

            // 4. Create User Document in Firestore
            await setDoc(doc(db, 'users', user.uid), {
                id: user.uid,
                name: name,
                email: email,
                role: role,
                createdAt: serverTimestamp(),
                profileImageUrl: finalAvatar, // Used by Lodger App
                avatarType: avatarType, // Used for Blog logic
                avatarValue: avatarValue,
                bio: `Lodger ${role.charAt(0).toUpperCase() + role.slice(1)}`
            });

            router.push('/writer/dashboard');
        } catch (err: any) {
            console.error(err);
            if (err.code === 'auth/email-already-in-use') {
                setError('Email already in use.');
            } else {
                setError('Failed to create account. ' + err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6">
            <div className="w-full max-w-xl space-y-8">
                <div className="text-center space-y-4">
                    <Link href="/" className="font-headline font-black text-4xl tracking-tighter group inline-flex items-center gap-2">
                        <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center group-hover:bg-primary transition-colors">
                            <Sparkles className="h-5 w-5 text-white" />
                        </div>
                        <span>LODGER BLOG<span className="text-primary text-5xl">.</span></span>
                    </Link>
                    <div className="flex items-center justify-center gap-4">
                        <div className={cn("h-1.5 w-12 rounded-full transition-colors", step >= 1 ? "bg-black" : "bg-black/10")} />
                        <div className={cn("h-1.5 w-12 rounded-full transition-colors", step >= 2 ? "bg-black" : "bg-black/10")} />
                    </div>
                </div>

                <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl border border-black/5 relative overflow-hidden">
                    <AnimatePresence mode="wait">
                        {step === 1 ? (
                            <motion.form
                                key="step1"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                onSubmit={(e) => { e.preventDefault(); setStep(2); }}
                                className="space-y-6"
                            >
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-black uppercase tracking-tight">Create your account</h2>
                                    <p className="text-muted-foreground text-sm font-medium">One account for both The Commons and Lodger.</p>
                                </div>

                                {error && (
                                    <div className="p-4 rounded-2xl bg-destructive/10 text-destructive text-sm font-bold text-center border border-destructive/20">
                                        {error}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Full Name</label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full bg-[#f8f8f8] border border-black/5 rounded-2xl px-5 py-4 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
                                            placeholder="Jane Doe"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">I am a...</label>
                                        <select
                                            value={role}
                                            onChange={(e) => setRole(e.target.value as 'student' | 'landlord')}
                                            className="w-full bg-[#f8f8f8] border border-black/5 rounded-2xl px-5 py-4 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white appearance-none transition-all"
                                        >
                                            <option value="student">Student</option>
                                            <option value="landlord">Landlord</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Email Address</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-[#f8f8f8] border border-black/5 rounded-2xl px-5 py-4 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
                                        placeholder="jane@lodger.co"
                                        required
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Secure Password</label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-[#f8f8f8] border border-black/5 rounded-2xl px-5 py-4 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
                                        placeholder="••••••••"
                                        required
                                        minLength={6}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-black text-white font-black h-16 rounded-2xl flex items-center justify-center gap-3 hover:bg-primary transition-all group"
                                >
                                    Next Step <ArrowRight className="h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
                                </button>

                                <div className="text-center text-sm font-bold text-muted-foreground uppercase tracking-widest">
                                    Already have an account? <Link href="/writer/login" className="text-primary hover:underline underline-offset-4">Sign In</Link>
                                </div>
                            </motion.form>
                        ) : (
                            <motion.form
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                onSubmit={handleSignup}
                                className="space-y-8"
                            >
                                <div className="space-y-2">
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-black transition-colors mb-4"
                                    >
                                        <ChevronLeft className="h-3 w-3" /> Back to details
                                    </button>
                                    <h2 className="text-2xl font-black uppercase tracking-tight">Style your profile</h2>
                                    <p className="text-muted-foreground text-sm font-medium">Choose how you'll appear in the community.</p>
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { id: 'photo', label: 'Photo', icon: ImageIcon },
                                        { id: 'avatar', label: 'Avatar', icon: UserIcon },
                                        { id: 'character', label: 'Figure', icon: Palette }
                                    ].map((type) => (
                                        <button
                                            key={type.id}
                                            type="button"
                                            onClick={() => { setAvatarType(type.id as any); setAvatarValue(''); }}
                                            className={cn(
                                                "p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-3",
                                                avatarType === type.id
                                                    ? "border-black bg-black text-white shadow-xl scale-105"
                                                    : "border-black/5 bg-[#f8f8f8] text-muted-foreground hover:border-black/20"
                                            )}
                                        >
                                            <type.icon className="h-6 w-6" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">{type.label}</span>
                                        </button>
                                    ))}
                                </div>

                                {avatarType !== 'photo' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="space-y-4"
                                    >
                                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                                            {(avatarType === 'avatar' ? AVATARS : CHARACTERS).map((item) => (
                                                <button
                                                    key={item.id}
                                                    type="button"
                                                    onClick={() => setAvatarValue(item.id)}
                                                    className={cn(
                                                        "aspect-square rounded-2xl overflow-hidden border-4 transition-all relative group",
                                                        avatarValue === item.id ? "border-primary scale-110 shadow-lg" : "border-transparent opacity-60 hover:opacity-100"
                                                    )}
                                                >
                                                    <img src={item.url} className="w-full h-full object-cover" alt="" />
                                                    {avatarValue === item.id && (
                                                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                                            <Check className="h-6 w-6 text-white" />
                                                        </div>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {avatarType === 'photo' && (
                                    <div className="p-8 rounded-[2rem] bg-[#f8f8f8] border border-dashed border-black/10 text-center flex flex-col items-center gap-4">
                                        <div className="w-16 h-16 bg-white rounded-[1.5rem] flex items-center justify-center shadow-sm">
                                            <ImageIcon className="h-8 w-8 text-black/20" />
                                        </div>
                                        <p className="text-xs font-medium text-muted-foreground max-w-[200px]">
                                            We'll use your Lodger account photo if you've uploaded one.
                                        </p>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading || (avatarType !== 'photo' && !avatarValue)}
                                    className="w-full bg-black text-white font-black h-16 rounded-2xl flex items-center justify-center gap-3 hover:bg-primary transition-all disabled:opacity-50 shadow-2xl"
                                >
                                    {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <>Complete Signup <Sparkles className="h-5 w-5" /></>}
                                </button>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
