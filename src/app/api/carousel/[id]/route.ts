import { withProviders } from "@/providers.config";
import {
  carouselItemGET,
  carouselItemPATCH,
  carouselItemDELETE,
} from "@mohasinac/appkit/features/homepage/server";
export const GET = withProviders(carouselItemGET);
export const PATCH = withProviders(carouselItemPATCH);
export const DELETE = withProviders(carouselItemDELETE);
