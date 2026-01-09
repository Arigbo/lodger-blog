'use client';

import { useWriterAuth } from '@/hooks/useWriterAuth';
import { db } from '@/lib/firebase';
import { deleteDoc, doc } from 'firebase/firestore';
import { useEffect, useState, useMemo } from 'react';
import { BlogPost } from '@/types';
import Link from 'next/link';
import { Plus, Edit3, Trash2, Eye, Loader2, BookOpen, CheckCircle, FileText, BarChart3, ThumbsUp, ThumbsDown, MessageSquare, AlertTriangle, User, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { NotificationBell } from '@/components/notifications/notification-bell';
import { UserProfileDropdown } from '@/components/auth/user-profile-dropdown';
import { cn } from '@/lib/utils';
import { blogService } from '@/lib/blog-service';

export default function WriterDashboard() {
    const { user, loading: authLoading } = useWriterAuth();
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

    const createNewPost = () => {
        router.push('/writer/editor/new');
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
                    <div className="space-y-4">
                        <div className="inline-flex rounded-2xl bg-black/[0.03] p-1.5 ring-1 ring-black/5">
                            <button
                                onClick={() => setActiveTab('stories')}
                                className={cn(
                                    "px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                                    activeTab === 'stories' ? "bg-white text-black shadow-lg" : "text-muted-foreground hover:text-black"
                                )}
                            >
                                Stories
                            </button>
                            <button
                                onClick={() => setActiveTab('analytics')}
                                className={cn(
                                    "px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                                    activeTab === 'analytics' ? "bg-white text-black shadow-lg" : "text-muted-foreground hover:text-black"
                                )}
                            >
                                Analytics
                            </button>
                        </div>
                        <h1 className="font-headline font-black text-4xl lg:text-5xl uppercase tracking-tighter">
                            {activeTab === 'stories' ? 'Story Library' : 'Reader Insights'}
                        </h1>
                    </div>
                    <button
                        onClick={createNewPost}
                        className="bg-black text-white font-black px-8 py-4 rounded-2xl flex items-center gap-3 hover:bg-primary hover:translate-y-[-2px] hover:shadow-2xl hover:shadow-primary/20 transition-all active:scale-95 shadow-xl"
                    >
                        <Plus className="h-5 w-5" /> Write New Story
                    </button>
                </div>

                {activeTab === 'stories' ? (
                    <div className="space-y-12">
                        {/* Stats Summary for Stories Tab */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { label: 'Total Stories', value: stats.total, icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-50' },
                                { label: 'Published', value: stats.published, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50' },
                                { label: 'Total Views', value: stats.views, icon: Eye, color: 'text-purple-500', bg: 'bg-purple-50' },
                                { label: 'Sentiments', value: stats.likes + stats.dislikes, icon: BarChart3, color: 'text-amber-500', bg: 'bg-amber-50' },
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
                                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">My Collection</h2>
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
                                                <div className="min-w-0 flex-1 space-y-3">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-serif font-black text-2xl group-hover:text-primary transition-colors truncate tracking-tight">{post.title || 'Untitled Draft'}</h3>
                                                        <Link href={`/post/${post.slug}`} target="_blank" className="text-muted-foreground/20 hover:text-black transition-colors">
                                                            <ExternalLink className="h-4 w-4" />
                                                        </Link>
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-4 text-[10px] font-black uppercase tracking-widest">
                                                        <span className={cn(
                                                            "px-4 py-1.5 rounded-full ring-1",
                                                            post.published ? "bg-green-50 text-green-600 ring-green-500/20" : "bg-amber-50 text-amber-600 ring-amber-500/20"
                                                        )}>
                                                            {post.published ? "Published" : "Draft"}
                                                        </span>
                                                        <span className="text-muted-foreground bg-slate-50 px-4 py-1.5 rounded-full flex items-center gap-2 ring-1 ring-slate-200/50">
                                                            <Eye className="h-3 w-3" /> {post.views || 0}
                                                        </span>
                                                        <span className="text-primary bg-primary/5 px-4 py-1.5 rounded-full flex items-center gap-2 ring-1 ring-primary/20">
                                                            <ThumbsUp className="h-3 w-3" /> {post.likes?.length || 0}
                                                        </span>
                                                        <span className="text-muted-foreground bg-slate-50 px-4 py-1.5 rounded-full flex items-center gap-2 ring-1 ring-slate-200/50">
                                                            <MessageSquare className="h-3 w-3" /> {post.commentCount || 0}
                                                        </span>
                                                        {post.reports && post.reports.length > 0 && (
                                                            <span className="text-destructive bg-destructive/5 px-4 py-1.5 rounded-full flex items-center gap-2 ring-1 ring-destructive/20">
                                                                <AlertTriangle className="h-3 w-3" /> {post.reports.length}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 w-full sm:w-auto shrink-0 border-t sm:border-t-0 pt-4 sm:pt-0">
                                                <Link
                                                    href={`/writer/editor/${post.id}`}
                                                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-4 font-black text-xs uppercase tracking-widest bg-slate-50 border border-slate-200/50 hover:bg-black hover:text-white hover:border-black rounded-2xl transition-all shadow-sm"
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
                    </div>
                ) : (
                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Analytics Detail Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="col-span-1 md:col-span-2 space-y-8">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="bg-white p-10 rounded-[3rem] border border-border/40 shadow-xl relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-32 bg-primary/5 blur-3xl rounded-full -mr-20 -mt-20 group-hover:bg-primary/10 transition-colors" />
                                        <div className="relative z-10 flex flex-col gap-2">
                                            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                                                <ThumbsUp className="h-6 w-6" />
                                            </div>
                                            <div className="text-5xl font-black tracking-tighter">{stats.likes}</div>
                                            <div className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Total Content Likes</div>
                                        </div>
                                    </div>
                                    <div className="bg-white p-10 rounded-[3rem] border border-border/40 shadow-xl relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-32 bg-black/5 blur-3xl rounded-full -mr-20 -mt-20 group-hover:bg-black/10 transition-colors" />
                                        <div className="relative z-10 flex flex-col gap-2">
                                            <div className="w-12 h-12 rounded-2xl bg-black/10 text-black flex items-center justify-center mb-4">
                                                <MessageSquare className="h-6 w-6" />
                                            </div>
                                            <div className="text-5xl font-black tracking-tighter">{stats.comments}</div>
                                            <div className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Community Comments</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Engagement Details Per Post */}
                                <div className="bg-white rounded-[3rem] border border-border/40 shadow-2xl overflow-hidden">
                                    <div className="px-10 py-8 border-b border-border/40 flex items-center justify-between bg-white sticky top-0 z-10">
                                        <h3 className="font-headline font-black text-xl uppercase tracking-tighter">Reader Sentiment Details</h3>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Engagement by Story</span>
                                    </div>
                                    <div className="divide-y divide-border/20">
                                        {posts.filter(p => p.published).map(post => (
                                            <div key={post.id} className="p-10 hover:bg-slate-50 transition-colors">
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                                                    <div className="space-y-2">
                                                        <h4 className="font-serif font-black text-2xl tracking-tight">{post.title}</h4>
                                                        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
                                                            <span>{post.views || 0} Total Reads</span>
                                                            {post.reports && post.reports.length > 0 && <span className="text-destructive">⚠️ {post.reports.length} Reports</span>}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-8">
                                                        <div className="text-center">
                                                            <div className="text-2xl font-black tracking-tight">{post.likes?.length || 0}</div>
                                                            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Likes</div>
                                                        </div>
                                                        <div className="w-px h-8 bg-border/40" />
                                                        <div className="text-center">
                                                            <div className="text-2xl font-black tracking-tight">{post.dislikes?.length || 0}</div>
                                                            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Dislikes</div>
                                                        </div>
                                                        <div className="w-px h-8 bg-border/40" />
                                                        <div className="text-center">
                                                            <div className="text-2xl font-black tracking-tight">{post.commentCount || 0}</div>
                                                            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Comments</div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Sentiment Who's Who (Preview) */}
                                                {(post.likes?.length || 0) > 0 && (
                                                    <div className="mt-8 pt-8 border-t border-border/20">
                                                        <h5 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-4 flex items-center gap-2">
                                                            <User className="h-3 w-3" /> Recent Liked By
                                                        </h5>
                                                        <div className="flex flex-wrap gap-2">
                                                            {post.likes?.slice(0, 5).map((userId, i) => (
                                                                <div key={i} className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-border/40 text-[10px] font-bold text-muted-foreground">
                                                                    <div className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center text-[8px]">
                                                                        <User className="h-2 w-2" />
                                                                    </div>
                                                                    {userId.substring(0, 8)}...
                                                                </div>
                                                            ))}
                                                            {(post.likes?.length || 0) > 5 && (
                                                                <span className="text-[10px] font-bold text-muted-foreground/40 self-center">+{post.likes!.length - 5} more</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Health & Safety Sidebar */}
                            <div className="space-y-8">
                                <div className="bg-white p-10 rounded-[3rem] border border-border/40 shadow-xl overflow-hidden relative group">
                                    <div className="absolute top-0 right-0 p-32 bg-destructive/5 blur-3xl rounded-full -mr-20 -mt-20" />
                                    <div className="relative z-10 space-y-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center">
                                                <AlertTriangle className="h-6 w-6" />
                                            </div>
                                            <h3 className="font-headline font-black text-xl uppercase tracking-tighter">Moderation</h3>
                                        </div>
                                        <div>
                                            <div className="text-4xl font-black tracking-tighter text-destructive">{stats.reports}</div>
                                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Active Reports</div>
                                        </div>
                                        <p className="text-xs font-medium text-muted-foreground/60 leading-relaxed italic">
                                            Stories with high report counts may be reviewed for community guideline adherence.
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-black text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent" />
                                    <div className="relative z-10 space-y-6">
                                        <div className="flex items-center gap-3 text-primary">
                                            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                                                <BarChart3 className="h-5 w-5" />
                                            </div>
                                            <h3 className="font-headline font-black text-lg uppercase tracking-tighter">Growth Score</h3>
                                        </div>
                                        <div className="text-3xl font-black tracking-tighter">+{Math.round((stats.likes / (stats.views || 1)) * 100)}%</div>
                                        <div className="text-[10px] font-black uppercase tracking-widest text-primary/60">Engagement Rate</div>
                                        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary transition-all duration-1000"
                                                style={{ width: `${Math.min((stats.likes / (stats.views || 1)) * 100, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
