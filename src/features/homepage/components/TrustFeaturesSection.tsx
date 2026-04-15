"use client";
// Thin adapter — layout lives in @mohasinac/appkit
import { TrustFeaturesSection as AppkitTrustFeaturesSection } from "@mohasinac/appkit/features/homepage";
import type { TrustFeatureItem } from "@mohasinac/appkit/features/homepage";
import { ShieldCheck, Truck, RotateCcw, Headphones } from "lucide-react";
import { TRUST_FEATURES } from "@/constants";

const ICON_MAP = { ShieldCheck, Truck, RotateCcw, Headphones } as const;
type IconName = keyof typeof ICON_MAP;

export function TrustFeaturesSection() {
  const items: TrustFeatureItem[] = TRUST_FEATURES.map((f) => ({
    iconName: f.iconName,
    title: f.title,
    description: f.description,
    renderIcon: ({ className }: { className?: string }) => {
      const Icon = ICON_MAP[f.iconName as IconName];
      return Icon ? (
        <Icon className={className ?? "w-7 h-7"} strokeWidth={1.5} />
      ) : null;
    },
  }));

  return <AppkitTrustFeaturesSection items={items} />;
}

