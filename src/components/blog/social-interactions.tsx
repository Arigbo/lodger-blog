'use client';

import { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, Share2, AlertCircle, CheckCircle2, Loader2, Copy } from 'lucide-react';
import { blogService } from '@/lib/blog-service';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface SocialInteractionsProps {
    postId: string;
    userId?: string;
    initialLikes?: string[];
    initialDislikes?: string[];
    title: string;
}

export function SocialInteractions({
    postId,
    userId,
    initialLikes = [],
    initialDislikes = [],
    title
}: SocialInteractionsProps) {
    const [likes, setLikes] = useState<string[]>(initialLikes);
    const [dislikes, setDislikes] = useState<string[]>(initialDislikes);
    const [loading, setLoading] = useState<'like' | 'dislike' | 'report' | null>(null);
    const [showShareConfirm, setShowShareConfirm] = useState(false);
    const [hasReported, setHasReported] = useState(false);

    const hasLiked = userId ? likes.includes(userId) : false;
    const hasDisliked = userId ? dislikes.includes(userId) : false;

    const handleLike = async () => {
        if (!userId) {
            alert("Please sign in to interact with stories.");
            return;
        }
        if (loading) return;
        setLoading('like');
        try {
            await blogService.toggleLike(postId, userId, hasLiked);
            setLikes(prev => hasLiked
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
            );
            if (!hasLiked && hasDisliked) {
                setDislikes(prev => prev.filter(id => id !== userId));
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(null);
        }
    };

    const handleDislike = async () => {
        if (!userId) {
            alert("Please sign in to interact with stories.");
            return;
        }
        if (loading) return;
        setLoading('dislike');
        try {
            await blogService.toggleDislike(postId, userId, hasDisliked);
            setDislikes(prev => hasDisliked
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
            );
            if (!hasDisliked && hasLiked) {
                setLikes(prev => prev.filter(id => id !== userId));
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(null);
        }
    };

    const handleShare = async () => {
        const url = window.location.href;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Lodger Blog: ${title}`,
                    text: `Check out this story on Lodger Blog: ${title}`,
                    url
                });
            } catch (error) {
                console.log('Error sharing', error);
            }
        } else {
            // Fallback: Copy to clipboard
            navigator.clipboard.writeText(url);
            setShowShareConfirm(true);
            setTimeout(() => setShowShareConfirm(false), 2000);
        }
    };

    const handleReport = async () => {
        if (!userId) {
            alert("Please sign in to report stories.");
            return;
        }
        if (hasReported || loading) return;

        if (window.confirm("Are you sure you want to report this post for a content violation?")) {
            setLoading('report');
            try {
                await blogService.reportPost(postId, userId);
                setHasReported(true);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(null);
            }
        }
    };

    return (
        <div className="flex items-center gap-3 py-6 border-y border-black/5">
            <div className="flex items-center rounded-2xl bg-black/[0.03] p-1.5 ring-1 ring-black/5">
                <button
                    onClick={handleLike}
                    disabled={!!loading}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                        hasLiked
                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                            : "hover:bg-white text-muted-foreground hover:text-foreground"
                    )}
                >
                    {loading === 'like' ? <Loader2 className="h-4 w-4 animate-spin" /> : <ThumbsUp className={cn("h-4 w-4", hasLiked && "fill-current")} />}
                    <span>{likes.length}</span>
                </button>
                <div className="w-px h-4 bg-black/10 mx-1" />
                <button
                    onClick={handleDislike}
                    disabled={!!loading}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                        hasDisliked
                            ? "bg-black text-white shadow-lg shadow-black/20"
                            : "hover:bg-white text-muted-foreground hover:text-foreground"
                    )}
                >
                    {loading === 'dislike' ? <Loader2 className="h-4 w-4 animate-spin" /> : <ThumbsDown className={cn("h-4 w-4", hasDisliked && "fill-current")} />}
                    <span>{dislikes.length}</span>
                </button>
            </div>

            <div className="flex-1" />

            <div className="flex items-center gap-2">
                <div className="relative">
                    <button
                        onClick={handleShare}
                        className="p-3 rounded-2xl bg-black/[0.03] ring-1 ring-black/5 text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all"
                        title="Share story"
                    >
                        <Share2 className="h-5 w-5" />
                    </button>
                    <AnimatePresence>
                        {showShareConfirm && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                className="absolute bottom-full right-0 mb-3 whitespace-nowrap bg-black text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl shadow-xl flex items-center gap-2"
                            >
                                <CheckCircle2 className="h-3 w-3 text-primary" />
                                Link Copied
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <button
                    onClick={handleReport}
                    disabled={hasReported || loading === 'report'}
                    className={cn(
                        "p-3 rounded-2xl bg-black/[0.03] ring-1 ring-black/5 transition-all",
                        hasReported
                            ? "text-destructive bg-destructive/5 ring-destructive/20"
                            : "text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                    )}
                    title="Report story"
                >
                    {loading === 'report' ? <Loader2 className="h-5 w-5 animate-spin" /> : <AlertCircle className="h-5 w-5" />}
                </button>
            </div>
        </div>
    );
}
