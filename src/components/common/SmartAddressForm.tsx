"use client";

import { FormLabel } from "@/components/forms";
import { MobileBottomSheet } from "@/components/mobile/MobileBottomSheet";
import {
  ADDRESS_TYPES,
  ALL_INDIAN_STATES,
  DEFAULT_COUNTRY_CODE,
  isValidIndianPhone,
  isValidPincode,
} from "@/constants/location";
import { logError } from "@/lib/firebase-error-logger";
import { addressService } from "@/services/address.service";
import type { AddressFE } from "@/types/frontend/address.types";
import type {
  GeoCoordinates,
  PincodeLookupResult,
  ReverseGeocodeResult,
} from "@/types/shared/location.types";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Briefcase,
  Home,
  Loader2,
  MapPin as MapPinIcon,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { GPSButton } from "./GPSButton";
import { MobileInput } from "./MobileInput";
import { PincodeInput } from "./PincodeInput";
import { StateSelector } from "./StateSelector";

// Validation schema
const SmartAddressSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  mobileNumber: z
    .string()
    .length(10, "Mobile must be 10 digits")
    .refine((val) => isValidIndianPhone(val), "Invalid mobile number"),
  alternateMobileNumber: z
    .string()
    .optional()
    .refine(
      (val) => !val || (val.length === 10 && isValidIndianPhone(val)),
      "Invalid mobile number",
    ),
  countryCode: z.string(),
  addressLine1: z.string().min(5, "Address must be at least 5 characters"),
  addressLine2: z.string().optional(),
  landmark: z.string().optional(),
  area: z.string().min(2, "Area is required"),
  city: z.string().min(2, "City is required"),
  district: z.string().optional(),
  state: z
    .string()
    .min(2, "State is required")
    .refine(
      (val) =>
        ALL_INDIAN_STATES.includes(val as (typeof ALL_INDIAN_STATES)[number]),
      "Invalid state",
    ),
  country: z.string(),
  pincode: z
    .string()
    .length(6, "Pincode must be 6 digits")
    .refine((val) => isValidPincode(val), "Invalid pincode"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  type: z.enum(["home", "work", "other"]),
  customLabel: z
    .string()
    .max(50, "Label must be 50 characters or less")
    .optional(),
  isDefault: z.boolean(),
});

type SmartAddressFormData = z.infer<typeof SmartAddressSchema>;

export interface SmartAddressFormProps {
  addressId?: string | null;
  onClose: () => void;
  onSuccess?: (address: AddressFE) => void;
  initialData?: Partial<SmartAddressFormData>;
  mode?: "modal" | "inline";
  showGPS?: boolean;
  title?: string;
}

export function SmartAddressForm({
  addressId,
  onClose,
  onSuccess,
  initialData,
  mode = "modal",
  showGPS = true,
  title,
}: SmartAddressFormProps) {
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(!!addressId);
  const [gpsCoords, setGpsCoords] = useState<GeoCoordinates | null>(null);

  const isEditing = !!addressId;
  const formTitle = title || (isEditing ? "Edit Address" : "Add New Address");

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SmartAddressFormData>({
    resolver: zodResolver(SmartAddressSchema),
    defaultValues: {
      isDefault: false,
      country: "India",
      countryCode: DEFAULT_COUNTRY_CODE,
      type: "home",
      ...initialData,
    },
  });

  const addressType = watch("type");
  // pincode is watched for future autofill features
  const _pincode = watch("pincode");

  // Load existing address for editing
  const loadAddress = useCallback(async () => {
    if (!addressId) return;

    try {
      setFetchLoading(true);
      const address = await addressService.getById(addressId);

      // Map old address format to smart format
      setValue("fullName", address.fullName);
      setValue(
        "mobileNumber",
        address.phoneNumber.replace(/\D/g, "").slice(-10),
      );
      setValue("addressLine1", address.addressLine1);
      setValue("addressLine2", address.addressLine2 || "");
      setValue("city", address.city);
      setValue("state", address.state);
      setValue("pincode", address.postalCode);
      setValue("country", address.country);
      setValue("type", address.addressType);
      setValue("isDefault", address.isDefault);
    } catch (error) {
      logError(error as Error, {
        component: "SmartAddressForm.fetchAddress",
        metadata: { addressId },
      });
    } finally {
      setFetchLoading(false);
    }
  }, [addressId, setValue]);

  useEffect(() => {
    if (addressId) {
      loadAddress();
    }
  }, [addressId, loadAddress]);

  // Handle pincode lookup completion
  const handlePincodeLookup = useCallback(
    (result: PincodeLookupResult) => {
      if (result.isValid) {
        setValue("city", result.city);
        setValue("district", result.district);
        setValue("state", result.state);

        // Auto-fill area if only one
        if (result.areas.length === 1) {
          setValue("area", result.areas[0]);
        }
      }
    },
    [setValue],
  );

  // Handle area selection from pincode
  const handleAreaSelect = useCallback(
    (area: string) => {
      setValue("area", area);
    },
    [setValue],
  );

  // Handle GPS location detection
  const handleGPSLocation = useCallback(
    (coords: GeoCoordinates) => {
      setGpsCoords(coords);
      setValue("latitude", coords.latitude);
      setValue("longitude", coords.longitude);
    },
    [setValue],
  );

  // Handle reverse geocode address
  const handleGPSAddress = useCallback(
    (address: ReverseGeocodeResult) => {
      // Auto-fill address fields from GPS
      if (address.addressLine1) setValue("addressLine1", address.addressLine1);
      if (address.area) setValue("area", address.area);
      if (address.city) setValue("city", address.city);
      if (address.district) setValue("district", address.district);
      if (address.state) setValue("state", address.state);
      if (address.pincode) setValue("pincode", address.pincode);
    },
    [setValue],
  );

  const onSubmit = async (data: SmartAddressFormData) => {
    try {
      setLoading(true);

      // Transform to old API format for compatibility
      const addressData = {
        fullName: data.fullName,
        phoneNumber: `${data.countryCode}${data.mobileNumber}`,
        addressLine1: data.addressLine1,
        addressLine2:
          [data.addressLine2, data.landmark].filter(Boolean).join(", ") || "",
        city: data.city,
        state: data.state,
        postalCode: data.pincode,
        country: data.country,
        addressType: data.type,
        isDefault: data.isDefault,
      };

      let result: AddressFE;
      if (isEditing && addressId) {
        result = await addressService.update(addressId, addressData);
      } else {
        result = await addressService.create(addressData);
      }

      onSuccess?.(result);
      onClose();
    } catch (error: any) {
      logError(error as Error, {
        component: "SmartAddressForm.onSubmit",
        metadata: { isEditing, addressId },
      });
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Form content
  const formContent = fetchLoading ? (
    <div className="p-12 flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-primary animate-spin" />
    </div>
  ) : (
    <form onSubmit={handleSubmit(onSubmit)} className="p-4 sm:p-6 space-y-6">
      {/* GPS Button */}
      {showGPS && (
        <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <span className="text-sm text-blue-700 dark:text-blue-300">
            Use GPS to auto-fill your address
          </span>
          <GPSButton
            onLocationDetected={handleGPSLocation}
            onAddressDetected={handleGPSAddress}
            variant="text"
            size="sm"
          />
        </div>
      )}

      {/* Contact Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
          Contact Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Full Name */}
          <div>
            <FormLabel htmlFor="address-fullname" required>
              Full Name
            </FormLabel>
            <input
              {...register("fullName")}
              id="address-fullname"
              type="text"
              className="input w-full"
              placeholder="John Doe"
            />
            {errors.fullName && (
              <p className="text-sm text-red-600 mt-1">
                {errors.fullName.message}
              </p>
            )}
          </div>

          {/* Mobile Number */}
          <Controller
            name="mobileNumber"
            control={control}
            render={({ field }) => (
              <MobileInput
                value={field.value || ""}
                onChange={field.onChange}
                countryCode={watch("countryCode")}
                onCountryCodeChange={(code) => setValue("countryCode", code)}
                required
                error={errors.mobileNumber?.message}
                label="Mobile Number"
              />
            )}
          />
        </div>

        {/* Alternate Mobile (Optional) */}
        <Controller
          name="alternateMobileNumber"
          control={control}
          render={({ field }) => (
            <MobileInput
              value={field.value || ""}
              onChange={field.onChange}
              countryCode={watch("countryCode")}
              error={errors.alternateMobileNumber?.message}
              label="Alternate Mobile (Optional)"
              placeholder="Optional"
            />
          )}
        />
      </div>

      {/* Address Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
          Address
        </h3>

        {/* Address Line 1 */}
        <div>
          <FormLabel htmlFor="address-line1" required>
            Flat, House No., Building
          </FormLabel>
          <input
            {...register("addressLine1")}
            id="address-line1"
            type="text"
            className="input w-full"
            placeholder="123, ABC Apartments"
          />
          {errors.addressLine1 && (
            <p className="text-sm text-red-600 mt-1">
              {errors.addressLine1.message}
            </p>
          )}
        </div>

        {/* Address Line 2 */}
        <div>
          <FormLabel htmlFor="address-line2">Street, Road (Optional)</FormLabel>
          <input
            {...register("addressLine2")}
            id="address-line2"
            type="text"
            className="input w-full"
            placeholder="MG Road"
          />
        </div>

        {/* Landmark */}
        <div>
          <FormLabel htmlFor="address-landmark">Landmark (Optional)</FormLabel>
          <input
            {...register("landmark")}
            id="address-landmark"
            type="text"
            className="input w-full"
            placeholder="Near XYZ Mall"
          />
        </div>
      </div>

      {/* Location Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
          Location
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Pincode */}
          <Controller
            name="pincode"
            control={control}
            render={({ field }) => (
              <PincodeInput
                value={field.value || ""}
                onChange={field.onChange}
                onLookupComplete={handlePincodeLookup}
                onAreaSelect={handleAreaSelect}
                required
                error={errors.pincode?.message}
                showAreaSelector
              />
            )}
          />

          {/* Area */}
          <div>
            <FormLabel htmlFor="address-area" required>
              Area/Locality
            </FormLabel>
            <input
              {...register("area")}
              id="address-area"
              type="text"
              className="input w-full"
              placeholder="Koramangala"
            />
            {errors.area && (
              <p className="text-sm text-red-600 mt-1">{errors.area.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* City */}
          <div>
            <FormLabel htmlFor="address-city" required>
              City
            </FormLabel>
            <input
              {...register("city")}
              id="address-city"
              type="text"
              className="input w-full"
              placeholder="Bangalore"
            />
            {errors.city && (
              <p className="text-sm text-red-600 mt-1">{errors.city.message}</p>
            )}
          </div>

          {/* State */}
          <Controller
            name="state"
            control={control}
            render={({ field }) => (
              <StateSelector
                value={field.value || ""}
                onChange={field.onChange}
                required
                error={errors.state?.message}
              />
            )}
          />

          {/* Country */}
          <div>
            <FormLabel htmlFor="address-country">Country</FormLabel>
            <input
              {...register("country")}
              id="address-country"
              type="text"
              className="input w-full bg-gray-50"
              readOnly
            />
          </div>
        </div>
      </div>

      {/* Address Type Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
          Save As
        </h3>

        <div className="flex flex-wrap gap-2">
          {ADDRESS_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setValue("type", type)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-full border
                transition-colors
                ${
                  addressType === type
                    ? "bg-primary text-white border-primary"
                    : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-primary"
                }
              `}
            >
              {type === "home" && <Home className="w-4 h-4" />}
              {type === "work" && <Briefcase className="w-4 h-4" />}
              {type === "other" && <MapPinIcon className="w-4 h-4" />}
              <span className="capitalize">{type}</span>
            </button>
          ))}
        </div>

        {/* Custom Label for "other" type */}
        {addressType === "other" && (
          <div>
            <FormLabel htmlFor="address-custom-label">Custom Label</FormLabel>
            <input
              {...register("customLabel")}
              id="address-custom-label"
              type="text"
              className="input w-full"
              placeholder="e.g., Mom's House, Office HQ"
              maxLength={50}
            />
            {errors.customLabel && (
              <p className="text-sm text-red-600 mt-1">
                {errors.customLabel.message}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Default Checkbox */}
      <div className="flex items-center gap-3 py-2">
        <input
          {...register("isDefault")}
          type="checkbox"
          id="isDefault"
          className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
        />
        <label
          htmlFor="isDefault"
          className="text-sm text-gray-700 dark:text-gray-300"
        >
          Set as default address
        </label>
      </div>

      {/* GPS Coordinates Info */}
      {gpsCoords && (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          📍 Location accuracy: ~{Math.round(gpsCoords.accuracy || 0)}m
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={onClose}
          className="btn-secondary flex-1 touch-target"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn-primary flex-1 touch-target"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              {isEditing ? "Updating..." : "Adding..."}
            </>
          ) : (
            <>{isEditing ? "Update Address" : "Save Address"}</>
          )}
        </button>
      </div>
    </form>
  );

  // Inline mode - just return the form
  if (mode === "inline") {
    return formContent;
  }

  // Modal mode
  return (
    <>
      {/* Mobile: Bottom Sheet */}
      <div className="sm:hidden">
        <MobileBottomSheet
          isOpen={true}
          onClose={onClose}
          title={formTitle}
          snapPoints={["full", "half"]}
        >
          {formContent}
        </MobileBottomSheet>
      </div>

      {/* Desktop: Modal */}
      <div className="hidden sm:block">
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {formTitle}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            {formContent}
          </div>
        </div>
      </div>
    </>
  );
}

export default SmartAddressForm;
