/**
 * FAQs Repository
 *
 * Manages FAQ collection with variable interpolation from siteSettings
 */

import { BaseRepository } from "./base.repository";
import {
  FAQS_COLLECTION,
  FAQDocument,
  FAQCreateInput,
  FAQUpdateInput,
  FAQCategory,
  FAQWithInterpolatedAnswer,
  extractVariablePlaceholders,
  usesVariableInterpolation,
  validateFAQVariables,
  slugifyQuestion,
  createFAQId,
} from "@/db/schema/faqs";
import { DatabaseError } from "@/lib/errors";
import { siteSettingsRepository } from "./site-settings.repository";
import { prepareForFirestore } from "@/lib/firebase/firestore-helpers";
import { FieldValue } from "firebase-admin/firestore";

/**
 * Repository for FAQ management with variable interpolation
 */
class FAQsRepository extends BaseRepository<FAQDocument> {
  constructor() {
    super(FAQS_COLLECTION);
  }

  /**
   * Get FAQ by slug
   *
   * @param slug - FAQ slug
   * @returns Promise<FAQDocument | null>
   */
  async getFAQBySlug(slug: string): Promise<FAQDocument | null> {
    try {
      const snapshot = await this.db
        .collection(this.collection)
        .where("seo.slug", "==", slug)
        .limit(1)
        .get();

      if (snapshot.empty) return null;

      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() } as FAQDocument;
    } catch (error) {
      throw new DatabaseError(
        `Failed to retrieve FAQ by slug: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Get FAQs by category
   *
   * @param category - FAQ category
   * @returns Promise<FAQDocument[]>
   */
  async getFAQsByCategory(category: FAQCategory): Promise<FAQDocument[]> {
    try {
      const snapshot = await this.db
        .collection(this.collection)
        .where("category", "==", category)
        .where("isActive", "==", true)
        .orderBy("order", "asc")
        .get();

      return snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as FAQDocument,
      );
    } catch (error) {
      throw new DatabaseError(
        `Failed to retrieve FAQs by category: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Get homepage FAQs (sorted by priority)
   *
   * @returns Promise<FAQDocument[]>
   */
  async getHomepageFAQs(): Promise<FAQDocument[]> {
    try {
      const snapshot = await this.db
        .collection(this.collection)
        .where("showOnHomepage", "==", true)
        .where("isActive", "==", true)
        .orderBy("priority", "desc")
        .get();

      return snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as FAQDocument,
      );
    } catch (error) {
      throw new DatabaseError(
        `Failed to retrieve homepage FAQs: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Get footer FAQs
   *
   * @returns Promise<FAQDocument[]>
   */
  async getFooterFAQs(): Promise<FAQDocument[]> {
    try {
      const snapshot = await this.db
        .collection(this.collection)
        .where("showInFooter", "==", true)
        .where("isActive", "==", true)
        .orderBy("order", "asc")
        .get();

      return snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as FAQDocument,
      );
    } catch (error) {
      throw new DatabaseError(
        `Failed to retrieve footer FAQs: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Get pinned FAQs for a category
   *
   * @param category - FAQ category
   * @returns Promise<FAQDocument[]>
   */
  async getPinnedFAQs(category?: FAQCategory): Promise<FAQDocument[]> {
    try {
      let query = this.db
        .collection(this.collection)
        .where("isPinned", "==", true)
        .where("isActive", "==", true);

      if (category) {
        query = query.where("category", "==", category);
      }

      const snapshot = await query.orderBy("order", "asc").get();

      return snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as FAQDocument,
      );
    } catch (error) {
      throw new DatabaseError(
        `Failed to retrieve pinned FAQs: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Search FAQs by tag
   *
   * @param tag - Tag to search for
   * @returns Promise<FAQDocument[]>
   */
  async searchByTag(tag: string): Promise<FAQDocument[]> {
    try {
      const snapshot = await this.db
        .collection(this.collection)
        .where("tags", "array-contains", tag)
        .where("isActive", "==", true)
        .get();

      return snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as FAQDocument,
      );
    } catch (error) {
      throw new DatabaseError(
        `Failed to search FAQs by tag: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Get most helpful FAQs
   *
   * @param limit - Maximum number of FAQs to return
   * @returns Promise<FAQDocument[]>
   */
  async getMostHelpful(limit: number = 10): Promise<FAQDocument[]> {
    try {
      const snapshot = await this.db
        .collection(this.collection)
        .where("isActive", "==", true)
        .orderBy("stats.helpful", "desc")
        .limit(limit)
        .get();

      return snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as FAQDocument,
      );
    } catch (error) {
      throw new DatabaseError(
        `Failed to retrieve most helpful FAQs: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Interpolate FAQ answer with site settings variables
   *
   * @param faq - FAQ document
   * @returns Promise<FAQWithInterpolatedAnswer>
   */
  async interpolateVariables(
    faq: FAQDocument,
  ): Promise<FAQWithInterpolatedAnswer> {
    try {
      // If FAQ doesn't use site settings, return as-is with original text
      if (!usesVariableInterpolation(faq)) {
        return {
          ...faq,
          answer: {
            ...faq.answer,
            interpolated: faq.answer.text,
          },
        };
      }

      // Get site settings variables
      const siteVariables = await siteSettingsRepository.getFAQVariables();

      // Merge with custom FAQ variables (custom overrides site)
      const allVariables = {
        ...siteVariables,
        ...(faq.variables || {}),
      };

      // Interpolate variables in answer text
      let interpolatedText = faq.answer.text;
      const placeholders = extractVariablePlaceholders(faq.answer.text);

      for (const varName of placeholders) {
        const value = allVariables[varName];
        if (value !== undefined) {
          const regex = new RegExp(`\\{\\{${varName}\\}\\}`, "g");
          interpolatedText = interpolatedText.replace(regex, String(value));
        }
      }

      return {
        ...faq,
        answer: {
          ...faq.answer,
          interpolated: interpolatedText,
        },
      };
    } catch (error) {
      // On error, return FAQ with original text
      return {
        ...faq,
        answer: {
          ...faq.answer,
          interpolated: faq.answer.text,
        },
      };
    }
  }

  /**
   * Increment FAQ view count
   *
   * @param faqId - FAQ ID
   * @returns Promise<void>
   */
  async incrementViews(faqId: string): Promise<void> {
    try {
      await this.db
        .collection(this.collection)
        .doc(faqId)
        .update({
          "stats.views": FieldValue.increment(1),
          "stats.lastViewed": new Date(),
        });
    } catch (error) {
      throw new DatabaseError(
        `Failed to increment FAQ views: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Mark FAQ as helpful
   *
   * @param faqId - FAQ ID
   * @returns Promise<void>
   */
  async markHelpful(faqId: string): Promise<void> {
    try {
      await this.db
        .collection(this.collection)
        .doc(faqId)
        .update({
          "stats.helpful": FieldValue.increment(1),
        });
    } catch (error) {
      throw new DatabaseError(
        `Failed to mark FAQ as helpful: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Mark FAQ as not helpful
   *
   * @param faqId - FAQ ID
   * @returns Promise<void>
   */
  async markNotHelpful(faqId: string): Promise<void> {
    try {
      await this.db
        .collection(this.collection)
        .doc(faqId)
        .update({
          "stats.notHelpful": FieldValue.increment(1),
        });
    } catch (error) {
      throw new DatabaseError(
        `Failed to mark FAQ as not helpful: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Validate FAQ before creation
   * Checks for invalid variable placeholders
   *
   * @param faq - FAQ document to validate
   * @returns Promise<{valid: boolean, invalidVars?: string[]}>
   */
  async validateFAQ(
    faq: FAQDocument,
  ): Promise<{ valid: boolean; invalidVars?: string[] }> {
    try {
      if (!usesVariableInterpolation(faq)) {
        return { valid: true };
      }

      const siteVariables = await siteSettingsRepository.getFAQVariables();
      const invalidVars = validateFAQVariables(faq, siteVariables);

      return {
        valid: invalidVars.length === 0,
        invalidVars: invalidVars.length > 0 ? invalidVars : undefined,
      };
    } catch (error) {
      return { valid: false };
    }
  }

  /**
   * Create FAQ with auto-generated slug and SEO-friendly ID
   *
   * @param input - FAQ creation input
   * @returns Promise<FAQDocument>
   */
  async createWithSlug(input: FAQCreateInput): Promise<FAQDocument> {
    try {
      // Auto-generate slug if not provided
      if (!input.seo.slug) {
        input.seo.slug = slugifyQuestion(input.question);
      }

      // Validate FAQ
      const validation = await this.validateFAQ(input as FAQDocument);
      if (!validation.valid) {
        throw new DatabaseError(
          `Invalid FAQ: Unknown variables ${validation.invalidVars?.join(", ")}`,
        );
      }

      // Generate SEO-friendly ID from category and question
      const id = createFAQId(input.category, input.question);

      const faqData: Omit<FAQDocument, "id"> = {
        ...input,
        stats: {
          views: 0,
          helpful: 0,
          notHelpful: 0,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await this.db
        .collection(this.collection)
        .doc(id)
        .set(prepareForFirestore(faqData));

      return { id, ...faqData };
    } catch (error) {
      throw new DatabaseError(
        `Failed to create FAQ: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Get related FAQs
   *
   * @param faqId - FAQ ID
   * @returns Promise<FAQDocument[]>
   */
  async getRelatedFAQs(faqId: string): Promise<FAQDocument[]> {
    try {
      const faq = await this.findById(faqId);
      if (!faq || !faq.relatedFAQs || faq.relatedFAQs.length === 0) {
        return [];
      }

      const relatedFAQs: FAQDocument[] = [];
      for (const relatedId of faq.relatedFAQs) {
        const relatedFAQ = await this.findById(relatedId);
        if (relatedFAQ && relatedFAQ.isActive) {
          relatedFAQs.push(relatedFAQ);
        }
      }

      return relatedFAQs;
    } catch (error) {
      throw new DatabaseError(
        `Failed to retrieve related FAQs: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }
}

// Export singleton instance
export const faqsRepository = new FAQsRepository();
