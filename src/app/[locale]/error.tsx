"use client";

import type { ErrorInfo } from "react";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage(_: Props) {
  return null;
}