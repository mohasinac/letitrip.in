import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from '@/lib/firebase/admin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "most-visited";
    const limit = parseInt(searchParams.get("limit") || "8");

    const db = getAdminDb();
    
    // Simplified query to avoid composite index requirements
    let productsQuery = db.collection('products').where('status', '==', 'active');
    
    // For specific types, we'll use different query strategies
    switch (type) {
      case "most-visited":
        // Only order by views, filter inStock in post-processing
        productsQuery = productsQuery.orderBy('views', 'desc').limit(limit * 3);
        break;
      case "wishlisted":
        // Only order by wishlisted, filter inStock in post-processing
        productsQuery = productsQuery.orderBy('wishlisted', 'desc').limit(limit * 3);
        break;
      case "newest":
        // Only order by createdAt, filter inStock in post-processing
        productsQuery = productsQuery.orderBy('createdAt', 'desc').limit(limit * 3);
        break;
      case "sale":
        // Get products with compareAtPrice and filter in post-processing
        productsQuery = productsQuery.where('compareAtPrice', '>', 0).limit(limit * 3);
        break;
      case "popularity":
        // Get all active products for popularity calculation
        productsQuery = productsQuery.limit(100); // Reasonable limit
        break;
      default:
        // Default case - get featured products
        productsQuery = productsQuery.where('featured', '==', true).limit(limit * 2);
    }

    const productsSnapshot = await productsQuery.get();
    
    let products = productsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        slug: data.slug,
        price: data.price || 0,
        compareAtPrice: data.compareAtPrice || 0,
        image: data.images?.[0] || data.image || '/images/products/default.jpg',
        isFeatured: data.featured || false,
        views: data.views || 0,
        wishlisted: data.wishlisted || 0,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        inStock: data.inStock !== false,
        category: data.category,
        description: data.description
      };
    });

    // Filter out of stock products and apply additional post-processing
    products = products.filter(product => product.inStock);

    // Apply additional filtering and sorting based on type
    switch (type) {
      case "most-visited":
        products = products.sort((a, b) => b.views - a.views);
        break;
      case "wishlisted":
        products = products.sort((a, b) => b.wishlisted - a.wishlisted);
        break;
      case "newest":
        products = products.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case "sale":
        products = products
          .filter(product => product.compareAtPrice && product.compareAtPrice > product.price)
          .sort((a, b) => 
            ((a.compareAtPrice - a.price) / a.compareAtPrice) - 
            ((b.compareAtPrice - b.price) / b.compareAtPrice)
          );
        break;
      case "popularity":
        products = products.sort((a, b) => 
          (b.views + (b.wishlisted * 3)) - (a.views + (a.wishlisted * 3))
        );
        break;
      default:
        // Default: prioritize featured, then by views
        products = products.sort((a, b) => {
          if (a.isFeatured && !b.isFeatured) return -1;
          if (!a.isFeatured && b.isFeatured) return 1;
          return b.views - a.views;
        });
    }

    // Limit results
    products = products.slice(0, limit);

    return NextResponse.json({
      products,
      type,
      total: products.length,
    });
  } catch (error) {
    console.error("Error fetching featured products:", error);
    
    // If it's a Firestore index error, return empty result with message
    if (error && typeof error === 'object' && 'code' in error && error.code === 9) {
      console.log("Firestore index not ready, returning empty result");
      
      return NextResponse.json({
        products: [],
        type: "unknown",
        total: 0,
        error: "Database indexes are still building. Please try again in a few minutes.",
        indexError: true
      });
    }
    
    return NextResponse.json(
      { 
        error: "Internal server error",
        products: [],
        type: "unknown", 
        total: 0
      },
      { status: 500 }
    );
  }
}
