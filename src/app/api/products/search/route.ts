import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/database/admin";
import { Product, Category } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const categoryId = searchParams.get("categoryId");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    const db = getAdminDb();
    
    let productsQuery: any = db.collection("products")
      .where("status", "==", "active");

    // If a category is specified, search in that category and all its descendants
    if (categoryId) {
      // Get the category to check if it's a leaf or parent category
      const categoryDoc = await db.collection("categories").doc(categoryId).get();
      
      if (categoryDoc.exists) {
        const category = { id: categoryDoc.id, ...categoryDoc.data() } as Category;
        
        // Get all categories to determine hierarchy
        const allCategoriesSnapshot = await db.collection("categories").get();
        const allCategories = allCategoriesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Category[];

        // Check if this is a leaf category
        const hasChildren = allCategories.some(cat => cat.parentId === categoryId);
        
        if (!hasChildren) {
          // Leaf category: search products directly assigned to this category
          productsQuery = productsQuery.where("category", "==", categoryId);
        } else {
          // Parent category: search products in all descendant leaf categories
          const descendantLeafCategories = allCategories.filter(cat => 
            cat.parentIds && cat.parentIds.includes(categoryId) && 
            !allCategories.some(childCat => childCat.parentId === cat.id) // is leaf
          );

          const leafCategoryIds = descendantLeafCategories.map(cat => cat.id);
          
          if (leafCategoryIds.length > 0) {
            // Note: Firestore 'in' queries are limited to 10 items, so we might need to batch this
            if (leafCategoryIds.length <= 10) {
              productsQuery = productsQuery.where("category", "in", leafCategoryIds);
            } else {
              // For more than 10 categories, we'll need to do multiple queries and combine results
              const batches = [];
              for (let i = 0; i < leafCategoryIds.length; i += 10) {
                const batch = leafCategoryIds.slice(i, i + 10);
                batches.push(
                  db.collection("products")
                    .where("status", "==", "active")
                    .where("category", "in", batch)
                    .get()
                );
              }
              
              const results = await Promise.all(batches);
              const allProducts = results.flatMap(snapshot => 
                snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
              );

              // Apply text search filter if query is provided
              let filteredProducts = allProducts;
              if (query) {
                const queryLower = query.toLowerCase();
                filteredProducts = allProducts.filter((product: any) =>
                  product.name?.toLowerCase().includes(queryLower) ||
                  product.description?.toLowerCase().includes(queryLower) ||
                  product.sku?.toLowerCase().includes(queryLower) ||
                  product.tags?.some((tag: string) => tag.toLowerCase().includes(queryLower))
                );
              }

              // Apply pagination
              const paginatedProducts = filteredProducts.slice(offset, offset + limit);

              return NextResponse.json({
                success: true,
                data: {
                  products: paginatedProducts,
                  total: filteredProducts.length,
                  hasMore: filteredProducts.length > offset + limit
                }
              });
            }
          } else {
            // No leaf categories found, return empty result
            return NextResponse.json({
              success: true,
              data: {
                products: [],
                total: 0,
                hasMore: false
              }
            });
          }
        }
      }
    }

    // Apply text search if query is provided
    // Note: For full-text search, you might want to implement a proper search solution like Algolia
    let snapshot;
    if (query) {
      // For now, we'll get all products and filter client-side
      // In production, consider using a proper search service
      snapshot = await productsQuery.get();
      const queryLower = query.toLowerCase();
      const allProducts = snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];

      const filteredProducts = allProducts.filter(product =>
        product.name?.toLowerCase().includes(queryLower) ||
        product.description?.toLowerCase().includes(queryLower) ||
        product.sku?.toLowerCase().includes(queryLower) ||
        product.tags?.some(tag => tag.toLowerCase().includes(queryLower))
      );

      const paginatedProducts = filteredProducts.slice(offset, offset + limit);

      return NextResponse.json({
        success: true,
        data: {
          products: paginatedProducts,
          total: filteredProducts.length,
          hasMore: filteredProducts.length > offset + limit
        }
      });
    } else {
      // No text query, just apply pagination
      snapshot = await productsQuery
        .orderBy("createdAt", "desc")
        .limit(limit)
        .offset(offset)
        .get();

      const products = snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];

      // Get total count for pagination
      const countSnapshot = await productsQuery.count().get();
      const total = countSnapshot.data().count;

      return NextResponse.json({
        success: true,
        data: {
          products,
          total,
          hasMore: total > offset + limit
        }
      });
    }

  } catch (error) {
    console.error("Error searching products:", error);
    return NextResponse.json(
      { success: false, error: "Failed to search products" },
      { status: 500 }
    );
  }
}
