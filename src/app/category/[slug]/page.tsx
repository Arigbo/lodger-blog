import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { BlogPost } from '@/types';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

const VALID_CATEGORIES = ['design', 'culture', 'guides', 'announcement', 'education'];

async function getPostsByCategory(category: string): Promise<BlogPost[]> {
    try {
        const q = query(
            collection(db, 'posts'),
            where('published', '==', true),
            where('category', '==', category.charAt(0).toUpperCase() + category.slice(1)),
            orderBy('publishedAt', 'desc')
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                publishedAt: data.publishedAt?.toDate ? data.publishedAt.toDate().toISOString() : data.publishedAt,
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
                updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt,
            } as BlogPost;
        });
    } catch (error) {
        console.error('Error fetching posts by category:', error);
        return [];
    }
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    if (!VALID_CATEGORIES.includes(slug.toLowerCase())) {
        notFound();
    }

    const posts = await getPostsByCategory(slug);
    const categoryName = slug.charAt(0).toUpperCase() + slug.slice(1);

    return (
        <div className="min-h-screen bg-background">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="font-headline font-black text-2xl tracking-tighter hover:opacity-80 transition-opacity">
                        THE COMMONS
                        <span className="text-primary text-4xl leading-none">.</span>
                    </Link>
                    <Link href="/" className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Home
                    </Link>
                </div>
            </nav>

            {/* Header */}
            <section className="pt-32 pb-12 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="space-y-4">
                        <div className="text-sm font-bold uppercase tracking-widest text-primary">Category</div>
                        <h1 className="font-headline text-6xl md:text-8xl font-black uppercase tracking-tighter">{categoryName}</h1>
                        <p className="text-xl text-muted-foreground font-medium max-w-2xl">
                            Exploring {categoryName.toLowerCase()} in the context of housing, community, and modern living.
                        </p>
                    </div>
                </div>
            </section>

            {/* Posts Grid */}
            <section className="py-12 px-6">
                <div className="max-w-7xl mx-auto">
                    {posts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            {posts.map((post) => (
                                <Link key={post.id} href={`/post/${post.slug}`} className="group space-y-6 block">
                                    <div className="aspect-[3/2] rounded-[1.5rem] bg-white border border-border/50 shadow-sm overflow-hidden group-hover:shadow-xl transition-all duration-300">
                                        {post.coverImage ? (
                                            <img
                                                src={post.coverImage}
                                                alt={post.title}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-muted/20 flex items-center justify-center text-muted-foreground/30 font-headline text-6xl opacity-30">
                                                L
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                            <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                                            <span>•</span>
                                            <span>{post.readTime} min read</span>
                                        </div>
                                        <h3 className="font-serif text-3xl font-bold leading-tight group-hover:text-primary transition-colors">
                                            {post.title}
                                        </h3>
                                        <p className="text-muted-foreground line-clamp-3 leading-relaxed">
                                            {post.excerpt}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <p className="text-muted-foreground font-medium text-xl">No posts in this category yet.</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
