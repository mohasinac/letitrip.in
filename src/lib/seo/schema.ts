/**
 * Schema.org structured data utilities
 * These create JSON-LD markup for better SEO and rich snippets
 */

import { siteConfig } from './metadata'

/**
 * Organization schema for the business
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/logo.png`,
    description: siteConfig.description,
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'IN',
      addressRegion: 'India',
    },
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: '+91-XXXX-XXXXXX',
        contactType: 'customer service',
        areaServed: 'IN',
        availableLanguage: ['English', 'Hindi'],
      },
    ],
    sameAs: [
      siteConfig.links.twitter,
      siteConfig.links.facebook,
      siteConfig.links.instagram,
    ],
  }
}

/**
 * WebSite schema for the site
 */
export function generateWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteConfig.url}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

/**
 * Product schema for product pages
 */
export function generateProductSchema({
  name,
  description,
  image,
  sku,
  brand,
  price,
  currency = 'INR',
  availability = 'InStock',
  condition = 'NewCondition',
  url,
  rating,
  reviewCount,
}: {
  name: string
  description: string
  image: string
  sku: string
  brand?: string
  price: number
  currency?: string
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder'
  condition?: 'NewCondition' | 'UsedCondition' | 'RefurbishedCondition'
  url: string
  rating?: number
  reviewCount?: number
}) {
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    image,
    sku,
    brand: brand
      ? {
          '@type': 'Brand',
          name: brand,
        }
      : undefined,
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: currency,
      price: price.toString(),
      availability: `https://schema.org/${availability}`,
      itemCondition: `https://schema.org/${condition}`,
      seller: {
        '@type': 'Organization',
        name: siteConfig.name,
      },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'IN',
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: {
            '@type': 'QuantitativeValue',
            minValue: 1,
            maxValue: 2,
            unitCode: 'DAY',
          },
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue: 2,
            maxValue: 7,
            unitCode: 'DAY',
          },
        },
      },
    },
  }

  // Add aggregateRating if available
  if (rating && reviewCount) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: rating.toString(),
      reviewCount: reviewCount.toString(),
      bestRating: '5',
      worstRating: '1',
    }
  }

  return schema
}

/**
 * FAQ schema for FAQ pages
 */
export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}

/**
 * Breadcrumb schema
 */
export function generateBreadcrumbSchema(
  items: Array<{ name: string; url: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${siteConfig.url}${item.url}`,
    })),
  }
}

/**
 * LocalBusiness schema for the seller
 */
export function generateLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': siteConfig.url,
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    logo: `${siteConfig.url}/logo.png`,
    image: `${siteConfig.url}/og-image.jpg`,
    telephone: '+91-XXXX-XXXXXX',
    email: 'support@letitrip.com',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'IN',
      addressRegion: 'India',
    },
    geo: {
      '@type': 'GeoCoordinates',
      // Add actual coordinates when available
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '10:00',
        closes: '19:00',
      },
    ],
    priceRange: '₹₹',
    acceptsReservations: 'False',
    paymentAccepted: 'UPI, Credit Card, Debit Card, Net Banking, Wallets, COD',
    currenciesAccepted: 'INR',
  }
}

/**
 * ItemList schema for product listings
 */
export function generateItemListSchema(
  items: Array<{
    name: string
    url: string
    image: string
    price: number
  }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Product',
        name: item.name,
        url: item.url,
        image: item.image,
        offers: {
          '@type': 'Offer',
          price: item.price.toString(),
          priceCurrency: 'INR',
        },
      },
    })),
  }
}

/**
 * Review schema
 */
export function generateReviewSchema({
  productName,
  reviewBody,
  rating,
  authorName,
  datePublished,
}: {
  productName: string
  reviewBody: string
  rating: number
  authorName: string
  datePublished: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    itemReviewed: {
      '@type': 'Product',
      name: productName,
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: rating.toString(),
      bestRating: '5',
      worstRating: '1',
    },
    reviewBody,
    author: {
      '@type': 'Person',
      name: authorName,
    },
    datePublished,
  }
}

/**
 * Offer schema for special offers/coupons
 */
export function generateOfferSchema({
  name,
  description,
  code,
  discountType,
  discountValue,
  validFrom,
  validThrough,
}: {
  name: string
  description: string
  code: string
  discountType: 'percentage' | 'fixed'
  discountValue: number
  validFrom: string
  validThrough: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Offer',
    name,
    description,
    priceSpecification: {
      '@type': 'PriceSpecification',
      ...(discountType === 'percentage'
        ? { price: `-${discountValue}`, priceCurrency: 'PERCENT' }
        : { price: `-${discountValue}`, priceCurrency: 'INR' }),
    },
    eligibleTransactionVolume: {
      '@type': 'PriceSpecification',
      priceCurrency: 'INR',
    },
    validFrom,
    validThrough,
    seller: {
      '@type': 'Organization',
      name: siteConfig.name,
    },
  }
}

/**
 * Helper function to inject JSON-LD script into page
 */
export function generateJSONLD(schema: object) {
  return {
    __html: JSON.stringify(schema),
  }
}
