import type { Metadata } from "next";
import { generateMetadata as _gm } from "@/constants/seo.server";
import { GstExplainerView } from "@mohasinac/appkit/features/about/components/GstExplainerView";

export const metadata: Metadata = _gm({
  title: "GST on LetItRip — what you pay and why",
  description:
    "Every price on LetItRip includes any GST that applies. See which rate applies to which collectibles, who bears each charge, and what your tax invoice shows.",
  path: "/gst",
  keywords: ["gst on collectibles india", "beyblade gst rate", "hsn code toys", "tax inclusive pricing"],
});

export const revalidate = 3600;

export default function Page() {
  return <GstExplainerView />;
}
