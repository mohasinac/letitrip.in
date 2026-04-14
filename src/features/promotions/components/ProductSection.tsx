import { Heading, Section, Text } from "@mohasinac/appkit/ui";
import {
  ProductCard,
  type ProductItem,
} from "@mohasinac/appkit/features/products";
import { ROUTES, THEME_CONSTANTS } from "@/constants";
import { Link } from "@/i18n/navigation";

const { themed, typography } = THEME_CONSTANTS;

interface ProductSectionProps {
  title: string;
  subtitle: string;
  products: ProductItem[];
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
          <Link
            key={product.id}
            href={ROUTES.PUBLIC.PRODUCT_DETAIL(product.slug ?? product.id)}
            className="block"
          >
            <ProductCard product={product} className="h-full" />
          </Link>
        ))}
      </div>
    </Section>
  );
}
