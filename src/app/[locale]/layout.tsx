import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CartProvider } from "@/lib/cart-context";
import { CurrencyProvider } from "@/lib/currency-context";
import { getEurHufRate } from "@/lib/settings";
import "../globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-display",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
  display: "swap",
});

const isStaging = process.env.NEXT_PUBLIC_STAGING_NOINDEX === "true";

export const metadata: Metadata = {
  title: {
    default: "Zedonwellness",
    template: "%s | Zedonwellness",
  },
  description:
    "Prémium jakuzzik, szaunák és grillek — tervezéstől a telepítésig.",
  robots: isStaging
    ? { index: false, follow: false }
    : { index: true, follow: true },
  icons: {
    icon: "/favico.png",
    apple: "/webclip.png",
  },
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  setRequestLocale(locale as Locale);
  const [messages, eurHufRate] = await Promise.all([getMessages(), getEurHufRate()]);

  return (
    <html lang={locale}>
      <body className={`${inter.variable} ${manrope.variable} antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <CurrencyProvider eurHufRate={eurHufRate}>
            <CartProvider>
              <SiteHeader />
              {children}
              <SiteFooter />
            </CartProvider>
          </CurrencyProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
