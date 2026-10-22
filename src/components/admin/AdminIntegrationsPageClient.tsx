"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminIntegrationsView } from "@mohasinac/appkit/features/admin/components/AdminIntegrationsView";
import { Text } from "@mohasinac/appkit/client";
import { normalizeError } from "@mohasinac/appkit/errors/normalize";
import type { SiteSettingsDocument } from "@mohasinac/appkit/features/admin/schemas/firestore";
import type { IntegrationSettingsPatch } from "@mohasinac/appkit/client";
import { getAdminSiteSettings, putAdminSiteSettings } from "@/lib/api/admin-client";

/**
 * Fetches the settings document for `<AdminIntegrationsView>` and writes its
 * patches back through the typed admin wrappers.
 *
 * ## 🛑 It REFETCHES after every write, rather than patching local state
 *
 * The whole purpose of this page is to agree with the route guards about
 * whether an integration is on. `readIntegrationStates` is the shared
 * expression both sides resolve through, so the only honest thing to render is
 * what the server actually stored — not what we asked it to store.
 *
 * Merging the patch into local state would be faster and would be the exact
 * failure the model's header records: a row reading "payments off" while the
 * six payment routes are open. If a write half-applies, or another admin is
 * editing the same document, the refetch is what reveals it.
 *
 * ## The write path is deliberately NOT a new endpoint
 *
 * `PUT /api/admin/site` already validates against a `.strict()` schema,
 * already allow-lists every writable group (`payment`, `messaging`,
 * `shipping`, `support` are all in `WRITABLE_SITE_GROUPS`), and already
 * records one `recordAdminAction` per write. A dedicated
 * `/api/admin/integrations` would be a second way to write the same four
 * fields, with its own validation to drift — and `integrationPatch` exists
 * precisely so the caller does ONE write and the audit log gets ONE row.
 *
 * ## Why the fetches live in `/lib/api/`
 *
 * `audit-direct-fetch-ui` blocks a raw `fetch()` in a UI component, and the
 * reason is not style: the wrapper is the one place the URL comes from the
 * registry, the credentials mode is stated, and the error shape is decided.
 * Inlining them here put the endpoint in two files the moment a second caller
 * appeared.
 */
export function AdminIntegrationsPageClient() {
  const [settings, setSettings] = useState<Partial<SiteSettingsDocument> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await getAdminSiteSettings();
      const json = (await res.json().catch(() => ({}))) as {
        data?: Partial<SiteSettingsDocument>;
      };
      if (!res.ok) {
        /*
         * 🛑 `settings` is left as-is rather than blanked. `readIntegrationStates`
         * defaults email and support to ON for a document that predates those
         * fields, so a `null` here would render four rows of confident, wrong
         * state. An error with the last known values beside it is strictly
         * better than a page that looks authoritative and is not.
         */
        setError("Couldn't load the current integration states. The values below may be stale.");
        return;
      }
      setSettings(json.data ?? {});
      setError(null);
    } catch (err) {
      void normalizeError(err);
      setError("Couldn't load the current integration states. The values below may be stale.");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSave = useCallback(
    async (patch: IntegrationSettingsPatch) => {
      const res = await putAdminSiteSettings(patch);
      /*
       * Throws on failure so the view's own catch surfaces a toast and leaves
       * the row showing the server's state. Swallowing it here would make a
       * failed kill-switch look like a successful one.
       */
      if (!res.ok) throw new Error("Save failed");
      await load();
    },
    [load],
  );

  return (
    <>
      {error && (
        <Text size="sm" variant="error" role="alert" className="mb-4">
          {error}
        </Text>
      )}
      <AdminIntegrationsView settings={settings} onSave={handleSave} />
    </>
  );
}
