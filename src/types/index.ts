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
        avatarType?: 'photo' | 'avatar' | 'character';
        avatarValue?: string;
    };
    category: string;
    tags: string[];
    published: boolean;
    publishedAt: string; // ISO string
    createdAt: string; // ISO string
    updatedAt: string; // ISO string
    readTime: number; // minutes
    views?: number;
    authorBio?: string;
}

export interface Comment {
    id: string;
    postId: string;
    authorName: string;
    authorAvatar?: string;
    content: string;
    createdAt: string; // ISO string
}

export interface Author {
    id: string;
    uid: string; // Firebase Auth UID
    name: string;
    email: string;
    role: 'admin' | 'editor' | 'writer';
    avatar: string;
    avatarType?: 'photo' | 'avatar' | 'character';
    avatarValue?: string;
    bio: string;
}

export interface Category {
    id: string;
    slug: string;
    name: string;
    description?: string;
}
