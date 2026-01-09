'use client';

import { useWriterAuth } from '@/hooks/useWriterAuth';
import { db } from '@/lib/firebase';
import { deleteDoc, doc } from 'firebase/firestore';
import { useEffect, useState, useMemo } from 'react';
import { BlogPost } from '@/types';
import Link from 'next/link';
import { Plus, Edit3, Trash2, Eye, Loader2, BookOpen, CheckCircle, FileText, BarChart3 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { NotificationBell } from '@/components/notifications/notification-bell';
import { UserProfileDropdown } from '@/components/auth/user-profile-dropdown';
import { cn } from '@/lib/utils';
import { blogService } from '@/lib/blog-service';

export default function WriterDashboard() {
    const { user, loading: authLoading } = useWriterAuth();
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loadingPosts, setLoadingPosts] = useState(true);
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

    const createNewPost = () => {
        router.push('/writer/editor/new');
    };

    const stats = useMemo(() => {
        const publishedCount = posts.filter(p => p.published).length;
        const draftCount = posts.length - publishedCount;
        const totalViews = posts.reduce((acc, p) => acc + (p.views || 0), 0);
        return { total: posts.length, published: publishedCount, drafts: draftCount, views: totalViews };
    }, [posts]);

    if (authLoading || loadingPosts) {
        return (
            <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="font-headline font-black uppercase tracking-widest text-xs text-muted-foreground animate-pulse">Loading Workspace</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#fafafa]">
            {/* Nav */}
            <nav className="bg-white/80 backdrop-blur-md border-b border-border/40 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="font-headline font-black text-xl tracking-tighter flex items-center gap-2">
                        <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                            <BookOpen className="h-4 w-4 text-white" />
                        </div>
                        <span>LODGER BLOG<span className="text-primary">.</span> <span className="text-muted-foreground/40 ml-2 font-sans font-medium text-xs border-l border-border/50 pl-2 uppercase tracking-widest">Writer Hub</span></span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <NotificationBell />
                        <UserProfileDropdown user={user} />
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 py-12">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
                    <div className="space-y-2">
                        <h1 className="font-headline font-black text-4xl lg:text-5xl uppercase tracking-tighter">My Workspace</h1>
                        <p className="text-muted-foreground font-medium text-lg italic">Crafting stories that move the community.</p>
                    </div>
                    <button
                        onClick={createNewPost}
                        className="bg-black text-white font-black px-8 py-4 rounded-2xl flex items-center gap-3 hover:bg-primary hover:translate-y-[-2px] hover:shadow-2xl hover:shadow-primary/20 transition-all active:scale-95"
                    >
                        <Plus className="h-5 w-5" /> Write New Story
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                    {[
                        { label: 'Total Stories', value: stats.total, icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-50' },
                        { label: 'Published', value: stats.published, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50' },
                        { label: 'Drafts', value: stats.drafts, icon: FileText, color: 'text-amber-500', bg: 'bg-amber-50' },
                        { label: 'Total Views', value: stats.views, icon: BarChart3, color: 'text-purple-500', bg: 'bg-purple-50' },
                    ].map((stat, i) => (
                        <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-border/40 shadow-sm hover:shadow-xl transition-all group">
                            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110", stat.bg)}>
                                <stat.icon className={cn("h-6 w-6", stat.color)} />
                            </div>
                            <div className="text-3xl font-black tracking-tight">{stat.value}</div>
                            <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-1">{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* Stories List */}
                <div className="space-y-6">
                    <div className="flex items-center gap-4 px-4">
                        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Recent Activity</h2>
                        <div className="h-px flex-1 bg-border/40" />
                    </div>

                    {posts.length === 0 ? (
                        <div className="text-center py-24 bg-white rounded-[3rem] border border-border/40 shadow-sm flex flex-col items-center justify-center">
                            <div className="w-20 h-20 bg-muted/30 rounded-[2rem] flex items-center justify-center text-muted-foreground/20 mb-6">
                                <Plus className="h-10 w-10" />
                            </div>
                            <h2 className="text-2xl font-black mb-2 uppercase tracking-tight">Blank Page Syndrome?</h2>
                            <p className="text-muted-foreground font-medium mb-8 max-w-sm">Every great story starts with a single word. Let's get yours started.</p>
                            <button
                                onClick={createNewPost}
                                className="bg-black text-white font-black px-10 py-5 rounded-[2rem] flex items-center gap-3 hover:bg-primary transition-all shadow-xl hover:shadow-primary/20"
                            >
                                <Plus className="h-5 w-5" /> Start Writing
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {posts.map((post) => (
                                <div key={post.id} className="bg-white p-6 rounded-[2.5rem] border border-border/40 shadow-sm hover:shadow-2xl transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between group gap-6">
                                    <div className="flex items-center gap-6 flex-1 min-w-0">
                                        <div className="h-24 w-24 bg-muted rounded-[2rem] bg-cover bg-center ring-1 ring-border/50 shrink-0 shadow-inner" style={{ backgroundImage: `url(${post.coverImage || '/placeholder-post.jpg'})` }} />
                                        <div className="min-w-0 flex-1 space-y-2">
                                            <h3 className="font-serif font-black text-2xl group-hover:text-primary transition-colors truncate tracking-tight">{post.title || 'Untitled Draft'}</h3>
                                            <div className="flex flex-wrap items-center gap-4 text-[10px] font-black uppercase tracking-widest">
                                                <span className={cn(
                                                    "px-4 py-1.5 rounded-full ring-1",
                                                    post.published ? "bg-green-50 text-green-600 ring-green-500/20" : "bg-amber-50 text-amber-600 ring-amber-500/20"
                                                )}>
                                                    {post.published ? "Published" : "Draft"}
                                                </span>
                                                <span className="text-muted-foreground bg-slate-50 px-4 py-1.5 rounded-full flex items-center gap-2 ring-1 ring-slate-200/50">
                                                    <Eye className="h-3 w-3" /> {post.views || 0} Views
                                                </span>
                                                <span className="text-muted-foreground/60 font-medium">
                                                    {new Date(post.createdAt || post.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 w-full sm:w-auto shrink-0 border-t sm:border-t-0 pt-4 sm:pt-0">
                                        <Link
                                            href={`/writer/editor/${post.id}`}
                                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-4 font-black text-xs uppercase tracking-widest bg-slate-50 border border-slate-200/50 hover:bg-black hover:text-white hover:border-black rounded-2xl transition-all"
                                        >
                                            <Edit3 className="h-4 w-4" /> Edit
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(post.id)}
                                            className="p-4 text-muted-foreground/30 hover:text-destructive hover:bg-destructive/5 rounded-2xl transition-all"
                                            title="Delete Post"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
