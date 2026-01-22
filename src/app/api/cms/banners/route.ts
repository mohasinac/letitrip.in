/**
 * CMS Banners API Route
 *
 * Manages promotional banners for homepage and category pages.
 * Returns fallback data when Firebase fails or returns empty.
 *
 * @route GET /api/cms/banners - List banners
 * @route POST /api/cms/banners - Create banner (Admin only)
 */

import { FALLBACK_CMS_BANNERS } from "@/lib/fallback-data";
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
 * GET /api/cms/banners
 * List all banners or filter by position/active status
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const position = searchParams.get("position");
    const active = searchParams.get("active");

    // Build query
    const constraints: any[] = [];

    if (position) {
      constraints.push(where("position", "==", position));
    }

    if (active === "true") {
      constraints.push(where("active", "==", true));
    }

    constraints.push(orderBy("order", "asc"));

    const bannersQuery = query(collection(db, "cms_banners"), ...constraints);
    const querySnapshot = await getDocs(bannersQuery);

    const banners = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Return fallback if empty
    if (banners.length === 0) {
      console.warn("No banners found - Returning fallback data");

      let fallbackBanners = FALLBACK_CMS_BANNERS;

      if (position) {
        fallbackBanners = fallbackBanners.filter(
          (b) => b.position === position,
        );
      }

      if (active === "true") {
        fallbackBanners = fallbackBanners.filter((b) => b.active);
      }

      return NextResponse.json(
        {
          success: true,
          fallback: true,
          data: fallbackBanners,
        },
        { status: 200 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: banners,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error fetching banners:", error);

    // Return fallback data only in development
    if (process.env.NODE_ENV !== "production") {
      console.warn("Returning fallback data (development only)");
      return NextResponse.json(
        {
          success: true,
          fallback: true,
          data: FALLBACK_CMS_BANNERS,
        },
        { status: 200 },
      );
    }

    // In production, return error
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
 * POST /api/cms/banners
 * Create new banner (Admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      subtitle,
      image,
      link,
      buttonText,
      position = "home-secondary",
      order = 99,
      active = true,
    } = body;

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
      buttonText: buttonText || "",
      position,
      order,
      active,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, "cms_banners"), bannerData);

    return NextResponse.json(
      {
        success: true,
        data: {
          id: docRef.id,
          ...bannerData,
        },
        message: "Banner created successfully",
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Error creating banner:", error);

    return NextResponse.json(
      {
        error: "Failed to create banner",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
