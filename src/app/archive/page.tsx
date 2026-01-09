'use client';

import Link from 'next/link';
import { BlogPost } from '@/types';
import { Calendar, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import { blogService } from '@/lib/blog-service';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { motion } from 'framer-motion';

export default function ArchivePage() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        blogService.getPublishedPosts().then(res => {
            setPosts(res);
            setLoading(false);
        });
    }, []);

    // Group posts by month/year
    const groupedPosts = posts.reduce((acc, post) => {
        const date = new Date(post.publishedAt || post.createdAt);
        const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

        if (!acc[monthYear]) {
            acc[monthYear] = [];
        }
        acc[monthYear].push(post);
        return acc;
    }, {} as Record<string, BlogPost[]>);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fafafa]">
            <SiteHeader />

            {/* Header */}
            <section className="pt-48 pb-12 px-6">
                <div className="max-w-4xl mx-auto text-center space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest ring-1 ring-primary/20"
                    >
                        <Calendar className="h-3 w-3" /> Time Travel
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="font-headline text-6xl md:text-8xl font-black uppercase tracking-tighter"
                    >
                        Previous Posts
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-muted-foreground/60 font-medium italic"
                    >
                        Every story we've published, organized for your reading pleasure.
                    </motion.p>
                </div>
            </section>

            {/* Archive List */}
            <section className="py-24 px-6 pb-40">
                <div className="max-w-4xl mx-auto space-y-24">
                    {Object.keys(groupedPosts).length > 0 ? (
                        Object.entries(groupedPosts).map(([monthYear, monthPosts], sectionIdx) => (
                            <motion.div
                                key={monthYear}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: sectionIdx * 0.1 }}
                                className="space-y-12"
                            >
                                <div className="flex items-center gap-8">
                                    <h2 className="font-headline text-4xl font-black uppercase tracking-tight shrink-0">
                                        {monthYear}
                                    </h2>
                                    <div className="h-px flex-1 bg-black/5" />
                                </div>

                                <div className="grid grid-cols-1 gap-8">
                                    {monthPosts.map((post) => (
                                        <Link
                                            key={post.id}
                                            href={`/post/${post.slug}`}
                                            className="group block p-8 bg-white rounded-[2.5rem] border border-black/5 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500"
                                        >
                                            <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
                                                {post.coverImage && (
                                                    <div className="w-full md:w-40 h-40 rounded-[2rem] overflow-hidden flex-shrink-0 shadow-inner ring-1 ring-black/5">
                                                        <img
                                                            src={post.coverImage}
                                                            alt={post.title}
                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                        />
                                                    </div>
                                                )}
                                                <div className="flex-1 space-y-4">
                                                    <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                                                        <span className="text-primary bg-primary/10 px-3 py-1 rounded-full ring-1 ring-primary/20">{post.category}</span>
                                                        <span>•</span>
                                                        <span>{post.readTime} MIN READ</span>
                                                    </div>
                                                    <h3 className="font-serif text-3xl font-black leading-tight group-hover:text-primary transition-colors tracking-tight">
                                                        {post.title}
                                                    </h3>
                                                    <p className="text-muted-foreground/80 font-medium line-clamp-2 italic leading-relaxed">
                                                        "{post.excerpt}"
                                                    </p>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="text-center py-40 bg-white rounded-[4rem] border border-dashed border-black/5">
                            <Sparkles className="h-12 w-12 text-black/5 mx-auto mb-4" />
                            <p className="text-muted-foreground font-headline font-black uppercase tracking-widest">The archive is currently empty</p>
                        </div>
                    )}
                </div>
            </section>

            <SiteFooter />
        </div>
    );
}
