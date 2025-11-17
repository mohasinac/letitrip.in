import { NextRequest, NextResponse } from "next/server";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";

const COLLECTION = "blog_posts";

// GET /api/blog - List blog posts with cursor-based pagination
export async function GET(req: NextRequest) {
  try {
    const db = getFirestoreAdmin();
    const { searchParams } = new URL(req.url);

    // Pagination params
    const startAfter = searchParams.get("startAfter");
    const limit = parseInt(searchParams.get("limit") || "20");

    // Filter params
    const status = searchParams.get("status") || "published";
    const category = searchParams.get("category");
    const featured =
      searchParams.get("featured") || searchParams.get("showOnHomepage");

    // Sort params
    const sortBy = searchParams.get("sortBy") || "publishedAt";
    const sortOrder = (searchParams.get("sortOrder") || "desc") as
      | "asc"
      | "desc";

    // Build query using composite indexes
    let query: FirebaseFirestore.Query = db
      .collection(COLLECTION)
      .where("status", "==", status);

    // Apply filters
    if (featured === "true") {
      query = query.where("is_featured", "==", true);
    }
    if (category) {
      query = query.where("category", "==", category);
    }

    // Add sorting
    const validSortFields = [
      "publishedAt",
      "created_at",
      "view_count",
      "title",
    ];
    const sortField = validSortFields.includes(sortBy) ? sortBy : "publishedAt";
    query = query.orderBy(sortField, sortOrder);

    // Apply cursor pagination
    if (startAfter) {
      const startDoc = await db.collection(COLLECTION).doc(startAfter).get();
      if (startDoc.exists) {
        query = query.startAfter(startDoc);
      }
    }

    // Fetch limit + 1 to check if there's a next page
    query = query.limit(limit + 1);
    const snapshot = await query.get();
    const docs = snapshot.docs;

    // Check if there's a next page
    const hasNextPage = docs.length > limit;
    const resultDocs = hasNextPage ? docs.slice(0, limit) : docs;

    const posts = resultDocs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Get next cursor
    const nextCursor =
      hasNextPage && resultDocs.length > 0
        ? resultDocs[resultDocs.length - 1].id
        : null;

    return NextResponse.json({
      success: true,
      data: posts,
      count: posts.length,
      pagination: {
        limit,
        hasNextPage,
        nextCursor,
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
