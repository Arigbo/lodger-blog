import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, orderBy, onSnapshot, updateDoc, doc } from 'firebase/firestore';

export interface Notification {
    id: string;
    recipientId: string;
    senderId?: string; // Optional (e.g., system messages)
    senderName?: string;
    senderAvatar?: string;
    type: 'like' | 'comment' | 'follow' | 'system';
    postId?: string;
    postTitle?: string;
    message: string;
    read: boolean;
    createdAt: any;
}

export const createNotification = async (
    recipientId: string,
    type: 'like' | 'comment' | 'follow' | 'system',
    data: {
        senderId?: string;
        senderName?: string;
        senderAvatar?: string;
        postId?: string;
        postTitle?: string;
        message?: string;
    }
) => {
    try {
        if (!recipientId) return;

        // Don't notify if user interacts with their own content
        if (data.senderId === recipientId) return;

        let message = data.message || '';
        if (!message) {
            switch (type) {
                case 'like':
                    message = `${data.senderName || 'Someone'} liked your post "${data.postTitle}"`;
                    break;
                case 'comment':
                    message = `${data.senderName || 'Someone'} commented on "${data.postTitle}"`;
                    break;
                case 'follow':
                    message = `${data.senderName || 'Someone'} started following you`;
                    break;
            }
        }

        await addDoc(collection(db, 'notifications'), {
            recipientId,
            senderId: data.senderId,
            senderName: data.senderName,
            senderAvatar: data.senderAvatar,
            type,
            postId: data.postId,
            postTitle: data.postTitle,
            message,
            read: false,
            createdAt: serverTimestamp(),
        });
    } catch (error) {
        console.error("Error creating notification:", error);
    }
};

export const markAsRead = async (notificationId: string) => {
    try {
        const ref = doc(db, 'notifications', notificationId);
        await updateDoc(ref, { read: true });
    } catch (error) {
        console.error("Error marking notification as read:", error);
    }
};

export const markAllAsRead = async (recipientId: string) => {
    // batch update or similar could be implemented here
};
