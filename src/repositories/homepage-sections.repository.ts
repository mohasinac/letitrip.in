/**
 * Homepage Sections Repository
 *
 * Manages homepage section configuration and ordering
 */

import { BaseRepository } from "./base.repository";
import { prepareForFirestore } from "@/lib/firebase/firestore-helpers";
import {
  HOMEPAGE_SECTIONS_COLLECTION,
  HomepageSectionDocument,
  HomepageSectionCreateInput,
  HomepageSectionUpdateInput,
  SectionType,
  createHomepageSectionId,
} from "@/db/schema/homepage-sections";
import { DatabaseError } from "@/lib/errors";

/**
 * Repository for homepage section management
 */
class HomepageSectionsRepository extends BaseRepository<HomepageSectionDocument> {
  constructor() {
    super(HOMEPAGE_SECTIONS_COLLECTION);
  }

  /**
   * Create new homepage section with SEO-friendly ID
   */
  async create(
    input: HomepageSectionCreateInput,
  ): Promise<HomepageSectionDocument> {
    // Generate section ID from type
    const id = createHomepageSectionId(input.type);

    const sectionData: Omit<HomepageSectionDocument, "id"> = {
      ...input,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.db
      .collection(this.collection)
      .doc(id)
      .set(prepareForFirestore(sectionData));

    return { id, ...sectionData };
  }

  /**
   * Get all enabled homepage sections (sorted by order)
   *
   * @returns Promise<HomepageSectionDocument[]>
   */
  async getEnabledSections(): Promise<HomepageSectionDocument[]> {
    try {
      const snapshot = await this.db
        .collection(this.collection)
        .where("enabled", "==", true)
        .orderBy("order", "asc")
        .get();

      return snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as HomepageSectionDocument,
      );
    } catch (error) {
      throw new DatabaseError(
        `Failed to retrieve enabled sections: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Get all disabled homepage sections
   *
   * @returns Promise<HomepageSectionDocument[]>
   */
  async getDisabledSections(): Promise<HomepageSectionDocument[]> {
    try {
      const snapshot = await this.db
        .collection(this.collection)
        .where("enabled", "==", false)
        .orderBy("order", "asc")
        .get();

      return snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as HomepageSectionDocument,
      );
    } catch (error) {
      throw new DatabaseError(
        `Failed to retrieve disabled sections: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Get section by type
   *
   * @param type - Section type
   * @returns Promise<HomepageSectionDocument | null>
   */
  async getSectionByType(
    type: SectionType,
  ): Promise<HomepageSectionDocument | null> {
    try {
      const snapshot = await this.db
        .collection(this.collection)
        .where("type", "==", type)
        .limit(1)
        .get();

      if (snapshot.empty) return null;

      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() } as HomepageSectionDocument;
    } catch (error) {
      throw new DatabaseError(
        `Failed to retrieve section by type: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Enable a homepage section
   *
   * @param sectionId - Section ID to enable
   * @returns Promise<HomepageSectionDocument>
   */
  async enableSection(sectionId: string): Promise<HomepageSectionDocument> {
    try {
      await this.db.collection(this.collection).doc(sectionId).update({
        enabled: true,
        updatedAt: new Date(),
      });

      return await this.findByIdOrFail(sectionId);
    } catch (error) {
      throw new DatabaseError(
        `Failed to enable section: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Disable a homepage section
   *
   * @param sectionId - Section ID to disable
   * @returns Promise<HomepageSectionDocument>
   */
  async disableSection(sectionId: string): Promise<HomepageSectionDocument> {
    try {
      await this.db.collection(this.collection).doc(sectionId).update({
        enabled: false,
        updatedAt: new Date(),
      });

      return await this.findByIdOrFail(sectionId);
    } catch (error) {
      throw new DatabaseError(
        `Failed to disable section: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Toggle section enabled status
   *
   * @param sectionId - Section ID to toggle
   * @returns Promise<HomepageSectionDocument>
   */
  async toggleSection(sectionId: string): Promise<HomepageSectionDocument> {
    try {
      const section = await this.findByIdOrFail(sectionId);

      await this.db.collection(this.collection).doc(sectionId).update({
        enabled: !section.enabled,
        updatedAt: new Date(),
      });

      return await this.findByIdOrFail(sectionId);
    } catch (error) {
      throw new DatabaseError(
        `Failed to toggle section: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Reorder homepage sections
   *
   * @param sectionOrders - Array of {id, order} objects
   * @returns Promise<void>
   */
  async reorderSections(
    sectionOrders: Array<{ id: string; order: number }>,
  ): Promise<void> {
    try {
      const batch = this.db.batch();
      const now = new Date();

      for (const { id, order } of sectionOrders) {
        const ref = this.db.collection(this.collection).doc(id);
        batch.update(ref, {
          order,
          updatedAt: now,
        });
      }

      await batch.commit();
    } catch (error) {
      throw new DatabaseError(
        `Failed to reorder sections: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Update section configuration
   *
   * @param sectionId - Section ID to update
   * @param config - New configuration object
   * @returns Promise<HomepageSectionDocument>
   */
  async updateSectionConfig(
    sectionId: string,
    config: Record<string, unknown>,
  ): Promise<HomepageSectionDocument> {
    try {
      await this.db.collection(this.collection).doc(sectionId).update({
        config,
        updatedAt: new Date(),
      });

      return await this.findByIdOrFail(sectionId);
    } catch (error) {
      throw new DatabaseError(
        `Failed to update section config: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Batch enable/disable multiple sections
   *
   * @param sectionIds - Array of section IDs
   * @param enabled - True to enable, false to disable
   * @returns Promise<void>
   */
  async batchToggleSections(
    sectionIds: string[],
    enabled: boolean,
  ): Promise<void> {
    try {
      const batch = this.db.batch();
      const now = new Date();

      for (const id of sectionIds) {
        const ref = this.db.collection(this.collection).doc(id);
        batch.update(ref, {
          enabled,
          updatedAt: now,
        });
      }

      await batch.commit();
    } catch (error) {
      throw new DatabaseError(
        `Failed to batch toggle sections: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Reset section to default configuration
   *
   * @param sectionId - Section ID to reset
   * @param defaultConfig - Default configuration object
   * @returns Promise<HomepageSectionDocument>
   */
  async resetSectionToDefault(
    sectionId: string,
    defaultConfig: Record<string, unknown>,
  ): Promise<HomepageSectionDocument> {
    try {
      await this.db.collection(this.collection).doc(sectionId).update({
        config: defaultConfig,
        updatedAt: new Date(),
      });

      return await this.findByIdOrFail(sectionId);
    } catch (error) {
      throw new DatabaseError(
        `Failed to reset section: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }
}

// Export singleton instance
export const homepageSectionsRepository = new HomepageSectionsRepository();
