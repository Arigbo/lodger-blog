'use client';

import { notFound } from "next/navigation";
import { BlogPost } from "@/types";
import { Clock, Calendar, Sparkles, ArrowLeft } from "lucide-react";
import { MarkdownRenderer } from "@/lib/markdown-renderer";
import { ReadingProgress } from "@/components/blog/reading-progress";
import { SocialInteractions } from "@/components/blog/social-interactions";
import { CommentSection } from "@/components/blog/comment-section";
import { motion } from "framer-motion";
import { useState, useEffect, use } from "react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { blogService } from "@/lib/blog-service";
import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";
import Link from "next/link";

export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const { user } = useAuth();
    const [post, setPost] = useState<BlogPost | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        blogService.getPostBySlug(slug).then(res => {
            setPost(res);
            setLoading(false);
        });
    }, [slug]);

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
            <SiteHeader />

            <main className="pt-40 pb-32 px-6">
                <motion.article
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "circOut" }}
                    className="max-w-4xl mx-auto"
                >
                    {/* Header */}
                    <header className="mb-24 space-y-12 text-center relative">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-20 p-40 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="flex flex-wrap items-center justify-center gap-6 text-[10px] font-black uppercase tracking-[0.2em] relative z-10"
                        >
                            <span className="px-6 py-2.5 rounded-full bg-primary text-white flex items-center gap-2 shadow-xl shadow-primary/20">
                                <Sparkles className="h-3.5 w-3.5" /> {post.category}
                            </span>
                            <span className="flex items-center gap-2 text-muted-foreground bg-white px-6 py-2.5 rounded-full border border-black/5 shadow-sm">
                                <Calendar className="h-3.5 w-3.5" /> {new Date(post.publishedAt || post.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                            </span>
                            <span className="flex items-center gap-2 text-muted-foreground bg-white px-6 py-2.5 rounded-full border border-black/5 shadow-sm">
                                <Clock className="h-3.5 w-3.5" /> {post.readTime} MIN READ
                            </span>
                        </motion.div>

                        <h1 className="font-serif text-6xl md:text-8xl lg:text-9xl font-black leading-[0.9] text-foreground tracking-tight max-w-5xl mx-auto relative z-10">
                            {post.title}
                        </h1>

                        <p className="text-xl md:text-3xl lg:text-4xl text-muted-foreground/60 font-medium leading-relaxed max-w-3xl mx-auto italic font-serif border-x-4 border-primary/10 px-12 relative z-10">
                            "{post.excerpt}"
                        </p>

                        <div className="flex items-center justify-center gap-6 pt-16 border-t border-black/5 relative z-10">
                            <img src={post.author?.avatar || "/placeholder-avatar.jpg"} alt={post.author?.name} className="h-24 w-24 rounded-[2.5rem] object-cover bg-muted ring-8 ring-white shadow-2xl" />
                            <div className="text-left">
                                <div className="font-serif font-black text-3xl tracking-tight">{post.author?.name}</div>
                                <div className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mt-1">{post.author?.role}</div>
                            </div>
                        </div>
                    </header>

                    {/* Featured Image */}
                    {post.coverImage && (post.coverImage.startsWith('http') || post.coverImage.startsWith('/')) ? (
                        <div className="relative aspect-[21/10] w-full rounded-[4rem] overflow-hidden shadow-2xl mb-24 group ring-1 ring-black/5">
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
                        <div className="relative aspect-[21/10] w-full rounded-[4rem] overflow-hidden shadow-sm mb-24 bg-white flex items-center justify-center border border-black/5">
                            <Sparkles className="h-24 w-24 text-black/5 animate-pulse" />
                        </div>
                    )}

                    {/* Content Section */}
                    <div className="relative">
                        {/* Sidebar Share (Desktop only) */}
                        <aside className="hidden xl:block absolute -left-56 top-0 h-full">
                            <div className="sticky top-40 flex flex-col gap-8 items-center">
                                <Link
                                    href="/"
                                    className="w-14 h-14 rounded-[1.5rem] bg-white border border-black/5 hover:border-black hover:bg-black hover:text-white transition-all shadow-xl flex items-center justify-center group"
                                    title="Back to Stories"
                                >
                                    <ArrowLeft className="h-6 w-6 transform group-hover:-translate-x-1 transition-transform" />
                                </Link>
                                <div className="h-32 w-px bg-black/10" />
                                <div className="p-3 bg-white rounded-[2rem] border border-black/5 shadow-2xl flex flex-col gap-6">
                                    <SocialInteractions
                                        postId={post.id}
                                        userId={user?.uid}
                                        initialLikes={post.likes}
                                        initialDislikes={post.dislikes}
                                        title={post.title}
                                    />
                                </div>
                            </div>
                        </aside>

                        <div className="bg-white p-12 md:p-24 rounded-[4rem] border border-black/5 shadow-2xl relative z-10 overflow-hidden">
                            <div className="absolute top-0 right-0 p-60 bg-primary/5 blur-[120px] rounded-full -mr-40 -mt-40" />
                            <div className="relative z-10 typography-premium selection:bg-primary/20">
                                <MarkdownRenderer content={post.content} />
                            </div>
                        </div>
                    </div>

                    {/* Interactions after content for mobile/tablet */}
                    <div className="mt-16 xl:hidden px-8 py-10 bg-white rounded-[3rem] border border-black/5 shadow-xl">
                        <SocialInteractions
                            postId={post.id}
                            userId={user?.uid}
                            initialLikes={post.likes}
                            initialDislikes={post.dislikes}
                            title={post.title}
                        />
                    </div>

                    {/* Author Footer */}
                    <footer className="mt-32 p-16 md:p-24 rounded-[4rem] bg-black text-white relative overflow-hidden group shadow-2xl">
                        <div className="absolute top-0 right-0 p-80 bg-primary/20 blur-[180px] rounded-full -mr-60 -mt-60 transition-all duration-1000 group-hover:opacity-100 opacity-60" />
                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-16 text-center md:text-left">
                            <div className="relative shrink-0">
                                <img src={post.author?.avatar || "/placeholder-avatar.jpg"} alt={post.author?.name} className="h-48 w-48 rounded-[3rem] object-cover ring-8 ring-white/10" />
                                <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-2xl ring-4 ring-black">
                                    <Sparkles className="h-6 w-6 text-white" />
                                </div>
                            </div>
                            <div className="space-y-8 flex-1">
                                <div className="space-y-3">
                                    <h4 className="font-serif font-black text-5xl tracking-tight">Written by {post.author?.name}</h4>
                                    <div className="flex items-center justify-center md:justify-start gap-4">
                                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] bg-primary/10 px-6 py-2.5 rounded-full border border-primary/20">{post.author?.role}</span>
                                    </div>
                                </div>
                                <p className="text-white/60 leading-relaxed font-medium text-2xl italic max-w-2xl font-serif">
                                    "{post.authorBio || `A dedicated contributor sharing unique perspectives on ${post.category.toLowerCase()} and the evolving landscape of modern living.`}"
                                </p>
                            </div>
                        </div>
                    </footer>

                    {/* Comments Section */}
                    <div className="mt-32">
                        <CommentSection postId={post.id} user={user} />
                    </div>

                </motion.article>
            </main>

            <SiteFooter />
        </div>
    );
}
