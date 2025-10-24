"use client";

import { useState, useEffect } from "react";
import {
  PhotoIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";

interface HomePageSection {
  id: string;
  type: string;
  title: string;
  enabled: boolean;
  order: number;
  content: any;
}

interface SiteSettings {
  homePageSections: HomePageSection[];
  heroImages: string[];
  salesSettings: {
    showDiscounted: boolean;
    showFlashSales: boolean;
    minDiscount: number;
    limit: number;
    autoRotate: boolean;
    rotateInterval: number;
  };
}

export default function HomepageManagementPage() {
  const [settings, setSettings] = useState<SiteSettings>({
    homePageSections: [],
    heroImages: [],
    salesSettings: {
      showDiscounted: true,
      showFlashSales: true,
      minDiscount: 10,
      limit: 6,
      autoRotate: true,
      rotateInterval: 5000,
    },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/admin/settings");
      if (response.ok) {
        const data = await response.json();
        setSettings({
          homePageSections: data.homePageSections || [],
          heroImages: data.heroImages || [],
          salesSettings: data.salesSettings || {
            showDiscounted: true,
            showFlashSales: true,
            minDiscount: 10,
            limit: 6,
            autoRotate: true,
            rotateInterval: 5000,
          },
        });
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSectionToggle = (sectionId: string) => {
    const updatedSections = settings.homePageSections.map((section) =>
      section.id === sectionId
        ? { ...section, enabled: !section.enabled }
        : section
    );
    updateSettings("homePageSections", updatedSections);
  };

  const moveSectionUp = (index: number) => {
    if (index > 0) {
      const newSections = [...settings.homePageSections];
      [newSections[index], newSections[index - 1]] = [
        newSections[index - 1],
        newSections[index],
      ];
      // Update order values
      newSections.forEach((section, i) => {
        section.order = i;
      });
      updateSettings("homePageSections", newSections);
    }
  };

  const moveSectionDown = (index: number) => {
    if (index < settings.homePageSections.length - 1) {
      const newSections = [...settings.homePageSections];
      [newSections[index], newSections[index + 1]] = [
        newSections[index + 1],
        newSections[index],
      ];
      // Update order values
      newSections.forEach((section, i) => {
        section.order = i;
      });
      updateSettings("homePageSections", newSections);
    }
  };

  const updateSettings = async (key: string, value: any) => {
    setSaving(true);
    try {
      const updatedSettings = { ...settings, [key]: value };
      setSettings(updatedSettings);

      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedSettings),
      });

      if (!response.ok) {
        throw new Error("Failed to save settings");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
    } finally {
      setSaving(false);
    }
  };

  const getSectionTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      hero: "Hero Banner",
      features: "Features Section",
      "sale-carousel": "Sale/New/Popular Carousel",
      categories: "Categories Grid",
      "featured-products": "Featured Products",
      auctions: "Live Auctions",
      newsletter: "Newsletter Signup",
      "newsletter-reviews": "Newsletter & Reviews",
      testimonials: "Customer Testimonials",
      blog: "Latest Blog Posts",
      sales: "Sales & Deals Carousel",
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center">
                <PhotoIcon className="h-8 w-8 mr-3 text-primary" />
                Homepage Management
              </h1>
              <p className="text-muted-foreground mt-2">
                Configure which sections appear on your homepage and their order
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {saving && (
                <span className="text-sm text-muted-foreground">Saving...</span>
              )}
              <span className="text-sm text-muted-foreground">
                Auto-save enabled
              </span>
            </div>
          </div>
        </div>

        {/* Homepage Sections */}
        <div className="admin-card mb-8">
          <h2 className="text-xl font-semibold mb-4 text-foreground">
            Homepage Sections
          </h2>
          <p className="text-muted-foreground mb-6">
            Enable/disable sections and reorder them as needed. Changes are
            applied immediately.
          </p>

          {settings.homePageSections && (
            <div className="space-y-4">
              {settings.homePageSections
                .sort((a, b) => a.order - b.order)
                .map((section, index) => (
                  <div
                    key={section.id}
                    className={`border rounded-lg p-4 transition-all ${
                      section.enabled
                        ? "border-success bg-success-50"
                        : "border-border bg-muted"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={section.enabled}
                            onChange={() => handleSectionToggle(section.id)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after: bg-background after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                        <div>
                          <h3 className="font-medium text-foreground">
                            {section.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {getSectionTypeLabel(section.type)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-muted-foreground mr-2">
                          Order: {index + 1}
                        </span>
                        <button
                          onClick={() => moveSectionUp(index)}
                          disabled={index === 0}
                          className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Move up"
                        >
                          <ChevronUpIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => moveSectionDown(index)}
                          disabled={
                            index === settings.homePageSections.length - 1
                          }
                          className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Move down"
                        >
                          <ChevronDownIcon className="h-4 w-4" />
                        </button>
                        <button
                          className="p-1 text-muted-foreground hover:text-foreground"
                          title="Edit section"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Section Configuration Preview */}
                    {section.enabled && section.content && (
                      <div className="mt-3 pl-14">
                        <div className="text-xs text-muted bg-background rounded p-2 border">
                          <strong>Configuration:</strong>
                          {section.type === "featured-products" && (
                            <div className="mt-1">
                              Type: {section.content.type || "most-visited"} •
                              Limit: {section.content.limit || 6} • Display:{" "}
                              {section.content.displayCount || 3} at a time
                            </div>
                          )}
                          {section.type === "auctions" && (
                            <div className="mt-1">
                              Show Live:{" "}
                              {section.content.showLive ? "Yes" : "No"} • Show
                              Closed:{" "}
                              {section.content.showClosed ? "Yes" : "No"} •
                              Limit: {section.content.limit || 6} • Display:{" "}
                              {section.content.displayCount || 3} at a time
                            </div>
                          )}
                          {section.type === "categories" && (
                            <div className="mt-1">
                              Categories:{" "}
                              {section.content.showOnHomepage?.join(", ") ||
                                "All"}{" "}
                              • Icons:{" "}
                              {section.content.categoryIcons
                                ? "Custom"
                                : "Default"}
                            </div>
                          )}
                          {section.type === "sale-carousel" && (
                            <div className="mt-1">
                              Items: {section.content.items?.length || 0}{" "}
                              carousel items configured
                            </div>
                          )}
                          {section.type === "newsletter-reviews" && (
                            <div className="mt-1">
                              Newsletter:{" "}
                              {section.content.showNewsletter ? "Yes" : "No"} •
                              Reviews:{" "}
                              {section.content.showReviews ? "Yes" : "No"} •
                              Review Count:{" "}
                              {section.content.reviews?.length || 0}
                            </div>
                          )}
                          {section.type === "sales" && (
                            <div className="mt-1">
                              Show Discounted:{" "}
                              {section.content.showDiscounted ? "Yes" : "No"} •
                              Show Flash Sales:{" "}
                              {section.content.showFlashSales ? "Yes" : "No"} •
                              Min Discount: {section.content.minDiscount || 10}%
                              • Limit: {section.content.limit || 6}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Hero Images Section */}
        <div className="admin-card p-6">
          <h2 className="text-xl font-semibold mb-4">Hero Images</h2>
          <p className="text-secondary mb-6">
            Manage hero banner images that appear in the main banner carousel.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {settings.heroImages.map((image, index) => (
              <div key={index} className="relative group">
                <div className="aspect-video bg-surface rounded-lg overflow-hidden">
                  <img
                    src={image}
                    alt={`Hero image ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "/images/placeholder-hero.jpg";
                    }}
                  />
                </div>
                <button
                  onClick={() => {
                    const newImages = settings.heroImages.filter(
                      (_, i) => i !== index
                    );
                    updateSettings("heroImages", newImages);
                  }}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove image"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            ))}

            {/* Add new image */}
            <div className="aspect-video bg-surface rounded-lg border-2 border-dashed border-border flex items-center justify-center">
              <button className="text-muted hover: text-secondary">
                <PlusIcon className="h-8 w-8" />
                <span className="block text-sm mt-2">Add Hero Image</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sales & Deals Management */}
        <div className="admin-card p-6 mt-8">
          <h2 className="text-xl font-semibold mb-4">
            Sales & Deals Configuration
          </h2>
          <p className="text-secondary mb-6">
            Configure the sales carousel settings that appear when the sales
            section is enabled.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Content Settings */}
            <div className="space-y-4">
              <h3 className="font-medium text-primary">Content Settings</h3>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium text-primary">
                    Show Discounted Products
                  </h4>
                  <p className="text-sm text-muted">
                    Display products with active discounts
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.salesSettings.showDiscounted}
                    onChange={(e) =>
                      updateSettings("salesSettings", {
                        ...settings.salesSettings,
                        showDiscounted: e.target.checked,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after: bg-background after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium text-primary">Show Flash Sales</h4>
                  <p className="text-sm text-muted">
                    Display time-limited flash sale items
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.salesSettings.showFlashSales}
                    onChange={(e) =>
                      updateSettings("salesSettings", {
                        ...settings.salesSettings,
                        showFlashSales: e.target.checked,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after: bg-background after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Minimum Discount Percentage
                </label>
                <input
                  type="number"
                  min="5"
                  max="90"
                  step="5"
                  value={settings.salesSettings.minDiscount}
                  onChange={(e) =>
                    updateSettings("salesSettings", {
                      ...settings.salesSettings,
                      minDiscount: parseInt(e.target.value) || 10,
                    })
                  }
                  className="input w-full focus:ring-2 focus:ring-primary focus:border-primary"
                />
                <p className="text-xs text-muted mt-1">
                  Only show products with discounts above this percentage
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Maximum Items to Display
                </label>
                <input
                  type="number"
                  min="3"
                  max="12"
                  value={settings.salesSettings.limit}
                  onChange={(e) =>
                    updateSettings("salesSettings", {
                      ...settings.salesSettings,
                      limit: parseInt(e.target.value) || 6,
                    })
                  }
                  className="input w-full focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>

            {/* Carousel Settings */}
            <div className="space-y-4">
              <h3 className="font-medium text-primary">Carousel Settings</h3>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium text-primary">
                    Auto-rotate Carousel
                  </h4>
                  <p className="text-sm text-muted">
                    Automatically cycle through sales items
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.salesSettings.autoRotate}
                    onChange={(e) =>
                      updateSettings("salesSettings", {
                        ...settings.salesSettings,
                        autoRotate: e.target.checked,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after: bg-background after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              {settings.salesSettings.autoRotate && (
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    Rotation Interval (seconds)
                  </label>
                  <select
                    value={settings.salesSettings.rotateInterval / 1000}
                    onChange={(e) =>
                      updateSettings("salesSettings", {
                        ...settings.salesSettings,
                        rotateInterval: parseInt(e.target.value) * 1000,
                      })
                    }
                    className="input w-full focus:ring-2 focus:ring-primary focus:border-primary"
                  >
                    <option value="3">3 seconds</option>
                    <option value="5">5 seconds</option>
                    <option value="8">8 seconds</option>
                    <option value="10">10 seconds</option>
                    <option value="15">15 seconds</option>
                  </select>
                </div>
              )}

              {/* Preview Box */}
              <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-medium text-red-900 mb-2">
                  🔥 Sales Preview
                </h4>
                <div className="text-sm text-red-800 space-y-1">
                  <p>
                    • Discounted items:{" "}
                    {settings.salesSettings.showDiscounted
                      ? "Enabled"
                      : "Disabled"}
                  </p>
                  <p>
                    • Flash sales:{" "}
                    {settings.salesSettings.showFlashSales
                      ? "Enabled"
                      : "Disabled"}
                  </p>
                  <p>• Min discount: {settings.salesSettings.minDiscount}%</p>
                  <p>• Items shown: {settings.salesSettings.limit}</p>
                  <p>
                    • Auto-rotate:{" "}
                    {settings.salesSettings.autoRotate
                      ? `Every ${settings.salesSettings.rotateInterval / 1000}s`
                      : "Disabled"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sales Section Status */}
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-yellow-900">
                  Sales Section Status
                </h4>
                <p className="text-sm text-yellow-800">
                  {settings.homePageSections.find(
                    (section) => section.type === "sales"
                  )?.enabled
                    ? "The sales section is currently enabled on your homepage"
                    : "Enable the sales section above to show these settings on your homepage"}
                </p>
              </div>
              {!settings.homePageSections.find(
                (section) => section.type === "sales"
              )?.enabled && (
                <div className="text-yellow-600 text-sm">⚠️ Not Active</div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Preview */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">💡 Quick Preview</h3>
          <p className="text-blue-800 text-sm">
            To see how your changes look, visit the{" "}
            <a href="/" target="_blank" className="underline font-medium">
              homepage
            </a>{" "}
            in a new tab. Changes are applied immediately.
          </p>
        </div>
      </div>
    </div>
  );
}
