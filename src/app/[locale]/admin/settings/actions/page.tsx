import { siteSettingsRepository } from "@mohasinac/appkit";
import { ActionPermissionsManager, Div, Heading, Text } from "@mohasinac/appkit/client";
import { updateActionConfigAction } from "@/actions/admin-settings.actions";

const __P = {
  p6: "p-[var(--appkit-space-6)]",
} as const;

export default async function Page() {
  const settings = await siteSettingsRepository.getSingleton().catch(() => null);
  const initialConfig = (settings?.actionConfig ?? {}) as Record<string, { enabled: boolean }>;

  return (
    <Div className={`${__P.p6} max-w-5xl mx-auto`}>
      <Div className="mb-6">
        <Heading level={1} weight="semibold" size="2xl">Action Permissions</Heading>
        <Text className="mt-1" color="muted" size="sm">
          Enable or disable individual platform actions. Changes take effect immediately for all users.
        </Text>
      </Div>
      <ActionPermissionsManager
        initialConfig={initialConfig}
        onUpdate={updateActionConfigAction}
      />
    </Div>
  );
}
