import { withProviders } from "@/providers.config";
import { createApiHandler, successResponse } from "@mohasinac/appkit";
import { z } from "zod";
import { assess } from "@/features/authenticity/engine";
import { GENERATIONS } from "@/features/authenticity/data/generations";
import type { GenerationId } from "@/features/authenticity/types";

/**
 * POST /api/tools/authenticity — grade what a buyer can tell us about an item.
 *
 * 🛑 PUBLIC by decision — `createApiHandler` with no `auth`, no `roles` and no
 * `permission`, which `audit-route-rbac` recognises as exactly that ("omitting
 * = public endpoint"). No `rbac-public:` marker: that escape hatch was removed
 * from the codebase, and `audit-no-suppression-comments` is strict-zero on it.
 *
 * It used to require an account, and the argument was not about cost — the
 * engine does zero I/O, so a request costs one invocation and no Firestore
 * reads. The argument was that the response can say "this matches a batch the
 * community records as a midfake", and that an account keeps that sentence
 * attached to a person. What it did in practice was ask a buyer standing in a
 * shop with the box in their hand to go and register first, which is the exact
 * moment this surface exists for, and the person most in need of it is the one
 * least likely to have an account.
 *
 * What makes it safe to open is the SHAPE OF THE OUTPUT, which was already
 * built for this: the engine has no "counterfeit" rung, its most severe verdict
 * is `likely-reproduction`, and every claim it can make is about a production
 * batch or a named brand rather than about a seller. A code the sources
 * disagree about is reported as a disagreement. There is no sentence here that
 * is safe for an account holder to read and unsafe for anyone else.
 *
 * 🛑 NOT edge-cached, deliberately. The response is per-input and the body is a
 * POST, so there is nothing to share between callers; a cache header here would
 * be decoration. The cost it would otherwise protect does not exist — and that
 * is also why opening it needs no rate-limit story: a bounded pure-CPU pass
 * over bundled arrays, with every input length-capped by the schema below.
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
