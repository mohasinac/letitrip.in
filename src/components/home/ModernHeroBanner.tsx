"use client";

import React from "react";
import NextLink from "next/link";
import { ShieldCheck, Truck, Star, Sparkles } from "lucide-react";
import {
  UnifiedCard,
  CardMedia,
  CardContent,
  UnifiedBadge,
  PrimaryButton,
  OutlineButton,
} from "@/components/ui/unified";
import { cn } from "@/lib/utils";

export default function ModernHeroBanner() {
  return (
    <section className="relative min-h-[70vh] py-16 md:py-24 overflow-hidden bg-gradient-to-br from-surface via-surfaceVariant to-surface">
      {/* Background Pattern */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 50%, var(--color-primary) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }}
      />

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Left Content */}
          <div className="max-w-2xl">
            <UnifiedBadge variant="primary" size="sm" rounded className="mb-6">
              <Sparkles className="w-3 h-3 mr-1" />
              Premium Quality Guaranteed
            </UnifiedBadge>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-text to-primary bg-clip-text text-transparent">
                Authentic Beyblades
              </span>
              <br />
              <span className="text-3xl md:text-4xl lg:text-5xl text-textSecondary">
                for True Bladers
              </span>
            </h1>

            <p className="text-lg md:text-xl text-textSecondary mb-8 leading-relaxed opacity-90">
              Discover rare, authentic Beyblades from all generations. From
              classic Plastic Gen to the latest Beyblade X series - we have them
              all.
            </p>

            <div className="flex gap-3 mb-8 flex-wrap">
              <NextLink href="/products">
                <PrimaryButton size="lg">Shop Now</PrimaryButton>
              </NextLink>
              <NextLink href="/categories">
                <OutlineButton size="lg">View Collections</OutlineButton>
              </NextLink>
            </div>

            {/* Features */}
            <div className="flex gap-6 flex-wrap">
              {[
                { icon: ShieldCheck, text: "100% Authentic" },
                { icon: Truck, text: "Fast Shipping" },
                { icon: Star, text: "5-Star Rated" },
              ].map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="flex items-center gap-2">
                    <Icon className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium text-text">
                      {feature.text}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Content - Featured Products */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              {/* Featured product cards */}
              {[
                {
                  name: "Dragoon GT",
                  price: "₹2,499",
                  badge: "Popular",
                  badgeVariant: "warning" as const,
                },
                {
                  name: "Valkyrie X",
                  price: "₹1,899",
                  badge: "New",
                  badgeVariant: "success" as const,
                },
                {
                  name: "Spriggan Burst",
                  price: "₹1,699",
                  badge: "Sale",
                  badgeVariant: "error" as const,
                },
              ].map((product, index) => (
                <UnifiedCard
                  key={index}
                  variant="elevated"
                  className="overflow-hidden transition-transform duration-300 hover:-translate-y-2 cursor-pointer"
                >
                  {/* Image Placeholder */}
                  <CardMedia className="h-40 bg-surfaceVariant flex items-center justify-center relative">
                    <div className="text-textTertiary font-medium">
                      {product.name}
                    </div>
                    <div className="absolute top-2 right-2">
                      <UnifiedBadge
                        variant={product.badgeVariant}
                        size="xs"
                        rounded
                      >
                        {product.badge}
                      </UnifiedBadge>
                    </div>
                  </CardMedia>

                  <CardContent className="p-4">
                    <h3 className="text-lg font-semibold mb-2 text-text">
                      {product.name}
                    </h3>
                    <p className="text-xl font-bold text-primary">
                      {product.price}
                    </p>
                  </CardContent>
                </UnifiedCard>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
