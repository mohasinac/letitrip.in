"use client";
// Thin adapter — layout lives in @mohasinac/appkit
import { TrustIndicatorsSection as AppkitTrustIndicatorsSection } from "@mohasinac/appkit/features/homepage";
import { TRUST_INDICATORS } from "@/constants";

export function TrustIndicatorsSection() {
  const items = TRUST_INDICATORS.map((item, i) => ({
    ...item,
    key: item.icon ?? String(i),
  }));
  return <AppkitTrustIndicatorsSection items={items} />;
}

