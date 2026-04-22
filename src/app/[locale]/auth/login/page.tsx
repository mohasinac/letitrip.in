"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Button,
  Container,
  Heading,
  Input,
  Label,
  Main,
  Section,
  Stack,
  Text,
} from "@mohasinac/appkit/client";

export default function Page() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const params = useParams<{ locale?: string }>();
  const locale = params?.locale ?? "en";

  async function onSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
      };

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        setError("Invalid email or password.");
        return;
      }

      router.push(`/${locale}`);
      router.refresh();
    } catch {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Main>
      <Section className="py-12">
        <Container size="sm">
          <Stack gap="md">
            <Heading level={1} className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
              Sign In
            </Heading>
            <Text className="text-zinc-600 dark:text-zinc-400">
              Welcome back. Sign in to continue.
            </Text>

            <form
              action={(fd) => {
                void onSubmit(fd);
              }}
              className="space-y-4 rounded-xl border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6"
            >
              <div>
                <Label htmlFor="login-email" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Email Address
                </Label>
                <Input
                  id="login-email"
                  name="email"
                  type="email"
                  aria-label="Email Address"
                  required
                  className="w-full rounded-md border border-zinc-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 dark:placeholder:text-slate-500 px-3 py-2"
                />
              </div>

              <div>
                <Label htmlFor="login-password" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Password
                </Label>
                <Input
                  id="login-password"
                  name="password"
                  type="password"
                  aria-label="Password"
                  required
                  className="w-full rounded-md border border-zinc-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 dark:placeholder:text-slate-500 px-3 py-2"
                />
              </div>

              <div className="flex items-center gap-2">
                <Input
                  id="remember-me"
                  name="remember"
                  type="checkbox"
                  aria-label="Remember me"
                  className="h-4 w-4 rounded border-zinc-300 dark:border-slate-600 accent-primary"
                />
                <Label htmlFor="remember-me" className="text-sm text-zinc-700 dark:text-zinc-300">
                  Remember me
                </Label>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="!bg-zinc-900 !text-white hover:!bg-zinc-800 dark:!bg-zinc-100 dark:!text-zinc-900 dark:hover:!bg-zinc-200"
              >
                {loading ? "Signing in..." : "Sign in"}
              </Button>

              <Text className="text-sm text-zinc-600 dark:text-zinc-400">
                New here? <Link href={`/${locale}/auth/register`}>Create account</Link>
              </Text>

              {error ? <Text className="text-sm text-red-600 dark:text-red-400">{error}</Text> : null}
            </form>
          </Stack>
        </Container>
      </Section>
    </Main>
  );
}