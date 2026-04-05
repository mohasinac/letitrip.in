import { notFound } from "next/navigation";
import { productRepository } from "@/repositories";
import { ProductDetailView } from "@/features/products";
import { SITE_CONFIG } from "@/constants";
import type { Metadata } from "next";
import type { ProductItem } from "@mohasinac/feat-products";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://letitrip.in";

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await productRepository.findByIdOrSlug(slug);
  if (!product) return {};
  const title = `${product.title} — ${SITE_CONFIG.brand.name}`;
  const description = product.description?.slice(0, 160);
  const images = product.mainImage
    ? [product.mainImage]
    : product.images?.length
      ? [product.images[0]]
      : [];
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images,
      type: "website",
    },
    alternates: {
      canonical: `${APP_URL}/products/${product.slug ?? slug}`,
    },
  };
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { slug } = await params;
  const product = await productRepository.findByIdOrSlug(slug);
  if (!product) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image: product.mainImage ? [product.mainImage] : (product.images ?? []),
    sku: product.id,
    offers: {
      "@type": "Offer",
      priceCurrency: product.currency ?? "INR",
      price: product.price,
      availability:
        (product.availableQuantity ?? 0) > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url: `${APP_URL}/products/${product.slug ?? slug}`,
      seller: {
        "@type": "Organization",
        name: product.sellerName ?? SITE_CONFIG.brand.name,
      },
    },
    brand: product.brand
      ? { "@type": "Brand", name: product.brand }
      : undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailView
        slug={slug}
        initialData={product as unknown as ProductItem}
      />
    </>
  );
}
