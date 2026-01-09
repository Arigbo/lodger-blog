'use client';

import { notFound } from "next/navigation";
import { BlogPost } from "@/types";
import { Clock, Calendar, ArrowLeft, MessageSquare, Heart, BarChart2, Share2, MoreHorizontal } from "lucide-react";
import { MarkdownRenderer } from "@/lib/markdown-renderer";
import { CommentSection } from "@/components/blog/comment-section";
import { motion } from "framer-motion";
import { useState, useEffect, use } from "react";
import { blogService } from "@/lib/blog-service";
import { useAuth } from "@/components/providers/auth-provider";
import Link from "next/link";
import { formatDistanceToNow } from 'date-fns';
import { Button } from "@/components/ui/button";

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
            <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!post) {
        notFound();
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="pb-20"
        >
            {/* Top Bar (Mobile/Sticky) */}
            <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-border/40 px-4 py-3 flex items-center gap-4">
                <Link href="/home" className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <h2 className="font-bold text-lg truncate">Post</h2>
            </div>

            <article className="px-4 py-6">
                {/* Author Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex gap-3">
                        <Link href={`/u/${post.authorId}`} className="shrink-0">
                            <div className="h-12 w-12 rounded-full bg-muted overflow-hidden">
                                <img
                                    src={post.author?.avatar || '/placeholder-avatar.jpg'}
                                    alt={post.author?.name}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        </Link>
                        <div>
                            <Link href={`/u/${post.authorId}`} className="font-bold text-base hover:underline block leading-tight">
                                {post.author?.name}
                            </Link>
                            <div className="text-muted-foreground text-sm">
                                {/* @{post.author?.name.toLowerCase().replace(/\s/g, '')} */}
                                {post.author?.role}
                            </div>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 text-muted-foreground">
                        <MoreHorizontal className="h-5 w-5" />
                    </Button>
                </div>

                {/* Content */}
                <div className="space-y-6">
                    {/* Title as part of content flow, but styled distinctly */}
                    <div className="space-y-2">
                        <h1 className="font-serif font-black text-3xl sm:text-4xl leading-tight">
                            {post.title}
                        </h1>
                        <div className="text-muted-foreground text-sm flex items-center gap-2">
                            <span>{new Date(post.publishedAt || post.createdAt).toLocaleDateString(undefined, { hour: 'numeric', minute: 'numeric', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            <span>·</span>
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {post.readTime} min read</span>
                        </div>
                    </div>

                    {/* Excerpt/Lead */}
                    {post.excerpt && (
                        <p className="text-lg text-muted-foreground/80 font-medium leading-relaxed italic border-l-4 border-primary/20 pl-4 py-1">
                            {post.excerpt}
                        </p>
                    )}

                    {/* Featured Image */}
                    {post.coverImage && (
                        <div className="rounded-2xl overflow-hidden border border-border/40">
                            <img
                                src={post.coverImage}
                                alt={post.title}
                                className="w-full h-auto object-cover max-h-[600px]"
                            />
                        </div>
                    )}

                    {/* Markdown Body */}
                    <div className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:font-serif prose-p:leading-relaxed prose-slate">
                        <MarkdownRenderer content={post.content} />
                    </div>
                </div>

                {/* Metrics & Actions */}
                <div className="mt-8 py-4 border-t border-border/40">
                    <div className="flex items-center gap-6 text-sm text-muted-foreground font-medium mb-4 pb-4 border-b border-border/40">
                        <span className="flex items-center gap-1.5"><span className="font-bold text-foreground">{post.views || 0}</span> Views</span>
                        <span className="flex items-center gap-1.5"><span className="font-bold text-foreground">{post.likes?.length || 0}</span> Likes</span>
                        <span className="flex items-center gap-1.5"><span className="font-bold text-foreground">{post.commentCount || 0}</span> Comments</span>
                    </div>

                    <div className="flex items-center justify-between px-2">
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 rounded-full h-10 w-10">
                            <MessageSquare className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-green-500 hover:bg-green-500/10 rounded-full h-10 w-10">
                            <Share2 className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-pink-500 hover:bg-pink-500/10 rounded-full h-10 w-10">
                            <Heart className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                {/* Comments */}
                <div className="mt-4">
                    <CommentSection postId={post.id} user={user} />
                </div>
            </article>
        </motion.div>
    );
}
