/**
 * Admin CMS Banners API
 *
 * Manage homepage/promotional banners.
 *
 * @route GET /api/admin/cms/banners - List all banners
 * @route POST /api/admin/cms/banners - Create banner
 *
 * @example
 * ```tsx
 * // Create banner
 * const response = await fetch('/api/admin/cms/banners', {
 *   method: 'POST',
 *   body: JSON.stringify({
 *     title: 'Summer Sale',
 *     image: 'https://...',
 *     link: '/sale',
 *     active: true,
 *     order: 1
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
 * GET - List all banners
 */
export async function GET(request: NextRequest) {
  try {
    await requireRole(["admin"]);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    let bannersQuery = query(
      collection(db, "banners"),
      orderBy("order", "asc"),
    );

    if (status === "active") {
      bannersQuery = query(
        collection(db, "banners"),
        where("active", "==", true),
        orderBy("order", "asc"),
      );
    } else if (status === "inactive") {
      bannersQuery = query(
        collection(db, "banners"),
        where("active", "==", false),
        orderBy("order", "asc"),
      );
    }

    const bannersSnapshot = await getDocs(bannersQuery);
    const banners = bannersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(
      {
        success: true,
        data: banners,
        count: banners.length,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error fetching banners:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(
      {
        error: "Failed to fetch banners",
        details: error.message,
      },
      { status: 500 },
    );
  }
}

/**
 * POST - Create banner
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireRole(["admin"]);

    const body = await request.json();
    const { title, subtitle, image, link, active, order, startDate, endDate } =
      body;

    // Validate required fields
    if (!title || !image) {
      return NextResponse.json(
        { error: "Title and image are required" },
        { status: 400 },
      );
    }

    // Create banner
    const bannerData = {
      title,
      subtitle: subtitle || "",
      image,
      link: link || "",
      active: active !== undefined ? active : true,
      order: order || 0,
      startDate: startDate || null,
      endDate: endDate || null,
      createdBy: session.userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const bannerRef = await addDoc(collection(db, "banners"), bannerData);

    return NextResponse.json(
      {
        success: true,
        message: "Banner created successfully",
        data: {
          id: bannerRef.id,
          ...bannerData,
        },
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Error creating banner:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(
      {
        error: "Failed to create banner",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
