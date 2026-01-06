'use client';

import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { BlogPost } from "@/types";
import { ArrowLeft, Clock, Calendar, Tag, Share2, Sparkles, LayoutDashboard, ChevronLeft } from "lucide-react";
import { MarkdownRenderer } from "@/lib/markdown-renderer";
import { ReadingProgress } from "@/components/blog/reading-progress";
import { SocialShare } from "@/components/blog/social-share";
import { Comments } from "@/components/blog/comments";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { SiteHeaderAuth } from "@/components/layout/site-header-auth";

// Helper to fetch from Firestore REST API
async function fetchFirestore(collection: string) {
    const projectId = "studio-2267792175-c3d0d";
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collection}`;

    const res = await fetch(url + "?pageSize=100", { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
}

async function getPostData(slug: string): Promise<BlogPost | null> {
    try {
        const data = await fetchFirestore("posts");
        if (!data || !data.documents) return null;

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

export default function BlogPostPage({ params }: { params: any }) {
    const [post, setPost] = useState<BlogPost | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        params.then((p: any) => {
            getPostData(p.slug).then(res => {
                setPost(res);
                setLoading(false);
            });
        });
    }, [params]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    if (!post) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-[#fafafa]">
            <ReadingProgress />

            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-black/5 h-20">
                <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
                    <Link href="/" className="font-headline font-black text-xs tracking-[0.2em] hover:text-primary transition-all flex items-center gap-3 group">
                        <div className="p-2.5 rounded-xl bg-black text-white group-hover:bg-primary transition-colors">
                            <ChevronLeft className="h-4 w-4" />
                        </div>
                        <span className="hidden sm:inline">BACK DISPATCH</span>
                    </Link>
                    <Link href="/" className="font-headline font-black text-2xl tracking-tighter group hidden md:flex items-center gap-2">
                        <div className="w-8 h-8 bg-black rounded-lg group-hover:bg-primary transition-colors flex items-center justify-center">
                            <Sparkles className="h-4 w-4 text-white" />
                        </div>
                        <span>THE COMMONS<span className="text-primary group-hover:animate-pulse">.</span></span>
                    </Link>
                    <div className="flex items-center gap-6">
                        <SocialShare title={post.title} />
                        <SiteHeaderAuth />
                    </div>
                </div>
            </nav>

            <main className="pt-40 pb-32 px-6">
                <motion.article
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "circOut" }}
                    className="max-w-4xl mx-auto"
                >
                    {/* Header */}
                    <header className="mb-20 space-y-12 text-center">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="flex flex-wrap items-center justify-center gap-6 text-[10px] font-black uppercase tracking-[0.2em]"
                        >
                            <span className="px-6 py-2.5 rounded-full bg-primary/10 text-primary flex items-center gap-2 ring-1 ring-primary/20">
                                <Sparkles className="h-3.5 w-3.5" /> {post.category}
                            </span>
                            <span className="flex items-center gap-2 text-muted-foreground bg-white px-6 py-2.5 rounded-full border border-black/5 shadow-sm">
                                <Calendar className="h-3.5 w-3.5" /> {new Date(post.publishedAt || post.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                            </span>
                            <span className="flex items-center gap-2 text-muted-foreground bg-white px-6 py-2.5 rounded-full border border-black/5 shadow-sm">
                                <Clock className="h-3.5 w-3.5" /> {post.readTime} MIN READ
                            </span>
                        </motion.div>

                        <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-black leading-[0.95] text-foreground tracking-tight max-w-5xl mx-auto">
                            {post.title}
                        </h1>

                        <p className="text-xl md:text-2xl lg:text-3xl text-muted-foreground/60 font-medium leading-relaxed max-w-3xl mx-auto italic font-serif border-x-2 border-primary/10 px-10">
                            "{post.excerpt}"
                        </p>

                        <div className="flex items-center justify-center gap-5 pt-12 border-t border-black/5">
                            <img src={post.author.avatar || "/placeholder-avatar.jpg"} alt={post.author.name} className="h-20 w-20 rounded-[2rem] object-cover bg-muted ring-8 ring-white shadow-2xl" />
                            <div className="text-left">
                                <div className="font-headline font-black text-2xl uppercase tracking-tighter">{post.author.name}</div>
                                <div className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{post.author.role}</div>
                            </div>
                        </div>
                    </header>

                    {/* Featured Image */}
                    {post.coverImage && (post.coverImage.startsWith('http') || post.coverImage.startsWith('/')) ? (
                        <div className="relative aspect-[21/9] w-full rounded-[4rem] overflow-hidden shadow-2xl mb-24 group ring-1 ring-black/5">
                            <Image
                                src={post.coverImage}
                                alt={post.title}
                                fill
                                className="object-cover transition-transform duration-1000 group-hover:scale-105"
                                priority
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
                        </div>
                    ) : (
                        <div className="relative aspect-[21/9] w-full rounded-[4rem] overflow-hidden shadow-sm mb-24 bg-white flex items-center justify-center border border-black/5">
                            <Sparkles className="h-20 w-20 text-black/5 animate-pulse" />
                        </div>
                    )}

                    {/* Content Section Section */}
                    <div className="relative">
                        {/* Sidebar Share (Desktop only) */}
                        <aside className="hidden xl:block absolute -left-32 top-0 h-full">
                            <div className="sticky top-40 flex flex-col gap-6 items-center">
                                <Link
                                    href="/"
                                    className="w-12 h-12 rounded-2xl bg-white border border-black/5 hover:border-black hover:bg-black hover:text-white transition-all shadow-xl flex items-center justify-center group"
                                    title="Go Back"
                                >
                                    <ArrowLeft className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" />
                                </Link>
                                <div className="h-24 w-px bg-black/5" />
                                <div className="p-4 bg-white rounded-3xl border border-black/5 shadow-xl space-y-4">
                                    <SocialShare title={post.title} />
                                </div>
                            </div>
                        </aside>

                        <div className="bg-white p-10 md:p-20 rounded-[4rem] border border-black/5 shadow-2xl relative z-10 overflow-hidden">
                            <div className="absolute top-0 right-0 p-60 bg-primary/5 blur-[120px] rounded-full -mr-40 -mt-40" />
                            <div className="relative z-10">
                                <MarkdownRenderer content={post.content} />
                            </div>
                        </div>
                    </div>

                    {/* Author Footer */}
                    <footer className="mt-24 p-12 md:p-16 rounded-[4rem] bg-black text-white relative overflow-hidden group shadow-2xl">
                        <div className="absolute top-0 right-0 p-60 bg-primary/20 blur-[150px] rounded-full -mr-40 -mt-40 transition-all duration-1000 group-hover:opacity-70" />
                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-12 text-center md:text-left">
                            <img src={post.author.avatar || "/placeholder-avatar.jpg"} alt={post.author.name} className="h-40 w-40 rounded-[2.5rem] object-cover ring-8 ring-white/10 shrink-0" />
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <h4 className="font-headline font-black text-4xl uppercase tracking-tighter">DISPATCH FROM {post.author.name}</h4>
                                    <div className="flex items-center justify-center md:justify-start gap-3">
                                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] bg-primary/10 px-4 py-2 rounded-full">THE COMMONS {post.author.role}</span>
                                    </div>
                                </div>
                                <p className="text-white/50 leading-relaxed font-medium text-xl italic max-w-2xl">
                                    "{post.authorBio || `A voice for the modern community. Sharing perspectives on ${post.category.toLowerCase()}, technology, and the future of living.`}"
                                </p>
                            </div>
                        </div>
                    </footer>

                    {/* Comments Section */}
                    <div className="mt-24">
                        <Comments postId={post.id} />
                    </div>

                </motion.article>
            </main>
        </div>
    );
}
