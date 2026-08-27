import { withFeatureGuard } from "@/lib/features";
import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  eventRepository,
  adminGetEventById,
  lotteryConfigWriteSchema,
  mergeLotteryConfig,
} from "@mohasinac/appkit";
import { ROLES_ADMIN_ONLY } from "@/constants";

/**
 * The ONLY way to write `lotteryConfig`.
 *
 * ## Why it is not the generic event PATCH
 *
 * `PATCH /api/admin/events/[id]` is `.passthrough()`, which is deliberate for
 * an event's open-ended fields — and catastrophic for this one. The authoring
 * UI sends a slot array built from form state, with no booking fields on it,
 * so passing that through writes `isBooked: false` over every slot a buyer has
 * already pulled. The buyers are then gone from the record with no error, no
 * log, and a page that renders perfectly.
 *
 * That is why `lotteryConfig` is now rejected there (see the sibling route)
 * and why this endpoint exists: it is the one place that has both halves —
 * the admin's intent AND the stored bookings — so it is the only place a
 * correct merge can happen. A validated-but-still-whole-config write on the
 * generic route would not have fixed anything.
 *
 * ## Two failure kinds, two status codes
 *
 * A malformed config is a 400. Removing a slot somebody has already pulled is
 * a **409** — the request is well-formed and the admin is not confused, the
 * world just changed under them. Conflating the two would read as "your form
 * is wrong" when the correct action is to reopen the pull first.
 */
const __PUT__g = withProviders(
  createRouteHandler<(typeof lotteryConfigWriteSchema)["_output"]>({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:events:write",
    schema: lotteryConfigWriteSchema,
    handler: async ({ params, body }) => {
      const id = (params as { id: string }).id;

      /*
       * `adminGetEventById`, NOT `getLotteryEventCached`. The latter runs
       * `toClientLotteryConfig`, an allow-list that strips `price` and
       * `weight` from every slot — so merging against it would silently
       * rewrite every slot's price to 0 while looking like it worked.
       */
      const event = await adminGetEventById(id);
      if (!event) return errorResponse("Event not found", 404);
      if (event.type !== "lottery") {
        return errorResponse("This event is not a lottery", 400);
      }

      const merged = mergeLotteryConfig(body!, event.lotteryConfig);
      if (!merged.ok) {
        return errorResponse(merged.message, 409, { code: merged.code });
      }

      await eventRepository.update(id, { lotteryConfig: merged.config });
      return successResponse({ lotteryConfig: merged.config }, "Lottery updated");
    },
  }),
);

/*
 * Guarded like every sibling under `admin/events` — a lottery IS an event, so
 * turning the EVENTS flag off must close this door too. Without it the generic
 * event routes 404 while the one route that writes lotteryConfig stayed open.
 */
export const PUT = withFeatureGuard("EVENTS", __PUT__g);
