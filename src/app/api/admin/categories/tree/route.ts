import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/database/admin";
import { Category, CategoryTreeNode } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get("includeInactive") === "true";
    const withProductCounts = searchParams.get("withProductCounts") === "true";
    const maxDepth = parseInt(searchParams.get("maxDepth") || "10");

    const db = getAdminDb();
    
    // Get all categories
    let query: any = db.collection("categories");
    
    if (!includeInactive) {
      query = query.where("isActive", "==", true);
    }
    
    query = query.orderBy("level").orderBy("sortOrder").orderBy("name");
    
    const snapshot = await query.get();
    let categories = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    })) as Category[];

    // Add product counts if requested
    if (withProductCounts) {
      const categoryCounts = await Promise.all(
        categories.map(async (category) => {
          // Check if this is a leaf category (no children)
          const hasChildren = categories.some(cat => cat.parentId === category.id);
          
          if (!hasChildren) {
            // Leaf category: get direct products only
            const productsSnapshot = await db
              .collection("products")
              .where("category", "==", category.id)
              .where("status", "==", "active")
              .get();

            const products = productsSnapshot.docs.map(doc => doc.data());
            
            // Calculate stock counts for leaf category
            const totalCount = products.length;
            const inStockCount = products.filter(p => p.quantity > 0).length;
            const outOfStockCount = products.filter(p => p.quantity === 0).length;
            const lowStockCount = products.filter(p => 
              p.quantity > 0 && p.quantity <= (p.lowStockThreshold || 5)
            ).length;

            return {
              ...category,
              productCount: totalCount,
              inStockCount,
              outOfStockCount,
              lowStockCount,
              isLeaf: true
            };
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

            return {
              ...category,
              productCount: totalCount,
              inStockCount: totalInStock,
              outOfStockCount: totalOutOfStock,
              lowStockCount: totalLowStock,
              isLeaf: false
            };
          }
        })
      );
      categories = categoryCounts;
    }

    // Build tree structure
    const categoryMap = new Map<string, CategoryTreeNode>();
    const rootCategories: CategoryTreeNode[] = [];

    // First pass: create all nodes
    categories.forEach(category => {
      const treeNode: CategoryTreeNode = {
        ...category,
        children: [],
        hasChildren: false
      };
      categoryMap.set(category.id, treeNode);
    });

    // Second pass: build hierarchy and calculate product counts for parents
    categories.forEach(category => {
      const node = categoryMap.get(category.id)!;
      
      if (!category.parentId || category.level === 0) {
        rootCategories.push(node);
      } else {
        const parent = categoryMap.get(category.parentId);
        if (parent && parent.level < maxDepth) {
          parent.children.push(node);
          parent.hasChildren = true;
        }
      }
    });

    // Third pass: calculate inherited product counts for parent categories
    if (withProductCounts) {
      const calculateTotalProductCount = (node: CategoryTreeNode): number => {
        let total = node.productCount || 0;
        
        node.children.forEach(child => {
          total += calculateTotalProductCount(child);
        });
        
        node.productCount = total;
        return total;
      };

      rootCategories.forEach(calculateTotalProductCount);
    }

    // Sort root categories
    rootCategories.sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) {
        return a.sortOrder - b.sortOrder;
      }
      return a.name.localeCompare(b.name);
    });

    // Recursively sort children
    const sortChildren = (node: CategoryTreeNode) => {
      node.children.sort((a, b) => {
        if (a.sortOrder !== b.sortOrder) {
          return a.sortOrder - b.sortOrder;
        }
        return a.name.localeCompare(b.name);
      });
      
      node.children.forEach(sortChildren);
    };

    rootCategories.forEach(sortChildren);

    return NextResponse.json({
      success: true,
      data: {
        categories: rootCategories,
        totalCategories: categories.length,
        maxDepth: Math.max(...categories.map(c => c.level))
      }
    });
  } catch (error) {
    console.error("Error building category tree:", error);
    return NextResponse.json(
      { success: false, error: "Failed to build category tree" },
      { status: 500 }
    );
  }
}
