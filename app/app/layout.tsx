import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-display",
});

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const title = "Distro — Clip it. Spread it. Get paid.";
const description =
  "The onchain clipping marketplace. Projects fund reward pools, clippers earn USDC for reach. Live on Arc Testnet.";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  openGraph: {
    type: "website",
    siteName: "Distro",
    title,
    description,
    url: "/",
    images: [
      { url: "/distro-metadata.png", width: 1382, height: 744, alt: "Distro — Distribution is everything." },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/distro-metadata.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
