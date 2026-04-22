import { AuctionDetailView } from "@mohasinac/appkit";
import { Div, Heading, Text, Stack, Skeleton } from "@mohasinac/appkit";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: Props) {
  const { id } = await params;

  return (
    <AuctionDetailView
      renderGallery={(isLoading) =>
        isLoading ? (
          <Skeleton variant="rectangular" height="360px" className="rounded-xl" />
        ) : (
          <Div className="overflow-hidden rounded-xl border border-zinc-100 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
            <Div className="flex aspect-square items-center justify-center text-zinc-300 dark:text-zinc-700">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
            </Div>
          </Div>
        )
      }
      renderInfo={(isLoading) =>
        isLoading ? (
          <Stack gap="sm">
            <Skeleton variant="text" height="2rem" width="60%" />
            <Skeleton variant="text" />
            <Skeleton variant="text" width="80%" />
          </Stack>
        ) : (
          <Stack gap="md">
            <Heading level={2}>Auction Item</Heading>
            <Text variant="secondary">Auction details, current bid, and time remaining will appear here once the data layer is connected.</Text>
          </Stack>
        )
      }
      renderBidForm={() => (
        <Div className="rounded-xl border border-zinc-100 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <Stack gap="sm">
            <Skeleton variant="text" height="1.25rem" width="50%" />
            <Skeleton variant="text" height="2.5rem" className="rounded-lg" />
            <Skeleton variant="text" height="2.5rem" className="rounded-lg" />
          </Stack>
        </Div>
      )}
      renderMobileBidForm={() => (
        <Div className="rounded-xl border border-zinc-100 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900 lg:hidden">
          <Stack gap="sm">
            <Skeleton variant="text" height="2.5rem" className="rounded-lg" />
          </Stack>
        </Div>
      )}
    />
  );
}