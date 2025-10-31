/**
 * SEO Component - Unified SEO Management
 * Handles meta tags, OpenGraph, Twitter Cards, and structured data
 */

import Head from "next/head";
import { usePathname } from "next/navigation";

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: "website" | "article" | "product" | "profile";
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  noindex?: boolean;
  nofollow?: boolean;
  canonical?: string;
  alternateLanguages?: Array<{ hrefLang: string; href: string }>;
  structuredData?: Record<string, any>;
}

const defaultSEO = {
  siteName: "JustForView",
  defaultTitle: "JustForView - Premium Beyblade Store",
  titleTemplate: "%s | JustForView",
  defaultDescription:
    "Your premium destination for authentic Beyblades, collectibles, and accessories. Shop the best Beyblade products in India.",
  defaultImage: "/assets/og-image.jpg",
  siteUrl: process.env.NEXT_PUBLIC_APP_URL || "https://justforview.in",
  twitterHandle: "@justforview",
  facebookAppId: "",
};

export function SEOHead({
  title,
  description = defaultSEO.defaultDescription,
  keywords = [],
  image = defaultSEO.defaultImage,
  url,
  type = "website",
  author,
  publishedTime,
  modifiedTime,
  noindex = false,
  nofollow = false,
  canonical,
  alternateLanguages = [],
  structuredData,
}: SEOProps) {
  const pathname = usePathname();

  // Construct full title
  const fullTitle = title
    ? defaultSEO.titleTemplate.replace("%s", title)
    : defaultSEO.defaultTitle;

  // Construct full URL
  const fullUrl = url || `${defaultSEO.siteUrl}${pathname || ""}`;

  // Construct full image URL
  const fullImage = image.startsWith("http")
    ? image
    : `${defaultSEO.siteUrl}${image}`;

  // Robots meta
  const robotsContent = [
    noindex ? "noindex" : "index",
    nofollow ? "nofollow" : "follow",
  ].join(", ");

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords.length > 0 && (
        <meta name="keywords" content={keywords.join(", ")} />
      )}
      <meta name="robots" content={robotsContent} />
      <link rel="canonical" href={canonical || fullUrl} />

      {/* OpenGraph Tags */}
      <meta property="og:site_name" content={defaultSEO.siteName} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:image" content={fullImage} />
      <meta
        property="og:image:alt"
        content={title || defaultSEO.defaultTitle}
      />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      {/* Article-specific meta tags */}
      {type === "article" && (
        <>
          {author && <meta property="article:author" content={author} />}
          {publishedTime && (
            <meta property="article:published_time" content={publishedTime} />
          )}
          {modifiedTime && (
            <meta property="article:modified_time" content={modifiedTime} />
          )}
        </>
      )}

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={defaultSEO.twitterHandle} />
      <meta name="twitter:creator" content={defaultSEO.twitterHandle} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />
      <meta
        name="twitter:image:alt"
        content={title || defaultSEO.defaultTitle}
      />

      {/* Facebook App ID */}
      {defaultSEO.facebookAppId && (
        <meta property="fb:app_id" content={defaultSEO.facebookAppId} />
      )}

      {/* Alternate Languages */}
      {alternateLanguages.map((lang) => (
        <link
          key={lang.hrefLang}
          rel="alternate"
          hrefLang={lang.hrefLang}
          href={lang.href}
        />
      ))}

      {/* Structured Data (JSON-LD) */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      )}

      {/* Additional Meta Tags for Mobile */}
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, maximum-scale=5"
      />
      <meta name="theme-color" content="#0095f6" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content={defaultSEO.siteName} />

      {/* Favicon and App Icons */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      <link rel="manifest" href="/manifest.json" />
    </Head>
  );
}

/**
 * Generate structured data for products
 */
export function generateProductStructuredData(product: {
  name: string;
  description: string;
  image: string;
  price: number;
  currency?: string;
  availability?: "InStock" | "OutOfStock" | "PreOrder";
  brand?: string;
  sku?: string;
  rating?: number;
  reviewCount?: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.image,
    brand: product.brand
      ? {
          "@type": "Brand",
          name: product.brand,
        }
      : undefined,
    sku: product.sku,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: product.currency || "INR",
      availability: `https://schema.org/${product.availability || "InStock"}`,
      url: typeof window !== "undefined" ? window.location.href : "",
    },
    aggregateRating: product.rating
      ? {
          "@type": "AggregateRating",
          ratingValue: product.rating,
          reviewCount: product.reviewCount || 0,
        }
      : undefined,
  };
}

/**
 * Generate structured data for organization
 */
export function generateOrganizationStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: defaultSEO.siteName,
    url: defaultSEO.siteUrl,
    logo: `${defaultSEO.siteUrl}/logo.png`,
    sameAs: [
      "https://www.facebook.com/justforview",
      "https://twitter.com/justforview",
      "https://www.instagram.com/justforview",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+91-XXX-XXX-XXXX",
      contactType: "Customer Service",
      areaServed: "IN",
      availableLanguage: ["English", "Hindi"],
    },
  };
}

/**
 * Generate structured data for breadcrumbs
 */
export function generateBreadcrumbStructuredData(
  items: Array<{ name: string; url: string }>
) {
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

export default SEOHead;
