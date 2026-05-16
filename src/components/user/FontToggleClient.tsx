"use client";
import { useEffect, useState } from "react";
import { Text, Div, Button, Span } from "@mohasinac/appkit/ui";

const FONT_KEY = "font-style";

export function FontToggleClient() {
  const [cursive, setCursive] = useState(false);

  useEffect(() => {
    setCursive(
      document.documentElement.classList.contains("font-cursive"),
    );
  }, []);

  function toggle() {
    const next = !cursive;
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
    <Div className="flex items-center justify-between rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3">
      <>
        <Text className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
          Cursive font
        </Text>
        <Text className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
          Switch between Playfair Display and the default sans-serif
        </Text>
      </>
      <Button
        type="button"
        role="switch"
        aria-checked={cursive}
        onClick={toggle}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ${
          cursive
            ? "bg-primary-500"
            : "bg-zinc-300 dark:bg-zinc-600"
        }`}
      >
        <Span
          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform duration-200 ${
            cursive ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </Button>
    </Div>
  );
}
