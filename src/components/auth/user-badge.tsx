'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { User } from 'lucide-react';
import Link from 'next/link';

interface UserBadgeProps {
    userId: string;
    showAvatar?: boolean;
}

export function UserBadge({ userId, showAvatar = true }: UserBadgeProps) {
    const [userData, setUserData] = useState<{ name: string; avatar?: string } | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            if (!userId) return;
            try {
                // Check if we have it in localStorage cache first (optional optimization for later)
                const userDoc = await getDoc(doc(db, 'users', userId));
                if (userDoc.exists()) {
                    setUserData(userDoc.data() as any);
                } else {
                    setUserData({ name: 'Unknown User' });
                }
            } catch (error) {
                console.error("Error fetching user badge:", error);
                setUserData({ name: 'Unknown User' });
            }
        };

        fetchUser();
    }, [userId]);

    if (!userData) {
        return <span className="animate-pulse bg-muted rounded w-16 h-4 inline-block" />;
    }

    return (
        <Link href={`/u/${userId}`} className="inline-flex items-center gap-2 hover:bg-muted/50 px-2 py-1 rounded-full text-foreground transition-colors group">
            {showAvatar && (
                <div className="w-5 h-5 rounded-full bg-muted overflow-hidden flex items-center justify-center shrink-0">
                    {userData.avatar ? (
                        <img src={userData.avatar} alt={userData.name} className="w-full h-full object-cover" />
                    ) : (
                        <User className="h-3 w-3 text-muted-foreground" />
                    )}
                </div>
            )}
            <span className="text-xs font-bold group-hover:underline truncate max-w-[100px]">{userData.name}</span>
        </Link>
    );
}
