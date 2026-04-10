import { Heading, Section, Text } from "@mohasinac/appkit/ui";
import { ProductCard } from "@/components";
import { THEME_CONSTANTS } from "@/constants";
import type { ProductCardData } from "@/components";

const { themed, typography } = THEME_CONSTANTS;

interface ProductSectionProps {
  title: string;
  subtitle: string;
  products: ProductCardData[];
}

export function ProductSection({
  title,
  subtitle,
  products,
}: ProductSectionProps) {
  if (products.length === 0) return null;

  return (
    <Section>
      <div className="mb-6">
        <Heading level={2}>{title}</Heading>
        <Text variant="secondary" className="mt-1">
          {subtitle}
        </Text>
      </div>
      <div className={THEME_CONSTANTS.grid.productCards}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </Section>
  );
}
