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
              <div>
                <label
                  htmlFor="settings-display-name"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Display Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="settings-display-name"
                    type="text"
                    value={profile.displayName}
                    onChange={(e) =>
                      setProfile({ ...profile, displayName: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Your display name"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="settings-email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="settings-email"
                    type="email"
                    value={profile.email}
                    onChange={(e) =>
                      setProfile({ ...profile, email: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="settings-phone"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="settings-phone"
                    type="tel"
                    value={profile.phone}
                    onChange={(e) =>
                      setProfile({ ...profile, phone: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+91 9876543210"
                  />
                </div>
              </div>
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
              <div>
                <label
                  htmlFor="settings-business-name"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Business Name
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="settings-business-name"
                    type="text"
                    value={profile.businessName}
                    onChange={(e) =>
                      setProfile({ ...profile, businessName: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Your business name"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="settings-business-type"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Business Type
                </label>
                <select
                  id="settings-business-type"
                  value={profile.businessType}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      businessType: e.target
                        .value as SellerProfile["businessType"],
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="individual">Individual</option>
                  <option value="company">Company</option>
                  <option value="partnership">Partnership</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="settings-gst"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  GST Number
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="settings-gst"
                    type="text"
                    value={profile.gstNumber}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        gstNumber: e.target.value.toUpperCase(),
                      })
                    }
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                    placeholder="22AAAAA0000A1Z5"
                    maxLength={15}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Optional. Required for businesses with turnover over ₹40 lakhs
                </p>
              </div>

              <div>
                <label
                  htmlFor="settings-pan"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  PAN Number
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="settings-pan"
                    type="text"
                    value={profile.panNumber}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        panNumber: e.target.value.toUpperCase(),
                      })
                    }
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                    placeholder="ABCDE1234F"
                    maxLength={10}
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                Business Address
              </h3>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="settings-street"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Street Address
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <textarea
                      id="settings-street"
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
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Street address, building, floor"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label
                      htmlFor="settings-city"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      City
                    </label>
                    <input
                      id="settings-city"
                      type="text"
                      value={profile.address.city}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          address: { ...profile.address, city: e.target.value },
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="City"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="settings-state"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      State
                    </label>
                    <input
                      id="settings-state"
                      type="text"
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
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="State"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="settings-pincode"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      PIN Code
                    </label>
                    <input
                      id="settings-pincode"
                      type="text"
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
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="123456"
                      maxLength={6}
                    />
                  </div>
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
                <div>
                  <label
                    htmlFor="payout-account-holder"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Account Holder Name
                  </label>
                  <input
                    id="payout-account-holder"
                    type="text"
                    value={payout.accountHolderName}
                    onChange={(e) =>
                      setPayout({
                        ...payout,
                        accountHolderName: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="As per bank records"
                  />
                </div>

                <div>
                  <label
                    htmlFor="payout-bank-name"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Bank Name
                  </label>
                  <input
                    id="payout-bank-name"
                    type="text"
                    value={payout.bankName}
                    onChange={(e) =>
                      setPayout({ ...payout, bankName: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Bank name"
                  />
                </div>

                <div>
                  <label
                    htmlFor="payout-account-number"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Account Number
                  </label>
                  <input
                    id="payout-account-number"
                    type="text"
                    value={payout.accountNumber}
                    onChange={(e) =>
                      setPayout({
                        ...payout,
                        accountNumber: e.target.value.replace(/\D/g, ""),
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                    placeholder="Account number"
                  />
                </div>

                <div>
                  <label
                    htmlFor="payout-ifsc"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    IFSC Code
                  </label>
                  <input
                    id="payout-ifsc"
                    type="text"
                    value={payout.ifscCode}
                    onChange={(e) =>
                      setPayout({
                        ...payout,
                        ifscCode: e.target.value.toUpperCase(),
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                    placeholder="ABCD0001234"
                    maxLength={11}
                  />
                </div>
              </div>
            )}

            {payout.preferredMethod === "upi" && (
              <div>
                <label
                  htmlFor="payout-upi"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  UPI ID
                </label>
                <input
                  id="payout-upi"
                  type="text"
                  value={payout.upiId}
                  onChange={(e) =>
                    setPayout({ ...payout, upiId: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="yourname@upi"
                />
              </div>
            )}

            <div>
              <label
                htmlFor="payout-min-amount"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Minimum Payout Amount (₹)
              </label>
              <select
                id="payout-min-amount"
                value={payout.minPayoutAmount}
                onChange={(e) =>
                  setPayout({
                    ...payout,
                    minPayoutAmount: Number(e.target.value),
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={500}>₹500</option>
                <option value={1000}>₹1,000</option>
                <option value={2000}>₹2,000</option>
                <option value={5000}>₹5,000</option>
              </select>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Payouts will be processed only when your balance exceeds this
                amount
              </p>
            </div>
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
