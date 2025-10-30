"use client";

import { useState } from "react";
import { Address } from "@/types";
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Star,
  Phone,
  User,
} from "lucide-react";
import toast from "react-hot-toast";

interface AddressManagerProps {
  addresses: Address[];
  onUpdate: (addresses: Address[]) => Promise<void>;
  maxAddresses?: number;
}

export default function AddressManager({
  addresses = [],
  onUpdate,
  maxAddresses = 5,
}: AddressManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Partial<Address>>({
    name: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    isDefault: false,
  });

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      pincode: "",
      country: "India",
      isDefault: false,
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleEdit = (address: Address) => {
    setFormData(address);
    setEditingId(address.id);
    setIsAdding(false);
  };

  const handleDelete = async (addressId: string) => {
    if (!confirm("Are you sure you want to delete this address?")) {
      return;
    }

    try {
      setLoading(true);
      const updatedAddresses = addresses.filter(
        (addr) => addr.id !== addressId,
      );
      await onUpdate(updatedAddresses);
      toast.success("Address deleted successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete address");
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      setLoading(true);
      const updatedAddresses = addresses.map((addr) => ({
        ...addr,
        isDefault: addr.id === addressId,
      }));
      await onUpdate(updatedAddresses);
      toast.success("Default address updated");
    } catch (error: any) {
      toast.error(error.message || "Failed to update default address");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name || formData.name.length < 2) {
      toast.error("Name must be at least 2 characters");
      return;
    }
    if (!formData.phone || !/^[0-9]{10}$/.test(formData.phone)) {
      toast.error("Phone must be 10 digits");
      return;
    }
    if (!formData.addressLine1 || formData.addressLine1.length < 5) {
      toast.error("Address line 1 is required");
      return;
    }
    if (!formData.city || formData.city.length < 2) {
      toast.error("City is required");
      return;
    }
    if (!formData.state || formData.state.length < 2) {
      toast.error("State is required");
      return;
    }
    if (!formData.pincode || !/^[0-9]{6}$/.test(formData.pincode)) {
      toast.error("Pincode must be 6 digits");
      return;
    }

    try {
      setLoading(true);
      let updatedAddresses: Address[];

      if (editingId) {
        // Update existing address
        updatedAddresses = addresses.map((addr) =>
          addr.id === editingId ? { ...(formData as Address) } : addr,
        );
      } else {
        // Add new address
        if (addresses.length >= maxAddresses) {
          toast.error(`Maximum ${maxAddresses} addresses allowed`);
          return;
        }

        const newAddress: Address = {
          id: `addr_${Date.now()}`,
          name: formData.name!,
          phone: formData.phone!,
          addressLine1: formData.addressLine1!,
          addressLine2: formData.addressLine2,
          city: formData.city!,
          state: formData.state!,
          pincode: formData.pincode!,
          country: formData.country || "India",
          isDefault: formData.isDefault || addresses.length === 0,
        };

        // If this is set as default, unset others
        updatedAddresses = formData.isDefault
          ? [
              ...addresses.map((addr) => ({ ...addr, isDefault: false })),
              newAddress,
            ]
          : [...addresses, newAddress];
      }

      await onUpdate(updatedAddresses);
      toast.success(
        editingId
          ? "Address updated successfully"
          : "Address added successfully",
      );
      resetForm();
    } catch (error: any) {
      toast.error(error.message || "Failed to save address");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Saved Addresses ({addresses.length}/{maxAddresses})
          </h2>
          {!isAdding && !editingId && addresses.length < maxAddresses && (
            <button
              onClick={() => setIsAdding(true)}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Address
            </button>
          )}
        </div>
      </div>

      <div className="p-6">
        {/* Add/Edit Form */}
        {(isAdding || editingId) && (
          <form
            onSubmit={handleSubmit}
            className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50"
          >
            <h3 className="text-md font-semibold text-gray-900 mb-4">
              {editingId ? "Edit Address" : "Add New Address"}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="John Doe"
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.phone || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="9876543210"
                  maxLength={10}
                  required
                />
              </div>

              {/* Address Line 1 */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address Line 1 *
                </label>
                <input
                  type="text"
                  value={formData.addressLine1 || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, addressLine1: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="House No., Building Name"
                  required
                />
              </div>

              {/* Address Line 2 */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address Line 2 (Optional)
                </label>
                <input
                  type="text"
                  value={formData.addressLine2 || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, addressLine2: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Road Name, Area, Colony"
                />
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  value={formData.city || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Mumbai"
                  required
                />
              </div>

              {/* State */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State *
                </label>
                <input
                  type="text"
                  value={formData.state || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, state: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Maharashtra"
                  required
                />
              </div>

              {/* Pincode */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pincode *
                </label>
                <input
                  type="text"
                  value={formData.pincode || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, pincode: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="400001"
                  maxLength={6}
                  required
                />
              </div>

              {/* Country */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country *
                </label>
                <input
                  type="text"
                  value={formData.country || "India"}
                  onChange={(e) =>
                    setFormData({ ...formData, country: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Set as Default */}
            <div className="mt-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.isDefault || false}
                  onChange={(e) =>
                    setFormData({ ...formData, isDefault: e.target.checked })
                  }
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  Set as default address
                </span>
              </label>
            </div>

            {/* Form Actions */}
            <div className="mt-4 flex space-x-2">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
              >
                <Check className="w-4 h-4 mr-2" />
                {loading ? "Saving..." : editingId ? "Update" : "Add Address"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                disabled={loading}
                className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Address List */}
        {addresses.length === 0 ? (
          <div className="text-center py-8">
            <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No addresses saved yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Add your first address to get started
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {addresses.map((address) => (
              <div
                key={address.id}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors relative"
              >
                {address.isDefault && (
                  <div className="absolute top-2 right-2">
                    <span className="flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                      <Star className="w-3 h-3 mr-1 fill-current" />
                      Default
                    </span>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center text-gray-900 font-semibold">
                    <User className="w-4 h-4 mr-2 text-gray-500" />
                    {address.name}
                  </div>
                  <div className="flex items-center text-gray-600 text-sm">
                    <Phone className="w-4 h-4 mr-2 text-gray-500" />
                    {address.phone}
                  </div>
                  <div className="flex items-start text-gray-600 text-sm">
                    <MapPin className="w-4 h-4 mr-2 text-gray-500 mt-0.5" />
                    <div>
                      <p>{address.addressLine1}</p>
                      {address.addressLine2 && <p>{address.addressLine2}</p>}
                      <p>
                        {address.city}, {address.state} - {address.pincode}
                      </p>
                      <p>{address.country}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex space-x-2">
                  {!address.isDefault && (
                    <button
                      onClick={() => handleSetDefault(address.id)}
                      disabled={loading}
                      className="text-sm px-3 py-1 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 rounded transition-colors disabled:opacity-50"
                    >
                      Set as Default
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(address)}
                    disabled={loading}
                    className="text-sm px-3 py-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors disabled:opacity-50"
                  >
                    <Edit2 className="w-3 h-3 inline mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(address.id)}
                    disabled={loading}
                    className="text-sm px-3 py-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-3 h-3 inline mr-1" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
