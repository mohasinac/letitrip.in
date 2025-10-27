"use client";

import { WEBSITE_FEATURES } from "@/constants/homepage";

export default function WhyChooseUs() {
  return (
    <section className="py-24 bg-theme-background shadow-inner">
      <div className="container mx-auto px-4">
        <div className="text-center mb-20">
          <h2 className="text-4xl lg:text-5xl font-black text-theme-text mb-6 drop-shadow-lg">
            Why Choose JustForView?
          </h2>
          <p className="text-2xl text-theme-muted font-bold max-w-2xl mx-auto drop-shadow-md">
            Your trusted marketplace for authentic products, live auctions, and
            global connections
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {WEBSITE_FEATURES.map((feature, index) => (
            <div
              key={index}
              className="p-8 rounded-2xl border-4 border-theme-primary bg-white hover:border-theme-secondary hover:shadow-2xl hover-glow-theme-strong transition-all duration-500 transform hover:-translate-y-2"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-theme-primary to-theme-secondary rounded-xl flex items-center justify-center mb-6 shadow-lg">
                <span className="text-3xl">{feature.icon}</span>
              </div>
              <h3 className="text-2xl font-bold text-theme-text mb-4 drop-shadow-sm">
                {feature.title}
              </h3>
              <p className="text-theme-muted font-semibold text-lg leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
