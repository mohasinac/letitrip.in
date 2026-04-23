import { Section, Stack, Skeleton } from "@mohasinac/appkit/ui";

export default function Loading() {
  return (
    <Section className="p-6">
      <div data-testid="auction-detail-loading-grid" className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Skeleton variant="rectangular" height="400px" className="rounded-xl w-full" />
        <Stack gap="md">
          <Skeleton variant="text" width="70%" height="28px" />
          <Skeleton variant="text" width="50%" height="22px" />
          <Skeleton variant="rectangular" height="120px" className="rounded-lg" />
          <Skeleton variant="rectangular" height="48px" className="rounded-lg mt-2" />
        </Stack>
      </div>
    </Section>
  );
}
