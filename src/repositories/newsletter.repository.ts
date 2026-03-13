/**
 * Newsletter Subscribers Repository
 *
 * Data access layer for newsletter subscriber documents in Firestore.
 * Handles subscribe, unsubscribe, re-subscribe, and admin listing.
 */

import { BaseRepository } from "./base.repository";
import { prepareForFirestore } from "@/lib/firebase/firestore-helpers";
import type { SieveModel, FirebaseSieveResult } from "@/lib/query";
import type {
  NewsletterSubscriberDocument,
  NewsletterSubscriberCreateInput,
  NewsletterSubscriberUpdateInput,
} from "@/db/schema";
import {
  NEWSLETTER_SUBSCRIBERS_COLLECTION,
  NEWSLETTER_SUBSCRIBER_FIELDS,
} from "@/db/schema";

class NewsletterRepository extends BaseRepository<NewsletterSubscriberDocument> {
  constructor() {
    super(NEWSLETTER_SUBSCRIBERS_COLLECTION);
  }

  // ---------------------------------------------------------------------------
  // Sieve-powered list query (admin use)
  // ---------------------------------------------------------------------------

  static readonly SIEVE_FIELDS = {
    email: { canFilter: true, canSort: true },
    status: { canFilter: true, canSort: false },
    source: { canFilter: true, canSort: false },
    subscribedAt: { canFilter: true, canSort: true },
    createdAt: { canFilter: true, canSort: true },
  };

  /**
   * Paginated, Firestore-native subscriber list (admin use).
   */
  async list(
    model: SieveModel,
  ): Promise<FirebaseSieveResult<NewsletterSubscriberDocument>> {
    return this.sieveQuery<NewsletterSubscriberDocument>(
      model,
      NewsletterRepository.SIEVE_FIELDS,
      { defaultPageSize: 50, maxPageSize: 200 },
    );
  }

  // ---------------------------------------------------------------------------
  // Lookup
  // ---------------------------------------------------------------------------

  /**
   * Find a subscriber by email address (case-insensitive via lowercase email).
   */
  async findByEmail(
    email: string,
  ): Promise<NewsletterSubscriberDocument | null> {
    const snapshot = await this.db
      .collection(this.collection)
      .where(NEWSLETTER_SUBSCRIBER_FIELDS.EMAIL, "==", email.toLowerCase())
      .limit(1)
      .get();

    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return this.mapDoc<NewsletterSubscriberDocument>(doc);
  }

  // ---------------------------------------------------------------------------
  // Write operations
  // ---------------------------------------------------------------------------

  /**
   * Create a new subscriber record.
   * Email is stored lowercase. Initial status is "active".
   */
  async subscribe(
    input: NewsletterSubscriberCreateInput,
  ): Promise<NewsletterSubscriberDocument> {
    const now = new Date();
    const data: Omit<NewsletterSubscriberDocument, "id"> = {
      email: input.email.toLowerCase(),
      status: NEWSLETTER_SUBSCRIBER_FIELDS.STATUS_VALUES.ACTIVE,
      source: input.source,
      ipAddress: input.ipAddress,
      subscribedAt: now,
      createdAt: now,
      updatedAt: now,
    };

    const ref = await this.db
      .collection(this.collection)
      .add(prepareForFirestore(data));

    return { id: ref.id, ...data };
  }

  /**
   * Mark an existing subscriber as unsubscribed.
   */
  async unsubscribe(id: string): Promise<void> {
    await this.db
      .collection(this.collection)
      .doc(id)
      .update(
        prepareForFirestore({
          status: NEWSLETTER_SUBSCRIBER_FIELDS.STATUS_VALUES.UNSUBSCRIBED,
          unsubscribedAt: new Date(),
          updatedAt: new Date(),
        }),
      );
  }

  /**
   * Re-activate a previously unsubscribed subscriber.
   */
  async resubscribe(id: string): Promise<NewsletterSubscriberDocument> {
    const now = new Date();
    await this.db
      .collection(this.collection)
      .doc(id)
      .update(
        prepareForFirestore({
          status: NEWSLETTER_SUBSCRIBER_FIELDS.STATUS_VALUES.ACTIVE,
          resubscribedAt: now,
          unsubscribedAt: null,
          updatedAt: now,
        }),
      );
    const doc = await this.db.collection(this.collection).doc(id).get();
    return this.mapDoc<NewsletterSubscriberDocument>(doc);
  }

  /**
   * Partial update (admin: set adminNote, status, etc.).
   */
  async updateSubscriber(
    id: string,
    input: NewsletterSubscriberUpdateInput,
  ): Promise<NewsletterSubscriberDocument> {
    return this.update(id, { ...input, updatedAt: new Date() });
  }

  /**
   * Permanently delete a subscriber record (admin GDPR action).
   */
  async deleteById(id: string): Promise<void> {
    await this.db.collection(this.collection).doc(id).delete();
  }
}

// Export singleton instance
export const newsletterRepository = new NewsletterRepository();
