'use client';

import { Bell, Heart, MessageSquare, UserPlus } from 'lucide-react';

export default function NotificationsPage() {
    return (
        <div className="w-full max-w-[600px] border-r border-border/40 min-h-screen">
            <div className="sticky top-0 bg-white/80 backdrop-blur-md z-10 border-b border-border/40 px-4 py-4">
                <h1 className="text-xl font-bold">Notifications</h1>
            </div>

            <div className="divide-y divide-border/40">
                <div className="p-8 text-center bg-muted/10">
                    <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto mb-4">
                        <Bell className="h-8 w-8" />
                    </div>
                    <h2 className="text-xl font-bold mb-2">Nothing to see here — yet</h2>
                    <p className="text-muted-foreground">From likes to retweets and a whole lot more, this is where all the action happens.</p>
                </div>
            </div>
        </div>
    );
}
