import React, { ComponentType } from "react";

export interface CategoryCardProps {
  id: string;
  name: string;
  slug: string;
  image?: string;
  description?: string;
  productCount: number;
  featured?: boolean;
  parentCategory?: string;
  subcategoryCount?: number;
  variant?: "default" | "compact" | "large";

  // Component Injection
  LinkComponent?: ComponentType<any>;
  ImageComponent?: ComponentType<any>;
  FavoriteButtonComponent?: ComponentType<any>;
  PackageIcon?: ComponentType<{ className?: string }>;

  // Callbacks
  onCategoryClick?: (categoryId: string, slug: string) => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  id,
  name,
  slug,
  image,
  description,
  productCount,
  featured = false,
  parentCategory,
  subcategoryCount = 0,
  variant = "default",
  LinkComponent = "a",
  ImageComponent,
  FavoriteButtonComponent,
  PackageIcon,
  onCategoryClick,
}) => {
  const sizeClasses = {
    compact: "aspect-square",
    default: "aspect-[4/3]",
    large: "aspect-[16/9]",
  };

  const textSizeClasses = {
    compact: "text-sm",
    default: "text-base",
    large: "text-lg",
  };

  const handleClick = (e: React.MouseEvent) => {
    if (onCategoryClick) {
      e.preventDefault();
      onCategoryClick(id, slug);
    }
  };

  const linkProps = {
    href: `/categories/${slug}`,
    onClick: handleClick,
    className:
      "group block bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg dark:hover:shadow-gray-900/50 transition-all duration-200 hover:-translate-y-1",
  };

  return (
    <LinkComponent {...linkProps}>
      {/* Image Container */}
      <div
        className={`relative ${sizeClasses[variant]} overflow-hidden bg-gray-100 dark:bg-gray-700`}
      >
        {image && ImageComponent ? (
          <ImageComponent
            src={image}
            alt={name}
            fill={true}
            className="object-cover group-hover:scale-110 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30">
            {PackageIcon ? (
              <PackageIcon className="w-16 h-16 text-gray-400 dark:text-gray-500" />
            ) : (
              // Fallback SVG
              <svg
                className="w-16 h-16 text-gray-400 dark:text-gray-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.29,7 12,12 20.71,7" />
                <line x1="12" y1="22" x2="12" y2="12" />
              </svg>
            )}
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {featured && (
            <span className="bg-yellow-500 text-white text-xs font-semibold px-2 py-1 rounded">
              Featured
            </span>
          )}
        </div>

        {/* Product Count Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {productCount} {productCount === 1 ? "Product" : "Products"}
            </span>
            {subcategoryCount > 0 && (
              <span className="text-xs bg-white/20 px-2 py-1 rounded backdrop-blur-sm">
                {subcategoryCount}{" "}
                {subcategoryCount === 1 ? "Subcategory" : "Subcategories"}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Parent Category */}
        {parentCategory && variant !== "compact" && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            {parentCategory}
          </p>
        )}

        {/* Category Name */}
        <h3
          className={`font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors ${
            textSizeClasses[variant]
          } ${variant === "compact" ? "line-clamp-1" : "line-clamp-2"}`}
        >
          {name}
        </h3>

        {/* Description */}
        {description && variant === "large" && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
            {description}
          </p>
        )}

        {/* Stats */}
        {variant !== "compact" && (
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>
              {productCount} {productCount === 1 ? "item" : "items"}
            </span>
            <span className="text-blue-600 dark:text-blue-400 font-medium group-hover:underline">
              Browse →
            </span>
          </div>
        )}
      </div>

      {/* Favorite Button */}
      {FavoriteButtonComponent && (
        <div className="absolute top-2 right-2 z-10">
          <FavoriteButtonComponent
            itemId={id}
            itemType="category"
            initialIsFavorite={false}
            size="md"
          />
        </div>
      )}
    </LinkComponent>
  );
};
