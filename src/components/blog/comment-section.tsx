'use client';

import { useState, useEffect } from 'react';
import { blogService } from '@/lib/blog-service';
import { Comment } from '@/types';
import { MessageSquare, Send, Loader2, User, Clock, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

import { useAuth } from '@/components/providers/auth-provider';

interface CommentSectionProps {
    postId: string;
    user?: any; // We can use the user from context instead or keep it as prop
}

export function CommentSection({ postId }: CommentSectionProps) {
    const { user, openAuthModal } = useAuth();
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (postId) {
            fetchComments();
        }
    }, [postId]);

    const fetchComments = async () => {
        try {
            const data = await blogService.getComments(postId);
            setComments(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            openAuthModal('signup');
            return;
        }
        if (!newComment.trim() || submitting) return;

        setSubmitting(true);
        setError(null);
        try {
            const commentData = {
                authorId: user.uid,
                authorName: user.displayName || user.email?.split('@')[0] || 'Unkown Reader',
                authorAvatar: user.photoURL || '',
                content: newComment.trim()
            };

            await blogService.addComment(postId, commentData);

            // Optimistic update or just refetch
            setNewComment('');
            fetchComments();
        } catch (err) {
            console.error(err);
            setError("Failed to post comment. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section className="mt-20 space-y-12">
            <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-[1.5rem] bg-primary/10 flex items-center justify-center text-primary">
                    <MessageSquare className="h-7 w-7" />
                </div>
                <h2 className="font-headline text-4xl font-black uppercase tracking-tight">
                    The Conversation <span className="text-muted-foreground/30 ml-2">{comments.length}</span>
                </h2>
            </div>

            {/* Comment Form */}
            <form id="comment-form" onSubmit={handleSubmit} className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 to-primary/0 rounded-[2.5rem] blur opacity-25 group-focus-within:opacity-100 transition duration-1000 group-focus-within:duration-200"></div>
                <div className="relative bg-white rounded-[2.2rem] border border-black/5 p-4 shadow-sm">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder={user ? "Share your thoughts..." : "Sign in to join the conversation..."}
                        className="w-full min-h-[120px] bg-transparent border-none focus:ring-0 p-4 font-medium italic text-lg resize-none placeholder:text-muted-foreground/20"
                        disabled={!user || submitting}
                    />
                    <div className="flex items-center justify-between mt-2 pt-4 border-t border-black/[0.03]">
                        <div className="flex items-center gap-3 px-4">
                            {user ? (
                                <div className="flex items-center gap-2">
                                    <div className="h-6 w-6 rounded-full bg-slate-100 overflow-hidden ring-2 ring-white">
                                        <img src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} className="h-full w-full object-cover" alt="" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{user.displayName || 'Me'}</span>
                                </div>
                            ) : (
                                <span className="text-[10px] font-black uppercase tracking-widest text-destructive flex items-center gap-1">
                                    <ShieldAlert className="h-3 w-3" /> Anonymous Mode
                                </span>
                            )}
                        </div>
                        <button
                            type="submit"
                            disabled={!user || !newComment.trim() || submitting}
                            className={cn(
                                "flex items-center gap-2 px-8 py-3 rounded-[1.2rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all",
                                !user || !newComment.trim() || submitting
                                    ? "bg-slate-50 text-slate-300 cursor-not-allowed"
                                    : "bg-black text-white hover:bg-primary shadow-lg shadow-black/10 hover:shadow-primary/20 hover:scale-[1.02]"
                            )}
                        >
                            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            Send Note
                        </button>
                    </div>
                </div>
            </form>

            {/* Comments List */}
            <div className="space-y-8">
                {loading ? (
                    <div className="flex flex-col items-center py-12 gap-4">
                        <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Gathering Notes</span>
                    </div>
                ) : comments.length > 0 ? (
                    <div className="grid gap-6">
                        {comments.map((comment, idx) => (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                key={comment.id}
                                className="p-8 bg-white rounded-[2rem] border border-black/[0.03] shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-1 h-full bg-black/5 group-hover:bg-primary transition-colors" />
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-2xl bg-slate-100 overflow-hidden ring-1 ring-black/5">
                                                <img
                                                    src={comment.authorAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.authorId}`}
                                                    className="h-full w-full object-cover"
                                                    alt=""
                                                />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-sm tracking-tight">{comment.authorName}</span>
                                                <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">
                                                    <Clock className="h-3 w-3" />
                                                    {new Date(comment.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="font-medium text-muted-foreground leading-relaxed italic">
                                        "{comment.content}"
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-black/[0.02] rounded-[3rem] border border-dashed border-black/5">
                        <p className="font-headline font-black uppercase tracking-[0.2em] text-muted-foreground/40 text-sm">Quiet for now. Be the first to speak.</p>
                    </div>
                )}
            </div>
        </section>
    );
}
