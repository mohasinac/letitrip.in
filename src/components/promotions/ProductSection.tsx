import { ProductCard } from "@/components/products";
import { THEME_CONSTANTS } from "@/constants";
import type { ProductDocument } from "@/db/schema";

const { themed, typography } = THEME_CONSTANTS;

interface ProductSectionProps {
  title: string;
  subtitle: string;
  products: ProductDocument[];
}

export function ProductSection({
  title,
  subtitle,
  products,
}: ProductSectionProps) {
  if (products.length === 0) return null;

  return (
    <section>
      <div className="mb-6">
        <h2 className={`${typography.h3} ${themed.textPrimary}`}>{title}</h2>
        <p className={`mt-1 ${themed.textSecondary}`}>{subtitle}</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
