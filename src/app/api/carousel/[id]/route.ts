import { withProviders } from "@/providers.config";
import { carouselItemPATCH, carouselItemDELETE } from "@mohasinac/appkit/features/homepage/api/carousel/[id]/route";
import { carouselItemGET } from "@mohasinac/appkit";
export const GET = withProviders(carouselItemGET);
export const PATCH = withProviders(carouselItemPATCH);
export const DELETE = withProviders(carouselItemDELETE);
