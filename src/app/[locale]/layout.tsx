import type { ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { ToastProvider } from "@mohasinac/appkit";
import {
  BottomActionsProvider,
  DashboardNavProvider,
  LayoutClient,
  SkipToMain,
} from "@mohasinac/appkit";
import { SessionProvider, ThemeProvider } from "@mohasinac/appkit/client";
import { ZodSetup } from "@mohasinac/appkit";
import LayoutShellClient from "./LayoutShellClient";
import { LOCALE_CONFIG } from "@/constants";
import { resolveLocale } from "@/i18n/resolve-locale";

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function Layout({ children, params }: Props) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
      timeZone={LOCALE_CONFIG.TIMEZONE}
      now={new Date()}
    >
      <SkipToMain />
      <ZodSetup />
      <ThemeProvider>
        <SessionProvider initialUser={null}>
          <ToastProvider position="top-right">
            <BottomActionsProvider>
              <DashboardNavProvider>
                <LayoutClient>
                  <LayoutShellClient>{children}</LayoutShellClient>
                </LayoutClient>
              </DashboardNavProvider>
            </BottomActionsProvider>
          </ToastProvider>
        </SessionProvider>
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}