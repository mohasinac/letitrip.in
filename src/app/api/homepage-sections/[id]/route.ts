import { withProviders } from "@/providers.config";
import {
  homepageSectionItemGET,
  homepageSectionItemPATCH,
  homepageSectionItemDELETE,
} from "@mohasinac/appkit/features/homepage/server";

export const GET = withProviders(homepageSectionItemGET);
export const PATCH = withProviders(homepageSectionItemPATCH);
export const DELETE = withProviders(homepageSectionItemDELETE);
