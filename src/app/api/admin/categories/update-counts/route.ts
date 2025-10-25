import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import { Category } from "@/types";
import { getCurrentUser } from "@/lib/auth/jwt";

export async function POST(request: NextRequest) {
  try {
    // Use JWT authentication instead of Firebase auth
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    if (user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    const db = getAdminDb();

    console.log("Starting category product count update...");

    // Get all categories
    const categoriesSnapshot = await db.collection("categories").get();
    const categories = categoriesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Category[];

    const batch = db.batch();
    const results: any[] = [];

    // Update product counts for each category
    for (const category of categories) {
      try {
        // Check if this is a leaf category (no children)
        const hasChildren = categories.some(cat => cat.parentId === category.id);
        
        if (!hasChildren) {
          // Leaf category: get direct products only
          const productsSnapshot = await db
            .collection("products")
            .where("category", "==", category.id)
            .where("status", "==", "active")
            .get();

          const directProducts = productsSnapshot.docs.map(doc => doc.data());
          const directCount = directProducts.length;
          const directInStock = directProducts.filter(p => p.quantity > 0).length;
          const directOutOfStock = directProducts.filter(p => p.quantity === 0).length;
          const directLowStock = directProducts.filter(p => 
            p.quantity > 0 && p.quantity <= (p.lowStockThreshold || 5)
          ).length;

          // Update the category with the counts and mark as leaf
          const categoryRef = db.collection("categories").doc(category.id);
          batch.update(categoryRef, {
            productCount: directCount,
            inStockCount: directInStock,
            outOfStockCount: directOutOfStock,
            lowStockCount: directLowStock,
            isLeaf: true,
            updatedAt: new Date().toISOString()
          });

          results.push({
            categoryId: category.id,
            categoryName: category.name,
            type: 'leaf',
            directProducts: directCount,
            totalProducts: directCount,
            inStockCount: directInStock,
            outOfStockCount: directOutOfStock,
            lowStockCount: directLowStock
          });

        } else {
          // Parent category: aggregate from all descendant leaf categories
          const descendantLeafCategories = categories.filter(cat => 
            cat.parentIds && cat.parentIds.includes(category.id) && 
            !categories.some(childCat => childCat.parentId === cat.id) // is leaf
          );

          let totalCount = 0;
          let totalInStock = 0;
          let totalOutOfStock = 0;
          let totalLowStock = 0;

          // Get products from all descendant leaf categories
          for (const leafCategory of descendantLeafCategories) {
            const productsSnapshot = await db
              .collection("products")
              .where("category", "==", leafCategory.id)
              .where("status", "==", "active")
              .get();

            const products = productsSnapshot.docs.map(doc => doc.data());
            
            totalCount += products.length;
            totalInStock += products.filter(p => p.quantity > 0).length;
            totalOutOfStock += products.filter(p => p.quantity === 0).length;
            totalLowStock += products.filter(p => 
              p.quantity > 0 && p.quantity <= (p.lowStockThreshold || 5)
            ).length;
          }

          // Update the category with aggregated counts and mark as parent
          const categoryRef = db.collection("categories").doc(category.id);
          batch.update(categoryRef, {
            productCount: totalCount,
            inStockCount: totalInStock,
            outOfStockCount: totalOutOfStock,
            lowStockCount: totalLowStock,
            isLeaf: false,
            updatedAt: new Date().toISOString()
          });

          results.push({
            categoryId: category.id,
            categoryName: category.name,
            type: 'parent',
            directProducts: 0,
            totalProducts: totalCount,
            inStockCount: totalInStock,
            outOfStockCount: totalOutOfStock,
            lowStockCount: totalLowStock,
            descendantLeafCategories: descendantLeafCategories.length
          });
        }

      } catch (error) {
        console.error(`Error processing category ${category.id}:`, error);
        results.push({
          categoryId: category.id,
          categoryName: category.name,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    // Commit all updates
    await batch.commit();

    console.log("Category product count update completed");

    return NextResponse.json({
      success: true,
      data: {
        message: "Product counts updated successfully",
        results,
        processedCategories: categories.length,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error("Error updating category product counts:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update product counts" },
      { status: 500 }
    );
  }
}
