"use client";

import {
  AdminPageHeader,
  LoadingSpinner,
  ToggleSwitch,
  toast,
} from "@/components/admin";
import { BannerEditor } from "@/components/admin/homepage/BannerEditor";
import { SectionCard } from "@/components/admin/homepage/SectionCard";
import { SliderControl } from "@/components/admin/homepage/SliderControl";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { DateDisplay } from "@/components/common/values";
import { FormLabel } from "@/components/forms";
import {
  HomepageSettings,
  homepageSettingsService,
} from "@/services/homepage-settings.service";
import { RefreshCw, Save } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

// Default section order - matches HomepageSettings.sections keys
const DEFAULT_SECTION_ORDER = [
  "latestProducts",
  "featuredProducts",
  "hotAuctions",
  "featuredAuctions",
  "featuredCategories",
  "featuredShops",
  "recentReviews",
  "featuredBlogs",
];

// Section display names - matches HomepageSettings.sections keys
const SECTION_NAMES: Record<string, { title: string; description: string }> = {
  valueProposition: {
    title: "Value Proposition",
    description: "Trust badges (Authentic, Quality, Support, etc.)",
  },
  latestProducts: {
    title: "Latest Products",
    description: "Recently added products displayed in a grid",
  },
  featuredProducts: {
    title: "Featured Products",
    description: "Admin-selected featured products",
  },
  hotAuctions: {
    title: "Hot Auctions",
    description: "Active auctions with the most bids",
  },
  featuredAuctions: {
    title: "Featured Auctions",
    description: "Admin-selected featured auctions",
  },
  featuredCategories: {
    title: "Featured Categories",
    description: "Admin-selected categories with items",
  },
  featuredShops: {
    title: "Featured Shops",
    description: "Admin-selected shops with their items",
  },
  recentReviews: {
    title: "Recent Reviews",
    description: "Latest customer reviews (4+ stars)",
  },
  featuredBlogs: {
    title: "Featured Blogs",
    description: "Featured blog posts",
  },
};

export default function HomepageSettingsPage() {
  const [settings, setSettings] = useState<HomepageSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [sectionOrder, setSectionOrder] = useState<string[]>(
    DEFAULT_SECTION_ORDER,
  );

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await homepageSettingsService.getSettings();

      // Ensure specialEventBanner exists with default values
      const defaultBanner = {
        enabled: false,
        title: "",
        content: "",
        link: "",
        backgroundColor: "#2563eb",
        textColor: "#ffffff",
      };

      const loadedSettings = {
        ...response.settings,
        specialEventBanner: {
          ...defaultBanner,
          ...response.settings.specialEventBanner,
        },
      };

      setSettings(loadedSettings);
      // Load section order from settings or use default
      setSectionOrder(
        loadedSettings.sectionOrder?.length > 0
          ? loadedSettings.sectionOrder
          : DEFAULT_SECTION_ORDER,
      );
      setHasChanges(false);
    } catch (error) {
      console.error("Failed to load homepage settings:", error);
      toast.error("Failed to load homepage settings");
    } finally {
      setLoading(false);
    }
  };

  // Move section up in order
  const moveSectionUp = useCallback((sectionKey: string) => {
    setSectionOrder((prevOrder) => {
      const index = prevOrder.indexOf(sectionKey);
      if (index <= 0) return prevOrder;
      const newOrder = [...prevOrder];
      [newOrder[index - 1], newOrder[index]] = [
        newOrder[index],
        newOrder[index - 1],
      ];
      return newOrder;
    });
    setHasChanges(true);
  }, []);

  // Move section down in order
  const moveSectionDown = useCallback((sectionKey: string) => {
    setSectionOrder((prevOrder) => {
      const index = prevOrder.indexOf(sectionKey);
      if (index < 0 || index >= prevOrder.length - 1) return prevOrder;
      const newOrder = [...prevOrder];
      [newOrder[index], newOrder[index + 1]] = [
        newOrder[index + 1],
        newOrder[index],
      ];
      return newOrder;
    });
    setHasChanges(true);
  }, []);

  const handleSave = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      // Include section order in the settings update
      await homepageSettingsService.updateSettings({
        ...settings,
        sectionOrder,
      });
      setHasChanges(false);
      toast.success("Homepage settings saved successfully!");
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error("Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    try {
      setSaving(true);
      const defaultSettings = await homepageSettingsService.resetSettings();
      setSettings(defaultSettings);
      setSectionOrder(DEFAULT_SECTION_ORDER);
      setHasChanges(false);
      setShowResetDialog(false);
      toast.success("Settings reset to defaults!");
    } catch (error) {
      console.error("Failed to reset settings:", error);
      toast.error("Failed to reset settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const toggleSection = (sectionKey: string) => {
    if (!settings) return;

    const newSettings = { ...settings };
    const section =
      newSettings.sections[sectionKey as keyof typeof newSettings.sections];

    if (section) {
      (section as any).enabled = !(section as any).enabled;
      setSettings(newSettings);
      setHasChanges(true);
    }
  };

  const updateSectionValue = (
    sectionKey: string,
    field: string,
    value: number,
  ) => {
    if (!settings) return;

    const newSettings = { ...settings };
    const section =
      newSettings.sections[sectionKey as keyof typeof newSettings.sections];

    if (section) {
      (section as any)[field] = value;
      setSettings(newSettings);
      setHasChanges(true);
    }
  };

  const toggleHeroCarousel = () => {
    if (!settings) return;

    setSettings({
      ...settings,
      heroCarousel: {
        ...settings.heroCarousel,
        enabled: !settings.heroCarousel.enabled,
      },
    });
    setHasChanges(true);
  };

  const updateAutoPlayInterval = (value: number) => {
    if (!settings) return;

    setSettings({
      ...settings,
      heroCarousel: {
        ...settings.heroCarousel,
        autoPlayInterval: value,
      },
    });
    setHasChanges(true);
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading homepage settings..." />;
  }

  if (!settings) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          Failed to load homepage settings.
        </p>
        <button
          onClick={loadSettings}
          className="mt-4 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      <ConfirmDialog
        isOpen={showResetDialog}
        onClose={() => setShowResetDialog(false)}
        onConfirm={handleReset}
        title="Reset to Defaults"
        description="Are you sure you want to reset all settings to defaults? This action cannot be undone."
        variant="warning"
        isLoading={saving}
      />

      <div className="space-y-6">
        <AdminPageHeader
          title="Homepage Settings"
          description="Configure sections and content displayed on the homepage"
          actions={
            <>
              <button
                onClick={() => setShowResetDialog(true)}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-200 disabled:opacity-50"
              >
                <RefreshCw className="w-4 h-4" />
                Reset
              </button>
              <button
                onClick={handleSave}
                disabled={!hasChanges || saving}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </>
          }
        />

        {hasChanges && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              You have unsaved changes. Click "Save Changes" to apply them.
            </p>
          </div>
        )}

        {/* Special Event Banner Settings */}
        <BannerEditor
          settings={settings.specialEventBanner}
          onChange={(bannerSettings) => {
            setSettings({
              ...settings,
              specialEventBanner: bannerSettings,
            });
            setHasChanges(true);
          }}
        />

        {/* Hero Carousel Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Hero Carousel
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Main banner at the top of homepage
              </p>
            </div>
            <ToggleSwitch
              enabled={settings.heroCarousel.enabled}
              onToggle={toggleHeroCarousel}
            />
          </div>

          {settings.heroCarousel.enabled && (
            <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div>
                <FormLabel htmlFor="autoplay-interval">
                  Auto-play Interval:{" "}
                  {(settings.heroCarousel.autoPlayInterval / 1000).toFixed(1)}s
                </FormLabel>
                <input
                  type="range"
                  min="3000"
                  max="10000"
                  step="500"
                  value={settings.heroCarousel.autoPlayInterval}
                  onChange={(e) =>
                    updateAutoPlayInterval(Number(e.target.value))
                  }
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>3s</span>
                  <span>10s</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Homepage Sections */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Homepage Sections
            </h2>
            <p className="text-sm text-gray-500">
              Use arrows to reorder sections
            </p>
          </div>

          {/* Value Proposition - Always at top, not reorderable */}
          <SectionCard
            title="Value Proposition Banner"
            description="Key benefits displayed below hero (fixed position)"
            enabled={settings.sections.valueProposition.enabled}
            onToggle={() => toggleSection("valueProposition")}
            expanded={expandedSection === "valueProposition"}
            onToggleExpand={() =>
              setExpandedSection(
                expandedSection === "valueProposition"
                  ? null
                  : "valueProposition",
              )
            }
          />

          {/* Reorderable Sections */}
          {sectionOrder.map((sectionKey, index) => {
            const sectionInfo = SECTION_NAMES[sectionKey];
            if (!sectionInfo) return null;

            const section =
              settings.sections[sectionKey as keyof typeof settings.sections];
            if (!section) return null;

            return (
              <SectionCard
                key={sectionKey}
                title={sectionInfo.title}
                description={sectionInfo.description}
                enabled={(section as any).enabled}
                onToggle={() => toggleSection(sectionKey)}
                expanded={expandedSection === sectionKey}
                onToggleExpand={() =>
                  setExpandedSection(
                    expandedSection === sectionKey ? null : sectionKey,
                  )
                }
                orderIndex={index + 1}
                totalSections={sectionOrder.length}
                onMoveUp={() => moveSectionUp(sectionKey)}
                onMoveDown={() => moveSectionDown(sectionKey)}
              >
                {renderSectionConfig(sectionKey, settings, updateSectionValue)}
              </SectionCard>
            );
          })}
        </div>

        {/* Last Updated Info */}
        {settings.updatedAt && (
          <div className="text-sm text-gray-500 text-center py-4">
            Last updated:{" "}
            <DateDisplay date={settings.updatedAt} format="short" />
            {settings.updatedBy && ` by ${settings.updatedBy}`}
          </div>
        )}
      </div>
    </>
  );
}

// Helper function to render section-specific configuration
function renderSectionConfig(
  sectionKey: string,
  settings: HomepageSettings,
  updateSectionValue: (section: string, field: string, value: number) => void,
): React.ReactNode {
  switch (sectionKey) {
    case "valueProposition":
      return (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          This section displays trust badges (Authentic Products, Quality
          Assured, 24/7 Support, etc.). No configuration needed.
        </div>
      );
    case "latestProducts":
      return (
        <SliderControl
          label="Max Products"
          value={settings.sections.latestProducts?.maxProducts || 10}
          min={5}
          max={20}
          onChange={(value) =>
            updateSectionValue("latestProducts", "maxProducts", value)
          }
        />
      );
    case "featuredProducts":
      return (
        <SliderControl
          label="Max Products"
          value={settings.sections.featuredProducts?.maxProducts || 10}
          min={5}
          max={20}
          onChange={(value) =>
            updateSectionValue("featuredProducts", "maxProducts", value)
          }
        />
      );
    case "hotAuctions":
      return (
        <SliderControl
          label="Max Auctions"
          value={settings.sections.hotAuctions?.maxAuctions || 10}
          min={5}
          max={20}
          onChange={(value) =>
            updateSectionValue("hotAuctions", "maxAuctions", value)
          }
        />
      );
    case "featuredAuctions":
      return (
        <SliderControl
          label="Max Auctions"
          value={settings.sections.featuredAuctions?.maxAuctions || 10}
          min={5}
          max={20}
          onChange={(value) =>
            updateSectionValue("featuredAuctions", "maxAuctions", value)
          }
        />
      );
    case "featuredCategories":
      return (
        <div className="space-y-4">
          <SliderControl
            label="Max Categories"
            value={settings.sections.featuredCategories?.maxCategories || 8}
            min={1}
            max={10}
            onChange={(value) =>
              updateSectionValue("featuredCategories", "maxCategories", value)
            }
          />
          <SliderControl
            label="Products per Category"
            value={
              settings.sections.featuredCategories?.productsPerCategory || 6
            }
            min={5}
            max={20}
            onChange={(value) =>
              updateSectionValue(
                "featuredCategories",
                "productsPerCategory",
                value,
              )
            }
          />
        </div>
      );
    case "featuredShops":
      return (
        <div className="space-y-4">
          <SliderControl
            label="Max Shops"
            value={settings.sections.featuredShops?.maxShops || 8}
            min={1}
            max={10}
            onChange={(value) =>
              updateSectionValue("featuredShops", "maxShops", value)
            }
          />
          <SliderControl
            label="Products per Shop"
            value={settings.sections.featuredShops?.productsPerShop || 6}
            min={5}
            max={20}
            onChange={(value) =>
              updateSectionValue("featuredShops", "productsPerShop", value)
            }
          />
        </div>
      );
    case "recentReviews":
      return (
        <SliderControl
          label="Max Reviews"
          value={settings.sections.recentReviews?.maxReviews || 10}
          min={5}
          max={20}
          onChange={(value) =>
            updateSectionValue("recentReviews", "maxReviews", value)
          }
        />
      );
    case "featuredBlogs":
      return (
        <SliderControl
          label="Max Blogs"
          value={settings.sections.featuredBlogs?.maxBlogs || 6}
          min={3}
          max={12}
          onChange={(value) =>
            updateSectionValue("featuredBlogs", "maxBlogs", value)
          }
        />
      );
    default:
      return null;
  }
}
