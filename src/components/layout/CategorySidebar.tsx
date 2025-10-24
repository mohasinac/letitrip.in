"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  TagIcon,
  StarIcon,
  FireIcon,
  SparklesIcon,
  TrophyIcon,
  GiftIcon,
} from "@heroicons/react/24/outline";

interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  count?: number;
  subcategories?: Category[];
}

const categoryNavItems = [
  {
    name: "All Products",
    href: "/products",
    icon: TagIcon,
    description: "Browse all items",
  },
  {
    name: "Featured",
    href: "/products?featured=true",
    icon: StarIcon,
    description: "Handpicked items",
  },
  {
    name: "Hot Deals",
    href: "/deals",
    icon: FireIcon,
    description: "Limited time offers",
  },
  {
    name: "New Arrivals",
    href: "/products?sort=newest",
    icon: SparklesIcon,
    description: "Latest additions",
  },
  {
    name: "Best Sellers",
    href: "/products?sort=popular",
    icon: TrophyIcon,
    description: "Most popular items",
  },
  {
    name: "Special Offers",
    href: "/products?discount=true",
    icon: GiftIcon,
    description: "Discounted products",
  },
];

export default function CategorySidebar() {
  const pathname = usePathname();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch categories from API
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        if (response.ok) {
          const data = await response.json();
          setCategories(data.categories || []);
        } else {
          setCategories([]);
          console.error("Failed to fetch categories:", response.status);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  return (
    <div className="hidden lg:fixed lg:inset-y-16 lg:z-40 lg:flex lg:w-72 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 border-r border-gray-200">
        <div className="flex h-12 shrink-0 items-center border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Browse</h2>
        </div>

        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            {/* Quick Navigation */}
            <li>
              <div className="text-xs font-semibold leading-6 text-gray-400 mb-3">
                Quick Access
              </div>
              <ul role="list" className="-mx-2 space-y-1">
                {categoryNavItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={`
                          group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-medium transition-colors
                          ${
                            isActive
                              ? "bg-primary/10 text-primary"
                              : "text-gray-700 hover:text-primary hover:bg-primary/5"
                          }
                        `}
                      >
                        <item.icon
                          className={`h-5 w-5 shrink-0 ${
                            isActive
                              ? "text-primary"
                              : "text-gray-400 group-hover:text-primary"
                          }`}
                          aria-hidden="true"
                        />
                        <div className="flex flex-col">
                          <span>{item.name}</span>
                          <span className="text-xs text-gray-500 group-hover:text-primary/70">
                            {item.description}
                          </span>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>

            {/* Categories */}
            <li>
              <div className="text-xs font-semibold leading-6 text-gray-400 mb-3">
                Categories
              </div>
              {loading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-8 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <ul role="list" className="-mx-2 space-y-1">
                  {categories.map((category) => {
                    const isExpanded = expandedCategories.has(category.id);
                    const isCategoryActive = pathname.includes(
                      `/categories/${category.slug}`
                    );

                    return (
                      <li key={category.id}>
                        <div className="space-y-1">
                          {/* Main Category */}
                          <div className="flex items-center">
                            <Link
                              href={`/categories/${category.slug}`}
                              className={`
                                flex-1 group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-medium transition-colors
                                ${
                                  isCategoryActive
                                    ? "bg-primary/10 text-primary"
                                    : "text-gray-700 hover:text-primary hover:bg-primary/5"
                                }
                              `}
                            >
                              <TagIcon
                                className={`h-5 w-5 shrink-0 ${
                                  isCategoryActive
                                    ? "text-primary"
                                    : "text-gray-400 group-hover:text-primary"
                                }`}
                                aria-hidden="true"
                              />
                              <span className="flex-1">{category.name}</span>
                              {category.count && (
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                  {category.count}
                                </span>
                              )}
                            </Link>

                            {/* Expand/Collapse Button */}
                            {category.subcategories &&
                              category.subcategories.length > 0 && (
                                <button
                                  onClick={() => toggleCategory(category.id)}
                                  className="p-1 text-gray-400 hover:text-gray-600 ml-1"
                                >
                                  <svg
                                    className={`h-4 w-4 transition-transform ${
                                      isExpanded ? "rotate-90" : ""
                                    }`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M9 5l7 7-7 7"
                                    />
                                  </svg>
                                </button>
                              )}
                          </div>

                          {/* Subcategories */}
                          {isExpanded && category.subcategories && (
                            <ul className="ml-6 space-y-1">
                              {category.subcategories.map((subcategory) => {
                                const isSubActive = pathname.includes(
                                  `/categories/${subcategory.slug}`
                                );
                                return (
                                  <li key={subcategory.id}>
                                    <Link
                                      href={`/categories/${subcategory.slug}`}
                                      className={`
                                        group flex gap-x-3 rounded-md p-2 text-sm leading-6 transition-colors
                                        ${
                                          isSubActive
                                            ? "bg-primary/10 text-primary font-medium"
                                            : "text-gray-600 hover:text-primary hover:bg-primary/5"
                                        }
                                      `}
                                    >
                                      <span className="flex-1">
                                        {subcategory.name}
                                      </span>
                                      {subcategory.count && (
                                        <span className="text-xs text-gray-500">
                                          {subcategory.count}
                                        </span>
                                      )}
                                    </Link>
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>

            {/* Auctions */}
            <li className="mt-auto">
              <div className="text-xs font-semibold leading-6 text-gray-400 mb-2">
                Auctions
              </div>
              <ul role="list" className="-mx-2 space-y-1">
                <li>
                  <Link
                    href="/auctions"
                    className="text-gray-700 hover:text-purple-700 hover:bg-purple-50 group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-medium"
                  >
                    <FireIcon
                      className="h-5 w-5 shrink-0 text-gray-400 group-hover:text-purple-700"
                      aria-hidden="true"
                    />
                    <div className="flex flex-col">
                      <span>Live Auctions</span>
                      <span className="text-xs text-gray-500 group-hover:text-purple-600">
                        Bid on exclusive items
                      </span>
                    </div>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/auctions/ended"
                    className="text-gray-700 hover:text-orange-700 hover:bg-orange-50 group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-medium"
                  >
                    <TrophyIcon
                      className="h-5 w-5 shrink-0 text-gray-400 group-hover:text-orange-700"
                      aria-hidden="true"
                    />
                    <div className="flex flex-col">
                      <span>Ended Auctions</span>
                      <span className="text-xs text-gray-500 group-hover:text-orange-600">
                        See final results
                      </span>
                    </div>
                  </Link>
                </li>
              </ul>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
