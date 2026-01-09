'use client';

import { useWriterAuth } from '@/hooks/useWriterAuth';
import { db } from '@/lib/firebase';
import { doc, getDoc, addDoc, updateDoc, collection, serverTimestamp, query, where, getDocs, limit } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, Save, Globe, Settings, X, BookOpen, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { TiptapEditor } from '@/components/editor/tiptap-editor';
import { NotificationBell } from '@/components/notifications/notification-bell';
import { UserProfileDropdown } from '@/components/auth/user-profile-dropdown';
import { cn } from '@/lib/utils';

export default function EditorPage() {
    const { user, loading: authLoading } = useWriterAuth();
    const params = useParams();
    const idRaw = params?.id;
    const id = Array.isArray(idRaw) ? idRaw[0] : idRaw;

    const router = useRouter();

    const [formData, setFormData] = useState({
        title: '',
        excerpt: '',
        content: '',
        coverImage: '',
        category: 'Design',
        published: false
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (user && id) {
            if (id === 'new') {
                setLoading(false);
            } else {
                fetchPost(id);
            }
        }
    }, [user, id]);

    const fetchPost = async (postId: string) => {
        try {
            const docRef = doc(db, 'posts', postId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();

                // Security Check: Ensure user owns this post
                if (data.authorId !== user?.uid) {
                    setError("You don't have permission to edit this story.");
                    setLoading(false);
                    return;
                }

                setFormData({
                    title: data.title || '',
                    excerpt: data.excerpt || '',
                    content: data.content || '',
                    coverImage: data.coverImage || '',
                    category: data.category || 'Design',
                    published: data.published || false
                });
            } else {
                setError("Story not found.");
            }
        } catch (error) {
            console.error("Error fetching post:", error);
            setError("Something went wrong while loading the story.");
        } finally {
            setLoading(false);
        }
    };

    const generateUniqueSlug = async (title: string, currentId?: string) => {
        let slug = title.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');

        if (!slug) slug = 'untitled';

        // Check if slug exists
        const q = query(collection(db, 'posts'), where('slug', '==', slug), limit(1));
        const snapshot = await getDocs(q);

        if (!snapshot.empty && snapshot.docs[0].id !== currentId) {
            // Append short random string if exists
            slug += '-' + Math.random().toString(36).substring(2, 6);
        }

        return slug;
    };

    const handleSave = async (publishStatus?: boolean) => {
        if (!user) return;
        setSaving(true);
        try {
            const isPublishing = publishStatus !== undefined ? publishStatus : formData.published;
            const slug = await generateUniqueSlug(formData.title, id === 'new' ? undefined : id);

            const dataToSave: any = {
                ...formData,
                slug,
                published: isPublishing,
                updatedAt: serverTimestamp(),
                author: {
                    name: user?.displayName || user?.email?.split('@')[0] || 'Writer',
                    role: 'Editor',
                    avatar: user?.photoURL || ''
                },
                authorId: user.uid, // Always stamp with current user ID
                readTime: Math.ceil((formData.content?.replace(/<[^>]*>/g, '').split(' ').length || 0) / 200) || 1
            };

            if (isPublishing && !formData.published) {
                dataToSave.publishedAt = serverTimestamp();
            }

            if (id === 'new') {
                const docRef = await addDoc(collection(db, 'posts'), {
                    ...dataToSave,
                    createdAt: serverTimestamp(),
                    publishedAt: isPublishing ? serverTimestamp() : null
                });
                router.replace(`/writer/editor/${docRef.id}`);
            } else if (id) {
                await updateDoc(doc(db, 'posts', id), dataToSave);
                if (publishStatus !== undefined) {
                    setFormData(prev => ({ ...prev, published: publishStatus }));
                }
            }
            setShowSettings(false);
        } catch (error) {
            console.error("Error saving post:", error);
            alert("Failed to save post");
        } finally {
            setSaving(false);
        }
    };

    const stats = {
        words: formData.content ? formData.content.replace(/<[^>]*>/g, '').trim().split(/\s+/).length : 0,
        chars: formData.content ? formData.content.replace(/<[^>]*>/g, '').length : 0
    };

    if (error) {
        return (
            <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6">
                <div className="bg-white p-12 rounded-[3rem] border border-border/40 shadow-xl max-w-md text-center space-y-6">
                    <div className="w-20 h-20 bg-destructive/10 rounded-3xl flex items-center justify-center text-destructive mx-auto">
                        <AlertCircle className="h-10 w-10" />
                    </div>
                    <h2 className="text-2xl font-black uppercase tracking-tight">Access Denied</h2>
                    <p className="text-muted-foreground font-medium">{error}</p>
                    <Link href="/writer/dashboard" className="inline-block bg-black text-white font-black px-8 py-4 rounded-2xl hover:bg-primary transition-all">
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="font-headline font-black uppercase tracking-widest text-xs text-muted-foreground animate-pulse">Opening Manuscript</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#fafafa]">
            {/* Editor Header */}
            <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-border/40 z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/writer/dashboard" className="p-2 hover:bg-muted rounded-xl transition-colors group">
                            <ArrowLeft className="h-5 w-5 text-muted-foreground group-hover:text-black transition-colors" />
                        </Link>
                        <div className="flex flex-col min-w-0">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Drafting</span>
                            <span className="font-bold text-sm truncate max-w-[150px] md:max-w-[300px]">{formData.title || 'Untitled Story'}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="hidden md:flex items-center gap-4 mr-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 border-r border-border/50 pr-4">
                            <span>{stats.words} words</span>
                            <span className="text-primary/40">{Math.ceil(stats.words / 200)} min read</span>
                        </div>

                        <div className="mr-2 flex items-center gap-2">
                            <NotificationBell />
                            <UserProfileDropdown user={user} />
                        </div>

                        <button
                            onClick={() => setShowSettings(true)}
                            className="p-2.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                            title="Story Settings"
                        >
                            <Settings className="h-5 w-5" />
                        </button>

                        <button
                            onClick={() => handleSave()}
                            disabled={saving}
                            className="px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest bg-slate-50 border border-slate-200/50 text-foreground hover:bg-black hover:text-white transition-all flex items-center gap-2 shadow-sm"
                        >
                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            <span className="hidden sm:inline">Save</span>
                        </button>

                        <button
                            onClick={() => {
                                if (!formData.published && stats.words < 50) {
                                    alert(`Your story needs at least 50 words to be published (currently ${stats.words}). Keep going!`);
                                    return;
                                }
                                handleSave(!formData.published);
                            }}
                            disabled={saving}
                            className={cn(
                                "px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg",
                                formData.published
                                    ? "bg-destructive/10 text-destructive hover:bg-destructive/20 shadow-none border border-destructive/20"
                                    : stats.words < 50
                                        ? "bg-muted text-muted-foreground cursor-not-allowed opacity-50 shadow-none"
                                        : "bg-primary text-primary-foreground hover:translate-y-[-1px] hover:shadow-primary/20"
                            )}
                        >
                            <Globe className="h-4 w-4" />
                            <span className="hidden sm:inline">{formData.published ? "Unpublish" : "Publish"}</span>
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto px-6 pt-32 pb-24 space-y-8">
                {/* Word Count Warning */}
                {!formData.published && stats.words < 50 && (
                    <div className="bg-amber-500/10 text-amber-700 border border-amber-500/20 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-500">
                        <AlertCircle className="h-4 w-4" />
                        Write {50 - stats.words} more words to unlock publishing.
                    </div>
                )}

                <div className="w-full flex flex-col gap-6">
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full bg-transparent border-none px-0 py-2 font-serif text-5xl md:text-6xl lg:text-7xl font-black focus:outline-none placeholder:text-muted-foreground/10 leading-[0.9] tracking-tight"
                        placeholder="Headline..."
                    />

                    <div className="h-px bg-border/40 w-24" />

                    {/* WYSIWYG Editor */}
                    <div className="typography-premium">
                        <TiptapEditor
                            content={formData.content}
                            onChange={(html) => setFormData({ ...formData, content: html })}
                            uploadPathPrefix={id === 'new' ? `posts/drafts/${user?.uid}` : `posts/${id}`}
                        />
                    </div>
                </div>
            </main>

            {/* Post Settings Modal */}
            {showSettings && (
                <div className="fixed inset-0 z-[60] bg-black/5 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-lg rounded-[3rem] p-10 shadow-3xl animate-in zoom-in-95 duration-300 relative border border-border/40">
                        <button
                            onClick={() => setShowSettings(false)}
                            className="absolute top-8 right-8 p-2 hover:bg-muted rounded-full transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <h2 className="font-headline font-black text-3xl mb-8 uppercase tracking-tighter">Story Settings</h2>

                        <div className="space-y-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Topic</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200/50 rounded-2xl px-6 py-4 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary appearance-none transition-all"
                                >
                                    {['Design', 'Culture', 'Guides', 'Announcement', 'Education'].map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Summary</label>
                                <textarea
                                    value={formData.excerpt}
                                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200/50 rounded-2xl px-6 py-4 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-primary min-h-[120px] resize-none transition-all"
                                    placeholder="A brief hook for your readers..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Cover Image</label>
                                <div className="flex gap-4">
                                    <input
                                        type="text"
                                        value={formData.coverImage}
                                        onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                                        className="flex-1 bg-slate-50 border border-slate-200/50 rounded-2xl px-6 py-4 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                                        placeholder="Image URL..."
                                    />
                                    {formData.coverImage && (
                                        <div className="h-14 w-14 rounded-2xl overflow-hidden shrink-0 border border-border/40 shadow-sm">
                                            <img src={formData.coverImage} className="h-full w-full object-cover" alt="Preview" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={() => setShowSettings(false)}
                                className="w-full py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest bg-black text-white hover:bg-primary hover:shadow-2xl hover:shadow-primary/20 hover:translate-y-[-2px] transition-all"
                            >
                                Looks Good
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
