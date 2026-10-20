"use client";

import { ReferenceRecordEditor } from "@mohasinac/appkit/features/admin/components/ReferenceRecordEditor";
import { ADMIN_ENDPOINTS } from "@mohasinac/appkit/constants/api-endpoints";

const FIELDS = [
  { name: "name", label: "Name" },
  { name: "classification", label: "Classification", hint: "Attack Ring, Fusion Wheel, Driver…" },
  { name: "code", label: "Code", hint: "The short code a collector types — RF, 105, 1-60." },
  { name: "weightG", label: "Weight (g)", kind: "number" as const },
  { name: "role", label: "Role" },
  { name: "jpName", label: "Japanese name" },
  { name: "seoDescription", label: "Description" },
  { name: "sourceUrl", label: "Source URL", hint: "The article this row's facts came from." },
] as const;

/*
 * 🛑 No `publicHref`. A part's reference page is keyed on
 * `/parts/{classification}/{code}`, which is TWO segments derived from the
 * document id — and the id's own halves are the slot and the code, not the
 * URL's classification segment. Building that link needs
 * `partSlotToSegment`, and getting it wrong sends an operator checking their
 * work to a 404. Left out rather than guessed.
 */
export function ReferenceEditClient({ id }: { id: string }) {
  return (
    <ReferenceRecordEditor
      endpoint={ADMIN_ENDPOINTS.PART_BY_ID(id)}
      noun="part"
      fields={FIELDS}
    />
  );
}
