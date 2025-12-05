/**
 * @fileoverview React Component
 * @module src/app/user/addresses/page
 * @description This file contains the page component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use client";

import AuthGuard from "@/components/auth/AuthGuard";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { PageState } from "@/components/common/PageState";
import { SmartAddressForm } from "@/components/common/SmartAddressForm";
import { useLoadingState } from "@/hooks/useLoadingState";
import { logError } from "@/lib/firebase-error-logger";
import { addressService } from "@/services/address.service";
import type { AddressFE } from "@/types/frontend/address.types";
import { CheckCircle, Edit, MapPin, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

/**
 * Function: Addresses Content
 */
/**
 * Performs addresses content operation
 *
 * @returns {any} The addressescontent result
 */

/**
 * Performs addresses content operation
 *
 * @returns {any} The addressescontent result
 */

function AddressesContent() {
  const {
    /** Data */
    data: addresses,
    /** Is Loading */
    isLoading: loading,
    execute,
    /** Set Data */
    setData: setAddresses,
  } = useLoadingState<AddressFE[]>({ initialData: [] });
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  /**
 * Performs load addresses operation
 *
 * @param {any} async( - The async(
 *
 * @returns {Promise<any>} The loadaddresses result
 *
 */
const loadAddresses = useCallback(async () => {
    return await addressService.getAll();
  }, []);

  useEffect(() => {
    execute(loadAddresses);
  }, [execute, loadAddresses]);

  /**
   * Handles open form event
   *
   * @param {string} [addressId] - address identifier
   *
   * @returns {string} The handleopenform result
   */

  /**
   * Handles open form event
   *
   * @param {string} [addressId] - address identifier
   *
   * @returns {string} The handleopenform result
   */

  const handleOpenForm = (addressId?: string) => {
    setEditingAddressId(addressId || null);
    setShowAddressForm(true);
  };

  /**
   * Handles form close event
   *
   * @returns {any} The handleformclose result
   */

  /**
   * Handles form close event
   *
   * @returns {any} The handleformclose result
   */

  const handleFormClose = () => {
    setShowAddressForm(false);
    setEditingAddressId(null);
  };

  /**
   * Handles form success event
   *
   * @returns {any} The handleformsuccess result
   */

  /**
   * Handles form success event
   *
   * @returns {any} The handleformsuccess result
   */

  const handleFormSuccess = () => {
    execute(loadAddresses);
    handleFormClose();
  };

  /**
   * Performs async operation
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  /**
   * Performs async operation
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  const handleConfirmDelete = async () => {
    if (!deleteId) return;

    try {
      await addressService.delete(deleteId);
      setDeleteId(null);
      execute(loadAddresses);
      toast.success("Address deleted successfully");
    } catch (error) {
      logError(error as Error, {
        /** Component */
        component: "AddressesPage.handleDelete",
        /** Metadata */
        metadata: { addressId: deleteId },
      });
      toast.error("Failed to delete address");
    }
  };

  /**
   * Performs async operation
   *
   * @param {string} id - Unique identifier
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  /**
   * Performs async operation
   *
   * @param {string} id - Unique identifier
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  const handleSetDefault = async (id: string) => {
    try {
      await addressService.setDefault(id);
      execute(loadAddresses);
    } catch (error) {
      logError(error as Error, {
        /** Component */
        component: "AddressesPage.setDefault",
        /** Metadata */
        metadata: { addressId: id },
      });
      toast.error("Failed to set default address");
    }
  };

  // Safe access to addresses array
  const addressesList = addresses || [];

  if (loading) {
    return <PageState.Loading message="Loading addresses..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            My Addresses
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your shipping addresses for faster checkout
          </p>
        </div>

        {/* Add Address Button - Mobile Optimized */}
        <button
          onClick={() => handleOpenForm()}
          className="mb-6 inline-flex items-center gap-2 px-6 py-3 min-h-[48px] bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors font-semibold touch-manipulation"
        >
          <Plus className="w-5 h-5" />
          Add New Address
        </button>

        {/* Addresses Grid */}
        {addressesList.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
            <MapPin className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No addresses yet
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Add your first address to make checkout easier
            </p>
            <button
              onClick={() => handleOpenForm()}
              className="inline-flex items-center gap-2 px-6 py-3 min-h-[48px] bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors font-semibold touch-manipulation"
            >
              <Plus className="w-5 h-5" />
              Add Address
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {addressesList.map((address) => (
              <div
                key={address.id}
                className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 relative ${
                  address.isDefault ? "ring-2 ring-blue-500" : ""
                }`}
              >
                {address.isDefault && (
                  <div className="absolute top-4 right-4">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs font-semibold rounded-full">
                      <CheckCircle className="w-3 h-3" />
                      Default
                    </span>
                  </div>
                )}

                <div className="mb-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {address.fullName}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {address.phoneNumber}
                  </p>
                </div>

                <div className="text-gray-700 dark:text-gray-300 space-y-1 mb-6">
                  <p>{address.addressLine1}</p>
                  {address.addressLine2 && <p>{address.addressLine2}</p>}
                  <p>
                    {address.city}, {address.state} {address.postalCode}
                  </p>
                  <p>{address.country}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {!address.isDefault && (
                    <button
                      onClick={() => handleSetDefault(address.id)}
                      className="flex-1 sm:flex-none px-4 py-3 min-h-[48px] border border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 active:bg-blue-100 transition-colors font-semibold text-sm touch-manipulation"
                    >
                      Set as Default
                    </button>
                  )}
                  <button
                    onClick={() => handleOpenForm(address.id)}
                    className="px-4 py-3 min-h-[48px] border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 transition-colors font-semibold text-sm touch-manipulation flex items-center justify-center"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteId(address.id)}
                    className="px-4 py-3 min-h-[48px] border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 active:bg-red-100 transition-colors font-semibold text-sm touch-manipulation flex items-center justify-center"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Address Form Modal */}
        {showAddressForm && (
          <SmartAddressForm
            addressId={editingAddressId}
            onClose={handleFormClose}
            onSuccess={handleFormSuccess}
          />
        )}

        {/* Delete Confirmation */}
        <ConfirmDialog
          isOpen={deleteId !== null}
          title="Delete Address"
          description="Are you sure you want to delete this address? This action cannot be undone."
          onConfirm={handleConfirmDelete}
          onClose={() => setDeleteId(null)}
          variant="danger"
          confirmLabel="Delete"
        />
      </div>
    </div>
  );
}

export default /**
 * Performs addresses page operation
 *
 * @returns {any} The addressespage result
 *
 */
function AddressesPage() {
  return (
    <AuthGuard requireAuth={true}>
      <AddressesContent />
    </AuthGuard>
  );
}
