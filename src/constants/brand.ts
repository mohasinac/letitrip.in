import appkitConfig from "@/lib/appkit-config";

const b = appkitConfig.brand!;

export const BRAND = {
  NAME: b.name,
  SHORT_NAME: b.shortName ?? "LT",
  DESCRIPTION: b.description ?? "",
  MADE_IN_TEXT: b.madeInText ?? "",
  SOCIAL_URLS: {
    INSTAGRAM: b.socialUrls?.instagram ?? "",
    TWITTER: b.socialUrls?.twitter ?? "",
    WHATSAPP: b.socialUrls?.whatsapp ?? "",
  },
};

export function getBrandCopyright(year = new Date().getFullYear()): string {
  return `© ${year} ${BRAND.NAME}. All rights reserved.`;
}
