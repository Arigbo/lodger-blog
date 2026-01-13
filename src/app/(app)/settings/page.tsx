'use client';

import { Settings as SettingsIcon, Shield, Bell, Eye, LogOut } from 'lucide-react';

export default function SettingsPage() {
    const sections = [
        { icon: Shield, label: 'Security and account access', desc: 'Manage your account and login info.' },
        { icon: Bell, label: 'Notifications', desc: 'Select the kinds of notifications you get.' },
        { icon: Eye, label: 'Accessibility, display, and languages', desc: 'Manage how content is displayed to you.' },
    ];

    return (
        <div className="w-full max-w-[600px] border-r border-border/40 min-h-screen">
            <div className="sticky top-0 bg-white/80 backdrop-blur-md z-10 border-b border-border/40 px-4 py-4">
                <h1 className="text-xl font-bold">Settings</h1>
            </div>

            <div className="divide-y divide-border/40">
                {sections.map((section) => (
                    <div key={section.label} className="flex items-center gap-4 p-4 hover:bg-black/5 transition-all cursor-pointer group">
                        <div className="p-2 rounded-full bg-muted group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                            <section.icon className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                            <div className="font-bold">{section.label}</div>
                            <div className="text-sm text-muted-foreground">{section.desc}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
