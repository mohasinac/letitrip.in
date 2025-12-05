/**
 * @fileoverview React Component
 * @module src/app/admin/homepage/page
 * @description This file contains the page component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use client";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { LoadingSpinner } from "@/components/admin/LoadingSpinner";
import { ToggleSwitch } from "@/components/admin/ToggleSwitch";
import { toast } from "@/components/admin/Toast";
import { BannerEditor } from "@/components/admin/homepage/BannerEditor";
import { SectionCard } from "@/components/admin/homepage/SectionCard";
import { SliderControl } from "@/components/admin/homepage/SliderControl";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { DateDisplay } from "@/components/common/values/DateDisplay";
import { FormLabel } from "@/components/forms/FormLabel";
import { useLoadingState } from "@/hooks/useLoadingState";
import { logError } from "@/lib/firebase-error-logger";
import {
  HomepageSettings,
  homepageSettingsService,
} from "@/services/homepage-settings.service";
import { RefreshCw, Save } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

// Default section order - matches HomepageSettings.sections keys
/**
 * DEFAULT_SECTION_ORDER constant
 * 
 * @constant
 * @type {any}
 * @description Configuration constant for default section order
 */
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
  /** Value Proposition */
  valueProposition: {
    /** Title */
    title: "Value Proposition",
    /** Description */
    description: "Trust badges (Authentic, Quality, Support, etc.)",
  },
  /** Latest Products */
  latestProducts: {
    /** Title */
    title: "Latest Products",
    /** Description */
    description: "Recently added products displayed in a grid",
  },
  /** Featured Products */
  featuredProducts: {
    /** Title */
    title: "Featured Products",
    /** Description */
    description: "Admin-selected featured products",
  },
  /** Hot Auctions */
  hotAuctions: {
    /** Title */
    title: "Hot Auctions",
    /** Description */
    description: "Active auctions with the most bids",
  },
  /** Featured Auctions */
  featuredAuctions: {
    /** Title */
    title: "Featured Auctions",
    /** Description */
    description: "Admin-selected featured auctions",
  },
  /** Featured Categories */
  featuredCategories: {
    /** Title */
    title: "Featured Categories",
    /** Description */
    description: "Admin-selected categories with items",
  },
  /** Featured Shops */
  featuredShops: {
    /** Title */
    title: "Featured Shops",
    /** Description */
    description: "Admin-selected shops with their items",
  },
  /** Recent Reviews */
  recentReviews: {
    /** Title */
    title: "Recent Reviews",
    /** Description */
    description: "Latest customer reviews (4+ stars)",
  },
  /** Featured Blogs */
  featuredBlogs: {
    /** Title */
    title: "Featured Blogs",
    /** Description */
    description: "Featured blog posts",
  },
};

export default /**
 * Performs homepage settings page operation
 *
 * @returns {any} The homepagesettingspage result
 *
 */
function HomepageSettingsPage() {
  const {
    /** Is Loading */
    isLoading: loading,
    error,
    /** Data */
    data: settings,
    /** Set Data */
    setData: setSettings,
    execute,
  } = useLoadingState<HomepageSettings>({
    /** On Load Error */
    onLoadError: (error) => {
      logError(error, { component: "HomepageSettingsPage.loadSettings" });
      toast.error("Failed to load homepage settings");
    },
  });
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

  /**
   * Fetches settings from server
   *
   * @returns {Promise<any>} Promise resolving to settings result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  /**
   * Fetches settings from server
   *
   * @returns {Promise<any>} Promise resolving to settings result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  const loadSettings = () =>
    execute(async () => {
      const response = await homepageSettingsService.getSettings();

      // Ensure specialEventBanner exists with default values
      const defaultBanner = {
        /** Enabled */
        enabled: false,
        /** Title */
        title: "",
        /** Content */
        content: "",
        /** Link */
        link: "",
        /** Background Color */
        backgroundColor: "#2563eb",
        /** Text Color */
        textColor: "#ffffff",
      };

      const loadedSettings = {
        ...response.settings,
        /** Special Event Banner */
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
    });

  // Move section up in order
  /**
 * Performs move section up operation
 *
 * @param {string} (sectionKey - The (sectionkey
 *
 * @returns {any} The movesectionup result
 *
 */
const moveSectionUp = useCallback((sectionKey: string) => {
    setSectionOrder((prevOrder) => {
      const index = prevOrder.indexOf(sectionKey);
      if (index <= 0) return prevOrder;
      const newOrder = [...prevOrder];
      [newOrder[index - 1], newOrder[index]] = [
        newOrder[index],
/**
 * Performs move section down operation
 *
 * @param {string} (sectionKey - The (sectionkey
 *
 * @returns {any} The movesectiondown result
 *
 */
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

  /**
   * Performs async operation
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  /**
   * Performs async operation
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

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

  /**
   * Performs async operation
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  /**
   * Performs async operation
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

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

  /**
   * Performs toggle section operation
   *
   * @param {string} sectionKey - The section key
   *
   * @returns {string} The togglesection result
   */

  /**
   * Performs toggle section operation
   *
   * @param {string} sectionKey - The section key
   *
   * @returns {string} The togglesection result
   */

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

  /**
   * Updates existing section value
   *
   * @param {string} sectionKey - The section key
   * @param {string} field - The field
   * @param {number} value - The value
   *
   * @returns {string} The updatesectionvalue result
   */

  /**
   * Updates existing section value
   *
   * @returns {string} The updatesectionvalue result
   */

  const updateSectionValue = (
    /** Section Key */
    sectionKey: string,
    /** Field */
    field: string,
    /** Value */
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

  /**
   * Performs toggle hero carousel operation
   *
   * @returns {any} The toggleherocarousel result
   */

  /**
   * Performs toggle hero carousel operation
   *
   * @returns {any} The toggleherocarousel result
   */

  const toggleHeroCarousel = () => {
    if (!settings) return;

    setSettings({
      ...settings,
      /** Hero Carousel */
      heroCarousel: {
        ...settings.heroCarousel,
        /** Enabled */
        enabled: !settings.heroCarousel.enabled,
      },
    });
    setHasChanges(true);
  };

  /**
   * Updates existing auto play interval
   *
   * @param {number} value - The value
   *
   * @returns {number} The updateautoplayinterval result
   */

  /**
   * Updates existing auto play interval
   *
   * @param {number} value - The value
   *
   * @returns {number} The updateautoplayinterval result
   */

  const updateAutoPlayInterval = (value: number) => {
    if (!settings) return;

    setSettings({
      ...settings,
      /** Hero Carousel */
      heroCarousel: {
        ...settings.heroCarousel,
        /** Auto Play Interval */
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
              /** Special Event Banner */
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
/**
 * Function: Render Section Config
 */
/**
 * Renders section config
 *
 * @param {string} sectionKey - The section key
 * @param {HomepageSettings} settings - The settings
 * @param {(section} updateSectionValue - The update section value
 * @param {string} field - The field
 * @param {number} value - The value
 *
 * @returns {string} The rendersectionconfig result
 */

/**
 * Renders section config
 *
 * @returns {string} The rendersectionconfig result
 */

function renderSectionConfig(
  /** Section Key */
  sectionKey: string,
  /** Settings */
  settings: HomepageSettings,
  /** Update Section Value */
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
    /** Default */
    default:
      return null;
  }
}
