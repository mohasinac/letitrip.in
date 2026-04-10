/**
 * GET /api/realtime/bids/[id]
 *
 * Server-Sent Events (SSE) stream for live auction bid updates.
 * Replaces the direct Firebase Realtime Database client SDK subscription
 * so the Firebase client bundle is not required for bid updates.
 *
 * The path `/auction-bids/{productId}` is publicly readable — no auth required.
 * Each event has the shape: data: {"type":"update","data":{...}}
 *
 * The client should use EventSource and fall back to polling if SSE is unsupported.
 */

import { type NextRequest } from "next/server";
import type { DataSnapshot } from "firebase-admin/database";
import { getAdminRealtimeDb } from "@/lib/firebase/admin";
import { serverLogger } from "@/lib/server-logger";

// Use Node.js runtime — Firebase Admin SDK requires Node.js builtins.
export const runtime = "nodejs";

// Allow the response to stream indefinitely (overrides Vercel's 60 s default).
export const maxDuration = 300; // 5 minutes

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: productId } = await params;

  if (!productId) {
    return new Response("Missing productId", { status: 400 });
  }

  const db = getAdminRealtimeDb();
  const bidRef = db.ref(`/auction-bids/${productId}`);

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const enqueue = (payload: unknown) => {
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(payload)}\n\n`),
          );
        } catch {
          // Controller may already be closed — ignore.
        }
      };

      // Immediately send a "connected" heartbeat so the client knows the stream is live.
      enqueue({ type: "connected", productId });

      // Subscribe to RTDB using the Admin SDK.
      // Note: firebase-admin's ref.on() returns the callback itself (not an unsubscriber).
      const listener = bidRef.on(
        "value",
        (snapshot: DataSnapshot) => {
          enqueue({
            type: "update",
            data: snapshot.exists() ? snapshot.val() : null,
          });
        },
        (error: Error) => {
          serverLogger.warn("[SSE bids] RTDB subscription error", {
            productId,
            error: error.message,
          });
          enqueue({ type: "error", message: "Realtime connection lost" });
          try {
            controller.close();
          } catch {
            // already closed
          }
        },
      );

      // Periodic heartbeat comment (keeps proxies alive, detects dead connections).
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": ping\n\n"));
        } catch {
          clearInterval(heartbeat);
        }
      }, 25_000);

      // Clean up on client disconnect (request abort).
      request.signal.addEventListener("abort", () => {
        bidRef.off("value", listener);
        clearInterval(heartbeat);
        try {
          controller.close();
        } catch {
          // already closed
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // Disable nginx buffering for Vercel reverse proxy
    },
  });
}
