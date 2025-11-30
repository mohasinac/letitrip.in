import { NextRequest, NextResponse } from "next/server";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/database";

const DEMO_PREFIX = "DEMO_";

// Beyblade product images - realistic spinning top/arena images
const PRODUCT_IMAGES = [
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1560343776-97e7d202ff0e?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1614680376739-414d95ff43df?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1608889825205-eebdb9fc5806?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=800&h=800&fit=crop",
];

// Sample videos for product demos
const PRODUCT_VIDEOS = [
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
];

// Authentic Beyblade product names by category
const BEYBLADE_PRODUCTS: Record<string, string[]> = {
  "Attack Types": [
    "Valkyrie Wing Accel", "Xcalius X3", "Spriggan Requiem", "Strike God Valkyrie",
    "Winning Valkyrie", "Imperial Dragon", "Rage Longinus", "Super Hyperion",
    "Savior Valkyrie", "Ultimate Valkyrie", "Dangerous Belial", "Dynamite Belial",
  ],
  "Defense Types": [
    "Roktavor R3", "Deep Chaos", "Maximum Garuda", "Revive Phoenix",
    "Archer Hercules", "Shelter Regulus", "World Spriggan", "Prominence Phoenix",
    "Vanish Fafnir", "Greatest Raphael", "Guilty Longinus", "Astral Spriggan",
  ],
  "Stamina Types": [
    "Drain Fafnir", "Geist Fafnir", "Wizard Fafnir", "Mirage Fafnir",
    "Tempest Dragon", "Curse Satan", "Twin Nemesis", "Bloody Longinus",
    "Lord Spriggan", "Variant Lucifer", "Hollow Deathscyther", "Cyclone Ragnaruk",
  ],
  "Balance Types": [
    "God Valkyrie", "Legend Spriggan", "Spriggan Requiem", "Cho-Z Achilles",
    "Perfect Phoenix", "Union Achilles", "Master Diabolos", "Brave Valkyrie",
    "Infinite Achilles", "Lucifer The End", "Hyperion Burn", "Helios Volcano",
  ],
  "X Attack": [
    "Dran Sword 3-60F", "Shark Edge 4-60T", "Wizard Arrow 4-80B", "Hells Scythe 4-60T",
    "Phoenix Wing 9-60GF", "Cobalt Drake 4-60R", "Wyvern Gale 5-60D", "Steel Samurai 3-70F",
  ],
  "X Defense": [
    "Dran Buster 1-60A", "Knight Shield 2-60D", "Titan 2-60R", "Fortress 4-80D",
    "Guardian Cetus 1-60B", "Iron Warden 3-60T", "Bastion 2-70D", "Aegis 4-60A",
  ],
  "X Stamina": [
    "Wizard Rod 5-70DB", "Knight Lance 3-60N", "Phoenix Feather 5-60S", "Dragon Spiral 4-70S",
    "Viper Tail 5-60N", "Serpent Coil 3-80S", "Wind Eagle 5-70N", "Storm Shark 4-60S",
  ],
  "X Balance": [
    "Cobalt Dragoon 3-60F", "Dran Dagger 5-60LF", "Phoenix Rush 4-70B", "Knight Cross 3-60A",
    "Thunder Dragon 5-60F", "Blaze Tiger 4-70LF", "Frost Wolf 3-60B", "Shadow Hawk 5-70F",
  ],
  "Metal Fusion": [
    "Storm Pegasus", "Lightning L-Drago", "Rock Leone", "Flame Sagittario",
    "Earth Eagle", "Dark Wolf", "Rock Aries", "Flame Libra", "Storm Aquario",
  ],
  "Metal Masters": [
    "Galaxy Pegasus", "Meteo L-Drago", "Ray Unicorno", "Flame Byxis",
    "Grand Cetus", "Rock Zurafa", "Burn Fireblaze", "Cyber Pegasus",
  ],
  "Metal Fury": [
    "Cosmic Pegasus", "L-Drago Destroy", "Fang Leone", "Phantom Orion",
    "Diablo Nemesis", "Blitz Unicorno", "Flash Sagittario", "Scythe Kronos",
  ],
  "Plastic Gen": [
    "Dragoon S", "Dranzer S", "Driger S", "Draciel S", "Dragoon V", "Dranzer V",
    "Wolborg", "Seaborg", "Falborg", "Galeon", "Trygle", "Trypio",
  ],
  "HMS (Heavy Metal System)": [
    "Dragoon MS", "Dranzer MS", "Driger MS", "Draciel MS",
    "Gaia Dragoon MS", "Wolborg MS", "Advance Striker", "Dark Effigy",
  ],
  "String Launchers": [
    "LR String Launcher", "Beyblade Burst String Launcher", "Power String Launcher",
    "Long String Launcher", "Turbo String Launcher", "Pro String Launcher",
  ],
  "Ripcord Launchers": [
    "Standard Ripcord Launcher", "Power Ripcord Launcher", "Light Launcher",
    "Left Spin Launcher", "Right Spin Launcher", "Dual Spin Launcher",
  ],
  "LR Launchers": [
    "LR Launcher", "Long LR Launcher", "Superking LR Launcher",
    "Dynamite Battle LR Launcher", "Pro Series LR Launcher",
  ],
  "Launcher Grips": [
    "Beyblade Launcher Grip", "Rubber Launcher Grip", "Pro Launcher Grip",
    "Extended Launcher Grip", "Custom Launcher Grip", "Metal Launcher Grip",
  ],
  "Power Launchers": [
    "Turbo Power Launcher", "Max Power Launcher", "Extreme Power Launcher",
    "Ultra Power Launcher", "Hyper Power Launcher", "Super Power Launcher",
  ],
  "Standard Stadiums": [
    "Beyblade Burst Stadium", "Pro Stadium", "Official BeyStadium",
    "Tournament Stadium", "Competition Stadium", "Practice Stadium",
  ],
  "Burst Stadiums": [
    "BeyStadium Standard Type", "BeyStadium Attack Type", "BeyStadium Wide Type",
    "DB BeyStadium", "Superking BeyStadium", "Cho-Z BeyStadium",
  ],
  "X Stadiums": [
    "Xtreme BeyStadium", "X Standard Stadium", "X Battle Stadium",
    "X Pro Stadium", "X Tournament Stadium", "X Arena Stadium",
  ],
  "Battle Sets": [
    "Beyblade Burst Battle Set", "Starter Battle Set", "Pro Battle Set",
    "Tournament Battle Set", "Deluxe Battle Set", "Ultimate Battle Set",
  ],
  "Energy Layers": [
    "Valkyrie Layer", "Spriggan Layer", "Fafnir Layer", "Longinus Layer",
    "Achilles Layer", "Phoenix Layer", "Dragon Layer", "Belial Layer",
  ],
  "Forge Discs": [
    "00 Disc", "10 Disc", "0 Wall Disc", "0 Cross Disc",
    "7 Disc", "11 Disc", "Blitz Disc", "Sting Disc",
  ],
  "Performance Tips": [
    "Xtend+ Tip", "Quick' Tip", "Destroy' Tip", "Variable' Tip",
    "Mobius Tip", "Bearing' Tip", "Rise Tip", "Orbit Tip",
  ],
  "Blades": [
    "Dran Blade", "Shark Blade", "Knight Blade", "Phoenix Blade",
    "Wizard Blade", "Hells Blade", "Cobalt Blade", "Leon Blade",
  ],
  "Ratchets": [
    "3-60 Ratchet", "4-60 Ratchet", "5-60 Ratchet", "4-70 Ratchet",
    "3-70 Ratchet", "5-70 Ratchet", "4-80 Ratchet", "2-60 Ratchet",
  ],
  "Bits": [
    "Flat Bit", "Needle Bit", "Ball Bit", "Dot Bit",
    "Rush Bit", "Low Flat Bit", "Gear Flat Bit", "Taper Bit",
  ],
  "Tournament Exclusives": [
    "World Champion Valkyrie", "Tournament Gold Spriggan", "Champion Edition Fafnir",
    "Pro Series Longinus", "Limited Tournament Achilles", "Exclusive Event Phoenix",
  ],
  "Store Exclusives": [
    "Amazon Exclusive Valkyrie", "Target Exclusive Spriggan", "Walmart Exclusive Set",
    "Japan Import Limited", "Korea Exclusive Edition", "Asia Limited Release",
  ],
  "Anniversary Editions": [
    "20th Anniversary Dragoon", "Anniversary Gold L-Drago", "Special Edition Pegasus",
    "Commemorative Spriggan", "Anniversary Premium Set", "Legacy Collection Valkyrie",
  ],
  "Gold Series": [
    "Gold Valkyrie", "Gold Spriggan", "Gold Fafnir", "Gold Longinus",
    "Gold Achilles", "Gold Phoenix", "Gold Dragon", "Gold Diabolos",
  ],
  "Vintage Beyblades": [
    "Original Dragoon", "Classic Dranzer", "Vintage Driger", "Retro Draciel",
    "First Gen Wolborg", "Original Seaborg", "Classic Falborg", "Vintage Trygle",
  ],
  "Rare Finds": [
    "Rare Proto Valkyrie", "Limited Proto Spriggan", "Prototype Fafnir",
    "Test Version Longinus", "Sample Edition Achilles", "Rare Color Variant",
  ],
  "Collector Items": [
    "Museum Edition Dragoon", "Display Only Dranzer", "Collector Case Set",
    "Premium Display Collection", "Sealed Box Collection", "Mint Condition Rare",
  ],
  "Carrying Cases": [
    "Beyblade Storage Case", "Tournament Carry Case", "Pro Carrying Bag",
    "Deluxe Storage Box", "Travel Case", "Competition Bag",
  ],
  "Tool Kits": [
    "Beyblade Tool Set", "Maintenance Kit", "Assembly Tools",
    "Pro Tuning Kit", "Repair Kit", "Cleaning Set",
  ],
  "Display Stands": [
    "Acrylic Display Stand", "LED Display Case", "Wall Mount Display",
    "Rotating Display", "Collection Shelf", "Premium Display Cabinet",
  ],
  "Spare Parts": [
    "Replacement Springs", "Extra Tips", "Spare Discs",
    "Backup Layers", "Extra Frames", "Replacement Launchers",
  ],
};

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
    
    // Track counts per category: { categoryId: { total, inStock, outOfStock } }
    const categoryStats: Record<string, { total: number; inStock: number; outOfStock: number }> = {};

    // Get leaf categories (ones that have Beyblade products)
    const leafCategories = Object.entries(categoryMap as Record<string, string>).filter(([name]) => {
      return BEYBLADE_PRODUCTS[name] !== undefined;
    });

    if (leafCategories.length === 0) {
      return NextResponse.json({ success: false, error: "No leaf categories found with products" }, { status: 400 });
    }

    // Initialize productsByShop
    for (const shop of shops) {
      productsByShop[shop.id] = [];
    }

    // Create products - distribute evenly across categories and shops
    const totalProducts = Math.min(shops.length * 20, 1000);
    let productIndex = 0;
    
    for (let i = 0; i < totalProducts; i++) {
      const shopIndex = i % shops.length;
      const currentShop = shops[shopIndex];
      const [categoryName, categoryId] = leafCategories[i % leafCategories.length];
      
      // Get product names for this category
      const categoryProducts = BEYBLADE_PRODUCTS[categoryName] || ["Generic Beyblade"];
      const productName = categoryProducts[i % categoryProducts.length];

      const productRef = db.collection(COLLECTIONS.PRODUCTS).doc();
      
      // Pricing based on category type
      let basePrice = 500 + Math.random() * 3000;
      if (categoryName.includes("Limited") || categoryName.includes("Rare") || categoryName.includes("Gold")) {
        basePrice = 5000 + Math.random() * 25000; // Rare items cost more
      } else if (categoryName.includes("Stadium") || categoryName.includes("Battle Set")) {
        basePrice = 2000 + Math.random() * 8000; // Stadiums/sets cost more
      } else if (categoryName.includes("Parts") || categoryName.includes("Spare")) {
        basePrice = 200 + Math.random() * 1500; // Parts are cheaper
      }
      
      // 15% of products are out of stock
      const isOutOfStock = Math.random() < 0.15;
      const stockCount = isOutOfStock ? 0 : Math.floor(Math.random() * 50) + 1;
      
      // Generate 4-6 images per product - use shuffled selection for variety
      const imageCount = 4 + Math.floor(Math.random() * 3);
      // Shuffle and pick unique images for this product
      const shuffledImages = [...PRODUCT_IMAGES].sort(() => Math.random() - 0.5);
      const productImages = shuffledImages.slice(0, imageCount);
      
      // 40% of products have videos
      const hasVideo = Math.random() < 0.4;
      const productVideos = hasVideo ? [PRODUCT_VIDEOS[i % PRODUCT_VIDEOS.length]] : [];

      // Condition varies for vintage/rare items
      let condition: "New" | "Like New" | "Good" | "Fair" = "New";
      if (categoryName.includes("Vintage") || categoryName.includes("Rare")) {
        condition = ["New", "Like New", "Good", "Fair"][Math.floor(Math.random() * 4)] as typeof condition;
      }

      await productRef.set({
        name: `${DEMO_PREFIX}${productName}`,
        slug: `${DEMO_PREFIX.toLowerCase().replace(/_/g, "-")}${productName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${productIndex + 1}`,
        sku: `${DEMO_PREFIX}BEY-${String(productIndex + 1).padStart(5, "0")}`,
        description: `Premium ${productName} - authentic Beyblade from the ${categoryName} collection. Perfect for collectors and competitive bladers alike.`,
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
        is_deleted: false,
        brand: ["Takara Tomy", "Hasbro", "Young Toys", "SonokongⅡ"][i % 4],
        condition,
        images: productImages,
        videos: productVideos,
        view_count: Math.floor(Math.random() * 1000) + 100,
        sales_count: Math.floor(Math.random() * 100),
        review_count: 0,
        average_rating: 0,
        tags: ["beyblade", categoryName.toLowerCase().replace(/\s+/g, "-"), condition.toLowerCase()],
        created_at: timestamp,
        updated_at: timestamp,
      });

      createdProducts.push(productRef.id);
      productsByShop[currentShop.id].push(productRef.id);
      
      // Track category stats
      if (!categoryStats[categoryId]) {
        categoryStats[categoryId] = { total: 0, inStock: 0, outOfStock: 0 };
      }
      categoryStats[categoryId].total++;
      if (stockCount > 0) {
        categoryStats[categoryId].inStock++;
      } else {
        categoryStats[categoryId].outOfStock++;
      }
      
      productIndex++;
    }

    // Update category counts
    for (const [catId, stats] of Object.entries(categoryStats)) {
      await db.collection(COLLECTIONS.CATEGORIES).doc(catId).update({
        product_count: stats.total,
        in_stock_count: stats.inStock,
        out_of_stock_count: stats.outOfStock,
      });
    }

    return NextResponse.json({
      success: true,
      step: "products",
      data: {
        count: createdProducts.length,
        products: createdProducts,
        productsByShop,
        categoryStats,
      },
    });
  } catch (error: unknown) {
    console.error("Demo products error:", error);
    const message = error instanceof Error ? error.message : "Failed to generate products";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
