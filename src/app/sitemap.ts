import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
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

  // TODO: Add dynamic pages when API is ready
  // - Products from /api/products
  // - Categories from /api/categories
  // - Shops from /api/shops
  // - Auction items
  
  return staticPages
}
