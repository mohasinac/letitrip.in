import { Stack, Row, Text, Heading, TextLink, ROUTES } from "@mohasinac/appkit";

/*
 * 🛑 THE ROOT not-found — WITHOUT IT, EVERY UNMATCHED URL SERVED NEXT'S OWN
 * BARE 404.
 *
 * `src/app/[locale]/not-found.tsx` exists and renders the styled <NotFoundView>,
 * but it is only reachable for a path that matched the `[locale]` segment. A
 * URL that matches nothing never gets there, so Next fell back to its built-in
 * page: "404 | This page could not be found." on bare white, with no header, no
 * navigation and — measured — ZERO links of any kind. A visitor who mistyped a
 * URL had no way back into the site except the browser's Back button.
 *
 * Measured on production before this file existed, all three identical:
 *   /this-page-does-not-exist-qa      404, 0 links, no header
 *   /en/this-page-does-not-exist-qa   404, 0 links, no header
 *   /__tester-control-<runId>         404, 0 links, no header
 *
 * 🛑 NO REACT PROVIDERS ARE AVAILABLE HERE.
 *
 * ThemeProvider, SessionProvider and NextIntlClientProvider all live in
 * `[locale]/layout.tsx`; this page renders under the ROOT layout, which has
 * only <html>, <body> and the stylesheet imports. So nothing here may read
 * translations or session — a crash inside the 404 boundary is a blank page,
 * which is the thing being fixed.
 *
 * That constraint does NOT justify raw HTML, which is what I reached for first
 * and `audit-html-wrappers` correctly rejected. `Typography.tsx`, `Layout.tsx`
 * and `TextLink.tsx` contain no context hooks at all — they are pure
 * presentational components, so the primitives are safe here and the audit was
 * right. The stylesheets are loaded by the root layout, so the tokens resolve.
 *
 * Copy is hardcoded English on purpose: there is no i18n provider, and a URL
 * that matched no route has no locale to speak of.
 */
export default function RootNotFound() {
  return (
    <Stack align="center" justify="center" gap="comfortable" padding="page" className="min-h-screen text-center">
      <Text size="sm" weight="semibold" transform="uppercase" color="primary">
        LetItRip
      </Text>

      <Heading level={1} size="4xl" weight="bold">
        404 — Page not found
      </Heading>

      <Text color="muted" className="max-w-md">
        The page you are looking for does not exist, or it may have moved.
      </Text>

      <Row gap="dense" justify="center" wrap>
        <TextLink href={String(ROUTES.HOME)}>Go to homepage</TextLink>
        <TextLink href={String(ROUTES.PUBLIC.PRODUCTS)}>Browse products</TextLink>
        <TextLink href={String(ROUTES.PUBLIC.HELP)}>Help centre</TextLink>
      </Row>
    </Stack>
  );
}
