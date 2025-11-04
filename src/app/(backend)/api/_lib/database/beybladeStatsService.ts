/**
 * Firebase Service for Beyblade Stats
 * Handles CRUD operations for Beyblade data in Firestore
 */

import { getAdminDb } from "@/app/(backend)/api/_lib/database/admin";
import { BeybladeStats, validateTypeDistribution } from "@/types/beybladeStats";
import { DEFAULT_BEYBLADE_STATS } from "@/constants/beybladeStatsData";

export class BeybladeStatsService {
  private readonly db = getAdminDb();
  private readonly collection = "beyblade_stats";

  /**
   * Initialize database with default Beyblade stats
   */
  async initializeDefaultBeyblades(): Promise<void> {
    try {
      const batch = this.db.batch();

      for (const [id, stats] of Object.entries(DEFAULT_BEYBLADE_STATS)) {
        const docRef = this.db.collection(this.collection).doc(id);
        const doc = await docRef.get();

        // Only add if doesn't exist
        if (!doc.exists) {
          const beybladeData = {
            ...stats,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: "system",
          };
          batch.set(docRef, beybladeData);
        }
      }

      await batch.commit();
      console.log("Default Beyblade stats initialized");
    } catch (error) {
      console.error("Error initializing default Beyblades:", error);
      throw new Error("Failed to initialize Beyblade stats");
    }
  }

  /**
   * Get Beyblade stats by ID
   */
  async getBeybladeStats(id: string): Promise<BeybladeStats | null> {
    try {
      const doc = await this.db.collection(this.collection).doc(id).get();

      if (!doc.exists) {
        return null;
      }

      return doc.data() as BeybladeStats;
    } catch (error) {
      console.error(`Error getting Beyblade stats for ${id}:`, error);
      return null;
    }
  }

  /**
   * Get all Beyblade stats
   */
  async getAllBeybladeStats(): Promise<BeybladeStats[]> {
    try {
      const snapshot = await this.db.collection(this.collection).get();
      return snapshot.docs.map((doc) => doc.data() as BeybladeStats);
    } catch (error) {
      console.error("Error getting all Beyblade stats:", error);
      return [];
    }
  }

  /**
   * Get Beyblades by type
   */
  async getBeybladesByType(
    type: "attack" | "defense" | "stamina" | "balanced",
  ): Promise<BeybladeStats[]> {
    try {
      const snapshot = await this.db
        .collection(this.collection)
        .where("type", "==", type)
        .get();

      return snapshot.docs.map((doc) => doc.data() as BeybladeStats);
    } catch (error) {
      console.error(`Error getting Beyblades by type ${type}:`, error);
      return [];
    }
  }

  /**
   * Create or update Beyblade stats
   */
  async saveBeybladeStats(stats: BeybladeStats, userId: string): Promise<void> {
    try {
      // Validate type distribution
      if (!validateTypeDistribution(stats.typeDistribution)) {
        throw new Error(
          "Invalid type distribution. Must sum to 360 with max 150 per stat.",
        );
      }

      // Validate mass (in grams)
      if (stats.mass < 10 || stats.mass > 2000) {
        throw new Error("Mass must be between 10 and 2000 grams");
      }

      // Validate radius (in cm)
      if (stats.radius < 3 || stats.radius > 50) {
        throw new Error("Radius must be between 3 and 50 cm");
      }

      // Validate spin steal factor (percentage, optional field)
      if (
        stats.spinStealFactor !== undefined &&
        (stats.spinStealFactor < 0 || stats.spinStealFactor > 100)
      ) {
        throw new Error("Spin steal factor must be between 0 and 100%");
      }

      const now = new Date().toISOString();
      const docRef = this.db.collection(this.collection).doc(stats.id);
      const doc = await docRef.get();

      const beybladeData = {
        ...stats,
        updatedAt: now,
        createdAt: doc.exists ? (doc.data() as BeybladeStats).createdAt : now,
        createdBy: doc.exists
          ? (doc.data() as BeybladeStats).createdBy
          : userId,
      };

      await docRef.set(beybladeData);
    } catch (error) {
      console.error("Error saving Beyblade stats:", error);
      throw new Error(
        `Failed to save Beyblade stats: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Delete Beyblade stats
   */
  async deleteBeybladeStats(id: string): Promise<void> {
    try {
      await this.db.collection(this.collection).doc(id).delete();
    } catch (error) {
      console.error(`Error deleting Beyblade stats for ${id}:`, error);
      throw new Error("Failed to delete Beyblade stats");
    }
  }

  /**
   * Batch update multiple Beyblades
   */
  async batchUpdateBeyblades(
    updates: BeybladeStats[],
    userId: string,
  ): Promise<void> {
    try {
      const batch = this.db.batch();
      const now = new Date().toISOString();

      for (const stats of updates) {
        // Validate each Beyblade
        if (!validateTypeDistribution(stats.typeDistribution)) {
          throw new Error(`Invalid type distribution for ${stats.name}`);
        }

        const docRef = this.db.collection(this.collection).doc(stats.id);
        const doc = await docRef.get();

        const beybladeData = {
          ...stats,
          updatedAt: now,
          createdAt: doc.exists ? (doc.data() as BeybladeStats).createdAt : now,
          createdBy: doc.exists
            ? (doc.data() as BeybladeStats).createdBy
            : userId,
        };

        batch.set(docRef, beybladeData);
      }

      await batch.commit();
    } catch (error) {
      console.error("Error batch updating Beyblades:", error);
      throw new Error(
        `Failed to batch update Beyblades: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Search Beyblades by name
   */
  async searchBeybladesByName(query: string): Promise<BeybladeStats[]> {
    try {
      const snapshot = await this.db.collection(this.collection).get();
      const allBeyblades = snapshot.docs.map(
        (doc) => doc.data() as BeybladeStats,
      );

      const searchLower = query.toLowerCase();
      return allBeyblades.filter(
        (bey) =>
          bey.name?.toLowerCase().includes(searchLower) ||
          bey.displayName.toLowerCase().includes(searchLower),
      );
    } catch (error) {
      console.error("Error searching Beyblades:", error);
      return [];
    }
  }

  /**
   * Get Beyblades with highest stat in a category
   */
  async getTopBeybladesByCategory(
    category: "attack" | "defense" | "stamina",
    limit: number = 3,
  ): Promise<BeybladeStats[]> {
    try {
      const snapshot = await this.db.collection(this.collection).get();
      const allBeyblades = snapshot.docs.map(
        (doc) => doc.data() as BeybladeStats,
      );

      return allBeyblades
        .sort(
          (a, b) => b.typeDistribution[category] - a.typeDistribution[category],
        )
        .slice(0, limit);
    } catch (error) {
      console.error(`Error getting top Beyblades for ${category}:`, error);
      return [];
    }
  }
}

export const beybladeStatsService = new BeybladeStatsService();
