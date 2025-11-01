"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Address, AddressFormData } from "@/types/address";
import { toast } from "react-hot-toast";

export function useAddresses() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAuthToken = async () => {
    if (!user) return null;
    // Get Firebase ID token
    const token = await (user as any).getIdToken?.();
    return token;
  };

  const fetchAddresses = async () => {
    if (!user) {
      setAddresses([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error("No authentication token");
      }

      const response = await fetch("/api/addresses", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch addresses");
      }

      const data = await response.json();
      setAddresses(data.addresses || []);
    } catch (err) {
      console.error("Error fetching addresses:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch addresses");
    } finally {
      setIsLoading(false);
    }
  };

  const addAddress = async (addressData: AddressFormData): Promise<boolean> => {
    if (!user) {
      toast.error("Please login to add an address");
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error("No authentication token");
      }

      const response = await fetch("/api/addresses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(addressData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to add address");
      }

      toast.success("Address added successfully");
      await fetchAddresses();
      return true;
    } catch (err) {
      console.error("Error adding address:", err);
      const message = err instanceof Error ? err.message : "Failed to add address";
      setError(message);
      toast.error(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateAddress = async (
    addressId: string,
    addressData: Partial<AddressFormData>
  ): Promise<boolean> => {
    if (!user) {
      toast.error("Please login to update an address");
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error("No authentication token");
      }

      const response = await fetch(`/api/addresses/${addressId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(addressData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update address");
      }

      toast.success("Address updated successfully");
      await fetchAddresses();
      return true;
    } catch (err) {
      console.error("Error updating address:", err);
      const message = err instanceof Error ? err.message : "Failed to update address";
      setError(message);
      toast.error(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAddress = async (addressId: string): Promise<boolean> => {
    if (!user) {
      toast.error("Please login to delete an address");
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error("No authentication token");
      }

      const response = await fetch(`/api/addresses/${addressId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete address");
      }

      toast.success("Address deleted successfully");
      await fetchAddresses();
      return true;
    } catch (err) {
      console.error("Error deleting address:", err);
      const message = err instanceof Error ? err.message : "Failed to delete address";
      setError(message);
      toast.error(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const setDefaultAddress = async (addressId: string): Promise<boolean> => {
    return updateAddress(addressId, { isDefault: true });
  };

  useEffect(() => {
    fetchAddresses();
  }, [user]);

  return {
    addresses,
    isLoading,
    error,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    refetchAddresses: fetchAddresses,
  };
}
