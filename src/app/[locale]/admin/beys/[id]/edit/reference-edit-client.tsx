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
import { ROUTES } from "@mohasinac/appkit";

const FIELDS = [
  { name: "name", label: "Name" },
  { name: "type", label: "Type", hint: "Attack, Defense, Stamina, Balance." },
  { name: "spinDirection", label: "Spin direction" },
  { name: "system", label: "System", hint: "Hybrid Wheel System, Burst Ultimate, Basic Line…" },
  { name: "series", label: "Series" },
  /*
   * 🛑 The STATED mass only. The summed figure beside it is derived from the
   * composition and carries its own coverage record, so hand-typing it would
   * leave a number whose stated provenance is no longer true.
   */
  { name: "weightG", label: "Mass (g), as the source states it", kind: "number" as const },
  { name: "jpName", label: "Japanese name" },
  { name: "romaji", label: "Romaji" },
  { name: "seoDescription", label: "Description" },
  { name: "sourceUrl", label: "Source URL", hint: "The article this row's facts came from." },
] as const;

export function ReferenceEditClient({ id }: { id: string }) {
  return (
    <ReferenceRecordEditor
      endpoint={ADMIN_ENDPOINTS.BEY_BY_ID(id)}
      noun="Beyblade"
      fields={FIELDS}
      publicHref={String(ROUTES.PUBLIC.BEY_DETAIL(id))}
    />
  );
}
