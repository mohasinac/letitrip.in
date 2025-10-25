import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/database/admin";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    const excludeId = searchParams.get("excludeId");

    if (!slug) {
      return NextResponse.json(
        { success: false, error: "Slug parameter is required" },
        { status: 400 }
      );
    }

    const db = getAdminDb();
    let query: any = db.collection("categories").where("slug", "==", slug);

    const snapshot = await query.get();
    
    // Check if slug exists, excluding current category if provided
    const exists = snapshot.docs.some((doc: any) => doc.id !== excludeId);

    return NextResponse.json({
      success: true,
      data: {
        available: !exists,
        slug
      }
    });
  } catch (error) {
    console.error("Error validating slug:", error);
    return NextResponse.json(
      { success: false, error: "Failed to validate slug" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, excludeId } = await request.json();

    if (!name) {
      return NextResponse.json(
        { success: false, error: "Name is required" },
        { status: 400 }
      );
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens

    const db = getAdminDb();
    let finalSlug = slug;
    let counter = 1;

    // Check for uniqueness and increment if needed
    while (true) {
      const existingSlug = await db
        .collection("categories")
        .where("slug", "==", finalSlug)
        .get();

      const exists = existingSlug.docs.some((doc: any) => doc.id !== excludeId);
      
      if (!exists) {
        break;
      }
      
      finalSlug = `${slug}-${counter}`;
      counter++;
    }

    return NextResponse.json({
      success: true,
      data: {
        slug: finalSlug,
        available: true
      }
    });
  } catch (error) {
    console.error("Error generating slug:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate slug" },
      { status: 500 }
    );
  }
}
