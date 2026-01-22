/**
 * Admin CMS Pages API
 *
 * Manage static pages (About, Terms, Privacy, FAQ, etc.)
 *
 * @route GET /api/admin/cms/pages - List all pages
 * @route POST /api/admin/cms/pages - Create page
 *
 * @example
 * ```tsx
 * // List pages
 * const response = await fetch('/api/admin/cms/pages');
 *
 * // Create page
 * const response = await fetch('/api/admin/cms/pages', {
 *   method: 'POST',
 *   body: JSON.stringify({
 *     slug: 'about',
 *     title: 'About Us',
 *     content: '...',
 *     published: true
 *   })
 * });
 * ```
 */

import { db } from "@/lib/firebase";
import { requireRole } from "@/lib/session";
import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET - List all CMS pages
 */
export async function GET(request: NextRequest) {
  try {
    await requireRole(["admin"]);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    let pagesQuery = query(
      collection(db, "cmsPages"),
      orderBy("updatedAt", "desc"),
    );

    if (status) {
      pagesQuery = query(
        collection(db, "cmsPages"),
        where("published", "==", status === "published"),
        orderBy("updatedAt", "desc"),
      );
    }

    const pagesSnapshot = await getDocs(pagesQuery);
    const pages = pagesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(
      {
        success: true,
        data: pages,
        count: pages.length,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error fetching CMS pages:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(
      {
        error: "Failed to fetch pages",
        details: error.message,
      },
      { status: 500 },
    );
  }
}

/**
 * POST - Create CMS page
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireRole(["admin"]);

    const body = await request.json();
    const { slug, title, content, metaDescription, published } = body;

    // Validate required fields
    if (!slug || !title || !content) {
      return NextResponse.json(
        { error: "Slug, title, and content are required" },
        { status: 400 },
      );
    }

    // Check if slug already exists
    const existingQuery = query(
      collection(db, "cmsPages"),
      where("slug", "==", slug),
    );
    const existingSnapshot = await getDocs(existingQuery);

    if (!existingSnapshot.empty) {
      return NextResponse.json(
        { error: "Page with this slug already exists" },
        { status: 409 },
      );
    }

    // Create page
    const pageData = {
      slug,
      title,
      content,
      metaDescription: metaDescription || "",
      published: published || false,
      createdBy: session.userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const pageRef = await addDoc(collection(db, "cmsPages"), pageData);

    return NextResponse.json(
      {
        success: true,
        message: "Page created successfully",
        data: {
          id: pageRef.id,
          ...pageData,
        },
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Error creating CMS page:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(
      {
        error: "Failed to create page",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
