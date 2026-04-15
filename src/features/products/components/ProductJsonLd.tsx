import { SITE_CONFIG } from "@/constants";
import type { ProductDocument } from "@/db/schema";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://letitrip.in";

interface Props {
  product: ProductDocument;
  slug: string;
}

/** Renders the Schema.org Product JSON-LD <script> block for SEO. */
export function ProductJsonLd({ product, slug }: Props) {
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
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

