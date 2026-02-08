/**
 * Site Settings Repository
 *
 * Manages site-wide configuration settings (singleton document)
 */

import { BaseRepository } from "./base.repository";
import { prepareForFirestore } from "@/lib/firebase/firestore-helpers";
import {
  SITE_SETTINGS_COLLECTION,
  SiteSettingsDocument,
  SiteSettingsUpdateInput,
  DEFAULT_SITE_SETTINGS_DATA,
} from "@/db/schema/site-settings";
import { DatabaseError } from "@/lib/errors";

/**
 * Repository for site settings management
 *
 * Note: Site settings is a singleton document with ID "global"
 */
class SiteSettingsRepository extends BaseRepository<SiteSettingsDocument> {
  /**
   * Singleton document ID
   */
  private readonly SINGLETON_ID = "global";

  constructor() {
    super(SITE_SETTINGS_COLLECTION);
  }

  /**
   * Get the global site settings
   * Creates default settings if not exists
   *
   * @returns Promise<SiteSettingsDocument>
   */
  async getSingleton(): Promise<SiteSettingsDocument> {
    try {
      const doc = await this.db
        .collection(this.collection)
        .doc(this.SINGLETON_ID)
        .get();

      if (!doc.exists) {
        // Create default settings on first access
        const defaultSettings: SiteSettingsDocument = {
          id: this.SINGLETON_ID,
          ...DEFAULT_SITE_SETTINGS_DATA,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as SiteSettingsDocument;

        await this.db
          .collection(this.collection)
          .doc(this.SINGLETON_ID)
          .set(prepareForFirestore(defaultSettings));

        return defaultSettings;
      }

      return { id: doc.id, ...doc.data() } as SiteSettingsDocument;
    } catch (error) {
      throw new DatabaseError(
        `Failed to retrieve site settings: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Update the global site settings
   *
   * @param updates - Partial updates to apply
   * @returns Promise<SiteSettingsDocument>
   */
  async updateSingleton(
    updates: SiteSettingsUpdateInput,
  ): Promise<SiteSettingsDocument> {
    try {
      const updateData = prepareForFirestore({
        ...updates,
        updatedAt: new Date(),
      });

      await this.db
        .collection(this.collection)
        .doc(this.SINGLETON_ID)
        .update(updateData);

      return await this.getSingleton();
    } catch (error) {
      throw new DatabaseError(
        `Failed to update site settings: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Get FAQ variables for interpolation
   *
   * @returns Promise<Record<string, string | number>>
   */
  async getFAQVariables(): Promise<Record<string, string | number>> {
    const settings = await this.getSingleton();
    return settings.faq?.variables || {};
  }

  /**
   * Update FAQ variables
   *
   * @param variables - New FAQ variable values
   * @returns Promise<void>
   */
  async updateFAQVariables(variables: {
    shippingDays: number;
    minOrderValue: number;
    returnWindow: number;
    supportEmail: string;
    supportPhone: string;
    codDeposit: number;
  }): Promise<void> {
    await this.updateSingleton({
      faq: { variables },
    } as any);
  }

  /**
   * Get site features
   *
   * @returns Promise<Array<{id, icon, title, description}>>
   */
  async getFeatures() {
    const settings = await this.getSingleton();
    return settings.features || [];
  }

  /**
   * Update site features
   *
   * @param features - New features array
   * @returns Promise<void>
   */
  async updateFeatures(
    features: Array<{
      id: string;
      name: string;
      description: string;
      icon: string;
      enabled: boolean;
    }>,
  ): Promise<void> {
    await this.updateSingleton({ features } as any);
  }

  /**
   * Get email settings for transactional emails
   *
   * @returns Promise<{fromName, fromEmail, replyTo}>
   */
  async getEmailSettings() {
    const settings = await this.getSingleton();
    return settings.emailSettings;
  }

  /**
   * Check if site settings exist
   *
   * @returns Promise<boolean>
   */
  async exists(): Promise<boolean> {
    try {
      const doc = await this.db
        .collection(this.collection)
        .doc(this.SINGLETON_ID)
        .get();
      return doc.exists;
    } catch {
      return false;
    }
  }

  /**
   * Reset site settings to defaults
   * WARNING: This will overwrite all custom settings
   *
   * @returns Promise<SiteSettingsDocument>
   */
  async resetToDefaults(): Promise<SiteSettingsDocument> {
    const defaultSettings: SiteSettingsDocument = {
      id: this.SINGLETON_ID,
      ...DEFAULT_SITE_SETTINGS_DATA,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as SiteSettingsDocument;

    await this.db
      .collection(this.collection)
      .doc(this.SINGLETON_ID)
      .set(prepareForFirestore(defaultSettings));

    return defaultSettings;
  }
}

// Export singleton instance
export const siteSettingsRepository = new SiteSettingsRepository();
