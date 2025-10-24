import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const sort = searchParams.get("sort") || "rating";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");

    // Mock sellers data - in production this would come from database
    const mockSellers = [
      {
        id: "seller-1",
        name: "John Smith",
        businessName: "Premium Beyblade Collection",
        email: "john@premiumbeyblade.com",
        verified: true,
        rating: 4.9,
        totalProducts: 156,
        totalSales: 2340,
        joinedDate: "2023-01-15T00:00:00Z",
        description: "Specializing in rare and limited edition Beyblades from Japan. Official retailer with authentic products only.",
        location: "Tokyo, Japan",
        avatar: "/images/sellers/seller-1.jpg",
        category: "Collectibles",
        isActive: true,
        lastSeen: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
      },
      {
        id: "seller-2",
        name: "Sarah Johnson",
        businessName: "Battle Arena Pro",
        email: "sarah@battlearena.com",
        verified: true,
        rating: 4.8,
        totalProducts: 89,
        totalSales: 1567,
        joinedDate: "2023-03-20T00:00:00Z",
        description: "Tournament-grade Beyblades and accessories. Used by professional players worldwide.",
        location: "New York, USA",
        avatar: "/images/sellers/seller-2.jpg",
        category: "Tournament",
        isActive: true,
        lastSeen: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 minutes ago
      },
      {
        id: "seller-3",
        name: "Mike Chen",
        businessName: "Dragon Force Toys",
        email: "mike@dragonforce.com",
        verified: true,
        rating: 4.7,
        totalProducts: 234,
        totalSales: 3456,
        joinedDate: "2022-11-10T00:00:00Z",
        description: "Largest collection of Metal Fight and Burst series Beyblades. Competitive prices guaranteed.",
        location: "Hong Kong",
        avatar: "/images/sellers/seller-3.jpg",
        category: "General",
        isActive: true,
        lastSeen: new Date(Date.now() - 75 * 60 * 1000).toISOString(), // 75 minutes ago
      },
      {
        id: "seller-4",
        name: "Emma Wilson",
        businessName: "Vintage Spin Masters",
        email: "emma@vintagespin.com",
        verified: false,
        rating: 4.6,
        totalProducts: 67,
        totalSales: 892,
        joinedDate: "2024-02-05T00:00:00Z",
        description: "Rare vintage Beyblades from the original plastic generation. Perfect for collectors.",
        location: "London, UK",
        avatar: "/images/sellers/seller-4.jpg",
        category: "Vintage",
        isActive: true,
        lastSeen: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
      },
      {
        id: "seller-5",
        name: "Alex Rodriguez",
        businessName: "Custom Beyblade Mods",
        email: "alex@custommods.com",
        verified: true,
        rating: 4.9,
        totalProducts: 45,
        totalSales: 567,
        joinedDate: "2024-01-12T00:00:00Z",
        description: "Custom painted and modified Beyblades. Unique designs you won't find anywhere else.",
        location: "Madrid, Spain",
        avatar: "/images/sellers/seller-5.jpg",
        category: "Custom",
        isActive: false,
        lastSeen: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      },
      {
        id: "seller-6",
        name: "Yuki Tanaka",
        businessName: "Takara Official Store",
        email: "yuki@takaraofficial.com",
        verified: true,
        rating: 5.0,
        totalProducts: 123,
        totalSales: 4567,
        joinedDate: "2022-08-30T00:00:00Z",
        description: "Official Takara Tomy distributor. Latest releases and exclusive items available first.",
        location: "Osaka, Japan",
        avatar: "/images/sellers/seller-6.jpg",
        category: "Official",
        isActive: true,
        lastSeen: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 minutes ago
      },
      {
        id: "seller-7",
        name: "Maria Garcia",
        businessName: "Beyblade Universe",
        email: "maria@beybladeuni.com",
        verified: true,
        rating: 4.5,
        totalProducts: 178,
        totalSales: 2100,
        joinedDate: "2023-06-15T00:00:00Z",
        description: "Complete Beyblade universe under one roof. From starters to championship sets.",
        location: "Mexico City, Mexico",
        avatar: "/images/sellers/seller-7.jpg",
        category: "General",
        isActive: true,
        lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      },
      {
        id: "seller-8",
        name: "David Park",
        businessName: "K-Pop Beyblades",
        email: "david@kpopbeyblades.com",
        verified: true,
        rating: 4.4,
        totalProducts: 92,
        totalSales: 1234,
        joinedDate: "2024-03-10T00:00:00Z",
        description: "Unique Korean edition Beyblades and K-Pop themed custom designs.",
        location: "Seoul, South Korea",
        avatar: "/images/sellers/seller-8.jpg",
        category: "Custom",
        isActive: true,
        lastSeen: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
      },
    ];

    let filteredSellers = [...mockSellers];

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filteredSellers = filteredSellers.filter(seller =>
        seller.businessName.toLowerCase().includes(searchLower) ||
        seller.description.toLowerCase().includes(searchLower) ||
        seller.location.toLowerCase().includes(searchLower) ||
        seller.category.toLowerCase().includes(searchLower)
      );
    }

    // Apply category filter
    if (category && category !== "All") {
      filteredSellers = filteredSellers.filter(seller => seller.category === category);
    }

    // Apply sorting
    switch (sort) {
      case "rating":
        filteredSellers.sort((a, b) => b.rating - a.rating);
        break;
      case "sales":
        filteredSellers.sort((a, b) => b.totalSales - a.totalSales);
        break;
      case "products":
        filteredSellers.sort((a, b) => b.totalProducts - a.totalProducts);
        break;
      case "newest":
        filteredSellers.sort((a, b) => new Date(b.joinedDate).getTime() - new Date(a.joinedDate).getTime());
        break;
      case "oldest":
        filteredSellers.sort((a, b) => new Date(a.joinedDate).getTime() - new Date(b.joinedDate).getTime());
        break;
      default:
        break;
    }

    // Calculate pagination
    const total = filteredSellers.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const paginatedSellers = filteredSellers.slice(offset, offset + limit);

    // Get available categories for filters
    const categories = [...new Set(mockSellers.map(seller => seller.category))];

    return NextResponse.json({
      sellers: paginatedSellers,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      categories,
      filters: {
        search,
        category,
        sort,
      },
    });
  } catch (error) {
    console.error("Error fetching sellers:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
