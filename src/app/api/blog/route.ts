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
    const featured =
      searchParams.get("featured") || searchParams.get("showOnHomepage"); // Support both for backward compatibility
    const limit = parseInt(searchParams.get("limit") || "20");
    const page = parseInt(searchParams.get("page") || "1");

    // Build query using composite indexes
    let query = db.collection(COLLECTION).where("status", "==", status);

    // Use composite indexes for better performance
    if (featured === "true" && category) {
      // Index: status + is_featured + category + publishedAt
      query = query
        .where("is_featured", "==", true)
        .where("category", "==", category)
        .orderBy("publishedAt", "desc") as any;
    } else if (featured === "true") {
      // Index: status + is_featured + publishedAt
      query = query
        .where("is_featured", "==", true)
        .orderBy("publishedAt", "desc") as any;
    } else if (category) {
      // Index: status + category + publishedAt
      query = query
        .where("category", "==", category)
        .orderBy("publishedAt", "desc") as any;
    } else {
      // Index: status + publishedAt
      query = query.orderBy("publishedAt", "desc") as any;
    }

    // Apply pagination using offset
    const offset = (page - 1) * limit;
    query = query.limit(limit).offset(offset) as any;

    const snapshot = await query.get();

    const posts = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Get total count for pagination
    let countQuery = db.collection(COLLECTION).where("status", "==", status);
    if (featured === "true") {
      countQuery = countQuery.where("is_featured", "==", true) as any;
    }
    if (category) {
      countQuery = countQuery.where("category", "==", category) as any;
    }
    const countSnapshot = await countQuery.count().get();
    const total = countSnapshot.data().count;

    const paginatedPosts = posts;

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
      { status: 500 }
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
      featured,
    } = body;

    if (!title || !slug || !content) {
      return NextResponse.json(
        { error: "Missing required fields: title, slug, content" },
        { status: 400 }
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
        { status: 400 }
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
      is_featured: featured || false,
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
      { status: 500 }
    );
  }
}
