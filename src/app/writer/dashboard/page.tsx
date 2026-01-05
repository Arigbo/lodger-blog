'use client';

import { useWriterAuth } from '@/hooks/useWriterAuth';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { BlogPost } from '@/types';
import Link from 'next/link';
import { Plus, Edit3, Trash2, Eye, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

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
        router.push('/writer/editor/new');
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
                        <span className="text-sm font-bold text-muted-foreground">{user?.email}</span>
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

                <div className="space-y-4">
                    {posts.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-[2rem] border border-border/40 shadow-sm">
                            <p className="text-muted-foreground font-medium">No stories yet. Start writing something amazing.</p>
                        </div>
                    ) : (
                        posts.map((post) => (
                            <div key={post.id} className="bg-white p-6 rounded-2xl border border-border/40 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between group">
                                <div className="flex items-center gap-6">
                                    <div className="h-16 w-16 bg-muted rounded-xl bg-cover bg-center" style={{ backgroundImage: `url(${post.coverImage})` }} />
                                    <div>
                                        <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{post.title || 'Untitled Draft'}</h3>
                                        <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-muted-foreground mt-1">
                                            <span className={post.published ? "text-green-600" : "text-amber-600"}>
                                                {post.published ? "Published" : "Draft"}
                                            </span>
                                            <span>•</span>
                                            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Link href={`/writer/editor/${post.id}`} className="p-3 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-xl transition-all">
                                        <Edit3 className="h-5 w-5" />
                                    </Link>
                                    <button onClick={() => handleDelete(post.id)} className="p-3 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-xl transition-all">
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
