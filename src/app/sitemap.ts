import { MetadataRoute } from 'next'

// Note: This is a server component, we can fetch data directly
async function fetchProducts() {
  try {
    const res = await fetch('https://justforview.in/api/products?status=active&limit=1000', {
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || data.products || [];
  } catch (error) {
    console.error('Failed to fetch products for sitemap:', error);
    return [];
  }
}

async function fetchCategories() {
  try {
    const res = await fetch('https://justforview.in/api/categories?limit=1000', {
      next: { revalidate: 3600 }
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || data.categories || [];
  } catch (error) {
    console.error('Failed to fetch categories for sitemap:', error);
    return [];
  }
}

async function fetchShops() {
  try {
    const res = await fetch('https://justforview.in/api/shops?status=active&limit=1000', {
      next: { revalidate: 3600 }
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || data.shops || [];
  } catch (error) {
    console.error('Failed to fetch shops for sitemap:', error);
    return [];
  }
}

async function fetchAuctions() {
  try {
    const res = await fetch('https://justforview.in/api/auctions?status=active&limit=1000', {
      next: { revalidate: 3600 }
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || data.auctions || [];
  } catch (error) {
    console.error('Failed to fetch auctions for sitemap:', error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://justforview.in'
  const currentDate = new Date()

  // Static pages with their priorities and change frequencies
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date('2025-11-07'),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/shops`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/cart`,
      lastModified: currentDate,
      changeFrequency: 'always',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/coupons`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.7,
    },
    // Legal Pages
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date('2025-11-07'),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/terms-of-service`,
      lastModified: new Date('2025-11-07'),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/refund-policy`,
      lastModified: new Date('2025-11-07'),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/shipping-policy`,
      lastModified: new Date('2025-11-07'),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/cookie-policy`,
      lastModified: new Date('2025-11-07'),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    // Auth Pages (low priority, noindex in robots)
    {
      url: `${baseUrl}/login`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]

  // Fetch dynamic data
  const [products, categories, shops, auctions] = await Promise.all([
    fetchProducts(),
    fetchCategories(),
    fetchShops(),
    fetchAuctions(),
  ]);

  // Dynamic product pages
  const productPages: MetadataRoute.Sitemap = products.map((product: any) => ({
    url: `${baseUrl}/products/${product.slug}`,
    lastModified: product.updated_at ? new Date(product.updated_at) : currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Dynamic category pages
  const categoryPages: MetadataRoute.Sitemap = categories.map((category: any) => ({
    url: `${baseUrl}/categories/${category.slug}`,
    lastModified: category.updated_at ? new Date(category.updated_at) : currentDate,
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }));

  // Dynamic shop pages
  const shopPages: MetadataRoute.Sitemap = shops.map((shop: any) => ({
    url: `${baseUrl}/shops/${shop.slug}`,
    lastModified: shop.updated_at ? new Date(shop.updated_at) : currentDate,
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }));

  // Dynamic auction pages
  const auctionPages: MetadataRoute.Sitemap = auctions.map((auction: any) => ({
    url: `${baseUrl}/auctions/${auction.slug || auction.id}`,
    lastModified: auction.updated_at ? new Date(auction.updated_at) : currentDate,
    changeFrequency: 'hourly' as const,
    priority: 0.8,
  }));
  
  return [
    ...staticPages,
    ...productPages,
    ...categoryPages,
    ...shopPages,
    ...auctionPages,
  ];
}
