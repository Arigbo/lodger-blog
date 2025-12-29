import { NextResponse } from 'next/server';

// Mock data
const POSTS = [
    {
        id: '1',
        slug: 'welcome-to-the-commons',
        title: 'Welcome to The Commons: A New Space for Living',
        excerpt: 'Today we are launching The Commons, a dedicated space for exploring the future of housing, community living, and the philosophy behind Lodger.',
        category: 'Announcement',
        publishedAt: new Date().toISOString(),
    },
    {
        id: '2',
        slug: 'finding-your-perfect-match',
        title: 'Finding Your Perfect Roommate Match',
        excerpt: 'Tips and tricks for navigating the shared living landscape and finding people you actually want to live with.',
        category: 'Guides',
        publishedAt: new Date(Date.now() - 86400000).toISOString(),
    }
];

export async function GET() {
    // TODO: Fetch from Firestore
    // const postsSnapshot = await getDocs(collection(db, 'posts'));
    // const posts = postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json({
        data: POSTS,
        meta: {
            total: POSTS.length,
            page: 1,
        }
    });
}
