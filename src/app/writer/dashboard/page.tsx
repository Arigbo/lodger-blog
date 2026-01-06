'use client';

import { useWriterAuth } from '@/hooks/useWriterAuth';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { BlogPost } from '@/types';
import Link from 'next/link';
import { Plus, Edit3, Trash2, Eye, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { NotificationBell } from '@/components/notifications/notification-bell';
import { UserProfileDropdown } from '@/components/auth/user-profile-dropdown';
import { cn } from '@/lib/utils';

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
        try {
            const q = query(
                collection(db, 'posts'),
                orderBy('createdAt', 'desc')
            );
            const snapshot = await getDocs(q);
            const fetchedPosts = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as BlogPost[];
            setPosts(fetchedPosts);
        } catch (error) {
            console.error("Error fetching posts:", error);
        } finally {
            setLoadingPosts(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this post?")) return;
        try {
            await deleteDoc(doc(db, 'posts', id));
            setPosts(posts.filter(p => p.id !== id));
        } catch (error) {
            console.error("Error deleting post:", error);
        }
    };

    const createNewPost = () => {
        router.push('/writer/create');
    }

    if (authLoading || loadingPosts) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#fafafa]">
            <nav className="bg-white border-b border-border/40 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="font-headline font-black text-xl tracking-tighter">
                        THE COMMONS<span className="text-primary">.</span> <span className="text-muted-foreground ml-2 font-sans font-medium text-sm border-l pl-2">Writer Dashboard</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <NotificationBell />
                        <UserProfileDropdown user={user} />
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 py-12">
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h1 className="font-headline font-black text-4xl uppercase tracking-tighter">My Stories</h1>
                        <p className="text-muted-foreground font-medium mt-2">Manage your published works and drafts.</p>
                    </div>
                    <button
                        onClick={createNewPost}
                        className="bg-primary text-primary-foreground font-bold px-6 py-3 rounded-xl flex items-center gap-2 hover:translate-y-[-2px] hover:shadow-lg transition-all"
                    >
                        <Plus className="h-5 w-5" /> New Story
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {posts.length === 0 ? (
                        <div className="text-center py-32 bg-white rounded-[3rem] border border-border/40 shadow-sm flex flex-col items-center justify-center">
                            <div className="w-20 h-20 bg-primary/5 rounded-3xl flex items-center justify-center text-primary mb-6">
                                <Plus className="h-10 w-10" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">No stories yet.</h2>
                            <p className="text-muted-foreground font-medium mb-8">Start writing something amazing and share it with the community.</p>
                            <button
                                onClick={createNewPost}
                                className="bg-primary text-primary-foreground font-bold px-8 py-4 rounded-2xl flex items-center gap-2 hover:translate-y-[-2px] hover:shadow-xl transition-all"
                            >
                                <Plus className="h-5 w-5" /> Write Your First Story
                            </button>
                        </div>
                    ) : (
                        posts.map((post) => (
                            <div key={post.id} className="bg-white p-6 rounded-[2rem] border border-border/40 shadow-sm hover:shadow-xl transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between group gap-6">
                                <div className="flex items-center gap-6 flex-1">
                                    <div className="h-20 w-20 bg-muted rounded-2xl bg-cover bg-center ring-1 ring-border/50 shrink-0" style={{ backgroundImage: `url(${post.coverImage})` }} />
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-bold text-xl group-hover:text-primary transition-colors truncate">{post.title || 'Untitled Draft'}</h3>
                                        <div className="flex flex-wrap items-center gap-4 text-xs font-bold uppercase tracking-widest mt-2">
                                            <span className={cn(
                                                "px-3 py-1 rounded-full",
                                                post.published ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                                            )}>
                                                {post.published ? "Published" : "Draft"}
                                            </span>
                                            <span className="text-muted-foreground flex items-center gap-1.5">
                                                <Eye className="h-3 w-3" /> {post.views || 0} views
                                            </span>
                                            <span className="text-muted-foreground">
                                                {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 w-full sm:w-auto shrink-0 border-t sm:border-t-0 pt-4 sm:pt-0">
                                    <Link href={`/writer/editor/${post.id}`} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 font-bold text-sm bg-secondary/50 hover:bg-primary/10 hover:text-primary rounded-xl transition-all">
                                        <Edit3 className="h-4 w-4" /> Edit
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(post.id)}
                                        className="p-3 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-xl transition-all"
                                        title="Delete Post"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
}
