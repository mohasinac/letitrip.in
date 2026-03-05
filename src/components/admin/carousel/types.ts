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
    type: "color" | "gradient" | "image";
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

export interface CarouselSlide {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  linkUrl?: string;
  isActive: boolean;
  order: number;
  cards: GridCard[];
}

export type DrawerMode = "create" | "edit" | "delete" | null;
