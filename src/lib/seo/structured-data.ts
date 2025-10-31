/**
 * Structured Data (JSON-LD) Generators
 * Creates schema.org compliant structured data for rich results
 */

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://hobbiesspot.com";

// ============================================================================
// WEBSITE SCHEMA
// ============================================================================

export function generateWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "HobbiesSpot",
    description:
      "Premium Beyblade store offering authentic collectibles and accessories",
    url: BASE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${BASE_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

// ============================================================================
// ORGANIZATION SCHEMA
// ============================================================================

export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "HobbiesSpot",
    description:
      "Your premium destination for authentic Beyblades, collectibles, and accessories",
    url: BASE_URL,
    logo: `${BASE_URL}/logo.png`,
    image: `${BASE_URL}/assets/og-image.jpg`,
    foundingDate: "2024",
    email: "support@hobbiesspot.com",
    telephone: "+91-98765-43210",
    address: {
      "@type": "PostalAddress",
      streetAddress: "123 Marketplace Avenue",
      addressLocality: "Mumbai",
      addressRegion: "Maharashtra",
      postalCode: "400001",
      addressCountry: "IN",
    },
    sameAs: [
      "https://www.facebook.com/hobbiesspot",
      "https://twitter.com/hobbiesspot",
      "https://www.instagram.com/hobbiesspot",
      "https://www.youtube.com/@hobbiesspot",
    ],
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: "+91-98765-43210",
        contactType: "Customer Service",
        email: "support@hobbiesspot.com",
        areaServed: "IN",
        availableLanguage: ["English", "Hindi"],
        contactOption: "TollFree",
      },
    ],
  };
}

// ============================================================================
// PRODUCT SCHEMA
// ============================================================================

export interface ProductSchemaParams {
  name: string;
  description: string;
  image: string | string[];
  sku?: string;
  brand?: string;
  price: number;
  currency?: string;
  availability?: "InStock" | "OutOfStock" | "PreOrder" | "Discontinued";
  condition?: "NewCondition" | "UsedCondition" | "RefurbishedCondition";
  rating?: number;
  reviewCount?: number;
  url: string;
  category?: string;
}

export function generateProductSchema(params: ProductSchemaParams) {
  const {
    name,
    description,
    image,
    sku,
    brand,
    price,
    currency = "INR",
    availability = "InStock",
    condition = "NewCondition",
    rating,
    reviewCount,
    url,
    category,
  } = params;

  const schema: any = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    image: Array.isArray(image) ? image : [image],
    url: url.startsWith("http") ? url : `${BASE_URL}${url}`,
  };

  if (sku) schema.sku = sku;
  if (brand) {
    schema.brand = {
      "@type": "Brand",
      name: brand,
    };
  }
  if (category) schema.category = category;

  // Offers
  schema.offers = {
    "@type": "Offer",
    price: price.toString(),
    priceCurrency: currency,
    availability: `https://schema.org/${availability}`,
    itemCondition: `https://schema.org/${condition}`,
    url: url.startsWith("http") ? url : `${BASE_URL}${url}`,
    priceValidUntil: new Date(
      new Date().setFullYear(new Date().getFullYear() + 1)
    )
      .toISOString()
      .split("T")[0],
  };

  // Aggregate Rating
  if (rating && reviewCount) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: rating.toString(),
      reviewCount: reviewCount.toString(),
      bestRating: "5",
      worstRating: "1",
    };
  }

  return schema;
}

// ============================================================================
// BREADCRUMB SCHEMA
// ============================================================================

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function generateBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${BASE_URL}${item.url}`,
    })),
  };
}

// ============================================================================
// FAQ SCHEMA
// ============================================================================

export interface FAQItem {
  question: string;
  answer: string;
}

export function generateFAQSchema(faqs: FAQItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

// ============================================================================
// REVIEW SCHEMA
// ============================================================================

export interface ReviewSchemaParams {
  itemName: string;
  reviewBody: string;
  rating: number;
  author: string;
  datePublished: string;
}

export function generateReviewSchema(params: ReviewSchemaParams) {
  const { itemName, reviewBody, rating, author, datePublished } = params;

  return {
    "@context": "https://schema.org",
    "@type": "Review",
    itemReviewed: {
      "@type": "Product",
      name: itemName,
    },
    reviewRating: {
      "@type": "Rating",
      ratingValue: rating.toString(),
      bestRating: "5",
      worstRating: "1",
    },
    author: {
      "@type": "Person",
      name: author,
    },
    reviewBody,
    datePublished,
  };
}

// ============================================================================
// COLLECTION PAGE SCHEMA
// ============================================================================

export interface CollectionItem {
  name: string;
  url: string;
  image?: string;
}

export function generateCollectionPageSchema(
  name: string,
  description: string,
  items: CollectionItem[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url: BASE_URL,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: item.url.startsWith("http") ? item.url : `${BASE_URL}${item.url}`,
        name: item.name,
        ...(item.image && {
          image: item.image.startsWith("http")
            ? item.image
            : `${BASE_URL}${item.image}`,
        }),
      })),
    },
  };
}

// ============================================================================
// LOCAL BUSINESS SCHEMA (for shops/sellers)
// ============================================================================

export interface LocalBusinessSchemaParams {
  name: string;
  description: string;
  image?: string;
  telephone?: string;
  email?: string;
  address?: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  openingHours?: string[];
  priceRange?: string;
}

export function generateLocalBusinessSchema(
  params: LocalBusinessSchemaParams
) {
  const {
    name,
    description,
    image,
    telephone,
    email,
    address,
    openingHours,
    priceRange,
  } = params;

  const schema: any = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name,
    description,
    url: BASE_URL,
  };

  if (image) schema.image = image;
  if (telephone) schema.telephone = telephone;
  if (email) schema.email = email;
  if (priceRange) schema.priceRange = priceRange;

  if (address) {
    schema.address = {
      "@type": "PostalAddress",
      ...address,
    };
  }

  if (openingHours && openingHours.length > 0) {
    schema.openingHoursSpecification = openingHours.map((hours) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: hours.split(" ")[0],
      opens: hours.split(" ")[1],
      closes: hours.split(" ")[2],
    }));
  }

  return schema;
}

// ============================================================================
// VIDEO OBJECT SCHEMA
// ============================================================================

export interface VideoSchemaParams {
  name: string;
  description: string;
  thumbnailUrl: string;
  uploadDate: string;
  duration?: string; // ISO 8601 duration format (PT1M30S for 1min 30sec)
  contentUrl?: string;
  embedUrl?: string;
}

export function generateVideoSchema(params: VideoSchemaParams) {
  const {
    name,
    description,
    thumbnailUrl,
    uploadDate,
    duration,
    contentUrl,
    embedUrl,
  } = params;

  const schema: any = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name,
    description,
    thumbnailUrl,
    uploadDate,
  };

  if (duration) schema.duration = duration;
  if (contentUrl) schema.contentUrl = contentUrl;
  if (embedUrl) schema.embedUrl = embedUrl;

  return schema;
}

// ============================================================================
// OFFER SCHEMA
// ============================================================================

export interface OfferSchemaParams {
  name: string;
  description: string;
  price: number;
  currency?: string;
  validFrom: string;
  validThrough: string;
  url: string;
}

export function generateOfferSchema(params: OfferSchemaParams) {
  const {
    name,
    description,
    price,
    currency = "INR",
    validFrom,
    validThrough,
    url,
  } = params;

  return {
    "@context": "https://schema.org",
    "@type": "Offer",
    name,
    description,
    price: price.toString(),
    priceCurrency: currency,
    availability: "https://schema.org/InStock",
    validFrom,
    validThrough,
    url: url.startsWith("http") ? url : `${BASE_URL}${url}`,
  };
}

export default {
  generateWebsiteSchema,
  generateOrganizationSchema,
  generateProductSchema,
  generateBreadcrumbSchema,
  generateFAQSchema,
  generateReviewSchema,
  generateCollectionPageSchema,
  generateLocalBusinessSchema,
  generateVideoSchema,
  generateOfferSchema,
};
