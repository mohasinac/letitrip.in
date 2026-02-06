"use client";

import { useState, useEffect } from "react";

export interface Address {
  id: string;
  userId: string;
  fullName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
  addressType: "home" | "work" | "other";
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateAddressInput = Omit<
  Address,
  "id" | "userId" | "createdAt" | "updatedAt"
>;
export type UpdateAddressInput = Partial<CreateAddressInput>;

/**
 * Fetch all addresses for the current user
 */
export function useAddresses(userId?: string) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchAddresses = async () => {
      try {
        setLoading(true);
        // TODO: Fetch from Firebase
        // const snapshot = await getDocs(
        //   query(
        //     collection(db, 'addresses'),
        //     where('userId', '==', userId),
        //     orderBy('createdAt', 'desc')
        //   )
        // );
        // const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        setAddresses([]);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchAddresses();
  }, [userId]);

  return { addresses, loading, error };
}

/**
 * Fetch a single address by ID
 */
export function useAddress(addressId: string) {
  const [address, setAddress] = useState<Address | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!addressId) {
      setLoading(false);
      return;
    }

    const fetchAddress = async () => {
      try {
        setLoading(true);
        // TODO: Fetch from Firebase
        // const docRef = doc(db, 'addresses', addressId);
        // const docSnap = await getDoc(docRef);
        // if (docSnap.exists()) {
        //   setAddress({ id: docSnap.id, ...docSnap.data() } as Address);
        // }

        setAddress(null);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchAddress();
  }, [addressId]);

  return { address, loading, error };
}

/**
 * Create a new address
 */
export function useCreateAddress() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createAddress = async (userId: string, data: CreateAddressInput) => {
    try {
      setLoading(true);
      setError(null);

      // TODO: Save to Firebase
      // const docRef = await addDoc(collection(db, 'addresses'), {
      //   ...data,
      //   userId,
      //   createdAt: serverTimestamp(),
      //   updatedAt: serverTimestamp(),
      // });

      // If this is set as default, unset other defaults
      // if (data.isDefault) {
      //   const snapshot = await getDocs(
      //     query(
      //       collection(db, 'addresses'),
      //       where('userId', '==', userId),
      //       where('isDefault', '==', true)
      //     )
      //   );
      //
      //   const batch = writeBatch(db);
      //   snapshot.docs.forEach(doc => {
      //     if (doc.id !== docRef.id) {
      //       batch.update(doc.ref, { isDefault: false });
      //     }
      //   });
      //   await batch.commit();
      // }

      return true;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createAddress, loading, error };
}

/**
 * Update an existing address
 */
export function useUpdateAddress() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateAddress = async (
    addressId: string,
    userId: string,
    data: UpdateAddressInput,
  ) => {
    try {
      setLoading(true);
      setError(null);

      // TODO: Update in Firebase
      // const docRef = doc(db, 'addresses', addressId);
      // await updateDoc(docRef, {
      //   ...data,
      //   updatedAt: serverTimestamp(),
      // });

      // If setting as default, unset other defaults
      // if (data.isDefault) {
      //   const snapshot = await getDocs(
      //     query(
      //       collection(db, 'addresses'),
      //       where('userId', '==', userId),
      //       where('isDefault', '==', true)
      //     )
      //   );
      //
      //   const batch = writeBatch(db);
      //   snapshot.docs.forEach(doc => {
      //     if (doc.id !== addressId) {
      //       batch.update(doc.ref, { isDefault: false });
      //     }
      //   });
      //   await batch.commit();
      // }

      return true;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { updateAddress, loading, error };
}

/**
 * Delete an address
 */
export function useDeleteAddress() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteAddress = async (addressId: string) => {
    try {
      setLoading(true);
      setError(null);

      // TODO: Delete from Firebase
      // await deleteDoc(doc(db, 'addresses', addressId));

      return true;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { deleteAddress, loading, error };
}

/**
 * Set an address as default
 */
export function useSetDefaultAddress() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const setDefaultAddress = async (addressId: string, userId: string) => {
    try {
      setLoading(true);
      setError(null);

      // TODO: Update in Firebase
      // First, unset all other defaults
      // const snapshot = await getDocs(
      //   query(
      //     collection(db, 'addresses'),
      //     where('userId', '==', userId),
      //     where('isDefault', '==', true)
      //   )
      // );
      //
      // const batch = writeBatch(db);
      // snapshot.docs.forEach(doc => {
      //   batch.update(doc.ref, { isDefault: false });
      // });
      //
      // // Set the new default
      // batch.update(doc(db, 'addresses', addressId), { isDefault: true, updatedAt: serverTimestamp() });
      // await batch.commit();

      return true;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { setDefaultAddress, loading, error };
}
