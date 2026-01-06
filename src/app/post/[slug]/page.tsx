import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { BlogPost } from "@/types";
import { ArrowLeft } from "lucide-react";
import { Metadata } from "next";
import { MarkdownRenderer } from "@/lib/markdown-renderer";

// Force dynamic rendering to ensure fresh data
export const dynamic = 'force-dynamic';

// Helper to fetch from Firestore REST API
async function fetchFirestore(collection: string) {
    const projectId = "studio-2267792175-c3d0d";
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collection}`;

    // Fetch all (optimized: ideally use structuredQuery but this is simpler for connection stability)
    const res = await fetch(url + "?pageSize=100", { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
}

async function getPost(slug: string): Promise<BlogPost | null> {
    try {
        const data = await fetchFirestore("posts");
        if (!data || !data.documents) return null;

        // Find match by slug
        const doc = data.documents.find((d: any) => d.fields.slug?.stringValue === slug);
        if (!doc) return null;

        const fields = doc.fields;
        const id = doc.name.split('/').pop();

        const getString = (f: any) => f?.stringValue || "";
        const getBoolean = (f: any) => f?.booleanValue || false;
        const getMap = (f: any) => {
            if (!f?.mapValue?.fields) return {};
            const result: any = {};
            for (const key in f.mapValue.fields) {
                result[key] = f.mapValue.fields[key].stringValue;
            }
            return result;
        };
        const getTimestamp = (f: any) => f?.timestampValue || null;

        return {
            id,
            slug: getString(fields.slug),
            title: getString(fields.title),
            excerpt: getString(fields.excerpt),
            category: getString(fields.category),
            published: getBoolean(fields.published),
            publishedAt: getTimestamp(fields.publishedAt),
            coverImage: getString(fields.coverImage),
            author: getMap(fields.author),
            content: getString(fields.content),
            readTime: parseInt(fields.readTime?.integerValue || "1"),
            createdAt: getTimestamp(fields.createdAt),
            updatedAt: getTimestamp(fields.updatedAt),
        } as BlogPost;
    } catch (error) {
        console.error("Error fetching post:", error);
        return null;
    }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const post = await getPost(slug);

    if (!post) return { title: 'Post Not Found' };

    return {
        title: `${post.title} | The Commons`,
        description: post.excerpt,
        openGraph: {
            images: [post.coverImage],
        }
    };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const post = await getPost(slug);

    if (!post) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-[#fafafa]">
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-black/5">
                <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="font-headline font-black text-xl tracking-tighter hover:opacity-80 transition-opacity flex items-center gap-2">
                        <ArrowLeft className="h-5 w-5" /> BACK
                    </Link>
                    <Link href="/" className="font-headline font-black text-xl tracking-tighter hidden md:block">
                        THE COMMONS<span className="text-primary">.</span>
                    </Link>
                    <div className="w-20" /> {/* Spacer */}
                </div>
            </nav>

            <main className="pt-32 pb-20 px-6">
                <article className="max-w-3xl mx-auto">
                    {/* Header */}
                    <header className="mb-12 space-y-8 text-center">
                        <div className="flex items-center justify-center gap-4 text-sm font-bold uppercase tracking-widest text-muted-foreground">
                            <span className="text-primary">{post.category}</span>
                            <span>•</span>
                            <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>{post.readTime} min read</span>
                        </div>
                        <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] text-foreground">
                            {post.title}
                        </h1>
                        <p className="text-xl md:text-2xl text-muted-foreground font-medium leading-relaxed max-w-2xl mx-auto">
                            {post.excerpt}
                        </p>

                        <div className="flex items-center justify-center gap-4 pt-4">
                            <img src={post.author.avatar || "/placeholder-avatar.jpg"} alt={post.author.name} className="h-12 w-12 rounded-full object-cover bg-muted" />
                            <div className="text-left">
                                <div className="font-bold">{post.author.name}</div>
                                <div className="text-sm text-muted-foreground">{post.author.role}</div>
                            </div>
                        </div>
                    </header>

                    {/* Featured Image */}
                    {post.coverImage && (post.coverImage.startsWith('http') || post.coverImage.startsWith('/')) ? (
                        <div className="relative aspect-[16/9] w-full rounded-[2rem] overflow-hidden shadow-2xl mb-16">
                            <Image
                                src={post.coverImage}
                                alt={post.title}
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
                    ) : (
                        <div className="relative aspect-[16/9] w-full rounded-[2rem] overflow-hidden shadow-sm mb-16 bg-muted flex items-center justify-center border border-border">
                            <span className="text-muted-foreground font-bold opacity-20 text-8xl uppercase">
                                {post.category?.charAt(0) || 'L'}
                            </span>
                        </div>
                    )}

                    {/* Content */}
                    <MarkdownRenderer content={post.content} />
                </article>
            </main>
        </div>
    );
}
