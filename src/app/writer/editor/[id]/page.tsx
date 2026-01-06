'use client';

import { useWriterAuth } from '@/hooks/useWriterAuth';
import { db } from '@/lib/firebase';
import { doc, getDoc, addDoc, updateDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, Save, Globe, Settings, X } from 'lucide-react';
import Link from 'next/link';
import { TiptapEditor } from '@/components/editor/tiptap-editor';
import { NotificationBell } from '@/components/notifications/notification-bell';
import { UserProfileDropdown } from '@/components/auth/user-profile-dropdown';

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
                setFormData({
                    title: data.title || '',
                    excerpt: data.excerpt || '',
                    content: data.content || '', // This handles both HTML (new) and Markdown (old) reasonably well for now, though raw markdown might show if not parsed. Tiptap doesn't auto-parse markdown string to nodes unless we use tiptap-markdown. For now, assuming new flow.
                    coverImage: data.coverImage || '',
                    category: data.category || 'Design',
                    published: data.published || false
                });
            }
        } catch (error) {
            console.error("Error fetching post:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (publishStatus?: boolean) => {
        setSaving(true);
        try {
            const isPublishing = publishStatus !== undefined ? publishStatus : formData.published;
            const dataToSave: any = {
                ...formData,
                slug: formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
                published: isPublishing,
                updatedAt: serverTimestamp(),
                author: {
                    name: user?.displayName || user?.email?.split('@')[0] || 'Writer',
                    role: 'Editor',
                    avatar: user?.photoURL || ''
                },
                readTime: Math.ceil((formData.content?.replace(/<[^>]*>/g, '').split(' ').length || 0) / 200) || 1
            };

            if (isPublishing && !formData.published) {
                dataToSave.publishedAt = serverTimestamp();
            }

            if (id === 'new') {
                const docRef = await addDoc(collection(db, 'posts'), {
                    ...dataToSave,
                    createdAt: serverTimestamp(),
                    authorId: user?.uid,
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

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#fafafa]">
            {/* Editor Header */}
            <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-border/40 z-50 transition-all">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/writer/dashboard" className="p-2 hover:bg-muted rounded-xl transition-colors">
                            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
                        </Link>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Editor</span>
                            <span className="font-bold text-sm truncate max-w-[200px]">{formData.title || 'Untitled Post'}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="hidden md:flex items-center gap-4 mr-4 text-xs text-muted-foreground font-medium border-r border-border/50 pr-4">
                            <span>{stats.words} words</span>
                            <span>{Math.ceil(stats.words / 200)} min read</span>
                        </div>

                        <span className="hidden sm:inline-block text-xs font-bold uppercase tracking-widest text-muted-foreground mr-2">
                            {formData.published ? "Live" : "Draft"}
                        </span>

                        <div className="mr-2 flex items-center gap-2">
                            <NotificationBell />
                            <UserProfileDropdown user={user} />
                        </div>

                        <button
                            onClick={() => setShowSettings(true)}
                            className="p-2.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                            title="Post Settings"
                        >
                            <Settings className="h-5 w-5" />
                        </button>

                        <button
                            onClick={() => handleSave()}
                            disabled={saving}
                            className="px-4 py-2 rounded-xl font-bold text-sm bg-muted text-foreground hover:bg-muted/80 transition-colors flex items-center gap-2"
                        >
                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            <span className="hidden sm:inline">Save</span>
                        </button>

                        <button
                            onClick={() => {
                                if (!formData.published && stats.words < 50) {
                                    alert(`You need at least 50 words to publish (currently ${stats.words}).`);
                                    return;
                                }
                                handleSave(!formData.published);
                            }}
                            disabled={saving}
                            className={`px-4 py-2 rounded-xl font-bold text-sm transition-colors flex items-center gap-2 ${formData.published
                                ? "bg-destructive/10 text-destructive hover:bg-destructive/20"
                                : stats.words < 50
                                    ? "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                                    : "bg-primary text-primary-foreground hover:translate-y-[-1px] hover:shadow-lg"
                                }`}
                            title={!formData.published && stats.words < 50 ? "Minimum 50 words required to publish" : ""}
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
                    <div className="bg-yellow-500/10 text-yellow-600 border border-yellow-500/20 px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center">
                        Write {50 - stats.words} more words to publish.
                    </div>
                )}
                <div className="w-full flex flex-col gap-6">
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full bg-transparent border-none px-0 py-2 font-serif text-5xl md:text-6xl font-black focus:outline-none placeholder:text-muted-foreground/20 leading-tight"
                        placeholder="Your Headline..."
                    />

                    {/* WYSIWYG Editor */}
                    <TiptapEditor
                        content={formData.content}
                        onChange={(html) => setFormData({ ...formData, content: html })}
                        uploadPathPrefix={id === 'new' ? 'posts/drafts' : `posts/${id}`}
                    />
                </div>
            </main>

            {/* Post Settings Modal */}
            {showSettings && (
                <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-lg rounded-[2rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200 relative">
                        <button
                            onClick={() => setShowSettings(false)}
                            className="absolute top-6 right-6 p-2 hover:bg-muted rounded-full transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <h2 className="font-headline font-black text-2xl mb-6">Post Settings</h2>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Category</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-black appearance-none"
                                >
                                    {['Design', 'Culture', 'Guides', 'Announcement', 'Education'].map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Excerpt</label>
                                <textarea
                                    value={formData.excerpt}
                                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                    className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-black min-h-[100px] resize-none"
                                    placeholder="Summary used in search results..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Cover Image</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={formData.coverImage}
                                        onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                                        className="flex-1 bg-muted/30 border border-border rounded-xl px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-black"
                                        placeholder="Image URL..."
                                    />
                                    {formData.coverImage && (
                                        <div className="h-12 w-12 rounded-lg overflow-hidden shrink-0 border border-border">
                                            <img src={formData.coverImage} className="h-full w-full object-cover" alt="Preview" />
                                        </div>
                                    )}
                                </div>
                                <p className="text-[10px] text-muted-foreground ml-1">
                                    Use the 'New Story' setup for uploads/icons, or paste a URL here.
                                </p>
                            </div>

                            <button
                                onClick={() => setShowSettings(false)}
                                className="w-full py-4 rounded-xl font-bold bg-primary text-primary-foreground hover:shadow-lg hover:translate-y-[-2px] transition-all"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
