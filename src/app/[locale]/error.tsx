"use client";

import { ErrorView } from "@mohasinac/appkit";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: Props) {
  return <ErrorView error={error} reset={reset} />;
}
