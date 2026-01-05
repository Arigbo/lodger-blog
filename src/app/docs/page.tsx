import Link from 'next/link';
import { ArrowLeft, Code2 } from 'lucide-react';

export default function DocsPage() {
    return (
        <div className="min-h-screen bg-background">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="font-headline font-black text-2xl tracking-tighter hover:opacity-80 transition-opacity">
                        THE COMMONS
                        <span className="text-primary text-4xl leading-none">.</span>
                    </Link>
                    <Link href="/" className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Home
                    </Link>
                </div>
            </nav>

            {/* Header */}
            <section className="pt-32 pb-12 px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-4 mb-6">
                        <Code2 className="h-12 w-12 text-primary" />
                        <h1 className="font-headline text-6xl md:text-7xl font-black uppercase tracking-tighter">API Docs</h1>
                    </div>
                    <p className="text-xl text-muted-foreground font-medium">
                        Integrate The Commons blog content into your application using our simple REST API.
                    </p>
                </div>
            </section>

            {/* Documentation */}
            <section className="py-12 px-6 pb-24">
                <div className="max-w-4xl mx-auto space-y-12">
                    {/* Overview */}
                    <div className="bg-white rounded-[2rem] p-8 md:p-12 border border-border/40 shadow-sm space-y-6">
                        <h2 className="font-headline text-3xl font-black uppercase tracking-tight">Overview</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            The Commons API provides read-only access to published blog posts. All responses are in JSON format.
                            The API is designed to be consumed by the main Lodger application and other authorized clients.
                        </p>
                    </div>

                    {/* Base URL */}
                    <div className="bg-white rounded-[2rem] p-8 md:p-12 border border-border/40 shadow-sm space-y-6">
                        <h2 className="font-headline text-3xl font-black uppercase tracking-tight">Base URL</h2>
                        <div className="bg-muted/30 rounded-xl p-4 font-mono text-sm">
                            <code>https://your-blog-domain.com/api/v1</code>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Replace <code className="bg-muted px-2 py-1 rounded">your-blog-domain.com</code> with your actual deployment URL.
                        </p>
                    </div>

                    {/* Endpoints */}
                    <div className="bg-white rounded-[2rem] p-8 md:p-12 border border-border/40 shadow-sm space-y-8">
                        <h2 className="font-headline text-3xl font-black uppercase tracking-tight">Endpoints</h2>

                        {/* GET /posts */}
                        <div className="space-y-4 border-l-4 border-primary pl-6">
                            <div className="flex items-center gap-3">
                                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-lg font-bold text-xs uppercase">GET</span>
                                <code className="font-mono text-lg">/posts</code>
                            </div>
                            <p className="text-muted-foreground">
                                Retrieve the latest published blog posts (limited to 6 most recent).
                            </p>

                            <div className="space-y-2">
                                <h4 className="font-bold text-sm uppercase tracking-wide">Response</h4>
                                <pre className="bg-muted/30 rounded-xl p-4 overflow-x-auto text-sm">
                                    {`{
  "posts": [
    {
      "id": "string",
      "slug": "string",
      "title": "string",
      "excerpt": "string",
      "category": "string",
      "publishedAt": "ISO 8601 date string",
      "coverImage": "string (URL)",
      "author": {
        "name": "string",
        "role": "string",
        "avatar": "string (URL)"
      }
    }
  ]
}`}
                                </pre>
                            </div>

                            <div className="space-y-2">
                                <h4 className="font-bold text-sm uppercase tracking-wide">Example Request</h4>
                                <pre className="bg-muted/30 rounded-xl p-4 overflow-x-auto text-sm">
                                    {`fetch('https://your-blog-domain.com/api/v1/posts')
  .then(res => res.json())
  .then(data => console.log(data.posts));`}
                                </pre>
                            </div>
                        </div>
                    </div>

                    {/* Response Codes */}
                    <div className="bg-white rounded-[2rem] p-8 md:p-12 border border-border/40 shadow-sm space-y-6">
                        <h2 className="font-headline text-3xl font-black uppercase tracking-tight">Response Codes</h2>
                        <div className="space-y-3">
                            <div className="flex items-start gap-4">
                                <code className="bg-green-100 text-green-800 px-3 py-1 rounded-lg font-bold text-sm">200</code>
                                <div>
                                    <div className="font-bold">Success</div>
                                    <div className="text-sm text-muted-foreground">Request completed successfully</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <code className="bg-red-100 text-red-800 px-3 py-1 rounded-lg font-bold text-sm">500</code>
                                <div>
                                    <div className="font-bold">Server Error</div>
                                    <div className="text-sm text-muted-foreground">An error occurred on the server</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Usage Example */}
                    <div className="bg-white rounded-[2rem] p-8 md:p-12 border border-border/40 shadow-sm space-y-6">
                        <h2 className="font-headline text-3xl font-black uppercase tracking-tight">Integration Example</h2>
                        <p className="text-muted-foreground">
                            Here's how to integrate The Commons blog posts into your React application:
                        </p>
                        <pre className="bg-muted/30 rounded-xl p-4 overflow-x-auto text-sm">
                            {`import { useEffect, useState } from 'react';

function BlogSection() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch('https://your-blog-domain.com/api/v1/posts')
      .then(res => res.json())
      .then(data => setPosts(data.posts))
      .catch(err => console.error('Error fetching posts:', err));
  }, []);

  return (
    <div>
      <h2>Latest from The Commons</h2>
      {posts.map(post => (
        <article key={post.id}>
          <h3>{post.title}</h3>
          <p>{post.excerpt}</p>
          <a href={\`https://your-blog-domain.com/post/\${post.slug}\`}>
            Read More
          </a>
        </article>
      ))}
    </div>
  );
}`}
                        </pre>
                    </div>

                    {/* Support */}
                    <div className="bg-primary/5 rounded-[2rem] p-8 md:p-12 border border-primary/20">
                        <h2 className="font-headline text-2xl font-black uppercase tracking-tight mb-4">Need Help?</h2>
                        <p className="text-muted-foreground">
                            For questions or support regarding the API, please contact the Lodger development team.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
