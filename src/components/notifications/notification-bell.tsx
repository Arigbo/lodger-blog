'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { collection, query, where, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useWriterAuth } from '@/hooks/useWriterAuth';
// import { formatDistanceToNow } from 'date-fns';
function formatDistanceToNow(date: Date, options?: { addSuffix?: boolean }) {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years" + (options?.addSuffix ? " ago" : "");
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months" + (options?.addSuffix ? " ago" : "");
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days" + (options?.addSuffix ? " ago" : "");
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours" + (options?.addSuffix ? " ago" : "");
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes" + (options?.addSuffix ? " ago" : "");
    return Math.floor(seconds) + " seconds" + (options?.addSuffix ? " ago" : "");
}

export function NotificationBell() {
    const { user } = useWriterAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, 'notifications'),
            where('recipientId', '==', user.uid),
            orderBy('createdAt', 'desc'),
            limit(20)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const notifs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Notification[];

            setNotifications(notifs);
            setUnreadCount(notifs.filter(n => !n.read).length);
        });

        return () => unsubscribe();
    }, [user]);

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

    const handleNotificationClick = async (notification: Notification) => {
        if (!notification.read) {
            await markAsRead(notification.id);
        }
        // Could redirect here if needed
    };

    if (!user) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full hover:bg-muted/50 transition-colors"
            >
                <Bell className="w-5 h-5 text-muted-foreground" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-destructive rounded-full border border-white" />
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-border rounded-xl shadow-xl z-50 overflow-hidden text-sm animate-in fade-in zoom-in-95 duration-100">
                    <div className="p-3 border-b border-border bg-muted/30">
                        <h3 className="font-bold text-foreground">Notifications</h3>
                    </div>

                    <div className="max-h-[70vh] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-4 text-center text-muted-foreground py-8">
                                No notifications yet.
                            </div>
                        ) : (
                            notifications.map(notif => (
                                <div
                                    key={notif.id}
                                    onClick={() => handleNotificationClick(notif)}
                                    className={`p-3 border-b border-border/50 hover:bg-muted/50 transition-colors cursor-pointer flex gap-3 ${!notif.read ? 'bg-primary/5' : ''}`}
                                >
                                    {notif.senderAvatar ? (
                                        <img src={notif.senderAvatar} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                                            <span className="text-xs font-bold">{notif.senderName?.[0] || '?'}</span>
                                        </div>
                                    )}
                                    <div className="flex-1 space-y-1">
                                        <p className="leading-tight text-foreground">
                                            {notif.message}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground">
                                            {notif.createdAt ? formatDistanceToNow(notif.createdAt.toDate(), { addSuffix: true }) : 'Just now'}
                                        </p>
                                    </div>
                                    {!notif.read && (
                                        <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
