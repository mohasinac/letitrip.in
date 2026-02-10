/**
 * Shared Carousel types for admin carousel management.
 */

export interface CarouselSlide {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  linkUrl?: string;
  isActive: boolean;
  order: number;
  gridData?: any;
}

export type DrawerMode = "create" | "edit" | "delete" | null;
