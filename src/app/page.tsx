'use client';

import Link from 'next/link';
import { BlogPost } from '@/types';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { PostCard } from '@/components/blog/post-card';
import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp, Clock, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';
import { blogService } from '@/lib/blog-service';

export default function Home() {
  const [data, setData] = useState<{ featured: BlogPost | null; recent: BlogPost[] }>({ featured: null, recent: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    blogService.getPublishedPosts().then(posts => {
      setData({
        featured: posts[0] || null,
        recent: posts.slice(1)
      });
      setLoading(false);
    });
  }, []);

  const { featured, recent } = data;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="font-headline font-black uppercase tracking-widest text-sm animate-pulse">Loading Blog...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <SiteHeader />

      <main className="pt-32 pb-24">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 mb-32">
          {featured ? (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "circOut" }}
              className="relative group"
            >
              <Link href={`/post/${featured.slug}`} className="relative block overflow-hidden rounded-[4rem] bg-white shadow-2xl border border-black/5">
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  <div className="relative aspect-[4/3] lg:aspect-square overflow-hidden">
                    <img
                      src={featured.coverImage}
                      alt={featured.title}
                      className="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-1000 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-transparent z-10" />
                  </div>

                  <div className="p-12 lg:p-20 flex flex-col justify-center gap-10 relative">
                    <div className="absolute top-0 right-0 p-40 bg-primary/5 blur-[100px] rounded-full -mr-20 -mt-20" />

                    <div className="relative z-10 space-y-8">
                      <div className="flex items-center gap-4">
                        <span className="px-5 py-2 rounded-full bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/20">
                          Featured Story
                        </span>
                        <div className="h-px w-12 bg-black/10" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                          {featured.category}
                        </span>
                      </div>

                      <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-black leading-[0.9] text-foreground tracking-tight group-hover:text-primary transition-colors duration-500">
                        {featured.title}
                      </h1>

                      <p className="text-xl md:text-2xl text-muted-foreground/80 font-medium leading-relaxed italic border-l-2 border-primary/20 pl-8">
                        {featured.excerpt}
                      </p>
                    </div>

                    <div className="relative z-10 flex items-center justify-between pt-10 border-t border-black/5">
                      <div className="flex items-center gap-5">
                        <img
                          src={featured.author?.avatar || '/placeholder-avatar.jpg'}
                          className="w-14 h-14 rounded-[1.25rem] object-cover ring-4 ring-white shadow-lg"
                        />
                        <div>
                          <p className="text-xs font-black uppercase tracking-widest text-foreground">{featured.author?.name}</p>
                          <p className="text-[10px] text-primary font-bold uppercase tracking-widest mt-0.5">{featured.author?.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        <Clock className="h-3 w-3" /> {featured.readTime} MIN
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ) : (
            <div className="text-center py-40 bg-white rounded-[4rem] border border-dashed border-border flex flex-col items-center gap-6">
              <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center">
                <Clock className="h-8 w-8 text-muted-foreground/30" />
              </div>
              <p className="text-muted-foreground font-headline font-black uppercase tracking-widest">Awaiting the first narrative...</p>
            </div>
          )}
        </section>

        {/* Recent Posts Grid */}
        <section className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-20 px-4">
            <div className="space-y-4">
              <div className="h-1.5 w-12 bg-primary rounded-full" />
              <h2 className="font-serif text-5xl md:text-6xl font-black tracking-tighter">The Latest<span className="text-primary italic">.</span></h2>
            </div>
            <Link href="/archive" className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-black transition-colors flex items-center gap-3 bg-white px-8 py-4 rounded-2xl shadow-sm border border-black/5 group">
              Explore Archive <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {recent.map((post, idx) => (
              <PostCard
                key={post.id}
                post={post}
                index={idx}
                layout={idx === 0 ? 'full' : 'standard'}
              />
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
