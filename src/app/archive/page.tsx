import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { BlogPost } from '@/types';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getAllPosts(): Promise<BlogPost[]> {
    try {
        const q = query(
            collection(db, 'posts'),
            where('published', '==', true),
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
        console.error('Error fetching all posts:', error);
        return [];
    }
}

export default async function ArchivePage() {
    const posts = await getAllPosts();

    // Group posts by month/year
    const groupedPosts = posts.reduce((acc, post) => {
        const date = new Date(post.publishedAt);
        const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

        if (!acc[monthYear]) {
            acc[monthYear] = [];
        }
        acc[monthYear].push(post);
        return acc;
    }, {} as Record<string, BlogPost[]>);

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
                <div className="max-w-4xl mx-auto">
                    <div className="space-y-4">
                        <h1 className="font-headline text-6xl md:text-8xl font-black uppercase tracking-tighter">Archive</h1>
                        <p className="text-xl text-muted-foreground font-medium">
                            Every story we've published, organized chronologically.
                        </p>
                    </div>
                </div>
            </section>

            {/* Archive List */}
            <section className="py-12 px-6 pb-24">
                <div className="max-w-4xl mx-auto space-y-16">
                    {Object.keys(groupedPosts).length > 0 ? (
                        Object.entries(groupedPosts).map(([monthYear, monthPosts]) => (
                            <div key={monthYear} className="space-y-8">
                                <h2 className="font-headline text-3xl font-black uppercase tracking-tight border-b border-border pb-4">
                                    {monthYear}
                                </h2>
                                <div className="space-y-6">
                                    {monthPosts.map((post) => (
                                        <Link
                                            key={post.id}
                                            href={`/post/${post.slug}`}
                                            className="group block p-6 bg-white rounded-2xl border border-border/40 hover:shadow-lg transition-all"
                                        >
                                            <div className="flex items-start gap-6">
                                                {post.coverImage && (
                                                    <div className="hidden md:block w-32 h-32 rounded-xl overflow-hidden flex-shrink-0">
                                                        <img
                                                            src={post.coverImage}
                                                            alt={post.title}
                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                        />
                                                    </div>
                                                )}
                                                <div className="flex-1 space-y-3">
                                                    <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                                        <span className="text-primary">{post.category}</span>
                                                        <span>•</span>
                                                        <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                                                        <span>•</span>
                                                        <span>{post.readTime} min read</span>
                                                    </div>
                                                    <h3 className="font-serif text-2xl font-bold leading-tight group-hover:text-primary transition-colors">
                                                        {post.title}
                                                    </h3>
                                                    <p className="text-muted-foreground line-clamp-2">
                                                        {post.excerpt}
                                                    </p>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-20">
                            <p className="text-muted-foreground font-medium text-xl">No posts in the archive yet.</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
