/**
 * Admin Site Settings & CMS
 *
 * Comprehensive content management system for all public pages and static content
 * RBAC: Only accessible to admin users
 *
 * @page /admin/site-settings - Site settings and CMS page
 */

"use client";

import { useState } from "react";

interface HomeHeroSection {
  id: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  backgroundImage: string;
  active: boolean;
}

interface CarouselSlide {
  id: string;
  title: string;
  description: string;
  image: string;
  link: string;
  order: number;
  active: boolean;
}

interface AdBanner {
  id: string;
  title: string;
  image: string;
  link: string;
  position: "top" | "sidebar" | "bottom" | "popup";
  startDate: Date;
  endDate: Date;
  active: boolean;
}

interface ThemeSettings {
  primaryColor: string;
  secondaryColor: string;
  navbarBg: string;
  navbarText: string;
  footerBg: string;
  footerText: string;
  bodyBg: string;
  cardBg: string;
  buttonRadius: string;
  fontFamily: string;
}

interface FeaturedSection {
  id: string;
  title: string;
  type: "products" | "auctions" | "shops" | "categories";
  itemIds: string[];
  displayCount: number;
  layout: "grid" | "carousel" | "list";
  order: number;
  active: boolean;
}

export default function AdminSiteSettingsPage() {
  const [activeTab, setActiveTab] = useState<
    "homepage" | "theme" | "navigation" | "banners" | "featured" | "pages"
  >("homepage");

  // Mock data - in production, fetch from API
  const [heroSections, setHeroSections] = useState<HomeHeroSection[]>([
    {
      id: "1",
      title: "Welcome to Let It Rip",
      subtitle: "India's Premier Auction & E-Commerce Platform",
      ctaText: "Shop Now",
      ctaLink: "/products",
      backgroundImage: "/hero-bg.jpg",
      active: true,
    },
  ]);

  const [carouselSlides, setCarouselSlides] = useState<CarouselSlide[]>([
    {
      id: "1",
      title: "Summer Sale",
      description: "Up to 50% off on selected items",
      image: "/carousel-1.jpg",
      link: "/deals",
      order: 1,
      active: true,
    },
  ]);

  const [adBanners, setAdBanners] = useState<AdBanner[]>([
    {
      id: "1",
      title: "New Year Sale",
      image: "/banner-1.jpg",
      link: "/deals",
      position: "top",
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      active: true,
    },
  ]);

  const [themeSettings, setThemeSettings] = useState<ThemeSettings>({
    primaryColor: "#3B82F6",
    secondaryColor: "#8B5CF6",
    navbarBg: "#FFFFFF",
    navbarText: "#1F2937",
    footerBg: "#111827",
    footerText: "#F3F4F6",
    bodyBg: "#F9FAFB",
    cardBg: "#FFFFFF",
    buttonRadius: "0.5rem",
    fontFamily: "Inter",
  });

  const [featuredSections, setFeaturedSections] = useState<FeaturedSection[]>([
    {
      id: "1",
      title: "Featured Products",
      type: "products",
      itemIds: [],
      displayCount: 8,
      layout: "grid",
      order: 1,
      active: true,
    },
  ]);

  const [editingHero, setEditingHero] = useState<HomeHeroSection | null>(null);
  const [editingCarousel, setEditingCarousel] = useState<CarouselSlide | null>(
    null,
  );
  const [editingBanner, setEditingBanner] = useState<AdBanner | null>(null);
  const [editingFeatured, setEditingFeatured] =
    useState<FeaturedSection | null>(null);

  const tabs = [
    { id: "homepage", label: "🏠 Homepage", icon: "🏠" },
    { id: "theme", label: "🎨 Theme & Colors", icon: "🎨" },
    { id: "navigation", label: "🧭 Navigation", icon: "🧭" },
    { id: "banners", label: "📢 Ad Banners", icon: "📢" },
    { id: "featured", label: "⭐ Featured Sections", icon: "⭐" },
    { id: "pages", label: "📄 Page Content", icon: "📄" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Site Settings & CMS
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage all public pages, content, themes, and site settings
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <button className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition text-left">
            <div className="text-2xl mb-2">👁️</div>
            <div className="font-semibold text-gray-900 dark:text-white">
              Preview Site
            </div>
            <div className="text-sm text-gray-500">View changes</div>
          </button>
          <button className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition text-left">
            <div className="text-2xl mb-2">💾</div>
            <div className="font-semibold text-gray-900 dark:text-white">
              Save All
            </div>
            <div className="text-sm text-gray-500">Save all changes</div>
          </button>
          <button className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition text-left">
            <div className="text-2xl mb-2">🔄</div>
            <div className="font-semibold text-gray-900 dark:text-white">
              Revert Changes
            </div>
            <div className="text-sm text-gray-500">Undo unsaved</div>
          </button>
          <button className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition text-left">
            <div className="text-2xl mb-2">📱</div>
            <div className="font-semibold text-gray-900 dark:text-white">
              Mobile Preview
            </div>
            <div className="text-sm text-gray-500">Check mobile</div>
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          <nav className="flex gap-4 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-4 px-2 border-b-2 font-medium transition whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Homepage Settings */}
        {activeTab === "homepage" && (
          <div className="space-y-8">
            {/* Hero Section */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Hero Section
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Main banner at the top of homepage
                  </p>
                </div>
                <button
                  onClick={() =>
                    setEditingHero({
                      id: "new",
                      title: "",
                      subtitle: "",
                      ctaText: "",
                      ctaLink: "",
                      backgroundImage: "",
                      active: true,
                    })
                  }
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
                >
                  + Add Hero Section
                </button>
              </div>

              <div className="grid gap-4">
                {heroSections.map((hero) => (
                  <div
                    key={hero.id}
                    className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex gap-6">
                      <div className="w-48 h-32 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                        {hero.backgroundImage ? (
                          <img
                            src={hero.backgroundImage}
                            alt="Hero background"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-gray-400">No image</span>
                        )}
                      </div>
                      <div className="flex-grow">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                          {hero.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-3">
                          {hero.subtitle}
                        </p>
                        <div className="flex gap-2 text-sm">
                          <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full">
                            CTA: {hero.ctaText}
                          </span>
                          <span
                            className={`px-3 py-1 rounded-full ${
                              hero.active
                                ? "bg-green-50 text-green-600"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {hero.active ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => setEditingHero(hero)}
                          className="px-4 py-2 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition"
                        >
                          Edit
                        </button>
                        <button className="px-4 py-2 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100 transition">
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Carousel */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Homepage Carousel
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Rotating slides below hero section
                  </p>
                </div>
                <button
                  onClick={() =>
                    setEditingCarousel({
                      id: "new",
                      title: "",
                      description: "",
                      image: "",
                      link: "",
                      order: carouselSlides.length + 1,
                      active: true,
                    })
                  }
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
                >
                  + Add Slide
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {carouselSlides.map((slide) => (
                  <div
                    key={slide.id}
                    className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700"
                  >
                    <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                      {slide.image ? (
                        <img
                          src={slide.image}
                          alt={slide.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-400">No image</span>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {slide.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {slide.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        Order: {slide.order}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingCarousel(slide)}
                          className="px-3 py-1 text-xs bg-blue-50 text-blue-600 rounded"
                        >
                          Edit
                        </button>
                        <button className="px-3 py-1 text-xs bg-red-50 text-red-600 rounded">
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* About Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                About Section
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Section Title
                  </label>
                  <input
                    type="text"
                    defaultValue="Why Choose Let It Rip?"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    defaultValue="India's premier marketplace for auctions and e-commerce"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Stats Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Statistics Display
              </h2>
              <div className="grid md:grid-cols-4 gap-4">
                {[
                  { label: "Active Users", value: "100K+", icon: "👥" },
                  { label: "Products", value: "50K+", icon: "📦" },
                  { label: "Sales", value: "1M+", icon: "✅" },
                  { label: "Cities", value: "200+", icon: "🏙️" },
                ].map((stat, index) => (
                  <div key={index} className="space-y-2">
                    <input
                      type="text"
                      defaultValue={stat.icon}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center text-2xl"
                    />
                    <input
                      type="text"
                      defaultValue={stat.value}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center font-bold"
                    />
                    <input
                      type="text"
                      defaultValue={stat.label}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Theme Settings */}
        {activeTab === "theme" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Brand Colors
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Primary Color
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="color"
                      value={themeSettings.primaryColor}
                      onChange={(e) =>
                        setThemeSettings({
                          ...themeSettings,
                          primaryColor: e.target.value,
                        })
                      }
                      className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={themeSettings.primaryColor}
                      onChange={(e) =>
                        setThemeSettings({
                          ...themeSettings,
                          primaryColor: e.target.value,
                        })
                      }
                      className="flex-grow px-4 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Secondary Color
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="color"
                      value={themeSettings.secondaryColor}
                      onChange={(e) =>
                        setThemeSettings({
                          ...themeSettings,
                          secondaryColor: e.target.value,
                        })
                      }
                      className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={themeSettings.secondaryColor}
                      onChange={(e) =>
                        setThemeSettings({
                          ...themeSettings,
                          secondaryColor: e.target.value,
                        })
                      }
                      className="flex-grow px-4 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Navigation Bar
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Background Color
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="color"
                      value={themeSettings.navbarBg}
                      onChange={(e) =>
                        setThemeSettings({
                          ...themeSettings,
                          navbarBg: e.target.value,
                        })
                      }
                      className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={themeSettings.navbarBg}
                      className="flex-grow px-4 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Text Color
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="color"
                      value={themeSettings.navbarText}
                      onChange={(e) =>
                        setThemeSettings({
                          ...themeSettings,
                          navbarText: e.target.value,
                        })
                      }
                      className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={themeSettings.navbarText}
                      className="flex-grow px-4 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Footer
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Background Color
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="color"
                      value={themeSettings.footerBg}
                      className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={themeSettings.footerBg}
                      className="flex-grow px-4 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Text Color
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="color"
                      value={themeSettings.footerText}
                      className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={themeSettings.footerText}
                      className="flex-grow px-4 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Background & Cards
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Body Background
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="color"
                      value={themeSettings.bodyBg}
                      className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={themeSettings.bodyBg}
                      className="flex-grow px-4 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Card Background
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="color"
                      value={themeSettings.cardBg}
                      className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={themeSettings.cardBg}
                      className="flex-grow px-4 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Typography & Styling
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Font Family
                  </label>
                  <select className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                    <option>Inter</option>
                    <option>Roboto</option>
                    <option>Open Sans</option>
                    <option>Poppins</option>
                    <option>Montserrat</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Button Border Radius
                  </label>
                  <select className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                    <option value="0">None (0px)</option>
                    <option value="0.25rem">Small (4px)</option>
                    <option value="0.5rem">Medium (8px)</option>
                    <option value="0.75rem">Large (12px)</option>
                    <option value="9999px">Full (Pill)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <button className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                Reset to Default
              </button>
              <button className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition">
                Save Theme Settings
              </button>
            </div>
          </div>
        )}

        {/* Navigation Settings */}
        {activeTab === "navigation" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Main Navigation Menu
              </h2>
              <div className="space-y-4">
                {[
                  { label: "Products", link: "/products", order: 1 },
                  { label: "Auctions", link: "/auctions", order: 2 },
                  { label: "Shops", link: "/shops", order: 3 },
                  { label: "Categories", link: "/categories", order: 4 },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-750 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <button className="text-gray-400 hover:text-gray-600">
                        ⬆️
                      </button>
                      <button className="text-gray-400 hover:text-gray-600">
                        ⬇️
                      </button>
                    </div>
                    <input
                      type="text"
                      defaultValue={item.label}
                      className="flex-grow px-4 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <input
                      type="text"
                      defaultValue={item.link}
                      className="flex-grow px-4 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <div className="flex gap-2">
                      <button className="px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded">
                        Edit
                      </button>
                      <button className="px-3 py-2 text-sm bg-red-50 text-red-600 rounded">
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition">
                + Add Menu Item
              </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Mega Menu (Categories)
              </h2>
              <div className="flex items-center justify-between mb-4">
                <label className="flex items-center gap-3">
                  <input type="checkbox" className="rounded" defaultChecked />
                  <span className="text-gray-700 dark:text-gray-300">
                    Enable Mega Menu for Categories
                  </span>
                </label>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                When enabled, hovering over "Categories" will show a large menu
                with all category groups and items
              </div>
            </div>
          </div>
        )}

        {/* Ad Banners */}
        {activeTab === "banners" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Advertisement Banners
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Manage promotional banners across the site
                </p>
              </div>
              <button
                onClick={() =>
                  setEditingBanner({
                    id: "new",
                    title: "",
                    image: "",
                    link: "",
                    position: "top",
                    startDate: new Date(),
                    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                    active: true,
                  })
                }
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
              >
                + Add Banner
              </button>
            </div>

            <div className="grid gap-4">
              {adBanners.map((banner) => (
                <div
                  key={banner.id}
                  className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex gap-6">
                    <div className="w-64 h-32 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                      {banner.image ? (
                        <img
                          src={banner.image}
                          alt={banner.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-400">No image</span>
                      )}
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {banner.title}
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex gap-2">
                          <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full">
                            {banner.position}
                          </span>
                          <span
                            className={`px-3 py-1 rounded-full ${
                              banner.active
                                ? "bg-green-50 text-green-600"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {banner.active ? "Active" : "Inactive"}
                          </span>
                        </div>
                        <div className="text-gray-600 dark:text-gray-400">
                          {banner.startDate.toLocaleDateString()} -{" "}
                          {banner.endDate.toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => setEditingBanner(banner)}
                        className="px-4 py-2 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition"
                      >
                        Edit
                      </button>
                      <button className="px-4 py-2 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100 transition">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Featured Sections */}
        {activeTab === "featured" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Featured Sections
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Manage featured products, auctions, shops, and categories on
                  homepage
                </p>
              </div>
              <button
                onClick={() =>
                  setEditingFeatured({
                    id: "new",
                    title: "",
                    type: "products",
                    itemIds: [],
                    displayCount: 8,
                    layout: "grid",
                    order: featuredSections.length + 1,
                    active: true,
                  })
                }
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
              >
                + Add Section
              </button>
            </div>

            <div className="grid gap-4">
              {featuredSections.map((section) => (
                <div
                  key={section.id}
                  className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {section.title}
                      </h3>
                      <div className="flex gap-2">
                        <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm">
                          {section.type}
                        </span>
                        <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-sm">
                          {section.layout}
                        </span>
                        <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-sm">
                          Show {section.displayCount} items
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingFeatured(section)}
                        className="px-4 py-2 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition"
                      >
                        Edit
                      </button>
                      <button className="px-4 py-2 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100 transition">
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {section.itemIds.length > 0
                      ? `${section.itemIds.length} items selected`
                      : "Auto-select items"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Page Content */}
        {activeTab === "pages" && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { name: "About Us", icon: "ℹ️", route: "/about" },
                { name: "Contact", icon: "📧", route: "/contact" },
                { name: "FAQ", icon: "❓", route: "/faq" },
                { name: "Terms & Conditions", icon: "📜", route: "/terms" },
                { name: "Privacy Policy", icon: "🔒", route: "/privacy" },
                { name: "Shipping Policy", icon: "🚚", route: "/shipping" },
              ].map((page, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">{page.icon}</div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {page.name}
                        </h3>
                        <p className="text-sm text-gray-500">{page.route}</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition">
                      Edit Content
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-12 text-center shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="text-6xl mb-4">✏️</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Rich Text Editor
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Click "Edit Content" on any page to open the rich text editor
                with full formatting capabilities
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Modals would go here for editing hero, carousel, banners, and featured sections */}
    </div>
  );
}
