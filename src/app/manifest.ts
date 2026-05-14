import type { MetadataRoute } from "next";
import { buildManifest } from "@mohasinac/appkit/server";

export default function manifest(): MetadataRoute.Manifest {
  return buildManifest({
    name: "LetItRip — Shop, Bid & Sell",
    shortName: "LetItRip",
    description:
      "India's multi-seller marketplace — shop unique products, join live auctions, and sell from your own store.",
  });
}
