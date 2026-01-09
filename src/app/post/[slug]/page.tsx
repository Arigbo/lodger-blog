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
                            <img src={post.author?.avatar || "/placeholder-avatar.jpg"} alt={post.author?.name} className="h-20 w-20 rounded-[2rem] object-cover bg-muted ring-8 ring-white shadow-2xl" />
                            <div className="text-left">
                                <div className="font-headline font-black text-2xl uppercase tracking-tighter">{post.author?.name}</div>
                                <div className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{post.author?.role}</div>
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

                    {/* Content Section */}
                    <div className="relative">
                        {/* Sidebar Share (Desktop only) */}
                        <aside className="hidden xl:block absolute -left-48 top-0 h-full">
                            <div className="sticky top-40 flex flex-col gap-6 items-center">
                                <Link
                                    href="/"
                                    className="w-12 h-12 rounded-2xl bg-white border border-black/5 hover:border-black hover:bg-black hover:text-white transition-all shadow-xl flex items-center justify-center group"
                                    title="Back to Posts"
                                >
                                    <ArrowLeft className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" />
                                </Link>
                                <div className="h-24 w-px bg-black/5" />
                                <div className="p-2 bg-white rounded-3xl border border-black/5 shadow-xl flex flex-col gap-4">
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

                        <div className="bg-white p-10 md:p-20 rounded-[4rem] border border-black/5 shadow-2xl relative z-10 overflow-hidden">
                            <div className="absolute top-0 right-0 p-60 bg-primary/5 blur-[120px] rounded-full -mr-40 -mt-40" />
                            <div className="relative z-10 typography-premium">
                                <MarkdownRenderer content={post.content} />
                            </div>
                        </div>
                    </div>

                    {/* Interactions after content for mobile/tablet */}
                    <div className="mt-12 xl:hidden">
                        <SocialInteractions
                            postId={post.id}
                            userId={user?.uid}
                            initialLikes={post.likes}
                            initialDislikes={post.dislikes}
                            title={post.title}
                        />
                    </div>

                    {/* Author Footer */}
                    <footer className="mt-24 p-12 md:p-16 rounded-[4rem] bg-black text-white relative overflow-hidden group shadow-2xl">
                        <div className="absolute top-0 right-0 p-60 bg-primary/20 blur-[150px] rounded-full -mr-40 -mt-40 transition-all duration-1000 group-hover:opacity-70" />
                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-12 text-center md:text-left">
                            <img src={post.author?.avatar || "/placeholder-avatar.jpg"} alt={post.author?.name} className="h-40 w-40 rounded-[2.5rem] object-cover ring-8 ring-white/10 shrink-0" />
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <h4 className="font-headline font-black text-4xl uppercase tracking-tighter">ABOUT {post.author?.name}</h4>
                                    <div className="flex items-center justify-center md:justify-start gap-3">
                                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] bg-primary/10 px-4 py-2 rounded-full">{post.author?.role}</span>
                                    </div>
                                </div>
                                <p className="text-white/50 leading-relaxed font-medium text-xl italic max-w-2xl">
                                    "{post.authorBio || `Sharing perspectives on ${post.category.toLowerCase()}, technology, and the future of living.`}"
                                </p>
                            </div>
                        </div>
                    </footer>

                    {/* Comments Section */}
                    <CommentSection postId={post.id} user={user} />

                </motion.article>
            </main>

            <SiteFooter />
        </div>
    );
}
