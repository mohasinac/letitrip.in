import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/database/admin";
import { Category } from "@/types";
import { createAdminHandler } from "@/lib/auth/api-middleware";

export const GET = createAdminHandler(async (request: NextRequest, user) => {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || searchParams.get("query");
    const limit = parseInt(searchParams.get("limit") || "50");
    const includeInactive = searchParams.get("includeInactive") === "true";
    const leafOnly = searchParams.get("leafOnly") === "true";
    const withProductCounts = searchParams.get("withProductCounts") === "true";

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: "Search query must be at least 2 characters" },
        { status: 400 }
      );
    }

    const db = getAdminDb();
    const searchQuery = query.toLowerCase().trim();

    // Get all categories for filtering and hierarchy building
    let categoriesQuery: any = db.collection("categories");
    
    if (!includeInactive) {
      categoriesQuery = categoriesQuery.where("isActive", "==", true);
    }

    categoriesQuery = categoriesQuery.orderBy("level").orderBy("sortOrder").orderBy("name");
    const snapshot = await categoriesQuery.get();
    
    let allCategories = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    })) as Category[];

    // Enhanced search filtering with hierarchy support
    const filteredCategories = allCategories.filter(category => {
      // Build comprehensive searchable text
      const parentNames = category.parentIds?.map(parentId => {
        const parent = allCategories.find(c => c.id === parentId);
        return parent?.name || '';
      }).join(' ') || '';

      const searchFields = [
        category.name,
        category.description || '',
        category.slug,
        parentNames, // Include parent category names
        category.seo?.metaTitle || '',
        category.seo?.metaDescription || '',
        ...(category.seo?.keywords || [])
      ].filter(Boolean);

      return searchFields.some(field => 
        field?.toLowerCase().includes(searchQuery)
      );
    });

    // Filter for leaf categories only if requested
    let searchResults = filteredCategories;
    if (leafOnly) {
      searchResults = filteredCategories.filter(category => {
        const hasChildren = allCategories.some(cat => cat.parentId === category.id);
        return !hasChildren;
      });
    }

    // Enhanced relevance scoring
    const scoredResults = searchResults.map(category => {
      let score = 0;
      const nameMatch = category.name.toLowerCase().includes(searchQuery);
      const slugMatch = category.slug.toLowerCase().includes(searchQuery);
      const descMatch = category.description?.toLowerCase().includes(searchQuery);
      const exactNameMatch = category.name.toLowerCase() === searchQuery;
      const nameStartsWithMatch = category.name.toLowerCase().startsWith(searchQuery);
      
      // Scoring weights
      if (exactNameMatch) score += 20;
      if (nameStartsWithMatch) score += 15;
      if (nameMatch) score += 10;
      if (slugMatch) score += 8;
      if (descMatch) score += 5;
      if (category.featured) score += 3;
      
      // Boost leaf categories if searching for leaf only
      if (leafOnly) {
        const isLeaf = !allCategories.some(cat => cat.parentId === category.id);
        if (isLeaf) score += 5;
      }
      
      return { ...category, relevanceScore: score };
    });

    // Sort by relevance, then by hierarchy level, then by name
    scoredResults.sort((a, b) => {
      if (b.relevanceScore !== a.relevanceScore) {
        return b.relevanceScore - a.relevanceScore;
      }
      if (a.level !== b.level) {
        return a.level - b.level;
      }
      return a.name.localeCompare(b.name);
    });

    // Apply limit
    const limitedResults = scoredResults.slice(0, limit);

    // Add product counts if requested
    let finalResults = limitedResults;
    if (withProductCounts) {
      finalResults = await Promise.all(
        limitedResults.map(async (category) => {
          const hasChildren = allCategories.some(cat => cat.parentId === category.id);
          
          if (!hasChildren) {
            // Leaf category: get direct products
            const productsSnapshot = await db
              .collection("products")
              .where("category", "==", category.id)
              .where("status", "==", "active")
              .get();

            const products = productsSnapshot.docs.map(doc => doc.data());
            
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
            // Parent category: aggregate from descendants
            const descendantLeafCategories = allCategories.filter(cat => 
              cat.parentIds && cat.parentIds.includes(category.id) && 
              !allCategories.some(childCat => childCat.parentId === cat.id)
            );

            let totalCount = 0;
            let totalInStock = 0;
            let totalOutOfStock = 0;
            let totalLowStock = 0;

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
    }

    // Add full hierarchy path and leaf status for better context
    const enrichedResults = finalResults.map(category => {
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

      const isLeaf = !allCategories.some(cat => cat.parentId === category.id);

      return {
        ...category,
        fullPath: buildCategoryPath(category),
        isLeaf,
        // Add search highlighting hints
        matchType: category.name.toLowerCase() === searchQuery ? 'exact' :
                  category.name.toLowerCase().startsWith(searchQuery) ? 'prefix' : 'partial'
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        categories: enrichedResults,
        query: searchQuery,
        total: enrichedResults.length,
        totalFound: searchResults.length,
        filters: {
          leafOnly,
          includeInactive,
          withProductCounts,
          limit
        }
      }
    });
  } catch (error) {
    console.error("Error searching categories:", error);
    return NextResponse.json(
      { success: false, error: "Failed to search categories" },
      { status: 500 }
    );
  }
});
