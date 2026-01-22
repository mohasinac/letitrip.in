/**
 * Admin CMS Banner Detail API
 *
 * Get, update, or delete specific banner.
 *
 * @route GET /api/admin/cms/banners/[id] - Get banner
 * @route PUT /api/admin/cms/banners/[id] - Update banner
 * @route DELETE /api/admin/cms/banners/[id] - Delete banner
 */

import { db } from "@/lib/firebase";
import { requireRole } from "@/lib/session";
import {
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET - Get banner details
 */
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    await requireRole(["admin"]);

    const { id } = await params;

    const bannerDoc = await getDoc(doc(db, "banners", id));

    if (!bannerDoc.exists()) {
      return NextResponse.json({ error: "Banner not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          id: bannerDoc.id,
          ...bannerDoc.data(),
        },
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error fetching banner:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(
      {
        error: "Failed to fetch banner",
        details: error.message,
      },
      { status: 500 },
    );
  }
}

/**
 * PUT - Update banner
 */
export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await requireRole(["admin"]);

    const { id } = await params;
    const body = await request.json();

    const bannerRef = doc(db, "banners", id);
    const bannerDoc = await getDoc(bannerRef);

    if (!bannerDoc.exists()) {
      return NextResponse.json({ error: "Banner not found" }, { status: 404 });
    }

    // Update banner
    const updateData: any = {
      updatedAt: serverTimestamp(),
      updatedBy: session.userId,
    };

    if (body.title !== undefined) updateData.title = body.title;
    if (body.subtitle !== undefined) updateData.subtitle = body.subtitle;
    if (body.image !== undefined) updateData.image = body.image;
    if (body.link !== undefined) updateData.link = body.link;
    if (body.active !== undefined) updateData.active = body.active;
    if (body.order !== undefined) updateData.order = body.order;
    if (body.startDate !== undefined) updateData.startDate = body.startDate;
    if (body.endDate !== undefined) updateData.endDate = body.endDate;

    await updateDoc(bannerRef, updateData);

    // Get updated banner
    const updatedDoc = await getDoc(bannerRef);

    return NextResponse.json(
      {
        success: true,
        message: "Banner updated successfully",
        data: {
          id: updatedDoc.id,
          ...updatedDoc.data(),
        },
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error updating banner:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(
      {
        error: "Failed to update banner",
        details: error.message,
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE - Delete banner
 */
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    await requireRole(["admin"]);

    const { id } = await params;

    const bannerRef = doc(db, "banners", id);
    const bannerDoc = await getDoc(bannerRef);

    if (!bannerDoc.exists()) {
      return NextResponse.json({ error: "Banner not found" }, { status: 404 });
    }

    // Delete banner
    await deleteDoc(bannerRef);

    return NextResponse.json(
      {
        success: true,
        message: "Banner deleted successfully",
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error deleting banner:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(
      {
        error: "Failed to delete banner",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
