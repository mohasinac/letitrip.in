/**
 * @fileoverview TypeScript Module
 * @module src/constants/categories
 * @description This file contains functionality related to categories
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

/**
 * Product Categories Configuration
 * Main product lines and collectibles we sell
 */

/**
 * Product Category interface
 * @interface ProductCategory
 */
export interface ProductCategory {
  /** Id */
  id: string;
  /** Name */
  name: string;
  /** Slug */
  slug: string;
  /** Description */
  description: string;
  /** Icon */
  icon: string;
  /** Keywords */
  keywords: string[];
  /** Featured */
  featured: boolean;
  /** Subcategories */
  subcategories?: string[];
}

/**
 * Main Product Categories
 */
export const PRODUCT_CATEGORIES: ProductCategory[] = [
  {
    /** Id */
    id: "beyblades",
    /** Name */
    name: "Beyblades",
    /** Slug */
    slug: "beyblades",
    /** Description */
    description:
      "Authentic Beyblades from Japan - Takara Tomy originals, burst series, metal fusion, and more",
    /** Icon */
    icon: "circle-dot",
    /** Keywords */
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
    /** Featured */
    featured: true,
    /** Subcategories */
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
    /** Id */
    id: "pokemon-tcg",
    /** Name */
    name: "Pokemon TCG",
    /** Slug */
    slug: "pokemon-tcg",
    /** Description */
    description:
      "Official Pokemon Trading Card Game cards - booster packs, elite trainer boxes, collections, and singles",
    /** Icon */
    icon: "sparkles",
    /** Keywords */
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
    /** Featured */
    featured: true,
    /** Subcategories */
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
    /** Id */
    id: "yugioh-tcg",
    /** Name */
    name: "Yu-Gi-Oh! TCG",
    /** Slug */
    slug: "yugioh-tcg",
    /** Description */
    description:
      "Original Yu-Gi-Oh! Trading Card Game - booster packs, structure decks, tins, and rare cards",
    /** Icon */
    icon: "zap",
    /** Keywords */
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
    /** Featured */
    featured: true,
    /** Subcategories */
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
    /** Id */
    id: "transformers",
    /** Name */
    name: "Transformers",
    /** Slug */
    slug: "transformers",
    /** Description */
    description:
      "Authentic Transformers action figures - generations, studio series, masterpiece, and more",
    /** Icon */
    icon: "box",
    /** Keywords */
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
    /** Featured */
    featured: true,
    /** Subcategories */
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
    /** Id */
    id: "hot-wheels",
    /** Name */
    name: "Hot Wheels",
    /** Slug */
    slug: "hot-wheels",
    /** Description */
    description:
      "Die-cast Hot Wheels cars - premium editions, collector sets, race tracks, and rare releases",
    /** Icon */
    icon: "car",
    /** Keywords */
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
    /** Featured */
    featured: true,
    /** Subcategories */
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
    /** Id */
    id: "stickers",
    /** Name */
    name: "Stickers",
    /** Slug */
    slug: "stickers",
    /** Description */
    description:
      "Collectible stickers - anime, gaming, pop culture, holographic, and custom designs",
    /** Icon */
    icon: "star",
    /** Keywords */
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
    /** Featured */
    featured: true,
    /** Subcategories */
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
    /** Id */
    id: "crafts",
    /** Name */
    name: "Crafts & Supplies",
    /** Slug */
    slug: "crafts",
    /** Description */
    description:
      "Craft supplies and DIY materials - Japanese washi tape, origami, art supplies, and more",
    /** Icon */
    icon: "palette",
    /** Keywords */
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
    /** Featured */
    featured: false,
    /** Subcategories */
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
    /** Id */
    id: "collectibles",
    /** Name */
    name: "Other Collectibles",
    /** Slug */
    slug: "collectibles",
    /** Description */
    description:
      "Various collectibles - figurines, model kits, accessories, and limited editions",
    /** Icon */
    icon: "gift",
    /** Keywords */
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
    /** Featured */
    featured: false,
    /** Subcategories */
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
/**
 * Retrieves featured categories
 *
 * @returns {any} The featuredcategories result
 *
 * @example
 * getFeaturedCategories();
 */

/**
 * Retrieves featured categories
 *
 * @returns {any} The featuredcategories result
 *
 * @example
 * getFeaturedCategories();
 */

export const getFeaturedCategories = () => {
  return PRODUCT_CATEGORIES.filter((cat) => cat.featured);
};

/**
 * Get category by slug
 */
/**
 * Retrieves category by slug
 *
 * @param {string} slug - URL-friendly identifier
 *
 * @returns {string} The categorybyslug result
 *
 * @example
 * getCategoryBySlug("example");
 */

/**
 * Retrieves category by slug
 *
 * @param {string} slug - URL-friendly identifier
 *
 * @returns {string} The categorybyslug result
 *
 * @example
 * getCategoryBySlug("example");
 */

export const getCategoryBySlug = (slug: string) => {
  return PRODUCT_CATEGORIES.find((cat) => cat.slug === slug);
};

/**
 * Get all category slugs for sitemap generation
 */
/**
 * Retrieves all category slugs
 *
 * @returns {any} The allcategoryslugs result
 *
 * @example
 * getAllCategorySlugs();
 */

/**
 * Retrieves all category slugs
 *
 * @returns {any} The allcategoryslugs result
 *
 * @example
 * getAllCategorySlugs();
 */

export const getAllCategorySlugs = () => {
  return PRODUCT_CATEGORIES.map((cat) => cat.slug);
};

/**
 * SEO-optimized category descriptions for meta tags
 */
export const CATEGORY_META_DESCRIPTIONS: Record<string, string> = {
  /** Beyblades */
  beyblades:
    "Buy authentic Beyblades in India - Takara Tomy originals, Burst series, Metal Fusion, stadiums & launchers. Fast delivery, no customs charges, COD available.",
  "pokemon-tcg":
    "Buy Pokemon TCG cards in India - booster packs, elite trainer boxes, rare cards & singles. Authentic Pokemon cards, fast delivery, no customs charges.",
  "yugioh-tcg":
    "Buy Yu-Gi-Oh! TCG cards in India - booster packs, structure decks, tins & rare cards. Authentic Yu-Gi-Oh cards, fast delivery, no customs charges.",
  /** Transformers */
  transformers:
    "Buy authentic Transformers in India - Studio Series, Generations, Masterpiece & more. Hasbro & Takara originals, fast delivery, no customs charges.",
  "hot-wheels":
    "Buy Hot Wheels cars in India - premium editions, collector sets, track sets & rare releases. Authentic die-cast cars, fast delivery, no customs charges.",
  /** Stickers */
  stickers:
    "Buy collectible stickers in India - anime, gaming, holographic & vinyl stickers. Japanese imports, custom designs, fast delivery, no customs charges.",
  /** Crafts */
  crafts:
    "Buy craft supplies in India - Japanese washi tape, origami, art supplies & DIY materials. Imported hobby supplies, fast delivery, no customs charges.",
  /** Collectibles */
  collectibles:
    "Buy collectibles in India - figurines, model kits, anime figures & limited editions. Authentic imported collectibles, fast delivery, no customs charges.",
};
