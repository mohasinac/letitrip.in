"use client";

import { use, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronRight,
  ChevronLeft,
  Grid as GridIcon,
  List,
  Loader2,
  Tag,
  Home,
  Search,
  Filter,
} from "lucide-react";
import { ProductCard } from "@/components/cards/ProductCard";
import { UnifiedFilterSidebar } from "@/components/common/inline-edit";
import { PRODUCT_FILTERS } from "@/constants/filters";
import { categoriesService } from "@/services/categories.service";
import { productsService } from "@/services/products.service";
import { useCart } from "@/hooks/useCart";
import { useIsMobile } from "@/hooks/useMobile";
import type { Category, Product } from "@/types";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function CategoryDetailPage({ params }: PageProps) {
  const { slug } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addItem } = useCart();
  const subcategoriesScrollRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const [category, setCategory] = useState<Category | null>(null);
  const [breadcrumb, setBreadcrumb] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState<
    Category[]
  >([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [subcategorySearch, setSubcategorySearch] = useState("");
  const [subcategorySort, setSubcategorySort] = useState<
    "alphabetical" | "productCount"
  >("alphabetical");
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  useEffect(() => {
    loadCategory();
  }, [slug]);

  useEffect(() => {
    if (category) {
      loadProducts();
    }
  }, [category, sortBy, sortOrder, filterValues]);

  useEffect(() => {
    // Filter and sort subcategories
    let filtered = [...subcategories];

    if (subcategorySearch.trim()) {
      const query = subcategorySearch.toLowerCase();
      filtered = filtered.filter((cat) =>
        cat.name.toLowerCase().includes(query)
      );
    }

    filtered.sort((a, b) => {
      if (subcategorySort === "alphabetical") {
        return a.name.localeCompare(b.name);
      } else {
        return b.productCount - a.productCount;
      }
    });

    setFilteredSubcategories(filtered);
  }, [subcategories, subcategorySearch, subcategorySort]);

  const loadCategory = async () => {
    setLoading(true);
    try {
      // Load category details
      const categoryData = await categoriesService.getBySlug(slug);
      setCategory(categoryData);

      // Check if we have a path in URL (user followed link)
      const pathParam = searchParams.get("path");
      if (pathParam) {
        // Use the path from URL
        const pathSlugs = pathParam.split(",");
        const pathCategories: Category[] = [];

        for (const pathSlug of pathSlugs) {
          try {
            const cat = await categoriesService.getBySlug(pathSlug);
            pathCategories.push(cat);
          } catch (err) {
            console.error("Failed to load path category:", pathSlug);
          }
        }

        setBreadcrumb(pathCategories);
      } else {
        // Load default breadcrumb (nearest parent path)
        const breadcrumbData = await categoriesService.getBreadcrumb(
          categoryData.id
        );
        setBreadcrumb(breadcrumbData);
      }

      // Load subcategories
      const subcats = await categoriesService.list({
        parentId: categoryData.id,
        isActive: true,
      });
      setSubcategories(subcats);
    } catch (error) {
      console.error("Failed to load category:", error);
      setCategory(null);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    if (!category) return;

    setProductsLoading(true);
    try {
      const response = await productsService.list({
        categoryId: category.id,
        search: searchQuery || undefined,
        ...filterValues,
        sortBy: sortBy as any,
        sortOrder,
        status: "published" as any,
        limit: 100,
      });
      setProducts(response.data || []);
      setTotalProducts(
        response.pagination?.total || response.data?.length || 0
      );
    } catch (error) {
      console.error("Failed to load products:", error);
      setProducts([]);
      setTotalProducts(0);
    } finally {
      setProductsLoading(false);
    }
  };

  const handleResetFilters = () => {
    setFilterValues({});
    setSearchQuery("");
    setSortBy("createdAt");
    setSortOrder("desc");
  };

  const handleAddToCart = async (
    productId: string,
    productDetails?: {
      name: string;
      price: number;
      image: string;
      shopId: string;
      shopName: string;
    }
  ) => {
    try {
      if (!productDetails) {
        const product = products.find((p) => p.id === productId);
        if (!product) {
          throw new Error("Product not found");
        }
        productDetails = {
          name: product.name,
          price: product.price,
          image: product.images?.[0] || "",
          shopId: product.shopId,
          shopName: product.shopId,
        };
      }

      await addItem(productId, 1, undefined, productDetails);
      alert("Added to cart!");
    } catch (error: any) {
      alert(error.message || "Failed to add to cart");
    }
  };

  const scrollSubcategories = (direction: "left" | "right") => {
    if (subcategoriesScrollRef.current) {
      const scrollAmount = 300;
      const newScrollLeft =
        subcategoriesScrollRef.current.scrollLeft +
        (direction === "left" ? -scrollAmount : scrollAmount);
      subcategoriesScrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });

      setTimeout(() => {
        if (subcategoriesScrollRef.current) {
          setShowLeftArrow(subcategoriesScrollRef.current.scrollLeft > 0);
          setShowRightArrow(
            subcategoriesScrollRef.current.scrollLeft <
              subcategoriesScrollRef.current.scrollWidth -
                subcategoriesScrollRef.current.clientWidth
          );
        }
      }, 300);
    }
  };

  const buildCategoryPath = (targetSlug: string): string => {
    // Build path including current breadcrumb
    const pathSlugs = [...breadcrumb.map((c) => c.slug), slug];
    return pathSlugs.join(",");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Category not found
          </h2>
          <p className="text-gray-600 mb-4">
            The category you're looking for doesn't exist.
          </p>
          <button
            onClick={() => router.push("/categories")}
            className="text-blue-600 hover:underline"
          >
            Browse all categories
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner Section */}
      {category.banner && (
        <div className="relative h-64 w-full bg-gradient-to-r from-blue-500 to-purple-600 overflow-hidden">
          <img
            src={category.banner}
            alt={category.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4">
        {/* Category Header */}
        <div className={`relative ${category.banner ? "-mt-16" : "pt-8"} mb-8`}>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-6">
              {/* Profile Image */}
              {category.image && (
                <div
                  className={`w-24 h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 ${
                    category.banner
                      ? "-mt-12 border-4 border-white shadow-lg"
                      : ""
                  }`}
                >
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="flex-1">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <Link
                    href="/"
                    className="hover:text-blue-600 transition-colors"
                  >
                    <Home className="w-4 h-4" />
                  </Link>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                  <Link
                    href="/categories"
                    className="hover:text-blue-600 transition-colors"
                  >
                    Categories
                  </Link>
                  {breadcrumb.map((cat) => (
                    <div key={cat.id} className="flex items-center gap-2">
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                      <Link
                        href={`/categories/${cat.slug}`}
                        className="hover:text-blue-600 transition-colors"
                      >
                        {cat.name}
                      </Link>
                    </div>
                  ))}
                </nav>

                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {category.name}
                </h1>
                {category.description && (
                  <p className="text-gray-600">
                    {category.description.replace(/<[^>]*>/g, "")}
                  </p>
                )}
              </div>

              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600">
                  {category.productCount}
                </div>
                <div className="text-sm text-gray-500">Products</div>
              </div>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div className="pb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Products</h2>
          </div>

          {/* Search & Controls */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <input
                  type="search"
                  placeholder="Search products in this category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && loadProducts()}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Sort */}
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="createdAt">Newest</option>
                  <option value="price">Price</option>
                  <option value="rating">Rating</option>
                  <option value="sales">Popular</option>
                </select>

                <select
                  value={sortOrder}
                  onChange={(e) =>
                    setSortOrder(e.target.value as "asc" | "desc")
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="desc">High to Low</option>
                  <option value="asc">Low to High</option>
                </select>

                {/* View Toggle */}
                <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`px-3 py-2 ${
                      viewMode === "grid"
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-600"
                    }`}
                  >
                    <GridIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`px-3 py-2 ${
                      viewMode === "list"
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-600"
                    }`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Filter Toggle (Mobile) */}
              {isMobile && (
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Filter className="w-5 h-5" />
                  Filters
                  {Object.keys(filterValues).length > 0 && (
                    <span className="bg-white text-blue-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                      {Object.keys(filterValues).length}
                    </span>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Desktop Sidebar - Always Visible */}
            {!isMobile && (
              <UnifiedFilterSidebar
                sections={PRODUCT_FILTERS}
                values={filterValues}
                onChange={(key, value) => {
                  setFilterValues((prev) => ({ ...prev, [key]: value }));
                }}
                onApply={() => {}}
                onReset={() => {
                  setFilterValues({});
                }}
                isOpen={true}
                onClose={() => {}}
                searchable={true}
                mobile={false}
                resultCount={totalProducts}
                isLoading={productsLoading}
              />
            )}

            {/* Mobile Filter Drawer */}
            {isMobile && (
              <UnifiedFilterSidebar
                sections={PRODUCT_FILTERS}
                values={filterValues}
                onChange={(key, value) => {
                  setFilterValues((prev) => ({ ...prev, [key]: value }));
                }}
                onApply={() => {
                  setShowFilters(false);
                }}
                onReset={() => {
                  setFilterValues({});
                }}
                isOpen={showFilters}
                onClose={() => setShowFilters(false)}
                searchable={true}
                mobile={true}
                resultCount={totalProducts}
                isLoading={productsLoading}
              />
            )}

            {/* Products Grid/List */}
            <div className="flex-1">
              {productsLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
              ) : products.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                  <p className="text-gray-600 text-lg">
                    {Object.keys(filterValues).length > 0
                      ? "No products found matching your filters"
                      : "No products found in this category"}
                  </p>
                  {Object.keys(filterValues).length > 0 && (
                    <button
                      onClick={handleResetFilters}
                      className="mt-4 text-blue-600 hover:underline"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              ) : (
                <>
                  {viewMode === "grid" ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {products.map((product) => (
                        <ProductCard
                          key={product.id}
                          id={product.id}
                          name={product.name}
                          slug={product.slug}
                          price={product.price}
                          originalPrice={product.originalPrice}
                          image={product.images?.[0] || ""}
                          rating={product.rating}
                          reviewCount={product.reviewCount}
                          shopName={product.shopId}
                          shopSlug={product.shopId}
                          shopId={product.shopId}
                          inStock={product.stockCount > 0}
                          isFeatured={product.isFeatured}
                          condition={product.condition}
                          onAddToCart={handleAddToCart}
                          showShopName={true}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Product
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Price
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Stock
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Rating
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {products.map((product) => (
                            <tr key={product.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={product.images?.[0] || ""}
                                    alt={product.name}
                                    className="w-12 h-12 rounded object-cover"
                                  />
                                  <div>
                                    <div className="font-medium text-gray-900">
                                      {product.name}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {product.condition}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="font-medium">
                                  ₹{product.price.toLocaleString()}
                                </div>
                                {product.originalPrice &&
                                  product.originalPrice > product.price && (
                                    <div className="text-sm text-gray-500 line-through">
                                      ₹{product.originalPrice.toLocaleString()}
                                    </div>
                                  )}
                              </td>
                              <td className="px-6 py-4">
                                <span
                                  className={`px-2 py-1 text-xs rounded ${
                                    product.stockCount > 0
                                      ? "bg-green-100 text-green-700"
                                      : "bg-red-100 text-red-700"
                                  }`}
                                >
                                  {product.stockCount > 0
                                    ? `${product.stockCount} in stock`
                                    : "Out of stock"}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                {product.rating > 0 && (
                                  <div className="flex items-center gap-1">
                                    <span className="text-yellow-500">★</span>
                                    <span className="font-medium">
                                      {product.rating.toFixed(1)}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                      ({product.reviewCount})
                                    </span>
                                  </div>
                                )}
                              </td>
                              <td className="px-6 py-4 text-right space-x-2">
                                <button
                                  onClick={() =>
                                    router.push(`/products/${product.slug}`)
                                  }
                                  className="text-blue-600 hover:underline text-sm"
                                >
                                  View
                                </button>
                                {product.stockCount > 0 && (
                                  <button
                                    onClick={() => handleAddToCart(product.id)}
                                    className="text-blue-600 hover:underline text-sm"
                                  >
                                    Add to Cart
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Subcategories Section - Bottom Horizontal Scroll */}
        {subcategories.length > 0 && (
          <div className="mt-12 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Explore Subcategories
              </h2>

              {/* Search and Sort Controls */}
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="search"
                    placeholder="Search subcategories..."
                    value={subcategorySearch}
                    onChange={(e) => setSubcategorySearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={subcategorySort}
                  onChange={(e) => setSubcategorySort(e.target.value as any)}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="alphabetical">Alphabetical</option>
                  <option value="productCount">Product Count</option>
                </select>
              </div>

              {/* Horizontal Scroll Container */}
              <div className="relative">
                {/* Left Arrow */}
                {showLeftArrow && (
                  <button
                    onClick={() => scrollSubcategories("left")}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50"
                    aria-label="Scroll left"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-700" />
                  </button>
                )}

                {/* Subcategories Horizontal List */}
                <div
                  ref={subcategoriesScrollRef}
                  className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 px-1"
                  onScroll={(e) => {
                    const target = e.target as HTMLDivElement;
                    setShowLeftArrow(target.scrollLeft > 0);
                    setShowRightArrow(
                      target.scrollLeft <
                        target.scrollWidth - target.clientWidth
                    );
                  }}
                >
                  {filteredSubcategories.length === 0 ? (
                    <div className="w-full text-center py-8 text-gray-500">
                      No subcategories found
                    </div>
                  ) : (
                    filteredSubcategories.map((subcat) => (
                      <Link
                        key={subcat.id}
                        href={`/categories/${
                          subcat.slug
                        }?path=${buildCategoryPath(subcat.slug)}`}
                        className="flex-shrink-0 w-40 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all p-3 group"
                      >
                        {subcat.image && (
                          <div className="w-full h-24 mb-2 rounded-lg overflow-hidden bg-white">
                            <img
                              src={subcat.image}
                              alt={subcat.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          </div>
                        )}
                        <h3 className="font-semibold text-sm text-gray-900 group-hover:text-blue-600 transition-colors mb-1 line-clamp-2">
                          {subcat.name}
                        </h3>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Tag className="w-3 h-3" />
                          <span>{subcat.productCount} items</span>
                        </div>
                        <div className="mt-2 flex items-center justify-end">
                          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                        </div>
                      </Link>
                    ))
                  )}
                </div>

                {/* Right Arrow */}
                {showRightArrow && (
                  <button
                    onClick={() => scrollSubcategories("right")}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50"
                    aria-label="Scroll right"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-700" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
