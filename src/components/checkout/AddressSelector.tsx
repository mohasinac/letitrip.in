"use client";

import { logError } from "@/lib/error-logger";
import { addressService } from "@/services/address.service";
import type { AddressFE } from "@/types/frontend/address.types";
import { Check, Edit2, MapPin, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { ConfirmDialog } from "../common/ConfirmDialog";
import { SmartAddressForm } from "../common/SmartAddressForm";

interface AddressSelectorProps {
  selectedId: string | null;
  onSelect: (id: string) => void;
  type: "shipping" | "billing";
}

export function AddressSelector({
  selectedId,
  onSelect,
  type,
}: AddressSelectorProps) {
  const [addresses, setAddresses] = useState<AddressFE[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const data = await addressService.getAll();
      setAddresses(data);

      // Auto-select default or first address
      if (!selectedId && data.length > 0) {
        const defaultAddress = data.find((a: AddressFE) => a.isDefault);
        onSelect(defaultAddress?.id || data[0].id);
      }
    } catch (error) {
      logError(error as Error, { component: "AddressSelector.loadAddresses" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await addressService.delete(deleteId);
      await loadAddresses();
      if (selectedId === deleteId) {
        onSelect("");
      }
    } catch (error) {
      logError(error as Error, {
        component: "AddressSelector.handleDelete",
        metadata: { addressId: deleteId },
      });
    } finally {
      setDeleteId(null);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingId(null);
    loadAddresses();
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="h-24 bg-gray-100 dark:bg-gray-700 rounded-lg"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 dark:text-white">
          {type === "shipping" ? "Shipping" : "Billing"} Address
        </h3>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 text-sm text-primary hover:text-primary-dark transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add New
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
          <MapPin className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No addresses saved
          </p>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            Add Address
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((address) => (
            <div
              key={address.id}
              onClick={() => onSelect(address.id)}
              onKeyDown={(e) => e.key === "Enter" && onSelect(address.id)}
              role="button"
              tabIndex={0}
              className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all ${
                selectedId === address.id
                  ? "border-primary bg-primary/5 dark:bg-primary/10"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              {selectedId === address.id && (
                <div className="absolute top-3 right-3 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4" />
                </div>
              )}

              <div className="pr-8">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {address.fullName}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {address.phoneNumber}
                    </p>
                  </div>
                  {address.isDefault && (
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-xs font-medium rounded">
                      Default
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {address.addressLine1}
                  {address.addressLine2 && `, ${address.addressLine2}`}
                  <br />
                  {address.city}, {address.state} {address.postalCode}
                  <br />
                  {address.country || "India"}
                </p>

                <div className="flex items-center gap-3 mt-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingId(address.id);
                      setShowForm(true);
                    }}
                    className="text-sm text-primary hover:text-primary-dark flex items-center gap-1"
                  >
                    <Edit2 className="w-3 h-3" />
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteId(address.id);
                    }}
                    className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <SmartAddressForm
          addressId={editingId}
          onClose={handleFormClose}
          onSuccess={() => loadAddresses()}
        />
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Address"
        description="Are you sure you want to delete this address? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
