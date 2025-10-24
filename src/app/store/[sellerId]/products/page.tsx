"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  StarIcon,
  EyeIcon,
  HeartIcon,
  ShoppingCartIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  rating: number;
  reviewCount: number;
  views: number;
  inStock: boolean;
  stockCount: number;
  description: string;
  features: string[];
  tags: string[];
  createdAt: string;
}

interface Seller {
  id: string;
  name: string;
  businessName: string;
  email: string;
  verified: boolean;
  rating: number;
  totalProducts: number;
  totalSales: number;
  joinedDate: string;
  description: string;
  location: string;
  avatar?: string;
}

export default function SellerStoreProductsPage() {
  const { sellerId } = useParams();
  const [seller, setSeller] = useState<Seller | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);

  const fetchSellerData = async () => {
    setLoading(true);
    try {
      // Fetch seller info
      const sellerResponse = await fetch(`/api/sellers/${sellerId}`);
      if (sellerResponse.ok) {
        const sellerData = await sellerResponse.json();
        setSeller(sellerData);
      }

      // Fetch products
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "12",
        search,
        category,
        sort,
      });

      const productsResponse = await fetch(
        `/api/sellers/${sellerId}/products?${params}`
      );
      if (productsResponse.ok) {
        const data = await productsResponse.json();
        setProducts(data.products);
        setTotalPages(data.pagination.totalPages);
        setCategories(data.categories);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error("Failed to fetch seller data:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sellerId) {
      const debounceTimer = setTimeout(() => {
        fetchSellerData();
      }, 300);

      return () => clearTimeout(debounceTimer);
    }
  }, [sellerId, search, category, sort, page]);

  const toggleWishlist = async (productId: string) => {
    try {
      const response = await fetch("/api/user/wishlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId }),
      });

      if (response.ok) {
        setWishlist((prev) =>
          prev.includes(productId)
            ? prev.filter((id) => id !== productId)
            : [...prev, productId]
        );
      }
    } catch (error) {
      console.error("Failed to toggle wishlist:", error);
    }
  };

  const addToCart = async (productId: string) => {
    try {
      const response = await fetch("/api/user/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId, quantity: 1 }),
      });

      if (response.ok) {
        // You might want to show a success message or update cart state
        console.log("Added to cart successfully");
      }
    } catch (error) {
      console.error("Failed to add to cart:", error);
    }
  };

  const applyFilters = () => {
    setPage(1);
    fetchSellerData();
  };

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setSort("newest");
    setPage(1);
  };

  if (loading && !seller) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Seller Not Found
          </h1>
          <p className="text-gray-600">
            The seller you're looking for doesn't exist.
          </p>
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-700 mt-4 inline-block"
          >
            Go back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Seller Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
              {seller.avatar ? (
                <Image
                  src={seller.avatar}
                  alt={seller.name}
                  width={96}
                  height={96}
                  className="rounded-full"
                />
              ) : (
                <span className="text-2xl font-bold text-gray-600">
                  {seller.name.charAt(0)}
                </span>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  {seller.businessName || seller.name} - Products
                </h1>
                {seller.verified && (
                  <CheckCircleIcon className="w-6 h-6 text-green-500" />
                )}
              </div>

              <div className="flex items-center space-x-4 mt-2">
                <div className="flex items-center">
                  <StarIcon className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="ml-1 text-sm font-medium">
                    {seller.rating}
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  {seller.totalProducts} products
                </span>
                <span className="text-sm text-gray-500">
                  {seller.totalSales} sales
                </span>
                <span className="text-sm text-gray-500">{seller.location}</span>
              </div>

              {seller.description && (
                <p className="mt-2 text-gray-600">{seller.description}</p>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <Link
                href={`/store/${sellerId}/auctions`}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                View Auctions
              </Link>
              <Link
                href={`/store/${sellerId}`}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Store Home
              </Link>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <FunnelIcon className="w-5 h-5 mr-2" />
              Filters
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>

                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="popular">Most Popular</option>
                  <option value="rating">Highest Rated</option>
                </select>

                <div className="flex space-x-2">
                  <button
                    onClick={applyFilters}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Apply
                  </button>
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No products found</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="relative">
                    <Link href={`/products/${product.id}`}>
                      <Image
                        src={product.images?.[0] || "/images/placeholder.jpg"}
                        alt={product.name}
                        width={300}
                        height={200}
                        className="w-full h-48 object-cover hover:scale-105 transition-transform duration-200"
                      />
                    </Link>

                    <button
                      onClick={() => toggleWishlist(product.id)}
                      className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50"
                    >
                      {wishlist.includes(product.id) ? (
                        <HeartSolid className="w-5 h-5 text-red-500" />
                      ) : (
                        <HeartIcon className="w-5 h-5 text-gray-400" />
                      )}
                    </button>

                    {!product.inStock && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <span className="text-white font-semibold">
                          Out of Stock
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <Link href={`/products/${product.id}`}>
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600">
                        {product.name}
                      </h3>
                    </Link>

                    <div className="flex items-center space-x-1 mb-2">
                      <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600">
                        {product.rating} ({product.reviewCount})
                      </span>
                      <span className="text-sm text-gray-400">•</span>
                      <EyeIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-500">
                        {product.views}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-gray-900">
                          ₹{product.price.toLocaleString()}
                        </span>
                        {product.originalPrice &&
                          product.originalPrice > product.price && (
                            <span className="text-sm text-gray-500 line-through">
                              ₹{product.originalPrice.toLocaleString()}
                            </span>
                          )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {product.category}
                      </span>
                    </div>

                    <button
                      onClick={() => addToCart(product.id)}
                      disabled={!product.inStock}
                      className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      <ShoppingCartIcon className="w-4 h-4 mr-2" />
                      {product.inStock ? "Add to Cart" : "Out of Stock"}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center mt-8 space-x-4">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-700">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
