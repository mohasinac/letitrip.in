import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/database/admin";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");

    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        products: [],
        categories: [],
        stores: [],
      });
    }

    const db = getAdminDb();
    const searchTerm = query.toLowerCase().trim();

    // Search products (limit to 5 results)
    const productsSnapshot = await db
      .collection("products")
      .where("status", "==", "active")
      .orderBy("name")
      .limit(50)
      .get();

    const products = productsSnapshot.docs
      .filter((doc: any) => {
        const data = doc.data();
        const name = (data.name || "").toLowerCase();
        const description = (data.description || "").toLowerCase();
        const sku = (data.sku || "").toLowerCase();
        return (
          name.includes(searchTerm) ||
          description.includes(searchTerm) ||
          sku.includes(searchTerm)
        );
      })
      .slice(0, 5)
      .map((doc: any) => {
        const data = doc.data();
        return {
          type: "product",
          id: doc.id,
          name: data.name,
          slug: data.slug,
          image: data.images?.[0]?.url,
          price: data.price,
        };
      });

    // Search categories (limit to 3 results)
    const categoriesSnapshot = await db
      .collection("categories")
      .where("isActive", "==", true)
      .orderBy("name")
      .limit(30)
      .get();

    const categories = categoriesSnapshot.docs
      .filter((doc: any) => {
        const data = doc.data();
        const name = (data.name || "").toLowerCase();
        const description = (data.description || "").toLowerCase();
        return name.includes(searchTerm) || description.includes(searchTerm);
      })
      .slice(0, 3)
      .map((doc: any) => {
        const data = doc.data();
        return {
          type: "category",
          id: doc.id,
          name: data.name,
          slug: data.slug,
          description: data.description,
          image: data.image,
        };
      });

    // Search stores (limit to 3 results)
    const storesSnapshot = await db
      .collection("users")
      .where("role", "==", "seller")
      .where("isApproved", "==", true)
      .orderBy("storeName")
      .limit(30)
      .get();

    const stores = storesSnapshot.docs
      .filter((doc: any) => {
        const data = doc.data();
        const storeName = (data.storeName || "").toLowerCase();
        const storeDescription = (data.storeDescription || "").toLowerCase();
        return (
          storeName.includes(searchTerm) || storeDescription.includes(searchTerm)
        );
      })
      .slice(0, 3)
      .map((doc: any) => {
        const data = doc.data();
        return {
          type: "store",
          id: doc.id,
          name: data.storeName,
          slug: data.storeSlug || doc.id,
          description: data.storeDescription,
        };
      });

    return NextResponse.json({
      products,
      categories,
      stores,
    });
  } catch (error: any) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Search failed", details: error.message },
      { status: 500 }
    );
  }
}
