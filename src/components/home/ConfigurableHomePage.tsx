"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ProductCard from "@/components/products/ProductCard";
import BannerCarousel from "@/components/ui/BannerCarousel";

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
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch settings
        const settingsRes = await fetch("/api/settings");
        const settingsData = await settingsRes.json();
        setSettings(settingsData);

        // Mock categories data - in production this would come from database
        const mockCategories: Category[] = [
          {
            id: "1",
            name: "Beyblades",
            slug: "beyblades",
            showOnHomepage: true,
          },
          {
            id: "2",
            name: "Launchers",
            slug: "launchers",
            showOnHomepage: true,
          },
          { id: "3", name: "Stadiums", slug: "stadiums", showOnHomepage: true },
          {
            id: "4",
            name: "Accessories",
            slug: "accessories",
            showOnHomepage: true,
          },
        ];
        setCategories(mockCategories);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch data based on settings
  useEffect(() => {
    const fetchDynamicData = async () => {
      if (!settings?.homePageSections) return;

      try {
        // Find featured products section to get its config
        const featuredSection = settings.homePageSections.find(
          (section) => section.type === "featured-products" && section.enabled
        );

        if (featuredSection) {
          const type = featuredSection.content?.type || "most-visited";
          const limit = featuredSection.content?.limit || 8;

          const productsRes = await fetch(
            `/api/products/featured?type=${type}&limit=${limit}`
          );
          const productsData = await productsRes.json();
          setFeaturedProducts(productsData.products || []);
        }

        // Find auctions section to get its config
        const auctionsSection = settings.homePageSections.find(
          (section) => section.type === "auctions" && section.enabled
        );

        if (auctionsSection) {
          const showLive = auctionsSection.content?.showLive !== false;
          const showClosed = auctionsSection.content?.showClosed !== false;
          const limit = auctionsSection.content?.limit || 3;

          const auctionsRes = await fetch(
            `/api/auctions/featured?live=${showLive}&closed=${showClosed}&limit=${limit}`
          );
          const auctionsData = await auctionsRes.json();
          setAuctions(auctionsData.auctions || []);
        }
      } catch (error) {
        console.error("Failed to fetch dynamic data:", error);
      }
    };

    fetchDynamicData();
  }, [settings]);

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
    ];

    return (
      <section
        key={section.id}
        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
      >
        <div className="container py-20 md:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            {/* Main Banner */}
            <div className="lg:col-span-2">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                {mainBanner?.title || "Discover Premium Hobby Products"}
              </h1>
              <p className="text-lg md:text-xl mb-8 text-blue-100">
                {mainBanner?.subtitle ||
                  "Your one-stop shop for authentic Beyblades, collectibles, and premium hobby items"}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href={mainBanner?.shopButton?.link || "/products"}
                  className="btn bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg"
                >
                  {mainBanner?.shopButton?.text || "Shop Now"}
                </Link>
                <Link
                  href={mainBanner?.auctionButton?.link || "/auctions"}
                  className="btn bg-transparent border-2 border-white hover:bg-white/10 px-8 py-3 text-lg"
                >
                  {mainBanner?.auctionButton?.text || "View Auctions"}
                </Link>
                <Link
                  href="/stores"
                  className="btn bg-transparent border-2 border-white hover:bg-white/10 px-8 py-3 text-lg"
                >
                  Browse Stores
                </Link>
              </div>
            </div>

            {/* Side Banner Carousel */}
            <div className="lg:col-span-1">
              <BannerCarousel
                items={sideCarouselItems}
                className="h-full"
                autoPlay={sideBanner?.carousel !== false}
              />
            </div>
          </div>
        </div>
      </section>
    );
  };

  const renderFeaturesSection = (section: HomePageSection) => {
    return (
      <section key={section.id} className="py-12 bg-gray-50 border-b">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Authentic Products</h3>
              <p className="text-sm text-muted-foreground">
                100% genuine products guaranteed
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Secure Payments</h3>
              <p className="text-sm text-muted-foreground">
                Safe & encrypted transactions
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Fast Shipping</h3>
              <p className="text-sm text-muted-foreground">
                Quick delivery across India
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">24/7 Support</h3>
              <p className="text-sm text-muted-foreground">
                Always here to help you
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  };

  const renderCategoriesSection = (section: HomePageSection) => {
    const showCategories = categories.filter((cat) =>
      section.content.showOnHomepage?.includes(cat.slug)
    );

    return (
      <section key={section.id} className="py-16">
        <div className="container">
          <h2 className="text-3xl font-bold mb-8 text-center">
            {section.title}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {showCategories.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="card p-8 text-center hover:shadow-lg transition-shadow group"
              >
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <svg
                    className="w-8 h-8 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold group-hover:text-primary transition-colors">
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
    const limit = section.content.limit || 8;
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
        default:
          return "Handpicked items just for you";
      }
    };

    return (
      <section key={section.id} className="py-16">
        <div className="container">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">{section.title}</h2>
              <p className="text-muted-foreground">{getSubtitle()}</p>
            </div>
            <Link href="/products" className="btn btn-outline">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        </div>
      </section>
    );
  };

  const renderAuctionsSection = (section: HomePageSection) => {
    const { showLive = true, showClosed = true, limit = 3 } = section.content;
    let displayAuctions = auctions;

    if (showLive && !showClosed) {
      displayAuctions = auctions.filter((auction) => auction.isLive);
    } else if (!showLive && showClosed) {
      displayAuctions = auctions.filter((auction) => !auction.isLive);
    }

    // Sort by most bids and mix live/closed
    displayAuctions = displayAuctions
      .sort((a, b) => b.totalBids - a.totalBids)
      .slice(0, limit);

    return (
      <section
        key={section.id}
        className="py-16 bg-gradient-to-r from-purple-600 to-pink-600 text-white"
      >
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {section.title}
            </h2>
            <p className="text-lg text-purple-100 max-w-2xl mx-auto">
              Hot auctions with the most bids - don't miss out on amazing deals!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {displayAuctions.map((auction) => (
              <div
                key={auction.id}
                className="bg-white/10 backdrop-blur-sm rounded-lg p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      auction.isLive
                        ? "bg-green-500 text-white"
                        : "bg-gray-500 text-white"
                    }`}
                  >
                    {auction.isLive ? "🔴 Live" : "Closed"}
                  </span>
                  <span className="text-sm text-purple-100">
                    {auction.totalBids} bids
                  </span>
                </div>
                <h3 className="font-semibold mb-2">{auction.title}</h3>
                <p className="text-2xl font-bold mb-4">₹{auction.currentBid}</p>
                <Link
                  href={`/auctions/${auction.id}`}
                  className="btn bg-white text-purple-600 hover:bg-gray-100 w-full"
                >
                  {auction.isLive ? "Place Bid" : "View Details"}
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/auctions"
              className="btn bg-white text-purple-600 hover:bg-gray-100 px-8 py-3 text-lg"
            >
              Browse All Auctions
            </Link>
          </div>
        </div>
      </section>
    );
  };

  const renderNewsletterSection = (section: HomePageSection) => {
    return (
      <section key={section.id} className="py-16 bg-gray-50">
        <div className="container max-w-2xl text-center">
          <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
          <p className="text-muted-foreground mb-8">
            Subscribe to our newsletter for exclusive deals, new arrivals, and
            auction updates.
          </p>
          <form className="flex flex-col sm:flex-row gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="input flex-1"
            />
            <button type="submit" className="btn btn-primary px-8">
              Subscribe
            </button>
          </form>
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
      case "categories":
        return renderCategoriesSection(section);
      case "featured-products":
        return renderFeaturedProductsSection(section);
      case "auctions":
        return renderAuctionsSection(section);
      case "newsletter":
        return renderNewsletterSection(section);
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!settings) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <p>Failed to load page settings</p>
      </main>
    );
  }

  // Sort sections by order and move newsletter to bottom
  const sortedSections = [...settings.homePageSections].sort((a, b) => {
    if (a.type === "newsletter") return 1;
    if (b.type === "newsletter") return -1;
    return a.order - b.order;
  });

  return <main className="flex-1">{sortedSections.map(renderSection)}</main>;
}
