"use client";

import { useState, useEffect, useCallback } from "react";
import {
  RefreshCw,
  Save,
  GripVertical,
  ChevronDown,
  ChevronUp,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { FormInput, FormLabel } from "@/components/forms";
import {
  homepageSettingsService,
  HomepageSettings,
} from "@/services/homepage-settings.service";
import {
  AdminPageHeader,
  LoadingSpinner,
  ToggleSwitch,
  toast,
} from "@/components/admin";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import RichTextEditor from "@/components/common/RichTextEditor";

// Default section order
const DEFAULT_SECTION_ORDER = [
  "featuredCategories",
  "featuredProducts",
  "featuredAuctions",
  "featuredShops",
  "featuredBlogs",
  "featuredReviews",
];

// Section display names
const SECTION_NAMES: Record<string, { title: string; description: string }> = {
  featuredCategories: {
    title: "Featured Categories",
    description: "Categories with products",
  },
  featuredProducts: {
    title: "Featured Products",
    description: "Highlighted products showcase",
  },
  featuredAuctions: {
    title: "Featured Auctions",
    description: "Live and upcoming auctions",
  },
  featuredShops: {
    title: "Featured Shops",
    description: "Top shops with their products",
  },
  featuredBlogs: {
    title: "Featured Blogs",
    description: "Latest blog posts",
  },
  featuredReviews: {
    title: "Featured Reviews",
    description: "Customer reviews showcase",
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
    DEFAULT_SECTION_ORDER
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
          : DEFAULT_SECTION_ORDER
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
    value: number
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
        <p className="text-gray-500">Failed to load homepage settings.</p>
        <button
          onClick={loadSettings}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
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
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Special Event Banner
              </h2>
              <p className="text-sm text-gray-500">
                Announcement banner at the very top of the site
              </p>
            </div>
            <ToggleSwitch
              enabled={settings.specialEventBanner.enabled}
              onToggle={() => {
                setSettings({
                  ...settings,
                  specialEventBanner: {
                    ...settings.specialEventBanner,
                    enabled: !settings.specialEventBanner.enabled,
                  },
                });
                setHasChanges(true);
              }}
            />
          </div>

          {settings.specialEventBanner.enabled && (
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <div>
                <FormLabel htmlFor="banner-content">
                  Banner Content (Rich Text)
                </FormLabel>
                <RichTextEditor
                  value={settings.specialEventBanner.content}
                  onChange={(value: string) => {
                    setSettings({
                      ...settings,
                      specialEventBanner: {
                        ...settings.specialEventBanner,
                        content: value,
                      },
                    });
                    setHasChanges(true);
                  }}
                  placeholder="Enter banner content..."
                  minHeight={150}
                />
              </div>

              <FormInput
                label="Link URL (Optional)"
                value={settings.specialEventBanner.link || ""}
                onChange={(e) => {
                  setSettings({
                    ...settings,
                    specialEventBanner: {
                      ...settings.specialEventBanner,
                      link: e.target.value,
                    },
                  });
                  setHasChanges(true);
                }}
                placeholder="/special-offers"
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FormLabel htmlFor="banner-bg-color">
                    Background Color
                  </FormLabel>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={
                        settings.specialEventBanner.backgroundColor || "#2563eb"
                      }
                      onChange={(e) => {
                        setSettings({
                          ...settings,
                          specialEventBanner: {
                            ...settings.specialEventBanner,
                            backgroundColor: e.target.value,
                          },
                        });
                        setHasChanges(true);
                      }}
                      className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={
                        settings.specialEventBanner.backgroundColor || "#2563eb"
                      }
                      onChange={(e) => {
                        setSettings({
                          ...settings,
                          specialEventBanner: {
                            ...settings.specialEventBanner,
                            backgroundColor: e.target.value,
                          },
                        });
                        setHasChanges(true);
                      }}
                      placeholder="#2563eb"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <FormLabel htmlFor="banner-text-color">Text Color</FormLabel>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={settings.specialEventBanner.textColor || "#ffffff"}
                      onChange={(e) => {
                        setSettings({
                          ...settings,
                          specialEventBanner: {
                            ...settings.specialEventBanner,
                            textColor: e.target.value,
                          },
                        });
                        setHasChanges(true);
                      }}
                      className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={settings.specialEventBanner.textColor || "#ffffff"}
                      onChange={(e) => {
                        setSettings({
                          ...settings,
                          specialEventBanner: {
                            ...settings.specialEventBanner,
                            textColor: e.target.value,
                          },
                        });
                        setHasChanges(true);
                      }}
                      placeholder="#ffffff"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 p-4 rounded-lg border border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Preview:
                </p>
                <div
                  style={{
                    backgroundColor:
                      settings.specialEventBanner.backgroundColor || "#2563eb",
                    color: settings.specialEventBanner.textColor || "#ffffff",
                  }}
                  className="py-2 px-4 rounded text-center"
                  dangerouslySetInnerHTML={{
                    __html: settings.specialEventBanner.content,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Hero Carousel Settings */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Hero Carousel
              </h2>
              <p className="text-sm text-gray-500">
                Main banner at the top of homepage
              </p>
            </div>
            <ToggleSwitch
              enabled={settings.heroCarousel.enabled}
              onToggle={toggleHeroCarousel}
            />
          </div>

          {settings.heroCarousel.enabled && (
            <div className="space-y-4 pt-4 border-t border-gray-200">
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
                  : "valueProposition"
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
                    expandedSection === sectionKey ? null : sectionKey
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
            Last updated: {new Date(settings.updatedAt).toLocaleString()}
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
  updateSectionValue: (section: string, field: string, value: number) => void
): React.ReactNode {
  switch (sectionKey) {
    case "featuredCategories":
      return (
        <div className="space-y-4">
          <SliderControl
            label="Max Categories"
            value={settings.sections.featuredCategories.maxCategories}
            min={1}
            max={10}
            onChange={(value) =>
              updateSectionValue("featuredCategories", "maxCategories", value)
            }
          />
          <SliderControl
            label="Products per Category"
            value={settings.sections.featuredCategories.productsPerCategory}
            min={5}
            max={20}
            onChange={(value) =>
              updateSectionValue(
                "featuredCategories",
                "productsPerCategory",
                value
              )
            }
          />
        </div>
      );
    case "featuredProducts":
      return (
        <SliderControl
          label="Max Products"
          value={settings.sections.featuredProducts.maxProducts}
          min={5}
          max={20}
          onChange={(value) =>
            updateSectionValue("featuredProducts", "maxProducts", value)
          }
        />
      );
    case "featuredAuctions":
      return (
        <SliderControl
          label="Max Auctions"
          value={settings.sections.featuredAuctions.maxAuctions}
          min={5}
          max={20}
          onChange={(value) =>
            updateSectionValue("featuredAuctions", "maxAuctions", value)
          }
        />
      );
    case "featuredShops":
      return (
        <div className="space-y-4">
          <SliderControl
            label="Max Shops"
            value={settings.sections.featuredShops.maxShops}
            min={1}
            max={10}
            onChange={(value) =>
              updateSectionValue("featuredShops", "maxShops", value)
            }
          />
          <SliderControl
            label="Products per Shop"
            value={settings.sections.featuredShops.productsPerShop}
            min={5}
            max={20}
            onChange={(value) =>
              updateSectionValue("featuredShops", "productsPerShop", value)
            }
          />
        </div>
      );
    case "featuredBlogs":
      return (
        <SliderControl
          label="Max Blogs"
          value={settings.sections.featuredBlogs.maxBlogs}
          min={5}
          max={20}
          onChange={(value) =>
            updateSectionValue("featuredBlogs", "maxBlogs", value)
          }
        />
      );
    case "featuredReviews":
      return (
        <SliderControl
          label="Max Reviews"
          value={settings.sections.featuredReviews.maxReviews}
          min={5}
          max={20}
          onChange={(value) =>
            updateSectionValue("featuredReviews", "maxReviews", value)
          }
        />
      );
    default:
      return null;
  }
}

// Section Card Component
interface SectionCardProps {
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
  expanded?: boolean;
  onToggleExpand?: () => void;
  children?: React.ReactNode;
  orderIndex?: number;
  totalSections?: number;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

function SectionCard({
  title,
  description,
  enabled,
  onToggle,
  expanded,
  onToggleExpand,
  children,
  orderIndex,
  totalSections,
  onMoveUp,
  onMoveDown,
}: SectionCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="p-4 flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            {/* Reorder buttons */}
            {onMoveUp &&
              onMoveDown &&
              orderIndex !== undefined &&
              totalSections !== undefined && (
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={onMoveUp}
                    disabled={orderIndex === 1}
                    className="p-0.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move up"
                  >
                    <ArrowUp className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  </button>
                  <button
                    onClick={onMoveDown}
                    disabled={orderIndex === totalSections}
                    className="p-0.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move down"
                  >
                    <ArrowDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  </button>
                </div>
              )}
            {/* Order number badge */}
            {orderIndex && (
              <span className="flex items-center justify-center w-6 h-6 bg-gray-100 dark:bg-gray-700 rounded-full text-xs font-medium text-gray-600 dark:text-gray-300">
                {orderIndex}
              </span>
            )}
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">
                {title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {description}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ToggleSwitch enabled={enabled} onToggle={onToggle} />
          {children && onToggleExpand && (
            <button
              onClick={onToggleExpand}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              disabled={!enabled}
            >
              {expanded ? (
                <ChevronUp className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              )}
            </button>
          )}
        </div>
      </div>
      {expanded && enabled && children && (
        <div className="px-4 pb-4 pt-2 border-t border-gray-200 dark:border-gray-700">
          {children}
        </div>
      )}
    </div>
  );
}

// Slider Control Component
interface SliderControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}

function SliderControl({
  label,
  value,
  min,
  max,
  onChange,
}: SliderControlProps) {
  return (
    <div>
      <FormLabel>
        {label}: {value}
      </FormLabel>
      <input
        type="range"
        min={min}
        max={max}
        step="1"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
      />
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
