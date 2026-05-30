import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Lora } from "next/font/google";
import "./globals.css";
import { SWRegister } from "@/components/SWRegister";
import { InstallPrompt } from "@/components/InstallPrompt";
import { AmbientMotif } from "@/components/AmbientMotif";
import { RippleEffect } from "@/components/RippleEffect";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
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
  themeColor: "#0e0e10",
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
      className={`${geistSans.variable} ${geistMono.variable} ${lora.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col relative">
        <AmbientMotif />
        <RippleEffect />
        <SWRegister />
        <InstallPrompt />
        <div className="relative z-[1] flex flex-col min-h-full">{children}</div>
      </body>
    </html>
  );
}
