import { initProviders } from "@/providers.config";
import { getAdminRealtimeDb } from "@mohasinac/appkit";

export const dynamic = "force-dynamic";

function sseChunk(type: string, data?: unknown): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify({ type, data })}\n\n`);
}

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
          try {
            controller.enqueue(sseChunk("update", data));
          } catch {
            // Stream already closed
          }
        }
      };

      ref.on("value", valueListener, () => {
        try {
          controller.enqueue(sseChunk("error"));
        } catch {
          // Stream already closed
        }
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
