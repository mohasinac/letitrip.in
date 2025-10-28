import { NextRequest, NextResponse } from "next/server";

// This is a mock implementation. In production, replace with actual database calls.
// For now, we'll use in-memory storage that persists during the server session.

interface HeroBannerSlide {
  id: string;
  title: string;
  description?: string;
  backgroundImage?: string;
  backgroundVideo?: string;
  backgroundColor?: string;
  theme: {
    primary: string;
    secondary: string;
    accent: string;
    gradient: string;
    textPrimary: string;
    textSecondary: string;
    overlay: string;
    cardBackground: string;
    borderColor: string;
  };
  featuredProductIds: string[];
  seoMeta?: {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string[];
    ogImage?: string;
    ogTitle?: string;
    ogDescription?: string;
  };
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

// In-memory storage (replace with actual database)
let heroSlides: HeroBannerSlide[] = [];

// Initialize with default data
const DEFAULT_SLIDES: HeroBannerSlide[] = [
  {
    id: "classic-plastic",
    title: "Classic Plastic Generation",
    description: "Discover the original Beyblades that started the legend",
    backgroundImage:
      "https://images.unsplash.com/photo-1534972195531-d756b9bfa9f2?auto=format&fit=crop&w=1920&q=80",
    backgroundColor: "#1a1a1a",
    theme: {
      primary: "#4A90E2",
      secondary: "#7BB3F0",
      accent: "#2E5BBA",
      gradient: "linear-gradient(135deg, #4A90E2 0%, #7BB3F0 100%)",
      textPrimary: "#FFFFFF",
      textSecondary: "#E3F2FD",
      overlay: "rgba(74, 144, 226, 0.15)",
      cardBackground: "rgba(255, 255, 255, 0.95)",
      borderColor: "rgba(74, 144, 226, 0.3)",
    },
    featuredProductIds: ["dragoon-gt", "valkyrie-x", "spriggan-burst"],
    isActive: true,
    displayOrder: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "metal-fight",
    title: "Metal Fight Series",
    description: "Experience the power of metal-based Beyblades",
    backgroundImage:
      "https://images.unsplash.com/photo-1518709268805-4e9042af2176?auto=format&fit=crop&w=1920&q=80",
    backgroundColor: "#1a1a1a",
    theme: {
      primary: "#757575",
      secondary: "#BDBDBD",
      accent: "#424242",
      gradient: "linear-gradient(135deg, #757575 0%, #BDBDBD 100%)",
      textPrimary: "#FFFFFF",
      textSecondary: "#F5F5F5",
      overlay: "rgba(117, 117, 117, 0.15)",
      cardBackground: "rgba(255, 255, 255, 0.95)",
      borderColor: "rgba(117, 117, 117, 0.3)",
    },
    featuredProductIds: ["storm-pegasus", "rock-leone", "flame-sagittario"],
    isActive: true,
    displayOrder: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Initialize
if (heroSlides.length === 0) {
  heroSlides = DEFAULT_SLIDES;
}

export async function GET() {
  try {
    const activeSlides = heroSlides
      .filter((slide) => slide.isActive)
      .sort((a, b) => a.displayOrder - b.displayOrder);

    return NextResponse.json({
      success: true,
      data: activeSlides,
    });
  } catch (error) {
    console.error("Error fetching hero slides:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch hero slides" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newSlide: HeroBannerSlide = {
      ...body,
      id: body.id || Date.now().toString(),
      createdAt: body.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    heroSlides.push(newSlide);

    return NextResponse.json(
      { success: true, data: newSlide },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating hero slide:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create hero slide" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    const index = heroSlides.findIndex((slide) => slide.id === id);
    if (index === -1) {
      return NextResponse.json(
        { success: false, error: "Hero slide not found" },
        { status: 404 }
      );
    }

    const updatedSlide = {
      ...heroSlides[index],
      ...body,
      id, // Preserve ID
      createdAt: heroSlides[index].createdAt, // Preserve creation date
      updatedAt: new Date().toISOString(),
    };

    heroSlides[index] = updatedSlide;

    return NextResponse.json({ success: true, data: updatedSlide });
  } catch (error) {
    console.error("Error updating hero slide:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update hero slide" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    const index = heroSlides.findIndex((slide) => slide.id === id);
    if (index === -1) {
      return NextResponse.json(
        { success: false, error: "Hero slide not found" },
        { status: 404 }
      );
    }

    heroSlides.splice(index, 1);

    return NextResponse.json({ success: true, data: { id } });
  } catch (error) {
    console.error("Error deleting hero slide:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete hero slide" },
      { status: 500 }
    );
  }
}
