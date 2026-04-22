"use client";

import { useState } from "react";
import {
  Button,
  Container,
  Div,
  Heading,
  Input,
  Label,
  Main,
  Section,
  Stack,
  Text,
  Textarea,
} from "@mohasinac/appkit/client";

export default function Page() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  async function onSubmit(formData: FormData) {
    setLoading(true);
    setStatus(null);
    try {
      const payload = {
        name: String(formData.get("name") ?? ""),
        email: String(formData.get("email") ?? ""),
        subject: String(formData.get("subject") ?? "General inquiry"),
        message: String(formData.get("message") ?? ""),
      };

      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      setStatus(res.ok ? "Message sent successfully." : "Could not send message.");
    } catch {
      setStatus("Could not send message.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Main>
      <Section className="py-12">
        <Container size="lg">
          <Stack gap="md">
            <Heading level={1} className="text-3xl font-semibold text-zinc-900">
              Contact
            </Heading>
            <Text className="text-zinc-600">
              Reach out and we will get back to you shortly.
            </Text>

            <form
              action={(fd) => {
                void onSubmit(fd);
              }}
              className="space-y-4 rounded-xl border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6"
            >
              <Div>
                <Label htmlFor="contact-name" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Your Name
                </Label>
                <Input
                  id="contact-name"
                  name="name"
                  aria-label="Your Name"
                  required
                  className="w-full rounded-md border border-zinc-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-slate-500 px-3 py-2"
                />
              </Div>

              <Div>
                <Label htmlFor="contact-email" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Email Address
                </Label>
                <Input
                  id="contact-email"
                  name="email"
                  type="email"
                  aria-label="Email Address"
                  required
                  className="w-full rounded-md border border-zinc-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-slate-500 px-3 py-2"
                />
              </Div>

              <Div>
                <Label htmlFor="contact-subject" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Subject
                </Label>
                <Input
                  id="contact-subject"
                  name="subject"
                  aria-label="Subject"
                  className="w-full rounded-md border border-zinc-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-slate-500 px-3 py-2"
                />
              </Div>

              <Div>
                <Label htmlFor="contact-message" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Message
                </Label>
                <Textarea
                  id="contact-message"
                  name="message"
                  aria-label="Message"
                  required
                  rows={5}
                  className="w-full rounded-md border border-zinc-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-slate-500 px-3 py-2"
                />
              </Div>

              <Button
                type="submit"
                disabled={loading}
                className="!bg-zinc-900 !text-white hover:!bg-zinc-800 dark:!bg-zinc-100 dark:!text-zinc-900 dark:hover:!bg-zinc-200"
              >
                {loading ? "Sending..." : "Send Message"}
              </Button>

              {status ? <Text className="text-sm text-zinc-600 dark:text-zinc-300">{status}</Text> : null}
            </form>
          </Stack>
        </Container>
      </Section>
    </Main>
  );
}