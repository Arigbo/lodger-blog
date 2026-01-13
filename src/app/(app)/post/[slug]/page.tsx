import type { Metadata } from 'next';
import ClientBlogPostPage from './client-page';
import { blogService } from '@/lib/blog-service';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;

    try {
        const post = await blogService.getPostBySlug(slug);

        if (!post) {
            return {
                title: 'Post Not Found',
            };
        }

        return {
            title: post.title,
            description: post.excerpt || post.title,
            openGraph: {
                title: post.title,
                description: post.excerpt || post.content.substring(0, 160),
                type: 'article',
                publishedTime: post.publishedAt || post.createdAt,
                authors: [post.author?.name || 'Lodger Writer'],
                images: post.coverImage ? [post.coverImage] : [],
            },
            twitter: {
                card: 'summary_large_image',
                title: post.title,
                description: post.excerpt || post.content.substring(0, 160),
                images: post.coverImage ? [post.coverImage] : [],
            },
        };
    } catch (error) {
        return {
            title: 'Lodger Blog',
        };
    }
}

export default function Page({ params }: { params: Promise<{ slug: string }> }) {
    return <ClientBlogPostPage params={params} />;
}
