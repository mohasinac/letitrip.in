"use client";

/**
 * Shop Settings Page
 * Task 1.9.1 - Shop Settings Pages
 *
 * Comprehensive shop configuration with tabbed interface:
 * - General Settings: Name, description, logo, banner, contact
 * - Shipping Settings: Charge, free shipping threshold, regions
 * - Payment Settings: Gateway configuration, accepted methods
 * - Default Policies: Return, cancellation, privacy policies
 * - Team Management: Add/remove team members, assign roles
 *
 * ✅ Mobile responsive (tabs → accordion on mobile)
 * ✅ Dark mode support
 *
 * @epic E006 - Shop Management
 */

import { logError } from "@/lib/firebase-error-logger";
import { apiService } from "@/services/api.service";
import {
  FormInput,
  FormLabel,
  FormSelect,
  FormTextarea,
  PageState,
  useLoadingState,
  useWindowResize,
} from "@letitrip/react-library";
import {
  ArrowLeft,
  Building,
  CheckCircle,
  CreditCard,
  FileText,
  Loader2,
  Mail,
  Phone,
  Save,
  Settings,
  Truck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

// ==================== TYPES ====================

type TabId = "general" | "shipping" | "payment" | "policies" | "team";

interface GeneralSettings {
  name: string;
  description: string;
  logo: string | null;
  banner: string | null;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  acceptsOrders: boolean;
  minOrderAmount: number;
}

interface ShippingSettings {
  shippingCharge: number;
  freeShippingAbove: number | null;
  enabledRegions: string[];
  processingTime: string; // e.g., "1-2 business days"
  shippingPartners: string[]; // e.g., ["delhivery", "bluedart"]
  packageWeight: number; // default weight in kg
}

interface PaymentSettings {
  enabledGateways: string[]; // e.g., ["razorpay", "paypal"]
  acceptedMethods: string[]; // e.g., ["card", "upi", "netbanking"]
  codEnabled: boolean;
  codCharge: number;
}

interface PolicySettings {
  returnPolicy: string;
  cancellationPolicy: string;
  privacyPolicy: string;
  termsOfService: string;
  shippingPolicy: string;
}

interface TeamMember {
  id: string;
  email: string;
  name: string;
  role: "admin" | "manager" | "staff";
  status: "active" | "pending";
  addedAt: string;
}

interface TeamSettings {
  members: TeamMember[];
}

interface ShopSettings {
  general: GeneralSettings;
  shipping: ShippingSettings;
  payment: PaymentSettings;
  policies: PolicySettings;
  team: TeamSettings;
}

// ==================== TAB CONFIG ====================

const TABS = [
  { id: "general" as TabId, label: "General", icon: Building },
  { id: "shipping" as TabId, label: "Shipping", icon: Truck },
  { id: "payment" as TabId, label: "Payment", icon: CreditCard },
  { id: "policies" as TabId, label: "Policies", icon: FileText },
  { id: "team" as TabId, label: "Team", icon: Users },
];

const BUSINESS_TYPES = [
  { value: "individual", label: "Individual" },
  { value: "company", label: "Company" },
  { value: "partnership", label: "Partnership" },
];

const STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

const SHIPPING_PARTNERS = [
  { value: "delhivery", label: "Delhivery" },
  { value: "bluedart", label: "Blue Dart" },
  { value: "dtdc", label: "DTDC" },
  { value: "ecom-express", label: "Ecom Express" },
  { value: "india-post", label: "India Post" },
];

const PAYMENT_GATEWAYS = [
  { value: "razorpay", label: "Razorpay" },
  { value: "paypal", label: "PayPal" },
  { value: "stripe", label: "Stripe" },
  { value: "payu", label: "PayU" },
  { value: "phonepe", label: "PhonePe" },
  { value: "cashfree", label: "Cashfree" },
];

const PAYMENT_METHODS = [
  { value: "card", label: "Credit/Debit Cards" },
  { value: "upi", label: "UPI" },
  { value: "netbanking", label: "Net Banking" },
  { value: "wallet", label: "Wallets" },
];

const TEAM_ROLES = [
  { value: "admin", label: "Admin" },
  { value: "manager", label: "Manager" },
  { value: "staff", label: "Staff" },
];

// ==================== COMPONENT ====================

export default function ShopSettingsPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const { isMobile } = useWindowResize();

  // State
  const [activeTab, setActiveTab] = useState<TabId>("general");
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<ShopSettings | null>(null);
  const [newTeamMember, setNewTeamMember] = useState<{
    email: string;
    role: "admin" | "manager" | "staff";
  }>({ email: "", role: "staff" });

  // Loading state
  const { isLoading, error, execute } = useLoadingState<ShopSettings>();

  // Load settings
  const loadSettings = useCallback(async () => {
    try {
      const response = await apiService.get<{ settings: ShopSettings }>(
        `/api/shops/${slug}/settings`
      );
      return response.settings;
    } catch (err) {
      logError(err as Error, {
        component: "ShopSettingsPage.loadSettings",
        metadata: { slug },
      });
      throw err;
    }
  }, [slug]);

  useEffect(() => {
    execute(loadSettings).then((data) => {
      if (data) {
        setSettings(data);
      }
    });
  }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps

  // Save settings
  const saveSettings = useCallback(
    async (section: TabId) => {
      if (!settings) return;

      setSaving(true);
      try {
        await apiService.put(`/api/shops/${slug}/settings/${section}`, {
          settings: settings[section],
        });
        toast.success(
          `${section.charAt(0).toUpperCase() + section.slice(1)} settings saved`
        );
      } catch (err) {
        logError(err as Error, {
          component: "ShopSettingsPage.saveSettings",
          metadata: { slug, section },
        });
        toast.error("Failed to save settings");
      } finally {
        setSaving(false);
      }
    },
    [settings, slug]
  );

  // Add team member
  const addTeamMember = useCallback(async () => {
    if (!newTeamMember.email.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    setSaving(true);
    try {
      await apiService.post(`/api/shops/${slug}/team`, {
        email: newTeamMember.email,
        role: newTeamMember.role,
      });
      toast.success("Team member invited");
      setNewTeamMember({ email: "", role: "staff" });
      // Reload settings
      const data = await loadSettings();
      if (data) {
        setSettings(data);
      }
    } catch (err) {
      logError(err as Error, {
        component: "ShopSettingsPage.addTeamMember",
        metadata: { slug },
      });
      toast.error("Failed to add team member");
    } finally {
      setSaving(false);
    }
  }, [newTeamMember, slug, loadSettings]);

  // Remove team member
  const removeTeamMember = useCallback(
    async (memberId: string) => {
      setSaving(true);
      try {
        await apiService.delete(`/api/shops/${slug}/team/${memberId}`);
        toast.success("Team member removed");
        // Reload settings
        const data = await loadSettings();
        if (data) {
          setSettings(data);
        }
      } catch (err) {
        logError(err as Error, {
          component: "ShopSettingsPage.removeTeamMember",
          metadata: { slug, memberId },
        });
        toast.error("Failed to remove team member");
      } finally {
        setSaving(false);
      }
    },
    [slug, loadSettings]
  );

  // ==================== RENDER ====================

  if (isLoading) {
    return <PageState.Loading message="Loading shop settings..." />;
  }

  if (error || !settings) {
    return (
      <PageState.Error
        message="Failed to load shop settings"
        onRetry={() => execute(loadSettings)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href={`/seller/my-shops/${slug}`}
                className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Shop
              </Link>
            </div>

            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-gray-400" />
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                Shop Settings
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Tabs Navigation - Desktop Sidebar */}
          {!isMobile && (
            <div className="lg:col-span-1">
              <nav className="space-y-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-2">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors
                        ${
                          isActive
                            ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                        }
                      `}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          )}

          {/* Tabs Navigation - Mobile Accordion */}
          {isMobile && (
            <div className="space-y-2">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <div key={tab.id}>
                    <button
                      onClick={() =>
                        setActiveTab(isActive ? "general" : tab.id)
                      }
                      className={`
                        w-full flex items-center justify-between px-4 py-3 rounded-lg
                        bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
                        ${isActive ? "ring-2 ring-blue-500" : ""}
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {tab.label}
                        </span>
                      </div>
                      {isActive && (
                        <CheckCircle className="h-5 w-5 text-blue-600" />
                      )}
                    </button>
                    {isActive && (
                      <div className="mt-2">
                        {renderTabContent(
                          tab.id,
                          settings,
                          setSettings,
                          saveSettings,
                          saving,
                          newTeamMember,
                          setNewTeamMember,
                          addTeamMember,
                          removeTeamMember
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Tab Content - Desktop */}
          {!isMobile && (
            <div className="lg:col-span-3">
              {renderTabContent(
                activeTab,
                settings,
                setSettings,
                saveSettings,
                saving,
                newTeamMember,
                setNewTeamMember,
                addTeamMember,
                removeTeamMember
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ==================== TAB CONTENT ====================

function renderTabContent(
  tab: TabId,
  settings: ShopSettings,
  setSettings: (settings: ShopSettings) => void,
  saveSettings: (section: TabId) => Promise<void>,
  saving: boolean,
  newTeamMember: { email: string; role: "admin" | "manager" | "staff" },
  setNewTeamMember: (member: {
    email: string;
    role: "admin" | "manager" | "staff";
  }) => void,
  addTeamMember: () => Promise<void>,
  removeTeamMember: (memberId: string) => Promise<void>
) {
  switch (tab) {
    case "general":
      return (
        <GeneralSettingsTab
          settings={settings.general}
          onChange={(general) => setSettings({ ...settings, general })}
          onSave={() => saveSettings("general")}
          saving={saving}
        />
      );
    case "shipping":
      return (
        <ShippingSettingsTab
          settings={settings.shipping}
          onChange={(shipping) => setSettings({ ...settings, shipping })}
          onSave={() => saveSettings("shipping")}
          saving={saving}
        />
      );
    case "payment":
      return (
        <PaymentSettingsTab
          settings={settings.payment}
          onChange={(payment) => setSettings({ ...settings, payment })}
          onSave={() => saveSettings("payment")}
          saving={saving}
        />
      );
    case "policies":
      return (
        <PoliciesSettingsTab
          settings={settings.policies}
          onChange={(policies) => setSettings({ ...settings, policies })}
          onSave={() => saveSettings("policies")}
          saving={saving}
        />
      );
    case "team":
      return (
        <TeamSettingsTab
          settings={settings.team}
          newMember={newTeamMember}
          onNewMemberChange={setNewTeamMember}
          onAddMember={addTeamMember}
          onRemoveMember={removeTeamMember}
          saving={saving}
        />
      );
    default:
      return null;
  }
}

// ==================== GENERAL SETTINGS TAB ====================

function GeneralSettingsTab({
  settings,
  onChange,
  onSave,
  saving,
}: {
  settings: GeneralSettings;
  onChange: (settings: GeneralSettings) => void;
  onSave: () => void;
  saving: boolean;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          General Settings
        </h2>
        <button
          onClick={onSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Changes
            </>
          )}
        </button>
      </div>

      <div className="space-y-6">
        {/* Shop Name */}
        <div>
          <FormLabel htmlFor="name" required>
            Shop Name
          </FormLabel>
          <FormInput
            id="name"
            type="text"
            value={settings.name}
            onChange={(e) => onChange({ ...settings, name: e.target.value })}
            placeholder="Enter shop name"
          />
        </div>

        {/* Description */}
        <div>
          <FormLabel htmlFor="description">Description</FormLabel>
          <FormTextarea
            id="description"
            value={settings.description}
            onChange={(e) =>
              onChange({ ...settings, description: e.target.value })
            }
            placeholder="Describe your shop..."
            rows={4}
          />
        </div>

        {/* Email */}
        <div>
          <FormLabel htmlFor="email" required>
            Email
          </FormLabel>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <FormInput
              id="email"
              type="email"
              value={settings.email}
              onChange={(e) => onChange({ ...settings, email: e.target.value })}
              placeholder="shop@example.com"
              className="pl-10"
            />
          </div>
        </div>

        {/* Phone */}
        <div>
          <FormLabel htmlFor="phone" required>
            Phone
          </FormLabel>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <FormInput
              id="phone"
              type="tel"
              value={settings.phone}
              onChange={(e) => onChange({ ...settings, phone: e.target.value })}
              placeholder="+91 98765 43210"
              className="pl-10"
            />
          </div>
        </div>

        {/* Address */}
        <div>
          <FormLabel htmlFor="address">Address</FormLabel>
          <FormTextarea
            id="address"
            value={settings.address}
            onChange={(e) => onChange({ ...settings, address: e.target.value })}
            placeholder="Enter full address"
            rows={2}
          />
        </div>

        {/* City & State */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <FormLabel htmlFor="city">City</FormLabel>
            <FormInput
              id="city"
              type="text"
              value={settings.city}
              onChange={(e) => onChange({ ...settings, city: e.target.value })}
              placeholder="Enter city"
            />
          </div>
          <div>
            <FormLabel htmlFor="state">State</FormLabel>
            <FormSelect
              id="state"
              value={settings.state}
              onChange={(e) => onChange({ ...settings, state: e.target.value })}
              options={[
                { value: "", label: "Select state" },
                ...STATES.map((state) => ({ value: state, label: state })),
              ]}
            />
          </div>
        </div>

        {/* Postal Code */}
        <div>
          <FormLabel htmlFor="postalCode">Postal Code</FormLabel>
          <FormInput
            id="postalCode"
            type="text"
            value={settings.postalCode}
            onChange={(e) =>
              onChange({ ...settings, postalCode: e.target.value })
            }
            placeholder="Enter postal code"
            maxLength={6}
          />
        </div>

        {/* Order Settings */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Order Settings
          </h3>

          <div className="space-y-4">
            {/* Accept Orders */}
            <div className="flex items-center justify-between">
              <div>
                <FormLabel htmlFor="acceptsOrders">Accept Orders</FormLabel>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Allow customers to place orders
                </p>
              </div>
              <input
                id="acceptsOrders"
                type="checkbox"
                checked={settings.acceptsOrders}
                onChange={(e) =>
                  onChange({ ...settings, acceptsOrders: e.target.checked })
                }
                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>

            {/* Min Order Amount */}
            <div>
              <FormLabel htmlFor="minOrderAmount">
                Minimum Order Amount (₹)
              </FormLabel>
              <FormInput
                id="minOrderAmount"
                type="number"
                min="0"
                step="1"
                value={settings.minOrderAmount}
                onChange={(e) =>
                  onChange({
                    ...settings,
                    minOrderAmount: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="0"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== SHIPPING SETTINGS TAB ====================

function ShippingSettingsTab({
  settings,
  onChange,
  onSave,
  saving,
}: {
  settings: ShippingSettings;
  onChange: (settings: ShippingSettings) => void;
  onSave: () => void;
  saving: boolean;
}) {
  const toggleRegion = (region: string) => {
    const enabled = settings.enabledRegions.includes(region);
    onChange({
      ...settings,
      enabledRegions: enabled
        ? settings.enabledRegions.filter((r) => r !== region)
        : [...settings.enabledRegions, region],
    });
  };

  const togglePartner = (partner: string) => {
    const enabled = settings.shippingPartners.includes(partner);
    onChange({
      ...settings,
      shippingPartners: enabled
        ? settings.shippingPartners.filter((p) => p !== partner)
        : [...settings.shippingPartners, partner],
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Shipping Settings
        </h2>
        <button
          onClick={onSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Changes
            </>
          )}
        </button>
      </div>

      <div className="space-y-6">
        {/* Shipping Charge */}
        <div>
          <FormLabel htmlFor="shippingCharge" required>
            Shipping Charge (₹)
          </FormLabel>
          <FormInput
            id="shippingCharge"
            type="number"
            min="0"
            step="1"
            value={settings.shippingCharge}
            onChange={(e) =>
              onChange({
                ...settings,
                shippingCharge: parseFloat(e.target.value) || 0,
              })
            }
            placeholder="0"
          />
        </div>

        {/* Free Shipping Above */}
        <div>
          <FormLabel htmlFor="freeShippingAbove">
            Free Shipping Above (₹)
          </FormLabel>
          <FormInput
            id="freeShippingAbove"
            type="number"
            min="0"
            step="1"
            value={settings.freeShippingAbove || ""}
            onChange={(e) =>
              onChange({
                ...settings,
                freeShippingAbove: e.target.value
                  ? parseFloat(e.target.value)
                  : null,
              })
            }
            placeholder="Enter amount or leave empty"
          />
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Leave empty to disable free shipping
          </p>
        </div>

        {/* Processing Time */}
        <div>
          <FormLabel htmlFor="processingTime">Processing Time</FormLabel>
          <FormInput
            id="processingTime"
            type="text"
            value={settings.processingTime}
            onChange={(e) =>
              onChange({ ...settings, processingTime: e.target.value })
            }
            placeholder="e.g., 1-2 business days"
          />
        </div>

        {/* Package Weight */}
        <div>
          <FormLabel htmlFor="packageWeight">
            Default Package Weight (kg)
          </FormLabel>
          <FormInput
            id="packageWeight"
            type="number"
            min="0"
            step="0.1"
            value={settings.packageWeight}
            onChange={(e) =>
              onChange({
                ...settings,
                packageWeight: parseFloat(e.target.value) || 0,
              })
            }
            placeholder="0.5"
          />
        </div>

        {/* Enabled Regions */}
        <div>
          <FormLabel>Enabled Regions</FormLabel>
          <div className="space-y-2 mt-2">
            {STATES.map((state) => (
              <div key={state} className="flex items-center">
                <input
                  type="checkbox"
                  id={`region-${state}`}
                  checked={settings.enabledRegions.includes(state)}
                  onChange={() => toggleRegion(state)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor={`region-${state}`}
                  className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                >
                  {state}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping Partners */}
        <div>
          <FormLabel>Shipping Partners</FormLabel>
          <div className="space-y-2 mt-2">
            {SHIPPING_PARTNERS.map((partner) => (
              <div key={partner.value} className="flex items-center">
                <input
                  type="checkbox"
                  id={`partner-${partner.value}`}
                  checked={settings.shippingPartners.includes(partner.value)}
                  onChange={() => togglePartner(partner.value)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor={`partner-${partner.value}`}
                  className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                >
                  {partner.label}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== PAYMENT SETTINGS TAB ====================

function PaymentSettingsTab({
  settings,
  onChange,
  onSave,
  saving,
}: {
  settings: PaymentSettings;
  onChange: (settings: PaymentSettings) => void;
  onSave: () => void;
  saving: boolean;
}) {
  const toggleGateway = (gateway: string) => {
    const enabled = settings.enabledGateways.includes(gateway);
    onChange({
      ...settings,
      enabledGateways: enabled
        ? settings.enabledGateways.filter((g) => g !== gateway)
        : [...settings.enabledGateways, gateway],
    });
  };

  const toggleMethod = (method: string) => {
    const enabled = settings.acceptedMethods.includes(method);
    onChange({
      ...settings,
      acceptedMethods: enabled
        ? settings.acceptedMethods.filter((m) => m !== method)
        : [...settings.acceptedMethods, method],
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Payment Settings
        </h2>
        <button
          onClick={onSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Changes
            </>
          )}
        </button>
      </div>

      <div className="space-y-6">
        {/* Payment Gateways */}
        <div>
          <FormLabel>Enabled Payment Gateways</FormLabel>
          <div className="space-y-2 mt-2">
            {PAYMENT_GATEWAYS.map((gateway) => (
              <div key={gateway.value} className="flex items-center">
                <input
                  type="checkbox"
                  id={`gateway-${gateway.value}`}
                  checked={settings.enabledGateways.includes(gateway.value)}
                  onChange={() => toggleGateway(gateway.value)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor={`gateway-${gateway.value}`}
                  className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                >
                  {gateway.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Methods */}
        <div>
          <FormLabel>Accepted Payment Methods</FormLabel>
          <div className="space-y-2 mt-2">
            {PAYMENT_METHODS.map((method) => (
              <div key={method.value} className="flex items-center">
                <input
                  type="checkbox"
                  id={`method-${method.value}`}
                  checked={settings.acceptedMethods.includes(method.value)}
                  onChange={() => toggleMethod(method.value)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor={`method-${method.value}`}
                  className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                >
                  {method.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Cash on Delivery */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Cash on Delivery (COD)
          </h3>

          <div className="space-y-4">
            {/* Enable COD */}
            <div className="flex items-center justify-between">
              <div>
                <FormLabel htmlFor="codEnabled">Enable COD</FormLabel>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Allow cash on delivery payments
                </p>
              </div>
              <input
                id="codEnabled"
                type="checkbox"
                checked={settings.codEnabled}
                onChange={(e) =>
                  onChange({ ...settings, codEnabled: e.target.checked })
                }
                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>

            {/* COD Charge */}
            {settings.codEnabled && (
              <div>
                <FormLabel htmlFor="codCharge">COD Charge (₹)</FormLabel>
                <FormInput
                  id="codCharge"
                  type="number"
                  min="0"
                  step="1"
                  value={settings.codCharge}
                  onChange={(e) =>
                    onChange({
                      ...settings,
                      codCharge: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="0"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== POLICIES SETTINGS TAB ====================

function PoliciesSettingsTab({
  settings,
  onChange,
  onSave,
  saving,
}: {
  settings: PolicySettings;
  onChange: (settings: PolicySettings) => void;
  onSave: () => void;
  saving: boolean;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Default Policies
        </h2>
        <button
          onClick={onSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Changes
            </>
          )}
        </button>
      </div>

      <div className="space-y-6">
        {/* Return Policy */}
        <div>
          <FormLabel htmlFor="returnPolicy">Return Policy</FormLabel>
          <FormTextarea
            id="returnPolicy"
            value={settings.returnPolicy}
            onChange={(e) =>
              onChange({ ...settings, returnPolicy: e.target.value })
            }
            placeholder="Enter return policy..."
            rows={6}
          />
        </div>

        {/* Cancellation Policy */}
        <div>
          <FormLabel htmlFor="cancellationPolicy">
            Cancellation Policy
          </FormLabel>
          <FormTextarea
            id="cancellationPolicy"
            value={settings.cancellationPolicy}
            onChange={(e) =>
              onChange({ ...settings, cancellationPolicy: e.target.value })
            }
            placeholder="Enter cancellation policy..."
            rows={6}
          />
        </div>

        {/* Privacy Policy */}
        <div>
          <FormLabel htmlFor="privacyPolicy">Privacy Policy</FormLabel>
          <FormTextarea
            id="privacyPolicy"
            value={settings.privacyPolicy}
            onChange={(e) =>
              onChange({ ...settings, privacyPolicy: e.target.value })
            }
            placeholder="Enter privacy policy..."
            rows={6}
          />
        </div>

        {/* Terms of Service */}
        <div>
          <FormLabel htmlFor="termsOfService">Terms of Service</FormLabel>
          <FormTextarea
            id="termsOfService"
            value={settings.termsOfService}
            onChange={(e) =>
              onChange({ ...settings, termsOfService: e.target.value })
            }
            placeholder="Enter terms of service..."
            rows={6}
          />
        </div>

        {/* Shipping Policy */}
        <div>
          <FormLabel htmlFor="shippingPolicy">Shipping Policy</FormLabel>
          <FormTextarea
            id="shippingPolicy"
            value={settings.shippingPolicy}
            onChange={(e) =>
              onChange({ ...settings, shippingPolicy: e.target.value })
            }
            placeholder="Enter shipping policy..."
            rows={6}
          />
        </div>
      </div>
    </div>
  );
}

// ==================== TEAM SETTINGS TAB ====================

function TeamSettingsTab({
  settings,
  newMember,
  onNewMemberChange,
  onAddMember,
  onRemoveMember,
  saving,
}: {
  settings: TeamSettings;
  newMember: { email: string; role: "admin" | "manager" | "staff" };
  onNewMemberChange: (member: {
    email: string;
    role: "admin" | "manager" | "staff";
  }) => void;
  onAddMember: () => Promise<void>;
  onRemoveMember: (memberId: string) => Promise<void>;
  saving: boolean;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        Team Management
      </h2>

      {/* Add Team Member */}
      <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Add Team Member
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <FormLabel htmlFor="newMemberEmail">Email</FormLabel>
            <FormInput
              id="newMemberEmail"
              type="email"
              value={newMember.email}
              onChange={(e) =>
                onNewMemberChange({ ...newMember, email: e.target.value })
              }
              placeholder="member@example.com"
            />
          </div>
          <div>
            <FormLabel htmlFor="newMemberRole">Role</FormLabel>
            <FormSelect
              id="newMemberRole"
              value={newMember.role}
              onChange={(e) =>
                onNewMemberChange({
                  ...newMember,
                  role: e.target.value as "admin" | "manager" | "staff",
                })
              }
              options={TEAM_ROLES}
            />
          </div>
        </div>
        <button
          onClick={onAddMember}
          disabled={saving || !newMember.email.trim()}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Adding...
            </>
          ) : (
            "Add Member"
          )}
        </button>
      </div>

      {/* Team Members List */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Current Team Members
        </h3>
        {settings.members.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No team members yet. Add your first member above.
          </p>
        ) : (
          <div className="space-y-3">
            {settings.members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {member.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {member.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                    {member.role}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      member.status === "active"
                        ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                        : "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200"
                    }`}
                  >
                    {member.status}
                  </span>
                  <button
                    onClick={() => onRemoveMember(member.id)}
                    disabled={saving}
                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
