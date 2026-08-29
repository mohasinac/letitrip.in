import { normalizeError } from "@mohasinac/appkit";
import { initProviders, withProviders } from "@/providers.config";
import { getAdminRealtimeDb } from "@mohasinac/appkit";

export const dynamic = "force-dynamic";

/**
 * Close the stream ourselves before the platform kills it.
 *
 * 🛑 This route had no maxDuration. The listener is attached in
 * `ReadableStream.start` and detached only in `cancel()`, which fires on a
 * client abort but NOT when the serverless instance is frozen or reclaimed. So
 * the platform would kill the stream, the browser's EventSource would
 * auto-reconnect, and each reconnect attached a fresh RTDB listener on a fresh
 * Admin connection — a reconnect loop on any busy auction page, costing both
 * Vercel invocations and RTDB connections.
 *
 * Ending the stream deliberately at a known point means `cancel()` runs, the
 * listener is detached, and the client reconnects on a schedule we chose rather
 * than whenever the platform happens to reap us. Comfortably inside the 60s
 * background ceiling in Rule #6.
 */
export const maxDuration = 50;
const STREAM_TTL_MS = 45_000;

function sseChunk(type: string, data?: unknown): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify({ type, data })}\n\n`);
}

/**
 * Enqueue an SSE chunk into the stream controller, ignoring errors that occur
 * when the stream is already closed (client disconnected).
 */
function tryEnqueue(controller: ReadableStreamDefaultController, type: string, data?: unknown): void {
  try {
    controller.enqueue(sseChunk(type, data));
  } catch (_err) {
    void normalizeError(_err); // Stream already closed — client disconnected before this chunk was sent
  }
}

async function __GET__g(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  await initProviders();

  const { id: productId } = await params;
  const rtdb = getAdminRealtimeDb();
  const ref = rtdb.ref(`/auction-bids/${productId}`);

  let valueListener: ((snap: any) => void) | null = null;
  let ttlTimer: ReturnType<typeof setTimeout> | null = null;

  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(sseChunk("connected"));

      valueListener = (snapshot: any) => {
        const data = snapshot.val();
        if (data) {
          tryEnqueue(controller, "update", data);
        }
      };

      ref.on("value", valueListener, () => {
        tryEnqueue(controller, "error");
      });

      // Self-terminate before the platform does, so the teardown below always
      // runs. EventSource reconnects on its own.
      ttlTimer = setTimeout(() => {
        if (valueListener) {
          ref.off("value", valueListener);
          valueListener = null;
        }
        try {
          controller.close();
        } catch (_err) {
          void normalizeError(_err); // already closed — client disconnected first
        }
      }, STREAM_TTL_MS);
    },
    cancel() {
      if (ttlTimer) {
        clearTimeout(ttlTimer);
        ttlTimer = null;
      }
      if (valueListener) {
        ref.off("value", valueListener);
        valueListener = null;
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

/*
 * Public by design: bid history is public on every auction page, and this only
 * relays the same values live.
 *
 * It used to be exported as `withFeatureGuard("AUCTIONS", __GET__g)`. That was
 * never an auth gate — it 404'd when the auctions flag was off — but it did
 * satisfy audit-route-rbac's wrapper allowlist, which is how a route with no
 * handler factory at all passed a strict-zero RBAC audit. With the flag systems
 * deleted, the audit correctly flagged it.
 *
 * `withProviders` is the honest wrapper: the handler already calls
 * `initProviders()` by hand below, so this is the canonical form of what it was
 * doing anyway.
 */
export const GET = withProviders(__GET__g);
