import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SWRegister } from "@/components/SWRegister";
import { InstallPrompt } from "@/components/InstallPrompt";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const description =
  "Japanese hymns shared with the world. A non-commercial, dark-mode viewer for public-domain hymn chord sheets — focused on Japanese translations of historic hymns.";
const ogImage = "/worship-chord/opengraph-image.svg";

export const metadata: Metadata = {
  metadataBase: new URL("https://emuzcode.github.io"),
  title: "worship-chord",
  description,
  icons: {
    apple: { url: "/worship-chord/apple-touch-icon.svg", type: "image/svg+xml" },
  },
  openGraph: {
    title: "worship-chord",
    description,
    type: "website",
    locale: "en_US",
    siteName: "worship-chord",
    images: [{ url: ogImage, width: 1200, height: 630, alt: "worship-chord" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "worship-chord",
    description,
    images: [ogImage],
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col">
        <SWRegister />
        <InstallPrompt />
        {children}
      </body>
    </html>
  );
}
