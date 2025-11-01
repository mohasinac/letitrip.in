import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where,
  serverTimestamp,
  writeBatch,
  getDoc
} from "firebase/firestore";
import { getAdminDb } from "@/lib/database/admin";
import { Address, AddressFormData } from "@/types/address";

const ADDRESSES_COLLECTION = "addresses";

export class AddressService {
  /**
   * Get all addresses for a user
   */
  static async getUserAddresses(userId: string): Promise<Address[]> {
    try {
      const db = getAdminDb();
      const q = query(
        collection(db, ADDRESSES_COLLECTION),
        where("userId", "==", userId)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate().toISOString() || new Date().toISOString(),
        updatedAt: doc.data().updatedAt?.toDate().toISOString() || new Date().toISOString(),
      })) as Address[];
    } catch (error) {
      console.error("Error fetching addresses:", error);
      throw new Error("Failed to fetch addresses");
    }
  }

  /**
   * Get a single address by ID
   */
  static async getAddressById(addressId: string): Promise<Address | null> {
    try {
      const docRef = doc(db, ADDRESSES_COLLECTION, addressId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null;
      }

      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate().toISOString() || new Date().toISOString(),
        updatedAt: docSnap.data().updatedAt?.toDate().toISOString() || new Date().toISOString(),
      } as Address;
    } catch (error) {
      console.error("Error fetching address:", error);
      throw new Error("Failed to fetch address");
    }
  }

  /**
   * Add a new address
   */
  static async addAddress(
    userId: string,
    addressData: AddressFormData
  ): Promise<string> {
    try {
      const batch = writeBatch(db);

      // If this is the default address, unset other defaults
      if (addressData.isDefault) {
        const q = query(
          collection(db, ADDRESSES_COLLECTION),
          where("userId", "==", userId),
          where("isDefault", "==", true)
        );
        const snapshot = await getDocs(q);
        snapshot.docs.forEach(doc => {
          batch.update(doc.ref, { isDefault: false });
        });
      }

      // Add the new address
      const newAddressRef = doc(collection(db, ADDRESSES_COLLECTION));
      batch.set(newAddressRef, {
        ...addressData,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      await batch.commit();
      return newAddressRef.id;
    } catch (error) {
      console.error("Error adding address:", error);
      throw new Error("Failed to add address");
    }
  }

  /**
   * Update an existing address
   */
  static async updateAddress(
    addressId: string,
    userId: string,
    addressData: Partial<AddressFormData>
  ): Promise<void> {
    try {
      const batch = writeBatch(db);
      const addressRef = doc(db, ADDRESSES_COLLECTION, addressId);

      // If this is being set as default, unset other defaults
      if (addressData.isDefault) {
        const q = query(
          collection(db, ADDRESSES_COLLECTION),
          where("userId", "==", userId),
          where("isDefault", "==", true)
        );
        const snapshot = await getDocs(q);
        snapshot.docs.forEach(doc => {
          if (doc.id !== addressId) {
            batch.update(doc.ref, { isDefault: false });
          }
        });
      }

      // Update the address
      batch.update(addressRef, {
        ...addressData,
        updatedAt: serverTimestamp(),
      });

      await batch.commit();
    } catch (error) {
      console.error("Error updating address:", error);
      throw new Error("Failed to update address");
    }
  }

  /**
   * Delete an address
   */
  static async deleteAddress(addressId: string): Promise<void> {
    try {
      const addressRef = doc(db, ADDRESSES_COLLECTION, addressId);
      await deleteDoc(addressRef);
    } catch (error) {
      console.error("Error deleting address:", error);
      throw new Error("Failed to delete address");
    }
  }

  /**
   * Set an address as default
   */
  static async setDefaultAddress(
    addressId: string,
    userId: string
  ): Promise<void> {
    try {
      const batch = writeBatch(db);

      // Unset all other defaults
      const q = query(
        collection(db, ADDRESSES_COLLECTION),
        where("userId", "==", userId),
        where("isDefault", "==", true)
      );
      const snapshot = await getDocs(q);
      snapshot.docs.forEach(doc => {
        batch.update(doc.ref, { isDefault: false });
      });

      // Set the new default
      const addressRef = doc(db, ADDRESSES_COLLECTION, addressId);
      batch.update(addressRef, {
        isDefault: true,
        updatedAt: serverTimestamp(),
      });

      await batch.commit();
    } catch (error) {
      console.error("Error setting default address:", error);
      throw new Error("Failed to set default address");
    }
  }

  /**
   * Get the default address for a user
   */
  static async getDefaultAddress(userId: string): Promise<Address | null> {
    try {
      const q = query(
        collection(db, ADDRESSES_COLLECTION),
        where("userId", "==", userId),
        where("isDefault", "==", true)
      );
      
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate().toISOString() || new Date().toISOString(),
        updatedAt: doc.data().updatedAt?.toDate().toISOString() || new Date().toISOString(),
      } as Address;
    } catch (error) {
      console.error("Error fetching default address:", error);
      throw new Error("Failed to fetch default address");
    }
  }
}
