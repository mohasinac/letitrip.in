"use client";

import { useHandMode, useUpdateProfile, useToast } from "@mohasinac/appkit/client";
import { Row, Stack, Text, Toggle } from "@mohasinac/appkit/ui";

export function HandModeToggleClient() {
  const { hand, setHand } = useHandMode();
  const { showToast } = useToast();
  const update = useUpdateProfile({
  errorMessage: "Failed to save left-hand mode.",
  });

  function toggle(next: boolean) {
    const nextHand = next ? "left" : "right";
    setHand(nextHand);
    update.mutate({ uiPreferences: { handMode: nextHand } });
  }

  return (
    <Row surface="default" padding="inline" align="center" justify="between" gap="md" rounded="xl" border="default">
      <Stack gap="xs" className="min-w-0">
        <Text size="sm" weight="medium" color="primary">
          Left-hand mode
        </Text>
        <Text size="xs" color="muted">
          Move drawers, sidebars, and floating buttons to the left side of the screen
        </Text>
      </Stack>
      <Toggle checked={hand === "left"} onChange={toggle} aria-label="Left-hand mode" />
    </Row>
  );
}
