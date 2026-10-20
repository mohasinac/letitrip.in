import { withProviders } from "@/providers.config";
import { getProviders } from "@mohasinac/appkit/contracts/registry";
import { z } from "zod";
import { successResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { toQuoteOptions } from "@mohasinac/appkit";
import { serverLogger } from "@mohasinac/appkit/server";

/**
 * Courier options for a delivery pincode.
 *
 * POST /api/shipping/quote — asks the carrier which couriers serve this
 * destination and at what rate, then returns them as the buyer-facing options:
 * each rate rounded UP to the next ₹50, cheapest first.
 *
 * 🛑 The ROUNDING HAPPENS HERE, server-side, and the raw carrier rate never
 * leaves this handler. Rounding on the client would mean the browser decides
 * what the buyer is charged, and the raw figure in the payload would invite
 * "why am I paying ₹100 for a ₹70 courier" — a question whose honest answer
 * (the difference comes back as points if it is not spent) is not something a
 * buyer should have to reconstruct from two numbers on a checkout page.
 *
 * 🛑 Auth required even though a quote mutates nothing. It is an outbound
 * call to a rate-limited third-party API on every request, so an open endpoint
 * is a free way to burn our Shiprocket quota — and the only legitimate caller
 * is a buyer at checkout, who is signed in by definition.
 */

const shippingQuoteSchema = z.object({
  /** Indian PIN code — exactly six digits, first never 0. */
  pincode: z
    .string()
    .trim()
    .regex(/^[1-9][0-9]{5}$/, "Enter a valid 6-digit PIN code"),
  /**
   * Billable weight in kg.
   *
   * Defaulted rather than required: the cart does not reliably carry per-item
   * weights yet, and refusing to quote without one would make the picker
   * unreachable for most carts. 0.5 kg is the carrier's own minimum slab, so
   * it is the honest floor rather than an invented number — a heavier parcel
   * quotes low and the seller absorbs the difference, which is exactly the
   * direction the reconciliation rule already handles.
   */
  weightKg: z.number().positive().max(50).default(0.5),
});

export const POST = withProviders(
  createRouteHandler<(typeof shippingQuoteSchema)["_output"]>({
    auth: true,
    schema: shippingQuoteSchema,
    handler: async ({ body }) => {
      const { pincode, weightKg } = body!;

      /*
       * 🛑 A missing provider and an unserviceable pincode produce the SAME
       * buyer-facing answer and must NOT produce the same operator-facing one.
       *
       * `providers.config.ts` always registers a shipping provider, so this
       * branch is a configuration fault rather than a normal path. Returning
       * `isServiceable: false` keeps checkout working — the picker falls back
       * to standard shipping — but doing only that is Root Cause #88's shape:
       * a fault with no symptom, indistinguishable from a carrier that simply
       * does not serve the address. So it is logged at error level, and the
       * log is the only place the two cases differ.
       */
      const shipping = getProviders().shipping;
      if (!shipping) {
        serverLogger.error("shipping quote requested with no provider registered", {
          pincode,
        });
        return successResponse({ isServiceable: false, options: [] });
      }

      const result = await shipping.checkServiceability(pincode, weightKg);

      /*
       * `isServiceable: false` is a legitimate answer, not an error — the
       * provider fails CLOSED on a carrier outage ("wrong in the safe
       * direction", per its own note), so this path covers both "nowhere
       * serves this pincode" and "we could not reach the carrier". A 200 with
       * an empty list lets the UI say "we could not get rates — pick standard
       * shipping" instead of showing an error page mid-checkout.
       */
      return successResponse({
        isServiceable: result.isServiceable,
        options: toQuoteOptions(result.couriers),
      });
    },
  }),
);
