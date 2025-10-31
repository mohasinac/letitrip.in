"use client";

import React from "react";
import { Quote, Star, CheckCircle } from "lucide-react";
import {
  UnifiedCard,
  CardContent,
  UnifiedBadge,
} from "@/components/ui/unified";
import { cn } from "@/lib/utils";

const reviews = [
  {
    name: "Arjun Patel",
    location: "Mumbai, India",
    rating: 5,
    review:
      "Amazing quality! Got my childhood Dragoon GT in perfect condition. Fast shipping and excellent packaging.",
    product: "Dragoon GT",
    avatar: "AP",
    verified: true,
  },
  {
    name: "Priya Sharma",
    location: "Delhi, India",
    rating: 5,
    review:
      "Best Beyblade store in India! Authentic products, great prices, and super helpful customer service.",
    product: "Beyblade Burst Set",
    avatar: "PS",
    verified: true,
  },
  {
    name: "Rohit Kumar",
    location: "Bangalore, India",
    rating: 5,
    review:
      "Finally found rare Beyblades that I've been searching for years. Highly recommend to all collectors!",
    product: "Metal Fight Series",
    avatar: "RK",
    verified: true,
  },
  {
    name: "Sneha Reddy",
    location: "Hyderabad, India",
    rating: 5,
    review:
      "Bought Beyblades for my son and he absolutely loves them. Quality is top-notch and delivery was quick.",
    product: "Beyblade X Starter",
    avatar: "SR",
    verified: true,
  },
];

export default function ModernCustomerReviews() {
  return (
    <section className="py-16 bg-surface">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-text to-primary bg-clip-text text-transparent">
            What Our Customers Say
          </h2>
          <p className="text-lg text-textSecondary max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust us for authentic
            Beyblades and exceptional service.
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {reviews.map((review, index) => (
            <UnifiedCard
              key={index}
              variant="elevated"
              className="relative transition-all duration-300 hover:-translate-y-1"
            >
              {/* Quote Icon */}
              <div className="absolute top-4 right-4 text-primary opacity-30">
                <Quote className="w-8 h-8" />
              </div>

              <CardContent>
                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-warning text-warning"
                    />
                  ))}
                </div>

                {/* Review Text */}
                <p className="text-text mb-6 leading-relaxed italic">
                  "{review.review}"
                </p>

                {/* Product Badge */}
                <div className="mb-6">
                  <UnifiedBadge variant="primary" size="sm">
                    {review.product}
                  </UnifiedBadge>
                </div>

                {/* Customer Info */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-semibold text-lg">
                    {review.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-text">{review.name}</h4>
                      {review.verified && (
                        <UnifiedBadge variant="success" size="xs" rounded>
                          <CheckCircle className="w-2.5 h-2.5 mr-0.5" />
                          Verified
                        </UnifiedBadge>
                      )}
                    </div>
                    <p className="text-sm text-textSecondary">
                      {review.location}
                    </p>
                  </div>
                </div>
              </CardContent>
            </UnifiedCard>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { number: "5000+", label: "Happy Customers" },
            { number: "4.9/5", label: "Average Rating" },
            { number: "2000+", label: "Products Sold" },
            { number: "99%", label: "Satisfaction Rate" },
          ].map((stat, index) => (
            <div key={index}>
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                {stat.number}
              </div>
              <div className="text-textSecondary font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
