/**
 * Admin CMS Page Detail API
 *
 * Get, update, or delete specific CMS page.
 *
 * @route GET /api/admin/cms/pages/[id] - Get page details
 * @route PUT /api/admin/cms/pages/[id] - Update page
 * @route DELETE /api/admin/cms/pages/[id] - Delete page
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
 * GET - Get CMS page details
 */
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    await requireRole(["admin"]);

    const { id } = await params;

    const pageDoc = await getDoc(doc(db, "cmsPages", id));

    if (!pageDoc.exists()) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          id: pageDoc.id,
          ...pageDoc.data(),
        },
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error fetching CMS page:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(
      {
        error: "Failed to fetch page",
        details: error.message,
      },
      { status: 500 },
    );
  }
}

/**
 * PUT - Update CMS page
 */
export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await requireRole(["admin"]);

    const { id } = await params;
    const body = await request.json();

    const pageRef = doc(db, "cmsPages", id);
    const pageDoc = await getDoc(pageRef);

    if (!pageDoc.exists()) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    // Update page
    const updateData: any = {
      updatedAt: serverTimestamp(),
      updatedBy: session.userId,
    };

    if (body.title !== undefined) updateData.title = body.title;
    if (body.content !== undefined) updateData.content = body.content;
    if (body.metaDescription !== undefined)
      updateData.metaDescription = body.metaDescription;
    if (body.published !== undefined) updateData.published = body.published;

    await updateDoc(pageRef, updateData);

    // Get updated page
    const updatedDoc = await getDoc(pageRef);

    return NextResponse.json(
      {
        success: true,
        message: "Page updated successfully",
        data: {
          id: updatedDoc.id,
          ...updatedDoc.data(),
        },
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error updating CMS page:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(
      {
        error: "Failed to update page",
        details: error.message,
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE - Delete CMS page
 */
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    await requireRole(["admin"]);

    const { id } = await params;

    const pageRef = doc(db, "cmsPages", id);
    const pageDoc = await getDoc(pageRef);

    if (!pageDoc.exists()) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    // Delete page
    await deleteDoc(pageRef);

    return NextResponse.json(
      {
        success: true,
        message: "Page deleted successfully",
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error deleting CMS page:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(
      {
        error: "Failed to delete page",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
