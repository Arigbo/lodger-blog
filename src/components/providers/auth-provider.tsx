'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { AuthModal } from '@/components/auth/auth-modal';

interface AuthContextType {
    user: any | null;
    loading: boolean;
    openAuthModal: (step?: 'login' | 'signup') => void;
    closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [modalState, setModalState] = useState<{ isOpen: boolean, step: 'login' | 'signup' }>({
        isOpen: false,
        step: 'login'
    });

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (authUser) => {
            if (!authUser) {
                setUser(null);
                setLoading(false);
                return;
            }

            const unsubscribeDoc = onSnapshot(doc(db, 'users', authUser.uid), (docSnap) => {
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setUser({
                        uid: authUser.uid,
                        email: authUser.email,
                        ...data,
                        isIncomplete: !data.role || !data.name
                    });
                } else {
                    setUser({
                        uid: authUser.uid,
                        email: authUser.email,
                        displayName: authUser.displayName,
                        photoURL: authUser.photoURL,
                        isIncomplete: true
                    });
                }
                setLoading(false);
            });

            return () => unsubscribeDoc();
        });

        return () => unsubscribeAuth();
    }, []);

    const openAuthModal = (step: 'login' | 'signup' = 'login') => {
        setModalState({ isOpen: true, step });
    };

    const closeAuthModal = () => {
        setModalState(prev => ({ ...prev, isOpen: false }));
    };

    return (
        <AuthContext.Provider value={{ user, loading, openAuthModal, closeAuthModal }}>
            {children}
            <AuthModal
                isOpen={modalState.isOpen}
                onClose={closeAuthModal}
                initialStep={modalState.step}
            />
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
