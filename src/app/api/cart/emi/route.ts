import { withProviders } from "@/providers.config";
import { z } from "zod";
import { cartRepository } from "@mohasinac/appkit/features/cart/repository/cart.repository";
import { siteSettingsRepository } from "@mohasinac/appkit/features/admin/repository/site-settings.repository";
import { successResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";

/**
 * Cart Instalment Plan API (0f)
 *
 * PUT /api/cart/emi — opt this cart in or out of paying in instalments, with
 * the chosen tenure.
 *
 * ## 🛑 Why the plan lives on the CART and not in a checkout request body
 *
 * EMI was a sixth `paymentMethod` until 2026-10-22, which conflated two
 * independent decisions — *do I want to spread this over months* and *how does
 * the money reach you*. Separating them exposed a problem the conflated model
 * had hidden: the ONLINE path needs the same answer twice, in two different
 * requests. `/api/payment/create-order` decides what the gateway CAPTURES;
 * `/api/payment/verify` writes the order document afterwards. A choice carried
 * in one request body cannot be read by the other, so the captured amount and
 * the recorded order would be free to disagree about how much was deferred —
 * and that difference is money taken that no order accounts for (the
 * D37/D38/D40 class).
 *
 * `useAllPoints` is the precedent, for the same reason and in the same place.
 * The add-ons route states the general rule: a charge's granularity decides
 * where the selection lives.
 *
 * ## What this body carries, and what it must never carry
 *
 * A TENURE, and nothing else. No amount, no surcharge, no token figure — every
 * one of those is derived server-side from `siteSettings.emi` by
 * `computeBuyerEmiQuote`. A money figure in this body would be a
 * client-supplied discount, which is precisely why the deleted
 * `pointsToRedeem` field was a landmine and why the add-on booleans were taken
 * out of the two checkout bodies.
 *
 * ## What it deliberately does NOT do
 *
 * **No eligibility gate.** Whether the cart clears `emi.minOrderValue`, and
 * whether each seller has opted in, is decided where the money is computed —
 * `groupEmiGate`, called by both the preview and the order writer, PER SELLER
 * GROUP. Refusing the toggle here would look safer and be worse: the threshold
 * is per-seller, so a cart spanning two stores has no single answer, and a
 * buyer removing an item would get a 400 on an unrelated change. The real
 * guarantee — that an ineligible group is refused at order time and previews
 * no surcharge — already holds whatever this flag says.
 *
 * The tenure IS validated against the live `emi.tenureOptions`, because that
 * is a closed set the admin configures and a value outside it could never
 * produce a schedule. `tenureMonths: null` clears the plan.
 */
const emiPlanSchema = z.object({
  /** `null` opts out. A number must be one of the live `emi.tenureOptions`. */
  tenureMonths: z.number().int().min(2).max(24).nullable(),
});

export const PUT = withProviders(
  createRouteHandler<(typeof emiPlanSchema)["_output"]>({
    auth: true,
    schema: emiPlanSchema,
    handler: async ({ user, body }) => {
      const tenureMonths = body!.tenureMonths;

      if (tenureMonths === null) {
        await cartRepository.setEmiPlan(user!.uid, null);
        return successResponse({ tenureMonths: null });
      }

      const settings = await siteSettingsRepository.getSingleton();
      const options = settings?.emi?.tenureOptions ?? [];
      /*
       * 🛑 Refused rather than clamped. A clamp would silently sell the buyer a
       * different arrangement from the one they picked, and the tenure is what
       * the whole surcharge scales with.
       */
      if (!options.includes(tenureMonths)) {
        return successResponse(
          { tenureMonths: null, rejected: true, allowed: options },
          `This site offers ${options.length > 0 ? options.join(", ") : "no"} month plans.`,
        );
      }

      await cartRepository.setEmiPlan(user!.uid, { tenureMonths });
      return successResponse({ tenureMonths });
    },
  }),
);
