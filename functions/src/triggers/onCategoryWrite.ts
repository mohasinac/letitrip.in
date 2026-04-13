/**
 * Trigger: onCategoryWrite — DISABLED (search provider removed)
 *
 * This trigger was previously used for external search index sync.
 * Search indexing is now handled by Firestore native queries (free tier compatible).
 *
 * To re-enable search indexing, implement a Firestore-based search strategy
 * or subscribe to a search provider compatible with your deployment tier.
 */
import { onDocumentWritten } from "firebase-functions/v2/firestore";
import { REGION, COLLECTIONS } from "../config/constants";

// No-op trigger (disabled)
export const onCategoryWrite = onDocumentWritten(
  {
    document: `${COLLECTIONS.CATEGORIES}/{categoryId}`,
    region: REGION,
  },
  async () => {
    // External search provider removed; Firestore queries are used instead
  },
);
