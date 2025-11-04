import { useState, useEffect, useCallback } from 'react';
import { AddressService, type Address, type CreateAddressData, type UpdateAddressData } from '@/lib/api/services/address.service';
import type { UseAddressesReturn } from '@/types/ui/hooks';

/**
 * Hook for managing user addresses
 */
export function useAddresses(): UseAddressesReturn {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get default address
  const defaultAddress = addresses.find(addr => addr.isDefault) || null;

  // Load addresses
  const loadAddresses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await AddressService.getAddresses();
      setAddresses(data);
    } catch (err) {
      console.error('Failed to load addresses:', err);
      setError(err instanceof Error ? err.message : 'Failed to load addresses');
    } finally {
      setLoading(false);
    }
  }, []);

  // Add new address
  const addAddress = useCallback(async (data: CreateAddressData) => {
    try {
      const newAddress = await AddressService.createAddress(data);
      setAddresses(prev => [...prev, newAddress]);
    } catch (err) {
      console.error('Failed to add address:', err);
      throw err;
    }
  }, []);

  // Update address
  const updateAddress = useCallback(async (id: string, data: UpdateAddressData) => {
    try {
      const updatedAddress = await AddressService.updateAddress(id, data);
      setAddresses(prev => 
        prev.map(addr => addr.id === id ? updatedAddress : addr)
      );
    } catch (err) {
      console.error('Failed to update address:', err);
      throw err;
    }
  }, []);

  // Delete address
  const deleteAddress = useCallback(async (id: string) => {
    try {
      await AddressService.deleteAddress(id);
      setAddresses(prev => prev.filter(addr => addr.id !== id));
    } catch (err) {
      console.error('Failed to delete address:', err);
      throw err;
    }
  }, []);

  // Set default address
  const setDefaultAddress = useCallback(async (id: string) => {
    try {
      await AddressService.setDefaultAddress(id);
      setAddresses(prev => 
        prev.map(addr => ({
          ...addr,
          isDefault: addr.id === id
        }))
      );
    } catch (err) {
      console.error('Failed to set default address:', err);
      throw err;
    }
  }, []);

  // Refresh addresses
  const refetch = useCallback(async () => {
    await loadAddresses();
  }, [loadAddresses]);

  // Load addresses on mount
  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  return {
    data: addresses,
    addresses,
    defaultAddress,
    loading,
    error,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    refetch,
  };
}
