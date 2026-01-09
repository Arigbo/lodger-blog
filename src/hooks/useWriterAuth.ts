import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export interface WriterUser {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    role?: string;
    bio?: string;
    profileImageUrl?: string;
}

export function useWriterAuth() {
    const [user, setUser] = useState<WriterUser | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (authUser) => {
            if (!authUser) {
                setUser(null);
                setLoading(false);
                router.push('/writer/login');
                return;
            }

            // If we have an auth user, listen to their Firestore document
            const unsubscribeDoc = onSnapshot(doc(db, 'users', authUser.uid), (docSnap) => {
                if (docSnap.exists()) {
                    const userData = docSnap.data();
                    setUser({
                        uid: authUser.uid,
                        email: authUser.email,
                        displayName: userData.name || authUser.displayName,
                        photoURL: userData.profileImageUrl || authUser.photoURL,
                        role: userData.role,
                        bio: userData.bio,
                        profileImageUrl: userData.profileImageUrl
                    });
                } else {
                    // Fallback to auth data if no Firestore doc
                    setUser({
                        uid: authUser.uid,
                        email: authUser.email,
                        displayName: authUser.displayName,
                        photoURL: authUser.photoURL
                    });
                }
                setLoading(false);
            }, (error) => {
                console.error("Error fetching user doc:", error);
                setLoading(false);
            });

            return () => unsubscribeDoc();
        });

        return () => unsubscribeAuth();
    }, [router]);

    return { user, loading };
}
