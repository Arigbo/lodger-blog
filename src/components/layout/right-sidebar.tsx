'use client';

import { Search, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { blogService } from '@/lib/blog-service';
import { Author } from '@/types';
import { useAuth } from '@/components/providers/auth-provider';

export function RightSidebar() {
    const { user } = useAuth();
    const router = useRouter();
    const [recommendedUsers, setRecommendedUsers] = useState<Author[]>([]);
    const [trendingPosts, setTrendingPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    useEffect(() => {
        const fetchSidebarData = async () => {
            try {
                const [users, posts] = await Promise.all([
                    blogService.getRecommendedUsers(user?.uid),
                    blogService.getPublishedPosts(4)
                ]);
                setRecommendedUsers(users);
                setTrendingPosts(posts);
            } catch (error) {
                console.error("Error fetching sidebar data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSidebarData();
    }, [user?.uid]);

    return (
        <div className="pl-8 py-4 w-[350px] hidden lg:flex flex-col h-full">
            {/* Search */}
            <div className="sticky top-0 bg-white z-10 pb-4">
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search The Commons"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleSearch}
                        className="block w-full pl-12 pr-4 py-3 bg-muted/30 border-transparent text-black placeholder-muted-foreground focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary rounded-full sm:text-sm transition-all shadow-sm"
                    />
                </div>
            </div>

            {/* What's Happening */}
            <div className="bg-muted/30 rounded-2xl overflow-hidden mt-4">
                <h2 className="px-5 py-4 font-black text-xl">What's Happening</h2>
                <div className="divide-y divide-border/10">
                    {loading ? (
                        <div className="p-5 text-center text-muted-foreground text-sm">Loading...</div>
                    ) : trendingPosts.length > 0 ? (
                        trendingPosts.map((post) => (
                            <Link key={post.id} href={`/p/${post.slug}`} className="block px-5 py-3 hover:bg-black/5 transition-colors cursor-pointer">
                                <div className="flex justify-between items-start">
                                    <span className="text-xs text-muted-foreground">Trending in {post.category || 'General'}</span>
                                    <MoreHorizontal className="h-4 w-4 text-muted-foreground hover:text-primary" />
                                </div>
                                <div className="font-bold mt-0.5 line-clamp-2">{post.title}</div>
                                <div className="text-xs text-muted-foreground mt-0.5">{post.readTime || 1} min read</div>
                            </Link>
                        ))
                    ) : (
                        <div className="px-5 py-3 text-xs text-muted-foreground">No recent activity</div>
                    )}
                    <Link href="/explore" className="block px-5 py-4 text-primary text-sm font-medium hover:bg-black/5 transition-colors">
                        Show more
                    </Link>
                </div>
            </div>

            {/* Who to Follow */}
            <div className="bg-muted/30 rounded-2xl overflow-hidden mt-6">
                <h2 className="px-5 py-4 font-black text-xl">Who to Follow</h2>
                <div className="space-y-0">
                    {loading ? (
                        <div className="p-5 text-center text-muted-foreground text-sm">Loading...</div>
                    ) : recommendedUsers.length > 0 ? (
                        recommendedUsers.map((author) => (
                            <Link key={author.uid} href={`/u/${author.uid}`} className="px-5 py-3 hover:bg-black/5 transition-colors cursor-pointer flex items-center gap-3 group">
                                <div className="h-10 w-10 bg-muted rounded-full overflow-hidden shrink-0">
                                    <img src={author.avatar || '/placeholder-avatar.jpg'} alt={author.name} className="h-full w-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-bold text-sm truncate group-hover:underline">{author.name}</div>
                                    <div className="text-xs text-muted-foreground truncate">@{author.role || 'writer'}</div>
                                </div>
                                <button className="bg-black text-white text-xs font-bold px-4 py-1.5 rounded-full hover:bg-black/80 transition-colors">
                                    Follow
                                </button>
                            </Link>
                        ))
                    ) : (
                        <div className="p-5 text-center text-muted-foreground text-sm">No suggestions yet</div>
                    )}
                    <Link href="/connect_people" className="block px-5 py-4 text-primary text-sm font-medium hover:bg-black/5 transition-colors">
                        Show more
                    </Link>
                </div>
            </div>

            <div className="mt-6 px-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
                <Link href="#" className="hover:underline">Terms of Service</Link>
                <Link href="#" className="hover:underline">Privacy Policy</Link>
                <Link href="#" className="hover:underline">Cookie Policy</Link>
                <span>© 2026 The Commons</span>
            </div>
        </div>
    );
}
