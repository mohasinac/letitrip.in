import { NextRequest, NextResponse } from "next/server";
import {
  getAdminAuth,
  getAdminDb,
  getAdminStorage,
} from "@/lib/database/admin";
import { Timestamp } from "firebase-admin/firestore";

/**
 * Helper: Delete all files in a storage folder
 */
async function deleteStorageFolder(sellerId: string, slug: string) {
  try {
    const storage = getAdminStorage();
    const bucket = storage.bucket();
    const folderPath = `sellers/${sellerId}/products/${slug}/`;

    console.log(`Deleting storage folder: ${folderPath}`);

    // List all files in the folder
    const [files] = await bucket.getFiles({ prefix: folderPath });

    if (files.length === 0) {
      console.log(`No files found in ${folderPath}`);
      return;
    }

    // Delete all files
    await Promise.all(files.map((file) => file.delete()));

    console.log(`Deleted ${files.length} files from ${folderPath}`);
  } catch (error: any) {
    console.error(`Error deleting storage folder:`, error);
    // Don't throw - continue with product deletion even if storage cleanup fails
  }
}

/**
 * Helper: Rename storage folder when slug changes
 */
async function renameStorageFolder(
  sellerId: string,
  oldSlug: string,
  newSlug: string,
) {
  try {
    const storage = getAdminStorage();
    const bucket = storage.bucket();
    const oldFolderPath = `sellers/${sellerId}/products/${oldSlug}/`;
    const newFolderPath = `sellers/${sellerId}/products/${newSlug}/`;

    console.log(
      `Renaming storage folder: ${oldFolderPath} -> ${newFolderPath}`,
    );

    // List all files in the old folder
    const [files] = await bucket.getFiles({ prefix: oldFolderPath });

    if (files.length === 0) {
      console.log(`No files found in ${oldFolderPath}`);
      return;
    }

    // Copy each file to new location and delete old file
    await Promise.all(
      files.map(async (file) => {
        const oldPath = file.name;
        const fileName = oldPath.replace(oldFolderPath, "");
        const newPath = `${newFolderPath}${fileName}`;

        // Copy to new location
        await file.copy(newPath);
        // Delete old file
        await file.delete();

        console.log(`Moved: ${oldPath} -> ${newPath}`);
      }),
    );

    console.log(`Renamed folder with ${files.length} files`);
    return newFolderPath;
  } catch (error: any) {
    console.error(`Error renaming storage folder:`, error);
    // Don't throw - continue with product update even if storage rename fails
  }
}

/**
 * Helper: Update media URLs in product data when slug changes
 */
function updateMediaURLs(media: any, oldSlug: string, newSlug: string): any {
  if (!media) return media;

  const updatedMedia = { ...media };

  // Update image URLs
  if (updatedMedia.images && Array.isArray(updatedMedia.images)) {
    updatedMedia.images = updatedMedia.images.map((img: any) => ({
      ...img,
      url: img.url?.replace(`/products/${oldSlug}/`, `/products/${newSlug}/`),
      path: img.path?.replace(`/products/${oldSlug}/`, `/products/${newSlug}/`),
    }));
  }

  // Update video URLs
  if (updatedMedia.videos && Array.isArray(updatedMedia.videos)) {
    updatedMedia.videos = updatedMedia.videos.map((video: any) => ({
      ...video,
      url: video.url?.replace(`/products/${oldSlug}/`, `/products/${newSlug}/`),
      thumbnail: video.thumbnail?.replace(
        `/products/${oldSlug}/`,
        `/products/${newSlug}/`,
      ),
      path: video.path?.replace(
        `/products/${oldSlug}/`,
        `/products/${newSlug}/`,
      ),
    }));
  }

  return updatedMedia;
}

/**
 * GET /api/seller/products/[id]
 * Get a specific product by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Verify authentication
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const token = authHeader.split("Bearer ")[1];
    const auth = getAdminAuth();
    const decodedToken = await auth.verifyIdToken(token);
    const uid = decodedToken.uid;
    const role = decodedToken.role || "user";

    // Only sellers and admins can access
    if (role !== "seller" && role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Seller access required" },
        { status: 403 },
      );
    }

    const adminDb = getAdminDb();
    const { id } = await params; // Await params

    // Get product document
    const docRef = adminDb.collection("seller_products").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 },
      );
    }

    const productData = doc.data();

    // Verify ownership (unless admin)
    if (role !== "admin" && productData?.sellerId !== uid) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Not your product" },
        { status: 403 },
      );
    }

    // Convert Firestore timestamps to dates
    const product = {
      id: doc.id,
      ...productData,
      createdAt: productData?.createdAt?.toDate?.() || productData?.createdAt,
      updatedAt: productData?.updatedAt?.toDate?.() || productData?.updatedAt,
      startDate: productData?.startDate?.toDate?.() || productData?.startDate,
      expirationDate:
        productData?.expirationDate?.toDate?.() || productData?.expirationDate,
    };

    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (error: any) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch product" },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/seller/products/[id]
 * Update a specific product
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Verify authentication
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const token = authHeader.split("Bearer ")[1];
    const auth = getAdminAuth();
    const decodedToken = await auth.verifyIdToken(token);
    const uid = decodedToken.uid;
    const role = decodedToken.role || "user";

    // Only sellers and admins can update
    if (role !== "seller" && role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Seller access required" },
        { status: 403 },
      );
    }

    const adminDb = getAdminDb();
    const { id } = await params; // Await params
    const body = await request.json();

    // Get existing product
    const docRef = adminDb.collection("seller_products").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 },
      );
    }

    const existingProduct = doc.data();

    // Verify ownership (unless admin)
    if (role !== "admin" && existingProduct?.sellerId !== uid) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Not your product" },
        { status: 403 },
      );
    }

    // Validate SKU uniqueness if changed
    if (body.sku && body.sku !== existingProduct?.sku) {
      const existingSkuProduct = await adminDb
        .collection("seller_products")
        .where("sellerId", "==", uid)
        .where("sku", "==", body.sku)
        .limit(1)
        .get();

      if (!existingSkuProduct.empty) {
        return NextResponse.json(
          { success: false, error: "SKU already exists for your products" },
          { status: 400 },
        );
      }
    }

    // Validate slug uniqueness if changed
    if (body.seo?.slug && body.seo.slug !== existingProduct?.seo?.slug) {
      const existingSlug = await adminDb
        .collection("seller_products")
        .where("seo.slug", "==", body.seo.slug)
        .limit(1)
        .get();

      if (!existingSlug.empty) {
        return NextResponse.json(
          {
            success: false,
            error: "Slug already exists. Please use a different one.",
          },
          { status: 400 },
        );
      }

      // Rename storage folder if slug changed
      const oldSlug = existingProduct?.seo?.slug;
      const newSlug = body.seo.slug;
      if (oldSlug && newSlug && oldSlug !== newSlug) {
        await renameStorageFolder(uid, oldSlug, newSlug);

        // Update media URLs in the update data if media exists
        if (body.media || existingProduct?.media) {
          const mediaToUpdate = body.media || existingProduct?.media;
          body.media = updateMediaURLs(mediaToUpdate, oldSlug, newSlug);
        }
      }
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: Timestamp.now(),
    };

    // Only update fields that are provided
    if (body.name !== undefined) updateData.name = body.name;
    if (body.shortDescription !== undefined)
      updateData.shortDescription = body.shortDescription;
    if (body.description !== undefined)
      updateData.description = body.description;
    if (body.categoryId !== undefined) updateData.categoryId = body.categoryId;
    if (body.categoryName !== undefined)
      updateData.categoryName = body.categoryName;
    if (body.tags !== undefined) updateData.tags = body.tags;
    if (body.sku !== undefined) updateData.sku = body.sku;

    if (body.pricing !== undefined) {
      updateData.pricing = {
        price: parseFloat(body.pricing.price),
        compareAtPrice: body.pricing.compareAtPrice
          ? parseFloat(body.pricing.compareAtPrice)
          : null,
        cost: body.pricing.cost ? parseFloat(body.pricing.cost) : null,
      };
    }

    if (body.inventory !== undefined) {
      updateData.inventory = {
        quantity: parseInt(body.inventory.quantity) || 0,
        lowStockThreshold: parseInt(body.inventory.lowStockThreshold) || 10,
        trackInventory: body.inventory.trackInventory !== false,
      };
    }

    if (body.pickupAddressId !== undefined)
      updateData.pickupAddressId = body.pickupAddressId;
    if (body.media !== undefined) updateData.media = body.media;
    if (body.condition !== undefined) updateData.condition = body.condition;
    if (body.isReturnable !== undefined)
      updateData.isReturnable = body.isReturnable;
    if (body.returnPeriodDays !== undefined)
      updateData.returnPeriodDays = body.returnPeriodDays;
    if (body.hasFreeShipping !== undefined)
      updateData.hasFreeShipping = body.hasFreeShipping;
    if (body.shippingMethod !== undefined)
      updateData.shippingMethod = body.shippingMethod;
    if (body.features !== undefined) updateData.features = body.features;
    if (body.specifications !== undefined)
      updateData.specifications = body.specifications;
    if (body.dimensions !== undefined) updateData.dimensions = body.dimensions;

    if (body.seo !== undefined) {
      updateData.seo = body.seo;
    }

    if (body.startDate !== undefined) {
      updateData.startDate = body.startDate
        ? Timestamp.fromDate(new Date(body.startDate))
        : Timestamp.now();
    }
    if (body.expirationDate !== undefined) {
      updateData.expirationDate = body.expirationDate
        ? Timestamp.fromDate(new Date(body.expirationDate))
        : null;
    }

    if (body.status !== undefined) updateData.status = body.status;

    // Update product in Firestore
    await docRef.update(updateData);

    // Get updated product
    const updatedDoc = await docRef.get();
    const updatedProduct = {
      id: updatedDoc.id,
      ...updatedDoc.data(),
      createdAt: updatedDoc.data()?.createdAt?.toDate?.(),
      updatedAt: updatedDoc.data()?.updatedAt?.toDate?.(),
      startDate: updatedDoc.data()?.startDate?.toDate?.(),
      expirationDate: updatedDoc.data()?.expirationDate?.toDate?.(),
    };

    return NextResponse.json({
      success: true,
      data: updatedProduct,
      message: "Product updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update product" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/seller/products/[id]
 * Delete a specific product
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Verify authentication
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const token = authHeader.split("Bearer ")[1];
    const auth = getAdminAuth();
    const decodedToken = await auth.verifyIdToken(token);
    const uid = decodedToken.uid;
    const role = decodedToken.role || "user";

    // Only sellers and admins can delete
    if (role !== "seller" && role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Seller access required" },
        { status: 403 },
      );
    }

    const adminDb = getAdminDb();
    const { id } = await params; // Await params

    // Get product document
    const docRef = adminDb.collection("seller_products").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 },
      );
    }

    const productData = doc.data();

    // Verify ownership (unless admin)
    if (role !== "admin" && productData?.sellerId !== uid) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Not your product" },
        { status: 403 },
      );
    }

    // Delete associated media from Firebase Storage
    const slug = productData?.seo?.slug;
    if (slug) {
      await deleteStorageFolder(uid, slug);
    }

    // Delete the product document
    await docRef.delete();

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete product" },
      { status: 500 },
    );
  }
}
