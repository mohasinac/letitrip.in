"use client";

/**
 * User Notification Preferences Page
 *
 * @status IMPLEMENTED
 * @epic E021 - System Configuration
 *
 * Manage notification preferences across channels (email, SMS, WhatsApp).
 */

import AuthGuard from "@/components/auth/AuthGuard";
import { useLoadingState } from "@letitrip/react-library";
import { logError } from "@/lib/firebase-error-logger";
import {
  Bell,
  CheckCircle,
  Loader2,
  Mail,
  MessageCircle,
  Smartphone,
} from "lucide-react";
import { useEffect, useState } from "react";

interface NotificationPreferences {
  email: {
    orders: boolean;
    auctions: boolean;
    bids: boolean;
    messages: boolean;
    marketing: boolean;
    newsletter: boolean;
  };
  sms: {
    orders: boolean;
    auctions: boolean;
    bids: boolean;
    deliveries: boolean;
  };
  whatsapp: {
    orders: boolean;
    auctions: boolean;
    bids: boolean;
    deliveries: boolean;
    support: boolean;
  };
  push: {
    orders: boolean;
    auctions: boolean;
    bids: boolean;
    messages: boolean;
  };
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  email: {
    orders: true,
    auctions: true,
    bids: true,
    messages: true,
    marketing: false,
    newsletter: false,
  },
  sms: {
    orders: true,
    auctions: true,
    bids: true,
    deliveries: true,
  },
  whatsapp: {
    orders: true,
    auctions: true,
    bids: true,
    deliveries: true,
    support: true,
  },
  push: {
    orders: true,
    auctions: true,
    bids: true,
    messages: true,
  },
};

export default function NotificationsSettingsPage() {
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    data: preferences,
    setData: setPreferences,
    isLoading,
    error,
    execute,
  } = useLoadingState<NotificationPreferences>({
    initialData: DEFAULT_PREFERENCES,
    onLoadError: (err) => {
      logError(err, {
        component: "NotificationPreferences.loadPreferences",
      });
    },
  });

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    await execute(async () => {
      // TODO: Replace with actual API call when backend is ready
      // const data = await settingsService.getNotificationPreferences();
      return DEFAULT_PREFERENCES;
    });
  };

  const handleSave = async () => {
    if (!preferences) return;

    try {
      setSaving(true);
      setSuccess(null);
      // TODO: Replace with actual API call when backend is ready
      // await settingsService.updateNotificationPreferences(preferences);
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate API call
      setSuccess("Notification preferences saved successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error saving preferences:", err);
      logError(err as Error, {
        component: "NotificationPreferences.handleSave",
      });
    } finally {
      setSaving(false);
    }
  };

  const updatePreference = (
    channel: keyof NotificationPreferences,
    type: string,
    value: boolean
  ) => {
    if (!preferences) return;
    setPreferences({
      ...preferences,
      [channel]: {
        ...preferences[channel],
        [type]: value,
      },
    });
  };

  if (isLoading) {
    return (
      <AuthGuard requireAuth>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requireAuth>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Bell className="w-8 h-8" />
              Notification Preferences
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Choose how you want to receive notifications about your orders,
              auctions, and more.
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              <p className="text-green-800 dark:text-green-200">{success}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-800 dark:text-red-200">
                {error instanceof Error ? error.message : String(error)}
              </p>
            </div>
          )}

          {preferences && (
            <div className="space-y-6">
              {/* Email Notifications */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Mail className="w-6 h-6 text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Email Notifications
                  </h2>
                </div>
                <div className="space-y-4">
                  <NotificationToggle
                    label="Order Updates"
                    description="Get notified about order confirmations, shipping, and delivery"
                    checked={preferences.email.orders}
                    onChange={(checked) =>
                      updatePreference("email", "orders", checked)
                    }
                  />
                  <NotificationToggle
                    label="Auction Updates"
                    description="Receive updates when auctions you're watching are ending soon"
                    checked={preferences.email.auctions}
                    onChange={(checked) =>
                      updatePreference("email", "auctions", checked)
                    }
                  />
                  <NotificationToggle
                    label="Bid Activity"
                    description="Get notified when you're outbid or win an auction"
                    checked={preferences.email.bids}
                    onChange={(checked) =>
                      updatePreference("email", "bids", checked)
                    }
                  />
                  <NotificationToggle
                    label="Messages"
                    description="Receive notifications for new messages from sellers or support"
                    checked={preferences.email.messages}
                    onChange={(checked) =>
                      updatePreference("email", "messages", checked)
                    }
                  />
                  <NotificationToggle
                    label="Marketing & Promotions"
                    description="Get updates about sales, new products, and special offers"
                    checked={preferences.email.marketing}
                    onChange={(checked) =>
                      updatePreference("email", "marketing", checked)
                    }
                  />
                  <NotificationToggle
                    label="Newsletter"
                    description="Receive our weekly newsletter with tips and featured products"
                    checked={preferences.email.newsletter}
                    onChange={(checked) =>
                      updatePreference("email", "newsletter", checked)
                    }
                  />
                </div>
              </div>

              {/* SMS Notifications */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Smartphone className="w-6 h-6 text-green-600" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    SMS Notifications
                  </h2>
                </div>
                <div className="space-y-4">
                  <NotificationToggle
                    label="Order Updates"
                    description="Critical order status changes via SMS"
                    checked={preferences.sms.orders}
                    onChange={(checked) =>
                      updatePreference("sms", "orders", checked)
                    }
                  />
                  <NotificationToggle
                    label="Auction Alerts"
                    description="SMS when auctions you're bidding on are ending soon"
                    checked={preferences.sms.auctions}
                    onChange={(checked) =>
                      updatePreference("sms", "auctions", checked)
                    }
                  />
                  <NotificationToggle
                    label="Bid Updates"
                    description="Get notified via SMS when you're outbid"
                    checked={preferences.sms.bids}
                    onChange={(checked) =>
                      updatePreference("sms", "bids", checked)
                    }
                  />
                  <NotificationToggle
                    label="Delivery Updates"
                    description="SMS when your package is out for delivery"
                    checked={preferences.sms.deliveries}
                    onChange={(checked) =>
                      updatePreference("sms", "deliveries", checked)
                    }
                  />
                </div>
              </div>

              {/* WhatsApp Notifications */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center gap-3 mb-4">
                  <MessageCircle className="w-6 h-6 text-green-500" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    WhatsApp Notifications
                  </h2>
                </div>
                <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="text-sm text-green-800 dark:text-green-200">
                    Get instant updates on WhatsApp for time-sensitive
                    notifications
                  </p>
                </div>
                <div className="space-y-4">
                  <NotificationToggle
                    label="Order Updates"
                    description="Receive order confirmations and updates via WhatsApp"
                    checked={preferences.whatsapp.orders}
                    onChange={(checked) =>
                      updatePreference("whatsapp", "orders", checked)
                    }
                  />
                  <NotificationToggle
                    label="Auction Alerts"
                    description="Get WhatsApp messages when auctions are ending"
                    checked={preferences.whatsapp.auctions}
                    onChange={(checked) =>
                      updatePreference("whatsapp", "auctions", checked)
                    }
                  />
                  <NotificationToggle
                    label="Bid Updates"
                    description="Instant WhatsApp alerts for bid activity"
                    checked={preferences.whatsapp.bids}
                    onChange={(checked) =>
                      updatePreference("whatsapp", "bids", checked)
                    }
                  />
                  <NotificationToggle
                    label="Delivery Updates"
                    description="Track your delivery status on WhatsApp"
                    checked={preferences.whatsapp.deliveries}
                    onChange={(checked) =>
                      updatePreference("whatsapp", "deliveries", checked)
                    }
                  />
                  <NotificationToggle
                    label="Customer Support"
                    description="Receive support responses via WhatsApp"
                    checked={preferences.whatsapp.support}
                    onChange={(checked) =>
                      updatePreference("whatsapp", "support", checked)
                    }
                  />
                </div>
              </div>

              {/* Push Notifications */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Bell className="w-6 h-6 text-purple-600" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Push Notifications
                  </h2>
                </div>
                <div className="space-y-4">
                  <NotificationToggle
                    label="Order Updates"
                    description="Browser notifications for order status changes"
                    checked={preferences.push.orders}
                    onChange={(checked) =>
                      updatePreference("push", "orders", checked)
                    }
                  />
                  <NotificationToggle
                    label="Auction Alerts"
                    description="Real-time push notifications for auctions"
                    checked={preferences.push.auctions}
                    onChange={(checked) =>
                      updatePreference("push", "auctions", checked)
                    }
                  />
                  <NotificationToggle
                    label="Bid Updates"
                    description="Get push notifications for bid activity"
                    checked={preferences.push.bids}
                    onChange={(checked) =>
                      updatePreference("push", "bids", checked)
                    }
                  />
                  <NotificationToggle
                    label="Messages"
                    description="Browser notifications for new messages"
                    checked={preferences.push.messages}
                    onChange={(checked) =>
                      updatePreference("push", "messages", checked)
                    }
                  />
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 font-medium"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Preferences"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}

interface NotificationToggleProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function NotificationToggle({
  label,
  description,
  checked,
  onChange,
}: NotificationToggleProps) {
  return (
    <div className="flex items-start justify-between py-3 border-b border-gray-200 dark:border-gray-700 last:border-0">
      <div className="flex-1 pr-4">
        <label className="font-medium text-gray-900 dark:text-white cursor-pointer">
          {label}
        </label>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {description}
        </p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
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
