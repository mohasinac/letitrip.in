import { AdminEventEditorView } from "@mohasinac/appkit";
import type { EventType } from "@mohasinac/appkit";
import { getFlag } from "@/lib/features";

const PRIZE_TYPES: EventType[] = ["raffle", "spin_wheel"];
const ALL_TYPES: EventType[] = ["sale", "offer", "poll", "survey", "feedback", "raffle", "spin_wheel"];

export default async function Page() {
  const prizeDrawsOn = getFlag("PRIZE_DRAWS");
  const allowedTypes = prizeDrawsOn ? ALL_TYPES : ALL_TYPES.filter((t) => !PRIZE_TYPES.includes(t));
  return <AdminEventEditorView allowedTypes={allowedTypes} />;
}
