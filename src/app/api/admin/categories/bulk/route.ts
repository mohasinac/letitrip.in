import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";

export async function POST(request: NextRequest) {
  try {
    // Verify admin authorization
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const auth = getAdminAuth();
    const db = getAdminDb();
    const decodedToken = await auth.verifyIdToken(token);
    
    // Check if user is admin
    const userDoc = await db
      .collection("users")
      .doc(decodedToken.uid)
      .get();
    
    if (!userDoc.exists || userDoc.data()?.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    const { operation, categoryIds, data } = await request.json();

    if (!operation || !categoryIds || !Array.isArray(categoryIds)) {
      return NextResponse.json(
        { success: false, error: "Invalid request format" },
        { status: 400 }
      );
    }

    const batch = db.batch();
    const now = new Date().toISOString();
    const results: any[] = [];

    switch (operation) {
      case "delete":
        // Validate categories can be deleted
        for (const categoryId of categoryIds) {
          // Check for child categories
          const childCategories = await db
            .collection("categories")
            .where("parentId", "==", categoryId)
            .get();

          if (!childCategories.empty) {
            return NextResponse.json(
              { success: false, error: `Category ${categoryId} has child categories` },
              { status: 400 }
            );
          }

          // Check for products
          const productsInCategory = await db
            .collection("products")
            .where("category", "==", categoryId)
            .limit(1)
            .get();

          if (!productsInCategory.empty) {
            return NextResponse.json(
              { success: false, error: `Category ${categoryId} has products` },
              { status: 400 }
            );
          }

          const categoryRef = db.collection("categories").doc(categoryId);
          batch.delete(categoryRef);
          results.push({ id: categoryId, status: "deleted" });
        }
        break;

      case "activate":
        for (const categoryId of categoryIds) {
          const categoryRef = db.collection("categories").doc(categoryId);
          batch.update(categoryRef, {
            isActive: true,
            updatedAt: now,
            updatedBy: decodedToken.uid
          });
          results.push({ id: categoryId, status: "activated" });
        }
        break;

      case "deactivate":
        for (const categoryId of categoryIds) {
          const categoryRef = db.collection("categories").doc(categoryId);
          batch.update(categoryRef, {
            isActive: false,
            updatedAt: now,
            updatedBy: decodedToken.uid
          });
          results.push({ id: categoryId, status: "deactivated" });
        }
        break;

      case "setFeatured":
        if (typeof data?.featured !== "boolean") {
          return NextResponse.json(
            { success: false, error: "Featured status is required" },
            { status: 400 }
          );
        }

        for (const categoryId of categoryIds) {
          const categoryRef = db.collection("categories").doc(categoryId);
          batch.update(categoryRef, {
            featured: data.featured,
            updatedAt: now,
            updatedBy: decodedToken.uid
          });
          results.push({ 
            id: categoryId, 
            status: data.featured ? "featured" : "unfeatured" 
          });
        }
        break;

      case "updateSortOrder":
        if (!data?.sortOrders || typeof data.sortOrders !== "object") {
          return NextResponse.json(
            { success: false, error: "Sort orders object is required" },
            { status: 400 }
          );
        }

        for (const categoryId of categoryIds) {
          if (data.sortOrders[categoryId] !== undefined) {
            const categoryRef = db.collection("categories").doc(categoryId);
            batch.update(categoryRef, {
              sortOrder: data.sortOrders[categoryId],
              updatedAt: now,
              updatedBy: decodedToken.uid
            });
            results.push({ 
              id: categoryId, 
              status: "sortOrderUpdated",
              sortOrder: data.sortOrders[categoryId]
            });
          }
        }
        break;

      case "moveToParent":
        if (!data?.parentId && data?.parentId !== null) {
          return NextResponse.json(
            { success: false, error: "Parent ID is required (use null for root)" },
            { status: 400 }
          );
        }

        // Validate new parent exists (if not null)
        if (data.parentId) {
          const parentDoc = await db
            .collection("categories")
            .doc(data.parentId)
            .get();
          
          if (!parentDoc.exists) {
            return NextResponse.json(
              { success: false, error: "Parent category not found" },
              { status: 400 }
            );
          }
        }

        for (const categoryId of categoryIds) {
          // Prevent setting parent to self or descendant
          if (data.parentId === categoryId) {
            return NextResponse.json(
              { success: false, error: "Category cannot be its own parent" },
              { status: 400 }
            );
          }

          // Calculate new hierarchy
          let level = 0;
          let parentIds: string[] = [];
          
          if (data.parentId) {
            const parentDoc = await db
              .collection("categories")
              .doc(data.parentId)
              .get();
            
            const parentData = parentDoc.data();
            level = (parentData?.level || 0) + 1;
            parentIds = [...(parentData?.parentIds || []), data.parentId];
          }

          const categoryRef = db.collection("categories").doc(categoryId);
          batch.update(categoryRef, {
            parentId: data.parentId || undefined,
            parentIds,
            level,
            updatedAt: now,
            updatedBy: decodedToken.uid
          });
          
          results.push({ 
            id: categoryId, 
            status: "moved",
            newParentId: data.parentId,
            newLevel: level
          });
        }
        break;

      default:
        return NextResponse.json(
          { success: false, error: "Invalid operation" },
          { status: 400 }
        );
    }

    // Execute batch
    await batch.commit();

    return NextResponse.json({
      success: true,
      data: {
        operation,
        results,
        processedCount: results.length
      }
    });
  } catch (error) {
    console.error("Error performing bulk operation:", error);
    return NextResponse.json(
      { success: false, error: "Failed to perform bulk operation" },
      { status: 500 }
    );
  }
}
