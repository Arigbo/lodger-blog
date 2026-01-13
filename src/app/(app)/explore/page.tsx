'use client';

import { Search, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { blogService } from '@/lib/blog-service';
import { BlogPost } from '@/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ExplorePage() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const allPosts = await blogService.getPublishedPosts();
                setPosts(allPosts);
            } catch (error) {
                console.error("Error fetching explore data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    // Calculate Trending Categories
    const categoriesMap: Record<string, number> = {};
    posts.forEach(post => {
        if (post.category) {
            categoriesMap[post.category] = (categoriesMap[post.category] || 0) + 1;
        }
    });

    const trendingCategories = Object.entries(categoriesMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([name, count]) => ({ name, count }));

    return (
        <div className="w-full max-w-[600px] border-r border-border/40 min-h-screen">
            <div className="sticky top-0 bg-white/80 backdrop-blur-md z-10 border-b border-border/40 px-4 py-4">
                <form onSubmit={handleSearch} className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search The Commons"
                        className="w-full bg-muted/50 border-none rounded-full py-3 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                    />
                </form>
            </div>

            <div className="p-4">
                <h2 className="text-xl font-bold mb-6 italic font-serif">Trending for you</h2>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : trendingCategories.length > 0 ? (
                    <div className="space-y-2">
                        {trendingCategories.map((item) => (
                            <Link
                                href={`/search?q=${encodeURIComponent(item.name)}`}
                                key={item.name}
                                className="flex justify-between items-start hover:bg-black/5 p-4 rounded-2xl transition-all cursor-pointer group"
                            >
                                <div>
                                    <div className="text-xs text-muted-foreground group-hover:text-primary transition-colors">Trending in The Commons</div>
                                    <div className="font-bold text-lg">#{item.name}</div>
                                    <div className="text-sm text-muted-foreground">{item.count} {item.count === 1 ? 'post' : 'posts'}</div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">No trending topics yet. Be the first to start a conversation!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
