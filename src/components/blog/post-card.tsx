'use client';

import Link from 'next/link';
import { BlogPost } from '@/types';
import { cn } from '@/lib/utils';
import { Clock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface PostCardProps {
    post: BlogPost;
    index?: number;
    layout?: 'full' | 'standard';
}

export function PostCard({ post, index = 0, layout = 'standard' }: PostCardProps) {
    const isFull = layout === 'full';

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
                className="block h-full bg-white rounded-[2.5rem] border border-border/40 overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
            >
                <div className={cn(
                    "relative overflow-hidden",
                    isFull ? "aspect-[21/9]" : "aspect-[16/10]"
                )}>
                    <img
                        src={post.coverImage || '/placeholder-post.jpg'}
                        alt={post.title}
                        className="w-full h-full object-cover transform transition-transform duration-1000 group-hover:scale-110"
                    />
                    <div className="absolute top-6 left-6">
                        <span className="px-4 py-2 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-black uppercase tracking-widest text-primary shadow-lg ring-1 ring-black/5">
                            {post.category}
                        </span>
                    </div>
                </div>
                <div className="p-8 md:p-10 space-y-6">
                    <h3 className={cn(
                        "font-serif font-black leading-tight group-hover:text-primary transition-colors tracking-tight",
                        isFull ? "text-4xl md:text-5xl" : "text-3xl"
                    )}>
                        {post.title}
                    </h3>
                    <p className="text-muted-foreground font-medium leading-relaxed line-clamp-2 md:line-clamp-3">
                        {post.excerpt}
                    </p>
                    <div className="flex items-center gap-4 pt-4 border-t border-border/40">
                        <img
                            src={post.author?.avatar || '/placeholder-avatar.jpg'}
                            alt={post.author?.name}
                            className="h-10 w-10 rounded-2xl object-cover bg-muted"
                        />
                        <div className="flex-1">
                            <div className="font-black text-sm uppercase tracking-tight">{post.author?.name}</div>
                            <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{post.author?.role}</div>
                        </div>
                        <div className="hidden sm:block text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">
                            {post.readTime} MIN READ
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
