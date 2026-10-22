"use client";

import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AdminDisputeReasonsView } from "@mohasinac/appkit/features/dispute-reasons/components/AdminDisputeReasonsView";
import { setDisputeReasonActive, createDisputeReason } from "@/lib/api/admin-client";

/**
 * Wires `<AdminDisputeReasonsView>` to its two writes and invalidates the list.
 *
 * ## 🛑 Invalidate, never patch the cached row
 *
 * The view holds no copy of the list — `DataListingView` owns the query — so
 * the only honest way to show a retire is to let the list refetch. Mutating the
 * cached row would be faster and would be the failure this page exists to
 * prevent: a row reading "Retired" while buyers still see it on the dispute
 * form, which is exactly the shape the integrations page's header warns about
 * for a kill switch.
 *
 * ## Why the fetches live in `/lib/api/`
 *
 * `audit-direct-fetch-ui` blocks a raw `fetch()` in a UI component, and the
 * reason is not style: the wrapper is the one place the URL comes from the
 * registry, the credentials mode is stated, and the error shape is decided.
 */
export function AdminDisputeReasonsPageClient() {
  const queryClient = useQueryClient();

  const invalidate = useCallback(
    () => queryClient.invalidateQueries({ queryKey: ["admin", "dispute-reasons"] }),
    [queryClient],
  );

  const onSetActive = useCallback(
    async (id: string, isActive: boolean) => {
      const res = await setDisputeReasonActive(id, isActive);
      /*
       * Throws on failure so the view's own catch surfaces a toast and leaves
       * the row showing the server's state. Swallowing it here would make a
       * failed retire look like a successful one.
       */
      if (!res.ok) throw new Error("Save failed");
      await invalidate();
    },
    [invalidate],
  );

  const onCreate = useCallback(
    async (input: { label: string; kind: string }) => {
      const res = await createDisputeReason(input);
      if (!res.ok) throw new Error("Create failed");
      await invalidate();
    },
    [invalidate],
  );

  return <AdminDisputeReasonsView onSetActive={onSetActive} onCreate={onCreate} />;
}
