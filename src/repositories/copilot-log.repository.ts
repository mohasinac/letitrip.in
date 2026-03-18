/**
 * Copilot Log Repository
 *
 * Stores AI copilot conversation logs in Firestore.
 * Used exclusively by the /api/copilot/chat route.
 */

import { BaseRepository } from "./base.repository";
import { prepareForFirestore } from "@/lib/firebase/firestore-helpers";
import type { CopilotLogDocument, CopilotLogCreateInput } from "@/db/schema";
import { COPILOT_LOGS_COLLECTION } from "@/db/schema";

class CopilotLogRepository extends BaseRepository<CopilotLogDocument> {
  constructor() {
    super(COPILOT_LOGS_COLLECTION);
  }

  /**
   * Persist a single prompt↔response exchange.
   */
  async create(input: CopilotLogCreateInput): Promise<CopilotLogDocument> {
    const ref = this.getCollection().doc();
    const doc: Omit<CopilotLogDocument, "id"> = {
      ...input,
      feedback: null,
      createdAt: new Date(),
    };
    await ref.set(prepareForFirestore(doc));
    return { id: ref.id, ...doc };
  }

  /**
   * Fetch conversation history for a given conversationId (ordered by time).
   */
  async findByConversation(
    conversationId: string,
    limit = 50,
  ): Promise<CopilotLogDocument[]> {
    const snap = await this.getCollection()
      .where("conversationId", "==", conversationId)
      .orderBy("createdAt", "asc")
      .limit(limit)
      .get();
    return snap.docs.map((d) => this.mapDoc(d));
  }

  /**
   * Record user feedback (thumbs up / down) on a log entry.
   */
  async setFeedback(
    logId: string,
    feedback: "positive" | "negative",
  ): Promise<void> {
    await this.getCollection()
      .doc(logId)
      .update(prepareForFirestore({ feedback }));
  }
}

export const copilotLogRepository = new CopilotLogRepository();
