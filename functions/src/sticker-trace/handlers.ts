/*
 * WHY: The three handlers live in appkit so the pipeline is one implementation,
 *      taking their codec and storage as injected dependencies. This is where
 *      the server's real ones are supplied.
 * WHAT: Dependency wiring plus the two Firestore-event adapters.
 *
 * 🛑 This is the ONLY file in the feature that imports sharp. That is the point
 * of the seam: everything above it runs unchanged in a browser for live tuning,
 * which is also what makes the documented browser-only fallback a swap rather
 * than a rewrite.
 *
 * EXPORTS: stickerTraceCoordinatorHandler, stickerTraceTaskHandler
 *
 * @tag domain:sticker-trace
 * @tag layer:server
 * @tag pattern:none
 * @tag access:server
 * @tag consumers:consumer-functions
 * @tag sideEffects:firestore,storage,rtdb
 */

import {
  runCoordinator,
  runShard,
  runFinalizer,
  readScanBytes,
  readRunGeometry,
  writeRunArtifact,
  rasterisePartToBox,
} from "@mohasinac/appkit/features/sticker-trace/server";
import { sharpCodec } from "./sharp-codec";

/**
 * 🛑 8, and it MUST equal the shard function's maxInstances below.
 *
 * More shards than instances queue rather than run, so a higher number buys no
 * parallelism and costs one task document plus one invocation each. Eight
 * concurrent 1 GiB shards is 8 GB in flight, which also bounds the blast radius
 * if a degenerate scan segments into hundreds of specks.
 */
const MAX_SHARDS = 8;

/** Fired by documentCreated on stickerTraceRuns/{runId}. */
export async function stickerTraceCoordinatorHandler(event: {
  params: { runId: string };
}): Promise<void> {
  await runCoordinator(event.params.runId, {
    codec: sharpCodec,
    readScan: readScanBytes,
    writeArtifact: writeRunArtifact,
    maxShards: MAX_SHARDS,
  });
}

/**
 * Fired by documentCreated on stickerTraceTasks/{taskId}.
 *
 * 🛑 ONE trigger serves both the part shards and the finalizer, dispatching on
 * `kind`. A second trigger on the same collection would wake for every task
 * document and immediately return — the collateral that made onShipmentDeleted
 * burn ~1M invocations a day sitting beside a neighbour's loop (Root Cause
 * #92), and it is a correct guard that still costs the quota.
 */
export async function stickerTraceTaskHandler(event: {
  data?: { data: () => Record<string, unknown> } | undefined;
}): Promise<void> {
  const raw = event.data?.data();
  if (!raw) return;
  const task = raw as unknown as Parameters<typeof runShard>[0];

  if (task.kind === "finalize") {
    /*
     * buildCutSvg is deliberately NOT passed. It belongs to the export suite,
     * and the finalizer treats it as optional: the run succeeds with no
     * cutSvgPath and logs that it had no exporter. Wiring a placeholder here
     * would produce a downloadable cut file that cuts nothing.
     */
    await runFinalizer(task, { writeArtifact: writeRunArtifact });
    return;
  }

  if (task.kind === "part") {
    await runShard(task, {
      codec: sharpCodec,
      readScan: readScanBytes,
      /*
       * Passed straight through. The shard reads the geometry ONCE and derives
       * the working->full scale from it, so there is nothing to bind here —
       * which is what the (path, bbox) contract buys: the rasteriser is a pure
       * function and this wiring stays a one-liner.
       */
      readGeometry: readRunGeometry,
      rasterise: rasterisePartToBox,
      writeArtifact: writeRunArtifact,
    });
    return;
  }

  // Unknown kind is schema drift, not a transient fault. Returning silently
  // would make it indistinguishable from a task that did its work.
  throw new Error(`Unknown sticker trace task kind: ${String(task.kind)}`);
}
