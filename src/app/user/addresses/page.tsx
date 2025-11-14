"use client";

import { useState, useEffect } from "react";
import {
  MapPin,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import AuthGuard from "@/components/auth/AuthGuard";
import { addressService } from "@/services/address.service";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { FormModal } from "@/components/common/FormModal";
import type { AddressFE } from "@/types/frontend/address.types";

function AddressesContent() {
  const [addresses, setAddresses] = useState<AddressFE[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<AddressFE | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    addressType: "home" as "home" | "work" | "other",
    isDefault: false,
  });

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const data = await addressService.getAll();
      setAddresses(data); // Service returns AddressFE[] directly
    } catch (error) {
      console.error("Failed to load addresses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = (address?: AddressFE) => {
    if (address) {
      setEditingAddress(address);
      setFormData({
        fullName: address.fullName,
        phoneNumber: address.phoneNumber,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2 || "",
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
        addressType: address.addressType,
        isDefault: address.isDefault,
      });
    } else {
      setEditingAddress(null);
      setFormData({
        fullName: "",
        phoneNumber: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        postalCode: "",
        country: "India",
        addressType: "home",
        isDefault: addresses.length === 0,
      });
    }
    setShowAddressForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingAddress) {
        await addressService.update(editingAddress.id, formData);
      } else {
        await addressService.create(formData as any);
      }
      setShowAddressForm(false);
      loadAddresses();
    } catch (error) {
      console.error("Failed to save address:", error);
      alert("Failed to save address. Please try again.");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await addressService.delete(deleteId);
      setDeleteId(null);
      loadAddresses();
    } catch (error) {
      console.error("Failed to delete address:", error);
      alert("Failed to delete address. Please try again.");
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await addressService.setDefault(id);
      loadAddresses();
    } catch (error) {
      console.error("Failed to set default address:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            My Addresses
          </h1>
          <p className="text-gray-600">
            Manage your shipping addresses for faster checkout
          </p>
        </div>

        {/* Add Address Button */}
        <button
          onClick={() => handleOpenForm()}
          className="mb-6 inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
        >
          <Plus className="w-5 h-5" />
          Add New Address
        </button>

        {/* Addresses Grid */}
        {addresses.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No addresses yet
            </h2>
            <p className="text-gray-600 mb-6">
              Add your first address to make checkout easier
            </p>
            <button
              onClick={() => handleOpenForm()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              <Plus className="w-5 h-5" />
              Add Address
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {addresses.map((address) => (
              <div
                key={address.id}
                className={`bg-white rounded-lg shadow-md p-6 relative ${
                  address.isDefault ? "ring-2 ring-blue-500" : ""
                }`}
              >
                {address.isDefault && (
                  <div className="absolute top-4 right-4">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                      <CheckCircle className="w-3 h-3" />
                      Default
                    </span>
                  </div>
                )}

                <div className="mb-4">
                  <h3 className="text-lg font-bold text-gray-900">
                    {address.fullName}
                  </h3>
                  <p className="text-gray-600">{address.phoneNumber}</p>
                </div>

                <div className="text-gray-700 space-y-1 mb-6">
                  <p>{address.addressLine1}</p>
                  {address.addressLine2 && <p>{address.addressLine2}</p>}
                  <p>
                    {address.city}, {address.state} {address.postalCode}
                  </p>
                  <p>{address.country}</p>
                </div>

                <div className="flex gap-2">
                  {!address.isDefault && (
                    <button
                      onClick={() => handleSetDefault(address.id)}
                      className="flex-1 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-semibold text-sm"
                    >
                      Set as Default
                    </button>
                  )}
                  <button
                    onClick={() => handleOpenForm(address)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold text-sm"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteId(address.id)}
                    className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-semibold text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Address Form Modal */}
        <FormModal
          isOpen={showAddressForm}
          onClose={() => setShowAddressForm(false)}
          title={editingAddress ? "Edit Address" : "Add New Address"}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={formData.phoneNumber}
                onChange={(e) =>
                  setFormData({ ...formData, phoneNumber: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="+91 98765 43210"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Address Line 1 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.addressLine1}
                onChange={(e) =>
                  setFormData({ ...formData, addressLine1: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="House/Flat No., Street Name"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Address Line 2 (Optional)
              </label>
              <input
                type="text"
                value={formData.addressLine2}
                onChange={(e) =>
                  setFormData({ ...formData, addressLine2: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Landmark, Area"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  State <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.state}
                  onChange={(e) =>
                    setFormData({ ...formData, state: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Postal Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.postalCode}
                  onChange={(e) =>
                    setFormData({ ...formData, postalCode: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Country <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.country}
                  onChange={(e) =>
                    setFormData({ ...formData, country: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isDefault"
                checked={formData.isDefault}
                onChange={(e) =>
                  setFormData({ ...formData, isDefault: e.target.checked })
                }
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="isDefault" className="text-sm text-gray-700">
                Set as default address
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowAddressForm(false)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
              >
                {editingAddress ? "Update" : "Add"} Address
              </button>
            </div>
          </form>
        </FormModal>

        {/* Delete Confirmation */}
        <ConfirmDialog
          isOpen={deleteId !== null}
          title="Delete Address"
          description="Are you sure you want to delete this address? This action cannot be undone."
          onConfirm={handleDelete}
          onClose={() => setDeleteId(null)}
          variant="danger"
          confirmLabel="Delete"
        />
      </div>
    </div>
  );
}

export default function AddressesPage() {
  return (
    <AuthGuard requireAuth={true}>
      <AddressesContent />
    </AuthGuard>
  );
}
