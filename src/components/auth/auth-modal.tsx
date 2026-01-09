'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Sparkles, Check, ArrowRight, ChevronLeft, Loader2, Compass, PenTool } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialStep?: 'login' | 'signup' | 'preferences' | 'writer';
}

const CATEGORIES = [
    { id: 'Design', label: 'Design', icon: '🎨' },
    { id: 'Culture', label: 'Culture', icon: '🌍' },
    { id: 'Guides', label: 'Guides', icon: '📚' },
    { id: 'Announcement', label: 'News', icon: '📢' },
    { id: 'Education', label: 'Education', icon: '🎓' },
];

export function AuthModal({ isOpen, onClose, initialStep = 'login' }: AuthModalProps) {
    const router = useRouter();
    const [step, setStep] = useState(1); // 1: Identity, 2: Interests, 3: Success/Writer
    const [mode, setMode] = useState<'login' | 'signup'>(initialStep === 'signup' ? 'signup' : 'login');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Form State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setError('');
        }
    }, [isOpen]);

    const handleIdentity = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (mode === 'login') {
                const userCred = await signInWithEmailAndPassword(auth, email, password);
                // Check if user has preferences already
                const userDoc = await getDoc(doc(db, 'users', userCred.user.uid));
                if (userDoc.exists() && userDoc.data().preferences) {
                    onClose();
                } else {
                    setStep(2);
                }
            } else {
                const userCred = await createUserWithEmailAndPassword(auth, email, password);
                await updateProfile(userCred.user, { displayName: name });
                // For signup, always go to interests
                setStep(2);
            }
        } catch (err: any) {
            setError(err.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveInterests = async () => {
        setLoading(true);
        try {
            const user = auth.currentUser;
            if (user) {
                await setDoc(doc(db, 'users', user.uid), {
                    name: user.displayName || name,
                    email: user.email,
                    preferences: selectedInterests,
                    updatedAt: serverTimestamp(),
                    ...(mode === 'signup' ? { createdAt: serverTimestamp(), isWriter: false } : {})
                }, { merge: true });
                setStep(3);
            }
        } catch (err: any) {
            setError('Failed to save preferences');
        } finally {
            setLoading(false);
        }
    };

    const toggleInterest = (id: string) => {
        setSelectedInterests(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-lg bg-white rounded-[3rem] shadow-2xl border border-black/5 overflow-hidden"
            >
                {/* Header */}
                <div className="p-8 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                            <Sparkles className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-headline font-black text-lg tracking-tighter">THE COMMONS.</span>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="px-8 pb-12">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="identity"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-6"
                            >
                                <div className="space-y-1">
                                    <h2 className="text-3xl font-black tracking-tight">{mode === 'login' ? 'Welcome Back' : 'Join the Community'}</h2>
                                    <p className="text-muted-foreground font-medium">Use your account to explore and write.</p>
                                </div>

                                {error && (
                                    <div className="p-4 rounded-2xl bg-destructive/5 text-destructive text-xs font-bold border border-destructive/10">
                                        {error}
                                    </div>
                                )}

                                <form onSubmit={handleIdentity} className="space-y-4">
                                    {mode === 'signup' && (
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Full Name</label>
                                            <div className="relative">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                                                <input
                                                    type="text"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    className="w-full bg-[#f8f8f8] border border-black/5 rounded-2xl pl-12 pr-5 py-4 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                                    placeholder="Jane Doe"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Email Address</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full bg-[#f8f8f8] border border-black/5 rounded-2xl pl-12 pr-5 py-4 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                                placeholder="name@email.com"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                                            <input
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="w-full bg-[#f8f8f8] border border-black/5 rounded-2xl pl-12 pr-5 py-4 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                                placeholder="••••••••"
                                                required
                                                minLength={6}
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-black text-white font-black h-16 rounded-2xl flex items-center justify-center gap-3 hover:bg-primary transition-all group shadow-xl active:scale-95"
                                    >
                                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                                            <>
                                                {mode === 'login' ? 'Sign In' : 'Create Account'}
                                                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </button>
                                </form>

                                <div className="text-center">
                                    <button
                                        onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                                        className="text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors hover:underline underline-offset-4"
                                    >
                                        {mode === 'login' ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="interests"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div className="space-y-1">
                                    <h2 className="text-3xl font-black tracking-tight">Personalize Feed</h2>
                                    <p className="text-muted-foreground font-medium">What kind of stories do you want to see?</p>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    {CATEGORIES.map((cat) => (
                                        <button
                                            key={cat.id}
                                            onClick={() => toggleInterest(cat.id)}
                                            className={cn(
                                                "p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-3",
                                                selectedInterests.includes(cat.id)
                                                    ? "border-black bg-black text-white shadow-xl scale-105"
                                                    : "border-black/5 bg-[#f8f8f8] text-muted-foreground hover:border-black/20"
                                            )}
                                        >
                                            <span className="text-2xl">{cat.icon}</span>
                                            <span className="text-[10px] font-black uppercase tracking-widest">{cat.label}</span>
                                            {selectedInterests.includes(cat.id) && <Check className="absolute top-4 right-4 h-4 w-4" />}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={handleSaveInterests}
                                    disabled={loading || selectedInterests.length === 0}
                                    className="w-full bg-black text-white font-black h-16 rounded-2xl flex items-center justify-center gap-3 hover:bg-primary transition-all shadow-xl active:scale-95 disabled:opacity-50"
                                >
                                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Continue Preference'}
                                </button>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center space-y-8 py-4"
                            >
                                <div className="w-20 h-20 bg-green-50 rounded-[2rem] flex items-center justify-center mx-auto ring-1 ring-green-500/10">
                                    <Check className="h-10 w-10 text-green-500" />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-black tracking-tight">You're all set!</h2>
                                    <p className="text-muted-foreground font-medium italic">Welcome to the inner circle of student narratives.</p>
                                </div>

                                <div className="grid gap-3 pt-4">
                                    <button
                                        onClick={onClose}
                                        className="w-full bg-black text-white font-black h-16 rounded-2xl flex items-center justify-center gap-3 hover:bg-[#333] transition-all"
                                    >
                                        <Compass className="h-5 w-5" /> Explore Stories
                                    </button>
                                    <button
                                        onClick={async () => {
                                            const user = auth.currentUser;
                                            if (user) {
                                                await setDoc(doc(db, 'users', user.uid), { isWriter: true }, { merge: true });
                                                onClose();
                                                setTimeout(() => router.push('/writer/dashboard'), 100);
                                            }
                                        }}
                                        className="w-full bg-[#f8f8f8] text-black border border-black/5 font-black h-16 rounded-2xl flex items-center justify-center gap-3 hover:bg-black hover:text-white transition-all group"
                                    >
                                        <PenTool className="h-5 w-5" /> Join as Writer
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}
