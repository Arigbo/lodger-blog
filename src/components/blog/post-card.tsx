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
