import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
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

// Admin is never indexed, regardless of the staging/production flag.
export const metadata: Metadata = {
  title: {
    default: "Admin",
    template: "%s | Zedonwellness Admin",
  },
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hu">
      <body className={`${inter.variable} ${manrope.variable} bg-paper-muted antialiased`}>
        {children}
      </body>
    </html>
  );
}
