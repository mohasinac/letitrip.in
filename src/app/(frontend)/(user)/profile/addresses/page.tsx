"use client";

import React, { useState } from "react";
import { useAddresses } from "@/hooks/useAddresses";
import { Address, AddressFormData } from "@/types/address";
import AddressCard from "@/components/address/AddressCard";
import AddressForm from "@/components/address/AddressForm";
import { Plus, MapPin } from "lucide-react";

export default function AddressesPage() {
  const {
    addresses,
    loading,
    error,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
  } = useAddresses();

  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const handleAddAddress = async (data: AddressFormData) => {
    try {
      await addAddress(data);
      setShowForm(false);
      return true;
    } catch (error) {
      console.error("Failed to add address:", error);
      return false;
    }
  };

  const handleUpdateAddress = async (data: AddressFormData) => {
    if (!editingAddress) return false;
    try {
      await updateAddress(editingAddress.id, data);
      setEditingAddress(null);
      return true;
    } catch (error) {
      console.error("Failed to update address:", error);
      return false;
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (window.confirm("Are you sure you want to delete this address?")) {
      await deleteAddress(addressId);
    }
  };

  const handleSetDefault = async (addressId: string) => {
    await setDefaultAddress(addressId);
  };

  if (loading && addresses.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">
              Loading addresses...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            My Addresses
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your shipping addresses
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Address
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {addresses.length === 0 && !loading && (
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <MapPin className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            No addresses yet
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Add your first shipping address to get started
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Your First Address
          </button>
        </div>
      )}

      {/* Addresses Grid */}
      {addresses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              onEdit={() => setEditingAddress(address)}
              onDelete={() => handleDeleteAddress(address.id)}
              onSetDefault={() => handleSetDefault(address.id)}
            />
          ))}
        </div>
      )}

      {/* Add Address Form */}
      {showForm && (
        <AddressForm
          onSubmit={handleAddAddress}
          onCancel={() => setShowForm(false)}
          isLoading={loading}
        />
      )}

      {/* Edit Address Form */}
      {editingAddress && (
        <AddressForm
          initialData={editingAddress}
          onSubmit={handleUpdateAddress}
          onCancel={() => setEditingAddress(null)}
          isLoading={loading}
        />
      )}
    </div>
  );
}
