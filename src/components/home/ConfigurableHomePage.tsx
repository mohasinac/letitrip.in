"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Zap,
  Target,
  Circle,
  Wrench,
  Gem,
  Trophy,
  CheckCircle,
  Shield,
  Rocket,
  MessageCircle,
  Eye,
  Heart,
  Sparkles,
  Star,
  ArrowRight,
  Calendar,
  Users,
  Award,
  Package2,
  ArrowDown,
  RefreshCw,
  Mail,
  User,
} from "lucide-react";
import ProductCard from "@/components/products/ProductCard";
import BannerCarousel from "@/components/ui/BannerCarousel";
import ProductCarousel from "@/components/ui/ProductCarousel";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import QuickViewModal from "@/components/ui/QuickViewModal";

interface SiteSettings {
  homePageSections: HomePageSection[];
  [key: string]: any;
}

interface HomePageSection {
  id: string;
  type: string;
  title: string;
  enabled: boolean;
  order: number;
  content: any;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  isFeatured?: boolean;
  views?: number;
  wishlisted?: number;
}

interface Auction {
  id: string;
  title: string;
  currentBid: number;
  endTime: string;
  image: string;
  isLive: boolean;
  totalBids: number;
}

interface Review {
  id: string;
  name: string;
  text: string;
  rating: number;
  avatar: string;
}

interface SaleCarouselItem {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  button: {
    text: string;
    link: string;
  };
  sortOrder: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  showOnHomepage?: boolean;
}

export default function ConfigurableHomePage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [saleProducts, setSaleProducts] = useState<Product[]>([]);
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [productsLoading, setProductsLoading] = useState(false);
  const [auctionsLoading, setAuctionsLoading] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(
    null
  );
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  // Newsletter section state
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch settings
        const settingsRes = await fetch("/api/settings");
        if (!settingsRes.ok) {
          throw new Error("Failed to fetch settings");
        }
        const settingsData = await settingsRes.json();
        setSettings(settingsData);

        // Fetch dynamic categories
        const categoriesRes = await fetch("/api/categories");
        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          setCategories(categoriesData.categories || []);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setError("Failed to load page data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Enhanced data fetching with loading states
  useEffect(() => {
    const fetchDynamicData = async () => {
      if (!settings?.homePageSections) return;

      try {
        // Find sale carousel section and fetch products for each item
        const saleCarouselSection = settings.homePageSections.find(
          (section) => section.type === "sale-carousel" && section.enabled
        );

        if (saleCarouselSection) {
          setProductsLoading(true);

          // Fetch products for sale items
          const saleRes = await fetch(
            "/api/products/featured?type=sale&limit=6"
          );
          if (saleRes.ok) {
            const saleData = await saleRes.json();
            setSaleProducts(saleData.products || []);
          }

          // Fetch new products
          const newRes = await fetch(
            "/api/products/featured?type=newest&limit=6"
          );
          if (newRes.ok) {
            const newData = await newRes.json();
            setNewProducts(newData.products || []);
          }

          // Fetch popular products
          const popularRes = await fetch(
            "/api/products/featured?type=most-visited&limit=6"
          );
          if (popularRes.ok) {
            const popularData = await popularRes.json();
            setPopularProducts(popularData.products || []);
          }
        }

        // Find featured products section to get its config
        const featuredSection = settings.homePageSections.find(
          (section) => section.type === "featured-products" && section.enabled
        );

        if (featuredSection) {
          const type = featuredSection.content?.type || "most-visited";
          const limit = featuredSection.content?.limit || 6;

          const productsRes = await fetch(
            `/api/products/featured?type=${type}&limit=${limit}`
          );
          if (productsRes.ok) {
            const productsData = await productsRes.json();
            setFeaturedProducts(productsData.products || []);
          }
          setProductsLoading(false);
        }

        // Find auctions section to get its config
        const auctionsSection = settings.homePageSections.find(
          (section) => section.type === "auctions" && section.enabled
        );

        if (auctionsSection) {
          setAuctionsLoading(true);
          const showLive = auctionsSection.content?.showLive !== false;
          const showClosed = auctionsSection.content?.showClosed !== false;
          const limit = auctionsSection.content?.limit || 6;

          const auctionsRes = await fetch(
            `/api/auctions/featured?live=${showLive}&closed=${showClosed}&limit=${limit}`
          );
          if (auctionsRes.ok) {
            const auctionsData = await auctionsRes.json();
            setAuctions(auctionsData.auctions || []);
          }
          setAuctionsLoading(false);
        }
      } catch (error) {
        console.error("Failed to fetch dynamic data:", error);
        setProductsLoading(false);
        setAuctionsLoading(false);
      }
    };

    fetchDynamicData();
  }, [settings]);

  // Memoize expensive computations
  const timeBasedGreeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 6)
      return {
        greeting: "🌙 Late night shopping?",
        color: "from-indigo-900 to-purple-900",
      };
    if (hour < 12)
      return {
        greeting: "🌅 Good morning!",
        color: "from-orange-400 to-pink-400",
      };
    if (hour < 17)
      return {
        greeting: "☀️ Good afternoon!",
        color: "from-blue-400 to-cyan-400",
      };
    if (hour < 21)
      return {
        greeting: "🌆 Good evening!",
        color: "from-purple-400 to-pink-400",
      };
    return {
      greeting: "🌃 Good night!",
      color: "from-indigo-600 to-purple-600",
    };
  }, []);

  const renderHeroSection = (section: HomePageSection) => {
    const { mainBanner, sideBanner } = section.content;

    const sideCarouselItems = [
      {
        id: "sale-1",
        title: sideBanner?.title || "Special Sales & Events",
        subtitle: sideBanner?.subtitle || "Don't miss out on exclusive deals",
        image: "/images/sale-banner-1.jpg",
        button: sideBanner?.button || {
          text: "View Sale Items",
          link: "/deals",
        },
      },
      {
        id: "sale-2",
        title: "Flash Sale",
        subtitle: "Up to 50% off selected items",
        image: "/images/sale-banner-2.jpg",
        button: { text: "Shop Sale", link: "/deals" },
      },
      {
        id: "sale-3",
        title: "New Arrivals",
        subtitle: "Latest Beyblade releases",
        image: "/images/sale-banner-3.jpg",
        button: { text: "Explore New", link: "/products?filter=newest" },
      },
    ];

    return (
      <section
        key={section.id}
        className={`bg-gradient-to-r ${timeBasedGreeting.color} text-white relative overflow-hidden`}
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <div className="container py-20 md:py-32 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            {/* Main Banner */}
            <div className="lg:col-span-2">
              <div className="inline-block mb-4 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium animate-pulse">
                {timeBasedGreeting.greeting} Premium Quality Guaranteed
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                {mainBanner?.title || "Discover Premium Hobby Products"}
              </h1>
              <p className="text-lg md:text-xl mb-8 text-blue-100 leading-relaxed">
                {mainBanner?.subtitle ||
                  "Your one-stop shop for authentic Beyblades, collectibles, and premium hobby items"}
              </p>

              {/* Stats */}
              <div className="flex flex-wrap gap-6 mb-8">
                <div className="text-center">
                  <div className="text-2xl font-bold">1000+</div>
                  <div className="text-sm text-blue-200">Products</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">50+</div>
                  <div className="text-sm text-blue-200">Live Auctions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">5000+</div>
                  <div className="text-sm text-blue-200">Happy Customers</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href={mainBanner?.shopButton?.link || "/products"}
                  className="btn bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg transition-all duration-300 hover:shadow-lg hover:scale-105"
                >
                  {mainBanner?.shopButton?.text || "Shop Now"} &rarr;
                </Link>
                <Link
                  href={mainBanner?.auctionButton?.link || "/auctions"}
                  className="btn bg-transparent border-2 border-white hover:bg-white/10 px-8 py-3 text-lg transition-all duration-300 hover:shadow-lg"
                >
                  {mainBanner?.auctionButton?.text || "View Auctions"} 🔥
                </Link>
                <Link
                  href="/stores"
                  className="btn bg-transparent border-2 border-white hover:bg-white/10 px-8 py-3 text-lg transition-all duration-300 hover:shadow-lg"
                >
                  Browse Stores 🏪
                </Link>
              </div>
            </div>

            {/* Side Banner Carousel removed as requested */}
          </div>
        </div>
      </section>
    );
  };

  const renderSaleCarouselSection = (section: HomePageSection) => {
    const items = section.content.items || [];

    return (
      <section
        key={section.id}
        className="py-16 bg-gradient-to-br from-orange-50 via-red-50 to-pink-50"
      >
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">🔥 {section.title}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Don't miss out on our amazing deals and latest arrivals
            </p>
          </div>

          {/* Sale Products Carousel */}
          {saleProducts.length > 0 && (
            <div className="mb-12">
              <h3 className="text-2xl font-bold mb-6 text-center">
                🏷️ Hot Sale Items
              </h3>
              <ProductCarousel
                products={saleProducts}
                displayCount={3}
                autoPlay={true}
                interval={3000}
                onQuickView={(productData) => {
                  setQuickViewProduct(productData as Product);
                  setIsQuickViewOpen(true);
                }}
              />
            </div>
          )}

          {/* Category Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((item: SaleCarouselItem) => (
              <Link
                key={item.id}
                href={item.button.link}
                className="group block transform transition-all duration-300 hover:scale-105"
              >
                {/* Banner Card */}
                <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg p-8 overflow-hidden shadow-lg group-hover:shadow-xl">
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute -top-4 -right-4 w-24 h-24 bg-white rounded-full"></div>
                    <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white rounded-full"></div>
                  </div>

                  <div className="relative z-10">
                    <div className="text-4xl mb-4">
                      {item.sortOrder === "sale" ||
                      item.sortOrder === "price_asc"
                        ? "🏷️"
                        : item.sortOrder === "newest"
                        ? "✨"
                        : item.sortOrder === "popularity"
                        ? "🔥"
                        : "⭐"}
                    </div>
                    <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                    <p className="text-purple-100 mb-6 text-lg">
                      {item.subtitle}
                    </p>

                    <div className="inline-flex items-center bg-white text-purple-600 hover:bg-gray-100 px-6 py-3 rounded-lg font-semibold transition-colors group-hover:bg-gray-50">
                      {item.button.text}
                      <svg
                        className="ml-2 w-5 h-5 transform group-hover:translate-x-1 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 8l4 4m0 0l-4 4m4-4H3"
                        />
                      </svg>
                    </div>

                    {/* Category Tag */}
                    <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full">
                      {item.sortOrder === "sale" ||
                      item.sortOrder === "price_asc"
                        ? "Sale"
                        : item.sortOrder === "newest"
                        ? "New"
                        : item.sortOrder === "popularity"
                        ? "Popular"
                        : "Featured"}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Additional Call to Action */}
          <div className="text-center mt-12">
            <Link
              href="/products"
              className="inline-flex items-center bg-white text-gray-800 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:transform hover:scale-105"
            >
              Browse All Products
              <svg
                className="ml-2 w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    );
  };

  const renderFeaturesSection = (section: HomePageSection) => {
    const features = [
      {
        icon: <CheckCircle className="w-8 h-8" />,
        title: "Authentic Products",
        description: "100% genuine products guaranteed",
        color: "bg-green-500",
      },
      {
        icon: <Shield className="w-8 h-8" />,
        title: "Secure Payments",
        description: "Safe & encrypted transactions",
        color: "bg-blue-500",
      },
      {
        icon: <Rocket className="w-8 h-8" />,
        title: "Fast Shipping",
        description: "Quick delivery across India",
        color: "bg-purple-500",
      },
      {
        icon: <MessageCircle className="w-8 h-8" />,
        title: "24/7 Support",
        description: "Always here to help you",
        color: "bg-orange-500",
      },
    ];

    return (
      <section
        key={section.id}
        className="py-16 bg-gradient-to-b from-gray-50 to-white"
      >
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose JustForView?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We're committed to providing the best shopping experience for
              hobby enthusiasts
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="text-center group hover:transform hover:scale-105 transition-all duration-300"
              >
                <div
                  className={`w-16 h-16 ${feature.color} rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-shadow text-white`}
                >
                  {feature.icon}
                </div>
                <h3 className="font-semibold mb-2 text-lg">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  const renderCategoriesSection = (section: HomePageSection) => {
    const showCategories = categories.filter((cat) =>
      section.content.showOnHomepage?.includes(cat.slug)
    );

    // Icon mapping for categories
    const getCategoryIcon = (category: Category) => {
      const iconMap: { [key: string]: JSX.Element } = {
        beyblades: <Zap className="w-8 h-8 text-purple-500" />,
        launchers: <Target className="w-8 h-8 text-blue-500" />,
        stadiums: <Circle className="w-8 h-8 text-green-500" />,
        accessories: <Wrench className="w-8 h-8 text-orange-500" />,
        "limited-edition": <Gem className="w-8 h-8 text-pink-500" />,
        tournament: <Trophy className="w-8 h-8 text-yellow-500" />,
      };
      return (
        iconMap[category.slug] || <Package2 className="w-8 h-8 text-gray-500" />
      );
    };

    return (
      <section key={section.id} className="py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{section.title}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore our wide range of categories to find exactly what you're
              looking for
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {showCategories.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="card p-6 text-center hover:shadow-lg transition-all duration-300 group hover:transform hover:scale-105"
              >
                <div className="mb-4 group-hover:animate-bounce flex justify-center">
                  {getCategoryIcon(category)}
                </div>
                <h3 className="font-semibold group-hover:text-primary transition-colors text-sm">
                  {category.name}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>
    );
  };

  const renderFeaturedProductsSection = (section: HomePageSection) => {
    const limit = 6; // Always fetch 6 products
    const displayCount = 3; // Always display 3 at a time
    const type = section.content.type || "most-visited";
    const displayProducts = featuredProducts.slice(0, limit);

    const getSubtitle = () => {
      switch (type) {
        case "most-visited":
          return "Most viewed products by our customers";
        case "wishlisted":
          return "Most wishlisted items currently in stock";
        case "newest":
          return "Latest arrivals in our collection";
        case "admin-selected":
          return "Handpicked products by our experts";
        default:
          return "Handpicked items just for you";
      }
    };

    const getTypeIcon = () => {
      switch (type) {
        case "most-visited":
          return <Eye className="w-6 h-6 inline-block mr-2 text-blue-500" />;
        case "wishlisted":
          return <Heart className="w-6 h-6 inline-block mr-2 text-red-500" />;
        case "newest":
          return (
            <Sparkles className="w-6 h-6 inline-block mr-2 text-purple-500" />
          );
        case "admin-selected":
          return <Star className="w-6 h-6 inline-block mr-2 text-yellow-500" />;
        default:
          return <Star className="w-6 h-6 inline-block mr-2 text-yellow-500" />;
      }
    };

    return (
      <section key={section.id} className="py-16 bg-gray-50">
        <div className="container">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-2 flex items-center justify-center lg:justify-start">
                {getTypeIcon()} {section.title}
              </h2>
              <p className="text-muted-foreground">{getSubtitle()}</p>
            </div>
            <Link
              href="/products"
              className="btn btn-outline hover:transform hover:scale-105 transition-all duration-300 flex items-center"
            >
              View All <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>

          {productsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <LoadingSkeleton variant="product" count={3} />
            </div>
          ) : displayProducts.length > 0 ? (
            <ProductCarousel
              products={displayProducts}
              displayCount={displayCount}
              autoPlay={true}
              interval={4000}
              onQuickView={(productData) => {
                setQuickViewProduct(productData as Product);
                setIsQuickViewOpen(true);
              }}
            />
          ) : (
            <div className="text-center py-12">
              <Package2 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold mb-2">
                No products available
              </h3>
              <p className="text-muted-foreground">
                Check back later for featured products.
              </p>
            </div>
          )}
        </div>
      </section>
    );
  };

  const renderAuctionsSection = (section: HomePageSection) => {
    const {
      showLive = true,
      showClosed = true,
      limit = 6,
      displayCount = 3,
    } = section.content;
    let displayAuctions = auctions;

    if (showLive && !showClosed) {
      displayAuctions = auctions.filter((auction) => auction.isLive);
    } else if (!showLive && showClosed) {
      displayAuctions = auctions.filter((auction) => !auction.isLive);
    }

    displayAuctions = displayAuctions
      .sort((a, b) => b.totalBids - a.totalBids)
      .slice(0, 6); // Always fetch 6, display 3 at a time

    return (
      <section
        key={section.id}
        className="py-16 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white relative overflow-hidden"
      >
        {/* Animated background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-40 h-40 bg-white rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-60 h-60 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
        </div>

        <div className="container relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              🔥 {section.title}
            </h2>
            <p className="text-lg text-purple-100 max-w-2xl mx-auto">
              Hot auctions with the most bids - don't miss out on amazing deals!
            </p>
          </div>

          {auctionsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <LoadingSkeleton variant="auction" count={3} />
            </div>
          ) : displayAuctions.length > 0 ? (
            <div className="mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {displayAuctions.slice(0, 3).map((auction, index) => (
                  <div
                    key={auction.id}
                    className="bg-white/10 backdrop-blur-sm rounded-lg p-6 hover:bg-white/20 transition-all duration-300 hover:transform hover:scale-105"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          auction.isLive
                            ? "bg-green-500 text-white animate-pulse"
                            : "bg-gray-500 text-white"
                        }`}
                      >
                        {auction.isLive ? "🔴 Live" : "⏹️ Closed"}
                      </span>
                      <span className="text-sm text-purple-100">
                        🔥 {auction.totalBids} bids
                      </span>
                    </div>
                    <h3 className="font-semibold mb-2 line-clamp-2 text-white">
                      {auction.title}
                    </h3>
                    <p className="text-2xl font-bold mb-4 text-white">
                      ₹{auction.currentBid.toLocaleString()}
                    </p>
                    <Link
                      href={`/auctions/${auction.id}`}
                      className="btn bg-white text-purple-600 hover:bg-gray-100 w-full transition-all duration-300 hover:shadow-lg"
                    >
                      {auction.isLive ? "Place Bid 🎯" : "View Details 👀"}
                    </Link>
                  </div>
                ))}
              </div>

              {/* Rotation Animation */}
              {displayAuctions.length > 3 && (
                <div className="text-center mt-6">
                  <p className="text-purple-100 text-sm">
                    🔄 Showing 3 of {displayAuctions.length} hot auctions •
                    Rotating automatically
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <Circle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold mb-2">
                No auctions available
              </h3>
              <p className="text-purple-100">
                Check back later for exciting auctions.
              </p>
            </div>
          )}

          <div className="text-center">
            <Link
              href="/auctions"
              className="btn bg-white text-purple-600 hover:bg-gray-100 px-8 py-3 text-lg transition-all duration-300 hover:shadow-lg hover:transform hover:scale-105"
            >
              Browse All Auctions 🚀
            </Link>
          </div>
        </div>
      </section>
    );
  };

  // Newsletter section handler
  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubscribing(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubscribing(false);
      setSubscribed(true);
      setEmail("");
    }, 1500);
  };

  const renderNewsletterReviewsSection = (section: HomePageSection) => {
    const {
      showReviews = true,
      showNewsletter = true,
      reviews = [],
    } = section.content;

    return (
      <section
        key={section.id}
        className="py-16 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50"
      >
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Reviews Section */}
            {showReviews && (
              <div>
                <div className="text-center lg:text-left mb-8">
                  <h2 className="text-3xl font-bold mb-4">
                    💬 See What Others Say About Us
                  </h2>
                  <p className="text-muted-foreground text-lg">
                    Join thousands of satisfied customers who trust us for their
                    hobby needs
                  </p>
                </div>

                <div className="space-y-6">
                  {reviews.map((review: Review) => (
                    <div
                      key={review.id}
                      className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
                    >
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold">
                          {review.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-semibold">{review.name}</h4>
                            <div className="flex text-yellow-400">
                              {Array.from({ length: review.rating }, (_, i) => (
                                <span key={i}>⭐</span>
                              ))}
                            </div>
                          </div>
                          <p className="text-muted-foreground italic">
                            "{review.text}"
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-center lg:text-left mt-8">
                  <Link
                    href="/reviews"
                    className="btn btn-outline hover:transform hover:scale-105 transition-all duration-300"
                  >
                    Read More Reviews 📖
                  </Link>
                </div>
              </div>
            )}

            {/* Newsletter Section */}
            {showNewsletter && (
              <div>
                <div className="text-center lg:text-left mb-8">
                  <Mail className="w-16 h-16 mb-6 mx-auto lg:mx-0 text-purple-500" />
                  <h2 className="text-3xl font-bold mb-4">Stay Updated!</h2>
                  <p className="text-muted-foreground text-lg mb-6">
                    Subscribe to our newsletter for exclusive deals, new
                    arrivals, auction updates, and hobby tips.
                  </p>
                </div>

                {subscribed ? (
                  <div className="bg-green-100 text-green-800 p-6 rounded-lg">
                    <div className="text-4xl mb-2">🎉</div>
                    <h3 className="font-bold text-lg mb-2">
                      Welcome to the family!
                    </h3>
                    <p>
                      You'll receive our latest updates and exclusive offers.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubscribe} className="space-y-4">
                    <input
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input w-full text-lg py-3"
                      required
                    />
                    <button
                      type="submit"
                      disabled={isSubscribing}
                      className="btn btn-primary w-full py-3 text-lg disabled:opacity-50 transition-all duration-300 hover:transform hover:scale-105 flex items-center justify-center"
                    >
                      {isSubscribing ? (
                        "Subscribing..."
                      ) : (
                        <>
                          Subscribe Now <Rocket className="ml-2 w-5 h-5" />
                        </>
                      )}
                    </button>
                  </form>
                )}

                <p className="text-sm text-muted-foreground mt-4 text-center lg:text-left">
                  No spam, unsubscribe at any time. We respect your privacy.
                </p>

                <div className="mt-8 p-6 bg-white rounded-lg shadow-lg">
                  <h3 className="font-bold text-lg mb-4">
                    💡 Ready to Join Us?
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Create an account and start your hobby journey with
                    exclusive member benefits!
                  </p>
                  <Link
                    href="/auth/register"
                    className="btn btn-secondary w-full transition-all duration-300 hover:transform hover:scale-105"
                  >
                    Register Now 🎯
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    );
  };

  const renderSection = (section: HomePageSection) => {
    if (!section.enabled) return null;

    switch (section.type) {
      case "hero":
        return renderHeroSection(section);
      case "features":
        return renderFeaturesSection(section);
      case "sale-carousel":
        return renderSaleCarouselSection(section);
      case "categories":
        return renderCategoriesSection(section);
      case "featured-products":
        return renderFeaturedProductsSection(section);
      case "auctions":
        return renderAuctionsSection(section);
      case "newsletter":
      case "newsletter-reviews":
        return renderNewsletterReviewsSection(section);
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
          <p className="text-lg font-medium text-muted-foreground">
            Loading amazing content...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-r from-red-50 to-pink-50">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold mb-4">
            Oops! Something went wrong
          </h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-primary"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  if (!settings) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚙️</div>
          <p className="text-lg">Failed to load page settings</p>
        </div>
      </main>
    );
  }

  // Sort sections by order and move newsletter to bottom
  const sortedSections = [...settings.homePageSections].sort((a, b) => {
    if (a.type === "newsletter") return 1;
    if (b.type === "newsletter") return -1;
    return a.order - b.order;
  });

  return (
    <>
      <main className="flex-1">{sortedSections.map(renderSection)}</main>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={isQuickViewOpen}
        onClose={() => {
          setIsQuickViewOpen(false);
          setQuickViewProduct(null);
        }}
      />
    </>
  );
}
