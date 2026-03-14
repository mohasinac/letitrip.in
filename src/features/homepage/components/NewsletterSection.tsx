"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useMutation } from "@tanstack/react-query";
import { Mail, Send, CheckCircle2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { subscribeNewsletterAction } from "@/actions";
import { Button, Heading, Section, Text, TextLink, Input } from "@/components";
import { ROUTES, THEME_CONSTANTS } from "@/constants";
import { useMessage } from "@/hooks";

const schema = z.object({
  email: z.string().email(),
});
type FormValues = z.infer<typeof schema>;

export function NewsletterSection() {
  const t = useTranslations("homepage");
  const { showError } = useMessage();
  const [subscribed, setSubscribed] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormValues) =>
      subscribeNewsletterAction({ email: data.email, source: "homepage" }),
    onSuccess: () => {
      setSubscribed(true);
      reset();
    },
    onError: (err: Error) => {
      showError(err.message);
    },
  });

  const onSubmit = handleSubmit((data) => mutate(data));

  return (
    <Section className="py-16 px-4 relative overflow-hidden">
      {/* Gradient background layer */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-primary/10 via-cobalt/5 to-secondary/10 dark:from-primary/15 dark:via-cobalt/10 dark:to-secondary/15 pointer-events-none"
        aria-hidden
      />
      {/* Decorative circles */}
      <div
        className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-primary/5 dark:bg-primary/10 pointer-events-none"
        aria-hidden
      />
      <div
        className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-cobalt/5 dark:bg-cobalt/10 pointer-events-none"
        aria-hidden
      />

      <div className="relative z-10 max-w-2xl mx-auto text-center">
        {/* Icon badge */}
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 dark:bg-primary/20 border border-primary/20 mb-5 mx-auto">
          <Mail className="w-7 h-7 text-primary" />
        </div>

        <Heading
          level={2}
          className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white mb-3"
        >
          {t("newsletter.title")}
        </Heading>
        <Text
          size="base"
          className="text-zinc-500 dark:text-zinc-400 mb-8 max-w-md mx-auto"
        >
          {t("newsletter.subtitle")}
        </Text>

        {subscribed ? (
          <div className="flex flex-col items-center gap-3 py-4">
            <CheckCircle2 className="w-10 h-10 text-green-500 dark:text-green-400" />
            <Text
              size="base"
              weight="semibold"
              className="text-green-600 dark:text-green-400"
            >
              {t("newsletter.success")}
            </Text>
          </div>
        ) : (
          <form onSubmit={onSubmit} noValidate>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <div className="flex-1 relative">
                <Input
                  {...register("email")}
                  type="email"
                  placeholder={t("newsletter.placeholder")}
                  autoComplete="email"
                  className="w-full rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-white bg-white dark:bg-slate-800 border border-zinc-200 dark:border-slate-700 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/60 transition-all"
                />
              </div>
              <Button
                type="submit"
                disabled={isPending}
                className={`${THEME_CONSTANTS.flex.center} gap-2 px-6 py-3 rounded-xl bg-primary-700 hover:bg-primary-700/90 text-white font-semibold text-sm min-h-0 border-0 shadow-none active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed shrink-0`}
              >
                <Send className="w-4 h-4" />
                {t("newsletter.subscribe")}
              </Button>
            </div>
            {errors.email && (
              <Text
                size="sm"
                className="text-red-500 dark:text-red-400 mt-2 text-center"
              >
                {errors.email.message}
              </Text>
            )}
          </form>
        )}

        <Text size="xs" className="text-zinc-400 dark:text-zinc-500 mt-4">
          {t("newsletter.privacyNote")}{" "}
          <TextLink
            href={ROUTES.PUBLIC.PRIVACY}
            className="underline underline-offset-2 hover:text-primary"
          >
            Privacy Policy
          </TextLink>
          .
        </Text>
      </div>
    </Section>
  );
}
