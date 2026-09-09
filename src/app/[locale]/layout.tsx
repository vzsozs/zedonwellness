import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { GrillThemeProvider } from "@/lib/grill-theme-context";
import { CartProvider } from "@/lib/cart-context";
import { CurrencyProvider } from "@/lib/currency-context";
import { ContactModalProvider } from "@/lib/contact-modal-context";
import { getEurHufRate } from "@/lib/settings";
import { alternatesFor, IS_STAGING, SITE_URL } from "@/lib/seo";
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  return {
    // Without this, every relative Open Graph image resolves against the
    // build host instead of the real domain.
    metadataBase: new URL(SITE_URL),
    title: {
      default: t("defaultTitle"),
      template: `%s | Zedonwellness`,
    },
    description: t("defaultDescription"),
    alternates: alternatesFor("/", locale),
    openGraph: {
      type: "website",
      siteName: "Zedonwellness",
      locale: locale === "en" ? "en_US" : "hu_HU",
    },
    robots: IS_STAGING
      ? { index: false, follow: false }
      : { index: true, follow: true },
    icons: {
      icon: "/favico.png",
      apple: "/webclip.png",
    },
  };
}

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
    <html lang={locale} suppressHydrationWarning>
      <head>
        {/* Applies the grill dark theme before the first paint on
            /grillek routes. Product pages under /termek do the same via
            <GrillTheme>, which knows the product's category. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var p=location.pathname.replace(/^\\/en(?=\\/|$)/,"")||"/";if(p==="/grillek"||p.indexOf("/grillek/")===0)document.documentElement.classList.add("dark-theme")}catch(e){}})()`,
          }}
        />
      </head>
      <body className={`${inter.variable} ${manrope.variable} antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <CurrencyProvider eurHufRate={eurHufRate}>
            <CartProvider>
              <GrillThemeProvider>
                <ContactModalProvider>
                  <SiteHeader />
                  {children}
                  <SiteFooter />
                </ContactModalProvider>
              </GrillThemeProvider>
            </CartProvider>
          </CurrencyProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
