import { NextRequest, NextResponse } from "next/server";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { nanoid } from "nanoid";

/**
 * Demo Data Generator API
 * Creates comprehensive demo data for TCG, Beyblades, and Figurines
 * POST /api/admin/demo/generate
 *
 * Uses DEMO_ prefix for all resources instead of session-based tracking
 * This allows easy identification and cleanup of demo data
 */

const DEMO_PREFIX = "DEMO_";

// Real public image URLs from Unsplash (free to use) - Diverse collection
const PRODUCT_IMAGES = [
  // Tech & Electronics
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e", // Headphones
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30", // Watch
  "https://images.unsplash.com/photo-1585386959984-a4155224a1ad", // Camera
  "https://images.unsplash.com/photo-1572635196237-14b3f281503f", // Sunglasses
  "https://images.unsplash.com/photo-1560343090-f0409e92791a", // Smartwatch
  // Fashion & Accessories
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff", // Red Nike shoe
  "https://images.unsplash.com/photo-1549298916-b41d501d3772", // White sneaker
  "https://images.unsplash.com/photo-1553062407-98eeb64c6a62", // Backpack
  "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa", // Hoodie
  "https://images.unsplash.com/photo-1598808503491-fa80d3e5a0d9", // Jacket
  // Home & Decor
  "https://images.unsplash.com/photo-1571781418606-70265b9cce90", // Table lamp
  "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf", // Plant pot
  "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6", // Minimalist watch
  "https://images.unsplash.com/photo-1586023492125-27b2c045efd7", // Furniture
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64", // Art supplies
  // Sports & Fitness
  "https://images.unsplash.com/photo-1517836357463-d25dfeac3438", // Gym equipment
  "https://images.unsplash.com/photo-1551958219-acbc608c6377", // Yoga mat
  "https://images.unsplash.com/photo-1526401363794-c96080fe9a07", // Dumbbells
  "https://images.unsplash.com/photo-1613977257592-4871e5fcd7c4", // Basketball
  "https://images.unsplash.com/photo-1577212017184-0d65605d1e4e", // Soccer ball
  // Gaming & Toys
  "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf", // Game controller
  "https://images.unsplash.com/photo-1622297845775-5ff3fef71d13", // Gaming setup
  "https://images.unsplash.com/photo-1598550476439-6847785fcea6", // Gaming keyboard
  "https://images.unsplash.com/photo-1629727820047-c8bbf05c7e19", // Toy figures
  "https://images.unsplash.com/photo-1611329532992-0b7d41e8b9b1", // Board game
  // Books & Stationery
  "https://images.unsplash.com/photo-1512820790803-83ca734da794", // Books stack
  "https://images.unsplash.com/photo-1544947950-fa07a98d237f", // Open book
  "https://images.unsplash.com/photo-1455390582262-044cdead277a", // Notebooks
  "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0", // Art journal
  "https://images.unsplash.com/photo-1532012197267-da84d127e765", // Pencils
  // Food & Beverage (products)
  "https://images.unsplash.com/photo-1551024506-0bccd828d307", // Coffee mug
  "https://images.unsplash.com/photo-1559056199-641a0ac8b55e", // Tea set
  "https://images.unsplash.com/photo-1556679343-c7306c1976bc", // Water bottle
  "https://images.unsplash.com/photo-1587049352846-4a222e784046", // Kitchen tools
  "https://images.unsplash.com/photo-1504279577054-acfeccf8fc52", // Cookware
  // Beauty & Personal Care
  "https://images.unsplash.com/photo-1596462502278-27bfdc403348", // Perfume
  "https://images.unsplash.com/photo-1571875257727-256c39da42af", // Skincare
  "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b", // Makeup
  "https://images.unsplash.com/photo-1522338242992-e1a54906a8da", // Cosmetics
  "https://images.unsplash.com/photo-1564131989068-2c9eae58e5b4", // Nail polish
  // Jewelry & Watches
  "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338", // Gold watch
  "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f", // Ring
  "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908", // Bracelet
  "https://images.unsplash.com/photo-1611591437281-460bfbe1220a", // Necklace
  "https://images.unsplash.com/photo-1603561596112-0a132b757442", // Earrings
  // Miscellaneous
  "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b", // Phone case
  "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f", // USB cable
  "https://images.unsplash.com/photo-1572635196184-84e35138cf62", // Tech gadget
  "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89", // Laptop
  "https://images.unsplash.com/photo-1585282263861-f55e341878f8", // Tablet
];

// Real public video URLs (free sample videos) - More diverse
const PRODUCT_VIDEOS = [
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4",
];

// TCG, Beyblade, and Figurine Categories with multi-parent structure (EXPANDED)
const CATEGORY_TREE = {
  // Root categories
  "Trading Card Games": {
    children: {
      "Pokemon TCG": {
        children: {
          "Base Set": { isLeaf: true },
          "Expansion Sets": { isLeaf: true },
          "Booster Packs": { isLeaf: true },
          "Starter Decks": { isLeaf: true },
          "Elite Trainer Boxes": { isLeaf: true },
        },
      },
      "Yu-Gi-Oh!": {
        children: {
          "Structure Decks": { isLeaf: true },
          "Booster Boxes": { isLeaf: true },
          "Legendary Collections": { isLeaf: true },
          "Duel Decks": { isLeaf: true },
        },
      },
      "Magic: The Gathering": {
        children: {
          "Commander Decks": { isLeaf: true },
          "Draft Boosters": { isLeaf: true },
          "Set Boosters": { isLeaf: true },
          "Collector Boosters": { isLeaf: true },
          "Preconstructed Decks": { isLeaf: true },
          "Bundle Sets": { isLeaf: true },
        },
      },
      "Digimon Card Game": {
        children: {
          "Starter Decks": { isLeaf: true },
          "Booster Sets": { isLeaf: true },
          "Special Editions": { isLeaf: true },
        },
      },
      "Dragon Ball Super": {
        children: {
          "Expansion Sets": { isLeaf: true },
          "Starter Decks": { isLeaf: true },
          "Premium Packs": { isLeaf: true },
        },
      },
    },
  },
  Beyblades: {
    children: {
      "Beyblade Burst": {
        children: {
          "Attack Types": { isLeaf: true },
          "Defense Types": { isLeaf: true },
          "Stamina Types": { isLeaf: true },
          "Balance Types": { isLeaf: true },
          "Starter Sets": { isLeaf: true },
          Launchers: { isLeaf: true },
        },
      },
      "Beyblade Metal Series": {
        children: {
          "Metal Fusion": { isLeaf: true },
          "Metal Masters": { isLeaf: true },
          "Metal Fury": { isLeaf: true },
          "Limited Editions": { isLeaf: true },
        },
      },
      "Beyblade X": {
        children: {
          "X Series Attack": { isLeaf: true },
          "X Series Defense": { isLeaf: true },
          "X Series Balance": { isLeaf: true },
        },
      },
    },
  },
  Figurines: {
    children: {
      "Anime Figures": {
        children: {
          Nendoroid: { isLeaf: true },
          Figma: { isLeaf: true },
          "Scale Figures": { isLeaf: true },
          "Prize Figures": { isLeaf: true },
        },
      },
      "Gaming Figures": {
        children: {
          "Action RPG": { isLeaf: true },
          "Fighting Games": { isLeaf: true },
          "Strategy Games": { isLeaf: true },
        },
      },
      "Collectible Statues": {
        children: {
          "Limited Edition": { isLeaf: true },
          "Exclusive Variants": { isLeaf: true },
          "Artist Series": { isLeaf: true },
          "Premium Collection": { isLeaf: true },
        },
      },
      "Movie Figures": {
        children: {
          "Marvel Characters": { isLeaf: true },
          "DC Characters": { isLeaf: true },
          "Star Wars": { isLeaf: true },
        },
      },
    },
  },
  Accessories: {
    children: {
      "Card Protection": {
        children: {
          "Card Sleeves": { isLeaf: true },
          "Deck Boxes": { isLeaf: true },
          Binders: { isLeaf: true },
        },
      },
      "Gaming Accessories": {
        children: {
          Playmats: { isLeaf: true },
          "Dice Sets": { isLeaf: true },
          "Counters & Tokens": { isLeaf: true },
        },
      },
      "Storage & Display": {
        children: {
          "Storage Solutions": { isLeaf: true },
          "Display Cases": { isLeaf: true },
          "Protective Cases": { isLeaf: true },
        },
      },
    },
  },
  "Special Editions": {
    children: {
      "Limited Releases": { isLeaf: true },
      "Convention Exclusives": { isLeaf: true },
      "Anniversary Editions": { isLeaf: true },
      "Signed Collectibles": { isLeaf: true },
    },
  },
};

// Product templates for each category
const PRODUCT_TEMPLATES = {
  "Pokemon TCG": [
    {
      name: "Charizard VMAX",
      rarity: "Secret Rare",
      minPrice: 15000,
      maxPrice: 50000,
    },
    {
      name: "Pikachu VMAX",
      rarity: "Ultra Rare",
      minPrice: 8000,
      maxPrice: 25000,
    },
    { name: "Mewtwo GX", rarity: "Full Art", minPrice: 5000, maxPrice: 15000 },
    {
      name: "Rayquaza VMAX",
      rarity: "Rainbow Rare",
      minPrice: 12000,
      maxPrice: 35000,
    },
  ],
  "Yu-Gi-Oh!": [
    {
      name: "Blue-Eyes White Dragon",
      rarity: "Ghost Rare",
      minPrice: 20000,
      maxPrice: 60000,
    },
    {
      name: "Dark Magician",
      rarity: "Starlight Rare",
      minPrice: 18000,
      maxPrice: 45000,
    },
    {
      name: "Red-Eyes Black Dragon",
      rarity: "Ultimate Rare",
      minPrice: 10000,
      maxPrice: 30000,
    },
  ],
  "Beyblade Burst": [
    {
      name: "Valkyrie Evolution",
      type: "Attack",
      minPrice: 1500,
      maxPrice: 3500,
    },
    {
      name: "Spriggan Requiem",
      type: "Balance",
      minPrice: 2000,
      maxPrice: 4500,
    },
    { name: "Drain Fafnir", type: "Stamina", minPrice: 1800, maxPrice: 4000 },
  ],
  Nendoroid: [
    {
      name: "Naruto Uzumaki",
      series: "Naruto",
      minPrice: 3500,
      maxPrice: 6000,
    },
    { name: "Goku", series: "Dragon Ball", minPrice: 4000, maxPrice: 7000 },
    {
      name: "Sailor Moon",
      series: "Sailor Moon",
      minPrice: 3800,
      maxPrice: 6500,
    },
  ],
};

// User templates
const USER_TEMPLATES = [
  { name: "Alex Chen", email: "alex.chen@demo.justforview.in", role: "seller" },
  { name: "Raj Patel", email: "raj.patel@demo.justforview.in", role: "seller" },
  {
    name: "Priya Sharma",
    email: "priya.sharma@demo.justforview.in",
    role: "user",
  },
  { name: "John Smith", email: "john.smith@demo.justforview.in", role: "user" },
  {
    name: "Maria Garcia",
    email: "maria.garcia@demo.justforview.in",
    role: "user",
  },
  {
    name: "Kenji Tanaka",
    email: "kenji.tanaka@demo.justforview.in",
    role: "user",
  },
  { name: "Sarah Johnson", email: "sarah.j@demo.justforview.in", role: "user" },
  { name: "Ahmed Khan", email: "ahmed.k@demo.justforview.in", role: "user" },
  { name: "Emily Wong", email: "emily.w@demo.justforview.in", role: "user" },
  { name: "Carlos Silva", email: "carlos.s@demo.justforview.in", role: "user" },
];

// Address templates (expanded)
const ADDRESS_TEMPLATES = [
  {
    street: "123 Marine Drive",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400001",
  },
  {
    street: "456 Connaught Place",
    city: "Delhi",
    state: "Delhi",
    pincode: "110001",
  },
  {
    street: "789 MG Road",
    city: "Bangalore",
    state: "Karnataka",
    pincode: "560001",
  },
  {
    street: "321 Anna Salai",
    city: "Chennai",
    state: "Tamil Nadu",
    pincode: "600001",
  },
  {
    street: "654 Park Street",
    city: "Kolkata",
    state: "West Bengal",
    pincode: "700001",
  },
  {
    street: "987 FC Road",
    city: "Pune",
    state: "Maharashtra",
    pincode: "411001",
  },
  {
    street: "147 Ashram Road",
    city: "Ahmedabad",
    state: "Gujarat",
    pincode: "380001",
  },
  {
    street: "258 Hitech City",
    city: "Hyderabad",
    state: "Telangana",
    pincode: "500001",
  },
  {
    street: "369 Mall Road",
    city: "Jaipur",
    state: "Rajasthan",
    pincode: "302001",
  },
  {
    street: "741 MG Marg",
    city: "Gurgaon",
    state: "Haryana",
    pincode: "122001",
  },
];

export async function POST(request: NextRequest) {
  try {
    const db = getFirestoreAdmin();
    const timestamp = new Date();

    // Step 1: Create categories with multi-parent support
    const categoryMap = new Map<string, string>();
    let categoryCount = 0;

    async function createCategories(
      tree: any,
      parentId: string | null = null,
      parentIds: string[] = []
    ): Promise<void> {
      for (const [name, data] of Object.entries(tree)) {
        const catData = data as any;
        const categoryRef = db.collection("categories").doc();
        const categoryId = categoryRef.id;
        const categoryName = `${DEMO_PREFIX}${name}`;

        await categoryRef.set({
          name: categoryName,
          slug: categoryName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          description: `Demo category for ${name}`,
          parent_id: parentId,
          parent_ids: [...parentIds, ...(parentId ? [parentId] : [])],
          is_leaf: catData.isLeaf || false,
          is_active: true,
          is_featured: Math.random() > 0.7,
          product_count: 0,
          image: `https://picsum.photos/seed/cat-${categoryId}/400/300`,
          icon: null,
          created_at: timestamp,
          updated_at: timestamp,
        });

        categoryMap.set(name, categoryId);
        categoryCount++;

        if (catData.children) {
          await createCategories(catData.children, categoryId, [
            ...parentIds,
            ...(parentId ? [parentId] : []),
            categoryId,
          ]);
        }
      }
    }

    await createCategories(CATEGORY_TREE);

    // Step 2: Create users with addresses
    const userIds: { id: string; role: string; name: string }[] = [];

    for (let index = 0; index < USER_TEMPLATES.length; index++) {
      const userTemplate = USER_TEMPLATES[index];
      const userRef = db.collection("users").doc();
      const userId = userRef.id;

      // Assign address to user
      const userAddress = ADDRESS_TEMPLATES[index % ADDRESS_TEMPLATES.length];

      await userRef.set({
        name: `${DEMO_PREFIX}${userTemplate.name}`,
        email: userTemplate.email,
        role: userTemplate.role,
        isActive: true,
        phone: `+91-98765${String(43210 + index).padStart(5, "0")}`,
        addresses: [
          {
            id: `addr-${userId}-1`,
            ...userAddress,
            isDefault: true,
            label: "Home",
          },
        ],
        createdAt: timestamp,
        updatedAt: timestamp,
        // Demo password: "Demo@123"
        passwordHash: "$2a$10$demoHashForTestingOnly",
      });

      userIds.push({
        id: userId,
        role: userTemplate.role,
        name: userTemplate.name,
      });
    }

    const sellers = userIds.filter((u) => u.role === "seller");
    const buyers = userIds.filter((u) => u.role === "user");

    // Step 3: Create 2 shops (one per seller)
    const shopIds: string[] = [];
    const shopData: Array<{
      id: string;
      ownerId: string;
      name: string;
      slug: string;
    }> = [];
    const productsByShop: Record<string, string[]> = {};

    const shopTemplates = [
      {
        name: `${DEMO_PREFIX}CollectorsHub - TCG & Collectibles`,
        slug: `${DEMO_PREFIX.toLowerCase().replace(
          /_/g,
          "-"
        )}collectorshub-tcg`,
        description:
          "Your one-stop shop for Trading Card Games, Beyblades, and Premium Figurines",
        email: "shop@collectorshub.demo.justforview.in",
        phone: "+91-9876543210",
        address: "123 Collector Street, Mumbai, Maharashtra 400001",
      },
      {
        name: `${DEMO_PREFIX}Anime Legends - Figure Paradise`,
        slug: `${DEMO_PREFIX.toLowerCase().replace(
          /_/g,
          "-"
        )}anime-legends-figures`,
        description:
          "Premium Anime Figures, Gaming Collectibles, and Limited Edition Statues",
        email: "shop@animelegends.demo.justforview.in",
        phone: "+91-9876543211",
        address: "456 Otaku Avenue, Bangalore, Karnataka 560001",
      },
    ];

    for (let i = 0; i < 2 && i < sellers.length; i++) {
      const seller = sellers[i];
      const template = shopTemplates[i];
      const shopRef = db.collection("shops").doc();
      const shopId = shopRef.id;

      await shopRef.set({
        ...template,
        owner_id: seller.id,
        is_active: true,
        status: "active",
        verified: true,
        featured: i === 0, // Only first shop is featured (homepage shop)
        logo: `https://picsum.photos/seed/shop-${shopId}/200/200`,
        banner: `https://picsum.photos/seed/shop-banner-${shopId}/1200/400`,
        rating: 4.5 + Math.random() * 0.5,
        review_count: 0,
        total_products: 0,
        total_sales: 0,
        product_count: 0, // NEW: Track product count
        auction_count: 0, // NEW: Track auction count
        metadata: {
          featured: i === 0, // NEW: Featured flag in metadata
          productCount: 0, // NEW: Will update later
          auctionCount: 0, // NEW: Will update later
        },
        settings: {
          minOrderAmount: 500,
          shippingCharge: 50,
          freeShippingThreshold: 2000,
          processingTime: "1-2 business days",
          acceptsCOD: true,
          acceptsReturns: true,
          returnWindow: 7,
        },
        policies: {
          shippingPolicy:
            "We ship within 1-2 business days. Free shipping on orders above ₹2000.",
          returnPolicy:
            "7-day return policy for unused items in original packaging.",
          termsAndConditions:
            "Standard terms and conditions apply to all purchases.",
        },
        created_at: timestamp,
        updated_at: timestamp,
      });

      shopIds.push(shopId);
      shopData.push({
        id: shopId,
        ownerId: seller.id,
        name: template.name,
        slug: template.slug,
      });
      productsByShop[shopId] = []; // Initialize product array for this shop
    }

    // Step 4: Create products (100 products with variants, distributed across shops)
    const productIds: string[] = [];
    let productCount = 0;

    // Get leaf categories only
    const leafCategories = Array.from(categoryMap.entries()).filter(
      ([name]) => {
        // Find in tree if it's a leaf
        return (
          name.includes("Set") ||
          name.includes("Type") ||
          name.includes("Figure") ||
          name.includes("Booster") ||
          name.includes("Deck") ||
          name.includes("Collection") ||
          name.includes("Edition") ||
          name.includes("Series")
        );
      }
    );

    for (let i = 0; i < 100; i++) {
      const [categoryName, categoryId] =
        leafCategories[i % leafCategories.length];
      const template = PRODUCT_TEMPLATES["Pokemon TCG"][i % 4]; // Use templates cyclically

      // Alternate between 2 shops (50 products each)
      const shopIndex = i % 2;
      const currentShop = shopData[shopIndex];

      const productRef = db.collection("products").doc();
      const productId = productRef.id;

      const basePrice =
        template.minPrice +
        Math.random() * (template.maxPrice - template.minPrice);

      const stockCount = Math.floor(Math.random() * 50) + 10;

      // Generate 3-5 real images for 60% of products, 1-2 images for others
      const imageCount =
        Math.random() < 0.6
          ? 3 + Math.floor(Math.random() * 3)
          : 1 + Math.floor(Math.random() * 2);
      const productImages = Array.from({ length: imageCount }, (_, idx) => {
        const imageIndex = (i * 10 + idx) % PRODUCT_IMAGES.length;
        return `${PRODUCT_IMAGES[imageIndex]}?w=800&h=800&fit=crop&q=80`;
      });

      // Add video to 60% of products (use different videos)
      const productVideos =
        Math.random() < 0.6 ? [PRODUCT_VIDEOS[i % PRODUCT_VIDEOS.length]] : [];

      // Calculate comprehensive pricing
      const sellingPrice = Math.round(basePrice);
      const compareAtPrice = Math.round(basePrice * 1.2); // Original/MSRP price (20% higher)
      const costPrice = Math.round(basePrice * 0.6); // Cost to seller (60% of selling price)
      const taxRate = 0.18; // 18% GST for India

      await productRef.set({
        name: `${DEMO_PREFIX}${template.name} #${i + 1}`,
        slug: `${DEMO_PREFIX.toLowerCase().replace(/_/g, "-")}${template.name
          .toLowerCase()
          .replace(/\s+/g, "-")}-${i + 1}`,
        sku: `${DEMO_PREFIX}SKU-${String(i + 1).padStart(4, "0")}`,
        description: `Premium ${template.name} from ${categoryName} collection. Authentic and in mint condition.`,

        // Comprehensive Pricing
        price: sellingPrice, // Current selling price
        compare_at_price: compareAtPrice, // Original/MSRP price (shows discount)
        cost: costPrice, // Cost to seller (for profit calculation)
        tax_rate: taxRate, // Tax percentage

        // Inventory Management
        stock_count: stockCount,
        low_stock_threshold: 5,
        track_inventory: true, // Enable inventory tracking

        // Product Info
        category_id: categoryId,
        shop_id: currentShop.id,
        seller_id: currentShop.ownerId,
        status: "published",
        is_active: true,
        is_featured: i < 30,
        brand: "Official",
        condition: "New",
        // Images and videos
        images: productImages,
        videos: productVideos,
        // Variants with comprehensive pricing
        has_variants: true,
        variants: [
          {
            id: `${productId}-v1`,
            name: "Standard Edition",
            sku: `${productId}-STD`,
            price: sellingPrice,
            compare_at_price: compareAtPrice,
            cost: costPrice,
            stock_count: Math.floor(stockCount * 0.6),
            low_stock_threshold: 3,
          },
          {
            id: `${productId}-v2`,
            name: "Deluxe Edition",
            sku: `${productId}-DLX`,
            price: Math.round(sellingPrice * 1.3),
            compare_at_price: Math.round(compareAtPrice * 1.3),
            cost: Math.round(costPrice * 1.25),
            stock_count: Math.floor(stockCount * 0.4),
            low_stock_threshold: 2,
          },
        ],

        // Physical Attributes
        weight: 50 + Math.random() * 150, // 50-200 grams
        dimensions: {
          length: 10 + Math.random() * 15, // 10-25 cm
          width: 8 + Math.random() * 12, // 8-20 cm
          height: 2 + Math.random() * 5, // 2-7 cm
          unit: "cm",
        },

        // Shipping & Returns
        shipping_class: "standard", // standard, express, free
        is_returnable: true,
        return_window_days: 7, // 7 days return policy
        return_policy:
          "Items can be returned within 7 days of delivery if unopened and in original condition. Return shipping cost will be borne by the customer unless the item is defective.",
        warranty_info: "6 months manufacturer warranty against defects.",

        // Stats (initialize to reasonable values)
        view_count: Math.floor(Math.random() * 500),
        sales_count: Math.floor(Math.random() * 50),
        favorite_count: Math.floor(Math.random() * 100),
        review_count: 0, // Will be populated when reviews are created
        average_rating: 0, // Will be calculated when reviews are created

        // Additional Info
        country_of_origin: "Japan",
        manufacturer:
          categoryName === "Pokémon TCG" || categoryName === "Yu-Gi-Oh!"
            ? "Konami"
            : "Official Licensed",

        // Features and Specifications
        features: [
          "100% Authentic",
          "Fast Shipping",
          "Secure Packaging",
          "Premium Quality",
          "Verified Seller",
        ],
        specifications: {
          "Product Type": categoryName,
          Condition: "New",
          Authentication: "Verified",
          "Package Includes": "1x Product, Original Packaging",
        },

        // SEO and metadata
        meta_title: `${template.name} - Premium Collectible`,
        meta_description: `Get authentic ${template.name} from ${categoryName}. High quality, verified seller, fast shipping.`,
        keywords: [
          categoryName,
          template.name,
          "collectible",
          "trading card",
          "beyblade",
          "figurine",
        ],
        created_at: timestamp,
        updated_at: timestamp,
      });

      productIds.push(productId);
      productsByShop[currentShop.id].push(productId);
      productCount++;
    }

    // Step 5: Create 10 auctions (5 per shop) with FUTURE end dates for testing
    const auctionIds: string[] = [];

    for (let i = 0; i < 10; i++) {
      const shopIndex = Math.floor(i / 5); // 0-4 = shop 0, 5-9 = shop 1
      const currentShop = shopData[shopIndex];
      const shopProducts = productsByShop[currentShop.id];
      const productId = shopProducts[i % shopProducts.length];

      const auctionRef = db.collection("auctions").doc();
      const auctionId = auctionRef.id;

      // FIXED: Start now, end 7-16 days in FUTURE (not past)
      const startDate = new Date(); // Now
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7 + (i % 10)); // 7-16 days in FUTURE
      endDate.setHours(23, 59, 59, 999);

      const startingBid = 5000 + Math.random() * 15000;
      const title = `${DEMO_PREFIX}Auction #${i + 1} - Premium Collectible`;
      const auctionSlug = `${DEMO_PREFIX.toLowerCase().replace(
        /_/g,
        "-"
      )}${title
        .toLowerCase()
        .replace(
          new RegExp(DEMO_PREFIX.toLowerCase().replace(/_/g, "-"), "g"),
          ""
        )
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")}-${i}`;

      // Generate 3-5 real images for 60% of auctions, 3 images for others
      const auctionImageCount =
        Math.random() < 0.6 ? 3 + Math.floor(Math.random() * 3) : 3;
      const auctionImages = Array.from(
        { length: auctionImageCount },
        (_, idx) => {
          const imageIndex = (i * 5 + idx) % PRODUCT_IMAGES.length;
          return `${PRODUCT_IMAGES[imageIndex]}?w=800&h=800&fit=crop&q=80`;
        }
      );

      // Add video to 60% of auctions (use different videos)
      const auctionVideos =
        Math.random() < 0.6 ? [PRODUCT_VIDEOS[i % PRODUCT_VIDEOS.length]] : [];

      await auctionRef.set({
        product_id: productId,
        shop_id: currentShop.id,
        seller_id: currentShop.ownerId,
        title,
        slug: auctionSlug,
        description: "Rare item up for auction. Don't miss this opportunity!",
        images: auctionImages,
        videos: auctionVideos,
        starting_bid: Math.round(startingBid),
        current_bid: Math.round(startingBid),
        bid_increment: 500,
        reserve_price: Math.round(startingBid * 1.5),
        start_time: startDate,
        end_time: endDate,
        status: "active",
        is_featured: i % 5 < 2, // First 2 auctions per shop are featured
        metadata: {
          featured: i % 5 < 2, // NEW: Featured flag
        },
        total_bids: 0,
        unique_bidders: 0,
        created_at: timestamp,
        updated_at: timestamp,
      });

      auctionIds.push(auctionId);
    }

    // Step 6: Create bids (4 buyers competing on all 5 auctions)
    let bidCount = 0;

    for (const auctionId of auctionIds) {
      const auctionDoc = await db.collection("auctions").doc(auctionId).get();
      const auctionData = auctionDoc.data();
      let currentBid = auctionData?.startingBid || 5000;

      // Each buyer places 3-5 bids on each auction
      for (const buyer of buyers) {
        const numBids = 3 + Math.floor(Math.random() * 3);

        for (let i = 0; i < numBids; i++) {
          currentBid += 500 + Math.floor(Math.random() * 1000);

          const bidRef = db.collection("bids").doc();
          await bidRef.set({
            auctionId,
            bidderId: buyer.id,
            bidderName: buyer.name,
            amount: currentBid,
            timestamp: new Date(timestamp.getTime() + bidCount * 60000), // Space out bids
            isAutoBid: false,
            status: "active",
            createdAt: timestamp,
          });

          bidCount++;
        }
      }

      // Update auction with final bid amount
      await db.collection("auctions").doc(auctionId).update({
        currentBid,
        totalBids: bidCount,
        uniqueBidders: buyers.length,
        updatedAt: timestamp,
      });
    }

    // Step 7: Create orders (buyers purchase products)
    let orderCount = 0;
    let orderItemCount = 0;

    for (let buyerIndex = 0; buyerIndex < buyers.length; buyerIndex++) {
      const buyer = buyers[buyerIndex];
      const numOrders = 2 + Math.floor(Math.random() * 3); // 2-4 orders per buyer

      for (let i = 0; i < numOrders; i++) {
        const orderRef = db.collection("orders").doc();
        const orderId = orderRef.id;

        const address =
          ADDRESS_TEMPLATES[buyerIndex % ADDRESS_TEMPLATES.length];
        const paymentMethods = ["card", "upi", "netbanking", "cod"];
        const paymentMethod =
          paymentMethods[Math.floor(Math.random() * paymentMethods.length)];

        // Select shop for this order
        const shopIndex = orderCount % shopData.length;
        const orderShop = shopData[shopIndex];

        const numItems = 1 + Math.floor(Math.random() * 3); // 1-3 items per order
        const shopProducts = productsByShop[orderShop.id];
        const orderProducts = shopProducts
          .slice(orderCount * 3, orderCount * 3 + numItems)
          .filter((pid) => pid);

        let subtotal = 0;
        const items: any[] = [];

        for (const productId of orderProducts) {
          const price = 2000 + Math.random() * 8000;
          const quantity = 1;

          items.push({
            productId,
            variantId: `${productId}-v1`,
            quantity,
            price: Math.round(price),
            subtotal: Math.round(price * quantity),
          });

          subtotal += price * quantity;
          orderItemCount++;
        }

        const shippingFee = 200;
        const tax = subtotal * 0.18;
        const total = subtotal + shippingFee + tax;

        await orderRef.set({
          orderNumber: `${DEMO_PREFIX}ORD-${String(orderCount + 1).padStart(
            4,
            "0"
          )}`,
          buyerId: buyer.id,
          buyerName: buyer.name,
          shopId: orderShop.id,
          sellerId: orderShop.ownerId,
          items,
          subtotal: Math.round(subtotal),
          shippingFee,
          tax: Math.round(tax),
          total: Math.round(total),
          status: ["pending", "confirmed", "shipped", "delivered"][
            Math.floor(Math.random() * 4)
          ],
          paymentMethod,
          paymentStatus: paymentMethod === "cod" ? "pending" : "completed",
          shippingAddress: address,
          createdAt: timestamp,
          updatedAt: timestamp,
        });

        // Create payment record
        if (paymentMethod !== "cod") {
          const paymentRef = db.collection("payments").doc();
          await paymentRef.set({
            orderId,
            amount: Math.round(total),
            method: paymentMethod,
            status: "completed",
            transactionId: `${DEMO_PREFIX}TXN-${nanoid(16)}`,
            createdAt: timestamp,
          });
        }

        // Create shipment record for shipped/delivered orders
        if (Math.random() > 0.5) {
          const shipmentRef = db.collection("shipments").doc();
          await shipmentRef.set({
            orderId,
            trackingNumber: `${DEMO_PREFIX}TRACK-${nanoid(12)}`,
            courier: ["Delhivery", "Blue Dart", "DTDC", "India Post"][
              Math.floor(Math.random() * 4)
            ],
            status: ["in_transit", "delivered"][Math.floor(Math.random() * 2)],
            createdAt: timestamp,
            updatedAt: timestamp,
          });
        }

        orderCount++;
      }
    }

    // Step 8: Mark categories and shops as featured
    const categoryIds = Array.from(categoryMap.values());
    const featuredCategoryIds = categoryIds.slice(0, 12); // 12 featured for homepage

    for (const catId of featuredCategoryIds) {
      await db
        .collection("categories")
        .doc(catId)
        .update({
          is_featured: true,
          metadata: { featured: true }, // NEW: Consolidated featured flag
        });
    }

    // Update shop counts and featured flags
    for (const shop of shopData) {
      const productCount = productsByShop[shop.id].length;
      const shopAuctionCount = auctionIds.filter(
        (_, idx) =>
          Math.floor(idx / 5) === shopData.findIndex((s) => s.id === shop.id)
      ).length;

      await db
        .collection("shops")
        .doc(shop.id)
        .update({
          product_count: productCount,
          auction_count: shopAuctionCount,
          total_products: productCount,
          "metadata.productCount": productCount,
          "metadata.auctionCount": shopAuctionCount,
          "metadata.featured": shop.slug.includes("collectorshub"), // First shop is featured
        });
    }

    // Step 9: Create reviews for products (ALL products get reviews)
    let reviewCount = 0;
    const productReviewStats: Record<string, { total: number; sum: number }> =
      {};

    // Give reviews to ALL products (not just first 60)
    for (const productId of productIds) {
      const numReviews = 2 + Math.floor(Math.random() * 6); // 2-7 reviews per product
      const ratings: number[] = [];

      for (let i = 0; i < numReviews; i++) {
        const reviewer = buyers[Math.floor(Math.random() * buyers.length)];
        const reviewRef = db.collection("reviews").doc();
        const rating = 3 + Math.floor(Math.random() * 3); // 3-5 stars
        ratings.push(rating);

        const reviewTitles = [
          "Great product!",
          "Excellent purchase",
          "Highly recommend",
          "Amazing quality",
          "Perfect condition",
          "Fast shipping",
          "Worth the price",
          "Very satisfied",
        ];

        const reviewComments = [
          "This is a fantastic item. Highly recommend!",
          "Very satisfied with the quality and authenticity.",
          "Excellent product, arrived quickly and well-packaged.",
          "Authentic and in perfect condition. Great seller!",
          "Worth every rupee. Will buy again!",
          "Good quality product, exactly as described.",
          "Fast delivery and secure packaging. Thumbs up!",
          "Premium quality collectible. Very happy with purchase.",
        ];

        await reviewRef.set({
          product_id: productId,
          user_id: reviewer.id,
          user_name: reviewer.name,
          rating,
          title: reviewTitles[i % reviewTitles.length],
          comment: reviewComments[i % reviewComments.length],
          is_verified: Math.random() > 0.2, // 80% verified
          is_featured: i === 0 && Math.random() > 0.7, // 30% chance first review is featured
          helpful_count: Math.floor(Math.random() * 25),
          images: [], // Can add review images later
          created_at: timestamp,
          updated_at: timestamp,
        });

        reviewCount++;
      }

      // Calculate average rating
      const avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
      productReviewStats[productId] = {
        total: numReviews,
        sum: ratings.reduce((a, b) => a + b, 0),
      };

      // Update product with review stats (check if exists first)
      const productDoc = await db.collection("products").doc(productId).get();
      if (productDoc.exists) {
        await productDoc.ref.update({
          review_count: numReviews,
          average_rating: Math.round(avgRating * 10) / 10, // Round to 1 decimal
        });
      } else {
        console.warn(
          `Product ${productId} not found, skipping review stats update`
        );
      }
    }

    // Response
    return NextResponse.json({
      success: true,
      message: `Demo data created with ${DEMO_PREFIX} prefix - 2 shops, 100 products, 10 auctions with FUTURE end dates`,
      summary: {
        prefix: DEMO_PREFIX,
        categories: categoryCount,
        featuredCategories: featuredCategoryIds.length,
        users: userIds.length,
        sellers: sellers.length,
        buyers: buyers.length,
        shops: shopIds.length,
        products: productCount,
        productsPerShop: 50,
        auctions: auctionIds.length,
        auctionsPerShop: 5,
        featuredAuctions: 4, // 2 per shop
        bids: bidCount,
        orders: orderCount,
        orderItems: orderItemCount,
        payments: orderCount,
        shipments: Math.floor(orderCount * 0.5),
        reviews: reviewCount,
        createdAt: timestamp.toISOString(),
      },
    });
  } catch (error: any) {
    console.error("Demo generation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate demo data" },
      { status: 500 }
    );
  }
}
