/**
 * @fileoverview Address Selector Component (Using Generic SelectorWithCreate Pattern)
 * @module src/components/common/AddressSelectorWithCreate
 * @description Specialized address selector using the generic SelectorWithCreate pattern
 * 
 * @created 2025-12-05
 * @updated 2025-12-06
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use client";

import React, { useState, useEffect } from "react";
import { MapPin, Home, Briefcase } from "lucide-react";
import { toast } from "sonner";
import { addressService } from "@/services/address.service";
import { SmartAddressForm } from "./SmartAddressForm";
import { SelectorWithCreate, type SelectorOption } from "./SelectorWithCreate";
import type { AddressFE, AddressFormFE } from "@/types/frontend/address.types";
import { logError } from "@/lib/firebase-error-logger";

/**
 * AddressSelectorWithCreateProps interface
 * 
 * @interface
 * @description Props for specialized address selector
 */
export interface AddressSelectorWithCreateProps {
  /** Selected address ID */
  value?: string | null;
  /** Change handler with address data */
  onChange: (addressId: string, address: AddressFE) => void;
  /** Filter addresses by type */
  filterType?: "home" | "work" | "other" | "all";
  /** Whether field is required */
  required?: boolean;
  /** Error message */
  error?: string;
  /** Field label */
  label?: string;
  /** Auto-select default address */
  autoSelectDefault?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Function: Address Selector With Create
 */
/**
 * Performs address selector with create operation
 *
 * @returns {any} The addressselectorwithcreate result
 *
 * @example
 * AddressSelectorWithCreate();
 */

/**
 * Get icon for address type
 */
const getAddressIcon = (type?: string): React.ReactElement => {
  switch (type) {
    case "home":
      return <Home className="w-4 h-4" />;
    case "work":
      return <Briefcase className="w-4 h-4" />;
    default:
      return <MapPin className="w-4 h-4" />;
  }
};

/**
 * Address Selector Component with Create Capability
 * 
 * Wraps the generic SelectorWithCreate pattern with address-specific logic
 * 
 * @param {AddressSelectorWithCreateProps} props - Component props
 * @returns {JSX.Element} Rendered component
 */
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

  // Load addresses on mount
  useEffect(() => {
    loadAddresses();
  }, []);

  // Auto-select default address
  useEffect(() => {
    if (autoSelectDefault && addresses.length > 0 && !value) {
      const defaultAddress = addresses.find((addr) => addr.isDefault);
      if (defaultAddress) {
        onChange(defaultAddress.id, defaultAddress);
      }
    }
  }, [addresses, autoSelectDefault, value, onChange]);

  /**
   * Load addresses from service
   */
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
    } catch (err) {
      logError(err as Error, {
        component: "AddressSelectorWithCreate",
        action: "loadAddresses",
      });
      toast.error("Failed to load addresses");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle address creation
   */
  const handleCreateAddress = async (
    formData: AddressFormFE
  ): Promise<SelectorOption> => {
    try {
      const newAddress = await addressService.create(formData);
      
      // Add to local state
      setAddresses((prev) => [...prev, newAddress]);
      
      toast.success("Address added successfully");
      
      // Return as selector option
      return {
        value: newAddress.id,
        label: `${newAddress.street}, ${newAddress.city}, ${newAddress.state} ${newAddress.postalCode}`,
        icon: getAddressIcon(newAddress.addressType),
        metadata: newAddress,
      };
    } catch (err) {
      logError(err as Error, {
        component: "AddressSelectorWithCreate",
        action: "createAddress",
      });
      throw new Error("Failed to create address");
    }
  };

  // Transform addresses to selector options
  const options: SelectorOption[] = addresses.map((addr) => ({
    value: addr.id,
    label: `${addr.street}, ${addr.city}, ${addr.state} ${addr.postalCode}`,
    icon: getAddressIcon(addr.addressType),
    metadata: addr,
  }));

  return (
    <SelectorWithCreate
      label={label}
      value={value || null}
      options={options}
      onChange={(addressId, option) => {
        const address = option?.metadata as AddressFE;
        if (address) {
          onChange(addressId, address);
        }
      }}
      placeholder="Select an address"
      required={required}
      error={error}
      className={className}
      allowCreate
      createLabel="Add Address"
      createTitle="Add New Address"
      createForm={({ onSubmit, onCancel }) => (
        <SmartAddressForm
          onSubmit={(data) => onSubmit(data as AddressFormFE)}
          onCancel={onCancel}
        />
      )}
      onCreateSubmit={handleCreateAddress}
      searchable
      emptyState={
        <p className="text-gray-500 text-sm">
          No addresses found. Click "Add Address" to create one.
        </p>
      }
    />
      )}
    </div>
  );
}

export default AddressSelectorWithCreate;
