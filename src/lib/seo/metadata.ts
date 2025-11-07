import { Metadata } from 'next'

/**
 * Base metadata configuration for the site
 */
export const siteConfig = {
  name: 'Let It Rip',
  description: 'India\'s trusted seller of authentic imported collectibles - Beyblades, Pokemon TCG, Yu-Gi-Oh TCG, Transformers, Hot Wheels, stickers & more! In-stock items ship in 3-7 days. We handle all customs - you pay zero import duties!',
  url: 'https://justforview.in',
  ogImage: 'https://justforview.in/og-image.jpg',
  links: {
    twitter: 'https://twitter.com/letitrip',
    facebook: 'https://facebook.com/letitrip',
    instagram: 'https://instagram.com/letitrip',
  },
}

/**
 * Default metadata for all pages
 */
export const defaultMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    // Product categories - Collectibles focus
    'beyblades India',
    'Pokemon TCG India',
    'Yu-Gi-Oh TCG India',
    'Transformers India',
    'Hot Wheels India',
    'collectible stickers India',
    'trading cards India',
    'imported collectibles India',
    'anime collectibles India',
    'authentic beyblades',
    'Pokemon cards India',
    'Yu-Gi-Oh cards India',
    'Transformers toys India',
    'die-cast cars India',
    'crafts supplies India',
    // Value propositions
    'no customs charges India',
    'fast delivery India',
    'COD on collectibles',
    'authentic imported collectibles',
    'beyblade online India',
    'Pokemon TCG online India',
    // Country-specific
    'Japan collectibles India',
    'USA collectibles India',
    'authentic Japanese beyblades',
  ],
  authors: [{ name: 'Let It Rip' }],
  creator: 'Let It Rip',
  publisher: 'Let It Rip',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: '@letitrip',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
}

/**
 * Generate metadata for a page
 */
export function generateMetadata({
  title,
  description,
  keywords,
  image,
  path = '',
  noIndex = false,
}: {
  title: string
  description: string
  keywords?: string[]
  image?: string
  path?: string
  noIndex?: boolean
}): Metadata {
  const url = `${siteConfig.url}${path}`
  const ogImage = image || `${siteConfig.url}/og-image.jpg`

  return {
    title: `${title} - ${siteConfig.name}`,
    description,
    keywords: keywords || defaultMetadata.keywords,
    authors: [{ name: siteConfig.name }],
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${title} - ${siteConfig.name}`,
      description,
      url,
      siteName: siteConfig.name,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'en_IN',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} - ${siteConfig.name}`,
      description,
      images: [ogImage],
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
          },
        },
  }
}

/**
 * Generate product metadata
 */
export function generateProductMetadata({
  title,
  description,
  image,
  price,
  currency = 'INR',
  availability = 'in stock',
  condition = 'new',
  canonical,
}: {
  title: string
  description: string
  image: string
  price: number
  currency?: string
  availability?: string
  condition?: string
  canonical?: string
}): Metadata {
  return {
    title,
    description,
    openGraph: {
      type: 'website',
      title,
      description,
      images: [image],
      url: canonical,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
    alternates: canonical
      ? {
          canonical,
        }
      : undefined,
    // Product-specific metadata
    other: {
      'product:price:amount': price.toString(),
      'product:price:currency': currency,
      'product:availability': availability,
      'product:condition': condition,
    },
  }
}

/**
 * Generate breadcrumb list for structured data
 */
export function generateBreadcrumbList(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${siteConfig.url}${item.url}`,
    })),
  }
}
