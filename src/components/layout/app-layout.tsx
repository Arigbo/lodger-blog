'use client';

import { LeftSidebar } from './left-sidebar';
import { RightSidebar } from './right-sidebar';

export function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-[1300px] mx-auto flex min-h-screen">
                {/* Left Sidebar (Nav) */}
                <header className="shrink-0 border-r border-border/40 sticky top-0 h-screen z-30">
                    <LeftSidebar />
                </header>

                {/* Main Content (Feed/Dashboard) */}
                <main className="flex-1 min-w-0 border-r border-border/40">
                    {children}
                </main>

                {/* Right Sidebar (Widgets) */}
                <aside className="shrink-0 sticky top-0 h-screen z-20">
                    <RightSidebar />
                </aside>
            </div>
        </div>
    );
}
