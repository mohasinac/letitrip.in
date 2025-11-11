import { NextRequest, NextResponse } from "next/server";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";

const PREFIX = "TEST_";

export async function POST(req: NextRequest) {
  try {
    const { count = 5 } = await req.json();
    const db = getFirestoreAdmin();

    const slideTemplates = [
      { title: "Summer Sale", subtitle: "Up to 50% off on fashion", link: "/products?category=fashion", cta: "Shop Now" },
      { title: "New Arrivals", subtitle: "Check out our latest products", link: "/products?sort=newest", cta: "Explore" },
      { title: "Hot Auctions", subtitle: "Bid on exclusive items today", link: "/auctions", cta: "View Auctions" },
      { title: "Featured Shops", subtitle: "Discover trusted sellers", link: "/shops", cta: "Browse Shops" },
      { title: "Electronics Deal", subtitle: "Best prices on gadgets", link: "/products?category=electronics", cta: "Shop Now" },
      { title: "Home & Kitchen", subtitle: "Transform your living space", link: "/products?category=home-kitchen", cta: "Learn More" },
      { title: "Flash Sale", subtitle: "Limited time offers ending soon", link: "/products?featured=true", cta: "Grab Now" },
      { title: "Clearance Sale", subtitle: "Huge discounts on select items", link: "/products?discount=high", cta: "Shop Now" },
      { title: "Sports & Fitness", subtitle: "Gear up for your workouts", link: "/products?category=sports", cta: "Shop Now" },
      { title: "Beauty & Personal Care", subtitle: "Look your best every day", link: "/products?category=beauty", cta: "Discover" },
    ];

    const heroSlides = [];
    const actualCount = Math.min(count, slideTemplates.length);

    for (let i = 0; i < actualCount; i++) {
      const slide = slideTemplates[i];
      const heroSlideData = {
        id: `${PREFIX}hero_slide_${Date.now()}_${i + 1}`,
        title: slide.title,
        subtitle: slide.subtitle,
        image_url: `https://source.unsplash.com/1920x600/?${slide.title.toLowerCase().replace(/\s+/g, "-")},banner&sig=${Date.now()}${i}`,
        link_url: slide.link,
        cta_text: slide.cta,
        position: i + 1,
        is_active: Math.random() < 0.8, // 80% active
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await db.collection("hero_slides").add(heroSlideData);
      heroSlides.push(heroSlideData);
    }

    return NextResponse.json({
      success: true,
      count: heroSlides.length,
      slides: heroSlides,
    });
  } catch (error: any) {
    console.error("Error generating hero slides:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate hero slides" },
      { status: 500 }
    );
  }
}
