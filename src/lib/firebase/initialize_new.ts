/**
 * Firebase Data Initialization Script (Admin SDK)
 * Run this to populate Firebase with sample data using Admin SDK
 */

import { getAdminDb } from './admin';

// Sample categories data with hierarchical structure
const sampleCategories = [
  // Top-level parent categories
  {
    name: "Battle Gear & Equipment",
    slug: "battle-gear-equipment",
    description: "Complete range of competitive battle equipment and accessories",
    image: "/images/category-battle-gear.jpg",
    icon: "⚔️",
    featured: true,
    sortOrder: 1,
    isActive: true,
    parentId: null
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
    parentId: null
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
    parentId: null
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
    parentId: null
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
    parentId: "battle-gear-equipment"
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
    parentId: "battle-gear-equipment"
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
    parentId: "collectibles-memorabilia"
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
    parentId: "collectibles-memorabilia"
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
    parentId: "gaming-entertainment"
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
    parentId: "gaming-entertainment"
  }
];

// Sample products data
const sampleProducts = [
  {
    name: "Thunder Strike Battle Axe",
    slug: "thunder-strike-battle-axe",
    description: "Professional-grade battle axe with lightning-fast strike capabilities. Engineered for competitive battles with superior balance and durability.",
    price: 299.99,
    originalPrice: 399.99,
    categoryId: "weapons-armaments",
    subcategoryId: null,
    brand: "WarCraft Armory",
    sku: "WCA-AXE-001",
    stock: 15,
    images: [
      "/images/products/thunder-axe-1.jpg",
      "/images/products/thunder-axe-2.jpg",
      "/images/products/thunder-axe-3.jpg"
    ],
    specifications: {
      weight: "2.5 kg",
      length: "80 cm",
      material: "Forged Steel",
      color: "Metallic Blue"
    },
    featured: true,
    status: "active",
    tags: ["weapon", "axe", "professional", "competitive"],
    sellerId: "seller-warcraft-armory",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Dragon Scale Armor Set",
    slug: "dragon-scale-armor-set",
    description: "Complete protective armor set with dragon scale pattern. Provides maximum protection while maintaining flexibility for combat movements.",
    price: 599.99,
    originalPrice: 799.99,
    categoryId: "protective-gear",
    subcategoryId: null,
    brand: "DragonForge",
    sku: "DF-ARM-001",
    stock: 8,
    images: [
      "/images/products/dragon-armor-1.jpg",
      "/images/products/dragon-armor-2.jpg",
      "/images/products/dragon-armor-3.jpg"
    ],
    specifications: {
      size: "Medium",
      material: "Carbon Fiber Composite",
      color: "Emerald Green",
      protection: "Level 5"
    },
    featured: true,
    status: "active",
    tags: ["armor", "protection", "dragon", "premium"],
    sellerId: "seller-dragonforge",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Mystic Crystal Trading Cards - Booster Pack",
    slug: "mystic-crystal-cards-booster",
    description: "Premium booster pack containing 15 randomly selected Mystic Crystal trading cards including rare holographic cards.",
    price: 24.99,
    originalPrice: 29.99,
    categoryId: "trading-cards",
    subcategoryId: null,
    brand: "Crystal Games",
    sku: "CG-MC-BP001",
    stock: 150,
    images: [
      "/images/products/mystic-cards-1.jpg",
      "/images/products/mystic-cards-2.jpg"
    ],
    specifications: {
      cards: "15 cards",
      rarity: "Mixed (Common to Ultra Rare)",
      series: "Series 3",
      language: "English"
    },
    featured: false,
    status: "active",
    tags: ["cards", "trading", "collectible", "booster"],
    sellerId: "seller-crystal-games",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Legendary Hero Figurine - Azurion",
    slug: "legendary-hero-azurion-figurine",
    description: "Highly detailed collectible figurine of the legendary hero Azurion. Hand-painted with premium materials and authentic battle pose.",
    price: 89.99,
    originalPrice: 109.99,
    categoryId: "figurines-models",
    subcategoryId: null,
    brand: "Epic Collectibles",
    sku: "EC-FIG-AZ001",
    stock: 25,
    images: [
      "/images/products/azurion-fig-1.jpg",
      "/images/products/azurion-fig-2.jpg",
      "/images/products/azurion-fig-3.jpg"
    ],
    specifications: {
      height: "25 cm",
      material: "High-Quality PVC",
      scale: "1:8",
      edition: "Limited Edition"
    },
    featured: true,
    status: "active",
    tags: ["figurine", "collectible", "hero", "limited"],
    sellerId: "seller-epic-collectibles",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Battle Strategy Master Board Game",
    slug: "battle-strategy-master-game",
    description: "Advanced strategy board game for 2-6 players. Features complex tactical gameplay with over 200 unique game pieces and modular board.",
    price: 79.99,
    originalPrice: 99.99,
    categoryId: "board-games",
    subcategoryId: null,
    brand: "Strategic Gaming Co",
    sku: "SGC-BSM-001",
    stock: 30,
    images: [
      "/images/products/strategy-game-1.jpg",
      "/images/products/strategy-game-2.jpg"
    ],
    specifications: {
      players: "2-6 players",
      duration: "90-180 minutes",
      age: "14+",
      components: "200+ pieces"
    },
    featured: false,
    status: "active",
    tags: ["board game", "strategy", "multiplayer", "tactical"],
    sellerId: "seller-strategic-gaming",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Premium Gaming Headset - SoundWave Pro",
    slug: "soundwave-pro-gaming-headset",
    description: "Professional gaming headset with 7.1 surround sound, noise cancellation, and ergonomic design for extended gaming sessions.",
    price: 149.99,
    originalPrice: 199.99,
    categoryId: "accessories-parts",
    subcategoryId: null,
    brand: "AudioTech",
    sku: "AT-SW-PRO001",
    stock: 45,
    images: [
      "/images/products/headset-1.jpg",
      "/images/products/headset-2.jpg"
    ],
    specifications: {
      audio: "7.1 Surround Sound",
      connectivity: "USB + 3.5mm",
      microphone: "Noise Cancelling",
      compatibility: "PC, Console, Mobile"
    },
    featured: false,
    status: "active",
    tags: ["headset", "gaming", "audio", "professional"],
    sellerId: "seller-audiotech",
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export async function initializeFirebaseData() {
  try {
    console.log('Starting Firebase data initialization...');
    const db = getAdminDb();

    // Initialize categories
    console.log('Adding categories...');
    const categoryBatch = db.batch();
    
    for (const category of sampleCategories) {
      const categoryRef = db.collection('categories').doc(category.slug);
      categoryBatch.set(categoryRef, {
        ...category,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    await categoryBatch.commit();
    console.log(`Added ${sampleCategories.length} categories`);

    // Initialize products
    console.log('Adding products...');
    const productBatch = db.batch();
    
    for (const product of sampleProducts) {
      const productRef = db.collection('products').doc(product.slug);
      productBatch.set(productRef, {
        ...product,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    await productBatch.commit();
    console.log(`Added ${sampleProducts.length} products`);

    console.log('Firebase data initialization completed successfully!');
    return {
      success: true,
      categoriesAdded: sampleCategories.length,
      productsAdded: sampleProducts.length
    };

  } catch (error) {
    console.error('Error initializing Firebase data:', error);
    throw error;
  }
}

export { sampleProducts, sampleCategories };
