import { NextRequest, NextResponse } from "next/server";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";

const COLLECTION = "blog_posts";

// GET /api/blog - List blog posts with filters
export async function GET(req: NextRequest) {
  try {
    const db = getFirestoreAdmin();
    const { searchParams } = new URL(req.url);

    const status = searchParams.get("status") || "published";
    const category = searchParams.get("category");
    const showOnHomepage = searchParams.get("showOnHomepage");
    const limit = parseInt(searchParams.get("limit") || "20");
    const page = parseInt(searchParams.get("page") || "1");

    // Start with status filter (most common)
    let query = db.collection(COLLECTION).where("status", "==", status);

    // Apply only ONE additional filter to avoid composite index requirements
    if (showOnHomepage === "true") {
      query = query.where("showOnHomepage", "==", true) as any;
    } else if (category) {
      query = query.where("category", "==", category) as any;
    }

    // Get all matching docs and sort/paginate in memory
    const snapshot = await query.limit(limit * 10).get(); // Get more to allow filtering

    let posts = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Apply client-side filtering if needed
    if (showOnHomepage === "true" && category) {
      posts = posts.filter((p: any) => p.category === category);
    }

    // Sort by publishedAt in memory
    posts.sort((a: any, b: any) => {
      const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return dateB - dateA;
    });

    // Apply pagination in memory
    const total = posts.length;
    const offset = (page - 1) * limit;
    const paginatedPosts = posts.slice(offset, offset + limit);

    return NextResponse.json({
      data: paginatedPosts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog posts" },
      { status: 500 },
    );
  }
}

// POST /api/blog - Create new blog post (admin only)
export async function POST(req: NextRequest) {
  try {
    const db = getFirestoreAdmin();
    const body = await req.json();

    const {
      title,
      slug,
      excerpt,
      content,
      featuredImage,
      author,
      category,
      tags,
      status,
      showOnHomepage,
      isFeatured,
    } = body;

    if (!title || !slug || !content) {
      return NextResponse.json(
        { error: "Missing required fields: title, slug, content" },
        { status: 400 },
      );
    }

    // Check if slug already exists
    const existingSlug = await db
      .collection(COLLECTION)
      .where("slug", "==", slug)
      .limit(1)
      .get();

    if (!existingSlug.empty) {
      return NextResponse.json(
        { error: "A blog post with this slug already exists" },
        { status: 400 },
      );
    }

    const now = new Date().toISOString();
    const post = {
      title,
      slug,
      excerpt: excerpt || "",
      content,
      featuredImage: featuredImage || null,
      author: author || { name: "Admin", id: "admin" },
      category: category || "Uncategorized",
      tags: tags || [],
      status: status || "draft",
      showOnHomepage: showOnHomepage || false,
      isFeatured: isFeatured || false,
      views: 0,
      likes: 0,
      publishedAt: status === "published" ? now : null,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await db.collection(COLLECTION).add(post);

    return NextResponse.json({
      id: docRef.id,
      ...post,
    });
  } catch (error) {
    console.error("Error creating blog post:", error);
    return NextResponse.json(
      { error: "Failed to create blog post" },
      { status: 500 },
    );
  }
}
