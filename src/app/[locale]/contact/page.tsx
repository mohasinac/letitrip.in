"use client";

import { useState } from "react";
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
  Textarea,
} from "@mohasinac/appkit";

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
              className="space-y-4 rounded-xl border border-zinc-200 bg-white p-6"
            >
              <div>
                <Label htmlFor="contact-name" className="mb-1 block text-sm font-medium text-zinc-700">
                  Your Name
                </Label>
                <Input
                  id="contact-name"
                  name="name"
                  aria-label="Your Name"
                  required
                  className="w-full rounded-md border border-zinc-300 px-3 py-2"
                />
              </div>

              <div>
                <Label htmlFor="contact-email" className="mb-1 block text-sm font-medium text-zinc-700">
                  Email Address
                </Label>
                <Input
                  id="contact-email"
                  name="email"
                  type="email"
                  aria-label="Email Address"
                  required
                  className="w-full rounded-md border border-zinc-300 px-3 py-2"
                />
              </div>

              <div>
                <Label htmlFor="contact-subject" className="mb-1 block text-sm font-medium text-zinc-700">
                  Subject
                </Label>
                <Input
                  id="contact-subject"
                  name="subject"
                  aria-label="Subject"
                  className="w-full rounded-md border border-zinc-300 px-3 py-2"
                />
              </div>

              <div>
                <Label htmlFor="contact-message" className="mb-1 block text-sm font-medium text-zinc-700">
                  Message
                </Label>
                <Textarea
                  id="contact-message"
                  name="message"
                  aria-label="Message"
                  required
                  rows={5}
                  className="w-full rounded-md border border-zinc-300 px-3 py-2"
                />
              </div>

              <Button type="submit" disabled={loading}>
                {loading ? "Sending..." : "Send Message"}
              </Button>

              {status ? <Text className="text-sm text-zinc-600">{status}</Text> : null}
            </form>
          </Stack>
        </Container>
      </Section>
    </Main>
  );
}