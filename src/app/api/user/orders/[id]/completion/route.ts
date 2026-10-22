import { withProviders } from "@/providers.config";
/**
 * Buyer order completion — rate the lines, then close the order.
 *
 * `GET`  — which lines may be rated, and which already are.
 * `POST` — `{ action: "rate", … }` or `{ action: "complete" }`.
 *
 * ## One route for three operations, deliberately
 *
 * They are one flow with one precondition (you own this delivered order) and
 * the buyer moves through them in one sitting: see the lines, rate one, press
 * complete. Three sibling route folders would triple the auth boilerplate for
 * a sequence the UI never splits.
 *
 * The discriminator is in the BODY rather than the path because `complete`
 * carries no fields at all — `/complete` as its own endpoint would be a folder
 * containing a handler whose entire job is to call one action with the order id
 * the path already has.
 *
 * ## 🛑 Every real check is in the actions, not here
 *
 * `rateOrderItemAction` and `markOrderCompleteAction` own ownership, delivery,
 * the already-complete conflict, the at-least-one-rating rule, and the
 * nothing-contested gate — and that last one mirrors the `order-complete`
 * obligation policy's own `precondition`, so the buyer's fast path and the
 * 7-day sweep cannot disagree about what "contested" means.
 *
 * Re-implementing any of it here would be a second copy of a rule that decides
 * when a dispute window closes (Root Cause #75), and the copy that drifts is
 * always the one somebody added later. This route validates SHAPE and nothing
 * else.
 */
import {
  getRateableItemsAction,
  rateOrderItemAction,
  markOrderCompleteAction,
} from "@mohasinac/appkit/server";
import { successResponse, errorResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { z } from "zod";

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      const result = await getRateableItemsAction(id);
      /*
       * 🛑 UNWRAP. These are `"use server"` actions returning `ActionResult<T>`,
       * which is ALWAYS truthy — `if (!result)` can never fire and
       * `result.items` is silently `undefined` (Root Cause #98, which cost nine
       * seller pages a blank form and a destructive save).
       */
      if (!result.ok) {
        return errorResponse(result.error ?? "Could not load this order's items", 400);
      }
      return successResponse({ items: result.data });
    },
  }),
);

/*
 * A discriminated union, so `rate` cannot be sent without a rating and
 * `complete` cannot smuggle one. `.strict()` on both members.
 *
 * `comment` has a floor because a one-word review helps nobody — the next
 * buyer reads these, and "good" is indistinguishable from an empty box. The
 * action enforces its own; this is the friendly copy of it.
 */
const completionSchema = z.discriminatedUnion("action", [
  z
    .object({
      action: z.literal("rate"),
      orderItemId: z.string().min(1).max(300),
      rating: z.number().int().min(1).max(5),
      comment: z.string().min(10, "Tell the next buyer a little more than that.").max(2000),
      title: z.string().max(200).optional(),
      // 🛑 Stays a literal until the next appkit publish. `REVIEW_MAX_IMAGES`
      // exists in appkit source but NOT in the published 4.61.0 tarball, and
      // this repo pins the registry — so importing it here makes `tsc` fail on
      // `main` for every other session until someone publishes. Swap it in with
      // the pin bump, not before.
      images: z.array(z.string().max(500)).max(6).optional(),
    })
    .strict(),
  z.object({ action: z.literal("complete") }).strict(),
]);

export const POST = withProviders(
  createRouteHandler<z.infer<typeof completionSchema>>({
    auth: true,
    schema: completionSchema,
    handler: async ({ body, params }) => {
      const id = (params as { id: string }).id;

      if (body!.action === "complete") {
        const result = await markOrderCompleteAction(id);
        if (!result.ok) {
          /*
           * 400 rather than 409 even for the already-complete case: the action
           * throws a ConflictError there, but `wrapAction` flattens everything
           * into `{ ok: false, error }` and the status is lost. Distinguishing
           * them would mean parsing the message, which is exactly the
           * server-text coupling `toUserMessage` exists to avoid.
           */
          return errorResponse(result.error ?? "Could not complete this order", 400);
        }
        return successResponse(result.data);
      }

      const { orderItemId, rating, comment, title, images } = body!;
      const result = await rateOrderItemAction({
        orderId: id,
        orderItemId,
        rating,
        comment,
        ...(title ? { title } : {}),
        ...(images?.length ? { images } : {}),
      });
      if (!result.ok) {
        return errorResponse(result.error ?? "Could not save that rating", 400);
      }
      return successResponse(result.data);
    },
  }),
);
