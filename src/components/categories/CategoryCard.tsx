import Link from "next/link";
import { Category } from "@/types";

interface CategoryCardProps {
  category: Category;
  variant?: "featured" | "grid" | "list";
  showSubcategories?: boolean;
}

export function CategoryCard({
  category,
  variant = "grid",
  showSubcategories = true,
}: CategoryCardProps) {
  if (variant === "featured") {
    return (
      <Link
        href={`/categories/${category.slug}`}
        className="group bg-white rounded-lg shadow-sm border overflow-hidden transition-all hover:shadow-lg hover:scale-105"
      >
        <div className="relative">
          <img
            src={category.image}
            alt={category.name}
            className="w-full h-32 object-cover group-hover:scale-110 transition-transform"
          />
          <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-all"></div>
          <div className="absolute top-2 left-2">
            <span className="text-2xl">{category.icon}</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
            <h3 className="text-white font-bold text-lg">{category.name}</h3>
            <p className="text-white/80 text-sm">
              {category.productCount} products
            </p>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === "list") {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-start space-x-4">
          <img
            src={category.image}
            alt={category.name}
            className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
          />

          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{category.icon}</span>
                <h3 className="text-xl font-bold text-gray-900">
                  {category.name}
                </h3>
                {category.featured && (
                  <span className="bg-yellow-400 text-black px-2 py-1 rounded-full text-xs font-bold">
                    Featured
                  </span>
                )}
              </div>
              <span className="text-sm text-gray-500">
                {category.productCount.toLocaleString()} products
              </span>
            </div>

            <p className="text-gray-600 mb-3">{category.description}</p>

            {showSubcategories &&
              category.subcategories &&
              category.subcategories.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {category.subcategories.map((sub) => (
                    <Link
                      key={sub.id}
                      href={`/categories/${sub.slug}`}
                      className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full hover:bg-primary hover:text-white transition-colors"
                    >
                      {sub.name} ({sub.productCount})
                    </Link>
                  ))}
                </div>
              )}

            <Link
              href={`/categories/${category.slug}`}
              className="inline-block bg-primary text-white px-4 py-2 rounded-md transition-colors hover:bg-primary/90"
            >
              Browse Category
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Default grid variant
  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden group hover:shadow-md transition-shadow">
      <div className="relative">
        <img
          src={category.image}
          alt={category.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
        />
        <div className="absolute top-4 left-4">
          <span className="text-3xl">{category.icon}</span>
        </div>
        {category.featured && (
          <div className="absolute top-4 right-4">
            <span className="bg-yellow-400 text-black px-2 py-1 rounded-full text-xs font-bold">
              Featured
            </span>
          </div>
        )}
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {category.name}
        </h3>
        <p className="text-gray-600 mb-4 text-sm line-clamp-2">
          {category.description}
        </p>

        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-500">
            {category.productCount.toLocaleString()} products
          </span>
          {category.subcategories && (
            <span className="text-sm text-gray-500">
              {category.subcategories.length} subcategories
            </span>
          )}
        </div>

        {showSubcategories &&
          category.subcategories &&
          category.subcategories.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Popular in this category:
              </p>
              <div className="flex flex-wrap gap-2">
                {category.subcategories.slice(0, 3).map((sub) => (
                  <Link
                    key={sub.id}
                    href={`/categories/${sub.slug}`}
                    className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full hover:bg-primary hover:text-white transition-colors"
                  >
                    {sub.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

        <Link
          href={`/categories/${category.slug}`}
          className="block w-full bg-primary text-white text-center py-2 px-4 rounded-md transition-colors hover:bg-primary/90"
        >
          Browse Category
        </Link>
      </div>
    </div>
  );
}
