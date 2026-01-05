import Link from 'next/link';
import { Home } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-6">
            <div className="text-center space-y-8 max-w-2xl">
                <div className="space-y-4">
                    <h1 className="font-headline text-9xl md:text-[12rem] font-black tracking-tighter text-primary">
                        404
                    </h1>
                    <h2 className="font-serif text-4xl md:text-5xl font-bold">
                        Page Not Found
                    </h2>
                    <p className="text-xl text-muted-foreground font-medium max-w-md mx-auto">
                        The page you're looking for doesn't exist or has been moved.
                    </p>
                </div>

                <Link
                    href="/"
                    className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-bold px-8 py-4 rounded-2xl hover:scale-105 transition-transform"
                >
                    <Home className="h-5 w-5" />
                    Back to Home
                </Link>
            </div>
        </div>
    );
}
