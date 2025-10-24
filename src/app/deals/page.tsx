"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEnhancedAuth } from "@/hooks/useEnhancedAuth";

interface Deal {
  id: string;
  title: string;
  description: string;
  image: string;
  originalPrice: number;
  salePrice: number;
  discountPercent: number;
  category: string;
  brand: string;
  validUntil: string;
  isFlashDeal: boolean;
  isFeatured: boolean;
  stock: number;
  sold: number;
  tags: string[];
}

interface FlashSale {
  id: string;
  title: string;
  description: string;
  endsAt: string;
  deals: Deal[];
}

export default function DealsPage() {
  const { user, loading: authLoading } = useEnhancedAuth();
  const router = useRouter();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [flashSales, setFlashSales] = useState<FlashSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("discount");
  const [currentTime, setCurrentTime] = useState(new Date());

  // Redirect sellers to their deals page
  useEffect(() => {
    if (
      !authLoading &&
      user &&
      (user.role === "seller" || user.role === "admin")
    ) {
      router.push("/seller/deals");
      return;
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    // Update time every second for countdown
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const response = await fetch("/api/deals");
        if (response.ok) {
          const data = await response.json();
          setDeals(data.deals || []);
          setFlashSales(data.flashSales || []);
        } else {
          setDeals([]);
          setFlashSales([]);
          setError("Failed to fetch deals");
        }
      } catch (err) {
        console.error("Error fetching deals:", err);
        setError("Error loading deals");
        setDeals([]);
        setFlashSales([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, []);

  const getTimeRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = currentTime;
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return null;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds };
  };

  const categories = Array.from(new Set(deals.map((deal) => deal.category)));

  const filteredAndSortedDeals = deals
    .filter(
      (deal) => selectedCategory === "all" || deal.category === selectedCategory
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "discount":
          return b.discountPercent - a.discountPercent;
        case "price-low":
          return a.salePrice - b.salePrice;
        case "price-high":
          return b.salePrice - a.salePrice;
        case "ending-soon":
          return (
            new Date(a.validUntil).getTime() - new Date(b.validUntil).getTime()
          );
        default:
          return 0;
      }
    });

  const featuredDeals = deals.filter((deal) => deal.isFeatured).slice(0, 3);
  const flashDeals = deals.filter((deal) => deal.isFlashDeal);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Don't render for sellers/admins as they will be redirected
  if (user && (user.role === "seller" || user.role === "admin")) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🔥 Amazing Deals & Offers
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Save big on your favorite products with our exclusive deals and
            limited-time offers
          </p>
        </div>

        {/* Flash Sales Section */}
        {flashDeals.length > 0 && (
          <div className="mb-12">
            <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-lg text-white p-8 mb-6">
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-2">⚡ Flash Sale</h2>
                <p className="text-xl mb-4">
                  Limited time offers - Grab them fast!
                </p>

                {/* Countdown Timer */}
                <div className="flex justify-center space-x-4 mb-6">
                  {(() => {
                    const timeLeft = getTimeRemaining(
                      flashSales[0]?.endsAt || new Date().toISOString()
                    );
                    if (!timeLeft) return <div>Sale Ended</div>;

                    return (
                      <>
                        <div className="bg-white/20 rounded-lg p-3 text-center">
                          <div className="text-2xl font-bold">
                            {timeLeft.days}
                          </div>
                          <div className="text-sm">Days</div>
                        </div>
                        <div className="bg-white/20 rounded-lg p-3 text-center">
                          <div className="text-2xl font-bold">
                            {timeLeft.hours}
                          </div>
                          <div className="text-sm">Hours</div>
                        </div>
                        <div className="bg-white/20 rounded-lg p-3 text-center">
                          <div className="text-2xl font-bold">
                            {timeLeft.minutes}
                          </div>
                          <div className="text-sm">Min</div>
                        </div>
                        <div className="bg-white/20 rounded-lg p-3 text-center">
                          <div className="text-2xl font-bold">
                            {timeLeft.seconds}
                          </div>
                          <div className="text-sm">Sec</div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {flashDeals.map((deal) => (
                <div
                  key={deal.id}
                  className="bg-white rounded-lg shadow-sm border overflow-hidden group hover:shadow-lg transition-shadow"
                >
                  <div className="relative">
                    <img
                      src={deal.image}
                      alt={deal.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute top-2 left-2">
                      <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                        -{deal.discountPercent}%
                      </span>
                    </div>
                    <div className="absolute top-2 right-2">
                      <span className="bg-yellow-400 text-black px-2 py-1 rounded-full text-xs font-bold">
                        FLASH
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {deal.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {deal.description}
                    </p>

                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-2xl font-bold text-primary">
                        ${deal.salePrice}
                      </span>
                      <span className="text-lg text-gray-500 line-through">
                        ${deal.originalPrice}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Sold: {deal.sold}</span>
                        <span>Available: {deal.stock - deal.sold}</span>
                      </div>
                      <div className="bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-red-500 h-2 rounded-full"
                          style={{
                            width: `${(deal.sold / deal.stock) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <button className="w-full bg-red-500 text-white py-2 px-4 rounded-md font-medium transition-colors hover:bg-red-600">
                      Get Deal Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Featured Deals */}
        {featuredDeals.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Featured Deals
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {featuredDeals.map((deal, index) => (
                <div
                  key={deal.id}
                  className={`bg-white rounded-lg shadow-sm border overflow-hidden group hover:shadow-lg transition-shadow ${
                    index === 0 ? "lg:col-span-2 lg:row-span-1" : ""
                  }`}
                >
                  <div className={`relative ${index === 0 ? "lg:flex" : ""}`}>
                    <img
                      src={deal.image}
                      alt={deal.title}
                      className={`object-cover group-hover:scale-105 transition-transform ${
                        index === 0
                          ? "w-full lg:w-1/2 h-48 lg:h-64"
                          : "w-full h-48"
                      }`}
                    />
                    <div className="absolute top-2 left-2">
                      <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                        -{deal.discountPercent}%
                      </span>
                    </div>
                    <div className="absolute top-2 right-2">
                      <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                        FEATURED
                      </span>
                    </div>

                    <div
                      className={`p-6 ${
                        index === 0
                          ? "lg:w-1/2 flex flex-col justify-center"
                          : ""
                      }`}
                    >
                      <h3
                        className={`font-semibold text-gray-900 mb-2 ${
                          index === 0 ? "text-xl lg:text-2xl" : ""
                        }`}
                      >
                        {deal.title}
                      </h3>
                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {deal.description}
                      </p>

                      <div className="flex items-center space-x-2 mb-4">
                        <span
                          className={`font-bold text-primary ${
                            index === 0 ? "text-3xl" : "text-2xl"
                          }`}
                        >
                          ${deal.salePrice}
                        </span>
                        <span
                          className={`text-gray-500 line-through ${
                            index === 0 ? "text-xl" : "text-lg"
                          }`}
                        >
                          ${deal.originalPrice}
                        </span>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {deal.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <button
                        className={`bg-primary text-white px-6 rounded-md font-medium transition-colors hover:bg-primary/90 ${
                          index === 0 ? "py-3 text-lg" : "py-2"
                        }`}
                      >
                        Shop Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters and Sorting */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-4 py-2 rounded-md transition-colors ${
                  selectedCategory === "all"
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All Categories
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    selectedCategory === category
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="discount">Highest Discount</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="ending-soon">Ending Soon</option>
            </select>
          </div>
        </div>

        {/* All Deals Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            All Deals ({filteredAndSortedDeals.length})
          </h2>

          {filteredAndSortedDeals.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No deals found
              </h3>
              <p className="text-gray-600">
                Try selecting a different category
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredAndSortedDeals.map((deal) => (
                <div
                  key={deal.id}
                  className="bg-white rounded-lg shadow-sm border overflow-hidden group hover:shadow-lg transition-shadow"
                >
                  <div className="relative">
                    <img
                      src={deal.image}
                      alt={deal.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute top-2 left-2">
                      <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                        -{deal.discountPercent}%
                      </span>
                    </div>
                    {deal.isFlashDeal && (
                      <div className="absolute top-2 right-2">
                        <span className="bg-yellow-400 text-black px-2 py-1 rounded-full text-xs font-bold">
                          FLASH
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        {deal.brand}
                      </span>
                      <span className="text-xs text-gray-500">
                        {deal.category}
                      </span>
                    </div>

                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {deal.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {deal.description}
                    </p>

                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-xl font-bold text-primary">
                        ${deal.salePrice}
                      </span>
                      <span className="text-sm text-gray-500 line-through">
                        ${deal.originalPrice}
                      </span>
                    </div>

                    {/* Time remaining */}
                    <div className="text-xs text-gray-500 mb-3">
                      Ends: {new Date(deal.validUntil).toLocaleDateString()}
                    </div>

                    <div className="flex space-x-2">
                      <button className="flex-1 bg-primary text-white py-2 px-3 rounded-md text-sm font-medium transition-colors hover:bg-primary/90">
                        Buy Now
                      </button>
                      <button className="px-3 py-2 border border-gray-300 text-gray-700 rounded-md text-sm transition-colors hover:bg-gray-50">
                        <span className="sr-only">Add to wishlist</span>♡
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Newsletter Signup */}
        <div className="bg-gradient-to-r from-primary to-primary/80 rounded-lg text-white p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Never Miss a Deal!</h2>
          <p className="text-lg mb-6">
            Subscribe to get notified about exclusive offers and flash sales
          </p>
          <div className="max-w-md mx-auto flex space-x-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-2 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button className="bg-white text-primary px-6 py-2 rounded-md font-medium transition-colors hover:bg-gray-100">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
