'use client';

import { useState, useRef, useEffect } from 'react';
import { WriterUser } from '@/hooks/useWriterAuth';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { LogOut, User as UserIcon } from 'lucide-react';
import Link from 'next/link';

interface UserProfileDropdownProps {
    user: WriterUser | null;
}

export function UserProfileDropdown({ user }: UserProfileDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await signOut(auth);
            router.push('/writer/login');
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!user) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 pl-4 border-l border-border/40 hover:opacity-80 transition-opacity"
            >
                <div className="flex flex-col items-end hidden sm:flex">
                    <span className="text-sm font-bold">{user.displayName || 'Writer'}</span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest max-w-[120px] truncate">{user.email}</span>
                </div>
                <img
                    src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || 'Writer'}&background=000&color=fff`}
                    alt="Profile"
                    className="w-10 h-10 rounded-full bg-muted object-cover border border-border"
                />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-border rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    <div className="p-3 border-b border-border sm:hidden">
                        <p className="font-bold text-sm truncate">{user.displayName || 'Writer'}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <div className="p-1">
                        <Link
                            href="/writer/dashboard"
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted rounded-lg transition-colors font-medium"
                            onClick={() => setIsOpen(false)}
                        >
                            <UserIcon className="h-4 w-4" />
                            Writer Dashboard
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/5 rounded-lg transition-colors font-medium"
                        >
                            <LogOut className="h-4 w-4" />
                            Log Out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
