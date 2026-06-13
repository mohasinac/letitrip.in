import "@/providers.config";
/**
 * POST /api/demo/seed/event/init
 *
 * Creates a seed-run progress node in Firebase Realtime DB and issues a
 * one-time, per-run custom token so the SeedPanel can subscribe read-only
 * to that single RTDB path.
 *
 * Admin-only. Returns { runId, customToken, expiresAt }.
 *
 * The subsequent POST /api/demo/seed call accepts the runId and writes
 * per-collection progress to /seed_events/{runId}/cols/{name} and overall
 * meta under /seed_events/{runId}/meta as the work progresses.
 */

import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getUserFromRequest } from "@/lib/firebase/auth-server";
import {
  getAdminAuth,
  getAdminRealtimeDb,
  serverLogger,
  RTDB_PATHS,
  RTDBPayloadStatus,
  isAdminUser,
} from "@mohasinac/appkit";

/** Hard timeout communicated to the client. */
const EVENT_TTL_MS = 30 * 60 * 1000;

// rbac-scope-enforced-in-handler: demo seed — handler asserts isAdminUser before any write
export async function POST(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user || !isAdminUser(user)) {
    return NextResponse.json(
      { success: false, message: "Unauthorized." },
      { status: 401 },
    );
  }

  const runId = randomUUID();
  const db = getAdminRealtimeDb();
  try {
    await db.ref(`${RTDB_PATHS.SEED_EVENTS}/${runId}`).set({
      meta: {
        status: RTDBPayloadStatus.PENDING,
        done: 0,
        total: 0,
        startedAt: Date.now(),
        uid: user.uid,
      },
    });
  } catch (rtdbErr) {
    serverLogger.error("RTDB unavailable — seed event node not created", {
      runId,
      rtdbErr,
    });
    return NextResponse.json(
      { success: false, message: "Realtime channel unavailable." },
      { status: 503 },
    );
  }

  const syntheticUid = `seed_event_${runId}`;
  const customToken = await getAdminAuth().createCustomToken(syntheticUid, {
    seedRunId: runId,
  });
  const expiresAt = Date.now() + EVENT_TTL_MS;
  serverLogger.info("Seed event initialised", { runId, uid: user.uid });
  return NextResponse.json({
    success: true,
    data: { runId, customToken, expiresAt },
  });
}
