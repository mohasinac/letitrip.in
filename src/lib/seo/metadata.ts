/**
 * SEO Metadata Utilities
 * Generate consistent metadata for all pages
 */

export interface SEOMetadata {
  title: string;
  description: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  keywords?: string[];
  author?: string;
  robots?: string;
  viewport?: string;
  charset?: string;
}

/**
 * Generate metadata for a page
 */
export function generateMetadata(params: {
  title: string;
  description: string;
  path?: string;
  image?: string;
  keywords?: string[];
  type?: "website" | "article" | "product";
}): SEOMetadata {
  const {
    title,
    description,
    path,
    image,
    keywords,
    type = "website",
  } = params;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://justforview.in";

  return {
    title,
    description,
    keywords: keywords || [],
    canonical: path ? `${baseUrl}${path}` : baseUrl,
    ogTitle: title,
    ogDescription: description,
    ogImage: image,
    ogType: type,
    twitterCard: "summary_large_image",
    twitterTitle: title,
    twitterDescription: description,
    twitterImage: image,
    robots: "index, follow",
    author: "JustForView",
    viewport: "width=device-width, initial-scale=1.0",
    charset: "utf-8",
  };
}

/**
 * Generate schema.org structured data for categories
 */
export function generateCategorySchema(params: {
  id: string;
  name: string;
  description?: string;
  image?: string;
  url: string;
  parentName?: string;
}): Record<string, any> {
  const { id, name, description, image, url, parentName } = params;

  return {
    "@context": "https://schema.org",
    "@type": "Category",
    "@id": id,
    name,
    description,
    image,
    url,
    ...(parentName && { parent: { "@type": "Category", name: parentName } }),
  };
}

/**
 * Generate schema.org structured data for products
 */
export function generateProductSchema(params: {
  name: string;
  description?: string;
  image?: string;
  price?: number;
  currency?: string;
  availability?: string;
  category?: string;
  rating?: number;
  reviews?: number;
  url: string;
}): Record<string, any> {
  const {
    name,
    description,
    image,
    price,
    currency = "USD",
    availability = "InStock",
    category,
    rating,
    reviews,
    url,
  } = params;

  const schema: any = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    url,
    description,
    image,
  };

  if (price && currency) {
    schema.offers = {
      "@type": "Offer",
      price,
      priceCurrency: currency,
      availability: `https://schema.org/${availability}`,
      url,
    };
  }

  if (category) {
    schema.category = category;
  }

  if (rating && reviews) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: rating,
      reviewCount: reviews,
    };
  }

  return schema;
}

/**
 * Generate schema.org structured data for organization
 */
export function generateOrganizationSchema(params: {
  name: string;
  description?: string;
  logo?: string;
  sameAs?: string[];
  address?: {
    streetAddress?: string;
    addressLocality?: string;
    addressRegion?: string;
    postalCode?: string;
    addressCountry?: string;
  };
  contactPoint?: {
    telephone?: string;
    email?: string;
  };
}): Record<string, any> {
  const { name, description, logo, sameAs, address, contactPoint } = params;

  const schema: any = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    url: process.env.NEXT_PUBLIC_APP_URL || "https://justforview.in",
  };

  if (description) schema.description = description;
  if (logo) schema.logo = logo;
  if (sameAs && sameAs.length > 0) schema.sameAs = sameAs;

  if (address) {
    schema.address = {
      "@type": "PostalAddress",
      ...address,
    };
  }

  if (contactPoint) {
    schema.contactPoint = {
      "@type": "ContactPoint",
      contactType: "Customer Service",
      ...contactPoint,
    };
  }

  return schema;
}

/**
 * Generate schema.org breadcrumb schema
 */
export function generateBreadcrumbSchema(
  items: Array<{
    name: string;
    url: string;
  }>,
): Record<string, any> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export default {
  generateMetadata,
  generateCategorySchema,
  generateProductSchema,
  generateOrganizationSchema,
  generateBreadcrumbSchema,
};
