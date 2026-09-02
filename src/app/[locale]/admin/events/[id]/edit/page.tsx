import { AdminEventEditorView, isListingTypeEnabled, siteSettingsRepository } from "@mohasinac/appkit";
import { ALL_EVENT_TYPES } from "@mohasinac/appkit";
import type { EventType } from "@mohasinac/appkit";

const NON_PRIZE_DRAW_TYPES: EventType[] = ["sale", "offer", "poll", "survey", "feedback"];
/*
 * Was a local copy: `[...NON_PRIZE_DRAW_TYPES, "raffle", "spin_wheel"]` —
 * missing `lottery`, so Lottery never appeared in the type picker even once
 * the editor could render it. Now the canonical array, which is derived from
 * a `Record<EventType, true>` and cannot silently fall short.
 *
 * NON_PRIZE_DRAW_TYPES stays a literal on purpose: it is a deliberate SUBSET
 * gated on a feature flag, not an enumeration of the union, so it must not
 * grow automatically when a type is added.
 */

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // Was FEATURE_PRIZE_DRAWS. Now the listing-type control an admin can see —
  // the same switch that hides prize draws on every other surface.
  const prizeDrawsOn = isListingTypeEnabled(
    "prize-draw",
    await siteSettingsRepository.getSingleton(),
  );
  return (
    <AdminEventEditorView
      eventId={id}
      allowedTypes={prizeDrawsOn ? ALL_EVENT_TYPES : NON_PRIZE_DRAW_TYPES}
    />
  );
}
