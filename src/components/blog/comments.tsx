'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import {
    collection,
    addDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    serverTimestamp
} from 'firebase/firestore';
import { Comment } from '@/types';
import { Send, User as UserIcon, Loader2, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CommentsProps {
    postId: string;
}

export function Comments({ postId }: CommentsProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [authorName, setAuthorName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!postId) return;

        const q = query(
            collection(db, 'comments'),
            where('postId', '==', postId),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedComments = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate()?.toISOString() || new Date().toISOString()
            })) as Comment[];
            setComments(fetchedComments);
            setIsLoading(isLoading && false);
            setIsLoading(false);
        }, (error) => {
            console.error("Error listening to comments:", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [postId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            await addDoc(collection(db, 'comments'), {
                postId,
                authorName: authorName.trim() || 'Anonymous Reader',
                content: newComment.trim(),
                createdAt: serverTimestamp(),
            });
            setNewComment('');
        } catch (error) {
            console.error("Error adding comment:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="mt-20 pt-20 border-t border-border/40">
            <div className="flex items-center gap-3 mb-10">
                <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                    <MessageSquare className="h-6 w-6" />
                </div>
                <h2 className="font-headline text-3xl font-black uppercase tracking-tighter">
                    Comments <span className="text-muted-foreground ml-2 font-sans font-medium text-lg">({comments.length})</span>
                </h2>
            </div>

            {/* Comment Form */}
            <div className="bg-white p-8 rounded-[2rem] border border-border/40 shadow-sm mb-12">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Your Name</label>
                            <input
                                type="text"
                                value={authorName}
                                onChange={(e) => setAuthorName(e.target.value)}
                                placeholder="Anonymous Reader"
                                className="w-full px-6 py-4 rounded-xl bg-[#fafafa] border border-border/40 focus:border-primary/40 focus:ring-0 transition-all font-medium"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Your Thoughts</label>
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Join the conversation..."
                            rows={4}
                            className="w-full px-6 py-4 rounded-xl bg-[#fafafa] border border-border/40 focus:border-primary/40 focus:ring-0 transition-all font-medium resize-none shadow-inner"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isSubmitting || !newComment.trim()}
                        className="bg-primary text-primary-foreground font-bold px-8 py-4 rounded-xl flex items-center gap-2 hover:translate-y-[-2px] hover:shadow-lg transition-all disabled:opacity-50 disabled:translate-y-0"
                    >
                        {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                        Post Comment
                    </button>
                </form>
            </div>

            {/* Comments List */}
            <div className="space-y-8">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                        <Loader2 className="h-10 w-10 animate-spin mb-4" />
                        <p className="font-medium">Loading conversation...</p>
                    </div>
                ) : comments.length === 0 ? (
                    <div className="text-center py-20 px-6 rounded-[2rem] border border-dashed border-border/60">
                        <p className="text-muted-foreground font-medium italic">No comments yet. Be the first to start the conversation!</p>
                    </div>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="group flex gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="shrink-0 h-14 w-14 rounded-2xl bg-[#fafafa] border border-border/40 flex items-center justify-center text-muted-foreground group-hover:border-primary/20 group-hover:bg-primary/5 transition-all">
                                <UserIcon className="h-6 w-6" />
                            </div>
                            <div className="space-y-2 flex-1">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-bold text-lg">{comment.authorName}</h4>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                        {new Date(comment.createdAt).toLocaleDateString(undefined, {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </span>
                                </div>
                                <div className="bg-white p-6 rounded-2xl border border-border/40 shadow-sm leading-relaxed text-muted-foreground font-medium">
                                    {comment.content}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </section>
    );
}
