"use client";
import { StoreAboutView, type StoreDetail } from "@mohasinac/appkit/client";
import { Div, Text } from "@mohasinac/appkit/client";
import { TextLink } from "@mohasinac/appkit";

export function StoreAboutClient({ store }: { store: StoreDetail }) {
  return (
    <StoreAboutView
      store={store}
      renderStats={(s) =>
        s.itemsSold != null || s.totalReviews != null || s.averageRating != null ? (
          <Div className="flex gap-6 text-sm text-neutral-600 border-y py-4">
            {s.itemsSold != null && (
              <Div className="text-center">
                <Div className="text-lg font-bold text-neutral-900">{s.itemsSold}</Div>
                <Div>Items Sold</Div>
              </Div>
            )}
            {s.totalReviews != null && (
              <Div className="text-center">
                <Div className="text-lg font-bold text-neutral-900">{s.totalReviews}</Div>
                <Div>Reviews</Div>
              </Div>
            )}
            {s.averageRating != null && (
              <Div className="text-center">
                <Div className="text-lg font-bold text-neutral-900">{s.averageRating.toFixed(1)}</Div>
                <Div>Avg Rating</Div>
              </Div>
            )}
          </Div>
        ) : null
      }
      renderSocialLinks={(links) =>
        links && Object.values(links).some(Boolean) ? (
          <Div className="flex gap-3 flex-wrap">
            {links.twitter && (
              <TextLink href={links.twitter} external className="text-sm text-primary hover:underline">
                <Text as="span">Twitter</Text>
              </TextLink>
            )}
            {links.instagram && (
              <TextLink href={links.instagram} external className="text-sm text-primary hover:underline">
                <Text as="span">Instagram</Text>
              </TextLink>
            )}
            {links.facebook && (
              <TextLink href={links.facebook} external className="text-sm text-primary hover:underline">
                <Text as="span">Facebook</Text>
              </TextLink>
            )}
            {links.linkedin && (
              <TextLink href={links.linkedin} external className="text-sm text-primary hover:underline">
                <Text as="span">LinkedIn</Text>
              </TextLink>
            )}
          </Div>
        ) : null
      }
    />
  );
}
