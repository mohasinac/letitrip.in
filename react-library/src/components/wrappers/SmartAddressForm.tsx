/**
 * SmartAddressForm Component
 *
 * Framework-agnostic address form with smart features.
 * Supports pincode lookup, GPS location, and validation.
 *
 * @example
 * ```tsx
 * <SmartAddressForm
 *   mode="inline"
 *   initialData={address}
 *   onSubmit={async (data) => {
 *     await addressService.save(data);
 *   }}
 *   onCancel={() => setShowForm(false)}
 *   pincodeService={{
 *     lookup: (pincode) => apiService.get(`/location/pincode/${pincode}`),
 *   }}
 *   gpsService={{
 *     getCurrentPosition: () => new Promise((resolve) => {
 *       navigator.geolocation.getCurrentPosition(
 *         (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
 *         (err) => reject(err)
 *       );
 *     }),
 *   }}
 * />
 * ```
 */

import { ReactNode, useState } from "react";

export interface GeoCoordinates {
  latitude: number;
  longitude: number;
}

export interface PincodeLookupResult {
  isValid: boolean;
  city: string;
  district?: string;
  state: string;
  areas: string[];
}

export interface AddressFormData {
  fullName: string;
  mobileNumber: string;
  alternateMobileNumber?: string;
  countryCode: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  area: string;
  city: string;
  district?: string;
  state: string;
  country: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  type: "home" | "work" | "other";
  customLabel?: string;
  isDefault: boolean;
}

export interface PincodeService {
  lookup: (pincode: string) => Promise<PincodeLookupResult>;
}

export interface GPSService {
  getCurrentPosition: () => Promise<GeoCoordinates>;
}

export interface SmartAddressFormProps {
  /** Initial form data */
  initialData?: Partial<AddressFormData>;

  /** Form submit handler */
  onSubmit: (data: AddressFormData) => Promise<void>;

  /** Form cancel handler */
  onCancel: () => void;

  /** Display mode */
  mode?: "modal" | "inline";

  /** Whether to show GPS button */
  showGPS?: boolean;

  /** Form title */
  title?: string;

  /** Pincode lookup service (injectable) */
  pincodeService?: PincodeService;

  /** GPS location service (injectable) */
  gpsService?: GPSService;

  /** Error handler */
  onError?: (error: Error) => void;

  /** Loading state indicator */
  loading?: boolean;

  /** Custom icons */
  icons?: {
    home?: ReactNode;
    work?: ReactNode;
    other?: ReactNode;
    gps?: ReactNode;
  };
}

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

// Default icons
const defaultIcons = {
  home: (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
      />
    </svg>
  ),
  work: (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  ),
  other: (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  ),
  gps: (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  ),
};

export function SmartAddressForm({
  initialData,
  onSubmit,
  onCancel,
  mode = "inline",
  showGPS = true,
  title = "Address Form",
  pincodeService,
  gpsService,
  onError,
  loading = false,
  icons = defaultIcons,
}: SmartAddressFormProps) {
  const [formData, setFormData] = useState<Partial<AddressFormData>>({
    country: "India",
    countryCode: "+91",
    type: "home",
    isDefault: false,
    ...initialData,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);

  const mergedIcons = { ...defaultIcons, ...icons };

  const handlePincodeLookup = async (pincode: string) => {
    if (!pincodeService || pincode.length !== 6) return;

    try {
      setPincodeLoading(true);
      const result = await pincodeService.lookup(pincode);

      if (result.isValid) {
        setFormData((prev) => ({
          ...prev,
          city: result.city,
          district: result.district,
          state: result.state,
        }));

        // Auto-fill area if only one
        if (result.areas.length === 1) {
          setFormData((prev) => ({ ...prev, area: result.areas[0] }));
        }
      }
    } catch (error) {
      onError?.(error as Error);
    } finally {
      setPincodeLoading(false);
    }
  };

  const handleGPSLocation = async () => {
    if (!gpsService) return;

    try {
      setGpsLoading(true);
      const coords = await gpsService.getCurrentPosition();

      setFormData((prev) => ({
        ...prev,
        latitude: coords.latitude,
        longitude: coords.longitude,
      }));
    } catch (error) {
      onError?.(error as Error);
    } finally {
      setGpsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    const newErrors: Record<string, string> = {};

    if (!formData.fullName || formData.fullName.length < 2) {
      newErrors.fullName = "Name must be at least 2 characters";
    }
    if (!formData.mobileNumber || formData.mobileNumber.length !== 10) {
      newErrors.mobileNumber = "Mobile must be 10 digits";
    }
    if (!formData.addressLine1 || formData.addressLine1.length < 5) {
      newErrors.addressLine1 = "Address must be at least 5 characters";
    }
    if (!formData.city) {
      newErrors.city = "City is required";
    }
    if (!formData.state) {
      newErrors.state = "State is required";
    }
    if (!formData.pincode || formData.pincode.length !== 6) {
      newErrors.pincode = "Pincode must be 6 digits";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await onSubmit(formData as AddressFormData);
    } catch (error) {
      onError?.(error as Error);
    }
  };

  const addressTypes: Array<{
    value: AddressFormData["type"];
    label: string;
    icon: ReactNode;
  }> = [
    { value: "home", label: "Home", icon: mergedIcons.home },
    { value: "work", label: "Work", icon: mergedIcons.work },
    { value: "other", label: "Other", icon: mergedIcons.other },
  ];

  return (
    <div className={mode === "modal" ? "max-w-2xl mx-auto" : ""}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {title}
          </h2>
          {mode === "modal" && (
            <button
              type="button"
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ×
            </button>
          )}
        </div>

        {/* Contact Information */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Contact Information
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              value={formData.fullName || ""}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            {errors.fullName && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.fullName}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Mobile Number *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.countryCode || "+91"}
                onChange={(e) =>
                  setFormData({ ...formData, countryCode: e.target.value })
                }
                className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <input
                type="tel"
                value={formData.mobileNumber || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    mobileNumber: e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 10),
                  })
                }
                placeholder="10-digit mobile number"
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            {errors.mobileNumber && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.mobileNumber}
              </p>
            )}
          </div>
        </div>

        {/* Address Details */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Address Details
            </h3>
            {showGPS && gpsService && (
              <button
                type="button"
                onClick={handleGPSLocation}
                disabled={gpsLoading}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50"
              >
                {mergedIcons.gps}
                {gpsLoading ? "Getting location..." : "Use GPS"}
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Pincode *
              </label>
              <input
                type="text"
                value={formData.pincode || ""}
                onChange={(e) => {
                  const pincode = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setFormData({ ...formData, pincode });
                  if (pincode.length === 6) {
                    handlePincodeLookup(pincode);
                  }
                }}
                maxLength={6}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              {pincodeLoading && (
                <p className="mt-1 text-sm text-gray-500">
                  Looking up pincode...
                </p>
              )}
              {errors.pincode && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.pincode}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                State *
              </label>
              <input
                type="text"
                value={formData.state || ""}
                onChange={(e) =>
                  setFormData({ ...formData, state: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              {errors.state && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.state}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                City *
              </label>
              <input
                type="text"
                value={formData.city || ""}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              {errors.city && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.city}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Area
              </label>
              <input
                type="text"
                value={formData.area || ""}
                onChange={(e) =>
                  setFormData({ ...formData, area: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Address Line 1 *
            </label>
            <input
              type="text"
              value={formData.addressLine1 || ""}
              onChange={(e) =>
                setFormData({ ...formData, addressLine1: e.target.value })
              }
              placeholder="House/Flat No., Building Name"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            {errors.addressLine1 && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.addressLine1}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Address Line 2
            </label>
            <input
              type="text"
              value={formData.addressLine2 || ""}
              onChange={(e) =>
                setFormData({ ...formData, addressLine2: e.target.value })
              }
              placeholder="Street, Locality (Optional)"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Landmark
            </label>
            <input
              type="text"
              value={formData.landmark || ""}
              onChange={(e) =>
                setFormData({ ...formData, landmark: e.target.value })
              }
              placeholder="Near hospital, mall, etc. (Optional)"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Address Type */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Address Type
          </h3>

          <div className="grid grid-cols-3 gap-3">
            {addressTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setFormData({ ...formData, type: type.value })}
                className={cn(
                  "flex flex-col items-center gap-2 p-3 border-2 rounded-lg transition-colors",
                  formData.type === type.value
                    ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400"
                    : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-600 dark:text-gray-400"
                )}
              >
                {type.icon}
                <span className="text-sm font-medium">{type.label}</span>
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.isDefault || false}
              onChange={(e) =>
                setFormData({ ...formData, isDefault: e.target.checked })
              }
              className="w-4 h-4 text-yellow-500 border-gray-300 rounded focus:ring-yellow-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Set as default address
            </span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-yellow-500 rounded-lg hover:bg-yellow-600 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Address"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default SmartAddressForm;
