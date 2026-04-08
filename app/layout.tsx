import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "PlaceMe",
  description: "Create AI travel photos of yourself anywhere in the world.",
  applicationName: "PlaceMe",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PlaceMe",
  },
  icons: {
    icon: [{ url: "/icon.png?v=brand-v2", sizes: "512x512", type: "image/png" }],
    shortcut: [{ url: "/icon.png?v=brand-v2", sizes: "512x512", type: "image/png" }],
    apple: [
      {
        url: "/icons/apple-touch-icon-v2.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  manifest: "/manifest.webmanifest?v=brand-v2",
  openGraph: {
    title: "PlaceMe",
    description: "Build your personal profile library and generate destination photo sets.",
    siteName: "PlaceMe",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#ebe1ff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${cormorant.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-[var(--surface-base)] text-[var(--ink-strong)]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
