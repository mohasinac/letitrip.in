/**
 * Firebase Service for Arenas
 * Handles CRUD operations for Arena data in Firestore
 */

import { getAdminDb } from "@/app/(backend)/api/_lib/database/admin";
import { ArenaConfig, validateArenaConfig } from "@/types/arenaConfig";

export class ArenaService {
  private readonly db = getAdminDb();
  private readonly collection = "arenas";

  /**
   * Get all arenas
   */
  async getAllArenas(): Promise<ArenaConfig[]> {
    try {
      const snapshot = await this.db
        .collection(this.collection)
        .orderBy("createdAt", "desc")
        .get();

      return snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as ArenaConfig,
      );
    } catch (error) {
      console.error("Error getting arenas:", error);
      throw new Error("Failed to fetch arenas");
    }
  }

  /**
   * Get arena by ID
   */
  async getArenaById(id: string): Promise<ArenaConfig | null> {
    try {
      const doc = await this.db.collection(this.collection).doc(id).get();

      if (!doc.exists) {
        return null;
      }

      return {
        id: doc.id,
        ...doc.data(),
      } as ArenaConfig;
    } catch (error) {
      console.error("Error getting arena:", error);
      throw new Error("Failed to fetch arena");
    }
  }

  /**
   * Get default arena
   */
  async getDefaultArena(): Promise<ArenaConfig | null> {
    try {
      const snapshot = await this.db
        .collection(this.collection)
        .where("difficulty", "==", "easy")
        .limit(1)
        .get();

      if (snapshot.empty) {
        // Return first arena if no default found
        const allSnapshot = await this.db
          .collection(this.collection)
          .limit(1)
          .get();

        if (allSnapshot.empty) {
          return null;
        }

        const doc = allSnapshot.docs[0];
        return {
          id: doc.id,
          ...doc.data(),
        } as ArenaConfig;
      }

      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
      } as ArenaConfig;
    } catch (error) {
      console.error("Error getting default arena:", error);
      throw new Error("Failed to fetch default arena");
    }
  }

  /**
   * Create new arena
   */
  async createArena(arena: Omit<ArenaConfig, "id">): Promise<ArenaConfig> {
    try {
      // Validate arena
      const validation = validateArenaConfig(arena as ArenaConfig);
      if (!validation.valid) {
        throw new Error(
          `Arena validation failed: ${validation.errors.join(", ")}`,
        );
      }

      // Generate ID from name
      const id = arena.name.toLowerCase().replace(/\s+/g, "_");

      const arenaData = {
        ...arena,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await this.db.collection(this.collection).doc(id).set(arenaData);

      return {
        id,
        ...arenaData,
      } as ArenaConfig;
    } catch (error) {
      console.error("Error creating arena:", error);
      throw new Error("Failed to create arena");
    }
  }

  /**
   * Update arena
   */
  async updateArena(
    id: string,
    updates: Partial<ArenaConfig>,
  ): Promise<ArenaConfig> {
    try {
      // Validate if full config provided
      if (updates.name && updates.shape) {
        const validation = validateArenaConfig({
          id,
          ...updates,
        } as ArenaConfig);
        if (!validation.valid) {
          throw new Error(
            `Arena validation failed: ${validation.errors.join(", ")}`,
          );
        }
      }

      const updateData = {
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      await this.db.collection(this.collection).doc(id).update(updateData);

      const updated = await this.getArenaById(id);
      if (!updated) {
        throw new Error("Arena not found after update");
      }

      return updated;
    } catch (error) {
      console.error("Error updating arena:", error);
      throw new Error("Failed to update arena");
    }
  }

  /**
   * Delete arena
   */
  async deleteArena(id: string): Promise<void> {
    try {
      await this.db.collection(this.collection).doc(id).delete();
    } catch (error) {
      console.error("Error deleting arena:", error);
      throw new Error("Failed to delete arena");
    }
  }

  /**
   * Set arena as default
   */
  async setDefaultArena(id: string): Promise<void> {
    try {
      const batch = this.db.batch();

      // Remove default from all arenas
      const snapshot = await this.db
        .collection(this.collection)
        .where("difficulty", "==", "easy")
        .get();

      snapshot.docs.forEach((doc) => {
        batch.update(doc.ref, { difficulty: "custom" });
      });

      // Set new default
      const arenaRef = this.db.collection(this.collection).doc(id);
      batch.update(arenaRef, { difficulty: "easy" });

      await batch.commit();
    } catch (error) {
      console.error("Error setting default arena:", error);
      throw new Error("Failed to set default arena");
    }
  }
}

export const arenaService = new ArenaService();
