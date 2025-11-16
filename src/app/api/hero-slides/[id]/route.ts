import { NextRequest, NextResponse } from "next/server";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import {
  getUserFromRequest,
  requireRole,
} from "@/app/api/middleware/rbac-auth";
import { COLLECTIONS } from "@/constants/database";
import {
  NotFoundError,
  ForbiddenError,
  errorToJson,
  ApiError,
} from "@/lib/api-errors";

/**
 * GET /api/hero-slides/[id]
 * Public: Returns slide if active
 * Admin: Returns any slide
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getFirestoreAdmin();
    const user = await getUserFromRequest(req);

    const doc = await db
      .collection(COLLECTIONS.HERO_SLIDES)
      .doc(id)
      .get();

    if (!doc.exists) {
      throw new NotFoundError("Hero slide not found");
    }

    const data = doc.data()!;

    // Check if non-admin user can access this slide
    if (user?.role !== "admin" && !data.is_active) {
      throw new ForbiddenError("Cannot access inactive hero slide");
    }

    // Return different data structure based on user role
    const slide =
      user?.role === "admin"
        ? {
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
          }
        : {
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

    return NextResponse.json({ slide });
  } catch (error) {
    console.error("Error fetching hero slide:", error);
    if (error instanceof ApiError) {
      return NextResponse.json(errorToJson(error), {
        status: error.statusCode,
      });
    }
    return NextResponse.json(
      { error: "Failed to fetch hero slide" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/hero-slides/[id]
 * Admin only: Update hero slide
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Require admin role
    const roleResult = await requireRole(req, ["admin"]);
    if (roleResult.error) {
      return roleResult.error;
    }

    const db = getFirestoreAdmin();
    const body = await req.json();

    // Check if slide exists
    const docRef = db.collection(COLLECTIONS.HERO_SLIDES).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      throw new NotFoundError("Hero slide not found");
    }

    // Update slide
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    // Only update provided fields
    if (body.title !== undefined) updateData.title = body.title;
    if (body.subtitle !== undefined) updateData.subtitle = body.subtitle;
    if (body.description !== undefined)
      updateData.description = body.description;
    if (body.image_url !== undefined) updateData.image_url = body.image_url;
    if (body.link_url !== undefined) updateData.link_url = body.link_url;
    if (body.cta_text !== undefined) updateData.cta_text = body.cta_text;
    if (body.position !== undefined) updateData.position = body.position;
    if (body.is_active !== undefined) updateData.is_active = body.is_active;

    await docRef.update(updateData);

    const updatedDoc = await docRef.get();
    const updatedData = updatedDoc.data()!;

    return NextResponse.json({
      slide: {
        id: updatedDoc.id,
        title: updatedData.title,
        subtitle: updatedData.subtitle || "",
        description: updatedData.description || "",
        image_url: updatedData.image_url,
        link_url: updatedData.link_url || "",
        cta_text: updatedData.cta_text || "Shop Now",
        position: updatedData.position,
        is_active: updatedData.is_active,
        created_at: updatedData.created_at,
        updated_at: updatedData.updated_at,
      },
    });
  } catch (error) {
    console.error("Error updating hero slide:", error);
    if (error instanceof ApiError) {
      return NextResponse.json(errorToJson(error), {
        status: error.statusCode,
      });
    }
    return NextResponse.json(
      { error: "Failed to update hero slide" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/hero-slides/[id]
 * Admin only: Delete hero slide
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Require admin role
    const roleResult = await requireRole(req, ["admin"]);
    if (roleResult.error) {
      return roleResult.error;
    }

    const db = getFirestoreAdmin();
    const docRef = db.collection(COLLECTIONS.HERO_SLIDES).doc(id);

    // Check if slide exists
    const doc = await docRef.get();
    if (!doc.exists) {
      throw new NotFoundError("Hero slide not found");
    }

    // Delete slide
    await docRef.delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting hero slide:", error);
    if (error instanceof ApiError) {
      return NextResponse.json(errorToJson(error), {
        status: error.statusCode,
      });
    }
    return NextResponse.json(
      { error: "Failed to delete hero slide" },
      { status: 500 }
    );
  }
}
