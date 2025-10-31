/**
 * SEO Setup Examples
 * How to use SEO components and utilities in your pages
 */

import { Metadata } from "next";
import { generateSEOMetadata, StructuredData } from "@/components/seo/SEOHead";
import {
  generateProductStructuredData,
  generateBreadcrumbStructuredData,
  generateWebsiteSchema,
  generateFAQSchema,
} from "@/components/seo";

// ============================================================================
// Example 1: Homepage SEO
// ============================================================================

export async function generateHomepageMetadata(): Promise<Metadata> {
  return generateSEOMetadata({
    title: "HobbiesSpot - Premium Beyblade Store",
    description:
      "Your premium destination for authentic Beyblades, collectibles, and accessories. Shop the latest Beyblade Burst, Metal Fight, and classic series.",
    keywords: [
      "beyblade",
      "beyblade burst",
      "beyblade shop",
      "buy beyblade",
      "beyblade india",
    ],
    canonical: "/",
    ogImage: "/assets/og-image-home.jpg",
    ogType: "website",
  });
}

// Usage in app/page.tsx:
// export const metadata = generateHomepageMetadata();

// ============================================================================
// Example 2: Product Page SEO
// ============================================================================

interface ProductPageProps {
  params: { slug: string };
}

export async function generateProductMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  // Fetch product data
  const product = await fetchProduct(params.slug);

  return generateSEOMetadata({
    title: `${product.name} - Buy Now`,
    description: product.description.substring(0, 160),
    keywords: [product.name, product.category, "beyblade", "buy online"],
    canonical: `/products/${params.slug}`,
    ogImage: product.images[0],
    ogType: "article",
  });
}

// Structured Data for Product
export function ProductStructuredData({ product }: { product: any }) {
  const productSchema = generateProductStructuredData({
    name: product.name,
    description: product.description,
    image: product.images,
    sku: product.sku,
    brand: product.brand || "Beyblade",
    price: product.price,
    currency: "INR",
    availability: product.stock > 0 ? "InStock" : "OutOfStock",
    rating: product.rating,
    reviewCount: product.reviewCount,
    url: `/products/${product.slug}`,
  });

  const breadcrumbSchema = generateBreadcrumbStructuredData([
    { name: "Home", url: "/" },
    { name: product.category, url: `/categories/${product.categorySlug}` },
    { name: product.name, url: `/products/${product.slug}` },
  ]);

  return <StructuredData data={[productSchema, breadcrumbSchema]} />;
}

// ============================================================================
// Example 3: Category Page SEO
// ============================================================================

interface CategoryPageProps {
  params: { slug: string };
}

export async function generateCategoryMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const category = await fetchCategory(params.slug);

  return generateSEOMetadata({
    title: `${category.name} - Shop Collection`,
    description:
      category.description ||
      `Browse our collection of ${category.name} Beyblades and accessories`,
    keywords: [category.name, "beyblade", category.name.toLowerCase(), "shop"],
    canonical: `/categories/${params.slug}`,
    ogImage: category.image,
    ogType: "website",
  });
}

// ============================================================================
// Example 4: FAQ Page SEO
// ============================================================================

export function generateFAQMetadata(): Metadata {
  return generateSEOMetadata({
    title: "Frequently Asked Questions",
    description:
      "Find answers to common questions about Beyblades, shipping, returns, and more.",
    keywords: ["faq", "help", "beyblade questions", "support"],
    canonical: "/faq",
    ogType: "website",
  });
}

export function FAQStructuredData({
  faqs,
}: {
  faqs: Array<{ question: string; answer: string }>;
}) {
  const faqSchema = generateFAQSchema(
    faqs.map((faq) => ({
      question: faq.question,
      answer: faq.answer,
    }))
  );

  return <StructuredData data={faqSchema} />;
}

// ============================================================================
// Example 5: Blog/Article Page SEO
// ============================================================================

export async function generateArticleMetadata(article: any): Promise<Metadata> {
  return generateSEOMetadata({
    title: article.title,
    description: article.excerpt,
    keywords: article.tags,
    canonical: `/blog/${article.slug}`,
    ogImage: article.featuredImage,
    ogType: "article",
  });
}

// ============================================================================
// Helper function to fetch product (example)
// ============================================================================

async function fetchProduct(slug: string) {
  // Replace with your actual data fetching logic
  return {
    name: "Example Beyblade",
    slug,
    description: "Description here",
    images: ["/product-image.jpg"],
    sku: "BEY-123",
    brand: "Takara Tomy",
    price: 999,
    stock: 10,
    rating: 4.5,
    reviewCount: 120,
    category: "Beyblade Burst",
    categorySlug: "beyblade-burst",
  };
}

async function fetchCategory(slug: string) {
  // Replace with your actual data fetching logic
  return {
    name: "Example Category",
    slug,
    description: "Category description",
    image: "/category-image.jpg",
  };
}

// ============================================================================
// Example 6: Global Website Schema (in layout.tsx)
// ============================================================================

export function GlobalSEOSchema() {
  const websiteSchema = generateWebsiteSchema();
  return <StructuredData data={websiteSchema} />;
}

export default {
  generateHomepageMetadata,
  generateProductMetadata,
  generateCategoryMetadata,
  generateFAQMetadata,
  generateArticleMetadata,
  ProductStructuredData,
  FAQStructuredData,
  GlobalSEOSchema,
};

