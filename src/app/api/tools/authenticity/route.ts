import { withProviders } from "@/providers.config";
import { createApiHandler, successResponse } from "@mohasinac/appkit";
import { z } from "zod";
import { assess } from "@/features/authenticity/engine";
import { GENERATIONS } from "@/features/authenticity/data/generations";
import type { GenerationId } from "@/features/authenticity/types";

/**
 * POST /api/tools/authenticity — grade what a buyer can tell us about an item.
 *
 * 🛑 SIGNED-IN ONLY (`auth: true`), and unlike most gates in this codebase the
 * reason is not cost. The engine does zero I/O: the entire knowledge base is
 * bundled static data, so a request costs one invocation and no Firestore reads.
 *
 * The gate is there because of what the OUTPUT is. The response can say "this
 * matches a batch the community records as a midfake", and that sentence read
 * off an anonymous endpoint is a quotable accusation with no account behind it.
 * An account attaches a person to the lookup, keeps it out of scrapers that
 * would republish it as a verdict service, and means a bad outcome is reachable
 * through support. `/tools/price-index` next door is deliberately public,
 * because a day-stale sale aggregate makes no claim about anybody.
 *
 * 🛑 NOT edge-cached, deliberately. The response is per-input and the body is a
 * POST, so there is nothing to share between callers; a cache header here would
 * be decoration. The cost it would otherwise protect does not exist.
 */
/*
 * 🛑 Typed as the union, not `string[]`. With `[string, ...string[]]` the schema
 * parses to `generation?: string`, which does not satisfy `AuthenticityRequest`
 * — and the tempting fix is a cast at the call site, which would let any string
 * through to the engine's `GENERATION_BY_ID[generation]` lookup and index it
 * with a key that does not exist. Derived from GENERATIONS so adding one needs
 * no edit here.
 */
const GENERATION_IDS = GENERATIONS.map((g) => g.id) as [GenerationId, ...GenerationId[]];

const requestSchema = z
  .object({
    /** Model name as typed. Length-capped: it is a product name, not prose. */
    name: z.string().trim().max(120).optional(),
    /** A retail product code (`BB-105`) or a box date code (`A0813`). */
    code: z.string().trim().max(40).optional(),
    /** Answer to the generation question. */
    generation: z.enum(GENERATION_IDS).optional(),
    /** Answer to the "which model" question, a canonical slug. */
    modelSlug: z.string().trim().max(120).optional(),
    /** Random Boosters legitimately carry a code that is not the bey's own. */
    randomBooster: z.boolean().optional(),
    /** The brand printed most prominently on the box. */
    marque: z.string().trim().max(80).optional(),
  })
  /*
   * 🛑 `.strict()`. An unknown key here is a caller believing this endpoint
   * accepts something it does not — a `listingId`, say — and `z.object()` would
   * strip it silently and return a confident assessment of a DIFFERENT, emptier
   * question. That is the shape of Root Cause #76/#98 and it is cheap to refuse.
   */
  .strict();

export const POST = withProviders(
  createApiHandler({
    auth: true,
    schema: requestSchema,
    handler: async ({ body }) => {
      /*
       * Pure, synchronous, no awaits. If this ever needs a Firestore read, stop
       * and reconsider: the no-I/O property is what makes the surface free to
       * run and safe to put behind a gate with no rate-limit story.
       */
      const assessment = assess(body!);
      return successResponse(assessment);
    },
  }),
);
