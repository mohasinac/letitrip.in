import { AdminEventEditorView, isListingTypeEnabled, siteSettingsRepository } from "@mohasinac/appkit";
import { ALL_EVENT_TYPES } from "@mohasinac/appkit";
import type { EventType } from "@mohasinac/appkit";

/*
 * Auth-gated dashboard page behind RoleGuard — it needs the session on every
 * request, so there is nothing meaningful to prerender. Static export also
 * throws on any client tree reaching useSearchParams() without a Suspense
 * boundary (Root Cause #17), and static generation runs 15 parallel workers,
 * so WHICH page trips it varies between builds — a latent class rather than
 * one bad page. Dynamic is both the correct semantics and the fix.
 */
export const dynamic = "force-dynamic";


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

export default async function Page() {
  // Was FEATURE_PRIZE_DRAWS. Now the listing-type control an admin can see —
  // the same switch that hides prize draws on every other surface.
  const prizeDrawsOn = isListingTypeEnabled(
    "prize-draw",
    await siteSettingsRepository.getSingleton(),
  );
  return (
    <AdminEventEditorView
      allowedTypes={prizeDrawsOn ? ALL_EVENT_TYPES : NON_PRIZE_DRAW_TYPES}
    />
  );
}
