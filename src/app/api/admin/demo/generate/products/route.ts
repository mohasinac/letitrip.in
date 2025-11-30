import { NextRequest, NextResponse } from "next/server";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/database";

const DEMO_PREFIX = "DEMO_";

const PRODUCT_IMAGES = [
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
  "https://images.unsplash.com/photo-1585386959984-a4155224a1ad",
  "https://images.unsplash.com/photo-1572635196237-14b3f281503f",
  "https://images.unsplash.com/photo-1560343090-f0409e92791a",
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
  "https://images.unsplash.com/photo-1549298916-b41d501d3772",
  "https://images.unsplash.com/photo-1553062407-98eeb64c6a62",
  "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa",
  "https://images.unsplash.com/photo-1598808503491-fa80d3e5a0d9",
  "https://images.unsplash.com/photo-1571781418606-70265b9cce90",
  "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf",
  "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf",
  "https://images.unsplash.com/photo-1622297845775-5ff3fef71d13",
  "https://images.unsplash.com/photo-1598550476439-6847785fcea6",
  "https://images.unsplash.com/photo-1629727820047-c8bbf05c7e19",
  "https://images.unsplash.com/photo-1611329532992-0b7d41e8b9b1",
  "https://images.unsplash.com/photo-1512820790803-83ca734da794",
  "https://images.unsplash.com/photo-1596462502278-27bfdc403348",
  "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338",
  "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f",
  "https://images.unsplash.com/photo-1583394838336-acd977736f90",
  "https://images.unsplash.com/photo-1491553895911-0055uj8f27za",
  "https://images.unsplash.com/photo-1546868871-7041f2a55e12",
  "https://images.unsplash.com/photo-1585386959984-a4155224a1ad",
  "https://images.unsplash.com/photo-1525904097878-94fb15835963",
  "https://images.unsplash.com/photo-1559056199-641a0ac8b55e",
  "https://images.unsplash.com/photo-1560343776-97e7d202ff0e",
  "https://images.unsplash.com/photo-1587829741301-dc798b83add3",
  "https://images.unsplash.com/photo-1608231387042-66d1773070a5",
];

// Sample videos for product demos
const PRODUCT_VIDEOS = [
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
];

const PRODUCT_NAMES = [
  "Charizard VMAX", "Pikachu VMAX", "Mewtwo GX", "Rayquaza VMAX", "Umbreon VMAX",
  "Blue-Eyes White Dragon", "Dark Magician", "Red-Eyes Black Dragon", "Exodia",
  "Valkyrie Evolution", "Spriggan Requiem", "Drain Fafnir", "Achilles",
  "Naruto Uzumaki", "Goku", "Sailor Moon", "Luffy", "Zoro", "Tanjiro",
  "Spider-Man", "Iron Man", "Batman", "Link", "Mario", "Zelda",
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { shops, categoryMap } = body;

    if (!shops || !Array.isArray(shops) || shops.length === 0) {
      return NextResponse.json({ success: false, error: "Shops data required" }, { status: 400 });
    }

    if (!categoryMap || Object.keys(categoryMap).length === 0) {
      return NextResponse.json({ success: false, error: "Category map required" }, { status: 400 });
    }

    const db = getFirestoreAdmin();
    const timestamp = new Date();
    const createdProducts: string[] = [];
    const productsByShop: Record<string, string[]> = {};
    const productsByCategory: Record<string, number> = {};

    // Get leaf categories
    const leafCategories = Object.entries(categoryMap as Record<string, string>).filter(([name]) =>
      name.includes("Set") || name.includes("Type") || name.includes("Boxes") || name.includes("Decks") ||
      name.includes("Nendoroid") || name.includes("Figma") || name.includes("Amiibo") || name.includes("Sleeves") ||
      name.includes("Launchers") || name.includes("Binders") || name.includes("Cases") || name.includes("Risers")
    );

    // Initialize productsByShop
    for (const shop of shops) {
      productsByShop[shop.id] = [];
    }

    // Create 1000 products (20 per shop for 50 shops)
    const totalProducts = Math.min(shops.length * 20, 1000);
    
    for (let i = 0; i < totalProducts; i++) {
      const shopIndex = i % shops.length;
      const currentShop = shops[shopIndex];
      const [categoryName, categoryId] = leafCategories[i % leafCategories.length];
      const productName = PRODUCT_NAMES[i % PRODUCT_NAMES.length];

      const productRef = db.collection(COLLECTIONS.PRODUCTS).doc();
      const basePrice = 500 + Math.random() * 50000;
      const stockCount = Math.floor(Math.random() * 100) + 5;
      // Generate 4-6 images per product for better carousel experience
      const imageCount = 4 + Math.floor(Math.random() * 3);
      const productImages = Array.from({ length: imageCount }, (_, idx) => 
        `${PRODUCT_IMAGES[(i * 5 + idx) % PRODUCT_IMAGES.length]}?w=800&h=800&fit=crop`
      );
      // 40% of products have videos
      const hasVideo = Math.random() < 0.4;
      const productVideos = hasVideo ? [PRODUCT_VIDEOS[i % PRODUCT_VIDEOS.length]] : [];

      await productRef.set({
        name: `${DEMO_PREFIX}${productName} #${i + 1}`,
        slug: `${DEMO_PREFIX.toLowerCase().replace(/_/g, "-")}${productName.toLowerCase().replace(/\s+/g, "-")}-${i + 1}`,
        sku: `${DEMO_PREFIX}SKU-${String(i + 1).padStart(5, "0")}`,
        description: `Premium ${productName} from ${categoryName} collection.`,
        price: Math.round(basePrice),
        compare_at_price: Math.round(basePrice * 1.25),
        cost: Math.round(basePrice * 0.55),
        stock_count: stockCount,
        category_id: categoryId,
        shop_id: currentShop.id,
        seller_id: currentShop.ownerId,
        status: "published",
        is_active: true,
        is_featured: i % 10 < 3,
        brand: ["Official", "Licensed", "Premium", "Authentic"][i % 4],
        condition: "New",
        images: productImages,
        videos: productVideos,
        view_count: Math.floor(Math.random() * 1000),
        sales_count: Math.floor(Math.random() * 100),
        review_count: 0,
        average_rating: 0,
        created_at: timestamp,
        updated_at: timestamp,
      });

      createdProducts.push(productRef.id);
      productsByShop[currentShop.id].push(productRef.id);
      
      // Track products per category for updating counts
      if (!productsByCategory[categoryId]) {
        productsByCategory[categoryId] = 0;
      }
      productsByCategory[categoryId]++;
    }

    // Update category product counts
    for (const [catId, count] of Object.entries(productsByCategory)) {
      await db.collection(COLLECTIONS.CATEGORIES).doc(catId).update({
        product_count: count,
      });
    }

    return NextResponse.json({
      success: true,
      step: "products",
      data: {
        count: createdProducts.length,
        products: createdProducts,
        productsByShop,
      },
    });
  } catch (error: unknown) {
    console.error("Demo products error:", error);
    const message = error instanceof Error ? error.message : "Failed to generate products";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
