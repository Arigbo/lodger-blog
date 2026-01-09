import { useAuth } from '@/components/providers/auth-provider';

/**
 * @deprecated Use useAuth from @/components/providers/auth-provider instead
 */
export function useWriterAuth() {
    return useAuth();
}

export interface WriterUser {
    uid: string;
    email: string;
    displayName?: string;
    photoURL?: string;
    role?: 'student' | 'landlord';
    bio?: string;
    preferences?: string[];
}
