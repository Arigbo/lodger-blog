import { db } from './firebase';
import {
    collection,
    query,
    where,
    orderBy,
    getDocs,
    getDoc,
    doc,
    limit,
    DocumentData,
    QueryDocumentSnapshot
} from 'firebase/firestore';
import { BlogPost } from '@/types';

export const blogService = {
    /**
     * Fetch all published blog posts
     */
    async getPublishedPosts(): Promise<BlogPost[]> {
        try {
            const q = query(
                collection(db, 'posts'),
                where('published', '==', true),
                orderBy('publishedAt', 'desc')
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => this.mapDocToBlogPost(doc));
        } catch (error) {
            console.error('Error fetching published posts:', error);
            return [];
        }
    },

    /**
     * Fetch a single post by slug
     */
    async getPostBySlug(slug: string): Promise<BlogPost | null> {
        try {
            const q = query(
                collection(db, 'posts'),
                where('slug', '==', slug),
                limit(1)
            );
            const snapshot = await getDocs(q);
            if (snapshot.empty) return null;
            return this.mapDocToBlogPost(snapshot.docs[0]);
        } catch (error) {
            console.error(`Error fetching post by slug ${slug}:`, error);
            return null;
        }
    },

    /**
     * Fetch a single post by ID
     */
    async getPostById(id: string): Promise<BlogPost | null> {
        try {
            const docRef = doc(db, 'posts', id);
            const docSnap = await getDoc(docRef);
            if (!docSnap.exists()) return null;
            return { id: docSnap.id, ...docSnap.data() } as BlogPost;
        } catch (error) {
            console.error(`Error fetching post by ID ${id}:`, error);
            return null;
        }
    },

    /**
     * Fetch posts for a specific writer
     */
    async getWriterPosts(authorId: string): Promise<BlogPost[]> {
        try {
            const q = query(
                collection(db, 'posts'),
                where('authorId', '==', authorId),
                orderBy('createdAt', 'desc')
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogPost));
        } catch (error) {
            console.error(`Error fetching posts for writer ${authorId}:`, error);
            return [];
        }
    },

    /**
     * Helper to map Firestore document to BlogPost type
     */
    mapDocToBlogPost(doc: QueryDocumentSnapshot<DocumentData>): BlogPost {
        const data = doc.data();
        return {
            id: doc.id,
            slug: data.slug || '',
            title: data.title || '',
            excerpt: data.excerpt || '',
            content: data.content || '',
            coverImage: data.coverImage || '',
            authorId: data.authorId || '',
            author: data.author || { name: 'Unknown', role: 'Writer', avatar: '' },
            category: data.category || 'General',
            tags: data.tags || [],
            published: data.published || false,
            publishedAt: data.publishedAt?.toDate?.()?.toISOString() || data.publishedAt || '',
            createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || '',
            updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt || '',
            readTime: data.readTime || 1,
            views: data.views || 0,
            authorBio: data.authorBio || '',
        } as BlogPost;
    }
};
