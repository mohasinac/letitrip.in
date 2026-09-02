import { siteSettingsRepository } from "@mohasinac/appkit";
import { ActionPermissionsManager, Div, Heading, Text } from "@mohasinac/appkit/client";
import { PageTabs, ADMIN_SETTINGS_TABS } from "@mohasinac/appkit/client";
import { updateActionConfigAction } from "@/actions/admin-settings.actions";
import { NavPermissionsPanel } from "@/components/admin/NavPermissionsPanel";

const __P = {
  p6: "p-[var(--appkit-space-6)]",
} as const;

export default async function Page() {
  // NOT swallowed: this seeds an EDITOR. A failed read used to fall through to
  // `{}` — every action shown at its default — and the next Save would write
  // that back over the admin's real config (Root Cause #38).
  const settings = await siteSettingsRepository.getSingleton();
  const initialConfig = (settings?.actionConfig ?? {}) as Record<string, { enabled: boolean }>;

  /*
   * Both panels write into the same `siteSettings` singleton and share
   * `admin:settings:write`, which is what made them mergeable — merging across
   * a permission line would silently widen or narrow access, since one page
   * carries one `requiredPermission`.
   *
   * The nav panel is awaited here: it does its own settings read, and a Server
   * Component cannot hand a fetch to the client tab strip.
   */
  const navPanel = await NavPermissionsPanel();
  return (
    <Div className={`${__P.p6} max-w-5xl mx-auto`}>
      <PageTabs
        tabs={ADMIN_SETTINGS_TABS}
        panels={{
          actions: (
            <Div>
              <Div className="mb-6">
                <Heading level={2} weight="semibold" size="xl">Action Permissions</Heading>
                <Text className="mt-1" color="muted" size="sm">
                  Enable or disable individual platform actions. Changes take effect immediately for all users.
                </Text>
              </Div>
              <ActionPermissionsManager
                initialConfig={initialConfig}
                onUpdate={updateActionConfigAction}
              />
            </Div>
          ),
          navigation: navPanel,
        }}
      />
    </Div>
  );
}
