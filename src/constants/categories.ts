/**
 * Product Categories Configuration
 * Main product lines and collectibles we sell
 */

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  keywords: string[];
  featured: boolean;
  subcategories?: string[];
}

/**
 * Main Product Categories
 */
export const PRODUCT_CATEGORIES: ProductCategory[] = [
  {
    id: "beyblades",
    name: "Beyblades",
    slug: "beyblades",
    description:
      "Authentic Beyblades from Japan - Takara Tomy originals, burst series, metal fusion, and more",
    icon: "circle-dot",
    keywords: [
      "beyblades",
      "beyblade burst",
      "takara tomy beyblades",
      "metal fusion beyblades",
      "beyblade stadiums",
      "beyblade launchers",
      "beyblade parts",
      "authentic beyblades India",
    ],
    featured: true,
    subcategories: [
      "Beyblade Burst",
      "Beyblade X",
      "Metal Fusion",
      "Stadiums",
      "Launchers",
      "Parts & Accessories",
    ],
  },
  {
    id: "pokemon-tcg",
    name: "Pokemon TCG",
    slug: "pokemon-tcg",
    description:
      "Official Pokemon Trading Card Game cards - booster packs, elite trainer boxes, collections, and singles",
    icon: "sparkles",
    keywords: [
      "Pokemon cards",
      "Pokemon TCG",
      "Pokemon booster packs",
      "Pokemon elite trainer box",
      "Pokemon card collection",
      "rare Pokemon cards",
      "Pokemon card singles",
      "authentic Pokemon cards India",
    ],
    featured: true,
    subcategories: [
      "Booster Packs",
      "Elite Trainer Boxes",
      "Collection Boxes",
      "Single Cards",
      "Starter Decks",
      "Premium Collections",
    ],
  },
  {
    id: "yugioh-tcg",
    name: "Yu-Gi-Oh! TCG",
    slug: "yugioh-tcg",
    description:
      "Original Yu-Gi-Oh! Trading Card Game - booster packs, structure decks, tins, and rare cards",
    icon: "zap",
    keywords: [
      "Yu-Gi-Oh cards",
      "Yu-Gi-Oh TCG",
      "Yu-Gi-Oh booster packs",
      "Yu-Gi-Oh structure deck",
      "rare Yu-Gi-Oh cards",
      "Yu-Gi-Oh tins",
      "Yu-Gi-Oh card singles",
      "authentic Yu-Gi-Oh cards India",
    ],
    featured: true,
    subcategories: [
      "Booster Packs",
      "Structure Decks",
      "Tins & Boxes",
      "Single Cards",
      "Collector Sets",
      "Duel Accessories",
    ],
  },
  {
    id: "transformers",
    name: "Transformers",
    slug: "transformers",
    description:
      "Authentic Transformers action figures - generations, studio series, masterpiece, and more",
    icon: "box",
    keywords: [
      "Transformers toys",
      "Transformers action figures",
      "Hasbro Transformers",
      "Takara Transformers",
      "Transformers generations",
      "Transformers studio series",
      "Transformers masterpiece",
      "authentic Transformers India",
    ],
    featured: true,
    subcategories: [
      "Studio Series",
      "Generations",
      "Masterpiece",
      "Legacy",
      "War for Cybertron",
      "Vintage Reissues",
    ],
  },
  {
    id: "hot-wheels",
    name: "Hot Wheels",
    slug: "hot-wheels",
    description:
      "Die-cast Hot Wheels cars - premium editions, collector sets, race tracks, and rare releases",
    icon: "car",
    keywords: [
      "Hot Wheels",
      "Hot Wheels cars",
      "Hot Wheels premium",
      "Hot Wheels collector edition",
      "Hot Wheels track sets",
      "rare Hot Wheels",
      "die-cast cars",
      "Hot Wheels India",
    ],
    featured: true,
    subcategories: [
      "Basic Cars",
      "Premium Series",
      "Car Culture",
      "Track Sets",
      "Collector Editions",
      "Treasure Hunts",
    ],
  },
  {
    id: "stickers",
    name: "Stickers",
    slug: "stickers",
    description:
      "Collectible stickers - anime, gaming, pop culture, holographic, and custom designs",
    icon: "star",
    keywords: [
      "collectible stickers",
      "anime stickers",
      "gaming stickers",
      "holographic stickers",
      "vinyl stickers",
      "die-cut stickers",
      "Japanese stickers",
      "sticker packs India",
    ],
    featured: true,
    subcategories: [
      "Anime Stickers",
      "Gaming Stickers",
      "Holographic",
      "Vinyl Stickers",
      "Sticker Packs",
      "Custom Designs",
    ],
  },
  {
    id: "crafts",
    name: "Crafts & Supplies",
    slug: "crafts",
    description:
      "Craft supplies and DIY materials - Japanese washi tape, origami, art supplies, and more",
    icon: "palette",
    keywords: [
      "craft supplies",
      "DIY materials",
      "Japanese washi tape",
      "origami paper",
      "art supplies",
      "craft tools",
      "hobby supplies",
      "imported craft materials India",
    ],
    featured: false,
    subcategories: [
      "Washi Tape",
      "Origami Supplies",
      "Art Tools",
      "Hobby Materials",
      "DIY Kits",
      "Paper Crafts",
    ],
  },
  {
    id: "collectibles",
    name: "Other Collectibles",
    slug: "collectibles",
    description:
      "Various collectibles - figurines, model kits, accessories, and limited editions",
    icon: "gift",
    keywords: [
      "collectibles",
      "figurines",
      "model kits",
      "limited edition collectibles",
      "anime figures",
      "collectible toys",
      "imported collectibles",
      "rare collectibles India",
    ],
    featured: false,
    subcategories: [
      "Figurines",
      "Model Kits",
      "Plushies",
      "Keychains",
      "Accessories",
      "Limited Editions",
    ],
  },
];

/**
 * Get featured categories only
 */
export const getFeaturedCategories = () => {
  return PRODUCT_CATEGORIES.filter((cat) => cat.featured);
};

/**
 * Get category by slug
 */
export const getCategoryBySlug = (slug: string) => {
  return PRODUCT_CATEGORIES.find((cat) => cat.slug === slug);
};

/**
 * Get all category slugs for sitemap generation
 */
export const getAllCategorySlugs = () => {
  return PRODUCT_CATEGORIES.map((cat) => cat.slug);
};

/**
 * SEO-optimized category descriptions for meta tags
 */
export const CATEGORY_META_DESCRIPTIONS: Record<string, string> = {
  beyblades:
    "Buy authentic Beyblades in India - Takara Tomy originals, Burst series, Metal Fusion, stadiums & launchers. Fast delivery, no customs charges, COD available.",
  "pokemon-tcg":
    "Buy Pokemon TCG cards in India - booster packs, elite trainer boxes, rare cards & singles. Authentic Pokemon cards, fast delivery, no customs charges.",
  "yugioh-tcg":
    "Buy Yu-Gi-Oh! TCG cards in India - booster packs, structure decks, tins & rare cards. Authentic Yu-Gi-Oh cards, fast delivery, no customs charges.",
  transformers:
    "Buy authentic Transformers in India - Studio Series, Generations, Masterpiece & more. Hasbro & Takara originals, fast delivery, no customs charges.",
  "hot-wheels":
    "Buy Hot Wheels cars in India - premium editions, collector sets, track sets & rare releases. Authentic die-cast cars, fast delivery, no customs charges.",
  stickers:
    "Buy collectible stickers in India - anime, gaming, holographic & vinyl stickers. Japanese imports, custom designs, fast delivery, no customs charges.",
  crafts:
    "Buy craft supplies in India - Japanese washi tape, origami, art supplies & DIY materials. Imported hobby supplies, fast delivery, no customs charges.",
  collectibles:
    "Buy collectibles in India - figurines, model kits, anime figures & limited editions. Authentic imported collectibles, fast delivery, no customs charges.",
};
