import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "../../lib/session";
import { Collections } from "@/app/api/lib/firebase/collections";
import { userOwnsShop } from "@/app/api/lib/firebase/queries";

// GET /api/products/[slug] - Get single product by slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const snapshot = await Collections.products()
      .where("slug", "==", slug)
      .limit(1)
      .get();
    if (snapshot.empty) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }
    const doc = snapshot.docs[0];
    const data: any = doc.data();

    return NextResponse.json({
      success: true,
      data: {
        id: doc.id,
        ...data,
        // Add camelCase aliases for snake_case fields
        shopId: data.shop_id,
        categoryId: data.category_id,
        stockCount: data.stock_count,
        isFeatured: data.is_featured,
        isDeleted: data.is_deleted,
        originalPrice: data.original_price,
        reviewCount: data.review_count,
      },
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

// PATCH /api/products/[slug] - Update product by slug
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { slug } = await params;
    const snapshot = await Collections.products()
      .where("slug", "==", slug)
      .limit(1)
      .get();
    if (snapshot.empty) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }
    const doc = snapshot.docs[0];
    const productData = doc.data() as any;

    // Validate user owns the shop (shopId first, then userId/email)
    const ownsShop = await userOwnsShop(productData?.shop_id, user.email);
    if (!ownsShop) {
      return NextResponse.json(
        {
          success: false,
          error: "You do not have permission to update this product",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    if (body.slug && body.slug !== productData?.slug) {
      const existingSlug = await Collections.products()
        .where("slug", "==", body.slug)
        .where("shop_id", "==", productData?.shop_id)
        .limit(1)
        .get();
      if (!existingSlug.empty) {
        return NextResponse.json(
          { success: false, error: "Product slug already exists in this shop" },
          { status: 400 }
        );
      }
    }

    const updateData: any = { ...body, updated_at: new Date().toISOString() };
    delete updateData.shop_id; // immutable
    delete updateData.created_at;
    delete updateData.id;

    await Collections.products().doc(doc.id).update(updateData);
    const updatedDoc = await Collections.products().doc(doc.id).get();
    const updatedData: any = updatedDoc.data();

    return NextResponse.json({
      success: true,
      data: {
        id: updatedDoc.id,
        ...updatedData,
        // Add camelCase aliases for snake_case fields
        shopId: updatedData.shop_id,
        categoryId: updatedData.category_id,
        stockCount: updatedData.stock_count,
        isFeatured: updatedData.is_featured,
        isDeleted: updatedData.is_deleted,
        originalPrice: updatedData.original_price,
        reviewCount: updatedData.review_count,
      },
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update product" },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[slug] - Delete product by slug
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { slug } = await params;
    const snapshot = await Collections.products()
      .where("slug", "==", slug)
      .limit(1)
      .get();
    if (snapshot.empty) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }
    const doc = snapshot.docs[0];
    const productData = doc.data() as any;

    const ownsShop = await userOwnsShop(productData?.shop_id, user.email);
    if (!ownsShop) {
      return NextResponse.json(
        {
          success: false,
          error: "You do not have permission to delete this product",
        },
        { status: 403 }
      );
    }

    await Collections.products().doc(doc.id).delete();

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
