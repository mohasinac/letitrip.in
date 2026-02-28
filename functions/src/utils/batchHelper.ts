import type { WriteBatch, DocumentReference } from "firebase-admin/firestore";
import { db } from "../config/firebase-admin";
import { BATCH_LIMIT } from "../config/constants";

/**
 * Run a Firestore batch delete on an array of document references.
 * Automatically splits into multiple batches if refs.length > BATCH_LIMIT.
 *
 * @returns Total number of documents deleted.
 */
export async function batchDelete(refs: DocumentReference[]): Promise<number> {
  if (refs.length === 0) return 0;

  let deleted = 0;
  for (let i = 0; i < refs.length; i += BATCH_LIMIT) {
    const batch: WriteBatch = db.batch();
    const chunk = refs.slice(i, i + BATCH_LIMIT);
    chunk.forEach((ref) => batch.delete(ref));
    await batch.commit();
    deleted += chunk.length;
  }
  return deleted;
}

/**
 * Run a Firestore batch update on an array of (ref, data) pairs.
 * Automatically splits into multiple batches if pairs.length > BATCH_LIMIT.
 *
 * @returns Total number of documents updated.
 */
export async function batchUpdate(
  pairs: Array<{ ref: DocumentReference; data: Record<string, unknown> }>,
): Promise<number> {
  if (pairs.length === 0) return 0;

  let updated = 0;
  for (let i = 0; i < pairs.length; i += BATCH_LIMIT) {
    const batch: WriteBatch = db.batch();
    const chunk = pairs.slice(i, i + BATCH_LIMIT);
    chunk.forEach(({ ref, data }) => batch.update(ref, data));
    await batch.commit();
    updated += chunk.length;
  }
  return updated;
}
