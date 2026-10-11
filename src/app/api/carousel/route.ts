import { withProviders } from "@/providers.config";
import { carouselPOST } from "@mohasinac/appkit/features/homepage/api/carousel/route";
import { carouselGET } from "@mohasinac/appkit";
export const GET = withProviders(carouselGET);
export const POST = withProviders(carouselPOST);
