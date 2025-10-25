import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import { Category, CategoryFormData } from "@/types";
import { getCurrentUser } from "@/lib/auth/jwt";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get("parentId");
    const level = searchParams.get("level");
    const featured = searchParams.get("featured");
    const includeInactive = searchParams.get("includeInactive") === "true";
    const search = searchParams.get("search");
    const withProductCounts = searchParams.get("withProductCounts") === "true";

    const db = getAdminDb();
    let query: any = db.collection("categories");

    // Filter by parent
    if (parentId) {
      query = query.where("parentId", "==", parentId);
    } else if (parentId === null || searchParams.has("rootOnly")) {
      query = query.where("parentId", "==", null);
    }

    // Filter by level
    if (level) {
      query = query.where("level", "==", parseInt(level));
    }

    // Filter by featured status
    if (featured) {
      query = query.where("featured", "==", featured === "true");
    }

    // Filter by active status
    if (!includeInactive) {
      query = query.where("isActive", "==", true);
    }

    // Order by sortOrder and name
    query = query.orderBy("sortOrder").orderBy("name");

    const snapshot = await query.get();
    let categories = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    })) as Category[];

    // Search filter (client-side for now)
    if (search) {
      const searchLower = search.toLowerCase();
      categories = categories.filter(category =>
        category.name.toLowerCase().includes(searchLower) ||
        category.description?.toLowerCase().includes(searchLower) ||
        category.slug.toLowerCase().includes(searchLower)
      );
    }

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

    return NextResponse.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

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
    const data: CategoryFormData = await request.json();

    // Validate required fields
    if (!data.name || !data.slug) {
      return NextResponse.json(
        { success: false, error: "Name and slug are required" },
        { status: 400 }
      );
    }

    // Check if slug is unique
    const existingSlug = await db
      .collection("categories")
      .where("slug", "==", data.slug)
      .get();

    if (!existingSlug.empty) {
      return NextResponse.json(
        { success: false, error: "Slug already exists" },
        { status: 400 }
      );
    }

    // Calculate level and parentIds
    let level = 0;
    let parentIds: string[] = [];
    
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

      const parentData = parentDoc.data() as Category;
      level = parentData.level + 1;
      parentIds = [...(parentData.parentIds || []), data.parentId];
    }

    const now = new Date().toISOString();
    const categoryData: Omit<Category, "id"> = {
      name: data.name,
      slug: data.slug,
      description: data.description || "",
      image: data.image,
      icon: data.icon,
      seo: data.seo || {},
      parentId: data.parentId || undefined,
      parentIds,
      level,
      isActive: data.isActive,
      featured: data.featured,
      sortOrder: data.sortOrder,
      productCount: 0,
      inStockCount: 0,
      outOfStockCount: 0,
      lowStockCount: 0,
      createdAt: now,
      updatedAt: now,
      createdBy: user.userId,
      updatedBy: user.userId
    };

    const docRef = await db
      .collection("categories")
      .add(categoryData);

    const newCategory = {
      id: docRef.id,
      ...categoryData
    };

    return NextResponse.json({
      success: true,
      data: newCategory
    });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create category" },
      { status: 500 }
    );
  }
}
