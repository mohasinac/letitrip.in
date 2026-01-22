/**
 * CMS Pages API Route
 *
 * Handles listing and managing CMS pages (About, Privacy, Terms, etc.)
 * Returns fallback data when Firebase fails or returns empty.
 *
 * @route GET /api/cms/pages - List all CMS pages
 * @route POST /api/cms/pages - Create CMS page (Admin only)
 */

import { FALLBACK_CMS_PAGES } from "@/lib/fallback-data";
import { db } from "@/lib/firebase";
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
 * GET /api/cms/pages
 * List all CMS pages or filter by slug/status
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    const status = searchParams.get("status") || "published";
    const featured = searchParams.get("featured");

    // Build query
    const constraints: any[] = [];

    if (slug) {
      constraints.push(where("slug", "==", slug));
    }

    if (status) {
      constraints.push(where("status", "==", status));
    }

    if (featured === "true") {
      constraints.push(where("featured", "==", true));
    }

    constraints.push(orderBy("updatedAt", "desc"));

    const pagesQuery = query(collection(db, "cms_pages"), ...constraints);
    const querySnapshot = await getDocs(pagesQuery);

    const pages = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Return fallback if empty (development only)
    if (pages.length === 0 && process.env.NODE_ENV !== "production") {
      console.warn(
        "No CMS pages found - Returning fallback data (development only)",
      );

      let fallbackPages = FALLBACK_CMS_PAGES;

      if (slug) {
        fallbackPages = fallbackPages.filter((p) => p.slug === slug);
      }

      if (featured === "true") {
        fallbackPages = fallbackPages.filter((p) => p.featured);
      }

      return NextResponse.json(
        {
          success: true,
          fallback: true,
          data: fallbackPages,
        },
        { status: 200 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: pages,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error fetching CMS pages:", error);

    // Return fallback data only in development
    if (process.env.NODE_ENV !== "production") {
      console.warn("Returning fallback data (development only)");
      return NextResponse.json(
        {
          success: true,
          fallback: true,
          data: FALLBACK_CMS_PAGES,
        },
        { status: 200 },
      );
    }

    // In production, return error
    return NextResponse.json(
      {
        error: "Failed to fetch CMS pages",
        details: error.message,
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/cms/pages
 * Create new CMS page (Admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      slug,
      title,
      content,
      metaTitle,
      metaDescription,
      status = "draft",
      featured = false,
    } = body;

    // Validate required fields
    if (!slug || !title || !content) {
      return NextResponse.json(
        { error: "Slug, title, and content are required" },
        { status: 400 },
      );
    }

    // Check if slug exists
    const existingQuery = query(
      collection(db, "cms_pages"),
      where("slug", "==", slug),
    );
    const existing = await getDocs(existingQuery);

    if (!existing.empty) {
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
      metaTitle: metaTitle || title,
      metaDescription: metaDescription || "",
      status,
      featured,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, "cms_pages"), pageData);

    return NextResponse.json(
      {
        success: true,
        data: {
          id: docRef.id,
          ...pageData,
        },
        message: "CMS page created successfully",
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Error creating CMS page:", error);

    return NextResponse.json(
      {
        error: "Failed to create CMS page",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
