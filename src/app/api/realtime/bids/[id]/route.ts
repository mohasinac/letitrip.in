import { withFeatureGuard } from "@/lib/features";
import { normalizeError } from "@mohasinac/appkit";
import { initProviders } from "@/providers.config";
import { getAdminRealtimeDb } from "@mohasinac/appkit";

export const dynamic = "force-dynamic";

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
    },
    cancel() {
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

export const GET = withFeatureGuard("AUCTIONS", __GET__g);
