/**
 * SEO Head Component
 * Comprehensive SEO metadata management for Next.js App Router
 */

import { Metadata } from "next";

export interface SEOProps {
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;
  ogImage?: string;
  ogType?: "website" | "article";
  noindex?: boolean;
  structuredData?: Record<string, any> | Record<string, any>[];
}

/**
 * Generate Next.js metadata object for App Router
 * Use this in your page.tsx files with generateMetadata()
 */
export function generateSEOMetadata(props: SEOProps): Metadata {
  const {
    title,
    description,
    keywords = [],
    canonical,
    ogImage,
    ogType = "website",
    noindex = false,
  } = props;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://justforview.in";
  const fullTitle = title.includes("JustForView")
    ? title
    : `${title} | JustForView`;
  const imageUrl = ogImage
    ? ogImage.startsWith("http")
      ? ogImage
      : `${baseUrl}${ogImage}`
    : `${baseUrl}/assets/og-image.jpg`;

  return {
    title: fullTitle,
    description,
    keywords: keywords.length > 0 ? keywords : undefined,
    authors: [{ name: "JustForView" }],
    creator: "JustForView",
    publisher: "JustForView",
    robots: noindex ? "noindex, nofollow" : "index, follow",
    alternates: {
      canonical: canonical || baseUrl,
    },
    openGraph: {
      title: fullTitle,
      description,
      url: canonical || baseUrl,
      siteName: "JustForView",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: "en_IN",
      type: ogType,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [imageUrl],
      creator: "@justforview",
      site: "@justforview",
    },
    icons: {
      icon: "/favicon.ico",
      apple: "/apple-touch-icon.png",
    },
    manifest: "/manifest.json",
    viewport: {
      width: "device-width",
      initialScale: 1,
      maximumScale: 5,
    },
  };
}

/**
 * Structured Data Component
 * Inject JSON-LD structured data into the page
 */
export function StructuredData({
  data,
}: {
  data: Record<string, any> | Record<string, any>[];
}) {
  const jsonLd = Array.isArray(data) ? data : [data];

  return (
    <>
      {jsonLd.map((item, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(item, null, 2),
          }}
        />
      ))}
    </>
  );
}

/**
 * Helper function to inject structured data in App Router pages
 */
export function generateStructuredData(
  data: Record<string, any> | Record<string, any>[]
) {
  return {
    other: {
      "application/ld+json": Array.isArray(data) ? data : [data],
    },
  };
}

export default {
  generateSEOMetadata,
  StructuredData,
  generateStructuredData,
};
