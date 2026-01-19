/**
 * Product Categories
 * 
 * Centralized category definitions with hierarchical structure.
 * Categories are used for product/auction organization and filtering.
 * 
 * @example
 * ```tsx
 * import { CATEGORIES, getCategoryBySlug } from '@/constants/categories';
 * 
 * const electronics = getCategoryBySlug('electronics');
 * ```
 */

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  parent?: string;
  children?: Category[];
}

/**
 * Main product categories
 */
export const CATEGORIES: Category[] = [
  {
    id: "electronics",
    name: "Electronics",
    slug: "electronics",
    description: "Electronic devices and gadgets",
    icon: "Laptop",
    children: [
      {
        id: "mobiles",
        name: "Mobiles & Tablets",
        slug: "mobiles-tablets",
        parent: "electronics",
      },
      {
        id: "laptops",
        name: "Laptops & Computers",
        slug: "laptops-computers",
        parent: "electronics",
      },
      {
        id: "cameras",
        name: "Cameras & Photography",
        slug: "cameras-photography",
        parent: "electronics",
      },
      {
        id: "audio",
        name: "Audio & Headphones",
        slug: "audio-headphones",
        parent: "electronics",
      },
      {
        id: "wearables",
        name: "Wearables & Smart Devices",
        slug: "wearables-smart-devices",
        parent: "electronics",
      },
    ],
  },
  {
    id: "fashion",
    name: "Fashion",
    slug: "fashion",
    description: "Clothing, footwear, and accessories",
    icon: "Shirt",
    children: [
      {
        id: "mens-fashion",
        name: "Men's Fashion",
        slug: "mens-fashion",
        parent: "fashion",
      },
      {
        id: "womens-fashion",
        name: "Women's Fashion",
        slug: "womens-fashion",
        parent: "fashion",
      },
      {
        id: "kids-fashion",
        name: "Kids' Fashion",
        slug: "kids-fashion",
        parent: "fashion",
      },
      {
        id: "footwear",
        name: "Footwear",
        slug: "footwear",
        parent: "fashion",
      },
      {
        id: "accessories",
        name: "Accessories",
        slug: "accessories",
        parent: "fashion",
      },
    ],
  },
  {
    id: "home-garden",
    name: "Home & Garden",
    slug: "home-garden",
    description: "Home decor, furniture, and garden supplies",
    icon: "Home",
    children: [
      {
        id: "furniture",
        name: "Furniture",
        slug: "furniture",
        parent: "home-garden",
      },
      {
        id: "home-decor",
        name: "Home Decor",
        slug: "home-decor",
        parent: "home-garden",
      },
      {
        id: "kitchen",
        name: "Kitchen & Dining",
        slug: "kitchen-dining",
        parent: "home-garden",
      },
      {
        id: "garden",
        name: "Garden & Outdoor",
        slug: "garden-outdoor",
        parent: "home-garden",
      },
    ],
  },
  {
    id: "sports-fitness",
    name: "Sports & Fitness",
    slug: "sports-fitness",
    description: "Sports equipment and fitness gear",
    icon: "Dumbbell",
    children: [
      {
        id: "gym-equipment",
        name: "Gym Equipment",
        slug: "gym-equipment",
        parent: "sports-fitness",
      },
      {
        id: "sports-gear",
        name: "Sports Gear",
        slug: "sports-gear",
        parent: "sports-fitness",
      },
      {
        id: "outdoor-recreation",
        name: "Outdoor Recreation",
        slug: "outdoor-recreation",
        parent: "sports-fitness",
      },
    ],
  },
  {
    id: "automotive",
    name: "Automotive",
    slug: "automotive",
    description: "Vehicles and automotive accessories",
    icon: "Car",
    children: [
      {
        id: "car-accessories",
        name: "Car Accessories",
        slug: "car-accessories",
        parent: "automotive",
      },
      {
        id: "motorcycle",
        name: "Motorcycle & Scooters",
        slug: "motorcycle-scooters",
        parent: "automotive",
      },
      {
        id: "car-parts",
        name: "Car Parts",
        slug: "car-parts",
        parent: "automotive",
      },
    ],
  },
  {
    id: "books-media",
    name: "Books & Media",
    slug: "books-media",
    description: "Books, movies, music, and games",
    icon: "Book",
    children: [
      {
        id: "books",
        name: "Books",
        slug: "books",
        parent: "books-media",
      },
      {
        id: "movies-tv",
        name: "Movies & TV",
        slug: "movies-tv",
        parent: "books-media",
      },
      {
        id: "music",
        name: "Music",
        slug: "music",
        parent: "books-media",
      },
      {
        id: "video-games",
        name: "Video Games",
        slug: "video-games",
        parent: "books-media",
      },
    ],
  },
  {
    id: "toys-games",
    name: "Toys & Games",
    slug: "toys-games",
    description: "Toys, games, and hobbies",
    icon: "Gamepad2",
    children: [
      {
        id: "action-figures",
        name: "Action Figures & Toys",
        slug: "action-figures-toys",
        parent: "toys-games",
      },
      {
        id: "board-games",
        name: "Board Games",
        slug: "board-games",
        parent: "toys-games",
      },
      {
        id: "educational-toys",
        name: "Educational Toys",
        slug: "educational-toys",
        parent: "toys-games",
      },
    ],
  },
  {
    id: "beauty-health",
    name: "Beauty & Health",
    slug: "beauty-health",
    description: "Beauty products and health items",
    icon: "Sparkles",
    children: [
      {
        id: "skincare",
        name: "Skincare",
        slug: "skincare",
        parent: "beauty-health",
      },
      {
        id: "makeup",
        name: "Makeup",
        slug: "makeup",
        parent: "beauty-health",
      },
      {
        id: "hair-care",
        name: "Hair Care",
        slug: "hair-care",
        parent: "beauty-health",
      },
      {
        id: "health-wellness",
        name: "Health & Wellness",
        slug: "health-wellness",
        parent: "beauty-health",
      },
    ],
  },
];

/**
 * Get category by slug
 */
export function getCategoryBySlug(slug: string): Category | undefined {
  for (const category of CATEGORIES) {
    if (category.slug === slug) return category;
    if (category.children) {
      const found = category.children.find((child) => child.slug === slug);
      if (found) return found;
    }
  }
  return undefined;
}

/**
 * Get category by id
 */
export function getCategoryById(id: string): Category | undefined {
  for (const category of CATEGORIES) {
    if (category.id === id) return category;
    if (category.children) {
      const found = category.children.find((child) => child.id === id);
      if (found) return found;
    }
  }
  return undefined;
}

/**
 * Get all category slugs (flat list)
 */
export function getAllCategorySlugs(): string[] {
  const slugs: string[] = [];
  for (const category of CATEGORIES) {
    slugs.push(category.slug);
    if (category.children) {
      slugs.push(...category.children.map((child) => child.slug));
    }
  }
  return slugs;
}

/**
 * Get top-level categories only
 */
export function getTopLevelCategories(): Category[] {
  return CATEGORIES;
}

/**
 * Get subcategories for a parent category
 */
export function getSubcategories(parentSlug: string): Category[] {
  const parent = getCategoryBySlug(parentSlug);
  return parent?.children || [];
}
