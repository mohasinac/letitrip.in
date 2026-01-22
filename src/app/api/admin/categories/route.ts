/**
 * Admin Categories API
 *
 * Manage platform categories.
 *
 * @route GET /api/admin/categories - List all categories (requires admin)
 * @route POST /api/admin/categories - Create category (requires admin)
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
 * GET - List all categories
 */
export async function GET(request: NextRequest) {
  try {
    await requireRole(["admin"]);

    const categoriesQuery = query(
      collection(db, "categories"),
      orderBy("name", "asc"),
    );
    const querySnapshot = await getDocs(categoriesQuery);

    const categories = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(
      {
        success: true,
        data: {
          categories,
          count: categories.length,
        },
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error fetching categories:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(
      {
        error: "Failed to fetch categories",
        details: error.message,
      },
      { status: 500 },
    );
  }
}

/**
 * POST - Create new category
 */
export async function POST(request: NextRequest) {
  try {
    await requireRole(["admin"]);

    const body = await request.json();
    const { name, slug, description, icon, parentId } = body;

    // Validate required fields
    if (!name || !slug) {
      return NextResponse.json(
        { error: "Name and slug are required" },
        { status: 400 },
      );
    }

    // Check if slug already exists
    const existingQuery = query(
      collection(db, "categories"),
      where("slug", "==", slug),
    );
    const existingDocs = await getDocs(existingQuery);

    if (!existingDocs.empty) {
      return NextResponse.json(
        { error: "Category with this slug already exists" },
        { status: 409 },
      );
    }

    // Create category
    const categoryData = {
      name,
      slug,
      description: description || "",
      icon: icon || "",
      parentId: parentId || null,
      productCount: 0,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const categoryRef = await addDoc(
      collection(db, "categories"),
      categoryData,
    );

    return NextResponse.json(
      {
        success: true,
        message: "Category created successfully",
        data: {
          id: categoryRef.id,
          ...categoryData,
        },
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Error creating category:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(
      {
        error: "Failed to create category",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
