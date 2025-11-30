import { NextRequest, NextResponse } from "next/server";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import {
  parseSieveQuery,
  blogSieveConfig,
  createPaginationMeta,
} from "@/app/api/lib/sieve";

const COLLECTION = "blog_posts";

// Extended Sieve config with field mappings for blog posts
const blogConfig = {
  ...blogSieveConfig,
  fieldMappings: {
    createdAt: "created_at",
    publishedAt: "publishedAt",
    viewCount: "view_count",
    featured: "is_featured",
  } as Record<string, string>,
};

/**
 * Transform blog post document to API response format
 */
function transformBlogPost(id: string, data: any) {
  return {
    id,
    ...data,
    featured: data.is_featured,
    viewCount: data.view_count,
  };
}

/**
 * GET /api/blog
 * List blog posts with Sieve pagination
 * Query Format: ?page=1&pageSize=20&sorts=-publishedAt&filters=status==published
 */
export async function GET(req: NextRequest) {
  try {
    const db = getFirestoreAdmin();
    const { searchParams } = new URL(req.url);

    // Parse Sieve query
    const { query: sieveQuery, errors, warnings } = parseSieveQuery(
      searchParams,
      blogConfig
    );

    if (errors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid query parameters",
          details: errors,
        },
        { status: 400 }
      );
    }

    // Legacy query params support (for backward compatibility)
    const status = searchParams.get("status") || "published";
    const category = searchParams.get("category");
    const featured = searchParams.get("featured") || searchParams.get("showOnHomepage");

    let query: FirebaseFirestore.Query = db.collection(COLLECTION)
      .where("status", "==", status);

    // Apply legacy filters
    if (featured === "true") {
      query = query.where("is_featured", "==", true);
    }
    if (category) {
      query = query.where("category", "==", category);
    }

    // Apply Sieve filters
    for (const filter of sieveQuery.filters) {
      const dbField = blogConfig.fieldMappings[filter.field] || filter.field;
      if (["==", "!=", ">", ">=", "<", "<="].includes(filter.operator)) {
        query = query.where(dbField, filter.operator as FirebaseFirestore.WhereFilterOp, filter.value);
      }
    }

    // Apply sorting
    if (sieveQuery.sorts.length > 0) {
      for (const sort of sieveQuery.sorts) {
        const dbField = blogConfig.fieldMappings[sort.field] || sort.field;
        query = query.orderBy(dbField, sort.direction);
      }
    } else {
      query = query.orderBy("publishedAt", "desc");
    }

    // Get total count
    const countSnapshot = await query.count().get();
    const totalCount = countSnapshot.data().count;

    // Apply pagination
    const offset = (sieveQuery.page - 1) * sieveQuery.pageSize;
    if (offset > 0) {
      const skipSnapshot = await query.limit(offset).get();
      if (skipSnapshot.docs.length > 0) {
        const lastDoc = skipSnapshot.docs[skipSnapshot.docs.length - 1];
        query = query.startAfter(lastDoc);
      }
    }
    query = query.limit(sieveQuery.pageSize);

    // Execute query
    const snapshot = await query.get();
    const data = snapshot.docs.map((doc) => transformBlogPost(doc.id, doc.data()));

    // Build response with Sieve pagination meta
    const pagination = createPaginationMeta(totalCount, sieveQuery);

    return NextResponse.json({
      success: true,
      data,
      pagination,
      meta: {
        appliedFilters: sieveQuery.filters,
        appliedSorts: sieveQuery.sorts,
        warnings: warnings.length > 0 ? warnings : undefined,
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
        { status: 400 },
      );
    }

    // Check if slug/ID already exists (slug is used as document ID)
    const existingDoc = await db.collection(COLLECTION).doc(slug).get();

    if (existingDoc.exists) {
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
      is_featured: featured || false,
      views: 0,
      likes: 0,
      publishedAt: status === "published" ? now : null,
      createdAt: now,
      updatedAt: now,
    };

    // Use slug as document ID for SEO-friendly URLs
    await db.collection(COLLECTION).doc(slug).set(post);

    return NextResponse.json({
      id: slug,
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
