import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const q = query(
            collection(db, "posts"),
            where("published", "==", true),
            orderBy("publishedAt", "desc"),
            limit(6)
        );

        const snapshot = await getDocs(q);
        const posts = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                slug: data.slug,
                title: data.title,
                excerpt: data.excerpt,
                category: data.category,
                publishedAt: data.publishedAt?.toDate ? data.publishedAt.toDate().toISOString() : data.publishedAt,
                coverImage: data.coverImage,
                author: data.author
            };
        });

        return NextResponse.json({ posts });
    } catch (error) {
        console.error("API Error fetching posts:", error);
        return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
    }
}
