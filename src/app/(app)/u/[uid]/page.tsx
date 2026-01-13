'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { Author, BlogPost } from '@/types';
import { PostCard } from '@/components/blog/post-card';
import { Loader2, Calendar, MapPin, Link as LinkIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from 'date-fns';

export default function ProfilePage() {
    const { uid } = useParams();
    const [profile, setProfile] = useState<Author | null>(null);
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!uid) return;
            try {
                // Fetch user data
                const userDoc = await getDoc(doc(db, 'users', uid as string));
                if (userDoc.exists()) {
                    const data = userDoc.data();
                    setProfile({
                        uid: uid as string,
                        id: uid as string,
                        name: data.name || data.displayName || 'Unknown Writer',
                        email: data.email || '',
                        avatar: data.photoURL || data.avatar || '',
                        role: data.role || 'Writer',
                        bio: data.bio || 'Living the dream at Lodger.'
                    });

                    // Fetch user posts
                    const postsQuery = query(
                        collection(db, 'posts'),
                        where('authorId', '==', uid),
                        where('published', '==', true)
                    );
                    const postsSnap = await getDocs(postsQuery);
                    const fetchedPosts = postsSnap.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    })) as BlogPost[];
                    setPosts(fetchedPosts.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()));
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [uid]);

    if (loading) {
        return (
            <div className="w-full max-w-[600px] flex justify-center py-20 border-r border-border/40 min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="w-full max-w-[600px] p-8 text-center border-r border-border/40 min-h-screen">
                <h1 className="text-2xl font-bold">User not found</h1>
                <p className="text-muted-foreground mt-2">This account doesn’t exist.</p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-[600px] border-r border-border/40 min-h-screen">
            {/* Header */}
            <div className="sticky top-0 bg-white/80 backdrop-blur-md z-10 border-b border-border/40 px-4 py-2 flex items-center gap-6">
                <div className="flex flex-col">
                    <h1 className="text-xl font-bold tracking-tight">{profile.name}</h1>
                    <span className="text-sm text-muted-foreground">{posts.length} Posts</span>
                </div>
            </div>

            {/* Banner Placeholder */}
            <div className="h-48 bg-muted/30 w-full" />

            {/* Profile Info */}
            <div className="px-4 pb-4">
                <div className="relative flex justify-between items-end -mt-16 mb-4">
                    <div className="h-32 w-32 rounded-full border-4 border-white bg-muted overflow-hidden">
                        {profile.avatar ? (
                            <img src={profile.avatar} alt={profile.name} className="h-full w-full object-cover" />
                        ) : (
                            <div className="h-full w-full bg-black/5" />
                        )}
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <h2 className="text-2xl font-black tracking-tight">{profile.name}</h2>
                        <span className="text-muted-foreground">@{profile.email.split('@')[0]}</span>
                    </div>

                    <p className="text-[15px] leading-relaxed italic">
                        "{profile.bio}"
                    </p>

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground font-medium">
                        <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Joined January 2026
                        </div>
                        <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            The Commons
                        </div>
                    </div>

                    <div className="flex gap-4 font-bold text-sm">
                        <div className="hover:underline cursor-pointer"><span className="text-foreground">0</span> <span className="text-muted-foreground">Following</span></div>
                        <div className="hover:underline cursor-pointer"><span className="text-foreground">0</span> <span className="text-muted-foreground">Followers</span></div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="posts" className="w-full">
                <TabsList className="w-full h-auto p-0 bg-transparent border-b border-border/40 rounded-none flex">
                    <TabsTrigger value="posts" className="flex-1 rounded-none border-b-4 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-4 font-bold">Posts</TabsTrigger>
                    <TabsTrigger value="replies" className="flex-1 rounded-none border-b-4 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-4 font-bold">Replies</TabsTrigger>
                    <TabsTrigger value="likes" className="flex-1 rounded-none border-b-4 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-4 font-bold">Likes</TabsTrigger>
                </TabsList>
                <TabsContent value="posts" className="m-0">
                    {posts.length === 0 ? (
                        <div className="p-12 text-center text-muted-foreground">No posts yet.</div>
                    ) : (
                        <div>
                            {posts.map(post => (
                                <PostCard key={post.id} post={{ ...post, author: profile }} variant="feed" />
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
