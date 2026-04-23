import { Section, Stack, Skeleton } from "@mohasinac/appkit/ui";

export default function Loading() {
  return (
    <Section className="p-6 max-w-4xl mx-auto">
      <div data-testid="checkout-loading-grid" className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Shipping/Payment */}
        <Stack gap="lg">
          <Stack gap="sm">
            <Skeleton variant="text" width="150px" height="24px" />
            <Skeleton variant="rectangular" height="120px" className="rounded-lg" />
          </Stack>
          <Stack gap="sm">
            <Skeleton variant="text" width="150px" height="24px" />
            <Skeleton variant="rectangular" height="180px" className="rounded-lg" />
          </Stack>
        </Stack>
        {/* Order Summary */}
        <Stack gap="md">
          <Skeleton variant="text" width="180px" height="28px" />
          <Skeleton variant="rectangular" height="200px" className="rounded-lg" />
          <Skeleton variant="rectangular" height="48px" className="rounded-lg" />
        </Stack>
      </div>
    </Section>
  );
}
