import type { Metadata } from "next";
import ProtectionClaimsClient from "./ProtectionClaimsClient";

/*
 * Server page, client child — so the route can carry `metadata`, which a
 * `"use client"` module cannot export. The whole interactive surface lives in
 * `ProtectionClaimsClient`.
 */
export const metadata: Metadata = {
  title: "Protection claims",
  description:
    "Adjudicate buyer claims against shipment and sale protection cover.",
};

export default function Page() {
  return <ProtectionClaimsClient />;
}
