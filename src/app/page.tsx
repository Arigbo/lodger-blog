import Link from 'next/link';

// Mock data until API is ready
const FEATURED_POST = {
  slug: 'welcome-to-the-commons',
  title: 'Welcome to The Commons: A New Space for Living',
  excerpt: 'Today we are launching The Commons, a dedicated space for exploring the future of housing, community living, and the philosophy behind Lodger.',
  author: 'Lodger Team',
  date: 'December 29, 2025',
  category: 'Announcement',
  image: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=2070&auto=format&fit=crop'
};

const RECENT_POSTS = [
  {
    slug: 'finding-your-perfect-match',
    title: 'Finding Your Perfect Roommate Match',
    excerpt: 'Tips and tricks for navigating the shared living landscape and finding people you actually want to live with.',
    author: 'Sarah Jenkins',
    date: 'December 28, 2025',
    category: 'Guides',
  },
  {
    slug: 'understanding-leases',
    title: 'Understanding Your Lease Agreement',
    excerpt: 'Don\'t sign until you read this. We catch the small print so you don\'t have to.',
    author: 'Legal Team',
    date: 'December 25, 2025',
    category: 'Education',
  },
  {
    slug: 'interior-design-small-spaces',
    title: 'Interior Design for Small Spaces',
    excerpt: 'How to maximize your 10x10 room without sacrificing style or comfort.',
    author: 'Design Studio',
    date: 'December 22, 2025',
    category: 'Design',
  }
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="font-headline font-black text-2xl tracking-tighter hover:opacity-80 transition-opacity">
            THE COMMONS
            <span className="text-primary text-4xl leading-none">.</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium tracking-wide uppercase">
            <Link href="/" className="hover:text-primary transition-colors">Manifesto</Link>
            <Link href="/category/design" className="hover:text-primary transition-colors">Design</Link>
            <Link href="/category/culture" className="hover:text-primary transition-colors">Culture</Link>
            <Link href="/category/guides" className="hover:text-primary transition-colors">Guides</Link>
          </div>
          <Link href="http://localhost:3000" target="_blank" className="bg-primary text-primary-foreground px-6 py-2.5 rounded-full font-bold text-sm hover:shadow-lg hover:-translate-y-0.5 transition-all">
            Open Lodger
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <Link href={`/post/${FEATURED_POST.slug}`} className="group grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500" />
              <img
                src={FEATURED_POST.image}
                alt={FEATURED_POST.title}
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
              />
            </div>
            <div className="space-y-6">
              <div className="flex items-center gap-4 text-sm font-bold uppercase tracking-widest text-muted-foreground">
                <span className="text-primary">{FEATURED_POST.category}</span>
                <span>•</span>
                <span>{FEATURED_POST.date}</span>
              </div>
              <h1 className="font-serif text-5xl md:text-7xl font-bold leading-[0.95] group-hover:text-primary transition-colors duration-300">
                {FEATURED_POST.title}
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground font-medium leading-relaxed max-w-xl">
                {FEATURED_POST.excerpt}
              </p>
              <div className="flex items-center gap-4 pt-4">
                <div className="h-12 w-12 rounded-full bg-muted" />
                <div>
                  <div className="font-bold">{FEATURED_POST.author}</div>
                  <div className="text-sm text-muted-foreground">Editor in Chief</div>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Recent Posts Grid */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="flex items-end justify-between border-b border-border pb-8">
            <h2 className="font-headline text-4xl font-black uppercase tracking-tight">Recent Stories</h2>
            <Link href="/archive" className="font-medium hover:text-primary hover:underline underline-offset-4">View All Archive</Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-16">
            {RECENT_POSTS.map((post) => (
              <Link key={post.slug} href={`/post/${post.slug}`} className="group space-y-6 block">
                <div className="aspect-[3/2] rounded-[1.5rem] bg-white border border-border/50 shadow-sm overflow-hidden group-hover:shadow-xl transition-all duration-300">
                  <div className="w-full h-full bg-muted/20 flex items-center justify-center text-muted-foreground/30 font-headline text-6xl opacity-30 group-hover:scale-110 transition-transform duration-500">
                    L
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="text-xs font-bold uppercase tracking-widest text-primary">
                    {post.category}
                  </div>
                  <h3 className="font-serif text-3xl font-bold leading-tight group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-muted-foreground line-clamp-3 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter / Footer */}
      <footer className="bg-black text-white py-24 px-6 rounded-t-[3rem] mt-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20">
          <div className="space-y-8">
            <div className="font-headline font-black text-4xl tracking-tighter">
              THE COMMONS
              <span className="text-primary text-5xl leading-none">.</span>
            </div>
            <p className="text-xl text-white/60 max-w-md leading-relaxed">
              Exploring the intersection of housing, technology, and community. curated by Lodger.
            </p>
          </div>
          <div className="space-y-8">
            <h4 className="font-bold text-2xl">Subscribe to our newsletter</h4>
            <form className="flex gap-4">
              <input
                type="email"
                placeholder="email@address.com"
                className="flex-1 bg-white/10 border-white/20 rounded-2xl px-6 py-4 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <button className="bg-primary text-black font-bold px-8 rounded-2xl hover:scale-105 transition-transform">
                Join
              </button>
            </form>
          </div>
        </div>
      </footer>
    </div>
  );
}
