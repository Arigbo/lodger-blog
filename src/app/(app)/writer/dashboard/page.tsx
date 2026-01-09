'use client';

import { useAuth } from '@/components/providers/auth-provider';
import { db } from '@/lib/firebase';
import { deleteDoc, doc } from 'firebase/firestore';
import { useEffect, useState, useMemo } from 'react';
import { BlogPost } from '@/types';
import Link from 'next/link';
import { Plus, Edit3, Trash2, Eye, Loader2, BookOpen, CheckCircle, BarChart3, ThumbsUp, MessageSquare, AlertTriangle, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { blogService } from '@/lib/blog-service';
import { UserBadge } from '@/components/auth/user-badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function WriterDashboard() {
    const { user, loading: authLoading } = useAuth();
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loadingPosts, setLoadingPosts] = useState(true);
    const [activeTab, setActiveTab] = useState<'stories' | 'analytics'>('stories');
    const router = useRouter();

    useEffect(() => {
        if (user) {
            fetchPosts();
        }
    }, [user]);

    const fetchPosts = async () => {
        if (!user) return;
        setLoadingPosts(true);
        try {
            const fetchedPosts = await blogService.getWriterPosts(user.uid);
            setPosts(fetchedPosts);
        } catch (error) {
            console.error("Error fetching posts:", error);
        } finally {
            setLoadingPosts(false);
        }
    };

    const handleDelete = async (postId: string) => {
        if (!confirm("Are you sure you want to delete this story?")) return;
        try {
            await deleteDoc(doc(db, 'posts', postId));
            setPosts(posts.filter(p => p.id !== postId));
        } catch (error) {
            console.error("Error deleting post:", error);
            alert("Failed to delete the story.");
        }
    };

    const stats = useMemo(() => {
        const publishedCount = posts.filter(p => p.published).length;
        const totalViews = posts.reduce((acc, p) => acc + (p.views || 0), 0);
        const totalLikes = posts.reduce((acc, p) => acc + (p.likes?.length || 0), 0);
        const totalDislikes = posts.reduce((acc, p) => acc + (p.dislikes?.length || 0), 0);
        const totalComments = posts.reduce((acc, p) => acc + (p.commentCount || 0), 0);
        const totalReports = posts.reduce((acc, p) => acc + (p.reports?.length || 0), 0);

        return {
            total: posts.length,
            published: publishedCount,
            views: totalViews,
            likes: totalLikes,
            dislikes: totalDislikes,
            comments: totalComments,
            reports: totalReports
        };
    }, [posts]);

    if (authLoading || loadingPosts) {
        return (
            <div className="h-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (user && !user.isWriter) {
        // ... (Keep onboarding logic but simplified layout if needed, or redirect)
        // For now, let's keep the existing onboarding UI but wrapped in the main content area
        return (
            <div className="p-8 text-center max-w-xl mx-auto mt-20">
                <div className="w-20 h-20 bg-primary/5 rounded-[2rem] flex items-center justify-center mx-auto mb-8 ring-1 ring-primary/10">
                    <Plus className="h-8 w-8 text-primary" />
                </div>
                <h1 className="font-headline font-black text-3xl uppercase tracking-tighter mb-4">Start Sharing Your Narrative</h1>
                <p className="text-muted-foreground font-medium text-lg leading-relaxed mb-8">
                    The Commons is a curated space for student perspectives. Join our circle of writers.
                </p>
                <button
                    onClick={async () => {
                        try {
                            const { doc, updateDoc } = await import('firebase/firestore');
                            const { db } = await import('@/lib/firebase');
                            await updateDoc(doc(db, 'users', user.uid), {
                                isWriter: true,
                                isWriterCandidate: false
                            });
                            window.location.reload();
                        } catch (e) {
                            alert("Failed to join. Please try again.");
                        }
                    }}
                    className="bg-black text-white font-bold px-8 py-3 rounded-full hover:bg-primary transition-all flex items-center gap-3 mx-auto shadow-lg"
                >
                    Join the Writing Circle <ArrowRight className="h-5 w-5" />
                </button>
            </div>
        );
    }

    return (
        <div className="w-full pb-20">
            {/* Header */}
            <div className="sticky top-0 bg-white/80 backdrop-blur-md z-10 border-b border-border/40 px-6 py-4 flex items-center justify-between">
                <h1 className="font-headline font-black text-xl uppercase tracking-tighter">Writer Studio</h1>
                <Link href="/writer/create">
                    <button className="bg-black text-white px-4 py-1.5 rounded-full font-bold text-sm hover:bg-primary transition-colors flex items-center gap-2">
                        <Plus className="h-4 w-4" /> New
                    </button>
                </Link>
            </div>

            <div className="px-6 py-6">
                <div className="mb-8">
                    <div className="inline-flex rounded-lg bg-muted p-1">
                        <button
                            onClick={() => setActiveTab('stories')}
                            className={cn(
                                "px-4 py-1.5 rounded-md text-sm font-bold transition-all",
                                activeTab === 'stories' ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            Stories
                        </button>
                        <button
                            onClick={() => setActiveTab('analytics')}
                            className={cn(
                                "px-4 py-1.5 rounded-md text-sm font-bold transition-all",
                                activeTab === 'analytics' ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            Analytics
                        </button>
                    </div>
                </div>

                {activeTab === 'stories' ? (
                    <div className="space-y-4">
                        {posts.length === 0 ? (
                            <div className="text-center py-20 border border-dashed border-border rounded-xl">
                                <h3 className="font-bold text-lg mb-2">No stories yet</h3>
                                <p className="text-muted-foreground mb-4 text-sm">Draft your first piece to share it with the community.</p>
                                <Link href="/writer/create" className="text-primary font-bold hover:underline">Start Writing</Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {posts.map((post) => (
                                    <div key={post.id} className="bg-white p-5 rounded-2xl border border-border/40 shadow-sm hover:shadow-md transition-all flex flex-col gap-4">
                                        <div className="flex gap-4">
                                            {/* Thumbnail */}
                                            <div className="h-20 w-20 bg-muted rounded-xl bg-cover bg-center shrink-0" style={{ backgroundImage: `url(${post.coverImage || '/placeholder-post.jpg'})` }} />

                                            {/* Content */}
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-start justify-between gap-4">
                                                    <h3 className="font-bold text-lg leading-tight truncate pr-4">{post.title || 'Untitled Draft'}</h3>
                                                    <span className={cn(
                                                        "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shrink-0",
                                                        post.published ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                                                    )}>
                                                        {post.published ? "Published" : "Draft"}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground font-medium">
                                                    <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {post.views || 0}</span>
                                                    <span className="flex items-center gap-1"><ThumbsUp className="h-3.5 w-3.5" /> {post.likes?.length || 0}</span>
                                                    <span className="flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5" /> {post.commentCount || 0}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 pt-4 border-t border-border/30">
                                            <Link href={`/writer/editor/${post.id}`} className="flex-1 text-center py-2 rounded-lg bg-black/5 hover:bg-black/10 text-xs font-bold transition-colors">
                                                Edit
                                            </Link>
                                            <button onClick={() => handleDelete(post.id)} className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                                <div className="text-3xl font-black text-blue-600">{stats.views}</div>
                                <div className="text-xs font-bold uppercase tracking-wider text-blue-400">Total Reads</div>
                            </div>
                            <div className="bg-pink-50/50 p-6 rounded-2xl border border-pink-100">
                                <div className="text-3xl font-black text-pink-600">{stats.likes}</div>
                                <div className="text-xs font-bold uppercase tracking-wider text-pink-400">Total Likes</div>
                            </div>
                        </div>

                        {/* Detail List */}
                        <div className="space-y-2">
                            <h3 className="font-bold text-lg px-2">Engagement Activity</h3>
                            {posts.filter(p => p.published).map(post => (
                                <div key={post.id} className="bg-white p-6 rounded-2xl border border-border/40 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-bold text-base line-clamp-1">{post.title}</h4>
                                        <div className="flex gap-3 text-xs font-medium text-muted-foreground">
                                            <span>{post.views} views</span>
                                            <span>{post.likes?.length || 0} likes</span>
                                        </div>
                                    </div>

                                    {/* Who Liked User Badge List */}
                                    {post.likes && post.likes.length > 0 && (
                                        <div className="pt-4 border-t border-border/50">
                                            <div className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider">Liked By</div>
                                            <div className="flex flex-wrap gap-2">
                                                {post.likes.map((uid) => (
                                                    <UserBadge key={uid} userId={uid} />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
