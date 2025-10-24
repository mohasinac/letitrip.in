import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "most-visited";
    const limit = parseInt(searchParams.get("limit") || "8");

    // Mock data - in production this would come from database with real analytics
    const mockProducts = [
      {
        id: "1",
        name: "Premium Beyblade Stadium",
        slug: "premium-beyblade-stadium",
        price: 2999,
        compareAtPrice: 3999,
        image: "/images/product-1.jpg",
        isFeatured: true,
        views: 1250,
        wishlisted: 89,
        createdAt: "2024-10-20T00:00:00Z",
        inStock: true,
      },
      {
        id: "2",
        name: "Metal Fusion Beyblade Set",
        slug: "metal-fusion-set",
        price: 1499,
        compareAtPrice: 1999,
        image: "/images/product-2.jpg",
        isFeatured: true,
        views: 980,
        wishlisted: 67,
        createdAt: "2024-10-18T00:00:00Z",
        inStock: true,
      },
      {
        id: "3",
        name: "Launcher Grip Pro",
        slug: "launcher-grip-pro",
        price: 799,
        image: "/images/product-3.jpg",
        isFeatured: true,
        views: 850,
        wishlisted: 45,
        createdAt: "2024-10-15T00:00:00Z",
        inStock: true,
      },
      {
        id: "4",
        name: "Beyblade Burst Starter Pack",
        slug: "burst-starter-pack",
        price: 1299,
        compareAtPrice: 1599,
        image: "/images/product-4.jpg",
        isFeatured: true,
        views: 720,
        wishlisted: 38,
        createdAt: "2024-10-12T00:00:00Z",
        inStock: true,
      },
      {
        id: "5",
        name: "Dragon Storm Beyblade",
        slug: "dragon-storm-beyblade",
        price: 899,
        image: "/images/product-5.jpg",
        isFeatured: true,
        views: 650,
        wishlisted: 72,
        createdAt: "2024-10-22T00:00:00Z",
        inStock: true,
      },
      {
        id: "6",
        name: "Lightning L-Drago",
        slug: "lightning-l-drago",
        price: 1199,
        compareAtPrice: 1399,
        image: "/images/product-6.jpg",
        isFeatured: true,
        views: 580,
        wishlisted: 55,
        createdAt: "2024-10-10T00:00:00Z",
        inStock: true,
      },
      {
        id: "7",
        name: "Thunder Dome Stadium",
        slug: "thunder-dome-stadium",
        price: 2499,
        image: "/images/product-7.jpg",
        isFeatured: true,
        views: 920,
        wishlisted: 43,
        createdAt: "2024-10-08T00:00:00Z",
        inStock: true,
      },
      {
        id: "8",
        name: "Power Launcher Set",
        slug: "power-launcher-set",
        price: 699,
        compareAtPrice: 799,
        image: "/images/product-8.jpg",
        isFeatured: true,
        views: 480,
        wishlisted: 29,
        createdAt: "2024-10-25T00:00:00Z",
        inStock: true,
      },
    ];

    // Filter to only in-stock products
    let products = mockProducts.filter(product => product.inStock);

    // Sort based on type
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
      default:
        // Combined score of views and wishlisted
        products = products.sort((a, b) => 
          (b.views + (b.wishlisted * 2)) - (a.views + (a.wishlisted * 2))
        );
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
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
