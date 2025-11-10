import { NextRequest, NextResponse } from "next/server";
import { Collections } from "@/app/api/lib/firebase/collections";
import { getCurrentUser } from "../lib/session";

// GET /api/categories - List categories (public)
// POST /api/categories - Create category (admin only)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isFeatured = searchParams.get("isFeatured");
    const showOnHomepage = searchParams.get("showOnHomepage");
    const parentId = searchParams.get("parentId");

    let query: FirebaseFirestore.Query = Collections.categories();

    if (isFeatured !== null) {
      query = query.where("is_featured", "==", isFeatured === "true");
    }
    if (showOnHomepage !== null) {
      query = query.where("show_on_homepage", "==", showOnHomepage === "true");
    }
    if (parentId !== null) {
      query = query.where(
        "parent_id",
        "==",
        parentId === "null" ? null : parentId,
      );
    }

    const snapshot = await query.limit(200).get();
    const categories = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    console.error("Error listing categories:", error);
    return NextResponse.json(
      { success: false, error: "Failed to list categories" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (user?.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { name, slug } = body;
    if (!name || !slug) {
      return NextResponse.json(
        { success: false, error: "Name and slug are required" },
        { status: 400 },
      );
    }

    // Slug uniqueness (global)
    const existing = await Collections.categories()
      .where("slug", "==", slug)
      .limit(1)
      .get();
    if (!existing.empty) {
      return NextResponse.json(
        { success: false, error: "Category slug already exists" },
        { status: 400 },
      );
    }

    const now = new Date().toISOString();
    const docRef = await Collections.categories().add({
      name,
      slug,
      description: body.description || "",
      parent_id: body.parent_id || null,
      is_featured: !!body.is_featured,
      show_on_homepage: !!body.show_on_homepage,
      is_active: body.is_active !== false,
      meta_title: body.meta_title || "",
      meta_description: body.meta_description || "",
      sort_order: body.sort_order || 0,
      commission_rate: body.commission_rate || 0,
      created_at: now,
      updated_at: now,
    });

    const created = await docRef.get();
    return NextResponse.json(
      { success: true, data: { id: created.id, ...created.data() } },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create category" },
      { status: 500 },
    );
  }
}
