"use client";

import { Link } from "@/i18n/navigation";
import { Button, Div, Heading, Row, Text } from "@mohasinac/appkit/client";
import { ROUTES } from "@mohasinac/appkit/client";

export default function Page() {
  return (
    <Div className="mx-auto max-w-4xl">
      <Row justify="between" align="center" className="mb-6">
        <Heading level={1} className="text-2xl font-semibold">Digital Codes</Heading>
        <Button asChild variant="primary" size="sm">
          <Link href={String(ROUTES.STORE.DIGITAL_CODES_NEW)}>+ New Digital Code</Link>
        </Button>
      </Row>
      <div data-testid="empty-state" className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 py-16 text-center dark:border-zinc-700">
        <Text color="muted">No digital code listings yet.</Text>
        <Text color="muted" className="mt-1 text-xs">Sell game keys, gift cards, and activation codes that are delivered instantly to buyers.</Text>
      </div>
    </Div>
  );
}
