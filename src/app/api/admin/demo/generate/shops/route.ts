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

const STREETS = ["Marine Drive", "MG Road", "Park Street", "Anna Salai", "FC Road", "Brigade Road", "Linking Road", "Gandhi Nagar", "Civil Lines", "Mall Road"];
const SHOP_PREFIXES = ["Collector's", "Elite", "Premium", "Rare", "Ultimate", "Epic", "Legendary", "Master", "Super", "Mega", "Pro", "Classic", "Modern", "Galaxy", "Star", "Nova"];
const SHOP_SUFFIXES = ["Cards", "Collectibles", "Treasures", "Hub", "Zone", "Store", "Emporium", "Palace", "Corner", "World", "Den", "Vault", "Paradise", "Market", "Bazaar", "Plaza"];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sellers } = body;

    if (!sellers || !Array.isArray(sellers) || sellers.length === 0) {
      return NextResponse.json({ success: false, error: "Sellers data required" }, { status: 400 });
    }

    const db = getFirestoreAdmin();
    const timestamp = new Date();
    const createdShops: Array<{ id: string; ownerId: string; name: string; slug: string }> = [];

    for (let i = 0; i < Math.min(sellers.length, 50); i++) {
      const seller = sellers[i];
      const city = INDIAN_CITIES[i % INDIAN_CITIES.length];
      const shopName = `${DEMO_PREFIX}${SHOP_PREFIXES[i % SHOP_PREFIXES.length]} ${SHOP_SUFFIXES[i % SHOP_SUFFIXES.length]}`;
      const shopSlug = shopName.toLowerCase().replace(/[^a-z0-9]+/g, "-");

      const shopRef = db.collection(COLLECTIONS.SHOPS).doc();
      await shopRef.set({
        name: shopName,
        slug: shopSlug,
        description: `Premium collectibles shop - TCG, Beyblades, and Figurines`,
        email: `shop${i + 1}@demo.justforview.in`,
        phone: `+91-${8000000000 + i}`,
        address: `${100 + i} ${STREETS[i % STREETS.length]}, ${city.city}, ${city.state} ${city.pincode}`,
        owner_id: seller.id,
        is_active: true,
        status: "active",
        verified: true,
        featured: i < 10,
        logo: `https://picsum.photos/seed/shop-${shopRef.id}/200/200`,
        banner: `https://picsum.photos/seed/banner-${shopRef.id}/1200/400`,
        rating: 3.5 + Math.random() * 1.5,
        product_count: 0,
        auction_count: 0,
        settings: {
          minOrderAmount: 200 + (i % 5) * 100,
          shippingCharge: 40 + (i % 3) * 10,
          freeShippingThreshold: 1500 + (i % 5) * 500,
          acceptsCOD: i % 3 !== 0,
          acceptsReturns: true,
          returnWindow: 7,
        },
        created_at: timestamp,
        updated_at: timestamp,
      });

      createdShops.push({ id: shopRef.id, ownerId: seller.id, name: shopName, slug: shopSlug });
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
    const message = error instanceof Error ? error.message : "Failed to generate shops";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
