import Link from 'next/link';
import { BlogPost } from '@/types';
import { cn } from '@/lib/utils';
import { Clock, ArrowRight, MessageSquare, Heart, BarChart2, Share2, MoreHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { useState } from 'react';
import { blogService } from '@/lib/blog-service';
import { useAuth } from '@/components/providers/auth-provider';

interface PostCardProps {
    post: BlogPost;
    index?: number;
    layout?: 'full' | 'standard';
    variant?: 'card' | 'feed';
}

export function PostCard({ post, index = 0, layout = 'standard', variant = 'card' }: PostCardProps) {
    const { user, openAuthModal } = useAuth();
    const [likes, setLikes] = useState<string[]>(post.likes || []);
    const [hasLiked, setHasLiked] = useState(user ? post.likes?.includes(user.uid) : false);
    const isFull = layout === 'full';

    const handleLike = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            openAuthModal('signup');
            return;
        }

        const newHasLiked = !hasLiked;
        setHasLiked(newHasLiked);
        setLikes(prev => newHasLiked ? [...prev, user.uid] : prev.filter(id => id !== user.uid));

        try {
            await blogService.toggleLike(post.id, user.uid, !newHasLiked);
        } catch (error) {
            console.error("Error toggling like:", error);
            // Rollback
            setHasLiked(!newHasLiked);
            setLikes(prev => !newHasLiked ? [...prev, user.uid] : prev.filter(id => id !== user.uid));
        }
    };

    if (variant === 'feed') {
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                viewport={{ once: true }}
                className="border-b border-border/40 hover:bg-black/[0.02] transition-colors cursor-pointer block"
            >
                <Link href={`/post/${post.slug}`} className="block px-4 py-3">
                    <div className="flex gap-3">
                        {/* Avatar */}
                        <div className="shrink-0">
                            <div className="h-10 w-10 rounded-full bg-muted overflow-hidden">
                                <img
                                    src={post.author?.avatar || '/placeholder-avatar.jpg'}
                                    alt={post.author?.name}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            {/* Header */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5 min-w-0 text-[15px]">
                                    <span className="font-bold truncate text-foreground">{post.author?.name}</span>
                                    {/* <span className="text-muted-foreground truncate hidden sm:block">@{post.author?.name.toLowerCase().replace(/\s/g, '')}</span> */}
                                    <span className="text-muted-foreground shrink-0">·</span>
                                    <span className="text-muted-foreground shrink-0 hover:underline">
                                        {(() => {
                                            if (!post.publishedAt) return 'Draft';
                                            const date = new Date(post.publishedAt);
                                            if (isNaN(date.getTime())) return 'Recently';
                                            return formatDistanceToNow(date, { addSuffix: false }).replace('about ', '');
                                        })()}
                                    </span>
                                </div>
                                <button className="p-1.5 rounded-full text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors -mr-2">
                                    <MoreHorizontal className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Text */}
                            <div className="mt-0.5 text-[15px] leading-normal text-foreground break-words [&_p]:mb-2 [&_img]:rounded-xl [&_img]:max-h-[300px] [&_img]:w-full [&_img]:object-cover [&_a]:text-primary [&_a]:underline">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {post.excerpt || post.title}
                                </ReactMarkdown>
                            </div>

                            {/* Image (if exists) */}
                            {post.coverImage && (
                                <div className="mt-3 rounded-2xl overflow-hidden border border-border/40 max-h-[500px]">
                                    <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
                                </div>
                            )}

                            {/* Actions Bar */}
                            <div className="flex items-center justify-between mt-3 max-w-[425px] text-muted-foreground">
                                <div className="flex items-center gap-1 group">
                                    <div className="p-2 rounded-full group-hover:bg-blue-500/10 group-hover:text-blue-500 transition-colors">
                                        <MessageSquare className="h-4.5 w-4.5" />
                                    </div>
                                    <span className="text-xs group-hover:text-blue-500 transition-colors">{post.commentCount || 0}</span>
                                </div>

                                <div className="flex items-center gap-1 group">
                                    <div className="p-2 rounded-full group-hover:bg-green-500/10 group-hover:text-green-500 transition-colors">
                                        <Share2 className="h-4.5 w-4.5" />
                                    </div>
                                    {/* <span className="text-xs group-hover:text-green-500 transition-colors">0</span> */}
                                </div>

                                <div className="flex items-center gap-1 group">
                                    <button
                                        onClick={handleLike}
                                        className={cn(
                                            "p-2 rounded-full transition-colors",
                                            hasLiked
                                                ? "text-pink-500 bg-pink-500/10"
                                                : "group-hover:bg-pink-500/10 group-hover:text-pink-500"
                                        )}
                                    >
                                        <Heart className={cn("h-4.5 w-4.5", hasLiked && "fill-current")} />
                                    </button>
                                    <span className={cn("text-xs transition-colors", hasLiked && "text-pink-500")}>
                                        {likes.length}
                                    </span>
                                </div>

                                <div className="flex items-center gap-1 group">
                                    <div className="p-2 rounded-full group-hover:bg-blue-500/10 group-hover:text-blue-500 transition-colors">
                                        <BarChart2 className="h-4.5 w-4.5" />
                                    </div>
                                    <span className="text-xs group-hover:text-blue-500 transition-colors">{post.views || 0}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </Link>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            viewport={{ once: true }}
            className={cn(
                "group relative",
                isFull ? "md:col-span-2" : ""
            )}
        >
            <Link
                href={`/post/${post.slug}`}
                className="block h-full group bg-white rounded-[3rem] overflow-hidden border border-black/5 hover:border-black/10 hover:shadow-2xl hover:shadow-black/5 transition-all duration-700"
            >
                <div className={cn(
                    "relative overflow-hidden",
                    isFull ? "aspect-[21/9]" : "aspect-[16/11]"
                )}>
                    <img
                        src={post.coverImage || '/placeholder-post.jpg'}
                        alt={post.title}
                        className="w-full h-full object-cover transform transition-transform duration-1000 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <div className="absolute top-6 left-6">
                        <span className="px-5 py-2 rounded-full bg-white/95 backdrop-blur-md text-[9px] font-black uppercase tracking-[0.2em] text-primary shadow-xl ring-1 ring-black/5">
                            {post.category}
                        </span>
                    </div>
                </div>

                <div className="p-10 flex flex-col h-[calc(100%-aspect-ratio)]">
                    <div className="space-y-4 flex-grow">
                        <h3 className={cn(
                            "font-serif font-black leading-[1.1] group-hover:text-primary transition-colors tracking-tight",
                            isFull ? "text-4xl md:text-5xl" : "text-3xl"
                        )}>
                            {post.title}
                        </h3>
                        <p className="text-muted-foreground/80 font-medium leading-relaxed line-clamp-2 italic">
                            "{post.excerpt}"
                        </p>
                    </div>

                    <div className="flex items-center justify-between pt-10 mt-10 border-t border-black/5">
                        <div className="flex items-center gap-4">
                            <img
                                src={post.author?.avatar || '/placeholder-avatar.jpg'}
                                alt={post.author?.name}
                                className="h-12 w-12 rounded-2xl object-cover ring-4 ring-white shadow-md"
                            />
                            <div>
                                <div className="font-black text-xs uppercase tracking-widest text-foreground">{post.author?.name}</div>
                                <div className="text-[10px] text-primary font-bold uppercase tracking-widest mt-0.5">{post.author?.role}</div>
                            </div>
                        </div>
                        <div className="p-3 rounded-full bg-black/5 group-hover:bg-primary group-hover:text-white transition-all transform group-hover:translate-x-1">
                            <ArrowRight className="h-4 w-4" />
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
