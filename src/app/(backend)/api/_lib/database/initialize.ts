/**
 * Firebase Data Initialization Script (Admin SDK)
 * Run this to populate Firebase with sample data using Admin SDK
 */

import { getAdminDb } from "./admin";

// Sample categories data with hierarchical structure
const sampleCategories = [
  // Top-level parent categories
  {
    name: "Battle Gear & Equipment",
    slug: "battle-gear-equipment",
    description:
      "Complete range of competitive battle equipment and accessories",
    image: "/images/category-battle-gear.jpg",
    icon: "⚔️",
    featured: true,
    sortOrder: 1,
    isActive: true,
    parentId: null,
  },
  {
    name: "Collectibles & Memorabilia",
    slug: "collectibles-memorabilia",
    description: "Rare collectible items and exclusive memorabilia",
    image: "/images/category-collectibles.jpg",
    icon: "🏆",
    featured: true,
    sortOrder: 2,
    isActive: true,
    parentId: null,
  },
  {
    name: "Gaming & Entertainment",
    slug: "gaming-entertainment",
    description: "Interactive gaming products and entertainment items",
    image: "/images/category-gaming.jpg",
    icon: "🎮",
    featured: true,
    sortOrder: 3,
    isActive: true,
    parentId: null,
  },
  {
    name: "Accessories & Parts",
    slug: "accessories-parts",
    description: "Essential accessories and replacement parts",
    image: "/images/category-accessories.jpg",
    icon: "🔧",
    featured: false,
    sortOrder: 4,
    isActive: true,
    parentId: null,
  },

  // Subcategories for Battle Gear & Equipment
  {
    name: "Weapons & Armaments",
    slug: "weapons-armaments",
    description: "Professional-grade weapons and armaments",
    image: "/images/subcategory-weapons.jpg",
    icon: "🗡️",
    featured: false,
    sortOrder: 1,
    isActive: true,
    parentId: "battle-gear-equipment",
  },
  {
    name: "Protective Gear",
    slug: "protective-gear",
    description: "Advanced protective equipment and armor",
    image: "/images/subcategory-armor.jpg",
    icon: "🛡️",
    featured: false,
    sortOrder: 2,
    isActive: true,
    parentId: "battle-gear-equipment",
  },

  // Subcategories for Collectibles & Memorabilia
  {
    name: "Trading Cards",
    slug: "trading-cards",
    description: "Rare and valuable trading card collections",
    image: "/images/subcategory-cards.jpg",
    icon: "🃏",
    featured: false,
    sortOrder: 1,
    isActive: true,
    parentId: "collectibles-memorabilia",
  },
  {
    name: "Figurines & Models",
    slug: "figurines-models",
    description: "Detailed figurines and scale models",
    image: "/images/subcategory-figurines.jpg",
    icon: "🎭",
    featured: false,
    sortOrder: 2,
    isActive: true,
    parentId: "collectibles-memorabilia",
  },

  // Subcategories for Gaming & Entertainment
  {
    name: "Board Games",
    slug: "board-games",
    description: "Strategy and competitive board games",
    image: "/images/subcategory-board-games.jpg",
    icon: "🎲",
    featured: false,
    sortOrder: 1,
    isActive: true,
    parentId: "gaming-entertainment",
  },
  {
    name: "Digital Games",
    slug: "digital-games",
    description: "Digital game codes and subscriptions",
    image: "/images/subcategory-digital.jpg",
    icon: "💾",
    featured: false,
    sortOrder: 2,
    isActive: true,
    parentId: "gaming-entertainment",
  },
];

// Sample products data with comprehensive variants and features
const sampleProducts = [
  // WEAPONS & ARMAMENTS - Various variants and price points
  {
    name: "Thunder Strike Battle Axe",
    slug: "thunder-strike-battle-axe",
    description:
      "Professional-grade battle axe with lightning-fast strike capabilities. Engineered for competitive battles with superior balance and durability. Features precision-forged steel blade with anti-corrosion coating and ergonomic grip for extended use.",
    shortDescription:
      "Professional battle axe with lightning-fast strike capabilities",
    price: 299.99,
    compareAtPrice: 399.99,
    cost: 180.0,
    sku: "WCA-AXE-001",
    barcode: "1234567890123",
    quantity: 15,
    lowStockThreshold: 5,
    weight: 2.5,
    weightUnit: "kg",
    dimensions: {
      length: 80,
      width: 25,
      height: 8,
      unit: "cm",
    },
    images: [
      {
        url: "/images/products/thunder-axe-1.jpg",
        alt: "Thunder Strike Battle Axe - Main View",
        order: 0,
      },
      {
        url: "/images/products/thunder-axe-2.jpg",
        alt: "Thunder Strike Battle Axe - Detail View",
        order: 1,
      },
      {
        url: "/images/products/thunder-axe-3.jpg",
        alt: "Thunder Strike Battle Axe - Action Shot",
        order: 2,
      },
    ],
    videos: [
      {
        url: "/videos/products/thunder-axe-demo.mp4",
        title: "Thunder Strike Demo",
        order: 0,
      },
    ],
    category: "weapons-armaments",
    tags: ["weapon", "axe", "professional", "competitive", "steel", "forged"],
    status: "active",
    isFeatured: true,
    rating: 4.8,
    reviewCount: 127,
    sellerId: "seller-warcraft-armory",
    seo: {
      title: "Thunder Strike Battle Axe - Professional Gaming Weapon",
      description:
        "Premium battle axe for competitive gaming with lightning-fast strikes",
      keywords: [
        "battle axe",
        "gaming weapon",
        "professional",
        "thunder strike",
      ],
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "Thunder Strike Battle Axe - Silver Edition",
    slug: "thunder-strike-battle-axe-silver",
    description:
      "Limited Silver Edition of the popular Thunder Strike Battle Axe. Features premium silver coating and enhanced grip technology for professional tournaments.",
    shortDescription: "Limited Silver Edition Thunder Strike Battle Axe",
    price: 399.99,
    compareAtPrice: 549.99,
    cost: 240.0,
    sku: "WCA-AXE-001-SLV",
    barcode: "1234567890124",
    quantity: 8,
    lowStockThreshold: 3,
    weight: 2.6,
    weightUnit: "kg",
    dimensions: {
      length: 80,
      width: 25,
      height: 8,
      unit: "cm",
    },
    images: [
      {
        url: "/images/products/thunder-axe-silver-1.jpg",
        alt: "Thunder Strike Silver - Main View",
        order: 0,
      },
      {
        url: "/images/products/thunder-axe-silver-2.jpg",
        alt: "Thunder Strike Silver - Detail",
        order: 1,
      },
    ],
    category: "weapons-armaments",
    tags: ["weapon", "axe", "professional", "limited", "silver", "tournament"],
    status: "active",
    isFeatured: true,
    rating: 4.9,
    reviewCount: 45,
    sellerId: "seller-warcraft-armory",
    seo: {
      title: "Thunder Strike Silver Edition - Limited Battle Axe",
      description:
        "Limited edition silver battle axe for professional tournament play",
      keywords: [
        "battle axe",
        "silver edition",
        "limited",
        "tournament",
        "professional",
      ],
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "Crimson Blade Sword",
    slug: "crimson-blade-sword",
    description:
      "Elegant crimson blade sword with exceptional balance and cutting precision. Handcrafted by master smiths using traditional forging techniques combined with modern materials.",
    shortDescription: "Elegant crimson blade sword with exceptional balance",
    price: 449.99,
    compareAtPrice: 599.99,
    cost: 270.0,
    sku: "WCA-SWD-002",
    barcode: "1234567890125",
    quantity: 12,
    lowStockThreshold: 4,
    weight: 1.8,
    weightUnit: "kg",
    dimensions: {
      length: 95,
      width: 8,
      height: 3,
      unit: "cm",
    },
    images: [
      {
        url: "/images/products/crimson-sword-1.jpg",
        alt: "Crimson Blade Sword - Full View",
        order: 0,
      },
      {
        url: "/images/products/crimson-sword-2.jpg",
        alt: "Crimson Blade Sword - Detail",
        order: 1,
      },
      {
        url: "/images/products/crimson-sword-3.jpg",
        alt: "Crimson Blade Sword - Hilt Detail",
        order: 2,
      },
    ],
    category: "weapons-armaments",
    tags: ["weapon", "sword", "crimson", "handcrafted", "precision", "elegant"],
    status: "active",
    isFeatured: false,
    rating: 4.7,
    reviewCount: 89,
    sellerId: "seller-warcraft-armory",
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // PROTECTIVE GEAR - Different sizes and materials
  {
    name: "Dragon Scale Armor Set - Medium",
    slug: "dragon-scale-armor-set-medium",
    description:
      "Complete protective armor set with dragon scale pattern. Provides maximum protection while maintaining flexibility for combat movements. Medium size fits chest 38-42 inches.",
    shortDescription: "Dragon scale armor set with maximum protection - Medium",
    price: 599.99,
    compareAtPrice: 799.99,
    cost: 360.0,
    sku: "DF-ARM-001-M",
    barcode: "1234567890126",
    quantity: 8,
    lowStockThreshold: 2,
    weight: 4.2,
    weightUnit: "kg",
    dimensions: {
      length: 60,
      width: 45,
      height: 8,
      unit: "cm",
    },
    images: [
      {
        url: "/images/products/dragon-armor-medium-1.jpg",
        alt: "Dragon Scale Armor Medium - Front",
        order: 0,
      },
      {
        url: "/images/products/dragon-armor-medium-2.jpg",
        alt: "Dragon Scale Armor Medium - Back",
        order: 1,
      },
      {
        url: "/images/products/dragon-armor-medium-3.jpg",
        alt: "Dragon Scale Armor Medium - Detail",
        order: 2,
      },
    ],
    category: "protective-gear",
    tags: ["armor", "protection", "dragon", "premium", "medium", "flexible"],
    status: "active",
    isFeatured: true,
    rating: 4.6,
    reviewCount: 73,
    sellerId: "seller-dragonforge",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "Dragon Scale Armor Set - Large",
    slug: "dragon-scale-armor-set-large",
    description:
      "Complete protective armor set with dragon scale pattern. Provides maximum protection while maintaining flexibility for combat movements. Large size fits chest 42-46 inches.",
    shortDescription: "Dragon scale armor set with maximum protection - Large",
    price: 619.99,
    compareAtPrice: 829.99,
    cost: 370.0,
    sku: "DF-ARM-001-L",
    barcode: "1234567890127",
    quantity: 6,
    lowStockThreshold: 2,
    weight: 4.5,
    weightUnit: "kg",
    dimensions: {
      length: 65,
      width: 50,
      height: 8,
      unit: "cm",
    },
    images: [
      {
        url: "/images/products/dragon-armor-large-1.jpg",
        alt: "Dragon Scale Armor Large - Front",
        order: 0,
      },
      {
        url: "/images/products/dragon-armor-large-2.jpg",
        alt: "Dragon Scale Armor Large - Back",
        order: 1,
      },
    ],
    category: "protective-gear",
    tags: ["armor", "protection", "dragon", "premium", "large", "flexible"],
    status: "active",
    isFeatured: false,
    rating: 4.6,
    reviewCount: 41,
    sellerId: "seller-dragonforge",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "Shadow Guard Shield",
    slug: "shadow-guard-shield",
    description:
      "Lightweight yet durable shield with shadow camouflage pattern. Perfect for defensive strategies and stealth operations. Made from advanced composite materials.",
    shortDescription: "Lightweight shield with shadow camouflage pattern",
    price: 189.99,
    compareAtPrice: 249.99,
    cost: 110.0,
    sku: "DF-SHD-002",
    barcode: "1234567890128",
    quantity: 22,
    lowStockThreshold: 8,
    weight: 1.2,
    weightUnit: "kg",
    dimensions: {
      length: 45,
      width: 35,
      height: 5,
      unit: "cm",
    },
    images: [
      {
        url: "/images/products/shadow-shield-1.jpg",
        alt: "Shadow Guard Shield - Front",
        order: 0,
      },
      {
        url: "/images/products/shadow-shield-2.jpg",
        alt: "Shadow Guard Shield - Back",
        order: 1,
      },
    ],
    category: "protective-gear",
    tags: [
      "shield",
      "protection",
      "shadow",
      "lightweight",
      "stealth",
      "composite",
    ],
    status: "active",
    isFeatured: false,
    rating: 4.4,
    reviewCount: 156,
    sellerId: "seller-dragonforge",
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // TRADING CARDS - Different sets and rarities
  {
    name: "Mystic Crystal Trading Cards - Booster Pack",
    slug: "mystic-crystal-cards-booster",
    description:
      "Premium booster pack containing 15 randomly selected Mystic Crystal trading cards including rare holographic cards. Series 3 features new legendary characters and powerful spell cards.",
    shortDescription:
      "Premium booster pack with 15 random Mystic Crystal cards",
    price: 24.99,
    compareAtPrice: 29.99,
    cost: 12.0,
    sku: "CG-MC-BP001",
    barcode: "1234567890129",
    quantity: 150,
    lowStockThreshold: 30,
    weight: 0.08,
    weightUnit: "kg",
    dimensions: {
      length: 10,
      width: 7,
      height: 2,
      unit: "cm",
    },
    images: [
      {
        url: "/images/products/mystic-cards-booster-1.jpg",
        alt: "Mystic Crystal Booster Pack",
        order: 0,
      },
      {
        url: "/images/products/mystic-cards-booster-2.jpg",
        alt: "Mystic Crystal Cards Sample",
        order: 1,
      },
    ],
    category: "trading-cards",
    tags: [
      "cards",
      "trading",
      "collectible",
      "booster",
      "mystic",
      "holographic",
    ],
    status: "active",
    isFeatured: false,
    rating: 4.3,
    reviewCount: 892,
    sellerId: "seller-crystal-games",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "Mystic Crystal Trading Cards - Starter Deck",
    slug: "mystic-crystal-starter-deck",
    description:
      "Complete starter deck with 60 pre-constructed cards perfect for beginners. Includes rulebook, play mat, and exclusive promotional card. Ready to play out of the box.",
    shortDescription: "Complete 60-card starter deck for beginners",
    price: 39.99,
    compareAtPrice: 49.99,
    cost: 20.0,
    sku: "CG-MC-SD001",
    barcode: "1234567890130",
    quantity: 85,
    lowStockThreshold: 20,
    weight: 0.35,
    weightUnit: "kg",
    dimensions: {
      length: 15,
      width: 12,
      height: 4,
      unit: "cm",
    },
    images: [
      {
        url: "/images/products/mystic-starter-1.jpg",
        alt: "Mystic Crystal Starter Deck Box",
        order: 0,
      },
      {
        url: "/images/products/mystic-starter-2.jpg",
        alt: "Starter Deck Contents",
        order: 1,
      },
    ],
    category: "trading-cards",
    tags: ["cards", "trading", "starter", "deck", "beginner", "complete"],
    status: "active",
    isFeatured: true,
    rating: 4.7,
    reviewCount: 234,
    sellerId: "seller-crystal-games",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "Elemental Warriors - Elite Collection Box",
    slug: "elemental-warriors-elite-box",
    description:
      "Premium collection box featuring rare Elemental Warriors cards. Contains 12 booster packs, 3 exclusive foil cards, and a limited edition storage box with magnetic closure.",
    shortDescription:
      "Premium collection with 12 packs and exclusive foil cards",
    price: 129.99,
    compareAtPrice: 179.99,
    cost: 65.0,
    sku: "CG-EW-ECB001",
    barcode: "1234567890131",
    quantity: 25,
    lowStockThreshold: 5,
    weight: 0.8,
    weightUnit: "kg",
    dimensions: {
      length: 25,
      width: 18,
      height: 8,
      unit: "cm",
    },
    images: [
      {
        url: "/images/products/elemental-elite-1.jpg",
        alt: "Elemental Warriors Elite Box",
        order: 0,
      },
      {
        url: "/images/products/elemental-elite-2.jpg",
        alt: "Elite Box Contents",
        order: 1,
      },
      {
        url: "/images/products/elemental-elite-3.jpg",
        alt: "Exclusive Foil Cards",
        order: 2,
      },
    ],
    category: "trading-cards",
    tags: ["cards", "trading", "elemental", "elite", "premium", "limited"],
    status: "active",
    isFeatured: true,
    rating: 4.9,
    reviewCount: 67,
    sellerId: "seller-crystal-games",
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // FIGURINES & MODELS - Different scales and characters
  {
    name: "Legendary Hero Figurine - Azurion",
    slug: "legendary-hero-azurion-figurine",
    description:
      "Highly detailed collectible figurine of the legendary hero Azurion. Hand-painted with premium materials and authentic battle pose. Limited edition with certificate of authenticity.",
    shortDescription: "Highly detailed Azurion hero figurine - Limited edition",
    price: 89.99,
    compareAtPrice: 109.99,
    cost: 45.0,
    sku: "EC-FIG-AZ001",
    barcode: "1234567890132",
    quantity: 25,
    lowStockThreshold: 5,
    weight: 0.6,
    weightUnit: "kg",
    dimensions: {
      length: 12,
      width: 12,
      height: 25,
      unit: "cm",
    },
    images: [
      {
        url: "/images/products/azurion-fig-1.jpg",
        alt: "Azurion Figurine - Front View",
        order: 0,
      },
      {
        url: "/images/products/azurion-fig-2.jpg",
        alt: "Azurion Figurine - Side View",
        order: 1,
      },
      {
        url: "/images/products/azurion-fig-3.jpg",
        alt: "Azurion Figurine - Detail",
        order: 2,
      },
    ],
    category: "figurines-models",
    tags: [
      "figurine",
      "collectible",
      "hero",
      "limited",
      "hand-painted",
      "azurion",
    ],
    status: "active",
    isFeatured: true,
    rating: 4.8,
    reviewCount: 156,
    sellerId: "seller-epic-collectibles",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "Dragon Lord Malachar - Deluxe Figure",
    slug: "dragon-lord-malachar-deluxe",
    description:
      "Massive deluxe figurine of the fearsome Dragon Lord Malachar. Features articulated wings, LED light effects in eyes, and detailed flame base. Premium collector's item.",
    shortDescription: "Massive Dragon Lord figure with LED effects",
    price: 249.99,
    compareAtPrice: 349.99,
    cost: 125.0,
    sku: "EC-FIG-DL001",
    barcode: "1234567890133",
    quantity: 8,
    lowStockThreshold: 2,
    weight: 2.1,
    weightUnit: "kg",
    dimensions: {
      length: 30,
      width: 25,
      height: 35,
      unit: "cm",
    },
    images: [
      {
        url: "/images/products/malachar-1.jpg",
        alt: "Dragon Lord Malachar - Full View",
        order: 0,
      },
      {
        url: "/images/products/malachar-2.jpg",
        alt: "Dragon Lord - LED Effects",
        order: 1,
      },
      {
        url: "/images/products/malachar-3.jpg",
        alt: "Dragon Lord - Wing Detail",
        order: 2,
      },
    ],
    videos: [
      {
        url: "/videos/products/malachar-demo.mp4",
        title: "Dragon Lord LED Demo",
        order: 0,
      },
    ],
    category: "figurines-models",
    tags: ["figurine", "dragon", "deluxe", "LED", "articulated", "premium"],
    status: "active",
    isFeatured: true,
    rating: 4.9,
    reviewCount: 43,
    sellerId: "seller-epic-collectibles",
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // BOARD GAMES - Different complexity levels
  {
    name: "Battle Strategy Master Board Game",
    slug: "battle-strategy-master-game",
    description:
      "Advanced strategy board game for 2-6 players. Features complex tactical gameplay with over 200 unique game pieces and modular board. Multiple victory conditions and expansion compatibility.",
    shortDescription: "Advanced strategy game with 200+ pieces for 2-6 players",
    price: 79.99,
    compareAtPrice: 99.99,
    cost: 40.0,
    sku: "SGC-BSM-001",
    barcode: "1234567890134",
    quantity: 30,
    lowStockThreshold: 8,
    weight: 2.8,
    weightUnit: "kg",
    dimensions: {
      length: 35,
      width: 25,
      height: 8,
      unit: "cm",
    },
    images: [
      {
        url: "/images/products/strategy-game-1.jpg",
        alt: "Battle Strategy Master - Box",
        order: 0,
      },
      {
        url: "/images/products/strategy-game-2.jpg",
        alt: "Game Board Setup",
        order: 1,
      },
      {
        url: "/images/products/strategy-game-3.jpg",
        alt: "Game Pieces Detail",
        order: 2,
      },
    ],
    category: "board-games",
    tags: [
      "board game",
      "strategy",
      "multiplayer",
      "tactical",
      "modular",
      "complex",
    ],
    status: "active",
    isFeatured: false,
    rating: 4.6,
    reviewCount: 198,
    sellerId: "seller-strategic-gaming",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "Quick Clash Card Game",
    slug: "quick-clash-card-game",
    description:
      "Fast-paced card game for 2-4 players. Easy to learn but hard to master. Perfect for casual gaming sessions. Complete in 15-30 minutes with high replay value.",
    shortDescription: "Fast-paced card game for 2-4 players - 15-30 min",
    price: 19.99,
    compareAtPrice: 24.99,
    cost: 8.0,
    sku: "SGC-QC-001",
    barcode: "1234567890135",
    quantity: 75,
    lowStockThreshold: 20,
    weight: 0.4,
    weightUnit: "kg",
    dimensions: {
      length: 12,
      width: 9,
      height: 4,
      unit: "cm",
    },
    images: [
      {
        url: "/images/products/quick-clash-1.jpg",
        alt: "Quick Clash Card Game Box",
        order: 0,
      },
      {
        url: "/images/products/quick-clash-2.jpg",
        alt: "Sample Cards",
        order: 1,
      },
    ],
    category: "board-games",
    tags: ["card game", "fast-paced", "casual", "easy", "quick", "family"],
    status: "active",
    isFeatured: false,
    rating: 4.2,
    reviewCount: 324,
    sellerId: "seller-strategic-gaming",
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // ACCESSORIES & PARTS - Gaming peripherals with variants
  {
    name: "SoundWave Pro Gaming Headset - Black",
    slug: "soundwave-pro-gaming-headset-black",
    description:
      "Professional gaming headset with 7.1 surround sound, noise cancellation, and ergonomic design for extended gaming sessions. Premium black finish with RGB lighting.",
    shortDescription: "Professional gaming headset with 7.1 surround - Black",
    price: 149.99,
    compareAtPrice: 199.99,
    cost: 75.0,
    sku: "AT-SW-PRO001-BLK",
    barcode: "1234567890136",
    quantity: 45,
    lowStockThreshold: 15,
    weight: 0.8,
    weightUnit: "kg",
    dimensions: {
      length: 20,
      width: 18,
      height: 10,
      unit: "cm",
    },
    images: [
      {
        url: "/images/products/headset-black-1.jpg",
        alt: "SoundWave Pro Black - Main",
        order: 0,
      },
      {
        url: "/images/products/headset-black-2.jpg",
        alt: "SoundWave Pro Black - Side",
        order: 1,
      },
      {
        url: "/images/products/headset-black-3.jpg",
        alt: "RGB Lighting Detail",
        order: 2,
      },
    ],
    category: "accessories-parts",
    tags: ["headset", "gaming", "audio", "professional", "black", "RGB"],
    status: "active",
    isFeatured: false,
    rating: 4.5,
    reviewCount: 267,
    sellerId: "seller-audiotech",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "SoundWave Pro Gaming Headset - White",
    slug: "soundwave-pro-gaming-headset-white",
    description:
      "Professional gaming headset with 7.1 surround sound, noise cancellation, and ergonomic design for extended gaming sessions. Premium white finish with RGB lighting.",
    shortDescription: "Professional gaming headset with 7.1 surround - White",
    price: 149.99,
    compareAtPrice: 199.99,
    cost: 75.0,
    sku: "AT-SW-PRO001-WHT",
    barcode: "1234567890137",
    quantity: 32,
    lowStockThreshold: 15,
    weight: 0.8,
    weightUnit: "kg",
    dimensions: {
      length: 20,
      width: 18,
      height: 10,
      unit: "cm",
    },
    images: [
      {
        url: "/images/products/headset-white-1.jpg",
        alt: "SoundWave Pro White - Main",
        order: 0,
      },
      {
        url: "/images/products/headset-white-2.jpg",
        alt: "SoundWave Pro White - Side",
        order: 1,
      },
    ],
    category: "accessories-parts",
    tags: ["headset", "gaming", "audio", "professional", "white", "RGB"],
    status: "active",
    isFeatured: false,
    rating: 4.5,
    reviewCount: 189,
    sellerId: "seller-audiotech",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "MechMaster Pro Gaming Keyboard",
    slug: "mechmaster-pro-gaming-keyboard",
    description:
      "Mechanical gaming keyboard with Cherry MX switches, per-key RGB lighting, and programmable macros. Built for competitive gaming with 1ms response time and anti-ghosting.",
    shortDescription: "Mechanical gaming keyboard with Cherry MX switches",
    price: 199.99,
    compareAtPrice: 279.99,
    cost: 100.0,
    sku: "AT-MM-PRO001",
    barcode: "1234567890138",
    quantity: 28,
    lowStockThreshold: 10,
    weight: 1.2,
    weightUnit: "kg",
    dimensions: {
      length: 44,
      width: 16,
      height: 4,
      unit: "cm",
    },
    images: [
      {
        url: "/images/products/keyboard-1.jpg",
        alt: "MechMaster Pro Keyboard - Main",
        order: 0,
      },
      {
        url: "/images/products/keyboard-2.jpg",
        alt: "Keyboard RGB Lighting",
        order: 1,
      },
      {
        url: "/images/products/keyboard-3.jpg",
        alt: "Switch Detail",
        order: 2,
      },
    ],
    category: "accessories-parts",
    tags: [
      "keyboard",
      "mechanical",
      "gaming",
      "RGB",
      "cherry mx",
      "programmable",
    ],
    status: "active",
    isFeatured: true,
    rating: 4.7,
    reviewCount: 156,
    sellerId: "seller-audiotech",
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // OUT OF STOCK VARIANTS to show inventory management
  {
    name: "Thunder Strike Battle Axe - Gold Edition",
    slug: "thunder-strike-battle-axe-gold",
    description:
      "Ultra-rare Gold Edition Thunder Strike Battle Axe with 24k gold plating and diamond-cut engravings. Extremely limited production run.",
    shortDescription: "Ultra-rare Gold Edition with 24k gold plating",
    price: 999.99,
    compareAtPrice: 1299.99,
    cost: 500.0,
    sku: "WCA-AXE-001-GLD",
    barcode: "1234567890139",
    quantity: 0,
    lowStockThreshold: 1,
    weight: 2.8,
    weightUnit: "kg",
    dimensions: {
      length: 80,
      width: 25,
      height: 8,
      unit: "cm",
    },
    images: [
      {
        url: "/images/products/thunder-axe-gold-1.jpg",
        alt: "Thunder Strike Gold - Main",
        order: 0,
      },
      {
        url: "/images/products/thunder-axe-gold-2.jpg",
        alt: "Gold Plating Detail",
        order: 1,
      },
    ],
    category: "weapons-armaments",
    tags: ["weapon", "axe", "gold", "limited", "luxury", "collectible"],
    status: "active",
    isFeatured: true,
    rating: 5.0,
    reviewCount: 12,
    sellerId: "seller-warcraft-armory",
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // DRAFT STATUS ITEMS to show different product statuses
  {
    name: "Phantom Cloak - Stealth Gear",
    slug: "phantom-cloak-stealth-gear",
    description:
      "Advanced stealth cloak with optical camouflage technology. Currently in development phase.",
    shortDescription: "Advanced stealth cloak with optical camouflage",
    price: 799.99,
    compareAtPrice: 999.99,
    cost: 400.0,
    sku: "DF-CLK-001",
    barcode: "1234567890140",
    quantity: 0,
    lowStockThreshold: 5,
    weight: 1.5,
    weightUnit: "kg",
    dimensions: {
      length: 120,
      width: 80,
      height: 2,
      unit: "cm",
    },
    images: [
      {
        url: "/images/products/phantom-cloak-1.jpg",
        alt: "Phantom Cloak Concept",
        order: 0,
      },
    ],
    category: "protective-gear",
    tags: ["cloak", "stealth", "optical", "camouflage", "advanced"],
    status: "draft",
    isFeatured: false,
    rating: 0,
    reviewCount: 0,
    sellerId: "seller-dragonforge",
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // DIGITAL GAMES category items
  {
    name: "Warrior's Quest - Digital Deluxe Edition",
    slug: "warriors-quest-digital-deluxe",
    description:
      "Epic RPG adventure with 100+ hours of gameplay. Digital Deluxe Edition includes season pass, exclusive characters, and digital soundtrack.",
    shortDescription: "Epic RPG with 100+ hours - Digital Deluxe Edition",
    price: 79.99,
    compareAtPrice: 99.99,
    cost: 5.0,
    sku: "DG-WQ-DDE001",
    barcode: "1234567890141",
    quantity: 9999,
    lowStockThreshold: 1000,
    weight: 0.001,
    weightUnit: "kg",
    dimensions: {
      length: 1,
      width: 1,
      height: 1,
      unit: "cm",
    },
    images: [
      {
        url: "/images/products/warriors-quest-1.jpg",
        alt: "Warrior's Quest Game Cover",
        order: 0,
      },
      {
        url: "/images/products/warriors-quest-2.jpg",
        alt: "Gameplay Screenshot",
        order: 1,
      },
    ],
    category: "digital-games",
    tags: ["digital", "RPG", "adventure", "deluxe", "season pass"],
    status: "active",
    isFeatured: true,
    rating: 4.8,
    reviewCount: 1247,
    sellerId: "seller-digital-realm",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Sample sellers data to support the products
const sampleSellers = [
  {
    id: "seller-warcraft-armory",
    name: "WarCraft Armory",
    businessName: "WarCraft Armory Ltd",
    storeName: "WarCraft Armory",
    email: "contact@warcraftarmory.com",
    isVerified: true,
    rating: 4.8,
    totalSales: 2456,
    totalProducts: 25,
    description: "Premium battle equipment and weapons for competitive gaming",
    location: "New York, USA",
    joinedDate: "2022-03-15",
    storeStatus: "live",
    verificationStatus: {
      identity: true,
      business: true,
      address: true,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "seller-dragonforge",
    name: "DragonForge",
    businessName: "DragonForge Industries",
    storeName: "DragonForge",
    email: "sales@dragonforge.com",
    isVerified: true,
    rating: 4.7,
    totalSales: 1834,
    totalProducts: 18,
    description: "Advanced protective gear and armor systems",
    location: "California, USA",
    joinedDate: "2022-01-22",
    storeStatus: "live",
    verificationStatus: {
      identity: true,
      business: true,
      address: true,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "seller-crystal-games",
    name: "Crystal Games",
    businessName: "Crystal Games Inc",
    storeName: "Crystal Games",
    email: "support@crystalgames.com",
    isVerified: true,
    rating: 4.6,
    totalSales: 5678,
    totalProducts: 45,
    description: "Trading cards and collectible gaming products",
    location: "Texas, USA",
    joinedDate: "2021-11-08",
    storeStatus: "live",
    verificationStatus: {
      identity: true,
      business: true,
      address: true,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "seller-epic-collectibles",
    name: "Epic Collectibles",
    businessName: "Epic Collectibles Co",
    storeName: "Epic Collectibles",
    email: "info@epiccollectibles.com",
    isVerified: true,
    rating: 4.9,
    totalSales: 987,
    totalProducts: 32,
    description: "Premium figurines and collectible models",
    location: "Florida, USA",
    joinedDate: "2022-06-12",
    storeStatus: "live",
    verificationStatus: {
      identity: true,
      business: true,
      address: true,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "seller-strategic-gaming",
    name: "Strategic Gaming Co",
    businessName: "Strategic Gaming Company",
    storeName: "Strategic Gaming Co",
    email: "contact@strategicgaming.com",
    isVerified: true,
    rating: 4.5,
    totalSales: 1245,
    totalProducts: 22,
    description: "Board games and tabletop gaming accessories",
    location: "Washington, USA",
    joinedDate: "2022-02-28",
    storeStatus: "live",
    verificationStatus: {
      identity: true,
      business: true,
      address: true,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "seller-audiotech",
    name: "AudioTech",
    businessName: "AudioTech Solutions",
    storeName: "AudioTech",
    email: "sales@audiotech.com",
    isVerified: true,
    rating: 4.4,
    totalSales: 3421,
    totalProducts: 28,
    description: "Gaming peripherals and audio equipment",
    location: "Nevada, USA",
    joinedDate: "2021-12-15",
    storeStatus: "live",
    verificationStatus: {
      identity: true,
      business: true,
      address: true,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "seller-digital-realm",
    name: "Digital Realm",
    businessName: "Digital Realm Entertainment",
    storeName: "Digital Realm",
    email: "contact@digitalrealm.com",
    isVerified: true,
    rating: 4.7,
    totalSales: 8934,
    totalProducts: 156,
    description: "Digital games and entertainment software",
    location: "Remote/Global",
    joinedDate: "2021-09-03",
    storeStatus: "live",
    verificationStatus: {
      identity: true,
      business: true,
      address: true,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Sample auction data to showcase auction functionality
const sampleAuctions = [
  {
    id: "auction-001",
    title: "Rare Thunder Strike Battle Axe - Prototype",
    description:
      "Prototype version of the Thunder Strike Battle Axe with unique engravings. One-of-a-kind collector's item from the original design phase.",
    productId: "thunder-strike-battle-axe",
    sellerId: "seller-warcraft-armory",
    startingBid: 500.0,
    currentBid: 750.0,
    buyNowPrice: 1200.0,
    bidIncrement: 25.0,
    startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Started 2 days ago
    endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // Ends in 5 days
    status: "active",
    featured: true,
    condition: "new",
    category: "weapons-armaments",
    images: [
      {
        url: "/images/auctions/proto-axe-1.jpg",
        alt: "Prototype Thunder Axe",
        order: 0,
      },
      {
        url: "/images/auctions/proto-axe-2.jpg",
        alt: "Unique Engravings",
        order: 1,
      },
    ],
    totalBids: 23,
    totalWatchers: 67,
    shippingInfo: {
      freeShipping: true,
      estimatedDays: "3-5",
      international: true,
    },
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
  },
  {
    id: "auction-002",
    title: "Dragon Lord Malachar - Artist Proof",
    description:
      "Artist proof version of Dragon Lord Malachar with hand-signed certificate. Limited to only 10 pieces worldwide.",
    productId: "dragon-lord-malachar-deluxe",
    sellerId: "seller-epic-collectibles",
    startingBid: 300.0,
    currentBid: 425.0,
    buyNowPrice: 800.0,
    bidIncrement: 15.0,
    startTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Started 1 day ago
    endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Ends in 3 days
    status: "active",
    featured: true,
    condition: "new",
    category: "figurines-models",
    images: [
      {
        url: "/images/auctions/malachar-proof-1.jpg",
        alt: "Artist Proof Malachar",
        order: 0,
      },
      {
        url: "/images/auctions/malachar-cert.jpg",
        alt: "Certificate",
        order: 1,
      },
    ],
    totalBids: 15,
    totalWatchers: 89,
    shippingInfo: {
      freeShipping: false,
      cost: 15.99,
      estimatedDays: "5-7",
      international: true,
    },
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
  },
  {
    id: "auction-003",
    title: "Complete Mystic Crystal Card Collection - Series 1-3",
    description:
      "Complete collection of all Mystic Crystal cards from Series 1, 2, and 3. Includes all rare and ultra-rare cards in mint condition.",
    productId: "mystic-crystal-cards-booster",
    sellerId: "seller-crystal-games",
    startingBid: 150.0,
    currentBid: 289.0,
    buyNowPrice: 500.0,
    bidIncrement: 10.0,
    startTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // Started 3 days ago
    endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Ends in 2 days
    status: "active",
    featured: false,
    condition: "mint",
    category: "trading-cards",
    images: [
      {
        url: "/images/auctions/complete-collection-1.jpg",
        alt: "Complete Collection",
        order: 0,
      },
      { url: "/images/auctions/rare-cards.jpg", alt: "Rare Cards", order: 1 },
    ],
    totalBids: 31,
    totalWatchers: 156,
    shippingInfo: {
      freeShipping: true,
      estimatedDays: "2-4",
      international: false,
    },
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
  },
  {
    id: "auction-004",
    title: "Custom Battle Strategy Board - Tournament Edition",
    description:
      "Custom-made tournament edition Battle Strategy board with premium wooden pieces and luxury storage case.",
    productId: "battle-strategy-master-game",
    sellerId: "seller-strategic-gaming",
    startingBid: 200.0,
    currentBid: 200.0,
    buyNowPrice: 400.0,
    bidIncrement: 20.0,
    startTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Starts in 1 day
    endTime: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), // Ends in 8 days
    status: "scheduled",
    featured: true,
    condition: "new",
    category: "board-games",
    images: [
      {
        url: "/images/auctions/custom-board-1.jpg",
        alt: "Custom Tournament Board",
        order: 0,
      },
      {
        url: "/images/auctions/wooden-pieces.jpg",
        alt: "Premium Pieces",
        order: 1,
      },
    ],
    totalBids: 0,
    totalWatchers: 34,
    shippingInfo: {
      freeShipping: false,
      cost: 25.99,
      estimatedDays: "7-10",
      international: true,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export async function initializeFirebaseData() {
  try {
    console.log("Starting Firebase data initialization...");
    const db = getAdminDb();

    // Initialize categories
    console.log("Adding categories...");
    const categoryBatch = db.batch();

    for (const category of sampleCategories) {
      const categoryRef = db.collection("categories").doc(category.slug);
      categoryBatch.set(categoryRef, {
        ...category,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    await categoryBatch.commit();
    console.log(`Added ${sampleCategories.length} categories`);

    // Initialize sellers
    console.log("Adding sellers...");
    const sellerBatch = db.batch();

    for (const seller of sampleSellers) {
      const sellerRef = db.collection("sellers").doc(seller.id);
      sellerBatch.set(sellerRef, {
        ...seller,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    await sellerBatch.commit();
    console.log(`Added ${sampleSellers.length} sellers`);

    // Initialize products
    console.log("Adding products...");
    const productBatch = db.batch();

    for (const product of sampleProducts) {
      const productRef = db.collection("products").doc(product.slug);
      productBatch.set(productRef, {
        ...product,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    await productBatch.commit();
    console.log(`Added ${sampleProducts.length} products`);

    // Initialize auctions
    console.log("Adding auctions...");
    const auctionBatch = db.batch();

    for (const auction of sampleAuctions) {
      const auctionRef = db.collection("auctions").doc(auction.id);
      auctionBatch.set(auctionRef, {
        ...auction,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    await auctionBatch.commit();
    console.log(`Added ${sampleAuctions.length} auctions`);

    console.log("Firebase data initialization completed successfully!");
    return {
      success: true,
      categoriesAdded: sampleCategories.length,
      sellersAdded: sampleSellers.length,
      productsAdded: sampleProducts.length,
      auctionsAdded: sampleAuctions.length,
    };
  } catch (error) {
    console.error("Error initializing Firebase data:", error);
    throw error;
  }
}

export { sampleProducts, sampleCategories, sampleSellers, sampleAuctions };

/**
 * Clean up Firebase seed data
 * This function removes all the seed data that was added during initialization
 */
export async function cleanupFirebaseData() {
  try {
    console.log("Starting Firebase data cleanup...");
    const db = getAdminDb();

    // Clean up auctions
    console.log("Removing auctions...");
    const auctionBatch = db.batch();

    for (const auction of sampleAuctions) {
      const auctionRef = db.collection("auctions").doc(auction.id);
      auctionBatch.delete(auctionRef);
    }

    await auctionBatch.commit();
    console.log(`Removed ${sampleAuctions.length} auctions`);

    // Clean up products
    console.log("Removing products...");
    const productBatch = db.batch();

    for (const product of sampleProducts) {
      const productRef = db.collection("products").doc(product.slug);
      productBatch.delete(productRef);
    }

    await productBatch.commit();
    console.log(`Removed ${sampleProducts.length} products`);

    // Clean up sellers
    console.log("Removing sellers...");
    const sellerBatch = db.batch();

    for (const seller of sampleSellers) {
      const sellerRef = db.collection("sellers").doc(seller.id);
      sellerBatch.delete(sellerRef);
    }

    await sellerBatch.commit();
    console.log(`Removed ${sampleSellers.length} sellers`);

    // Clean up categories
    console.log("Removing categories...");
    const categoryBatch = db.batch();

    for (const category of sampleCategories) {
      const categoryRef = db.collection("categories").doc(category.slug);
      categoryBatch.delete(categoryRef);
    }

    await categoryBatch.commit();
    console.log(`Removed ${sampleCategories.length} categories`);

    console.log("Firebase data cleanup completed successfully!");
    return {
      success: true,
      categoriesRemoved: sampleCategories.length,
      sellersRemoved: sampleSellers.length,
      productsRemoved: sampleProducts.length,
      auctionsRemoved: sampleAuctions.length,
    };
  } catch (error) {
    console.error("Error cleaning up Firebase data:", error);
    throw error;
  }
}
