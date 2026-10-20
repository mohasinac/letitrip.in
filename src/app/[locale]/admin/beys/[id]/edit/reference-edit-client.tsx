"use client";

import { ReferenceRecordEditor } from "@mohasinac/appkit/features/admin/components/ReferenceRecordEditor";
import { ADMIN_ENDPOINTS } from "@mohasinac/appkit/constants/api-endpoints";
/*
 * 🛑 From "/client", NOT the bare entry. This file is "use client", so a
 * bare `@mohasinac/appkit` import pulls the SERVER graph — and
 * firebase-admin's static top-level import — into the client bundle, which
 * Turbopack follows all the way to a child_process/fs chunk and a failed
 * build (Root Cause #6).
 *
 * 🛑 This is the exact OPPOSITE of the rule for a server component, where a
 * runtime value off the client entry becomes a client-reference proxy and
 * throws React #441 (Root Cause #76). The two audits pull against each
 * other and the discriminator is simply whether the file is a client
 * component. This one is.
 */
import { ROUTES } from "@mohasinac/appkit/client";

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
