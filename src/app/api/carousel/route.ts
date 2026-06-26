import { withProviders } from "@/providers.config";
import {
  carouselGET,
  carouselPOST,
} from "@mohasinac/appkit";
// rbac-public: public endpoint — no authentication required
export const GET = withProviders(carouselGET);
// rbac-public: public endpoint — no authentication required
export const POST = withProviders(carouselPOST);
