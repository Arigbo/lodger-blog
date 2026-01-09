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
        <section className="max-w-7xl mx-auto px-6 mb-24">
          {featured ? (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "circOut" }}
              className="relative"
            >
              <Link href={`/post/${featured.slug}`} className="group grid grid-cols-1 lg:grid-cols-12 gap-0 items-center overflow-hidden">
                <div className="lg:col-span-8 relative aspect-[16/10] lg:aspect-auto lg:h-[70vh] rounded-[3rem] overflow-hidden shadow-2xl z-20">
                  <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-transparent z-10 opacity-60 group-hover:opacity-20 transition-opacity duration-700" />
                  <img
                    src={featured.coverImage}
                    alt={featured.title}
                    className="w-full h-full object-cover transform scale-100 group-hover:scale-110 transition-transform duration-1000 ease-out"
                  />
                  <div className="absolute bottom-10 left-10 z-20 hidden lg:block">
                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-[2rem] text-white">
                      <div className="flex items-center gap-4 mb-4">
                        <img src={featured.author?.avatar || '/placeholder-avatar.jpg'} className="w-12 h-12 rounded-2xl object-cover ring-2 ring-white/20" />
                        <div>
                          <p className="text-xs font-bold uppercase tracking-widest">{featured.author?.name}</p>
                          <p className="text-[10px] text-white/60 font-medium">{featured.author?.role}</p>
                        </div>
                      </div>
                      <p className="text-sm font-medium italic opacity-80 line-clamp-2">"{featured.excerpt}"</p>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-5 lg:-ml-24 bg-white p-12 lg:p-16 rounded-[3rem] shadow-2xl border border-border/40 relative z-30 mt-[-4rem] lg:mt-0 lg:min-h-[50vh] flex flex-col justify-center gap-8">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-primary bg-primary/10 w-fit px-4 py-2 rounded-full">
                      <TrendingUp className="h-3 w-3" /> FEATURED STORY
                    </div>
                    <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-black leading-[1] text-foreground tracking-tight group-hover:text-primary transition-colors duration-500">
                      {featured.title}
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground/80 font-medium leading-relaxed">
                      {featured.excerpt}
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-8 border-t border-border/60">
                    <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      <span className="flex items-center gap-2"><Clock className="h-3 w-3" /> {featured.readTime} MIN</span>
                      <span className="flex items-center gap-2"><Calendar className="h-3 w-3" /> {new Date(featured.publishedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="p-4 rounded-full bg-black text-white group-hover:bg-primary transition-all group-hover:translate-x-2">
                      <ArrowRight className="h-6 w-6" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ) : (
            <div className="text-center py-40 bg-white rounded-[3rem] border border-dashed border-border">
              <p className="text-muted-foreground font-headline font-black uppercase tracking-widest">No Stories Published Yet</p>
            </div>
          )}
        </section>

        {/* Recent Posts Grid */}
        <section className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-16 px-4">
            <div className="space-y-1">
              <h2 className="font-headline text-4xl lg:text-5xl font-black uppercase tracking-tighter">Recent Posts</h2>
              <div className="h-1 w-20 bg-primary rounded-full transition-all duration-700 hover:w-32" />
            </div>
            <Link href="/archive" className="text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group">
              PREVIOUS POSTS <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
