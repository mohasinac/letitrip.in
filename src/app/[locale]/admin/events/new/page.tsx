import { AdminEventEditorView } from "@mohasinac/appkit";
import type { EventType } from "@mohasinac/appkit";
import { getFlag } from "@/lib/features";

const NON_PRIZE_DRAW_TYPES: EventType[] = ["sale", "offer", "poll", "survey", "feedback"];
const ALL_EVENT_TYPES: EventType[] = [...NON_PRIZE_DRAW_TYPES, "raffle", "spin_wheel"];

export default function Page() {
  const prizeDrawsOn = getFlag("PRIZE_DRAWS");
  return (
    <AdminEventEditorView
      allowedTypes={prizeDrawsOn ? ALL_EVENT_TYPES : NON_PRIZE_DRAW_TYPES}
    />
  );
}
