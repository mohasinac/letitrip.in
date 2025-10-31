import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { UnifiedCard } from "@/components/ui/unified/Card";
import { UnifiedButton } from "@/components/ui/unified/Button";

interface Address {
  id: string;
  label: string;
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
}

interface AddressesTabProps {
  addresses: Address[];
  onChange: (addresses: Address[]) => void;
  loading: boolean;
}

export default function AddressesTab({
  addresses,
  onChange,
  loading,
}: AddressesTabProps) {
  const handleAddAddress = () => {
    const newAddress: Address = {
      id: `addr_${Date.now()}`,
      label: "",
      name: "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      pincode: "",
      country: "India",
      isDefault: addresses.length === 0,
    };
    onChange([...addresses, newAddress]);
  };

  const handleRemoveAddress = (id: string) => {
    onChange(addresses.filter((addr) => addr.id !== id));
  };

  const handleUpdateAddress = (id: string, updates: Partial<Address>) => {
    onChange(
      addresses.map((addr) => (addr.id === id ? { ...addr, ...updates } : addr))
    );
  };

  const handleSetDefault = (id: string) => {
    onChange(
      addresses.map((addr) => ({
        ...addr,
        isDefault: addr.id === id,
      }))
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-text">Pickup Addresses</h3>
          <p className="text-sm text-textSecondary">
            Add addresses where customers can pick up orders
          </p>
        </div>
        <UnifiedButton onClick={handleAddAddress} icon={<Plus />} disabled={loading}>
          Add Address
        </UnifiedButton>
      </div>

      {addresses.length === 0 ? (
        <UnifiedCard className="p-12 text-center">
          <p className="text-textSecondary mb-4">No pickup addresses added yet</p>
          <UnifiedButton onClick={handleAddAddress} icon={<Plus />}>
            Add Your First Address
          </UnifiedButton>
        </UnifiedCard>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {addresses.map((address) => (
            <UnifiedCard key={address.id} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h4 className="font-semibold text-text">
                  {address.label || "Untitled Address"}
                </h4>
                <div className="flex gap-2">
                  {!address.isDefault && (
                    <UnifiedButton
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetDefault(address.id)}
                      disabled={loading}
                    >
                      Set as Default
                    </UnifiedButton>
                  )}
                  {addresses.length > 1 && (
                    <UnifiedButton
                      variant="destructive"
                      size="sm"
                      icon={<Trash2 className="w-4 h-4" />}
                      onClick={() => handleRemoveAddress(address.id)}
                      disabled={loading}
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    Address Label
                  </label>
                  <input
                    type="text"
                    value={address.label}
                    onChange={(e) =>
                      handleUpdateAddress(address.id, { label: e.target.value })
                    }
                    placeholder="e.g., Main Warehouse"
                    disabled={loading}
                    className="w-full px-4 py-2.5 bg-surface border border-border rounded-lg text-text placeholder:text-textSecondary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    Contact Name
                  </label>
                  <input
                    type="text"
                    value={address.name}
                    onChange={(e) =>
                      handleUpdateAddress(address.id, { name: e.target.value })
                    }
                    placeholder="Full name"
                    disabled={loading}
                    className="w-full px-4 py-2.5 bg-surface border border-border rounded-lg text-text placeholder:text-textSecondary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={address.phone}
                    onChange={(e) =>
                      handleUpdateAddress(address.id, { phone: e.target.value })
                    }
                    placeholder="+91 9876543210"
                    disabled={loading}
                    className="w-full px-4 py-2.5 bg-surface border border-border rounded-lg text-text placeholder:text-textSecondary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    Address Line 1
                  </label>
                  <input
                    type="text"
                    value={address.addressLine1}
                    onChange={(e) =>
                      handleUpdateAddress(address.id, {
                        addressLine1: e.target.value,
                      })
                    }
                    placeholder="Street, Building"
                    disabled={loading}
                    className="w-full px-4 py-2.5 bg-surface border border-border rounded-lg text-text placeholder:text-textSecondary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    Address Line 2
                  </label>
                  <input
                    type="text"
                    value={address.addressLine2}
                    onChange={(e) =>
                      handleUpdateAddress(address.id, {
                        addressLine2: e.target.value,
                      })
                    }
                    placeholder="Landmark (optional)"
                    disabled={loading}
                    className="w-full px-4 py-2.5 bg-surface border border-border rounded-lg text-text placeholder:text-textSecondary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={address.city}
                    onChange={(e) =>
                      handleUpdateAddress(address.id, { city: e.target.value })
                    }
                    placeholder="City"
                    disabled={loading}
                    className="w-full px-4 py-2.5 bg-surface border border-border rounded-lg text-text placeholder:text-textSecondary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    value={address.state}
                    onChange={(e) =>
                      handleUpdateAddress(address.id, { state: e.target.value })
                    }
                    placeholder="State"
                    disabled={loading}
                    className="w-full px-4 py-2.5 bg-surface border border-border rounded-lg text-text placeholder:text-textSecondary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    PIN Code
                  </label>
                  <input
                    type="text"
                    value={address.pincode}
                    onChange={(e) =>
                      handleUpdateAddress(address.id, { pincode: e.target.value })
                    }
                    placeholder="123456"
                    disabled={loading}
                    className="w-full px-4 py-2.5 bg-surface border border-border rounded-lg text-text placeholder:text-textSecondary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all disabled:opacity-50"
                  />
                </div>
              </div>

              {address.isDefault && (
                <div className="mt-4 px-3 py-2 bg-primary/10 border border-primary/20 rounded-lg">
                  <p className="text-sm text-primary font-medium">Default Pickup Address</p>
                </div>
              )}
            </UnifiedCard>
          ))}
        </div>
      )}
    </div>
  );
}
