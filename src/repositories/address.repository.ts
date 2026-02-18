/**
 * Address Repository
 *
 * Data access layer for user address documents stored as a subcollection:
 *   users/{userId}/addresses/{addressId}
 */

import { getAdminDb } from "@/lib/firebase/admin";
import { DatabaseError, NotFoundError } from "@/lib/errors";
import { prepareForFirestore } from "@/lib/firebase/firestore-helpers";
import type {
  AddressDocument,
  AddressCreateInput,
  AddressUpdateInput,
} from "@/db/schema";
import {
  ADDRESS_SUBCOLLECTION,
  ADDRESS_FIELDS,
  USER_COLLECTION,
} from "@/db/schema";
import { serverLogger } from "@/lib/server-logger";

class AddressRepository {
  /**
   * Get the addresses subcollection reference for a user
   */
  private getCollection(userId: string) {
    return getAdminDb()
      .collection(USER_COLLECTION)
      .doc(userId)
      .collection(ADDRESS_SUBCOLLECTION);
  }

  /**
   * List all addresses for a user, ordered by createdAt desc
   */
  async findByUser(userId: string): Promise<AddressDocument[]> {
    try {
      const snapshot = await this.getCollection(userId)
        .orderBy(ADDRESS_FIELDS.CREATED_AT, "desc")
        .get();

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as AddressDocument[];
    } catch (error) {
      throw new DatabaseError(
        `Failed to list addresses for user: ${userId}`,
        error,
      );
    }
  }

  /**
   * Find a single address belonging to a user
   */
  async findById(
    userId: string,
    addressId: string,
  ): Promise<AddressDocument | null> {
    try {
      const doc = await this.getCollection(userId).doc(addressId).get();

      if (!doc.exists) return null;

      return { id: doc.id, ...doc.data() } as AddressDocument;
    } catch (error) {
      throw new DatabaseError(
        `Failed to find address ${addressId} for user ${userId}`,
        error,
      );
    }
  }

  /**
   * Find a single address or throw NotFoundError
   */
  async findByIdOrFail(
    userId: string,
    addressId: string,
  ): Promise<AddressDocument> {
    const address = await this.findById(userId, addressId);

    if (!address) {
      throw new NotFoundError(`Address not found: ${addressId}`);
    }

    return address;
  }

  /**
   * Count the total number of addresses for a user
   */
  async count(userId: string): Promise<number> {
    try {
      const snapshot = await this.getCollection(userId).count().get();
      return snapshot.data().count;
    } catch (error) {
      throw new DatabaseError(
        `Failed to count addresses for user: ${userId}`,
        error,
      );
    }
  }

  /**
   * Create a new address.
   * If isDefault is true, clears the default flag from all other addresses first.
   */
  async create(
    userId: string,
    input: AddressCreateInput,
  ): Promise<AddressDocument> {
    try {
      const db = getAdminDb();
      const collection = this.getCollection(userId);

      // If this is meant to be the default, clear others first (batch)
      if (input.isDefault) {
        await this.clearDefaultFlag(userId);
      }

      const now = new Date();
      const docRef = collection.doc(); // auto-generated ID
      const addressData: Omit<AddressDocument, "id"> = {
        ...input,
        createdAt: now,
        updatedAt: now,
      };

      await docRef.set(prepareForFirestore(addressData));

      serverLogger.info("Address created", {
        userId,
        addressId: docRef.id,
        label: input.label,
      });

      return { id: docRef.id, ...addressData };
    } catch (error) {
      if (error instanceof DatabaseError || error instanceof NotFoundError)
        throw error;
      throw new DatabaseError(
        `Failed to create address for user: ${userId}`,
        error,
      );
    }
  }

  /**
   * Update an existing address.
   * If isDefault is set to true, clears the default flag from all other addresses.
   */
  async update(
    userId: string,
    addressId: string,
    input: AddressUpdateInput,
  ): Promise<AddressDocument> {
    try {
      // Ensure the address belongs to this user
      await this.findByIdOrFail(userId, addressId);

      if (input.isDefault) {
        await this.clearDefaultFlag(userId);
      }

      const updateData = {
        ...prepareForFirestore(input),
        [ADDRESS_FIELDS.UPDATED_AT]: new Date(),
      };

      await this.getCollection(userId).doc(addressId).update(updateData);

      const updated = await this.findByIdOrFail(userId, addressId);

      serverLogger.info("Address updated", { userId, addressId });

      return updated;
    } catch (error) {
      if (error instanceof DatabaseError || error instanceof NotFoundError)
        throw error;
      throw new DatabaseError(
        `Failed to update address ${addressId} for user ${userId}`,
        error,
      );
    }
  }

  /**
   * Delete an address.
   * If it was the default, no automatic reassignment — caller decides.
   */
  async delete(userId: string, addressId: string): Promise<void> {
    try {
      await this.findByIdOrFail(userId, addressId);
      await this.getCollection(userId).doc(addressId).delete();

      serverLogger.info("Address deleted", { userId, addressId });
    } catch (error) {
      if (error instanceof DatabaseError || error instanceof NotFoundError)
        throw error;
      throw new DatabaseError(
        `Failed to delete address ${addressId} for user ${userId}`,
        error,
      );
    }
  }

  /**
   * Set a specific address as the default, clearing all others.
   */
  async setDefault(
    userId: string,
    addressId: string,
  ): Promise<AddressDocument> {
    try {
      // Verify address exists for this user
      await this.findByIdOrFail(userId, addressId);

      // Clear all existing defaults
      await this.clearDefaultFlag(userId);

      // Set this one as default
      await this.getCollection(userId)
        .doc(addressId)
        .update({
          [ADDRESS_FIELDS.IS_DEFAULT]: true,
          [ADDRESS_FIELDS.UPDATED_AT]: new Date(),
        });

      serverLogger.info("Default address set", { userId, addressId });

      return this.findByIdOrFail(userId, addressId);
    } catch (error) {
      if (error instanceof DatabaseError || error instanceof NotFoundError)
        throw error;
      throw new DatabaseError(
        `Failed to set default address ${addressId} for user ${userId}`,
        error,
      );
    }
  }

  /**
   * Remove the isDefault flag from all addresses of a user.
   * Internal helper called before setting a new default.
   */
  private async clearDefaultFlag(userId: string): Promise<void> {
    try {
      const db = getAdminDb();
      const snapshot = await this.getCollection(userId)
        .where(ADDRESS_FIELDS.IS_DEFAULT, "==", true)
        .get();

      if (snapshot.empty) return;

      const batch = db.batch();
      snapshot.docs.forEach((doc) => {
        batch.update(doc.ref, {
          [ADDRESS_FIELDS.IS_DEFAULT]: false,
          [ADDRESS_FIELDS.UPDATED_AT]: new Date(),
        });
      });

      await batch.commit();
    } catch (error) {
      throw new DatabaseError(
        `Failed to clear default flag for user: ${userId}`,
        error,
      );
    }
  }

  /**
   * Delete all addresses for a user (e.g. on account deletion).
   * Returns the number of deleted documents.
   */
  async deleteAllByUser(userId: string): Promise<number> {
    try {
      const db = getAdminDb();
      const snapshot = await this.getCollection(userId).get();

      if (snapshot.empty) return 0;

      const batch = db.batch();
      snapshot.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();

      return snapshot.size;
    } catch (error) {
      throw new DatabaseError(
        `Failed to delete all addresses for user: ${userId}`,
        error,
      );
    }
  }
}

// Export singleton instance
export const addressRepository = new AddressRepository();
