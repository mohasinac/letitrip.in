"use client";

import React, { useState, useEffect } from "react";
import { MapPin, Plus, Home, Briefcase, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { addressService } from "@/services/address.service";
import { SmartAddressForm } from "./SmartAddressForm";
import type { AddressFE } from "@/types/frontend/address.types";

export interface AddressSelectorWithCreateProps {
  value?: string | null;
  onChange: (addressId: string, address: AddressFE) => void;
  filterType?: "home" | "work" | "other" | "all";
  required?: boolean;
  error?: string;
  label?: string;
  autoSelectDefault?: boolean;
  className?: string;
}

export function AddressSelectorWithCreate({
  value,
  onChange,
  filterType = "all",
  required = false,
  error,
  label = "Select Address",
  autoSelectDefault = true,
  className = "",
}: AddressSelectorWithCreateProps) {
  const [addresses, setAddresses] = useState<AddressFE[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(value || null);

  // Load addresses
  useEffect(() => {
    loadAddresses();
  }, []);

  // Auto-select default address
  useEffect(() => {
    if (autoSelectDefault && addresses.length > 0 && !selectedId) {
      const defaultAddress = addresses.find((addr) => addr.isDefault);
      if (defaultAddress) {
        setSelectedId(defaultAddress.id);
        onChange(defaultAddress.id, defaultAddress);
      }
    }
  }, [addresses, autoSelectDefault, selectedId, onChange]);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const data = await addressService.getAll();

      // Filter by type if specified
      const filtered =
        filterType === "all"
          ? data
          : data.filter((addr) => addr.addressType === filterType);

      setAddresses(filtered);
    } catch (error) {
      console.error("Failed to load addresses:", error);
      toast.error("Failed to load addresses");
    } finally {
      setLoading(false);
    }
  };

  const handleAddressSelect = (address: AddressFE) => {
    setSelectedId(address.id);
    onChange(address.id, address);
  };

  const handleAddressCreated = (newAddress: AddressFE) => {
    setAddresses((prev) => [...prev, newAddress]);
    setSelectedId(newAddress.id);
    onChange(newAddress.id, newAddress);
    setShowForm(false);
    toast.success("Address added successfully");
  };

  const getAddressIcon = (type: string) => {
    switch (type) {
      case "home":
        return <Home className="w-4 h-4" />;
      case "work":
        return <Briefcase className="w-4 h-4" />;
      default:
        return <MapPin className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className={`space-y-2 ${className}`}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="flex items-center justify-center p-8 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
          <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
            Loading addresses...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Address Cards */}
      <div className="space-y-3">
        {addresses.length === 0 ? (
          <div className="text-center p-6 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              No saved addresses found
            </p>
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Your First Address
            </button>
          </div>
        ) : (
          <>
            {addresses.map((address) => (
              <button
                key={address.id}
                type="button"
                onClick={() => handleAddressSelect(address)}
                className={`
                  w-full text-left p-4 rounded-lg border-2 transition-all
                  ${
                    selectedId === address.id
                      ? "border-primary bg-primary/5 dark:bg-primary/10"
                      : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary/50"
                  }
                `}
              >
                <div className="flex items-start gap-3">
                  {/* Icon & Checkmark */}
                  <div className="flex-shrink-0 mt-0.5">
                    {selectedId === address.id ? (
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    ) : (
                      <div className="text-gray-400 dark:text-gray-500">
                        {getAddressIcon(address.addressType)}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {address.fullName}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                        {getAddressIcon(address.addressType)}
                        <span className="capitalize">{address.typeLabel}</span>
                      </span>
                      {address.isDefault && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                          Default
                        </span>
                      )}
                    </div>

                    {/* Address Lines */}
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {address.addressLine1}
                      {address.addressLine2 && `, ${address.addressLine2}`}
                    </p>

                    {/* City, State, Pincode */}
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {address.city}, {address.state} {address.postalCode}
                    </p>

                    {/* Phone */}
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                      📞 {address.phoneNumber}
                    </p>
                  </div>
                </div>
              </button>
            ))}

            {/* Add New Button */}
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="w-full p-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-all"
            >
              <div className="flex items-center justify-center gap-2 text-primary">
                <Plus className="w-5 h-5" />
                <span className="font-medium">Add New Address</span>
              </div>
            </button>
          </>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {/* Address Form Modal */}
      {showForm && (
        <SmartAddressForm
          onClose={() => setShowForm(false)}
          onSuccess={handleAddressCreated}
          mode="modal"
          showGPS={false}
        />
      )}
    </div>
  );
}

export default AddressSelectorWithCreate;
