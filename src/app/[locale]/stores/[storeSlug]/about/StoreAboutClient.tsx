"use client";
import { StoreAboutView, type StoreDetail } from "@mohasinac/appkit/client";
import { Div, Text } from "@mohasinac/appkit/client";
import { Row, TextLink } from "@mohasinac/appkit/client";

export function StoreAboutClient({ store }: { store: StoreDetail }) {
  return (
    <StoreAboutView
      store={store}
      renderStats={(s) =>
        s.itemsSold != null || s.totalReviews != null || s.averageRating != null ? (
          <Row textSize="sm" gap="lg" className="border-y" color="muted" padding="y-md">
            {s.itemsSold != null && (
              <Div className="text-center">
                <Div textWeight="bold" textSize="lg" color="primary">{s.itemsSold}</Div>
                <Div>Items Sold</Div>
              </Div>
            )}
            {s.totalReviews != null && (
              <Div className="text-center">
                <Div textWeight="bold" textSize="lg" color="primary">{s.totalReviews}</Div>
                <Div>Reviews</Div>
              </Div>
            )}
            {s.averageRating != null && (
              <Div className="text-center">
                <Div textWeight="bold" textSize="lg" color="primary">{s.averageRating.toFixed(1)}</Div>
                <Div>Avg Rating</Div>
              </Div>
            )}
          </Row>
        ) : null
      }
      renderSocialLinks={(links) =>
        links && Object.values(links).some(Boolean) ? (
          <Row wrap gap="3">
            {links.twitter && (
              <TextLink href={links.twitter} external className="text-primary hover:underline" size="sm">
                <Text as="span">Twitter</Text>
              </TextLink>
            )}
            {links.instagram && (
              <TextLink href={links.instagram} external className="text-primary hover:underline" size="sm">
                <Text as="span">Instagram</Text>
              </TextLink>
            )}
            {links.facebook && (
              <TextLink href={links.facebook} external className="text-primary hover:underline" size="sm">
                <Text as="span">Facebook</Text>
              </TextLink>
            )}
            {links.linkedin && (
              <TextLink href={links.linkedin} external className="text-primary hover:underline" size="sm">
                <Text as="span">LinkedIn</Text>
              </TextLink>
            )}
          </Row>
        ) : null
      }
    />
  );
}
