/**
 * MegaMenu Component
 *
 * A desktop navigation menu with multi-column layout, category images,
 * featured items, and glassmorphism design.
 *
 * @example
 * ```tsx
 * <MegaMenu
 *   categories={[
 *     {
 *       id: 'products',
 *       label: 'Products',
 *       columns: [
 *         {
 *           title: 'Categories',
 *           items: [
 *             { label: 'All Products', href: '/products' },
 *             { label: 'New Arrivals', href: '/products/new', badge: 'New' }
 *           ]
 *         }
 *       ],
 *       featured: {
 *         title: 'Featured Product',
 *         image: '/featured.jpg',
 *         description: 'Check out our latest product',
 *         href: '/products/featured'
 *       }
 *     }
 *   ]}
 * />
 * ```
 */

import React, { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MegaMenuItem {
  /** Item label */
  label: string;
  /** Item href */
  href: string;
  /** Optional description */
  description?: string;
  /** Optional icon */
  icon?: React.ReactNode;
  /** Optional badge */
  badge?: string;
}

export interface MegaMenuColumn {
  /** Column title */
  title: string;
  /** Column items */
  items: MegaMenuItem[];
}

export interface MegaMenuFeatured {
  /** Featured title */
  title: string;
  /** Featured description */
  description: string;
  /** Featured image URL */
  image: string;
  /** Featured href */
  href: string;
}

export interface MegaMenuCategory {
  /** Category identifier */
  id: string;
  /** Category label */
  label: string;
  /** Category icon */
  icon?: React.ReactNode;
  /** Category columns */
  columns: MegaMenuColumn[];
  /** Optional featured section */
  featured?: MegaMenuFeatured;
  /** Optional promotional banner */
  banner?: {
    text: string;
    href: string;
    variant: "primary" | "success" | "warning";
  };
}

export interface MegaMenuProps {
  /** Menu categories */
  categories: MegaMenuCategory[];
  /** Additional class name */
  className?: string;
}

export const MegaMenu = React.forwardRef<HTMLElement, MegaMenuProps>(
  ({ categories, className }, ref) => {
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    return (
      <nav
        ref={ref}
        className={cn(
          "hidden lg:block relative bg-black/80 backdrop-blur-xl",
          "border-b border-white/10",
          className
        )}
      >
        <div className="container mx-auto px-4">
          <ul className="flex items-center gap-1">
            {categories.map((category) => {
              const isActive = activeCategory === category.id;

              return (
                <li
                  key={category.id}
                  className="relative"
                  onMouseEnter={() => setActiveCategory(category.id)}
                  onMouseLeave={() => setActiveCategory(null)}
                >
                  {/* Category button */}
                  <button
                    className={cn(
                      "flex items-center gap-2 px-4 py-3",
                      "text-white/70 hover:text-white transition-colors",
                      isActive && "text-white bg-white/5"
                    )}
                  >
                    {category.icon && (
                      <span className="flex-shrink-0">{category.icon}</span>
                    )}
                    <span>{category.label}</span>
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 transition-transform",
                        isActive && "rotate-180"
                      )}
                    />
                  </button>

                  {/* Dropdown panel */}
                  {isActive && (
                    <div
                      className={cn(
                        "absolute left-0 top-full mt-0 w-screen max-w-6xl",
                        "bg-black/95 backdrop-blur-xl",
                        "border border-white/10 rounded-lg shadow-2xl",
                        "animate-in fade-in slide-in-from-top-2 duration-200"
                      )}
                    >
                      <div className="p-6">
                        <div className="grid grid-cols-12 gap-6">
                          {/* Columns */}
                          <div
                            className={cn(
                              "grid gap-6",
                              category.featured ? "col-span-9" : "col-span-12",
                              category.columns.length === 1 && "grid-cols-1",
                              category.columns.length === 2 && "grid-cols-2",
                              category.columns.length >= 3 && "grid-cols-3"
                            )}
                          >
                            {category.columns.map((column, index) => (
                              <div key={index}>
                                <h3 className="font-semibold text-white mb-3">
                                  {column.title}
                                </h3>
                                <ul className="space-y-2">
                                  {column.items.map((item, itemIndex) => (
                                    <li key={itemIndex}>
                                      <Link
                                        href={item.href}
                                        className={cn(
                                          "flex items-start gap-2 p-2 rounded-lg",
                                          "text-white/70 hover:text-white hover:bg-white/5",
                                          "transition-colors group"
                                        )}
                                      >
                                        {item.icon && (
                                          <span className="flex-shrink-0 mt-0.5">
                                            {item.icon}
                                          </span>
                                        )}
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2">
                                            <span className="text-sm truncate">
                                              {item.label}
                                            </span>
                                            {item.badge && (
                                              <span className="px-1.5 py-0.5 text-[10px] font-medium bg-primary text-white rounded">
                                                {item.badge}
                                              </span>
                                            )}
                                          </div>
                                          {item.description && (
                                            <p className="text-xs text-white/50 mt-0.5 line-clamp-2">
                                              {item.description}
                                            </p>
                                          )}
                                        </div>
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>

                          {/* Featured section */}
                          {category.featured && (
                            <div className="col-span-3">
                              <Link
                                href={category.featured.href}
                                className={cn(
                                  "block h-full rounded-lg overflow-hidden",
                                  "bg-white/5 hover:bg-white/10 transition-colors",
                                  "border border-white/10"
                                )}
                              >
                                <img
                                  src={category.featured.image}
                                  alt={category.featured.title}
                                  className="w-full h-32 object-cover"
                                />
                                <div className="p-4">
                                  <h4 className="font-semibold text-white mb-1">
                                    {category.featured.title}
                                  </h4>
                                  <p className="text-sm text-white/60">
                                    {category.featured.description}
                                  </p>
                                </div>
                              </Link>
                            </div>
                          )}
                        </div>

                        {/* Banner */}
                        {category.banner && (
                          <Link
                            href={category.banner.href}
                            className={cn(
                              "block mt-6 p-4 rounded-lg",
                              "text-center font-medium",
                              "transition-opacity hover:opacity-80",
                              category.banner.variant === "primary" &&
                                "bg-primary text-white",
                              category.banner.variant === "success" &&
                                "bg-success text-white",
                              category.banner.variant === "warning" &&
                                "bg-warning text-black"
                            )}
                          >
                            {category.banner.text}
                          </Link>
                        )}
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    );
  }
);

MegaMenu.displayName = "MegaMenu";

/**
 * Hook for managing MegaMenu state
 */
export function useMegaMenu() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  return {
    activeCategory,
    setActiveCategory,
    open: (categoryId: string) => setActiveCategory(categoryId),
    close: () => setActiveCategory(null),
    toggle: (categoryId: string) =>
      setActiveCategory(activeCategory === categoryId ? null : categoryId),
  };
}
