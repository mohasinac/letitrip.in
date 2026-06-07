import { siteSettingsRepository } from "@mohasinac/appkit";
import { ActionPermissionsManager, Div, Heading, Text } from "@mohasinac/appkit/client";
import { updateActionConfigAction } from "@/actions/admin-settings.actions";

const __P = {
  p6: "p-6",
} as const;

export default async function Page() {
  const settings = await siteSettingsRepository.getSingleton().catch(() => null);
  const initialConfig = (settings?.actionConfig ?? {}) as Record<string, { enabled: boolean }>;

  return (
    <Div className={`${__P.p6} max-w-5xl mx-auto`}>
      <Div className="mb-6">
        <Heading level={1} className="text-2xl font-semibold">Action Permissions</Heading>
        <Text className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
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
