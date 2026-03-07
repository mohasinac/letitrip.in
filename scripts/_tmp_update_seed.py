import re

path = r'D:\proj\letitrip.in\src\db\seed-data\categories-seed-data.ts'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add isBrand: false after every isFeatured line (for regular categories)
content = re.sub(
    r'(    isFeatured: (?:true|false),)',
    r'\1\n    isBrand: false,',
    content
)

# Brand entries to append
brand_entries = """
  // BRAND: Apple
  {
    id: "category-brand-apple",
    name: "Apple",
    slug: "apple",
    description: "Official Apple products including iPhone, Mac, iPad, and accessories",
    rootId: "category-brand-apple",
    parentIds: [],
    childrenIds: [],
    tier: 0,
    path: "brand/apple",
    order: 1,
    isLeaf: true,
    metrics: {
      productCount: 3,
      productIds: [
        "product-iphone-15-pro-max-smartphones-new-techhub-electronics-1",
        "product-macbook-pro-16-m3-max-laptops-computers-new-techhub-electronics-1",
        "product-sony-wh-1000xm5-headphones-audio-new-techhub-electronics-1",
      ],
      auctionCount: 2,
      auctionIds: [
        "auction-iphone15-sealed-bundle-techhub-1",
        "product-macbook-pro-m3-auction-electronics-techhub-1",
      ],
      totalProductCount: 3,
      totalAuctionCount: 2,
      totalItemCount: 5,
      lastUpdated: new Date("2026-03-07T00:00:00Z"),
    },
    isFeatured: false,
    isBrand: true,
    seo: {
      title: "Apple Products | LetItRip",
      description: "Shop genuine Apple products — iPhone, MacBook, iPad, and accessories",
      keywords: ["apple", "iphone", "macbook", "ipad", "airpods"],
      ogImage: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=1200&h=630&fit=crop",
    },
    display: {
      icon: "🍎",
      coverImage: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&h=800&fit=crop",
      color: "#555555",
      showInMenu: false,
      showInFooter: false,
    },
    isActive: true,
    isSearchable: true,
    createdBy: "user-admin-user-admin",
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2026-03-07T00:00:00Z"),
    ancestors: [],
  },
  // BRAND: Samsung
  {
    id: "category-brand-samsung",
    name: "Samsung",
    slug: "samsung",
    description: "Samsung electronics including smartphones, TVs, and home appliances",
    rootId: "category-brand-samsung",
    parentIds: [],
    childrenIds: [],
    tier: 0,
    path: "brand/samsung",
    order: 2,
    isLeaf: true,
    metrics: {
      productCount: 2,
      productIds: [
        "product-samsung-galaxy-s24-ultra-smartphones-new-techhub-electronics-1",
        "product-google-pixel-8-pro-smartphones-new-techhub-electronics-1",
      ],
      auctionCount: 0,
      auctionIds: [],
      totalProductCount: 2,
      totalAuctionCount: 0,
      totalItemCount: 2,
      lastUpdated: new Date("2026-03-07T00:00:00Z"),
    },
    isFeatured: false,
    isBrand: true,
    seo: {
      title: "Samsung Products | LetItRip",
      description: "Shop Samsung smartphones, TVs, and home appliances",
      keywords: ["samsung", "galaxy", "samsung tv", "samsung phone"],
      ogImage: "https://images.unsplash.com/photo-1610945264803-c22b62831028?w=1200&h=630&fit=crop",
    },
    display: {
      icon: "📺",
      coverImage: "https://images.unsplash.com/photo-1610945264803-c22b62831028?w=800&h=800&fit=crop",
      color: "#1428a0",
      showInMenu: false,
      showInFooter: false,
    },
    isActive: true,
    isSearchable: true,
    createdBy: "user-admin-user-admin",
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2026-03-07T00:00:00Z"),
    ancestors: [],
  },
  // BRAND: Sony
  {
    id: "category-brand-sony",
    name: "Sony",
    slug: "sony",
    description: "Sony electronics including headphones, cameras, and gaming consoles",
    rootId: "category-brand-sony",
    parentIds: [],
    childrenIds: [],
    tier: 0,
    path: "brand/sony",
    order: 3,
    isLeaf: true,
    metrics: {
      productCount: 1,
      productIds: [
        "product-sony-wh-1000xm5-headphones-audio-new-techhub-electronics-1",
      ],
      auctionCount: 2,
      auctionIds: [
        "auction-ps5-slim-gaming-console-techhub-1",
        "auction-sony-alpha-7iv-camera-techhub-1",
      ],
      totalProductCount: 1,
      totalAuctionCount: 2,
      totalItemCount: 3,
      lastUpdated: new Date("2026-03-07T00:00:00Z"),
    },
    isFeatured: false,
    isBrand: true,
    seo: {
      title: "Sony Products | LetItRip",
      description: "Shop Sony headphones, cameras, and PlayStation gaming consoles",
      keywords: ["sony", "playstation", "sony headphones", "sony camera"],
      ogImage: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=1200&h=630&fit=crop",
    },
    display: {
      icon: "🎮",
      coverImage: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&h=800&fit=crop",
      color: "#000000",
      showInMenu: false,
      showInFooter: false,
    },
    isActive: true,
    isSearchable: true,
    createdBy: "user-admin-user-admin",
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2026-03-07T00:00:00Z"),
    ancestors: [],
  },
  // BRAND: Nike
  {
    id: "category-brand-nike",
    name: "Nike",
    slug: "nike",
    description: "Nike sportswear, footwear, and athletic equipment",
    rootId: "category-brand-nike",
    parentIds: [],
    childrenIds: [],
    tier: 0,
    path: "brand/nike",
    order: 4,
    isLeaf: true,
    metrics: {
      productCount: 1,
      productIds: [
        "product-mens-cotton-casual-shirt-mens-fashion-new-fashion-boutique-1",
      ],
      auctionCount: 1,
      auctionIds: ["product-limited-air-jordan-sneakers-auction-artisan-1"],
      totalProductCount: 1,
      totalAuctionCount: 1,
      totalItemCount: 2,
      lastUpdated: new Date("2026-03-07T00:00:00Z"),
    },
    isFeatured: false,
    isBrand: true,
    seo: {
      title: "Nike Products | LetItRip",
      description: "Shop Nike sportswear, running shoes, and athletic gear",
      keywords: ["nike", "nike shoes", "sportswear", "running", "athletic"],
      ogImage: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&h=630&fit=crop",
    },
    display: {
      icon: "👟",
      coverImage: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop",
      color: "#111111",
      showInMenu: false,
      showInFooter: false,
    },
    isActive: true,
    isSearchable: true,
    createdBy: "user-admin-user-admin",
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2026-03-07T00:00:00Z"),
    ancestors: [],
  },
  // BRAND: Adidas
  {
    id: "category-brand-adidas",
    name: "Adidas",
    slug: "adidas",
    description: "Adidas sportswear, footwear, and accessories",
    rootId: "category-brand-adidas",
    parentIds: [],
    childrenIds: [],
    tier: 0,
    path: "brand/adidas",
    order: 5,
    isLeaf: true,
    metrics: {
      productCount: 1,
      productIds: [
        "product-yoga-mat-with-carrying-bag-sports-outdoors-new-home-essentials-1",
      ],
      auctionCount: 0,
      auctionIds: [],
      totalProductCount: 1,
      totalAuctionCount: 0,
      totalItemCount: 1,
      lastUpdated: new Date("2026-03-07T00:00:00Z"),
    },
    isFeatured: false,
    isBrand: true,
    seo: {
      title: "Adidas Products | LetItRip",
      description: "Shop Adidas sportswear, shoes, and accessories",
      keywords: ["adidas", "adidas shoes", "sportswear", "running"],
      ogImage: "https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=1200&h=630&fit=crop",
    },
    display: {
      icon: "👕",
      coverImage: "https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=800&h=800&fit=crop",
      color: "#000000",
      showInMenu: false,
      showInFooter: false,
    },
    isActive: true,
    isSearchable: true,
    createdBy: "user-admin-user-admin",
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2026-03-07T00:00:00Z"),
    ancestors: [],
  },
"""

# Insert brand entries before the closing ];
content = content.rstrip()
assert content.endswith('];'), f"Unexpected ending: {repr(content[-20:])}"
content = content[:-2].rstrip()
content += '\n' + brand_entries.rstrip() + '\n];\n'

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

# Verify
with open(path, 'r', encoding='utf-8') as f:
    final = f.read()

print('isBrand: false count:', final.count('isBrand: false,'))
print('isBrand: true count:', final.count('isBrand: true,'))
print('Brand entries:', final.count('// BRAND:'))
print('Done!')
