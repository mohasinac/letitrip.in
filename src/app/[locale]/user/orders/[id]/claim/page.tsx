import type { Metadata } from "next";
import ClaimClient from "./ClaimClient";

export const metadata: Metadata = {
  title: "Claim on protection cover",
  description: "File a claim against the shipment or sale protection on this order.",
};

export default function Page(props: { params: Promise<{ id: string }> }) {
  return <ClaimClient {...props} />;
}
