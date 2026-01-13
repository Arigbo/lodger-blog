'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { BlogPost } from '@/types';
import { blogService } from '@/lib/blog-service';
import { PostCard } from '@/components/blog/post-card';
import { Loader2, SearchX } from 'lucide-react';

function SearchResults() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q');
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResults = async () => {
            if (!query) {
                setPosts([]);
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const results = await blogService.searchPosts(query);
                setPosts(results);
            } catch (error) {
                console.error("Search error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [query]);

    if (!query) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <SearchX className="h-8 w-8 text-muted-foreground" />
                </div>
                <h2 className="text-xl font-bold mb-2">Search The Commons</h2>
                <p className="text-muted-foreground">Enter a keyword to discover stories, people, and trends.</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (posts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <SearchX className="h-8 w-8 text-muted-foreground" />
                </div>
                <h2 className="text-xl font-bold mb-2">No results for "{query}"</h2>
                <p className="text-muted-foreground">Try searching for something else, or check your spelling.</p>
            </div>
        );
    }

    return (
        <div className="pb-20">
            <div className="px-4 py-6 border-b border-border/40">
                <h1 className="font-bold text-xl">Search results for "{query}"</h1>
            </div>
            <div>
                {posts.map((post) => (
                    <PostCard key={post.id} post={post} variant="feed" />
                ))}
            </div>
        </div>
    );
}

export default function SearchPage() {
    return (
        <div className="min-h-screen border-r border-border/40">
            <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
                <SearchResults />
            </Suspense>
        </div>
    );
}
