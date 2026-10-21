import type { Metadata } from "next";
import ObligationsClient from "./ObligationsClient";

/*
 * Server page, client child — a `"use client"` module cannot export `metadata`.
 */
export const metadata: Metadata = {
  title: "Obligations",
  description:
    "Every deadline in the order lifecycle: what is overdue and what falls due this week.",
};

export default function Page() {
  return <ObligationsClient />;
}
