"use client";

import { useState, useEffect } from "react";
import { useAuth, useAddressForm } from "@/hooks";
import {
  useAddress,
  useUpdateAddress,
  useDeleteAddress,
} from "@/hooks/useAddresses";
import { Card, Heading, Button, Input, Select, Checkbox } from "@/components";
import UserTabs from "@/components/user/UserTabs";
import ConfirmDeleteModal from "@/components/modals/ConfirmDeleteModal";
import { useRouter, useParams } from "next/navigation";
import { THEME_CONSTANTS, ADDRESS_TYPES, INDIAN_STATES } from "@/constants";

export default function EditAddressPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const addressId = params?.id as string;

  const { address, loading: addressLoading } = useAddress(addressId);
  const { updateAddress, loading: updating } = useUpdateAddress();
  const { deleteAddress, loading: deleting } = useDeleteAddress();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { formData, errors, handleChange, validate, setFormData } =
    useAddressForm();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (address) {
      setFormData({
        fullName: address.fullName,
        phoneNumber: address.phoneNumber,
        pincode: address.pincode,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2,
        landmark: address.landmark,
        city: address.city,
        state: address.state,
        addressType: address.addressType,
        isDefault: address.isDefault,
      });
    }
  }, [address, setFormData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate() || !user) return;

    try {
      await updateAddress(addressId, user.uid, {
        ...formData,
        addressType: formData.addressType as "home" | "work" | "other",
      });
      router.push("/user/addresses");
    } catch (error) {
      console.error("Error updating address:", error);
      alert("Failed to update address. Please try again.");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteAddress(addressId);
      setShowDeleteModal(false);
      router.push("/user/addresses");
    } catch (error) {
      console.error("Error deleting address:", error);
      alert("Failed to delete address. Please try again.");
    }
  };

  if (authLoading || addressLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user || !address) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-6 md:px-6 max-w-7xl">
      <UserTabs />

      <div className={THEME_CONSTANTS.spacing.stack}>
        <div className="flex items-center justify-between">
          <Heading level={3}>Edit Address</Heading>
          <Button
            variant="secondary"
            onClick={() => setShowDeleteModal(true)}
            className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white"
          >
            Delete Address
          </Button>
        </div>

        <Card className="p-6">
          <form
            onSubmit={handleSubmit}
            className={THEME_CONSTANTS.spacing.stack}
          >
            {/* Contact Information */}
            <div>
              <Heading level={5} className="mb-4">
                Contact Information
              </Heading>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleChange("fullName", e.target.value)}
                  error={errors.fullName}
                  required
                />
                <Input
                  label="Phone Number"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => handleChange("phoneNumber", e.target.value)}
                  error={errors.phoneNumber}
                  required
                />
              </div>
            </div>

            {/* Address Information */}
            <div>
              <Heading level={5} className="mb-4">
                Address Information
              </Heading>
              <div className={THEME_CONSTANTS.spacing.stack}>
                <Input
                  label="Pincode"
                  type="text"
                  value={formData.pincode}
                  onChange={(e) => handleChange("pincode", e.target.value)}
                  error={errors.pincode}
                  maxLength={6}
                  required
                />

                <Input
                  label="Address Line 1"
                  type="text"
                  value={formData.addressLine1}
                  onChange={(e) => handleChange("addressLine1", e.target.value)}
                  error={errors.addressLine1}
                  required
                />

                <Input
                  label="Address Line 2"
                  type="text"
                  value={formData.addressLine2}
                  onChange={(e) => handleChange("addressLine2", e.target.value)}
                />

                <Input
                  label="Landmark (Optional)"
                  type="text"
                  value={formData.landmark}
                  onChange={(e) => handleChange("landmark", e.target.value)}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="City"
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleChange("city", e.target.value)}
                    error={errors.city}
                    required
                  />

                  <Select
                    label="State"
                    value={formData.state}
                    onChange={(e) => handleChange("state", e.target.value)}
                    error={errors.state}
                    required
                    options={[
                      { value: "", label: "Select State" },
                      ...INDIAN_STATES.map((state) => ({
                        value: state,
                        label: state,
                      })),
                    ]}
                  />
                </div>
              </div>
            </div>

            {/* Address Type */}
            <div>
              <Heading level={5} className="mb-4">
                Address Type
              </Heading>
              <div className="flex gap-4">
                {ADDRESS_TYPES.map((type) => (
                  <label
                    key={type.value}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="addressType"
                      value={type.value}
                      checked={formData.addressType === type.value}
                      onChange={(e) =>
                        handleChange("addressType", e.target.value)
                      }
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{type.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Default Address */}
            <Checkbox
              label="Set as default address"
              checked={formData.isDefault}
              onChange={(e) => handleChange("isDefault", e.target.checked)}
            />

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={updating}
                className="flex-1 md:flex-initial"
              >
                {updating ? "Updating..." : "Update Address"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push("/user/addresses")}
                disabled={updating}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>

      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Address?"
        message="Are you sure you want to delete this address? This action cannot be undone."
        isDeleting={deleting}
      />
    </div>
  );
}
