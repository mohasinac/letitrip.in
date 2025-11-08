"use client";

import { useState, useEffect } from "react";
import {
  RefreshCw,
  Save,
  Settings,
  GripVertical,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
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

export default function HomepageSettingsPage() {
  const [settings, setSettings] = useState<HomepageSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await homepageSettingsService.getSettings();
      setSettings(response.settings);
      setHasChanges(false);
    } catch (error) {
      console.error("Failed to load homepage settings:", error);
      toast.error("Failed to load homepage settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      await homepageSettingsService.updateSettings(settings);
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Auto-play Interval:{" "}
                  {(settings.heroCarousel.autoPlayInterval / 1000).toFixed(1)}s
                </label>
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
          <h2 className="text-lg font-semibold text-gray-900">
            Homepage Sections
          </h2>

          {/* Value Proposition */}
          <SectionCard
            title="Value Proposition Banner"
            description="Key benefits displayed below hero"
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

          {/* Featured Categories */}
          <SectionCard
            title="Featured Categories"
            description="Categories with products"
            enabled={settings.sections.featuredCategories.enabled}
            onToggle={() => toggleSection("featuredCategories")}
            expanded={expandedSection === "featuredCategories"}
            onToggleExpand={() =>
              setExpandedSection(
                expandedSection === "featuredCategories"
                  ? null
                  : "featuredCategories"
              )
            }
          >
            <div className="space-y-4">
              <SliderControl
                label="Max Categories"
                value={settings.sections.featuredCategories.maxCategories}
                min={1}
                max={10}
                onChange={(value) =>
                  updateSectionValue(
                    "featuredCategories",
                    "maxCategories",
                    value
                  )
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
          </SectionCard>

          {/* Featured Products */}
          <SectionCard
            title="Featured Products"
            description="Highlighted products showcase"
            enabled={settings.sections.featuredProducts.enabled}
            onToggle={() => toggleSection("featuredProducts")}
            expanded={expandedSection === "featuredProducts"}
            onToggleExpand={() =>
              setExpandedSection(
                expandedSection === "featuredProducts"
                  ? null
                  : "featuredProducts"
              )
            }
          >
            <SliderControl
              label="Max Products"
              value={settings.sections.featuredProducts.maxProducts}
              min={5}
              max={20}
              onChange={(value) =>
                updateSectionValue("featuredProducts", "maxProducts", value)
              }
            />
          </SectionCard>

          {/* Featured Auctions */}
          <SectionCard
            title="Featured Auctions"
            description="Live and upcoming auctions"
            enabled={settings.sections.featuredAuctions.enabled}
            onToggle={() => toggleSection("featuredAuctions")}
            expanded={expandedSection === "featuredAuctions"}
            onToggleExpand={() =>
              setExpandedSection(
                expandedSection === "featuredAuctions"
                  ? null
                  : "featuredAuctions"
              )
            }
          >
            <SliderControl
              label="Max Auctions"
              value={settings.sections.featuredAuctions.maxAuctions}
              min={5}
              max={20}
              onChange={(value) =>
                updateSectionValue("featuredAuctions", "maxAuctions", value)
              }
            />
          </SectionCard>

          {/* Featured Shops */}
          <SectionCard
            title="Featured Shops"
            description="Top shops with their products"
            enabled={settings.sections.featuredShops.enabled}
            onToggle={() => toggleSection("featuredShops")}
            expanded={expandedSection === "featuredShops"}
            onToggleExpand={() =>
              setExpandedSection(
                expandedSection === "featuredShops" ? null : "featuredShops"
              )
            }
          >
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
          </SectionCard>

          {/* Featured Blogs */}
          <SectionCard
            title="Featured Blogs"
            description="Latest blog posts"
            enabled={settings.sections.featuredBlogs.enabled}
            onToggle={() => toggleSection("featuredBlogs")}
            expanded={expandedSection === "featuredBlogs"}
            onToggleExpand={() =>
              setExpandedSection(
                expandedSection === "featuredBlogs" ? null : "featuredBlogs"
              )
            }
          >
            <SliderControl
              label="Max Blogs"
              value={settings.sections.featuredBlogs.maxBlogs}
              min={5}
              max={20}
              onChange={(value) =>
                updateSectionValue("featuredBlogs", "maxBlogs", value)
              }
            />
          </SectionCard>

          {/* Featured Reviews */}
          <SectionCard
            title="Featured Reviews"
            description="Customer reviews showcase"
            enabled={settings.sections.featuredReviews.enabled}
            onToggle={() => toggleSection("featuredReviews")}
            expanded={expandedSection === "featuredReviews"}
            onToggleExpand={() =>
              setExpandedSection(
                expandedSection === "featuredReviews" ? null : "featuredReviews"
              )
            }
          >
            <SliderControl
              label="Max Reviews"
              value={settings.sections.featuredReviews.maxReviews}
              min={5}
              max={20}
              onChange={(value) =>
                updateSectionValue("featuredReviews", "maxReviews", value)
              }
            />
          </SectionCard>
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

// Section Card Component
interface SectionCardProps {
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
  expanded?: boolean;
  onToggleExpand?: () => void;
  children?: React.ReactNode;
}

function SectionCard({
  title,
  description,
  enabled,
  onToggle,
  expanded,
  onToggleExpand,
  children,
}: SectionCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-4 flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
            <div>
              <h3 className="font-medium text-gray-900">{title}</h3>
              <p className="text-sm text-gray-500">{description}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ToggleSwitch enabled={enabled} onToggle={onToggle} />
          {children && onToggleExpand && (
            <button
              onClick={onToggleExpand}
              className="p-1 hover:bg-gray-100 rounded"
              disabled={!enabled}
            >
              {expanded ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </button>
          )}
        </div>
      </div>
      {expanded && enabled && children && (
        <div className="px-4 pb-4 pt-2 border-t border-gray-200">
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
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}: {value}
      </label>
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
