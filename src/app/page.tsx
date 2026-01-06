'use client';

import Link from 'next/link';
import { BlogPost } from '@/types';
import { SiteHeaderAuth } from '@/components/layout/site-header-auth';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, TrendingUp, Clock, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

// Helper to fetch from Firestore REST API
async function fetchFirestore(collection: string, queryParams: string = "") {
  const projectId = "studio-2267792175-c3d0d";
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collection}${queryParams}`;

  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    console.error(`Firestore REST API error: ${res.statusText}`);
    return null;
  }
  return res.json();
}

async function getPostsData(): Promise<{ featured: BlogPost | null; recent: BlogPost[] }> {
  try {
    const data = await fetchFirestore("posts", "?pageSize=100");
    if (!data || !data.documents) return { featured: null, recent: [] };

    let posts = data.documents.map((doc: any) => {
      const fields = doc.fields;
      const id = doc.name.split('/').pop();

      const getString = (f: any) => f?.stringValue || "";
      const getBoolean = (f: any) => f?.booleanValue || false;
      const getMap = (f: any) => {
        if (!f?.mapValue?.fields) return {};
        const result: any = {};
        for (const key in f.mapValue.fields) {
          result[key] = f.mapValue.fields[key].stringValue;
        }
        return result;
      };
      const getTimestamp = (f: any) => f?.timestampValue || null;

      return {
        id,
        slug: getString(fields.slug),
        title: getString(fields.title),
        excerpt: getString(fields.excerpt),
        category: getString(fields.category),
        published: getBoolean(fields.published),
        publishedAt: getTimestamp(fields.publishedAt),
        coverImage: getString(fields.coverImage),
        author: getMap(fields.author),
        createdAt: getTimestamp(fields.createdAt),
        updatedAt: getTimestamp(fields.updatedAt),
        readTime: parseInt(fields.readTime?.integerValue || "1"),
      } as BlogPost;
    });

    posts = posts.filter((p: BlogPost) => p.published);
    posts.sort((a: BlogPost, b: BlogPost) => {
      const dateA = new Date(a.publishedAt || 0).getTime();
      const dateB = new Date(b.publishedAt || 0).getTime();
      return dateB - dateA;
    });

    return {
      featured: posts[0] || null,
      recent: posts.slice(1)
    };
  } catch (error) {
    console.error('Error fetching posts:', error);
    return { featured: null, recent: [] };
  }
}

export default function Home() {
  const [data, setData] = useState<{ featured: BlogPost | null; recent: BlogPost[] }>({ featured: null, recent: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPostsData().then(res => {
      setData(res);
      setLoading(false);
    });
  }, []);

  const { featured, recent } = data;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="font-headline font-black uppercase tracking-widest text-sm animate-pulse">Loading The Commons</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-black/5 h-20">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <Link href="/" className="font-headline font-black text-2xl tracking-tighter group flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-lg group-hover:bg-primary transition-colors duration-500 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span>THE COMMONS<span className="text-primary group-hover:animate-pulse">.</span></span>
          </Link>
          <div className="hidden lg:flex items-center gap-10 text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">
            {['Manifesto', 'Design', 'Culture', 'Guides'].map((item) => (
              <Link
                key={item}
                href={item === 'Manifesto' ? '/' : `/category/${item.toLowerCase()}`}
                className="hover:text-primary transition-all relative group"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
              </Link>
            ))}
          </div>
          <SiteHeaderAuth />
        </div>
      </nav>

      {/* Hero Section - Splice Layout */}
      <main className="pt-32 pb-24">
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
                        <img src={featured.author.avatar || '/placeholder-avatar.jpg'} className="w-12 h-12 rounded-2xl object-cover ring-2 ring-white/20" />
                        <div>
                          <p className="text-xs font-bold uppercase tracking-widest">{featured.author.name}</p>
                          <p className="text-[10px] text-white/60 font-medium">{featured.author.role}</p>
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

        {/* Varied Grid Section */}
        <section className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-16 px-4">
            <div className="space-y-1">
              <h2 className="font-headline text-4xl lg:text-5xl font-black uppercase tracking-tighter">Recent Dispatch</h2>
              <div className="h-1 w-20 bg-primary rounded-full transition-all duration-700 hover:w-32" />
            </div>
            <Link href="/archive" className="text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group">
              EXPLORE ARCHIVE <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recent.map((post, idx) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className={cn(
                  "group relative",
                  idx === 0 ? "md:col-span-2" : ""
                )}
              >
                <Link href={`/post/${post.slug}`} className="block h-full bg-white rounded-[2.5rem] border border-border/40 overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                  <div className={cn(
                    "relative overflow-hidden",
                    idx === 0 ? "aspect-[21/9]" : "aspect-[16/10]"
                  )}>
                    <img
                      src={post.coverImage}
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
                      idx === 0 ? "text-4xl md:text-5xl" : "text-3xl"
                    )}>
                      {post.title}
                    </h3>
                    <p className="text-muted-foreground font-medium leading-relaxed line-clamp-2 md:line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center gap-4 pt-4 border-t border-border/40">
                      <img
                        src={post.author.avatar || '/placeholder-avatar.jpg'}
                        alt={post.author.name}
                        className="h-10 w-10 rounded-2xl object-cover bg-muted"
                      />
                      <div className="flex-1">
                        <div className="font-black text-sm uppercase tracking-tight">{post.author.name}</div>
                        <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{post.author.role}</div>
                      </div>
                      <div className="hidden sm:block text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">
                        {post.readTime} MIN READ
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      {/* Premium Footer */}
      <footer className="bg-black text-white pt-32 pb-16 px-6 overflow-hidden relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="absolute top-0 right-0 p-60 bg-primary/10 blur-[150px] rounded-full -mr-40 -mt-40" />

        <div className="max-w-7xl mx-auto flex flex-col items-center text-center space-y-20 relative z-10">
          <div className="space-y-8 max-w-2xl">
            <h2 className="font-headline font-black text-5xl md:text-7xl tracking-tight leading-none uppercase">
              The future of <br /> <span className="text-primary">living</span> together.
            </h2>
            <p className="text-xl text-white/50 leading-relaxed font-medium">
              A publication dedicated to exploring the intersection of community, space, and modern residential life.
            </p>
          </div>

          <div className="w-full max-w-xl bg-white/5 backdrop-blur-2xl p-2 rounded-[2rem] border border-white/10 flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              placeholder="YOUR@EMAIL.COM"
              className="flex-1 bg-transparent px-8 py-5 text-sm font-black tracking-widest outline-none uppercase placeholder:text-white/20"
            />
            <button className="bg-white text-black font-black px-10 py-5 rounded-[1.5rem] uppercase tracking-widest hover:bg-primary hover:text-white transition-all transform active:scale-95">
              Subscribe
            </button>
          </div>

          <div className="w-full pt-20 border-t border-white/10 grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
            <div className="text-left">
              <Link href="/" className="font-headline font-black text-2xl tracking-tighter">
                THE COMMONS<span className="text-primary truncate">.</span>
              </Link>
            </div>
            <div className="flex justify-center gap-10 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
              <Link href="/" className="hover:text-primary transition-colors">Manifesto</Link>
              <Link href="/" className="hover:text-primary transition-colors">Twitter</Link>
              <Link href="/" className="hover:text-primary transition-colors">Contact</Link>
            </div>
            <div className="text-right text-[10px] font-black uppercase tracking-widest text-white/20">
              © 2026 LODGER TECHNOLOGY GROUP
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
