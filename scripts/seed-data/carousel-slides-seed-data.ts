/**
 * Carousel Slides Seed Data
 * Homepage carousel/hero section slides with interactive grid cards
 */

import type { CarouselSlideDocument } from "@/db/schema";

export const carouselSlidesSeedData: Partial<CarouselSlideDocument>[] = [
  // Slide 1: Welcome/Hero Slide
  {
    id: "carousel-welcome-hero-slide-1707300000001",
    title: "Welcome Hero Slide",
    order: 1,
    active: true,
    media: {
      type: "image",
      url: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1920&h=1080&fit=crop",
      alt: "Welcome to LetItRip - Your Marketplace",
    },
    mobileMedia: {
      type: "image",
      url: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&h=1200&fit=crop",
      alt: "Welcome to LetItRip",
    },
    cards: [
      {
        id: "card_001",
        gridPosition: { row: 2, col: 2 },
        mobilePosition: { row: 1, col: 1 },
        width: 4,
        height: 3,
        background: {
          type: "gradient",
          value:
            "linear-gradient(135deg, rgba(59, 130, 246, 0.9), rgba(37, 99, 235, 0.9))",
        },
        content: {
          title: "Welcome to LetItRip",
          subtitle: "Your Marketplace",
          description: "Discover amazing products",
        },
        buttons: [
          {
            id: "btn_001",
            text: "Shop Now",
            link: "/products",
            variant: "primary",
            openInNewTab: false,
          },
          {
            id: "btn_002",
            text: "Learn More",
            link: "/about",
            variant: "outline",
            openInNewTab: false,
          },
        ],
        isButtonOnly: false,
        mobileHideText: false,
      },
      {
        id: "card_002",
        gridPosition: { row: 6, col: 7 },
        mobilePosition: { row: 2, col: 1 },
        width: 2,
        height: 2,
        background: {
          type: "color",
          value: "#10b981",
        },
        content: {
          title: "Free Shipping",
          description: "On orders above ₹999",
        },
        buttons: [],
        isButtonOnly: false,
        mobileHideText: true,
      },
    ],
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2026-02-08T00:00:00Z"),
    createdBy: "user_admin_001",
  },

  // Slide 2: Electronics Sale
  {
    id: "carousel-flash-sale-1707300000002",
    title: "Electronics Mega Sale",
    order: 2,
    active: true,
    media: {
      type: "image",
      url: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1920&h=1080&fit=crop",
      alt: "Electronics Mega Sale",
    },
    cards: [
      {
        id: "card_003",
        gridPosition: { row: 3, col: 1 },
        mobilePosition: { row: 1, col: 1 },
        width: 3,
        height: 4,
        background: {
          type: "gradient",
          value:
            "linear-gradient(135deg, rgba(139, 92, 246, 0.95), rgba(124, 58, 237, 0.95))",
        },
        content: {
          title: "Electronics Sale",
          subtitle: "Up to 50% OFF",
          description: "Latest gadgets at great prices",
        },
        buttons: [
          {
            id: "btn_003",
            text: "Shop Electronics",
            link: "/categories/electronics",
            variant: "primary",
            openInNewTab: false,
          },
        ],
        isButtonOnly: false,
        mobileHideText: false,
      },
      {
        id: "card_004",
        gridPosition: { row: 7, col: 7 },
        mobilePosition: { row: 2, col: 1 },
        width: 2,
        height: 2,
        background: {
          type: "image",
          value:
            "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&h=600&fit=crop",
        },
        content: {
          title: "iPhone 15 Pro",
          description: "Starting at ₹134,900",
        },
        buttons: [
          {
            id: "btn_004",
            text: "View",
            link: "/products/product-iphone-15-pro-max-smartphones-new-techhub-electronics-1",
            variant: "secondary",
            openInNewTab: false,
          },
        ],
        isButtonOnly: true,
        mobileHideText: false,
      },
    ],
    createdAt: new Date("2026-02-01T00:00:00Z"),
    updatedAt: new Date("2026-02-08T00:00:00Z"),
    createdBy: "user_admin_001",
  },

  // Slide 3: Fashion Collection
  {
    id: "carousel-special-offer-1707300000003",
    title: "Fashion Collection",
    order: 3,
    active: true,
    media: {
      type: "image",
      url: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920&h=1080&fit=crop",
      alt: "Latest Fashion Collection",
    },
    cards: [
      {
        id: "card_005",
        gridPosition: { row: 2, col: 6 },
        mobilePosition: { row: 1, col: 1 },
        width: 4,
        height: 3,
        background: {
          type: "gradient",
          value:
            "linear-gradient(135deg, rgba(236, 72, 153, 0.9), rgba(219, 39, 119, 0.9))",
        },
        content: {
          title: "Fashion Forward",
          subtitle: "New Collection",
          description: "Latest trends",
        },
        buttons: [
          {
            id: "btn_005",
            text: "Shop Men's",
            link: "/categories/mens-fashion",
            variant: "primary",
            openInNewTab: false,
          },
          {
            id: "btn_006",
            text: "Shop Women's",
            link: "/categories/womens-fashion",
            variant: "secondary",
            openInNewTab: false,
          },
        ],
        isButtonOnly: false,
        mobileHideText: false,
      },
    ],
    createdAt: new Date("2026-02-05T00:00:00Z"),
    updatedAt: new Date("2026-02-08T00:00:00Z"),
    createdBy: "user_admin_001",
  },

  // Slide 4: Special Offers (with video)
  {
    id: "carousel-trending-now-1707300000004",
    title: "Special Offers",
    order: 4,
    active: true,
    media: {
      type: "video",
      url: "https://assets.mixkit.co/videos/preview/mixkit-going-down-on-an-escalator-4549-large.mp4",
      alt: "Special Offers Video",
      thumbnail:
        "https://images.unsplash.com/photo-1607082349566-187342175e2f?w=1920&h=1080&fit=crop",
    },
    cards: [
      {
        id: "card_006",
        gridPosition: { row: 4, col: 1 },
        mobilePosition: { row: 1, col: 1 },
        width: 3,
        height: 2,
        background: {
          type: "color",
          value: "#f59e0b",
        },
        content: {
          title: "Limited Time Offers",
          description: "Grab deals before they expire",
        },
        buttons: [
          {
            id: "btn_007",
            text: "View All Deals",
            link: "/deals",
            variant: "primary",
            openInNewTab: false,
          },
        ],
        isButtonOnly: false,
        mobileHideText: false,
      },
      {
        id: "card_007",
        gridPosition: { row: 6, col: 6 },
        mobilePosition: { row: 2, col: 1 },
        width: 2,
        height: 2,
        background: {
          type: "gradient",
          value: "linear-gradient(135deg, #ef4444, #dc2626)",
        },
        content: {
          title: "Flash Sale",
          description: "24 hours only!",
        },
        buttons: [],
        isButtonOnly: false,
        mobileHideText: true,
      },
    ],
    createdAt: new Date("2026-02-07T00:00:00Z"),
    updatedAt: new Date("2026-02-08T00:00:00Z"),
    createdBy: "user_admin_001",
  },

  // Slide 5: Auction Spotlight
  {
    id: "carousel-seasonal-collection-1707300000005",
    title: "Live Auctions",
    order: 5,
    active: true,
    media: {
      type: "image",
      url: "https://images.unsplash.com/photo-1505253468034-514d2507d914?w=1920&h=1080&fit=crop",
      alt: "Live Auctions",
    },
    link: {
      url: "/auctions",
      openInNewTab: false,
    },
    cards: [
      {
        id: "card_008",
        gridPosition: { row: 3, col: 3 },
        mobilePosition: { row: 1, col: 1 },
        width: 4,
        height: 3,
        background: {
          type: "gradient",
          value:
            "linear-gradient(135deg, rgba(20, 184, 166, 0.9), rgba(13, 148, 136, 0.9))",
        },
        content: {
          title: "Live Auctions",
          subtitle: "Bid & Win",
          description: "Unique items up for auction",
        },
        buttons: [
          {
            id: "btn_008",
            text: "Browse Auctions",
            link: "/auctions",
            variant: "primary",
            openInNewTab: false,
          },
        ],
        isButtonOnly: false,
        mobileHideText: false,
      },
      {
        id: "card_009",
        gridPosition: { row: 7, col: 7 },
        mobilePosition: { row: 2, col: 1 },
        width: 2,
        height: 2,
        background: {
          type: "color",
          value: "#ef4444",
        },
        content: {
          title: "Ending Soon",
          description: "2 hours left!",
        },
        buttons: [],
        isButtonOnly: false,
        mobileHideText: true,
      },
    ],
    createdAt: new Date("2026-02-08T00:00:00Z"),
    updatedAt: new Date("2026-02-08T00:00:00Z"),
    createdBy: "user_admin_001",
  },

  // Inactive Slide (for testing)
  {
    id: "carousel-limited-time-deals-1707300000006",
    title: "Inactive Test Slide",
    order: 6,
    active: false,
    media: {
      type: "image",
      url: "https://images.unsplash.com/photo-1557821552-17105176677c?w=1920&h=1080&fit=crop",
      alt: "Test Banner",
    },
    cards: [],
    createdAt: new Date("2026-01-15T00:00:00Z"),
    updatedAt: new Date("2026-01-20T00:00:00Z"),
    createdBy: "user_admin_001",
  },
];
