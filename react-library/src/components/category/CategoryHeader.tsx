import { ReactNode } from "react";
import { cn } from "../../utils/cn";

export interface CategoryHeaderProps {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  productCount: number;
  parentCategory?: {
    id: string;
    name: string;
    slug: string;
  } | null;

  // Injection props
  LinkComponent?: React.ComponentType<{
    href: string;
    className?: string;
    children: ReactNode;
  }>;
  ImageComponent?: React.ComponentType<{
    src: string;
    alt: string;
    fill?: boolean;
    width?: number;
    height?: number;
    className?: string;
  }>;
  icons?: {
    chevronRight?: ReactNode;
    package?: ReactNode;
  };
  className?: string;
}

/**
 * CategoryHeader Component (Library Version)
 *
 * Framework-agnostic category banner with breadcrumb navigation.
 * Displays category name, image, description, and product count.
 *
 * Features:
 * - Large banner with category image
 * - Category name and description
 * - Product count badge
 * - Parent category breadcrumb navigation
 * - Responsive design
 * - Component injection for Link and Image
 *
 * @example
 * ```tsx
 * <CategoryHeader
 *   id="cat123"
 *   name="Electronics"
 *   slug="electronics"
 *   description="Browse our electronics collection"
 *   image="/categories/electronics.jpg"
 *   productCount={1250}
 *   parentCategory={{ id: "root", name: "All Categories", slug: "all" }}
 *   LinkComponent={NextLink}
 *   ImageComponent={OptimizedImage}
 *   icons={{ chevronRight: <ChevronRight />, package: <Package /> }}
 * />
 * ```
 */
export function CategoryHeader({
  id,
  name,
  slug,
  description,
  image,
  productCount,
  parentCategory,
  LinkComponent,
  ImageComponent,
  icons,
  className,
}: CategoryHeaderProps) {
  return (
    <div
      className={cn(
        "bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700",
        className,
      )}
    >
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        {parentCategory && LinkComponent && (
          <nav className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
            <LinkComponent
              href="/categories"
              className="hover:text-primary transition-colors"
            >
              All Categories
            </LinkComponent>
            {icons?.chevronRight && (
              <div className="w-4 h-4">{icons.chevronRight}</div>
            )}
            <LinkComponent
              href={`/categories/${parentCategory.slug}`}
              className="hover:text-primary transition-colors"
            >
              {parentCategory.name}
            </LinkComponent>
            {icons?.chevronRight && (
              <div className="w-4 h-4">{icons.chevronRight}</div>
            )}
            <span className="text-gray-900 dark:text-white font-medium">
              {name}
            </span>
          </nav>
        )}

        {/* Header Content */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Category Image */}
          {image && ImageComponent && (
            <div className="relative w-full md:w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
              <ImageComponent
                src={image}
                alt={name}
                fill={true}
                className="object-cover"
              />
            </div>
          )}

          {/* Category Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-3">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {name}
              </h1>

              {/* Product Count Badge */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full flex-shrink-0">
                {icons?.package && (
                  <div className="w-4 h-4">{icons.package}</div>
                )}
                <span className="text-sm font-semibold">
                  {productCount.toLocaleString()}{" "}
                  {productCount === 1 ? "Product" : "Products"}
                </span>
              </div>
            </div>

            {description && (
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
