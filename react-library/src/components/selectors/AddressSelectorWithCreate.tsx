"use client";

/**
 * AddressSelectorWithCreate Component
 *
 * Framework-agnostic address selector with create new address functionality.
 * Displays saved addresses in card format with ability to add new ones.
 *
 * @example
 * ```tsx
 * <AddressSelectorWithCreate
 *   value={selectedAddressId}
 *   onChange={(id, address) => handleSelect(id, address)}
 *   addresses={addresses}
 *   onCreateAddress={handleCreateAddress}
 *   FormModal={MyFormModal}
 *   AddressForm={MyAddressForm}
 * />
 * ```
 */

import React, { useEffect, useState } from "react";

export interface Address {
  id: string;
  fullName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  addressType: "home" | "work" | "other";
  typeLabel: string;
  isDefault: boolean;
}

export interface AddressSelectorWithCreateProps {
  /** Currently selected address ID */
  value?: string | null;
  /** Callback when address changes */
  onChange: (addressId: string, address: Address) => void;
  /** Available addresses */
  addresses: Address[];
  /** Loading state */
  loading?: boolean;
  /** Filter by address type */
  filterType?: "home" | "work" | "other" | "all";
  /** Required field */
  required?: boolean;
  /** Error message */
  error?: string;
  /** Label text */
  label?: string;
  /** Auto-select default address */
  autoSelectDefault?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Callback to create new address */
  onCreateAddress?: () => Promise<Address>;
  /** Custom form modal component */
  FormModal?: React.ComponentType<{
    isOpen: boolean;
    onClose: () => void;
    onSubmit: () => Promise<void>;
    children: React.ReactNode;
  }>;
  /** Custom address form component */
  AddressForm?: React.ComponentType<{
    onSuccess: (address: Address) => void;
  }>;
  /** Custom map pin icon */
  MapPinIcon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  /** Custom home icon */
  HomeIcon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  /** Custom briefcase icon */
  BriefcaseIcon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  /** Custom check icon */
  CheckIcon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  /** Custom plus icon */
  PlusIcon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  /** Custom loader icon */
  LoaderIcon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

// Inline cn utility
function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

// Default Map Pin Icon
const DefaultMapPinIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

// Default Home Icon
const DefaultHomeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

// Default Briefcase Icon
const DefaultBriefcaseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (
  props
) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);

// Default Check Icon
const DefaultCheckIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

// Default Plus Icon
const DefaultPlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </svg>
);

// Default Loader Icon
const DefaultLoaderIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="animate-spin"
    {...props}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

export function AddressSelectorWithCreate({
  value,
  onChange,
  addresses,
  loading = false,
  filterType = "all",
  required = false,
  error,
  label = "Select Address",
  autoSelectDefault = true,
  className = "",
  onCreateAddress,
  FormModal,
  AddressForm,
  MapPinIcon = DefaultMapPinIcon,
  HomeIcon = DefaultHomeIcon,
  BriefcaseIcon = DefaultBriefcaseIcon,
  CheckIcon = DefaultCheckIcon,
  PlusIcon = DefaultPlusIcon,
  LoaderIcon = DefaultLoaderIcon,
}: AddressSelectorWithCreateProps) {
  const [selectedId, setSelectedId] = useState<string | null>(value || null);
  const [showForm, setShowForm] = useState(false);

  // Filter addresses
  const filteredAddresses =
    filterType === "all"
      ? addresses
      : addresses.filter((addr) => addr.addressType === filterType);

  // Auto-select default
  useEffect(() => {
    if (autoSelectDefault && filteredAddresses.length > 0 && !selectedId) {
      const defaultAddr = filteredAddresses.find((a) => a.isDefault);
      if (defaultAddr) {
        setSelectedId(defaultAddr.id);
        onChange(defaultAddr.id, defaultAddr);
      }
    }
  }, [filteredAddresses, autoSelectDefault, selectedId, onChange]);

  const handleSelect = (address: Address) => {
    setSelectedId(address.id);
    onChange(address.id, address);
  };

  const handleNewAddress = (address: Address) => {
    setSelectedId(address.id);
    onChange(address.id, address);
    setShowForm(false);
  };

  const getAddressIcon = (type: string) => {
    switch (type) {
      case "home":
        return <HomeIcon className="w-4 h-4" />;
      case "work":
        return <BriefcaseIcon className="w-4 h-4" />;
      default:
        return <MapPinIcon className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className={cn("space-y-2", className)}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="flex items-center justify-center p-8 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
          <LoaderIcon className="w-6 h-6 text-primary" />
          <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
            Loading addresses...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="space-y-3">
        {filteredAddresses.length === 0 ? (
          <div className="text-center p-6 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800">
            <MapPinIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              No saved addresses found
            </p>
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <PlusIcon />
              Add Your First Address
            </button>
          </div>
        ) : (
          <>
            {filteredAddresses.map((address) => (
              <button
                key={address.id}
                type="button"
                onClick={() => handleSelect(address)}
                className={cn(
                  "w-full text-left p-4 rounded-lg border-2 transition-all",
                  selectedId === address.id
                    ? "border-primary bg-primary/5 dark:bg-primary/10"
                    : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary/50"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {selectedId === address.id ? (
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <CheckIcon className="text-white" />
                      </div>
                    ) : (
                      <div className="text-gray-400 dark:text-gray-500">
                        {getAddressIcon(address.addressType)}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
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

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {address.addressLine1}
                      {address.addressLine2 && `, ${address.addressLine2}`}
                    </p>

                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {address.city}, {address.state} {address.postalCode}
                    </p>

                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                      📞 {address.phoneNumber}
                    </p>
                  </div>
                </div>
              </button>
            ))}

            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="w-full p-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-all"
            >
              <div className="flex items-center justify-center gap-2 text-primary">
                <PlusIcon className="w-5 h-5" />
                <span className="font-medium">Add New Address</span>
              </div>
            </button>
          </>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {/* Form Modal (if provided) */}
      {showForm && FormModal && AddressForm && (
        <FormModal
          isOpen={showForm}
          onClose={() => setShowForm(false)}
          onSubmit={async () => {}}
        >
          <AddressForm onSuccess={handleNewAddress} />
        </FormModal>
      )}
    </div>
  );
}

export default AddressSelectorWithCreate;
