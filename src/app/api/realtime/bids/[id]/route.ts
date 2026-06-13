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
  } catch {
    // Stream already closed — client disconnected
  }
}

// rbac-public: public read endpoint — Firestore rules + payload schema enforce visibility
export async function GET(
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
