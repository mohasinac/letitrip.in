"use client";
import { useEffect, useState } from "react";
import { Row, Stack, Text, Toggle } from "@mohasinac/appkit/ui";
const FONT_KEY = "font-style";

export function FontToggleClient() {
  const [cursive, setCursive] = useState(false);

  useEffect(() => {
    setCursive(
      document.documentElement.classList.contains("font-cursive"),
    );
  }, []);

  function toggle(next: boolean) {
    setCursive(next);
    if (next) {
      document.documentElement.classList.add("font-cursive");
      localStorage.setItem(FONT_KEY, "cursive");
    } else {
      document.documentElement.classList.remove("font-cursive");
      localStorage.removeItem(FONT_KEY);
    }
  }

  return (
    <Row surface="default" padding="inline" align="center" justify="between" gap="md" rounded="xl" border="default">
      <Stack gap="xs" className="min-w-0">
        <Text size="sm" weight="medium" color="primary">
          Cursive font
        </Text>
        <Text size="xs" color="muted">
          Switch between Playfair Display and the default sans-serif
        </Text>
      </Stack>
      <Toggle checked={cursive} onChange={toggle} />
    </Row>
  );
}
