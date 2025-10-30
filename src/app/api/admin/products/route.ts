import { NextRequest, NextResponse } from "next/server";

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  badge?: "Popular" | "New";
  badgeColor?: "warning" | "success";
}

// Mock products - in production, fetch from actual database
const MOCK_PRODUCTS: Product[] = [
  {
    id: "dragoon-gt",
    name: "Dragoon GT",
    price: 2499,
    image:
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=300&q=80",
    badge: "Popular",
    badgeColor: "warning",
  },
  {
    id: "valkyrie-x",
    name: "Valkyrie X",
    price: 1899,
    image:
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=300&q=80",
    badge: "New",
    badgeColor: "success",
  },
  {
    id: "spriggan-burst",
    name: "Spriggan Burst",
    price: 1699,
    image:
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: "storm-pegasus",
    name: "Storm Pegasus",
    price: 2299,
    image:
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=300&q=80",
    badge: "Popular",
    badgeColor: "warning",
  },
  {
    id: "rock-leone",
    name: "Rock Leone",
    price: 2199,
    image:
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=300&q=80",
    badge: "New",
    badgeColor: "success",
  },
  {
    id: "flame-sagittario",
    name: "Flame Sagittario",
    price: 1999,
    image:
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: "valkyrie-wing",
    name: "Valkyrie Wing",
    price: 2499,
    image:
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=300&q=80",
    badge: "Popular",
    badgeColor: "warning",
  },
  {
    id: "spriggan-spread",
    name: "Spriggan Spread",
    price: 2399,
    image:
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=300&q=80",
    badge: "New",
    badgeColor: "success",
  },
  {
    id: "ragnaruk-heavy",
    name: "Ragnaruk Heavy",
    price: 2199,
    image:
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=300&q=80",
  },
];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const ids = searchParams.get("ids")?.split(",") || [];

    let products = MOCK_PRODUCTS;

    // Filter by IDs if provided
    if (ids.length > 0) {
      products = products.filter((p) => ids.includes(p.id));
    }

    return NextResponse.json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch products" },
      { status: 500 },
    );
  }
}
