/**
 * WHY THIS EXISTS, AND WHY IT IS NOT A SECOND SOURCE OF TRUTH
 *
 * 🛑 This repo runs TWO zod majors. The consumer app declares `zod: ^4.3.6`
 * and resolves 4.4.3; appkit peer-declares `^3.24.0` and ships its own
 * 3.25.76. The two majors spell their generics differently — zod 3's
 * `ZodArray<T, "many">` takes two type parameters and zod 4's `ZodArray<T>`
 * takes one, and `ZodType`'s `Input` sits in a different slot in each. So a
 * zod-3 schema object imported from appkit and embedded in a zod-4
 * `z.object({...})` here cannot be inferred: the field collapses to `unknown`
 * and the route fails with `Type 'unknown' is not assignable to type
 * 'string[] | undefined'`.
 *
 * An explicit `z.ZodType<...>` annotation on the appkit side does not fix it,
 * because the two majors disagree about where `Input` goes — tried, and the
 * four errors survived it.
 *
 * **The cap is still defined exactly once.** `ATTACHED_COUPON_MAX` is a plain
 * number and crosses the package boundary cleanly, so it is imported rather
 * than restated — which was the real hazard the appkit schema's own header
 * names: *"four hand-written `z.array(z.string())`s would be four chances for
 * the cap to drift, and a cap enforced on three of four write paths is not a
 * cap."* There is one cap and one dedupe; only the zod wrapper is per-major.
 *
 * 🛑 FOLLOW-UP, not a TODO to rot: when the two zod majors are aligned (either
 * appkit moves to 4 or the app returns to 3), delete this file and import
 * `attachedCouponIdsSchema` from appkit again at all four routes. The
 * duplication exists solely because of the split and should not outlive it.
 *
 * EXPORTS: attachedCouponIdsSchema
 *
 * @tag domain:promotions
 * @tag layer:schema
 * @tag access:shared
 */

import { z } from "zod";
import { ATTACHED_COUPON_MAX } from "@mohasinac/appkit/features/promotions/constants/attached-coupons";

/**
 * The write shape for any `couponIds`-style field, built with the CONSUMER's
 * zod so the admin routes that embed it can infer through it.
 *
 * Mirrors appkit's `attachedCouponIdsSchema` exactly, minus the dedupe —
 * `dedupeAttachedCouponIds` is a plain function with no zod types in its
 * signature, so it still crosses the boundary and is applied at each route
 * after parsing.
 */
export const attachedCouponIdsSchema = z
  .array(z.string().min(1))
  .max(ATTACHED_COUPON_MAX, `At most ${ATTACHED_COUPON_MAX} coupons can be attached.`)
  .optional();
