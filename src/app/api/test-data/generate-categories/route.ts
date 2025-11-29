import { NextResponse } from "next/server";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";

const PREFIX = "TEST_";

function getUnsplashImage(category: string, index: number): string {
  return `https://source.unsplash.com/800x600/?${category}&sig=${index}`;
}

export async function POST() {
  try {
    const db = getFirestoreAdmin();
    const categories = [];

    const categoryNames = [
      "Electronics",
      "Fashion",
      "Home & Kitchen",
      "Books",
      "Sports",
      "Toys",
      "Jewelry",
      "Beauty",
      "Automotive",
      "Garden",
    ];

    for (const name of categoryNames) {
      const categoryData: any = {
        name: `${PREFIX}${name}`,
        slug: `${PREFIX}${name
          .toLowerCase()
          .replace(/\s+/g, "-")}-${Date.now()}`,
        description: `Test category for ${name}`,
        parent_id: null,
        is_active: true,
        is_featured: Math.random() < 0.3,
        show_on_homepage: Math.random() < 0.2,
        sort_order: categories.length,
        image: getUnsplashImage(name.toLowerCase(), categories.length),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const docRef = await db.collection("categories").add(categoryData);
      categories.push({ id: docRef.id, ...categoryData });
    }

    return NextResponse.json({
      success: true,
      categories,
      count: categories.length,
    });
  } catch (error: any) {
    console.error("Error generating categories:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to generate categories",
      },
      { status: 500 },
    );
  }
}
