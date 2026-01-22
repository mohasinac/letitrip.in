/**
 * Seller Products API
 *
 * Manage seller's products.
 *
 * @route GET /api/seller/products - List seller's products (requires seller/admin)
 * @route POST /api/seller/products - Create product (requires seller/admin)
 */

import { db } from "@/lib/firebase";
import { requireRole } from "@/lib/session";
import {
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  startAfter,
  where,
} from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET - List seller's products
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireRole(["seller", "admin"]);
    const userId = session.userId;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const pageLimit = Math.min(
      parseInt(searchParams.get("limit") || "20"),
      100,
    );
    const cursor = searchParams.get("cursor");

    // Build query
    const constraints: any[] = [where("sellerId", "==", userId)];

    if (status) {
      constraints.push(where("status", "==", status));
    }

    constraints.push(orderBy("createdAt", "desc"));
    constraints.push(limit(pageLimit));

    if (cursor) {
      const cursorDoc = await getDocs(
        query(collection(db, "products"), where("__name__", "==", cursor)),
      );
      if (!cursorDoc.empty) {
        constraints.push(startAfter(cursorDoc.docs[0]));
      }
    }

    const productsQuery = query(collection(db, "products"), ...constraints);
    const querySnapshot = await getDocs(productsQuery);

    const products = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
    const nextCursor = lastDoc ? lastDoc.id : null;

    return NextResponse.json(
      {
        success: true,
        data: {
          products,
          nextCursor,
          hasMore: querySnapshot.docs.length === pageLimit,
        },
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error fetching seller products:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(
      {
        error: "Failed to fetch products",
        details: error.message,
      },
      { status: 500 },
    );
  }
}

/**
 * POST - Create new product
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireRole(["seller", "admin"]);
    const userId = session.userId;

    const body = await request.json();
    const {
      title,
      description,
      price,
      stock,
      category,
      images,
      specifications,
      brand,
      condition,
    } = body;

    // Validate required fields
    if (!title || !description || !price || stock === undefined || !category) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Generate slug
    const timestamp = Date.now();
    const slug = `${title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")}-${timestamp}`;

    // Create product
    const productData = {
      slug,
      title,
      description,
      price: parseFloat(price),
      stock: parseInt(stock),
      category,
      images: images || [],
      specifications: specifications || {},
      brand: brand || "",
      condition: condition || "new",
      sellerId: userId,
      status: "pending", // Requires admin approval
      views: 0,
      sales: 0,
      rating: 0,
      reviewCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const productRef = await addDoc(collection(db, "products"), productData);

    return NextResponse.json(
      {
        success: true,
        message: "Product created successfully",
        data: {
          id: productRef.id,
          slug,
        },
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Error creating product:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(
      {
        error: "Failed to create product",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
