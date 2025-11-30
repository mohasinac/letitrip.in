import { NextResponse } from "next/server";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/database";

const DEMO_PREFIX = "DEMO_";

const CATEGORY_TREE = {
  "Trading Card Games": {
    children: {
      "Pokemon TCG": { children: { "Base Set": { isLeaf: true }, "Booster Packs": { isLeaf: true }, "Elite Trainer Boxes": { isLeaf: true } } },
      "Yu-Gi-Oh!": { children: { "Structure Decks": { isLeaf: true }, "Booster Boxes": { isLeaf: true }, "Legendary Collections": { isLeaf: true } } },
      "Magic: The Gathering": { children: { "Commander Decks": { isLeaf: true }, "Draft Boosters": { isLeaf: true }, "Set Boosters": { isLeaf: true } } },
    },
  },
  Beyblades: {
    children: {
      "Beyblade Burst": { children: { "Attack Types": { isLeaf: true }, "Defense Types": { isLeaf: true }, "Stamina Types": { isLeaf: true }, Launchers: { isLeaf: true } } },
      "Beyblade X": { children: { "X Series Attack": { isLeaf: true }, "X Series Defense": { isLeaf: true } } },
    },
  },
  Figurines: {
    children: {
      "Anime Figures": { children: { Nendoroid: { isLeaf: true }, Figma: { isLeaf: true }, "Scale Figures": { isLeaf: true } } },
      "Gaming Figures": { children: { Amiibo: { isLeaf: true }, "Action RPG": { isLeaf: true } } },
    },
  },
  Accessories: {
    children: {
      "Card Protection": { children: { "Card Sleeves": { isLeaf: true }, "Deck Boxes": { isLeaf: true }, Binders: { isLeaf: true } } },
      "Display": { children: { "Display Cases": { isLeaf: true }, Risers: { isLeaf: true } } },
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
      parentIds: string[] = []
    ): Promise<void> {
      for (const [name, data] of Object.entries(tree)) {
        const catData = data as any;
        const categoryRef = db.collection(COLLECTIONS.CATEGORIES).doc();
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
          is_featured: Math.random() > 0.6,
          product_count: 0,
          image: `https://picsum.photos/seed/cat-${categoryId}/400/300`,
          created_at: timestamp,
          updated_at: timestamp,
        });

        categoryMap[name] = categoryId;
        categoryCount++;

        if (catData.children) {
          await createCategories(
            catData.children,
            categoryId,
            [...parentIds, ...(parentId ? [parentId] : []), categoryId]
          );
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
    const message = error instanceof Error ? error.message : "Failed to generate categories";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
