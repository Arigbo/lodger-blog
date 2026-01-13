import { cn } from "@/lib/utils";

import { Sparkles } from 'lucide-react';

export function Logo({ className }: { className?: string }) {
    return (
        <div className={cn("flex items-center gap-2", className)}>
            <div className="h-10 w-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                <Sparkles className="h-6 w-6" />
            </div>
        </div>
    );
}
