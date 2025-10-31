"use client";

import React from "react";
import {
  ShieldCheck,
  Truck,
  Lock,
  Headphones,
  TrendingUp,
  Mail,
} from "lucide-react";
import {
  UnifiedCard,
  CardContent,
  UnifiedInput,
  PrimaryButton,
} from "@/components/ui/unified";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: ShieldCheck,
    title: "100% Authentic",
    description: "All products are genuine and verified for authenticity",
    color: "text-success",
    bgColor: "bg-success/10",
  },
  {
    icon: Truck,
    title: "Fast Shipping",
    description: "Quick delivery across India with secure packaging",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: Lock,
    title: "Secure Payment",
    description: "Safe and secure payment methods with buyer protection",
    color: "text-secondary",
    bgColor: "bg-secondary/10",
  },
  {
    icon: Headphones,
    title: "Expert Support",
    description: "Dedicated customer support for all your queries",
    color: "text-error",
    bgColor: "bg-error/10",
  },
];

export default function ModernWhyChooseUs() {
  const [email, setEmail] = React.useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement newsletter subscription
    console.log("Subscribe:", email);
  };

  return (
    <section className="py-16 bg-surface">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-text to-primary bg-clip-text text-transparent">
            Why Choose JustForView?
          </h2>
          <p className="text-lg text-textSecondary max-w-2xl mx-auto leading-relaxed">
            We're committed to providing the best Beyblade shopping experience
            with quality, authenticity, and service you can trust.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <UnifiedCard
                key={index}
                variant="elevated"
                className="text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-xl group"
              >
                <CardContent className="flex flex-col items-center">
                  <div
                    className={cn(
                      "w-16 h-16 rounded-full flex items-center justify-center mb-4",
                      feature.bgColor
                    )}
                  >
                    <Icon className={cn("w-8 h-8", feature.color)} />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-text">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-textSecondary leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </UnifiedCard>
            );
          })}
        </div>

        {/* Newsletter Section */}
        <UnifiedCard
          variant="outlined"
          className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20"
        >
          <CardContent className="py-8 px-6 text-center">
            <div className="max-w-2xl mx-auto">
              {/* Icon */}
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-white mb-6">
                <TrendingUp className="w-8 h-8" />
              </div>

              {/* Title & Description */}
              <h3 className="text-3xl font-bold text-text mb-3">
                Stay Updated
              </h3>
              <p className="text-textSecondary mb-8 leading-relaxed">
                Get notified about new arrivals, exclusive deals, and restocks
                of rare Beyblades. Join our newsletter for the latest updates!
              </p>

              {/* Newsletter Form */}
              <form
                onSubmit={handleSubscribe}
                className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-4"
              >
                <UnifiedInput
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  fullWidth
                  leftIcon={<Mail className="w-5 h-5" />}
                  className="flex-1"
                />
                <PrimaryButton type="submit" size="md" className="sm:w-auto">
                  Subscribe
                </PrimaryButton>
              </form>

              {/* Privacy Note */}
              <p className="text-xs text-textSecondary">
                No spam, unsubscribe at any time. We respect your privacy.
              </p>
            </div>
          </CardContent>
        </UnifiedCard>
      </div>
    </section>
  );
}
