/*
 * 🛑 NO "use client", and that is deliberate.
 *
 * This file declares a field list and renders one component. It calls no hook
 * and touches no browser global, so the directive bought nothing —
 * `audit-unnecessary-use-client` is right to flag it. A Server Component can
 * render a Client Component (`ReferenceRecordEditor` carries its own
 * directive); what it must not do is CALL a runtime value imported from the
 * "use client" entry, which is why `ROUTES` below comes from the bare package.
 */
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
