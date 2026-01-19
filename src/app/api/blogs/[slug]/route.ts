/**
 * Blog Details API Route
 * 
 * Handles fetching and updating individual blog posts by slug.
 * 
 * @route GET /api/blogs/[slug] - Get blog details
 * @route PUT /api/blogs/[slug] - Update blog (Admin only)
 * 
 * @example
 * ```tsx
 * // Get blog
 * const response = await fetch('/api/blogs/my-blog-post');
 * ```
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  serverTimestamp,
  increment,
} from "firebase/firestore";

interface RouteContext {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * GET /api/blogs/[slug]
 * 
 * Get blog details by slug.
 * Increments view count asynchronously.
 */
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const { slug } = await params;

    // Query blog by slug
    const blogQuery = query(
      collection(db, "blogs"),
      where("slug", "==", slug)
    );

    const querySnapshot = await getDocs(blogQuery);

    if (querySnapshot.empty) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    const blogDoc = querySnapshot.docs[0];
    const blogData = {
      id: blogDoc.id,
      ...blogDoc.data(),
    };

    // Increment view count asynchronously
    updateDoc(blogDoc.ref, {
      views: increment(1),
    }).catch((error) => {
      console.error("Error updating view count:", error);
    });

    return NextResponse.json(
      {
        success: true,
        data: blogData,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching blog:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog", details: error.message },
      { status: 500 }
    );
  }
}
