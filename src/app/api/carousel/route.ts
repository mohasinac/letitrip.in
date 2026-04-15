import { withProviders } from "@/providers.config";
import {
  carouselGET,
  carouselPOST,
} from "@mohasinac/appkit/features/homepage/server";
export const GET = withProviders(carouselGET);
export const POST = withProviders(carouselPOST);

