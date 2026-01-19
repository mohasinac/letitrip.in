/**
 * Blog Comments API Route
 * 
 * Handles adding comments to blog posts.
 * 
 * @route POST /api/blogs/[slug]/comments - Add comment to blog
 * @route GET /api/blogs/[slug]/comments - List comments for blog
 * 
 * @example
 * ```tsx
 * // Add comment
 * const response = await fetch('/api/blogs/my-post/comments', {
 *   method: 'POST',
 *   body: JSON.stringify({
 *     userId: 'user-id',
 *     comment: 'Great post!',
 *     ...
 *   })
 * });
 * ```
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  addDoc,
  serverTimestamp,
  updateDoc,
  increment,
} from "firebase/firestore";

interface RouteContext {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * GET /api/blogs/[slug]/comments
 * 
 * List comments for a blog post.
 * 
 * Query Parameters:
 * - limit: Number of comments (default 20, max 100)
 * - sort: Sort order (newest, oldest)
 */
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const pageLimit = Math.min(
      parseInt(searchParams.get("limit") || "20"),
      100
    );
    const sortBy = searchParams.get("sort") || "newest";

    // Query blog to get its ID
    const blogQuery = query(
      collection(db, "blogs"),
      where("slug", "==", slug)
    );
    const blogSnapshot = await getDocs(blogQuery);

    if (blogSnapshot.empty) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    const blogId = blogSnapshot.docs[0].id;

    // Query comments
    const commentsQuery = query(
      collection(db, "blogComments"),
      where("blogId", "==", blogId),
      orderBy("createdAt", sortBy === "oldest" ? "asc" : "desc"),
      limit(pageLimit)
    );

    const commentsSnapshot = await getDocs(commentsQuery);

    const comments = commentsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(
      {
        success: true,
        data: {
          blogSlug: slug,
          comments,
          total: comments.length,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments", details: error.message },
      { status: 500 }
    );
  }
}

interface AddCommentRequest {
  userId: string;
  userName: string;
  userAvatar?: string;
  comment: string;
}

/**
 * POST /api/blogs/[slug]/comments
 * 
 * Add a comment to a blog post.
 * 
 * Request Body:
 * - userId: User ID (required)
 * - userName: User display name (required)
 * - userAvatar: User avatar URL (optional)
 * - comment: Comment text (required)
 */
export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const { slug } = await params;
    const body: AddCommentRequest = await request.json();
    const { userId, userName, userAvatar, comment } = body;

    // Validate required fields
    if (!userId || !userName || !comment) {
      return NextResponse.json(
        { error: "userId, userName, and comment are required" },
        { status: 400 }
      );
    }

    if (comment.trim().length < 2) {
      return NextResponse.json(
        { error: "Comment must be at least 2 characters" },
        { status: 400 }
      );
    }

    // Query blog to get its ID
    const blogQuery = query(
      collection(db, "blogs"),
      where("slug", "==", slug)
    );
    const blogSnapshot = await getDocs(blogQuery);

    if (blogSnapshot.empty) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    const blogDoc = blogSnapshot.docs[0];
    const blogId = blogDoc.id;

    // Create comment document
    const commentData = {
      blogId,
      blogSlug: slug,
      userId,
      userName,
      userAvatar: userAvatar || null,
      comment: comment.trim(),
      status: "published",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, "blogComments"), commentData);

    // Update blog comment count
    await updateDoc(blogDoc.ref, {
      commentCount: increment(1),
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: docRef.id,
          ...commentData,
        },
        message: "Comment added successfully",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error adding comment:", error);

    if (error.code === "permission-denied") {
      return NextResponse.json(
        { error: "Insufficient permissions to add comment" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: "Failed to add comment", details: error.message },
      { status: 500 }
    );
  }
}
