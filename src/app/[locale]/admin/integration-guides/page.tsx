import fs from "node:fs";
import path from "node:path";
import { marked } from "marked";
import { Div, Heading, RichTextRenderer, Stack, Text, normalizeError } from "@mohasinac/appkit";

interface Guide {
  slug: string;
  title: string;
  html: string;
}

// Static, literal path under process.cwd() — Next.js's build-time file
// tracer (@vercel/nft) picks up fs.readFileSync calls shaped like this
// automatically, the same way markdown-driven blog routes work; no
// outputFileTracingIncludes entry needed (that config is for dynamically
// require()'d npm packages, not static repo assets — see CLAUDE.md
// Recurrent Root Cause Pattern #6).
const GUIDES_DIR = path.join(process.cwd(), "docs", "integration-guides");

function titleFromSlug(slug: string): string {
  return slug
    .split("-")
    .map((w) => w[0]?.toUpperCase() + w.slice(1))
    .join(" ");
}

function loadGuides(): Guide[] {
  let files: string[] = [];
  try {
    files = fs.readdirSync(GUIDES_DIR).filter((f) => f.endsWith(".md")).sort();
  } catch (err) {
    void normalizeError(err);
    return [];
  }
  return files.map((file) => {
    const slug = file.replace(/\.md$/, "");
    const raw = fs.readFileSync(path.join(GUIDES_DIR, file), "utf-8");
    return { slug, title: titleFromSlug(slug), html: marked.parse(raw, { async: false }) as string };
  });
}

export default function Page() {
  const guides = loadGuides();

  return (
    <Div padding="page">
      <Heading level={1} className="mb-2" color="primary" size="xl" weight="semibold">
        Integration Guides
      </Heading>
      <Text className="mb-6" color="muted" size="sm">
        Setup instructions for the platform's third-party integrations — configure credentials in the
        relevant Site Settings tab after following each guide.
      </Text>
      {guides.length === 0 ? (
        <Text color="muted" size="sm">No guides found.</Text>
      ) : (
        <Stack gap="hero">
          {guides.map((guide) => (
            <Div key={guide.slug} surface="card" padding="lg" rounded="xl" border="default" id={guide.slug}>
              <RichTextRenderer html={guide.html} />
            </Div>
          ))}
        </Stack>
      )}
    </Div>
  );
}
