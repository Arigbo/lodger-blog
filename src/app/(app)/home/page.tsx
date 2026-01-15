'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { blogService } from '@/lib/blog-service';
import { BlogPost } from '@/types';
import { PostCard } from '@/components/blog/post-card';
import { Loader2, PenSquare } from 'lucide-react';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function HomePage() {
    const { user, openAuthModal } = useAuth();
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                // In a real app, this would be a feed query. 
                // For now, fetching published posts sorted by date.
                const allPosts = await blogService.getPublishedPosts();
                setPosts(allPosts);
            } catch (error) {
                console.error("Error fetching feed:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    return (
        <div className="w-full max-w-[600px] border-r border-border/40 min-h-screen">
            {/* Sticky Header */}
            <div className="sticky top-0 bg-white/80 backdrop-blur-md z-10 border-b border-border/40 px-4 pt-4 pb-0">
                <h1 className="sr-only">Home</h1>
                <Tabs defaultValue="foryou" className="w-full">
                    <TabsList className="w-full h-auto p-0 bg-transparent border-b-0 space-x-0 flex">
                        <TabsTrigger
                            value="foryou"
                            className="flex-1 rounded-none border-b-[3px] border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none px-0 py-3 font-bold text-muted-foreground data-[state=active]:text-black hover:bg-black/5 transition-all text-base bg-transparent"
                        >
                            For you
                        </TabsTrigger>
                        <TabsTrigger
                            value="following"
                            className="flex-1 rounded-none border-b-[3px] border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none px-0 py-3 font-bold text-muted-foreground data-[state=active]:text-black hover:bg-black/5 transition-all text-base bg-transparent"
                        >
                            Following
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {/* Compose Teaser (Mobile/Desktop) or Registration Prompt */}
            {user ? (
                <div className="px-4 py-4 border-b border-border/40 hidden sm:block">
                    <div className="flex gap-4">
                        <div className="h-10 w-10 rounded-full bg-muted overflow-hidden shrink-0">
                            {user?.photoURL ? (
                                <img src={user.photoURL} alt={user.displayName || 'User'} className="h-full w-full object-cover" />
                            ) : (
                                <div className="h-full w-full bg-black/5" />
                            )}
                        </div>
                        <Link href="/writer/create" className="flex-1">
                            <div className="w-full bg-transparent text-muted-foreground text-xl py-2 cursor-text">
                                What is happening?!
                            </div>
                        </Link>
                    </div>
                    <div className="flex justify-end mt-4 border-t border-border/40 pt-3">
                        <Link href="/writer/create">
                            <button className="bg-primary hover:bg-primary/90 text-white font-bold rounded-full px-5 py-1.5 text-sm transition-all shadow-sm">
                                Post
                            </button>
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="px-4 py-6 border-b border-border/40 bg-gradient-to-r from-primary/5 to-primary/10">
                    <div className="flex flex-col gap-3 text-center">
                        <h3 className="font-bold text-lg">Join The Commons</h3>
                        <p className="text-sm text-muted-foreground">
                            Register to share your stories, connect with the community, and become a writer.
                        </p>
                        <button
                            onClick={() => openAuthModal('signup')}
                            className="bg-primary hover:bg-primary/90 text-white font-bold rounded-full px-6 py-2 text-sm transition-all shadow-lg mx-auto"
                        >
                            Get Started
                        </button>
                    </div>
                </div>
            )}

            {/* Feed */}
            <div className="pb-20">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : posts.length === 0 ? (
                    <div className="text-center py-12 px-6">
                        <div className="text-xl font-bold mb-2">Welcome to The Commons!</div>
                        <p className="text-muted-foreground mb-6">This is the best place to see what’s happening in your student community. Let's find some people to follow.</p>
                        <Link href="/explore">
                            <button className="bg-primary text-white font-bold px-8 py-3 rounded-full hover:bg-primary/90 transition-all shadow-lg">
                                Let's go!
                            </button>
                        </Link>
                    </div>
                ) : (
                    <div>
                        {posts.map((post) => (
                            <PostCard key={post.id} post={post} variant="feed" />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
