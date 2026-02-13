import type { Metadata, Viewport } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { PWARegister } from "@/components/pwa-register";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://moneyglow.app"),
  title: {
    default: "MoneyGlow — Your Financial Glow-Up Starts Here",
    template: "%s | MoneyGlow",
  },
  description:
    "Free financial literacy app for young Filipino digital creators. Budget, track income, get AI money advice.",
  icons: { icon: "/icons/icon-192.png", apple: "/icons/icon-192.png" },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "MoneyGlow",
  },
  openGraph: {
    type: "website",
    locale: "en_PH",
    url: "https://moneyglow.app",
    siteName: "MoneyGlow",
    title: "MoneyGlow — Your Financial Glow-Up Starts Here",
    description:
      "Free financial literacy app for young Filipino digital creators. Budget, track income, get AI money advice.",
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "MoneyGlow — Financial Literacy for Filipino Creators",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MoneyGlow — Your Financial Glow-Up Starts Here",
    description:
      "Free financial literacy app for young Filipino digital creators. Budget, track income, get AI money advice.",
    images: ["/og-default.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0D0D0D",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${dmSans.variable} ${playfair.variable} antialiased`}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-lg focus:bg-mg-pink focus:px-4 focus:py-2 focus:text-white focus:text-sm focus:font-medium"
        >
          Skip to content
        </a>
        {children}
        <Toaster richColors position="top-center" />
        <PWARegister />
      </body>
    </html>
  );
}
