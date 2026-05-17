"use client";
import { useEffect, useState } from "react";
import { Text, Div, Stack, Toggle } from "@mohasinac/appkit/ui";

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
    <Div className="flex items-center justify-between gap-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3">
      <Stack gap="xs" className="min-w-0">
        <Text className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
          Cursive font
        </Text>
        <Text className="text-xs text-zinc-500 dark:text-zinc-400">
          Switch between Playfair Display and the default sans-serif
        </Text>
      </Stack>
      <Toggle checked={cursive} onChange={toggle} />
    </Div>
  );
}
