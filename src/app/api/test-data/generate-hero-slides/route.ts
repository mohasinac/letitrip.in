/**
 * @fileoverview TypeScript Module
 * @module src/app/api/test-data/generate-hero-slides/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/database";
import { NextRequest, NextResponse } from "next/server";

/**
 * PREFIX constant
 * 
 * @constant
 * @type {any}
 * @description Configuration constant for prefix
 */
const PREFIX = "TEST_";

/**
 * Function: P O S T
 */
/**
 * Performs p o s t operation
 *
 * @param {NextRequest} req - The req
 *
 * @returns {Promise<any>} Promise resolving to post result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * POST(req);
 */

/**
 * Performs p o s t operation
 *
 * @param {NextRequest} req - The req
 *
 * @returns {Promise<any>} Promise resolving to post result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * POST(req);
 */

export async function POST(req: NextRequest) {
  try {
    const { count = 5 } = await req.json();
    const db = getFirestoreAdmin();

    const slideTemplates = [
      {
        /** Title */
        title: "Summer Sale",
        /** Subtitle */
        subtitle: "Up to 50% off on fashion",
        /** Link */
        link: "/products?category=fashion",
        /** Cta */
        cta: "Shop Now",
      },
      {
        /** Title */
        title: "New Arrivals",
        /** Subtitle */
        subtitle: "Check out our latest products",
        /** Link */
        link: "/products?sort=newest",
        /** Cta */
        cta: "Explore",
      },
      {
        /** Title */
        title: "Hot Auctions",
        /** Subtitle */
        subtitle: "Bid on exclusive items today",
        /** Link */
        link: "/auctions",
        /** Cta */
        cta: "View Auctions",
      },
      {
        /** Title */
        title: "Featured Shops",
        /** Subtitle */
        subtitle: "Discover trusted sellers",
        /** Link */
        link: "/shops",
        /** Cta */
        cta: "Browse Shops",
      },
      {
        /** Title */
        title: "Electronics Deal",
        /** Subtitle */
        subtitle: "Best prices on gadgets",
        /** Link */
        link: "/products?category=electronics",
        /** Cta */
        cta: "Shop Now",
      },
      {
        /** Title */
        title: "Home & Kitchen",
        /** Subtitle */
        subtitle: "Transform your living space",
        /** Link */
        link: "/products?category=home-kitchen",
        /** Cta */
        cta: "Learn More",
      },
      {
        /** Title */
        title: "Flash Sale",
        /** Subtitle */
        subtitle: "Limited time offers ending soon",
        /** Link */
        link: "/products?featured=true",
        /** Cta */
        cta: "Grab Now",
      },
      {
        /** Title */
        title: "Clearance Sale",
        /** Subtitle */
        subtitle: "Huge discounts on select items",
        /** Link */
        link: "/products?discount=high",
        /** Cta */
        cta: "Shop Now",
      },
      {
        /** Title */
        title: "Sports & Fitness",
        /** Subtitle */
        subtitle: "Gear up for your workouts",
        /** Link */
        link: "/products?category=sports",
        /** Cta */
        cta: "Shop Now",
      },
      {
        /** Title */
        title: "Beauty & Personal Care",
        /** Subtitle */
        subtitle: "Look your best every day",
        /** Link */
        link: "/products?category=beauty",
        /** Cta */
        cta: "Discover",
      },
    ];

    const heroSlides = [];
    const actualCount = Math.min(count, slideTemplates.length);

    for (let i = 0; i < actualCount; i++) {
      const slide = slideTemplates[i];
      const heroSlideData = {
        /** Id */
        id: `${PREFIX}hero_slide_${Date.now()}_${i + 1}`,
        /** Title */
        title: slide.title,
        /** Subtitle */
        subtitle: slide.subtitle,
        image_url: `https://source.unsplash.com/1920x600/?${slide.title
          .toLowerCase()
          .replace(/\s+/g, "-")},banner&sig=${Date.now()}${i}`,
        link_url: slide.link,
        cta_text: slide.cta,
        /** Position */
        position: i + 1,
        is_active: Math.random() < 0.8, // 80% active
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await db.collection(COLLECTIONS.HERO_SLIDES).add(heroSlideData);
      heroSlides.push(heroSlideData);
    }

    return NextResponse.json({
      /** Success */
      success: true,
      /** Count */
      count: heroSlides.length,
      /** Slides */
      slides: heroSlides,
    });
  } catch (error: any) {
    console.error("Error generating hero slides:", error);
    return NextResponse.json(
      {
        /** Success */
        success: false,
        /** Error */
        error: error.message || "Failed to generate hero slides",
      },
      { status: 500 },
    );
  }
}
