import { NextRequest, NextResponse } from "next/server";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/database";

const DEMO_PREFIX = "DEMO_";

const INDIAN_CITIES = [
  { city: "Mumbai", state: "Maharashtra", pincode: "400001" },
  { city: "Delhi", state: "Delhi", pincode: "110001" },
  { city: "Bangalore", state: "Karnataka", pincode: "560001" },
  { city: "Chennai", state: "Tamil Nadu", pincode: "600001" },
  { city: "Kolkata", state: "West Bengal", pincode: "700001" },
  { city: "Pune", state: "Maharashtra", pincode: "411001" },
  { city: "Ahmedabad", state: "Gujarat", pincode: "380001" },
  { city: "Hyderabad", state: "Telangana", pincode: "500001" },
  { city: "Jaipur", state: "Rajasthan", pincode: "302001" },
  { city: "Lucknow", state: "Uttar Pradesh", pincode: "226001" },
];

const STREETS = [
  "Marine Drive",
  "MG Road",
  "Park Street",
  "Anna Salai",
  "FC Road",
  "Brigade Road",
  "Linking Road",
  "Gandhi Nagar",
  "Civil Lines",
  "Mall Road",
];

// Beyblade-themed shop names
const SHOP_PREFIXES = [
  "Blader's",
  "Spin",
  "Burst",
  "Battle",
  "Storm",
  "Dragon",
  "Phoenix",
  "Ultimate",
  "Pro",
  "Master",
  "Legend",
  "Galaxy",
  "Turbo",
  "Nova",
  "Metal",
  "Champion",
];
const SHOP_SUFFIXES = [
  "Arena",
  "Den",
  "Hub",
  "Zone",
  "Store",
  "Emporium",
  "Palace",
  "Corner",
  "World",
  "Vault",
  "Paradise",
  "Bazaar",
  "Haven",
  "Fortress",
  "Stadium",
  "Dojo",
];

// Shop logos and banners - Beyblade themed
const SHOP_LOGOS = [
  "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1598808503491-fa80d3e5a0d9?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop",
];

const SHOP_BANNERS = [
  "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=1200&h=400&fit=crop",
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=400&fit=crop",
  "https://images.unsplash.com/photo-1608889825205-eebdb9fc5806?w=1200&h=400&fit=crop",
  "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&h=400&fit=crop",
  "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=1200&h=400&fit=crop",
  "https://images.unsplash.com/photo-1560343776-97e7d202ff0e?w=1200&h=400&fit=crop",
  "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&h=400&fit=crop",
  "https://images.unsplash.com/photo-1493711662062-fa541f7f76cc?w=1200&h=400&fit=crop",
  "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&h=400&fit=crop",
  "https://images.unsplash.com/photo-1614680376739-414d95ff43df?w=1200&h=400&fit=crop",
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sellers, scale = 10 } = body;

    if (!sellers || !Array.isArray(sellers) || sellers.length === 0) {
      return NextResponse.json(
        { success: false, error: "Sellers data required" },
        { status: 400 },
      );
    }

    const db = getFirestoreAdmin();
    const timestamp = new Date();
    const createdShops: Array<{
      id: string;
      ownerId: string;
      name: string;
      slug: string;
    }> = [];

    // Calculate shop count: scale / 2 (5 shops for scale 10, 50 for scale 100)
    const shopCount = Math.max(1, Math.ceil(scale / 2));

    for (let i = 0; i < Math.min(sellers.length, shopCount); i++) {
      const seller = sellers[i];
      const city = INDIAN_CITIES[i % INDIAN_CITIES.length];
      const shopName = `${DEMO_PREFIX}${SHOP_PREFIXES[i % SHOP_PREFIXES.length]} ${SHOP_SUFFIXES[i % SHOP_SUFFIXES.length]}`;
      const shopSlug = shopName.toLowerCase().replace(/[^a-z0-9]+/g, "-");

      const shopRef = db.collection(COLLECTIONS.SHOPS).doc();
      await shopRef.set({
        name: shopName,
        slug: shopSlug,
        description: `Premium Beyblade shop - Attack, Defense, Stamina types and accessories. Authentic Takara Tomy and Hasbro products!`,
        tagline: [
          "Let it rip!",
          "Authentic Beyblades only",
          "Fast shipping worldwide",
          "Blader's choice",
        ][i % 4],
        email: `shop${i + 1}@demo.letitrip.in`,
        phone: `+91-${8000000000 + i}`,
        whatsapp: `+91-${8000000000 + i}`,
        address: `${100 + i} ${STREETS[i % STREETS.length]}, ${city.city}, ${city.state} ${city.pincode}`,
        owner_id: seller.id,
        is_active: true,
        is_banned: false,
        is_verified: true,
        is_featured: i < 10,
        show_on_homepage: i < 5,
        status: "active",
        logo: SHOP_LOGOS[i % SHOP_LOGOS.length],
        banner: SHOP_BANNERS[i % SHOP_BANNERS.length],
        cover_images: [
          SHOP_BANNERS[i % SHOP_BANNERS.length],
          SHOP_BANNERS[(i + 1) % SHOP_BANNERS.length],
          SHOP_BANNERS[(i + 2) % SHOP_BANNERS.length],
        ],
        gallery: [
          `https://images.unsplash.com/photo-${1560000000000 + i * 1000}?w=600&h=400&fit=crop`,
          `https://images.unsplash.com/photo-${1570000000000 + i * 1000}?w=600&h=400&fit=crop`,
          `https://images.unsplash.com/photo-${1580000000000 + i * 1000}?w=600&h=400&fit=crop`,
        ],
        rating: 3.5 + Math.random() * 1.5,
        review_count: Math.floor(Math.random() * 200) + 10,
        product_count: 0,
        auction_count: 0,
        follower_count: Math.floor(Math.random() * 5000) + 100,
        total_sales: Math.floor(Math.random() * 50000) + 5000,
        social_links: {
          facebook: `https://facebook.com/demo-shop-${i}`,
          instagram: `https://instagram.com/demo_shop_${i}`,
          twitter: `https://twitter.com/demo_shop_${i}`,
        },
        settings: {
          minOrderAmount: 200 + (i % 5) * 100,
          shippingCharge: 40 + (i % 3) * 10,
          freeShippingThreshold: 1500 + (i % 5) * 500,
          acceptsCOD: i % 3 !== 0,
          acceptsReturns: true,
          returnWindow: 7,
        },
        business_hours: {
          monday: { open: "09:00", close: "21:00" },
          tuesday: { open: "09:00", close: "21:00" },
          wednesday: { open: "09:00", close: "21:00" },
          thursday: { open: "09:00", close: "21:00" },
          friday: { open: "09:00", close: "21:00" },
          saturday: { open: "10:00", close: "20:00" },
          sunday: { open: "10:00", close: "18:00" },
        },
        created_at: timestamp,
        updated_at: timestamp,
      });

      createdShops.push({
        id: shopRef.id,
        ownerId: seller.id,
        name: shopName,
        slug: shopSlug,
      });
    }

    return NextResponse.json({
      success: true,
      step: "shops",
      data: {
        count: createdShops.length,
        shops: createdShops,
      },
    });
  } catch (error: unknown) {
    console.error("Demo shops error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to generate shops";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
