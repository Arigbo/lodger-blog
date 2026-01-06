import { NextResponse } from "next/server";

// Helper to fetch from Firestore REST API
async function fetchFirestore(collection: string) {
    const projectId = "studio-2267792175-c3d0d"; // From firebase config
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collection}`;

    const res = await fetch(url + "?pageSize=100", { cache: 'no-store' });
    if (!res.ok) {
        throw new Error(`Firestore REST API error: ${res.statusText}`);
    }
    return res.json();
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limitParam = parseInt(searchParams.get("limit") || "6");
        const search = searchParams.get("search")?.toLowerCase() || "";

        // Fetch via REST API
        const data = await fetchFirestore("posts");

        let posts = [];
        if (data.documents) {
            posts = data.documents.map((doc: any) => {
                const fields = doc.fields;
                const id = doc.name.split('/').pop();

                // Helper to parse Firestore field types
                const getString = (f: any) => f?.stringValue || "";
                const getBoolean = (f: any) => f?.booleanValue || false;
                const getMap = (f: any) => {
                    if (!f?.mapValue?.fields) return {};
                    const result: any = {};
                    for (const key in f.mapValue.fields) {
                        result[key] = f.mapValue.fields[key].stringValue;
                    }
                    return result;
                };
                const getTimestamp = (f: any) => f?.timestampValue || null;

                return {
                    id,
                    slug: getString(fields.slug),
                    title: getString(fields.title),
                    excerpt: getString(fields.excerpt),
                    category: getString(fields.category),
                    published: getBoolean(fields.published),
                    publishedAt: getTimestamp(fields.publishedAt),
                    coverImage: getString(fields.coverImage),
                    author: getMap(fields.author)
                };
            });
        }

        // Filter published
        posts = posts.filter((p: any) => p.published);
        // Sort by publishedAt desc
        posts.sort((a: any, b: any) => {
            const dateA = new Date(a.publishedAt || 0).getTime();
            const dateB = new Date(b.publishedAt || 0).getTime();
            return dateB - dateA;
        });

        // Filter by search term if provided
        if (search) {
            posts = posts.filter((post: any) =>
                post.title?.toLowerCase().includes(search) ||
                post.excerpt?.toLowerCase().includes(search)
            );
        }

        // Apply pagination
        const total = posts.length;
        const startIndex = (page - 1) * limitParam;
        const endIndex = startIndex + limitParam;
        const paginatedPosts = posts.slice(startIndex, endIndex);

        return NextResponse.json({
            posts: paginatedPosts,
            pagination: {
                total,
                page,
                limit: limitParam,
                totalPages: Math.ceil(total / limitParam)
            }
        });
    } catch (error) {
        console.error("API Error fetching posts:", error);
        return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
    }
}
