import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { BlogPost } from "@/types";
import { ArrowLeft, Clock, Calendar, Tag, Share2, Sparkles } from "lucide-react";
import { Metadata } from "next";
import { MarkdownRenderer } from "@/lib/markdown-renderer";
import { ReadingProgress } from "@/components/blog/reading-progress";
import { SocialShare } from "@/components/blog/social-share";
import { Comments } from "@/components/blog/comments";

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
            authorBio: getString(fields.authorBio),
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
            <ReadingProgress />

            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-black/5 h-20">
                <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
                    <Link href="/" className="font-headline font-black text-xl tracking-tighter hover:text-primary transition-colors flex items-center gap-2 group">
                        <div className="p-2 rounded-lg bg-black text-white group-hover:bg-primary transition-colors">
                            <ArrowLeft className="h-4 w-4" />
                        </div>
                        <span className="hidden sm:inline">BACK</span>
                    </Link>
                    <Link href="/" className="font-headline font-black text-2xl tracking-tighter group">
                        THE COMMONS<span className="text-primary group-hover:animate-pulse">.</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <SocialShare title={post.title} />
                    </div>
                </div>
            </nav>

            <main className="pt-40 pb-32 px-6">
                <article className="max-w-4xl mx-auto">
                    {/* Header */}
                    <header className="mb-16 space-y-10">
                        <div className="flex flex-wrap items-center gap-6 text-xs font-bold uppercase tracking-widest">
                            <span className="px-4 py-2 rounded-full bg-primary/10 text-primary flex items-center gap-2">
                                <Sparkles className="h-3.5 w-3.5" /> {post.category}
                            </span>
                            <span className="flex items-center gap-2 text-muted-foreground bg-white px-4 py-2 rounded-full border border-border/40">
                                <Calendar className="h-3.5 w-3.5" /> {new Date(post.publishedAt || post.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                            </span>
                            <span className="flex items-center gap-2 text-muted-foreground bg-white px-4 py-2 rounded-full border border-border/40">
                                <Clock className="h-3.5 w-3.5" /> {post.readTime} min read
                            </span>
                        </div>

                        <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-black leading-[1.05] text-foreground tracking-tight animate-in fade-in slide-in-from-bottom-8 duration-700">
                            {post.title}
                        </h1>

                        <p className="text-xl md:text-2xl lg:text-3xl text-muted-foreground/80 font-medium leading-relaxed max-w-3xl animate-in fade-in slide-in-from-bottom-12 duration-700 delay-100 italic font-serif">
                            "{post.excerpt}"
                        </p>

                        <div className="flex items-center gap-5 pt-6 border-t border-border/40 animate-in fade-in slide-in-from-bottom-16 duration-700 delay-200">
                            <img src={post.author.avatar || "/placeholder-avatar.jpg"} alt={post.author.name} className="h-16 w-16 rounded-[1.25rem] object-cover bg-muted ring-4 ring-white shadow-lg" />
                            <div>
                                <div className="font-headline font-black text-xl uppercase tracking-tight">{post.author.name}</div>
                                <div className="text-xs font-bold text-primary uppercase tracking-widest">{post.author.role}</div>
                            </div>
                        </div>
                    </header>

                    {/* Featured Image */}
                    {post.coverImage && (post.coverImage.startsWith('http') || post.coverImage.startsWith('/')) ? (
                        <div className="relative aspect-[21/9] w-full rounded-[3rem] overflow-hidden shadow-2xl mb-20 group ring-1 ring-black/5">
                            <Image
                                src={post.coverImage}
                                alt={post.title}
                                fill
                                className="object-cover transition-transform duration-1000 group-hover:scale-105"
                                priority
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                        </div>
                    ) : (
                        <div className="relative aspect-[21/9] w-full rounded-[3rem] overflow-hidden shadow-sm mb-20 bg-muted flex items-center justify-center border border-border">
                            <span className="text-muted-foreground font-bold opacity-20 text-9xl uppercase">
                                {post.category?.charAt(0) || 'L'}
                            </span>
                        </div>
                    )}

                    {/* Content Section */}
                    <div className="relative">
                        {/* Sidebar Share (Desktop only) */}
                        <aside className="hidden xl:block absolute -left-24 top-0 h-full">
                            <div className="sticky top-40 flex flex-col gap-4">
                                <Link
                                    href="/"
                                    className="p-3 rounded-full bg-white border border-border hover:border-primary hover:text-primary transition-all shadow-sm flex items-center justify-center"
                                    title="Go Back"
                                >
                                    <ArrowLeft className="h-5 w-5" />
                                </Link>
                                <div className="h-20 w-px bg-border/40 mx-auto my-2" />
                                <SocialShare title={post.title} />
                            </div>
                        </aside>

                        <div className="bg-white p-8 md:p-16 rounded-[3rem] border border-border/40 shadow-sm relative z-10">
                            <MarkdownRenderer content={post.content} />
                        </div>
                    </div>

                    {/* Author Footer */}
                    <footer className="mt-20 p-10 rounded-[3rem] bg-black text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-32 bg-primary/20 blur-[100px] rounded-full -mr-32 -mt-32 transition-all duration-1000 group-hover:opacity-50" />
                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                            <img src={post.author.avatar || "/placeholder-avatar.jpg"} alt={post.author.name} className="h-32 w-32 rounded-[2rem] object-cover ring-4 ring-white/10 shrink-0" />
                            <div className="space-y-4 text-center md:text-left">
                                <div className="space-y-1">
                                    <h4 className="font-headline font-black text-3xl uppercase tracking-tight">WRITTEN BY {post.author.name}</h4>
                                    <p className="text-primary font-bold uppercase tracking-widest text-sm">{post.author.role}</p>
                                </div>
                                <p className="text-white/60 leading-relaxed font-medium text-lg italic">
                                    "{post.authorBio || `Passionate contributor at THE COMMONS, dedicated to sharing insights on ${post.category.toLowerCase()} and student living.`}"
                                </p>
                            </div>
                        </div>
                    </footer>

                    {/* Comments Section */}
                    <Comments postId={post.id} />

                </article>
            </main>
        </div>
    );
}
