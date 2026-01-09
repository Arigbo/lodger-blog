'use client';

import Link from 'next/link';
import { BlogPost } from '@/types';
import { ArrowLeft, Sparkles, Filter } from 'lucide-react';
import { notFound, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { blogService } from '@/lib/blog-service';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { PostCard } from '@/components/blog/post-card';
import { motion } from 'framer-motion';

const VALID_CATEGORIES = ['design', 'culture', 'guides', 'announcement', 'education'];

export default function CategoryPage() {
    const params = useParams();
    const slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug || '';

    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (slug) {
            blogService.getPublishedPosts().then(allPosts => {
                const filtered = allPosts.filter(p => p.category.toLowerCase() === slug.toLowerCase());
                setPosts(filtered);
                setLoading(false);
            });
        }
    }, [slug]);

    if (!VALID_CATEGORIES.includes(slug.toLowerCase())) {
        notFound();
    }

    const categoryName = slug.charAt(0).toUpperCase() + slug.slice(1);

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
                <div className="max-w-7xl mx-auto text-center space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest ring-1 ring-primary/20"
                    >
                        <Filter className="h-3 w-3" /> Exploring Topic
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="font-headline text-6xl md:text-8xl font-black uppercase tracking-tighter"
                    >
                        {categoryName}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-muted-foreground/60 font-medium italic max-w-2xl mx-auto"
                    >
                        In-depth perspectives on {categoryName.toLowerCase()} within the modern community.
                    </motion.p>
                </div>
            </section>

            {/* Posts Grid */}
            <section className="py-24 px-6 pb-40">
                <div className="max-w-7xl mx-auto">
                    {posts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            {posts.map((post, idx) => (
                                <PostCard key={post.id} post={post} index={idx} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-40 bg-white rounded-[4rem] border border-dashed border-black/5">
                            <Sparkles className="h-12 w-12 text-black/5 mx-auto mb-4" />
                            <p className="text-muted-foreground font-headline font-black uppercase tracking-widest">No stories found in this topic yet</p>
                            <Link href="/" className="mt-8 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-primary hover:opacity-70 transition-opacity">
                                <ArrowLeft className="h-4 w-4" /> Back to Home
                            </Link>
                        </div>
                    )}
                </div>
            </section>

            <SiteFooter />
        </div>
    );
}
