"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Loader2 } from "lucide-react";
import { addressService } from "@/services/address.service";
import { Address } from "@/types";

const AddressSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Phone must be at least 10 digits"),
  line1: z.string().min(5, "Address line 1 is required"),
  line2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().regex(/^\d{6}$/, "Pincode must be 6 digits"),
  country: z.string().min(2, "Country is required"),
  isDefault: z.boolean(),
});

type AddressFormData = z.infer<typeof AddressSchema>;

interface AddressFormProps {
  addressId?: string | null;
  onClose: () => void;
}

export function AddressForm({ addressId, onClose }: AddressFormProps) {
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(!!addressId);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AddressFormData>({
    resolver: zodResolver(AddressSchema),
    defaultValues: {
      isDefault: false,
      country: "India",
    },
  });

  useEffect(() => {
    if (addressId) {
      loadAddress();
    }
  }, [addressId]);

  const loadAddress = async () => {
    if (!addressId) return;

    try {
      setFetchLoading(true);
      const address = await addressService.getById(addressId);

      setValue("name", address.name);
      setValue("phone", address.phone);
      setValue("line1", address.line1);
      setValue("line2", address.line2 || "");
      setValue("city", address.city);
      setValue("state", address.state);
      setValue("pincode", address.pincode);
      setValue("country", address.country);
      setValue("isDefault", address.isDefault);
    } catch (error) {
      console.error("Failed to load address:", error);
    } finally {
      setFetchLoading(false);
    }
  };

  const onSubmit = async (data: AddressFormData) => {
    try {
      setLoading(true);

      if (addressId) {
        await addressService.update(addressId, data);
      } else {
        await addressService.create(data);
      }

      onClose();
    } catch (error: any) {
      console.error("Form error:", error);
      alert(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {addressId ? "Edit Address" : "Add New Address"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {fetchLoading ? (
          <div className="p-12 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("name")}
                  type="text"
                  className="input"
                  placeholder="John Doe"
                />
                {errors.name && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("phone")}
                  type="tel"
                  className="input"
                  placeholder="9876543210"
                />
                {errors.phone && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.phone.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address Line 1 <span className="text-red-500">*</span>
              </label>
              <input
                {...register("line1")}
                type="text"
                className="input"
                placeholder="Flat, House no., Building, Company, Apartment"
              />
              {errors.line1 && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.line1.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address Line 2 (Optional)
              </label>
              <input
                {...register("line2")}
                type="text"
                className="input"
                placeholder="Area, Street, Sector, Village"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("city")}
                  type="text"
                  className="input"
                  placeholder="Mumbai"
                />
                {errors.city && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.city.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("state")}
                  type="text"
                  className="input"
                  placeholder="Maharashtra"
                />
                {errors.state && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.state.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pincode <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("pincode")}
                  type="text"
                  className="input"
                  placeholder="400001"
                  maxLength={6}
                />
                {errors.pincode && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.pincode.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country <span className="text-red-500">*</span>
              </label>
              <input
                {...register("country")}
                type="text"
                className="input"
                placeholder="India"
              />
              {errors.country && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.country.message}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                {...register("isDefault")}
                type="checkbox"
                id="isDefault"
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <label htmlFor="isDefault" className="text-sm text-gray-700">
                Set as default address
              </label>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary flex-1"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary flex-1"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    {addressId ? "Updating..." : "Adding..."}
                  </>
                ) : (
                  <>{addressId ? "Update Address" : "Add Address"}</>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
