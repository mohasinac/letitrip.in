/**
 * Blogs API Routes
 *
 * Handles blog post listing and creation.
 *
 * @route GET /api/blogs - List blog posts
 * @route POST /api/blogs - Create blog post (Admin only)
 *
 * @example
 * ```tsx
 * // List blogs
 * const response = await fetch('/api/blogs?category=tech&limit=10');
 *
 * // Create blog
 * const response = await fetch('/api/blogs', {
 *   method: 'POST',
 *   body: JSON.stringify({
 *     title: 'Blog Title',
 *     slug: 'blog-title',
 *     content: 'Blog content...',
 *     ...
 *   })
 * });
 * ```
 */

import { db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  startAfter,
  where,
} from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/blogs
 *
 * List blog posts with filtering and pagination.
 *
 * Query Parameters:
 * - category: Filter by category slug
 * - author: Filter by author ID
 * - featured: Filter featured posts (true/false)
 * - status: Filter by status (draft/published)
 * - sort: Sort order (newest, oldest, popular)
 * - limit: Results per page (default 10, max 50)
 * - cursor: Pagination cursor
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const author = searchParams.get("author");
    const featuredParam = searchParams.get("featured");
    const status = searchParams.get("status") || "published";
    const sortBy = searchParams.get("sort") || "newest";
    const pageLimit = Math.min(parseInt(searchParams.get("limit") || "10"), 50);
    const cursor = searchParams.get("cursor");

    // Build query constraints
    const constraints: any[] = [];

    constraints.push(where("status", "==", status));

    if (category) {
      constraints.push(where("categorySlug", "==", category));
    }
    if (author) {
      constraints.push(where("authorId", "==", author));
    }
    if (featuredParam === "true") {
      constraints.push(where("featured", "==", true));
    }

    // Add sorting
    switch (sortBy) {
      case "oldest":
        constraints.push(orderBy("publishedAt", "asc"));
        break;
      case "popular":
        constraints.push(orderBy("views", "desc"));
        break;
      case "newest":
      default:
        constraints.push(orderBy("publishedAt", "desc"));
        break;
    }

    constraints.push(limit(pageLimit));

    // Handle cursor pagination
    if (cursor) {
      const cursorDoc = await getDoc(doc(db, "blogs", cursor));
      if (cursorDoc.exists()) {
        constraints.push(startAfter(cursorDoc));
      }
    }

    // Execute query
    const blogsQuery = query(collection(db, "blogs"), ...constraints);
    const querySnapshot = await getDocs(blogsQuery);

    const blogs = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Get last document for pagination
    const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
    const nextCursor = lastDoc ? lastDoc.id : null;

    return NextResponse.json(
      {
        success: true,
        data: {
          blogs,
          nextCursor,
          hasMore: querySnapshot.docs.length === pageLimit,
          filters: {
            category,
            author,
            featured: featuredParam,
            status,
            sort: sortBy,
          },
        },
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error fetching blogs:", error);
    return NextResponse.json(
      { error: "Failed to fetch blogs", details: error.message },
      { status: 500 },
    );
  }
}

interface CreateBlogRequest {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  authorId: string;
  categorySlug?: string;
  tags?: string[];
  featuredImage?: string;
  featured?: boolean;
  status?: "draft" | "published";
}

/**
 * POST /api/blogs
 *
 * Create a new blog post (Admin only).
 *
 * Request Body:
 * - title: Blog title (required)
 * - slug: URL-friendly slug (required, unique)
 * - excerpt: Short description (required)
 * - content: Full blog content (required)
 * - authorId: Author user ID (required)
 * - categorySlug: Category slug (optional)
 * - tags: Array of tags (optional)
 * - featuredImage: Featured image URL (optional)
 * - featured: Featured flag (default false)
 * - status: Post status (default 'draft')
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateBlogRequest = await request.json();
    const {
      title,
      slug,
      excerpt,
      content,
      authorId,
      categorySlug,
      tags = [],
      featuredImage,
      featured = false,
      status = "draft",
    } = body;

    // Validate required fields
    if (!title || !slug || !excerpt || !content || !authorId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Check if slug already exists
    const existingBlogQuery = query(
      collection(db, "blogs"),
      where("slug", "==", slug),
    );
    const existingBlogs = await getDocs(existingBlogQuery);

    if (!existingBlogs.empty) {
      return NextResponse.json(
        { error: "Blog with this slug already exists" },
        { status: 409 },
      );
    }

    // Create blog document
    const blogData = {
      title,
      slug,
      excerpt,
      content,
      authorId,
      categorySlug: categorySlug || null,
      tags,
      featuredImage: featuredImage || null,
      featured,
      status,
      views: 0,
      commentCount: 0,
      publishedAt: status === "published" ? serverTimestamp() : null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, "blogs"), blogData);

    return NextResponse.json(
      {
        success: true,
        data: {
          id: docRef.id,
          ...blogData,
        },
        message: "Blog post created successfully",
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Error creating blog:", error);

    if (error.code === "permission-denied") {
      return NextResponse.json(
        { error: "Insufficient permissions to create blog" },
        { status: 403 },
      );
    }

    return NextResponse.json(
      { error: "Failed to create blog", details: error.message },
      { status: 500 },
    );
  }
}
