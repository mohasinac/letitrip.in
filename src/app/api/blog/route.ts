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

    let query = db.collection(COLLECTION).where("status", "==", status);

    if (category) {
      query = query.where("category", "==", category) as any;
    }

    if (showOnHomepage === "true") {
      query = query.where("showOnHomepage", "==", true) as any;
    }

    // Order by published date
    query = query.orderBy("publishedAt", "desc") as any;

    // Pagination
    const offset = (page - 1) * limit;
    query = query.limit(limit).offset(offset) as any;

    const snapshot = await query.get();

    const posts = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Get total count (for pagination)
    let countQuery = db.collection(COLLECTION).where("status", "==", status);
    if (category) {
      countQuery = countQuery.where("category", "==", category) as any;
    }
    if (showOnHomepage === "true") {
      countQuery = countQuery.where("showOnHomepage", "==", true) as any;
    }
    const countSnapshot = await countQuery.count().get();
    const total = countSnapshot.data().count;

    return NextResponse.json({
      data: posts,
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
