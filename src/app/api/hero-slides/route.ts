import { NextRequest, NextResponse } from "next/server";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import {
  getUserFromRequest,
  requireRole,
} from "@/app/api/middleware/rbac-auth";
import { COLLECTIONS } from "@/constants/database";
import { ValidationError, errorToJson, ApiError } from "@/lib/api-errors";

/**
 * GET /api/hero-slides
 * Public: Returns only active slides
 * Admin: Returns all slides
 */
export async function GET(req: NextRequest) {
  try {
    const db = getFirestoreAdmin();
    const user = await getUserFromRequest(req);

    let query = db.collection(COLLECTIONS.HERO_SLIDES);

    // Filter by active status for non-admin users
    if (!user || user.role !== "admin") {
      query = query.where("is_active", "==", true) as any;
    }

    // Get slides ordered by position
    const snapshot = await query.orderBy("position", "asc").get();

    const slides = snapshot.docs.map((doc) => {
      const data = doc.data();

      // Return different data structure based on user role
      if (user?.role === "admin") {
        // Admin gets full data
        return {
          id: doc.id,
          title: data.title,
          subtitle: data.subtitle || "",
          description: data.description || "",
          image_url: data.image_url,
          link_url: data.link_url || "",
          cta_text: data.cta_text || "Shop Now",
          position: data.position,
          is_active: data.is_active,
          created_at: data.created_at,
          updated_at: data.updated_at,
        };
      } else {
        // Public gets simplified data
        return {
          id: doc.id,
          image: data.image_url,
          title: data.title,
          subtitle: data.subtitle || "",
          description: data.description || "",
          ctaText: data.cta_text || "Shop Now",
          ctaLink: data.link_url || "/",
          order: data.position,
          enabled: data.is_active,
        };
      }
    });

    return NextResponse.json({ slides });
  } catch (error) {
    console.error("Error fetching hero slides:", error);
    if (error instanceof ApiError) {
      return NextResponse.json(errorToJson(error), {
        status: error.statusCode,
      });
    }
    // Return empty array for public to prevent breaking frontend
    return NextResponse.json({ slides: [] });
  }
}

/**
 * POST /api/hero-slides
 * Admin only: Create new hero slide
 */
export async function POST(req: NextRequest) {
  try {
    // Require admin role
    const roleResult = await requireRole(req, ["admin"]);
    if (roleResult.error) {
      return roleResult.error;
    }

    const db = getFirestoreAdmin();
    const body = await req.json();

    // Validate required fields
    if (!body.title || !body.image_url) {
      const errors: Record<string, string> = {};
      if (!body.title) errors.title = "Title is required";
      if (!body.image_url) errors.image_url = "Image is required";
      throw new ValidationError("Title and image are required", errors);
    }

    // Get max position
    const maxSnapshot = await db
      .collection(COLLECTIONS.HERO_SLIDES)
      .orderBy("position", "desc")
      .limit(1)
      .get();

    const maxPosition = maxSnapshot.empty
      ? 0
      : maxSnapshot.docs[0].data().position;

    // Create slide data
    const slideData = {
      title: body.title,
      subtitle: body.subtitle || "",
      description: body.description || "",
      image_url: body.image_url,
      link_url: body.link_url || "",
      cta_text: body.cta_text || "Shop Now",
      position: body.position ?? maxPosition + 1,
      is_active: body.is_active ?? true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const docRef = await db.collection(COLLECTIONS.HERO_SLIDES).add(slideData);

    return NextResponse.json(
      {
        slide: {
          id: docRef.id,
          ...slideData,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating hero slide:", error);
    if (error instanceof ApiError) {
      return NextResponse.json(errorToJson(error), {
        status: error.statusCode,
      });
    }
    return NextResponse.json(
      { error: "Failed to create hero slide" },
      { status: 500 }
    );
  }
}
