import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import { Category } from "@/types";
import { getCurrentUser } from "@/lib/auth/jwt";

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get("includeInactive") === "true";
    const search = searchParams.get("search");
    const withProductCounts = searchParams.get("withProductCounts") === "true";
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined;

    const db = getAdminDb();

    // Get all categories first
    let query: any = db.collection("categories");
    
    if (!includeInactive) {
      query = query.where("isActive", "==", true);
    }
    
    query = query.orderBy("level").orderBy("sortOrder").orderBy("name");
    
    const snapshot = await query.get();
    const allCategories = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    })) as Category[];

    // Filter for leaf categories only (categories with no children)
    const leafCategories = allCategories.filter(category => {
      const hasChildren = allCategories.some(cat => cat.parentId === category.id);
      return !hasChildren;
    });

    // Apply search filter if provided
    let filteredLeafCategories = leafCategories;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredLeafCategories = leafCategories.filter(category => {
        const searchableText = [
          category.name,
          category.description || '',
          category.slug,
          // Include parent category names for better search
          ...(category.parentIds?.map(parentId => {
            const parent = allCategories.find(c => c.id === parentId);
            return parent?.name || '';
          }) || [])
        ].join(' ').toLowerCase();
        
        return searchableText.includes(searchLower);
      });
    }

    // Apply limit if provided
    if (limit && limit > 0) {
      filteredLeafCategories = filteredLeafCategories.slice(0, limit);
    }

    // Add product counts if requested
    if (withProductCounts) {
      const leafCategoriesWithCounts = await Promise.all(
        filteredLeafCategories.map(async (category) => {
          // Get direct products for this leaf category
          const productsSnapshot = await db
            .collection("products")
            .where("category", "==", category.id)
            .where("status", "==", "active")
            .get();

          const products = productsSnapshot.docs.map(doc => doc.data());
          
          // Calculate stock counts
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
            lowStockCount
          };
        })
      );
      filteredLeafCategories = leafCategoriesWithCounts;
    }

    // Add isLeaf flag and full hierarchy path for each leaf category
    const enrichedLeafCategories = filteredLeafCategories.map(category => {
      // Build full category path for display
      const buildCategoryPath = (cat: Category): string => {
        if (!cat.parentIds || cat.parentIds.length === 0) {
          return cat.name;
        }
        
        const parentPath = cat.parentIds
          .map(parentId => {
            const parent = allCategories.find(c => c.id === parentId);
            return parent ? parent.name : '';
          })
          .filter(name => name)
          .join(' > ');
        
        return parentPath ? `${parentPath} > ${cat.name}` : cat.name;
      };

      return {
        ...category,
        isLeaf: true,
        fullPath: buildCategoryPath(category)
      };
    });

    return NextResponse.json({
      success: true,
      data: enrichedLeafCategories,
      meta: {
        total: enrichedLeafCategories.length,
        totalLeafCategories: leafCategories.length,
        search: search || null,
        limit: limit || null,
        withProductCounts
      }
    });

  } catch (error) {
    console.error("Error fetching leaf categories:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch leaf categories" },
      { status: 500 }
    );
  }
}
