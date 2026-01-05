export interface BlogPost {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    content: string; // Markdown or HTML
    coverImage: string;
    authorId: string;
    author: {
        name: string;
        role: string;
        avatar: string;
    };
    category: string;
    tags: string[];
    published: boolean;
    publishedAt: string; // ISO string
    createdAt: string; // ISO string
    updatedAt: string; // ISO string
    readTime: number; // minutes
}

export interface Author {
    id: string;
    uid: string; // Firebase Auth UID
    name: string;
    email: string;
    role: 'admin' | 'editor' | 'writer';
    avatar: string;
    bio: string;
}

export interface Category {
    id: string;
    slug: string;
    name: string;
    description?: string;
}
