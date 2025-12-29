import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

// Mock data generator (replace with Firestore fetch later)
async function getPost(slug: string) {
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
        slug,
        title: 'Welcome to The Commons: A New Space for Living',
        excerpt: 'Today we are launching The Commons, a dedicated space for exploring the future of housing, community living, and the philosophy behind Lodger.',
        content: `
      <p>Housing is more than just four walls and a roof. It's about the people you share it with, the community you build, and the lifestyle you choose.</p>
      
      <h2>The Problem with Modern Renting</h2>
      <p>For too long, the rental market has been dominated by transaction-based relationships. Landlords see tenants as income streams, and tenants see landlords as obstacles. This adversarial dynamic benefits no one.</p>
      
      <p>At Lodger, we believe there is a better way. By fostering direct connections, ensuring transparency with Verified Landlords, and streamlining the financial side of things, we can create a housing ecosystem that works for everyone.</p>
      
      <h2>What is "The Commons"?</h2>
      <p>The Commons is our editorial arm. Here, we will publish:</p>
      <ul>
        <li><strong>Design Guides</strong>: How to make your space feel like home.</li>
        <li><strong>Legal Explainers</strong>: Demystifying leases and tenant rights.</li>
        <li><strong>Community Stories</strong>: Spotlights on innovative co-living arrangements.</li>
        <li><strong>Lodger Updates</strong>: New features and behind-the-scenes looks.</li>
      </ul>
      
      <p>We are just getting started. Stay tuned.</p>
    `,
        author: 'Lodger Team',
        date: 'December 29, 2025',
        category: 'Announcement',
        image: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=2070&auto=format&fit=crop'
    };
}

export default async function PostPage(props: { params: Promise<{ slug: string }> }) {
    const params = await props.params;
    const post = await getPost(params.slug);

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border/40 transition-all duration-300">
                <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group">
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-bold text-sm uppercase tracking-wide">Back to Home</span>
                    </Link>
                    <Link href="/" className="font-headline font-black text-xl tracking-tighter">
                        THE COMMONS
                        <span className="text-primary text-3xl leading-none">.</span>
                    </Link>
                    <div className="w-24" /> {/* Spacer for centering */}
                </div>
            </nav>

            <main className="pt-32 px-6">
                <article className="max-w-3xl mx-auto">
                    {/* Header */}
                    <header className="space-y-8 mb-16 text-center">
                        <div className="flex items-center justify-center gap-4 text-sm font-bold uppercase tracking-widest text-muted-foreground">
                            <span className="text-primary">{post.category}</span>
                            <span>•</span>
                            <span>{post.date}</span>
                        </div>
                        <h1 className="font-serif text-5xl md:text-7xl font-bold leading-tight text-foreground">
                            {post.title}
                        </h1>
                        <div className="flex items-center justify-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-muted" />
                            <div className="text-left">
                                <div className="font-bold text-sm">{post.author}</div>
                                <div className="text-xs text-muted-foreground">Editor in Chief</div>
                            </div>
                        </div>
                    </header>

                    {/* Hero Image */}
                    <div className="aspect-[21/9] rounded-[2rem] overflow-hidden shadow-2xl mb-16">
                        <img
                            src={post.image}
                            alt={post.title}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Content */}
                    <div className="prose prose-lg md:prose-xl prose-stone mx-auto
            prose-headings:font-serif prose-headings:font-bold prose-headings:tracking-tight
            prose-p:font-body prose-p:leading-relaxed prose-p:text-muted-foreground
            prose-a:text-primary prose-a:font-bold prose-a:no-underline hover:prose-a:underline
            prose-strong:font-bold prose-strong:text-foreground
            prose-img:rounded-3xl prose-img:shadow-xl
          " dangerouslySetInnerHTML={{ __html: post.content }} />
                </article>
            </main>
        </div>
    );
}
