"use client";

import { ReviewsListView } from "@mohasinac/appkit";
import { Div, Text } from "@mohasinac/appkit";

export function ReviewsRouteClient() {
  return (
    <ReviewsListView
      renderResults={() => (
        <Div className="rounded-xl border border-zinc-200 bg-white p-5">
          <Text className="text-zinc-600">No reviews available yet.</Text>
        </Div>
      )}
      renderSearch={() => null}
      renderSort={() => null}
      labels={{ title: "Reviews" }}
    />
  );
}
