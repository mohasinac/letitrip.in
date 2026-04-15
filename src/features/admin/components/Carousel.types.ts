/**
 * Shared Carousel types for admin carousel management.
 */

export interface GridCard {
  id: string;
  /** 1 = Top row, 2 = Bottom row */
  gridRow: 1 | 2;
  /** 1 = Left, 2 = Center, 3 = Right */
  gridCol: 1 | 2 | 3;
  background: {
    type: "color" | "gradient" | "image" | "transparent";
    value: string;
  };
  content?: {
    title?: string;
    subtitle?: string;
    description?: string;
  };
  buttons?: {
    id: string;
    text: string;
    link: string;
    variant: "primary" | "secondary" | "outline";
    openInNewTab: boolean;
  }[];
  isButtonOnly: boolean;
  sizing?: {
    widthPct?: 25 | 50 | 75 | 100;
    heightPct?: 25 | 50 | 75 | 100;
    padding?: "none" | "sm" | "md" | "lg";
  };
}

export interface CarouselSlideOverlay {
  title?: string;
  subtitle?: string;
  description?: string;
  button?: {
    id: string;
    text: string;
    link: string;
    variant: "primary" | "secondary" | "outline";
    openInNewTab: boolean;
  };
}

export interface CarouselSlide {
  id: string;
  title: string;
  order: number;
  active: boolean;
  media: {
    type: "image" | "video";
    url: string;
    alt: string;
    thumbnail?: string;
  };
  link?: {
    url: string;
    openInNewTab: boolean;
  };
  mobileMedia?: {
    type: "image" | "video";
    url: string;
    alt: string;
  };
  cards: GridCard[];
  /**
   * When set, cards are ignored and text + button are rendered centred over the slide.
   * Set to `null` to clear the overlay.
   */
  overlay?: CarouselSlideOverlay | null;
}

export type DrawerMode = "create" | "edit" | "delete" | null;

