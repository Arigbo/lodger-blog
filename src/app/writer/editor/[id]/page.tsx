'use client';

import { useWriterAuth } from '@/hooks/useWriterAuth';
import { db } from '@/lib/firebase';
import { doc, getDoc, addDoc, updateDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, Save, Globe } from 'lucide-react';
import Link from 'next/link';

export default function EditorPage() {
    const { user, loading: authLoading } = useWriterAuth();
    const params = useParams();
    // Resolve params.id properly as it can be string or array
    const idRaw = params?.id;
    const id = Array.isArray(idRaw) ? idRaw[0] : idRaw;

    // Since params is a Promise in newer Next.js versions (though `useParams` usually returns the object directly in client components, strict typing might complain), let's handle it safely.
    // Actually, useParams in client component returns Params object directly.

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
                    content: data.content || '',
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
                readTime: Math.ceil(formData.content.split(' ').length / 200) || 1
            };

            // Set publishedAt when publishing for the first time
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
        } catch (error) {
            console.error("Error saving post:", error);
            alert("Failed to save post");
        } finally {
            setSaving(false);
        }
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
            <nav className="bg-white border-b border-border/40 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/writer/dashboard" className="p-2 hover:bg-muted rounded-xl transition-colors">
                            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
                        </Link>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Editor</span>
                            <span className="font-bold text-sm truncate max-w-[200px]">{formData.title || 'Untitled Post'}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground mr-2">
                            {formData.published ? "Live" : "Draft"}
                        </span>
                        <button
                            onClick={() => handleSave()}
                            disabled={saving}
                            className="px-6 py-2.5 rounded-xl font-bold text-sm bg-muted text-foreground hover:bg-muted/80 transition-colors flex items-center gap-2"
                        >
                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            Save
                        </button>
                        <button
                            onClick={() => handleSave(!formData.published)}
                            disabled={saving}
                            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center gap-2 ${formData.published
                                ? "bg-destructive/10 text-destructive hover:bg-destructive/20"
                                : "bg-primary text-primary-foreground hover:translate-y-[-1px] hover:shadow-lg"
                                }`}
                        >
                            <Globe className="h-4 w-4" />
                            {formData.published ? "Unpublish" : "Publish"}
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto px-6 py-12 space-y-8">
                {/* Meta Data Section */}
                <div className="bg-white p-8 rounded-[2rem] border border-border/40 shadow-sm space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Cover Image URL</label>
                            <input
                                type="text"
                                value={formData.coverImage}
                                onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                                className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-black"
                                placeholder="https://images.unsplash.com/..."
                            />
                        </div>
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
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Title</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full bg-transparent border-b-2 border-muted focus:border-black px-0 py-4 font-serif text-4xl font-bold focus:outline-none transition-colors placeholder:text-muted-foreground/30"
                            placeholder="Enter an engaging title..."
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Excerpt</label>
                        <textarea
                            value={formData.excerpt}
                            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                            className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-black min-h-[100px] resize-none"
                            placeholder="A short summary for search results and previews..."
                        />
                    </div>
                </div>

                {/* Content Editor */}
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Content (Markdown / HTML)</label>
                    <div className="bg-white rounded-[2rem] border border-border/40 shadow-sm overflow-hidden min-h-[600px] flex flex-col relative">
                        <textarea
                            className="flex-1 w-full h-full p-8 font-mono text-base bg-transparent resize-none focus:outline-none leading-relaxed"
                            placeholder="# Write your masterpiece..."
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        />
                    </div>
                    <p className="text-xs text-muted-foreground text-center pt-4">Supported: Markdown, HTML. Images must be hosted externally.</p>
                </div>
            </main>
        </div>
    );
}
