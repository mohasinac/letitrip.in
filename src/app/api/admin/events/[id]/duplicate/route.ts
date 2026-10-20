import { withProviders } from "@/providers.config";
import { eventRepository } from "@mohasinac/appkit/features/events/repository/events.repository";
import { successResponse, errorResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import type { EventDocument } from "@mohasinac/appkit/features/events/schemas/firestore";
import { ROLES_ADMIN_ONLY } from "@/constants";

/**
 * POST /api/admin/events/[id]/duplicate — clone an event as a fresh draft.
 *
 * The real use case is a recurring sale: same copy, same prizes, new dates.
 *
 * 🛑 THE LOTTERY SLOTS ARE THE DANGEROUS PART, and the reason this endpoint is
 * worth reading before changing. `LotterySlot` carries `isBooked`,
 * `bookedByUserId`, `bookedByDisplayName` and `bookedByUserLotteryNumber` — so
 * a naive spread of `lotteryConfig` would attribute a REAL buyer's purchased
 * slot to a brand-new event. Two people would then appear to hold the same
 * pull, and the clone would show slots as unavailable that nobody has bought.
 *
 * This is Root Cause #76's exact class: an authoring path that can EXPRESS
 * booking state it does not own. There the fix was to make the write shape
 * unable to name those fields; here the fix is to rebuild every slot from its
 * prize definition only (`slotNumber`, `name`, `image`, `price`) and reset the
 * booking half. See § "Lottery Config Writes" in CLAUDE.md.
 *
 * 🛑 `weight` is recomputed server-side from `price`, never copied, for the
 * same reason the write schema refuses it as client input.
 *
 * @tag domain:events
 * @tag layer:route
 * @tag access:admin
 */

const ERR_NOT_FOUND = "Event not found";

export const POST = withProviders(
  createRouteHandler({
    auth: true,
    roles: ROLES_ADMIN_ONLY,
    permission: "events:write",
    handler: async ({ params, user }) => {
      const id = (params as { id: string }).id;
      const event = await eventRepository.findById(id);
      if (!event) return errorResponse(ERR_NOT_FOUND, 404);

      /*
       * Identity, counters, and every record of the source's own run.
       *
       * The raffle/spin outcome fields are stripped because they are FACTS
       * ABOUT THE SOURCE EVENT: a winner, the moment it was drawn, and how many
       * entered. A clone that inherited them would announce a winner for a
       * draw that has not happened — and `raffleWinnerDisplayName` would publish
       * a real person's name on an event they never entered.
       */
      const {
        id: _id,
        slug: _slug,
        createdAt: _createdAt,
        updatedAt: _updatedAt,
        stats: _stats,
        raffleWinnerUserId: _rwu,
        raffleWinnerDisplayName: _rwd,
        raffleWinnerEntryId: _rwe,
        raffleTriggeredAt: _rta,
        raffleEntryCount: _rec,
        lotteryConfig: sourceLottery,
        ...clonable
      }: EventDocument = event;

      /*
       * Rebuilt from the PRIZE definition only — never spread. A spread would
       * carry `isBooked` and the three `bookedBy*` fields; listing them in the
       * destructure above would work today and silently stop working the moment
       * a field is added to `LotterySlot`, which is how a schema grows a leak.
       * Naming what to KEEP fails closed instead.
       */
      const lotteryConfig = sourceLottery
        ? {
            ...sourceLottery,
            slots: sourceLottery.slots.map((slot) => ({
              slotNumber: slot.slotNumber,
              name: slot.name,
              ...(slot.image ? { image: slot.image } : {}),
              price: slot.price,
              weight: slot.weight,
              isBooked: false,
            })),
          }
        : undefined;

      const created = await eventRepository.createEvent({
        ...clonable,
        title: `${event.title} (Copy)`,
        status: "draft",
        createdBy: user!.uid,
        ...(lotteryConfig ? { lotteryConfig } : {}),
      });

      return successResponse({ id: created.id });
    },
  }),
);
