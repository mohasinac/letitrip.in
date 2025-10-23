import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const category = searchParams.get("category");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const sort = searchParams.get("sort") || "relevance"; // relevance, price-low, price-high, newest, popular
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 }
      );
    }

    // Mock search results - replace with database/search engine query
    let searchResults = [
      {
        id: "prod_1",
        name: "Rare Vintage Beyblade Metal Series",
        slug: "rare-vintage-beyblade-metal-series",
        description: "Authentic Takara Tomy Beyblade with metal fusion technology",
        price: 1590,
        compareAtPrice: 1890,
        image: "/images/product-1.jpg",
        images: ["/images/product-1.jpg", "/images/product-1-2.jpg"],
        category: "Beyblades",
        tags: ["vintage", "metal", "fusion", "takara tomy"],
        rating: 4.8,
        reviewCount: 24,
        inStock: true,
        stock: 15,
        isAuction: false,
        isFeatured: true
      },
      {
        id: "prod_2",
        name: "Metal Fusion Launcher Pro",
        slug: "metal-fusion-launcher-pro",
        description: "Professional grade launcher for metal fusion beyblades",
        price: 890,
        compareAtPrice: null,
        image: "/images/product-2.jpg",
        images: ["/images/product-2.jpg"],
        category: "Launchers",
        tags: ["launcher", "metal", "fusion", "pro"],
        rating: 4.6,
        reviewCount: 18,
        inStock: true,
        stock: 25,
        isAuction: false,
        isFeatured: false
      },
      {
        id: "prod_3",
        name: "Vintage Action Figure Collection Set",
        slug: "vintage-action-figure-collection",
        description: "Complete set of vintage action figures from the 90s",
        price: 2499,
        compareAtPrice: 2999,
        image: "/images/product-3.jpg",
        images: ["/images/product-3.jpg", "/images/product-3-2.jpg"],
        category: "Action Figures",
        tags: ["vintage", "collection", "90s", "action figure"],
        rating: 4.7,
        reviewCount: 31,
        inStock: true,
        stock: 8,
        isAuction: false,
        isFeatured: true
      },
      {
        id: "prod_4",
        name: "Classic Pokemon Card Booster Pack",
        slug: "classic-pokemon-card-booster",
        description: "Original Pokemon trading card booster pack - Base Set",
        price: 599,
        compareAtPrice: null,
        image: "/images/product-4.jpg",
        images: ["/images/product-4.jpg"],
        category: "Trading Cards",
        tags: ["pokemon", "cards", "booster", "classic"],
        rating: 4.5,
        reviewCount: 42,
        inStock: false,
        stock: 0,
        isAuction: false,
        isFeatured: false
      },
      {
        id: "auction_1",
        name: "Ultra Rare Beyblade Championship Edition",
        slug: "ultra-rare-beyblade-championship",
        description: "Limited edition championship beyblade - only 100 made",
        price: 2500, // Current bid
        compareAtPrice: null,
        image: "/images/auction-1.jpg",
        images: ["/images/auction-1.jpg", "/images/auction-1-2.jpg"],
        category: "Beyblades",
        tags: ["rare", "championship", "limited", "auction"],
        rating: 0,
        reviewCount: 0,
        inStock: true,
        stock: 1,
        isAuction: true,
        auctionEndTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        bidCount: 15,
        isFeatured: true
      }
    ];

    // Filter by search query (simple text matching)
    const queryLower = query.toLowerCase();
    searchResults = searchResults.filter(product =>
      product.name.toLowerCase().includes(queryLower) ||
      product.description.toLowerCase().includes(queryLower) ||
      product.tags.some(tag => tag.toLowerCase().includes(queryLower)) ||
      product.category.toLowerCase().includes(queryLower)
    );

    // Filter by category
    if (category && category !== "all") {
      searchResults = searchResults.filter(product => 
        product.category.toLowerCase() === category.toLowerCase()
      );
    }

    // Filter by price range
    if (minPrice) {
      const min = parseFloat(minPrice);
      searchResults = searchResults.filter(product => product.price >= min);
    }
    if (maxPrice) {
      const max = parseFloat(maxPrice);
      searchResults = searchResults.filter(product => product.price <= max);
    }

    // Sort results
    switch (sort) {
      case "price-low":
        searchResults.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        searchResults.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        // In real implementation, sort by created date
        searchResults.sort((a, b) => a.id.localeCompare(b.id));
        break;
      case "popular":
        searchResults.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
      default: // relevance
        // Keep original order or implement relevance scoring
        break;
    }

    const paginatedResults = searchResults.slice(offset, offset + limit);

    // Get available filters
    const availableCategories = [...new Set(searchResults.map(p => p.category))];
    const priceRange = {
      min: Math.min(...searchResults.map(p => p.price)),
      max: Math.max(...searchResults.map(p => p.price))
    };

    return NextResponse.json({
      success: true,
      data: {
        products: paginatedResults,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(searchResults.length / limit),
          totalResults: searchResults.length,
          hasMore: offset + limit < searchResults.length
        },
        filters: {
          categories: availableCategories,
          priceRange,
          appliedFilters: {
            query,
            category,
            minPrice,
            maxPrice,
            sort
          }
        },
        searchMeta: {
          query,
          resultCount: searchResults.length,
          searchTime: "0.12s" // Mock search time
        }
      }
    });

  } catch (error) {
    console.error("Search products error:", error);
    return NextResponse.json(
      { error: "Failed to search products" },
      { status: 500 }
    );
  }
}

// Endpoint for search suggestions/autocomplete
export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        success: true,
        data: {
          suggestions: []
        }
      });
    }

    // Mock search suggestions - replace with database/search engine query
    const suggestions = [
      "Beyblade Metal Fusion",
      "Vintage Action Figures",
      "Pokemon Cards",
      "Rare Collectibles",
      "Metal Series Launcher",
      "Championship Edition",
      "Trading Card Booster",
      "90s Toys Collection"
    ];

    const queryLower = query.toLowerCase();
    const filteredSuggestions = suggestions.filter(suggestion =>
      suggestion.toLowerCase().includes(queryLower)
    ).slice(0, 8);

    return NextResponse.json({
      success: true,
      data: {
        suggestions: filteredSuggestions,
        query
      }
    });

  } catch (error) {
    console.error("Search suggestions error:", error);
    return NextResponse.json(
      { error: "Failed to get search suggestions" },
      { status: 500 }
    );
  }
}
