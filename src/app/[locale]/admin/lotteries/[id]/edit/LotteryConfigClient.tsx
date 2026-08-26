"use client";

import { useRouter } from "@/i18n/navigation";
import {
  LotteryAdminEditView,
  ROUTES,
  useToast,
  type LotteryConfigWriteInput,
} from "@mohasinac/appkit/client";
import { ADMIN_ENDPOINTS } from "@mohasinac/appkit/client";

interface Props {
  eventId: string;
  initialData: React.ComponentProps<typeof LotteryAdminEditView>["initialData"];
}

/**
 * Slot configuration for one lottery event.
 *
 * ## 🛑 Why this posts to a dedicated route
 *
 * `PATCH /api/admin/events/[id]` is `.passthrough()`. Sending `lotteryConfig`
 * through it wrote the form's slot array verbatim — and the form has no
 * booking fields, so every slot a buyer had already pulled came back marked
 * available, with a 200 and no trace of the buyer. That is why the editor was
 * left unwired for so long rather than being connected to the obvious route:
 * connecting it was the bug.
 *
 * `PUT .../lottery-config` merges by `slotNumber` against the stored config,
 * so a booked slot keeps its buyer through any edit, and removing one is a
 * 409 rather than a silent erasure.
 *
 * A 409 is surfaced verbatim — it names the slot numbers, and the admin's
 * next action (reopen the pull) is different from the one a validation error
 * would call for.
 */
export function LotteryConfigClient({ eventId, initialData }: Props) {
  const router = useRouter();
  const { showToast } = useToast();

  return (
    <LotteryAdminEditView
      eventId={eventId}
      initialData={initialData}
      onSubmit={async (data: { lotteryConfig: LotteryConfigWriteInput }) => {
        const res = await fetch(ADMIN_ENDPOINTS.EVENT_LOTTERY_CONFIG(eventId), {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data.lotteryConfig),
        });
        const payload = (await res.json().catch(() => null)) as
          | { error?: string; message?: string }
          | null;

        if (!res.ok) {
          // Thrown, not toasted-and-swallowed: the editor's own catch renders
          // it inline, and a failed save must not look like a successful one.
          throw new Error(
            payload?.error ?? payload?.message ?? "Could not save the lottery.",
          );
        }

        showToast("Lottery updated.", "success");
        router.push(String(ROUTES.ADMIN.LOTTERIES));
      }}
    />
  );
}
