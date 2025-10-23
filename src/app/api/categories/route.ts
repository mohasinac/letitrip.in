import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Mock categories data - replace with database query
    const categories = [
      {
        id: "cat_1",
        name: "Beyblades",
        slug: "beyblades",
        description: "Authentic Beyblade spinning tops and accessories",
        image: "/images/category-beyblades.jpg",
        productCount: 156,
        subcategories: [
          {
            id: "subcat_1",
            name: "Metal Series",
            slug: "metal-series",
            productCount: 45
          },
          {
            id: "subcat_2", 
            name: "Burst Series",
            slug: "burst-series",
            productCount: 38
          },
          {
            id: "subcat_3",
            name: "Launchers",
            slug: "launchers",
            productCount: 23
          },
          {
            id: "subcat_4",
            name: "Accessories",
            slug: "accessories",
            productCount: 50
          }
        ],
        featured: true,
        order: 1
      },
      {
        id: "cat_2",
        name: "Action Figures",
        slug: "action-figures",
        description: "Collectible action figures from various franchises",
        image: "/images/category-action-figures.jpg",
        productCount: 234,
        subcategories: [
          {
            id: "subcat_5",
            name: "Anime Figures",
            slug: "anime-figures",
            productCount: 89
          },
          {
            id: "subcat_6",
            name: "Superhero Figures",
            slug: "superhero-figures",
            productCount: 67
          },
          {
            id: "subcat_7",
            name: "Vintage Figures",
            slug: "vintage-figures",
            productCount: 45
          },
          {
            id: "subcat_8",
            name: "Limited Edition",
            slug: "limited-edition",
            productCount: 33
          }
        ],
        featured: true,
        order: 2
      },
      {
        id: "cat_3",
        name: "Trading Cards",
        slug: "trading-cards",
        description: "Pokemon, Yu-Gi-Oh, and other collectible trading cards",
        image: "/images/category-trading-cards.jpg",
        productCount: 189,
        subcategories: [
          {
            id: "subcat_9",
            name: "Pokemon Cards",
            slug: "pokemon-cards",
            productCount: 78
          },
          {
            id: "subcat_10",
            name: "Yu-Gi-Oh Cards",
            slug: "yugioh-cards",
            productCount: 45
          },
          {
            id: "subcat_11",
            name: "Magic Cards",
            slug: "magic-cards",
            productCount: 34
          },
          {
            id: "subcat_12",
            name: "Booster Packs",
            slug: "booster-packs",
            productCount: 32
          }
        ],
        featured: true,
        order: 3
      },
      {
        id: "cat_4",
        name: "Collectibles",
        slug: "collectibles",
        description: "Rare and vintage collectible items",
        image: "/images/category-collectibles.jpg",
        productCount: 145,
        subcategories: [
          {
            id: "subcat_13",
            name: "Vintage Toys",
            slug: "vintage-toys",
            productCount: 56
          },
          {
            id: "subcat_14",
            name: "Limited Editions",
            slug: "limited-editions",
            productCount: 34
          },
          {
            id: "subcat_15",
            name: "Signed Items",
            slug: "signed-items",
            productCount: 28
          },
          {
            id: "subcat_16",
            name: "Memorabilia",
            slug: "memorabilia",
            productCount: 27
          }
        ],
        featured: false,
        order: 4
      },
      {
        id: "cat_5",
        name: "Games & Puzzles",
        slug: "games-puzzles",
        description: "Board games, puzzles, and gaming accessories",
        image: "/images/category-games.jpg",
        productCount: 98,
        subcategories: [
          {
            id: "subcat_17",
            name: "Board Games",
            slug: "board-games",
            productCount: 42
          },
          {
            id: "subcat_18",
            name: "Puzzles",
            slug: "puzzles",
            productCount: 31
          },
          {
            id: "subcat_19",
            name: "Card Games",
            slug: "card-games",
            productCount: 25
          }
        ],
        featured: false,
        order: 5
      },
      {
        id: "cat_6",
        name: "Model Kits",
        slug: "model-kits",
        description: "Gundam models, aircraft, and other model kits",
        image: "/images/category-models.jpg",
        productCount: 76,
        subcategories: [
          {
            id: "subcat_20",
            name: "Gundam Models",
            slug: "gundam-models",
            productCount: 45
          },
          {
            id: "subcat_21",
            name: "Aircraft Models",
            slug: "aircraft-models",
            productCount: 18
          },
          {
            id: "subcat_22",
            name: "Car Models",
            slug: "car-models",
            productCount: 13
          }
        ],
        featured: false,
        order: 6
      }
    ];

    const { searchParams } = new URL(request.url);
    const includeSubcategories = searchParams.get("subcategories") === "true";
    const featuredOnly = searchParams.get("featured") === "true";

    let filteredCategories = categories;

    // Filter featured categories if requested
    if (featuredOnly) {
      filteredCategories = categories.filter(cat => cat.featured);
    }

    // Transform categories based on subcategories requirement
    const responseCategories = filteredCategories.map(cat => {
      if (includeSubcategories) {
        return cat;
      } else {
        const { subcategories, ...categoryWithoutSubcategories } = cat;
        return categoryWithoutSubcategories;
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        categories: responseCategories,
        totalCategories: categories.length,
        featuredCount: categories.filter(cat => cat.featured).length
      }
    });

  } catch (error) {
    console.error("Get categories error:", error);
    return NextResponse.json(
      { error: "Failed to get categories" },
      { status: 500 }
    );
  }
}
