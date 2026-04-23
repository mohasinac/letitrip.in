import { Section, Skeleton } from "@mohasinac/appkit/ui";

export default function Loading() {
  return (
    <Section className="p-6">
      <div data-testid="admin-loading-grid" className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Nav */}
        <div data-testid="admin-loading-nav" className="md:col-span-1">
          <Skeleton variant="rectangular" height="600px" className="rounded-lg" />
        </div>
        {/* Content */}
        <div data-testid="admin-loading-content" className="md:col-span-4">
          <Skeleton variant="rectangular" height="600px" className="rounded-lg" />
        </div>
      </div>
    </Section>
  );
}
