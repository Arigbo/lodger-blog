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
    QueryDocumentSnapshot,
    updateDoc,
    arrayUnion,
    arrayRemove,
    increment,
    addDoc,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';
import { BlogPost, Comment, Author } from '@/types';

export const blogService = {
    /**
     * Fetch all published blog posts
     */
    async getPublishedPosts(limitCount?: number): Promise<BlogPost[]> {
        try {
            let q = query(
                collection(db, 'posts'),
                where('published', '==', true),
                orderBy('publishedAt', 'desc')
            );

            if (limitCount) {
                q = query(q, limit(limitCount));
            }

            const snapshot = await getDocs(q);
            const posts = snapshot.docs.map(doc => this.mapDocToBlogPost(doc));

            // Hydrate authors
            return await this.hydrateAuthors(posts);
        } catch (error) {
            console.error('Error fetching published posts:', error);
            return [];
        }
    },

    /**
     * Hydrate author data from users collection
     */
    async hydrateAuthors(posts: BlogPost[]): Promise<BlogPost[]> {
        const authorIds = [...new Set(posts.map(p => p.authorId))].filter(Boolean);
        if (authorIds.length === 0) return posts;

        try {
            const authorsMap: Record<string, Author> = {};

            // Fetch users in chunks of 10 (Firestore limit for 'in' queries)
            for (let i = 0; i < authorIds.length; i += 10) {
                const chunk = authorIds.slice(i, i + 10);
                const q = query(collection(db, 'users'), where('uid', 'in', chunk));
                const snap = await getDocs(q);
                snap.forEach(doc => {
                    const data = doc.data();
                    authorsMap[doc.id] = {
                        uid: doc.id,
                        id: doc.id,
                        name: data.name || data.displayName || 'Unknown Writer',
                        email: data.email || '',
                        avatar: data.photoURL || data.avatar || '',
                        role: data.role || 'Writer',
                        bio: data.bio || ''
                    };
                });
            }

            return posts.map(post => ({
                ...post,
                author: authorsMap[post.authorId] || post.author
            }));
        } catch (error) {
            console.error("Error hydrating authors:", error);
            return posts;
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
            const post = this.mapDocToBlogPost(snapshot.docs[0]);

            // Hydrate single author
            const hydrated = await this.hydrateAuthors([post]);
            return hydrated[0];
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
            return this.mapDocToBlogPost(docSnap as any); // Using helper for consistency
        } catch (error) {
            console.error(`Error fetching post by ID ${id}:`, error);
            return null;
        }
    },

    /**
     * Social Interactions
     */
    async toggleLike(postId: string, userId: string, hasLiked: boolean) {
        const postRef = doc(db, 'posts', postId);
        try {
            await updateDoc(postRef, {
                likes: hasLiked ? arrayRemove(userId) : arrayUnion(userId),
                // If liking, make sure it's not in dislikes
                ...(!hasLiked && { dislikes: arrayRemove(userId) })
            });
        } catch (error) {
            console.error('Error toggling like:', error);
            throw error;
        }
    },

    async toggleDislike(postId: string, userId: string, hasDisliked: boolean) {
        const postRef = doc(db, 'posts', postId);
        try {
            await updateDoc(postRef, {
                dislikes: hasDisliked ? arrayRemove(userId) : arrayUnion(userId),
                // If disliking, make sure it's not in likes
                ...(!hasDisliked && { likes: arrayRemove(userId) })
            });
        } catch (error) {
            console.error('Error toggling dislike:', error);
            throw error;
        }
    },

    async reportPost(postId: string, userId: string) {
        const postRef = doc(db, 'posts', postId);
        try {
            await updateDoc(postRef, {
                reports: arrayUnion(userId)
            });
        } catch (error) {
            console.error('Error reporting post:', error);
            throw error;
        }
    },

    /**
     * Commenting
     */
    async addComment(postId: string, commentData: Omit<Comment, 'id' | 'createdAt' | 'postId'>) {
        try {
            const commentsRef = collection(db, 'posts', postId, 'comments');
            const postRef = doc(db, 'posts', postId);

            await addDoc(commentsRef, {
                ...commentData,
                postId,
                createdAt: serverTimestamp()
            });

            await updateDoc(postRef, {
                commentCount: increment(1)
            });
        } catch (error) {
            console.error('Error adding comment:', error);
            throw error;
        }
    },

    async getComments(postId: string): Promise<Comment[]> {
        try {
            const commentsRef = collection(db, 'posts', postId, 'comments');
            const q = query(commentsRef, orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || new Date().toISOString()
                } as Comment;
            });
        } catch (error) {
            console.error('Error fetching comments:', error);
            return [];
        }
    },

    /**
     * Fetch posts for a specific writer
     */
    async getWriterPosts(authorId: string): Promise<BlogPost[]> {
        try {
            const q = query(
                collection(db, 'posts'),
                where('authorId', '==', authorId)
            );
            const snapshot = await getDocs(q);
            const posts = snapshot.docs.map(doc => this.mapDocToBlogPost(doc));
            return posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        } catch (error) {
            console.error(`Error fetching posts for writer ${authorId}:`, error);
            return [];
        }
    },

    /**
    * Fetch recommended users to follow
    */
    async getRecommendedUsers(excludeUserId?: string, limitCount: number = 3): Promise<Author[]> {
        try {
            const q = query(
                collection(db, 'users'),
                where('role', 'in', ['writer', 'admin']), // Prefer showing writers
                limit(limitCount + 1) // Fetch one extra to handle exclusion
            );
            const snapshot = await getDocs(q);
            const users = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    uid: doc.id,
                    name: data.name || data.displayName || 'Unknown User',
                    email: data.email || '',
                    role: data.role || 'writer',
                    avatar: data.avatar || data.photoURL || '',
                    bio: data.bio || ''
                } as Author;
            });

            return users.filter(u => u.uid !== excludeUserId).slice(0, limitCount);
        } catch (error) {
            console.error('Error fetching recommended users:', error);
            // Fallback for development if no users exist
            return [];
        }
    },

    /**
     * Helper to map Firestore document to BlogPost type
     */
    mapDocToBlogPost(doc: QueryDocumentSnapshot<DocumentData> | { id: string, data: () => DocumentData }): BlogPost {
        // ... implementation
        const data = typeof doc.data === 'function' ? doc.data() : (doc as any).data;
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
            likes: data.likes || [],
            dislikes: data.dislikes || [],
            reports: data.reports || [],
            commentCount: data.commentCount || 0
        } as BlogPost;
    }, // Added comma here

    async searchPosts(queryText: string): Promise<BlogPost[]> {

        try {
            const allPosts = await this.getPublishedPosts();
            const lowerQuery = queryText.toLowerCase();
            return allPosts.filter(post =>
                post.title.toLowerCase().includes(lowerQuery) ||
                post.excerpt.toLowerCase().includes(lowerQuery) ||
                post.category.toLowerCase().includes(lowerQuery)
            );
        } catch (error) {
            console.error('Error searching posts:', error);
            return [];
        }
    }
};

