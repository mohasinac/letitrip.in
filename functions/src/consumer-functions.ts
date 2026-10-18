/**
 * Consumer-defined Firebase functions.
 *
 * Empty by default. To add a consumer-specific function:
 *   1. Write the pure handler in a sibling file.
 *   2. Wrap it in defineFunction({ name, description, trigger, handler, options? }).
 *   3. Add the result to CONSUMER_FUNCTIONS below.
 *
 * To intentionally shadow an appkit function (e.g. consumer-specific override
 * of `onOrderCreate`), declare `options.overrides: <name>` on the consumer
 * definition referencing the name being shadowed. `mergeFunctionRegistries`
 * throws on any collision without an explicit `overrides` field.
 */

import { defineFunction } from "@mohasinac/appkit/jobs";
import type { FunctionDefinition } from "@mohasinac/appkit/jobs";
import { invoicePdfHandler } from "./invoice-pdf";
import {
  stickerTraceCoordinatorHandler,
  stickerTraceTaskHandler,
} from "./sticker-trace/handlers";

export const CONSUMER_FUNCTIONS: readonly FunctionDefinition[] = [
  defineFunction({
    name: "invoicePdf",
    description: "P-8 GST — Rule-46-compliant order invoice PDF generator.",
    trigger: { kind: "https" },
    handler: invoicePdfHandler,
    options: {
      region: "asia-south1",
      timeoutSeconds: 30,
      memory: "256MiB",
      maxInstances: 10,
      cors: false,
      secretEnvVar: "LETITRIP_INTERNAL_SECRET",
    },
  }),
  defineFunction({
    name: "stickerTraceCoordinator",
    description:
      "Sticker kiss-cut tracer — decode through geometry, then fan the per-part rendering out.",
    trigger: { kind: "documentCreated", pathPattern: "stickerTraceRuns/{runId}" },
    handler: stickerTraceCoordinatorHandler,
    options: {
      region: "asia-south1",
      /*
       * 2 GiB / 540s because this stage cannot be split: a flood fill has no
       * independent pieces, so decode->geometry runs once on a capped working
       * raster (long edge 3000 at `standard`). maxInstances 2 is deliberate —
       * a trace is an admin action, and two concurrent coordinators at 2 GiB is
       * already 4 GB in flight.
       */
      timeoutSeconds: 540,
      memory: "2GiB",
      maxInstances: 2,
    },
  }),
  defineFunction({
    name: "stickerTraceTask",
    description:
      "Sticker kiss-cut tracer — one shard's parts, or the finalizer. Dispatches on task.kind.",
    /*
     * 🛑 documentCreated, NEVER documentWritten. The shards write back into
     * this same collection (the transactional counter lives here), so a write
     * trigger would re-fire on its own writes — Root Cause #92's million
     * invocations a day, whose only symptom was a billing page.
     *
     * 🛑 ONE trigger for BOTH kinds. A second trigger on the same collection
     * wakes for every task document and returns; that is how onShipmentDeleted
     * burned a million invocations beside a neighbour's loop while being
     * correctly guarded itself.
     */
    trigger: { kind: "documentCreated", pathPattern: "stickerTraceTasks/{taskId}" },
    handler: stickerTraceTaskHandler,
    options: {
      region: "asia-south1",
      timeoutSeconds: 300,
      memory: "1GiB",
      // 🛑 MUST equal MAX_SHARDS in ./sticker-trace/handlers.ts.
      maxInstances: 8,
    },
  }),
] as unknown as readonly FunctionDefinition[];
