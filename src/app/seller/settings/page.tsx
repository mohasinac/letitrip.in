"use client";

/**
 * Seller Settings Page
 *
 * @status IMPLEMENTED
 * @epic E006 - Shop Management
 *
 * Manages seller-specific settings:
 * - Profile settings
 * - Notification preferences
 * - Payout settings
 * - Business information
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Bell,
  CreditCard,
  Building,
  Save,
  Loader2,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  FileText,
  BellRing,
  BellOff,
  Wallet,
  Building2,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { apiService } from "@/services/api.service";
import {
  FormInput,
  FormSelect,
  FormCheckbox,
  FormTextarea,
} from "@/components/forms";

interface SellerProfile {
  displayName: string;
  email: string;
  phone: string;
  businessName: string;
  businessType: "individual" | "company" | "partnership";
  gstNumber: string;
  panNumber: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
}

interface NotificationPreferences {
  emailNotifications: boolean;
  orderAlerts: boolean;
  reviewAlerts: boolean;
  payoutAlerts: boolean;
  promotionalEmails: boolean;
  lowStockAlerts: boolean;
  dailyDigest: boolean;
}

interface PayoutSettings {
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  upiId: string;
  preferredMethod: "bank" | "upi";
  minPayoutAmount: number;
}

type TabId = "profile" | "notifications" | "payout" | "business";

export default function SellerSettingsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [profile, setProfile] = useState<SellerProfile>({
    displayName: "",
    email: "",
    phone: "",
    businessName: "",
    businessType: "individual",
    gstNumber: "",
    panNumber: "",
    address: {
      street: "",
      city: "",
      state: "",
      pincode: "",
    },
  });

  const [notifications, setNotifications] = useState<NotificationPreferences>({
    emailNotifications: true,
    orderAlerts: true,
    reviewAlerts: true,
    payoutAlerts: true,
    promotionalEmails: false,
    lowStockAlerts: true,
    dailyDigest: true,
  });

  const [payout, setPayout] = useState<PayoutSettings>({
    accountHolderName: "",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    upiId: "",
    preferredMethod: "bank",
    minPayoutAmount: 500,
  });

  useEffect(() => {
    loadSettings();
  }, [user]);

  const loadSettings = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Load seller settings from API
      const response = await apiService.get<{
        profile: SellerProfile;
        notifications: NotificationPreferences;
        payout: PayoutSettings;
      }>("/api/seller/settings");

      if (response.profile) setProfile(response.profile);
      if (response.notifications) setNotifications(response.notifications);
      if (response.payout) setPayout(response.payout);
    } catch (err) {
      console.error("Error loading settings:", err);
      // Use defaults if API fails
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const data = {
        profile:
          activeTab === "profile" || activeTab === "business"
            ? profile
            : undefined,
        notifications:
          activeTab === "notifications" ? notifications : undefined,
        payout: activeTab === "payout" ? payout : undefined,
      };

      await apiService.put("/api/seller/settings", data);

      setSuccess("Settings saved successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error saving settings:", err);
      setError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: "profile" as const, label: "Profile", icon: User },
    { id: "business" as const, label: "Business", icon: Building },
    { id: "notifications" as const, label: "Notifications", icon: Bell },
    { id: "payout" as const, label: "Payout", icon: CreditCard },
  ];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6" />
          <div className="space-y-4">
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
            <Link
              href="/seller"
              className="hover:text-blue-600 dark:hover:text-blue-400"
            >
              Seller Dashboard
            </Link>
            <span>/</span>
            <span>Settings</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Seller Settings
          </h1>
        </div>
        <Link
          href="/seller"
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
          <p className="text-green-800 dark:text-green-200">{success}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? "bg-blue-600 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Profile Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                id="settings-display-name"
                label="Display Name"
                value={profile.displayName}
                onChange={(e) =>
                  setProfile({ ...profile, displayName: e.target.value })
                }
                leftIcon={<User className="w-5 h-5" />}
                placeholder="Your display name"
              />

              <FormInput
                id="settings-email"
                label="Email Address"
                type="email"
                value={profile.email}
                onChange={(e) =>
                  setProfile({ ...profile, email: e.target.value })
                }
                leftIcon={<Mail className="w-5 h-5" />}
                placeholder="you@example.com"
              />

              <FormInput
                id="settings-phone"
                label="Phone Number"
                type="tel"
                value={profile.phone}
                onChange={(e) =>
                  setProfile({ ...profile, phone: e.target.value })
                }
                leftIcon={<Phone className="w-5 h-5" />}
                placeholder="+91 9876543210"
              />
            </div>
          </div>
        )}

        {/* Business Tab */}
        {activeTab === "business" && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Business Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                id="settings-business-name"
                label="Business Name"
                value={profile.businessName}
                onChange={(e) =>
                  setProfile({ ...profile, businessName: e.target.value })
                }
                leftIcon={<Building2 className="w-5 h-5" />}
                placeholder="Your business name"
              />

              <FormSelect
                id="settings-business-type"
                label="Business Type"
                value={profile.businessType}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    businessType: e.target
                      .value as SellerProfile["businessType"],
                  })
                }
                options={[
                  { value: "individual", label: "Individual" },
                  { value: "company", label: "Company" },
                  { value: "partnership", label: "Partnership" },
                ]}
              />

              <div>
                <FormInput
                  id="settings-gst"
                  label="GST Number"
                  value={profile.gstNumber}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      gstNumber: e.target.value.toUpperCase(),
                    })
                  }
                  leftIcon={<FileText className="w-5 h-5" />}
                  placeholder="22AAAAA0000A1Z5"
                  maxLength={15}
                  className="font-mono"
                  helperText="Optional. Required for businesses with turnover over ₹40 lakhs"
                />
              </div>

              <FormInput
                id="settings-pan"
                label="PAN Number"
                value={profile.panNumber}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    panNumber: e.target.value.toUpperCase(),
                  })
                }
                leftIcon={<FileText className="w-5 h-5" />}
                placeholder="ABCDE1234F"
                maxLength={10}
                className="font-mono"
              />
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                Business Address
              </h3>

              <div className="space-y-4">
                <FormTextarea
                  id="settings-street"
                  label="Street Address"
                  value={profile.address.street}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      address: {
                        ...profile.address,
                        street: e.target.value,
                      },
                    })
                  }
                  rows={2}
                  leftIcon={<MapPin className="w-5 h-5" />}
                  placeholder="Street address, building, floor"
                  className="resize-none"
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormInput
                    id="settings-city"
                    label="City"
                    value={profile.address.city}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        address: { ...profile.address, city: e.target.value },
                      })
                    }
                    placeholder="City"
                  />

                  <FormInput
                    id="settings-state"
                    label="State"
                    value={profile.address.state}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        address: {
                          ...profile.address,
                          state: e.target.value,
                        },
                      })
                    }
                    placeholder="State"
                  />

                  <FormInput
                    id="settings-pincode"
                    label="PIN Code"
                    value={profile.address.pincode}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        address: {
                          ...profile.address,
                          pincode: e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 6),
                        },
                      })
                    }
                    placeholder="123456"
                    maxLength={6}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === "notifications" && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Notification Preferences
            </h2>

            <div className="space-y-4">
              <NotificationToggle
                icon={BellRing}
                label="Email Notifications"
                description="Receive notifications via email"
                checked={notifications.emailNotifications}
                onChange={(checked) =>
                  setNotifications({
                    ...notifications,
                    emailNotifications: checked,
                  })
                }
              />

              <NotificationToggle
                icon={Bell}
                label="Order Alerts"
                description="Get notified when you receive new orders"
                checked={notifications.orderAlerts}
                onChange={(checked) =>
                  setNotifications({ ...notifications, orderAlerts: checked })
                }
              />

              <NotificationToggle
                icon={Bell}
                label="Review Alerts"
                description="Get notified when customers leave reviews"
                checked={notifications.reviewAlerts}
                onChange={(checked) =>
                  setNotifications({ ...notifications, reviewAlerts: checked })
                }
              />

              <NotificationToggle
                icon={Wallet}
                label="Payout Alerts"
                description="Get notified about payout status changes"
                checked={notifications.payoutAlerts}
                onChange={(checked) =>
                  setNotifications({ ...notifications, payoutAlerts: checked })
                }
              />

              <NotificationToggle
                icon={Bell}
                label="Low Stock Alerts"
                description="Get notified when products are running low on stock"
                checked={notifications.lowStockAlerts}
                onChange={(checked) =>
                  setNotifications({
                    ...notifications,
                    lowStockAlerts: checked,
                  })
                }
              />

              <NotificationToggle
                icon={Mail}
                label="Daily Digest"
                description="Receive a daily summary of your store activity"
                checked={notifications.dailyDigest}
                onChange={(checked) =>
                  setNotifications({ ...notifications, dailyDigest: checked })
                }
              />

              <NotificationToggle
                icon={BellOff}
                label="Promotional Emails"
                description="Receive marketing and promotional emails"
                checked={notifications.promotionalEmails}
                onChange={(checked) =>
                  setNotifications({
                    ...notifications,
                    promotionalEmails: checked,
                  })
                }
              />
            </div>
          </div>
        )}

        {/* Payout Tab */}
        {activeTab === "payout" && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Payout Settings
            </h2>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Payouts are processed weekly on Wednesdays. Minimum payout
                amount is ₹{payout.minPayoutAmount}.
              </p>
            </div>

            <div id="payout-method-group">
              <label
                htmlFor="payout-method-group"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3"
              >
                Preferred Payout Method
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 p-4 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                  <input
                    type="radio"
                    name="payoutMethod"
                    value="bank"
                    checked={payout.preferredMethod === "bank"}
                    onChange={() =>
                      setPayout({ ...payout, preferredMethod: "bank" })
                    }
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-900 dark:text-white">
                    Bank Transfer
                  </span>
                </label>
                <label className="flex items-center gap-2 p-4 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                  <input
                    type="radio"
                    name="payoutMethod"
                    value="upi"
                    checked={payout.preferredMethod === "upi"}
                    onChange={() =>
                      setPayout({ ...payout, preferredMethod: "upi" })
                    }
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-900 dark:text-white">UPI</span>
                </label>
              </div>
            </div>

            {payout.preferredMethod === "bank" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  id="payout-account-holder"
                  label="Account Holder Name"
                  value={payout.accountHolderName}
                  onChange={(e) =>
                    setPayout({
                      ...payout,
                      accountHolderName: e.target.value,
                    })
                  }
                  placeholder="As per bank records"
                />

                <FormInput
                  id="payout-bank-name"
                  label="Bank Name"
                  value={payout.bankName}
                  onChange={(e) =>
                    setPayout({ ...payout, bankName: e.target.value })
                  }
                  placeholder="Bank name"
                />

                <FormInput
                  id="payout-account-number"
                  label="Account Number"
                  value={payout.accountNumber}
                  onChange={(e) =>
                    setPayout({
                      ...payout,
                      accountNumber: e.target.value.replace(/\D/g, ""),
                    })
                  }
                  placeholder="Account number"
                  className="font-mono"
                />

                <FormInput
                  id="payout-ifsc"
                  label="IFSC Code"
                  value={payout.ifscCode}
                  onChange={(e) =>
                    setPayout({
                      ...payout,
                      ifscCode: e.target.value.toUpperCase(),
                    })
                  }
                  placeholder="ABCD0001234"
                  maxLength={11}
                  className="font-mono"
                />
              </div>
            )}

            {payout.preferredMethod === "upi" && (
              <FormInput
                id="payout-upi"
                label="UPI ID"
                value={payout.upiId}
                onChange={(e) =>
                  setPayout({ ...payout, upiId: e.target.value })
                }
                placeholder="yourname@upi"
              />
            )}

            <FormSelect
              id="payout-min-amount"
              label="Minimum Payout Amount (₹)"
              value={payout.minPayoutAmount}
              onChange={(e) =>
                setPayout({
                  ...payout,
                  minPayoutAmount: Number(e.target.value),
                })
              }
              options={[
                { value: "500", label: "₹500" },
                { value: "1000", label: "₹1,000" },
                { value: "2000", label: "₹2,000" },
                { value: "5000", label: "₹5,000" },
              ]}
              helperText="Payouts will be processed only when your balance exceeds this amount"
            />
          </div>
        )}

        {/* Save Button */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.push("/seller")}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Notification toggle component
function NotificationToggle({
  icon: Icon,
  label,
  description,
  checked,
  onChange,
}: {
  icon: React.ElementType;
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </div>
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{label}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {description}
          </p>
        </div>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600" />
      </label>
    </div>
  );
}
