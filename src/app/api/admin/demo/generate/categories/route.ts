import { NextResponse } from "next/server";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/database";

const DEMO_PREFIX = "DEMO_";

// Beyblade and collectibles focused images
const CATEGORY_IMAGES: Record<
  string,
  { image: string; banner: string; icon: string }
> = {
  Beyblades: {
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
    banner:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=400&fit=crop",
    icon: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop",
  },
  "Beyblade Burst": {
    image:
      "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=400&h=300&fit=crop",
    banner:
      "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=1200&h=400&fit=crop",
    icon: "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=100&h=100&fit=crop",
  },
  "Beyblade X": {
    image:
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=300&fit=crop",
    banner:
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&h=400&fit=crop",
    icon: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=100&h=100&fit=crop",
  },
  "Attack Types": {
    image:
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop",
    banner:
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&h=400&fit=crop",
    icon: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=100&h=100&fit=crop",
  },
  "Defense Types": {
    image:
      "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=400&h=300&fit=crop",
    banner:
      "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=1200&h=400&fit=crop",
    icon: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=100&h=100&fit=crop",
  },
  "Stamina Types": {
    image:
      "https://images.unsplash.com/photo-1614680376739-414d95ff43df?w=400&h=300&fit=crop",
    banner:
      "https://images.unsplash.com/photo-1614680376739-414d95ff43df?w=1200&h=400&fit=crop",
    icon: "https://images.unsplash.com/photo-1614680376739-414d95ff43df?w=100&h=100&fit=crop",
  },
  "Balance Types": {
    image:
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=300&fit=crop",
    banner:
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&h=400&fit=crop",
    icon: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=100&h=100&fit=crop",
  },
  "Launchers & Gear": {
    image:
      "https://images.unsplash.com/photo-1560343776-97e7d202ff0e?w=400&h=300&fit=crop",
    banner:
      "https://images.unsplash.com/photo-1560343776-97e7d202ff0e?w=1200&h=400&fit=crop",
    icon: "https://images.unsplash.com/photo-1560343776-97e7d202ff0e?w=100&h=100&fit=crop",
  },
  "Stadiums & Arenas": {
    image:
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=300&fit=crop",
    banner:
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=1200&h=400&fit=crop",
    icon: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=100&h=100&fit=crop",
  },
  "Parts & Upgrades": {
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop",
    banner:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1200&h=400&fit=crop",
    icon: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=100&h=100&fit=crop",
  },
  "Limited Editions": {
    image:
      "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=400&h=300&fit=crop",
    banner:
      "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=1200&h=400&fit=crop",
    icon: "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=100&h=100&fit=crop",
  },
  "Vintage & Rare": {
    image:
      "https://images.unsplash.com/photo-1608889825205-eebdb9fc5806?w=400&h=300&fit=crop",
    banner:
      "https://images.unsplash.com/photo-1608889825205-eebdb9fc5806?w=1200&h=400&fit=crop",
    icon: "https://images.unsplash.com/photo-1608889825205-eebdb9fc5806?w=100&h=100&fit=crop",
  },
  Accessories: {
    image:
      "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&h=300&fit=crop",
    banner:
      "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=1200&h=400&fit=crop",
    icon: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=100&h=100&fit=crop",
  },
};

// Default images for subcategories
const DEFAULT_CATEGORY_IMAGES = [
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64",
  "https://images.unsplash.com/photo-1566577739112-5180d4bf9390",
  "https://images.unsplash.com/photo-1542751371-adc38448a05e",
  "https://images.unsplash.com/photo-1593305841991-05c297ba4575",
  "https://images.unsplash.com/photo-1550745165-9bc0b252726f",
  "https://images.unsplash.com/photo-1560343776-97e7d202ff0e",
  "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa",
  "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf",
];

// Beyblade-focused category tree
const CATEGORY_TREE = {
  Beyblades: {
    children: {
      "Beyblade Burst": {
        children: {
          "Attack Types": { isLeaf: true },
          "Defense Types": { isLeaf: true },
          "Stamina Types": { isLeaf: true },
          "Balance Types": { isLeaf: true },
        },
      },
      "Beyblade X": {
        children: {
          "X Attack": { isLeaf: true },
          "X Defense": { isLeaf: true },
          "X Stamina": { isLeaf: true },
          "X Balance": { isLeaf: true },
        },
      },
      "Metal Fight": {
        children: {
          "Metal Fusion": { isLeaf: true },
          "Metal Masters": { isLeaf: true },
          "Metal Fury": { isLeaf: true },
        },
      },
      "Original Series": {
        children: {
          "Plastic Gen": { isLeaf: true },
          "HMS (Heavy Metal System)": { isLeaf: true },
        },
      },
    },
  },
  "Launchers & Gear": {
    children: {
      "String Launchers": { isLeaf: true },
      "Ripcord Launchers": { isLeaf: true },
      "LR Launchers": { isLeaf: true },
      "Launcher Grips": { isLeaf: true },
      "Power Launchers": { isLeaf: true },
    },
  },
  "Stadiums & Arenas": {
    children: {
      "Standard Stadiums": { isLeaf: true },
      "Burst Stadiums": { isLeaf: true },
      "X Stadiums": { isLeaf: true },
      "Battle Sets": { isLeaf: true },
    },
  },
  "Parts & Upgrades": {
    children: {
      "Energy Layers": { isLeaf: true },
      "Forge Discs": { isLeaf: true },
      "Performance Tips": { isLeaf: true },
      Blades: { isLeaf: true },
      Ratchets: { isLeaf: true },
      Bits: { isLeaf: true },
    },
  },
  "Limited Editions": {
    children: {
      "Tournament Exclusives": { isLeaf: true },
      "Store Exclusives": { isLeaf: true },
      "Anniversary Editions": { isLeaf: true },
      "Gold Series": { isLeaf: true },
    },
  },
  "Vintage & Rare": {
    children: {
      "Vintage Beyblades": { isLeaf: true },
      "Rare Finds": { isLeaf: true },
      "Collector Items": { isLeaf: true },
    },
  },
  Accessories: {
    children: {
      "Carrying Cases": { isLeaf: true },
      "Tool Kits": { isLeaf: true },
      "Display Stands": { isLeaf: true },
      "Spare Parts": { isLeaf: true },
    },
  },
};

export async function POST() {
  try {
    const db = getFirestoreAdmin();
    const timestamp = new Date();
    const categoryMap: Record<string, string> = {};
    let categoryCount = 0;

    async function createCategories(
      tree: Record<string, any>,
      parentId: string | null = null,
      parentIds: string[] = [],
    ): Promise<void> {
      for (const [name, data] of Object.entries(tree)) {
        const catData = data as any;
        const categoryRef = db.collection(COLLECTIONS.CATEGORIES).doc();
        const categoryId = categoryRef.id;
        const categoryName = `${DEMO_PREFIX}${name}`;

        // Get category-specific images or use defaults
        const catImages = CATEGORY_IMAGES[name] || {
          image: `${DEFAULT_CATEGORY_IMAGES[categoryCount % DEFAULT_CATEGORY_IMAGES.length]}?w=400&h=300&fit=crop`,
          banner: `${DEFAULT_CATEGORY_IMAGES[categoryCount % DEFAULT_CATEGORY_IMAGES.length]}?w=1200&h=400&fit=crop`,
          icon: `${DEFAULT_CATEGORY_IMAGES[categoryCount % DEFAULT_CATEGORY_IMAGES.length]}?w=100&h=100&fit=crop`,
        };

        await categoryRef.set({
          name: categoryName,
          slug: categoryName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          description: `Premium ${name} collection - authentic Beyblades and accessories`,
          parent_id: parentId,
          parent_ids: [...parentIds, ...(parentId ? [parentId] : [])],
          is_leaf: catData.isLeaf || false,
          is_active: true,
          is_featured: Math.random() > 0.6,
          sort_order: categoryCount,
          product_count: 0,
          in_stock_count: 0,
          out_of_stock_count: 0,
          live_auction_count: 0,
          ended_auction_count: 0,
          image: catImages.image,
          banner_image: catImages.banner,
          icon: catImages.icon,
          thumbnail: `https://picsum.photos/seed/cat-thumb-${categoryId}/150/150`,
          created_at: timestamp,
          updated_at: timestamp,
        });

        categoryMap[name] = categoryId;
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

    return NextResponse.json({
      success: true,
      step: "categories",
      data: {
        count: categoryCount,
        categoryMap,
      },
    });
  } catch (error: unknown) {
    console.error("Demo categories error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to generate categories";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
