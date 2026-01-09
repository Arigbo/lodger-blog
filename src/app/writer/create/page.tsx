'use client';

import { useState, useRef } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { db, storage } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, ArrowRight, UploadCloud, Link as LinkIcon, User, Image as ImageIcon, X, LayoutGrid } from 'lucide-react';
import Link from 'next/link';

export default function CreatePostPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    const [form, setForm] = useState({
        title: '',
        excerpt: '',
        category: 'Design',
        coverImage: ''
    });
    const [creating, setCreating] = useState(false);

    // Image Upload State
    const [imageTab, setImageTab] = useState<'upload' | 'url' | 'icons'>('upload');
    const [uploadingImage, setUploadingImage] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        // Validate
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            alert('File size must be less than 5MB');
            return;
        }

        setUploadingImage(true);
        try {
            const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
            const storageRef = ref(storage, `uploads/${user.uid}/${filename}`);

            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);

            setForm({ ...form, coverImage: downloadURL });
        } catch (error: any) {
            console.error('Error uploading image:', error);
            alert(`Failed to upload image: ${error.message || 'Unknown error'}`);
        } finally {
            setUploadingImage(false);
            if (e.target) e.target.value = ''; // Reset input to allow re-uploading the same file
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setCreating(true);

        try {
            const docRef = await addDoc(collection(db, 'posts'), {
                ...form,
                slug: form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
                content: '', // Start with empty content
                published: false,
                authorId: user.uid,
                author: {
                    name: user.displayName || 'Writer',
                    role: 'Editor',
                    avatar: user.photoURL || ''
                },
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                readTime: 1
            });

            // Redirect to editor
            router.push(`/writer/editor/${docRef.id}`);
        } catch (error) {
            console.error("Error creating post:", error);
            alert("Failed to create post. Please try again.");
            setCreating(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#fafafa]">
            <nav className="bg-white border-b border-border/40 sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/writer/dashboard" className="p-2 hover:bg-muted rounded-xl transition-colors">
                        <ArrowLeft className="h-5 w-5 text-muted-foreground" />
                    </Link>
                    <span className="font-bold text-sm uppercase tracking-widest text-muted-foreground">New Story Setup</span>
                    <div className="w-10" />
                </div>
            </nav>

            <main className="max-w-xl mx-auto px-6 py-12">
                <div className="text-center mb-10">
                    <h1 className="font-headline font-black text-3xl mb-2">Start a New Story</h1>
                    <p className="text-muted-foreground">Set up the basics before you jump into writing.</p>
                </div>

                <form onSubmit={handleCreate} className="space-y-6 bg-white p-8 rounded-[2rem] border border-border/40 shadow-sm">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Title</label>
                        <input
                            type="text"
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-black font-serif text-xl"
                            placeholder="The Future of Student Living"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Excerpt</label>
                        <textarea
                            value={form.excerpt}
                            onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                            className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-black h-24 resize-none"
                            placeholder="A short summary associated with the post..."
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Category</label>
                        <select
                            value={form.category}
                            onChange={(e) => setForm({ ...form, category: e.target.value })}
                            className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-black appearance-none"
                        >
                            {['Design', 'Culture', 'Guides', 'Announcement', 'Education'].map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Cover Image</label>

                        <div className="bg-muted/30 border border-border rounded-2xl p-2">
                            {/* Tabs */}
                            <div className="grid grid-cols-3 gap-1 mb-4">
                                <button
                                    type="button"
                                    onClick={() => setImageTab('upload')}
                                    className={`flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-bold transition-all ${imageTab === 'upload' ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground hover:bg-white/50'}`}
                                >
                                    <UploadCloud className="h-4 w-4" /> Upload
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setImageTab('url')}
                                    className={`flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-bold transition-all ${imageTab === 'url' ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground hover:bg-white/50'}`}
                                >
                                    <LinkIcon className="h-4 w-4" /> URL
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setImageTab('icons')}
                                    className={`flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-bold transition-all ${imageTab === 'icons' ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground hover:bg-white/50'}`}
                                >
                                    <LayoutGrid className="h-4 w-4" /> Icons
                                </button>
                            </div>

                            {/* Tab Content */}
                            <div className="px-2 pb-2">
                                {form.coverImage && (
                                    <div className="mb-4 relative rounded-xl overflow-hidden aspect-video group">
                                        <img src={form.coverImage} alt="Cover preview" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => setForm({ ...form, coverImage: '' })}
                                            className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-red-500 transition-colors"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                )}

                                {imageTab === 'upload' && !form.coverImage && (
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-all rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer text-center"
                                    >
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                        />
                                        {uploadingImage ? (
                                            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                                        ) : (
                                            <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
                                        )}
                                        <p className="text-sm font-bold text-muted-foreground">
                                            {uploadingImage ? 'Uploading...' : 'Click to upload from device'}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">Max 5MB (JPG, PNG)</p>
                                    </div>
                                )}

                                {imageTab === 'url' && !form.coverImage && (
                                    <input
                                        type="text"
                                        value={form.coverImage}
                                        onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
                                        className="w-full bg-white border border-border rounded-xl px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-black"
                                        placeholder="https://example.com/image.jpg"
                                    />
                                )}

                                {imageTab === 'icons' && !form.coverImage && (
                                    <div className="grid grid-cols-3 gap-2 py-2">
                                        {[
                                            { name: 'Magazine', icon: 'https://ui-avatars.com/api/?name=Magazine&background=0D8ABC&color=fff&size=512&font-size=0.33', bg: 'bg-blue-100' },
                                            { name: 'House', icon: 'https://ui-avatars.com/api/?name=House&background=10B981&color=fff&size=512&font-size=0.33', bg: 'bg-green-100' },
                                            { name: 'Community', icon: 'https://ui-avatars.com/api/?name=Community&background=F59E0B&color=fff&size=512&font-size=0.33', bg: 'bg-amber-100' },
                                            { name: 'Idea', icon: 'https://ui-avatars.com/api/?name=Idea&background=8B5CF6&color=fff&size=512&font-size=0.33', bg: 'bg-violet-100' },
                                            { name: 'Code', icon: 'https://ui-avatars.com/api/?name=Code&background=EF4444&color=fff&size=512&font-size=0.33', bg: 'bg-red-100' },
                                            { name: 'Star', icon: 'https://ui-avatars.com/api/?name=Star&background=EC4899&color=fff&size=512&font-size=0.33', bg: 'bg-pink-100' },
                                        ].map((preset) => (
                                            <button
                                                key={preset.name}
                                                type="button"
                                                onClick={() => setForm({ ...form, coverImage: preset.icon })}
                                                className={`aspect-square rounded-xl ${preset.bg} flex flex-col items-center justify-center gap-2 hover:scale-105 transition-transform border border-transparent hover:border-black/5 p-2 group`}
                                            >
                                                <img src={preset.icon} alt={preset.name} className="h-12 w-12 rounded-lg shadow-sm" />
                                                <span className="text-xs font-bold text-muted-foreground group-hover:text-black">{preset.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={creating || !form.coverImage}
                            className="w-full bg-primary text-primary-foreground font-bold h-14 rounded-xl flex items-center justify-center gap-2 hover:translate-y-[-2px] hover:shadow-lg transition-all disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none"
                        >
                            {creating ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Create & Start Writing <ArrowRight className="h-5 w-5" /></>}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}
