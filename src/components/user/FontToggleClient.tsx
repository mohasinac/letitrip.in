"use client";
import { useEffect, useState } from "react";
import { Div, Row, Stack, Text, Toggle } from "@mohasinac/appkit/ui";
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
    <Row className="dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3" align="center" justify="between" gap="md" rounded="xl" border="default">
      <Stack gap="xs" className="min-w-0">
        <Text className="text-zinc-800 dark:text-zinc-100" size="sm" weight="medium">
          Cursive font
        </Text>
        <Text className="text-zinc-500 dark:text-zinc-400" size="xs">
          Switch between Playfair Display and the default sans-serif
        </Text>
      </Stack>
      <Toggle checked={cursive} onChange={toggle} />
    </Row>
  );
}
