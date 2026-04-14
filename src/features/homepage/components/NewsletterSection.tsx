"use client";
// Thin adapter — form logic stays here; layout lives in @mohasinac/appkit
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { subscribeNewsletterAction } from "@/actions";
import { useMessage } from "@/hooks";
import { ROUTES } from "@/constants";
import { Input } from "@mohasinac/appkit/ui";
import { TextLink } from "@/components";
import { Text, Button } from "@mohasinac/appkit/ui";
import { NewsletterSection as AppkitNewsletterSection } from "@mohasinac/appkit/features/homepage";

const schema = z.object({ email: z.string().email() });
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
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormValues) =>
      subscribeNewsletterAction({ email: data.email, source: "homepage" }),
    onSuccess: () => {
      setSubscribed(true);
      reset();
    },
    onError: (err: Error) => showError(err.message),
  });

  return (
    <AppkitNewsletterSection
      title={t("newsletter.title")}
      subtitle={t("newsletter.subtitle")}
      privacyLabel={t("newsletter.privacy")}
      privacyHref={ROUTES.PUBLIC.PRIVACY}
      renderForm={() =>
        subscribed ? (
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
          <form onSubmit={handleSubmit((d) => mutate(d))} noValidate>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <div className="flex-1">
                <Input
                  {...register("email")}
                  type="email"
                  placeholder={t("newsletter.placeholder")}
                  className="w-full"
                />
                {errors.email && (
                  <Text size="xs" className="text-red-500 mt-1">
                    {t("newsletter.emailError")}
                  </Text>
                )}
              </div>
              <Button
                type="submit"
                variant="primary"
                disabled={isPending}
                className="rounded-full px-6 py-2.5 font-semibold bg-primary-600 hover:bg-primary-700 active:bg-primary-800 dark:bg-secondary-500 dark:hover:bg-secondary-400 dark:active:bg-secondary-600 text-white dark:text-white shadow-[0_10px_24px_-12px_rgba(34,197,94,0.7)] dark:shadow-[0_10px_24px_-12px_rgba(236,72,153,0.9)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 dark:focus-visible:ring-secondary-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
              >
                {isPending ? t("newsletter.sending") : t("newsletter.cta")}
              </Button>
            </div>
          </form>
        )
      }
    />
  );
}
