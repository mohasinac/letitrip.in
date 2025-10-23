/**
 * Firebase Data Initialization Script
 * Run this to populate Firebase with sample data
 */

import { 
  collection, 
  addDoc, 
  doc, 
  setDoc,
  Timestamp 
} from 'firebase/firestore';
import { db } from './config';

// Sample products data
const sampleProducts = [
  {
    name: "Rare Vintage Beyblade Metal Series",
    slug: "rare-vintage-beyblade-metal-series",
    description: "Authentic Takara Tomy Beyblade with metal fusion technology. This rare vintage piece is in excellent condition and comes with original packaging. Perfect for collectors and competitive play.",
    shortDescription: "Authentic Takara Tomy Metal Fusion Beyblade",
    price: 1590,
    compareAtPrice: 1890,
    cost: 800,
    sku: "BB-001-VTG",
    barcode: "1234567890123",
    quantity: 15,
    lowStockThreshold: 5,
    weight: 0.15,
    dimensions: {
      length: 5,
      width: 5,
      height: 3,
      unit: "cm" as const
    },
    images: [
      { url: "/images/product-1.jpg", alt: "Vintage Beyblade Metal Series", order: 1 },
      { url: "/images/product-1-2.jpg", alt: "Beyblade Detail View", order: 2 }
    ],
    category: "Beyblades",
    tags: ["vintage", "metal", "fusion", "takara tomy", "rare"],
    status: "active" as const,
    isFeatured: true,
    seo: {
      title: "Rare Vintage Beyblade Metal Series - Authentic Takara Tomy",
      description: "Get your hands on this rare vintage Beyblade from the Metal Fusion series. Authentic Takara Tomy product in mint condition.",
      keywords: ["beyblade", "metal fusion", "vintage", "takara tomy", "collectible"]
    },
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    name: "Professional Tournament Stadium",
    slug: "professional-tournament-stadium",
    description: "Official tournament-grade Beyblade stadium with high walls and smooth surface for optimal battle performance. Used in official competitions worldwide.",
    shortDescription: "Official tournament-grade stadium",
    price: 2999,
    compareAtPrice: 3499,
    cost: 1500,
    sku: "BS-002-PRO",
    quantity: 8,
    lowStockThreshold: 3,
    weight: 1.2,
    dimensions: {
      length: 40,
      width: 40,
      height: 10,
      unit: "cm" as const
    },
    images: [
      { url: "/images/product-2.jpg", alt: "Professional Tournament Stadium", order: 1 },
      { url: "/images/product-2-2.jpg", alt: "Stadium Detail", order: 2 }
    ],
    category: "Stadiums",
    tags: ["stadium", "tournament", "professional", "official"],
    status: "active" as const,
    isFeatured: true,
    seo: {
      title: "Professional Tournament Stadium - Official Competition Grade",
      description: "Official tournament-grade Beyblade stadium for competitive play. High-quality construction for optimal battle performance.",
      keywords: ["beyblade stadium", "tournament", "professional", "competition"]
    },
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    name: "Metal Fusion Launcher Pro",
    slug: "metal-fusion-launcher-pro",
    description: "High-performance launcher designed for metal fusion beyblades. Features precision engineering for consistent launches and maximum power.",
    shortDescription: "High-performance metal fusion launcher",
    price: 890,
    cost: 400,
    sku: "BL-003-PRO",
    quantity: 25,
    lowStockThreshold: 10,
    weight: 0.3,
    images: [
      { url: "/images/product-3.jpg", alt: "Metal Fusion Launcher Pro", order: 1 }
    ],
    category: "Launchers",
    tags: ["launcher", "metal fusion", "professional", "precision"],
    status: "active" as const,
    isFeatured: false,
    seo: {
      title: "Metal Fusion Launcher Pro - High-Performance Beyblade Launcher",
      description: "Professional-grade launcher for metal fusion beyblades. Precision engineering for consistent power and accuracy.",
      keywords: ["beyblade launcher", "metal fusion", "professional", "precision"]
    },
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    name: "Collector's Edition Set",
    slug: "collectors-edition-set",
    description: "Limited edition collector's set featuring 3 rare beyblades, custom stadium, and premium launcher. Only 500 sets produced worldwide.",
    shortDescription: "Limited edition collector's set",
    price: 4999,
    compareAtPrice: 5999,
    cost: 2500,
    sku: "BC-004-LTD",
    quantity: 3,
    lowStockThreshold: 1,
    weight: 2.5,
    images: [
      { url: "/images/product-4.jpg", alt: "Collector's Edition Set", order: 1 },
      { url: "/images/product-4-2.jpg", alt: "Set Contents", order: 2 }
    ],
    category: "Sets",
    tags: ["collector", "limited edition", "rare", "premium", "set"],
    status: "active" as const,
    isFeatured: true,
    seo: {
      title: "Collector's Edition Set - Limited Edition Beyblade Collection",
      description: "Exclusive collector's set with 3 rare beyblades, custom stadium, and premium launcher. Limited to 500 sets worldwide.",
      keywords: ["beyblade collector", "limited edition", "rare", "premium set"]
    },
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  }
];

// Sample auctions data
const sampleAuctions = [
  {
    title: "Ultra Rare Championship Beyblade",
    description: "This is an extremely rare championship edition beyblade that was used in the 2019 World Championships. Only a few of these were ever made for the tournament participants. Features unique metal components and special edition design elements that make it highly sought after by collectors worldwide.",
    images: ["/images/auction-1.jpg", "/images/auction-1-2.jpg"],
    currentBid: 2500,
    startingBid: 1000,
    minimumBid: 2600,
    endTime: Timestamp.fromDate(new Date(Date.now() + 6 * 60 * 60 * 1000)), // 6 hours from now
    status: "live",
    bidCount: 15,
    category: "Beyblades",
    condition: "Mint",
    isAuthentic: true,
    sellerId: "seller_1",
    seller: {
      id: "seller_1",
      name: "ProCollectorShop",
      rating: 4.9,
      totalSales: 156,
      memberSince: "2020-01-15",
      verified: true
    },
    watchlist: [],
    shippingInfo: {
      domestic: {
        cost: 99,
        time: "3-5 business days"
      },
      international: {
        available: true,
        cost: 299,
        time: "7-14 business days"
      }
    },
    returnPolicy: "No returns on auction items unless item is significantly not as described. All sales are final.",
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    title: "Vintage Action Figure Collection",
    description: "Complete set of vintage action figures from the 1980s anime series. All figures are in original packaging and have never been opened. This is a rare find for collectors of vintage anime memorabilia.",
    images: ["/images/auction-2.jpg"],
    currentBid: 0,
    startingBid: 1500,
    minimumBid: 1500,
    endTime: Timestamp.fromDate(new Date(Date.now() + 24 * 60 * 60 * 1000)), // 24 hours from now
    status: "upcoming",
    bidCount: 0,
    category: "Action Figures",
    condition: "New in Package",
    isAuthentic: true,
    sellerId: "seller_2",
    seller: {
      id: "seller_2",
      name: "VintageToysIndia",
      rating: 4.7,
      totalSales: 89,
      memberSince: "2019-06-10",
      verified: true
    },
    watchlist: [],
    shippingInfo: {
      domestic: {
        cost: 149,
        time: "3-5 business days"
      }
    },
    returnPolicy: "7-day return policy if item is not as described",
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  }
];

// Sample categories data
const sampleCategories = [
  {
    name: "Beyblades",
    slug: "beyblades",
    description: "Authentic Beyblade spinning tops and battle tops",
    image: "/images/category-beyblades.jpg",
    order: 1,
    status: "active",
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    name: "Stadiums",
    slug: "stadiums",
    description: "Battle stadiums and arenas for competitive play",
    image: "/images/category-stadiums.jpg",
    order: 2,
    status: "active",
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    name: "Launchers",
    slug: "launchers",
    description: "Precision launchers for optimal performance",
    image: "/images/category-launchers.jpg",
    order: 3,
    status: "active",
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    name: "Action Figures",
    slug: "action-figures",
    description: "Collectible action figures from various franchises",
    image: "/images/category-action-figures.jpg",
    order: 4,
    status: "active",
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  }
];

export async function initializeFirebaseData() {
  try {
    console.log("Initializing Firebase with sample data...");

    // Add sample products
    console.log("Adding sample products...");
    for (const product of sampleProducts) {
      await addDoc(collection(db, 'products'), product);
    }

    // Add sample auctions
    console.log("Adding sample auctions...");
    for (const auction of sampleAuctions) {
      await addDoc(collection(db, 'auctions'), auction);
    }

    // Add sample categories
    console.log("Adding sample categories...");
    for (const category of sampleCategories) {
      await addDoc(collection(db, 'categories'), category);
    }

    console.log("Firebase initialization completed successfully!");
    return { success: true, message: "Sample data added successfully" };

  } catch (error) {
    console.error("Error initializing Firebase data:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

// Export individual data arrays for use elsewhere
export { sampleProducts, sampleAuctions, sampleCategories };
