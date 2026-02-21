/**
 * Newsletter Repository
 *
 * Data access layer for newsletter subscriber documents.
 */

import { BaseRepository } from "./base.repository";
import { prepareForFirestore } from "@/lib/firebase/firestore-helpers";
import type {
  NewsletterSubscriberDocument,
  NewsletterSubscriberCreateInput,
} from "@/db/schema";
import { NEWSLETTER_COLLECTION, NEWSLETTER_FIELDS } from "@/db/schema";
import { serverLogger } from "@/lib/server-logger";
import { DatabaseError } from "@/lib/errors";
import type {
  SieveModel,
  FirebaseSieveFields,
} from "@/lib/query/firebase-sieve";

class NewsletterRepository extends BaseRepository<NewsletterSubscriberDocument> {
  constructor() {
    super(NEWSLETTER_COLLECTION);
  }

  /**
   * Find a subscriber by email (case-insensitive check via lowercase storage)
   */
  async findByEmail(
    email: string,
  ): Promise<NewsletterSubscriberDocument | null> {
    try {
      const snapshot = await this.getCollection()
        .where(NEWSLETTER_FIELDS.EMAIL, "==", email.toLowerCase())
        .limit(1)
        .get();

      if (snapshot.empty) return null;

      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() } as NewsletterSubscriberDocument;
    } catch (error) {
      throw new DatabaseError(
        `Failed to find newsletter subscriber by email: ${email}`,
        error,
      );
    }
  }

  /**
   * Subscribe an email. If already subscribed, re-activates the subscription.
   * Returns the subscriber document and whether it was newly created.
   */
  async subscribe(
    input: NewsletterSubscriberCreateInput,
  ): Promise<{ subscriber: NewsletterSubscriberDocument; isNew: boolean }> {
    const email = input.email.toLowerCase();
    const existing = await this.findByEmail(email);

    if (existing) {
      if (existing.status === "active") {
        // Already subscribed — return without error
        return { subscriber: existing, isNew: false };
      }

      // Re-subscribe
      const now = new Date();
      await this.getCollection()
        .doc(existing.id)
        .update({
          [NEWSLETTER_FIELDS.STATUS]: NEWSLETTER_FIELDS.STATUS_VALUES.ACTIVE,
          [NEWSLETTER_FIELDS.UPDATED_AT]: now,
        });

      serverLogger.info("Newsletter re-subscription", { email });

      return {
        subscriber: {
          ...existing,
          status: "active",
          updatedAt: now,
        },
        isNew: false,
      };
    }

    // New subscription
    const now = new Date();
    const docRef = this.getCollection().doc();
    const data: Omit<NewsletterSubscriberDocument, "id"> = {
      email,
      status: "active",
      source: input.source || "homepage",
      createdAt: now,
      updatedAt: now,
    };

    await docRef.set(prepareForFirestore(data));

    serverLogger.info("New newsletter subscription", {
      email,
      source: data.source,
    });

    return {
      subscriber: { id: docRef.id, ...data },
      isNew: true,
    };
  }

  /**
   * Unsubscribe an email — updates status to "unsubscribed".
   * Returns false if email not found.
   */
  async unsubscribe(email: string): Promise<boolean> {
    try {
      const existing = await this.findByEmail(email.toLowerCase());

      if (!existing) return false;

      await this.getCollection()
        .doc(existing.id)
        .update({
          [NEWSLETTER_FIELDS.STATUS]:
            NEWSLETTER_FIELDS.STATUS_VALUES.UNSUBSCRIBED,
          [NEWSLETTER_FIELDS.UNSUBSCRIBED_AT]: new Date(),
          [NEWSLETTER_FIELDS.UPDATED_AT]: new Date(),
        });

      serverLogger.info("Newsletter unsubscription", { email });

      return true;
    } catch (error) {
      throw new DatabaseError(`Failed to unsubscribe email: ${email}`, error);
    }
  }

  /**
   * Count all active subscribers
   */
  async countActive(): Promise<number> {
    try {
      const snapshot = await this.getCollection()
        .where(
          NEWSLETTER_FIELDS.STATUS,
          "==",
          NEWSLETTER_FIELDS.STATUS_VALUES.ACTIVE,
        )
        .count()
        .get();
      return snapshot.data().count;
    } catch (error) {
      throw new DatabaseError(
        "Failed to count active newsletter subscribers",
        error,
      );
    }
  }

  // ── Sieve fields for admin list queries ─────────────────────────────────

  static readonly SIEVE_FIELDS: FirebaseSieveFields = {
    email: { canFilter: true, canSort: true },
    status: { canFilter: true, canSort: false },
    source: { canFilter: true, canSort: false },
    createdAt: { canFilter: true, canSort: true },
    unsubscribedAt: { canFilter: true, canSort: true },
  };

  /**
   * Paginated list of newsletter subscribers for admin.
   * Supports Sieve filters/sorts/pagination.
   */
  async list(model: SieveModel) {
    return this.sieveQuery<NewsletterSubscriberDocument>(
      model,
      NewsletterRepository.SIEVE_FIELDS,
    );
  }

  /**
   * Unsubscribe a subscriber by document ID (admin action).
   */
  async unsubscribeById(id: string): Promise<boolean> {
    try {
      await this.getCollection()
        .doc(id)
        .update({
          [NEWSLETTER_FIELDS.STATUS]:
            NEWSLETTER_FIELDS.STATUS_VALUES.UNSUBSCRIBED,
          [NEWSLETTER_FIELDS.UNSUBSCRIBED_AT]: new Date(),
          [NEWSLETTER_FIELDS.UPDATED_AT]: new Date(),
        });
      serverLogger.info("Admin unsubscribed newsletter subscriber", { id });
      return true;
    } catch (error) {
      throw new DatabaseError(
        `Failed to unsubscribe newsletter subscriber: ${id}`,
        error,
      );
    }
  }

  /**
   * Resubscribe a subscriber by document ID (admin action).
   */
  async resubscribeById(id: string): Promise<boolean> {
    try {
      await this.getCollection()
        .doc(id)
        .update({
          [NEWSLETTER_FIELDS.STATUS]: NEWSLETTER_FIELDS.STATUS_VALUES.ACTIVE,
          [NEWSLETTER_FIELDS.UPDATED_AT]: new Date(),
        });
      serverLogger.info("Admin resubscribed newsletter subscriber", { id });
      return true;
    } catch (error) {
      throw new DatabaseError(
        `Failed to resubscribe newsletter subscriber: ${id}`,
        error,
      );
    }
  }

  /**
   * Get subscriber stats: totals by status and source breakdown.
   */
  async getStats(): Promise<{
    total: number;
    active: number;
    unsubscribed: number;
    sources: Record<string, number>;
  }> {
    try {
      const snapshot = await this.getCollection().get();
      const docs = snapshot.docs.map((d) => ({
        ...(d.data() as NewsletterSubscriberDocument),
        id: d.id,
      }));

      const total = docs.length;
      const active = docs.filter(
        (d) => d.status === NEWSLETTER_FIELDS.STATUS_VALUES.ACTIVE,
      ).length;
      const unsubscribed = total - active;

      const sources: Record<string, number> = {};
      for (const doc of docs) {
        const src = doc.source ?? "unknown";
        sources[src] = (sources[src] ?? 0) + 1;
      }

      return { total, active, unsubscribed, sources };
    } catch (error) {
      throw new DatabaseError(
        "Failed to fetch newsletter subscriber stats",
        error,
      );
    }
  }
}

export const newsletterRepository = new NewsletterRepository();
