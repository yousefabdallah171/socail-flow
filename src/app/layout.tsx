import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "SocialFlow - AI-Powered Social Media Management (100% Free)",
  description: "Manage all your social media accounts in one place with AI-powered content generation. Completely free during MVP phase - no credit card required!",
  keywords: [
    "social media management",
    "AI content generation",
    "marketing automation",
    "free social media tools",
    "content scheduling",
    "social media analytics",
  ],
  authors: [{ name: "SocialFlow Team" }],
  creator: "SocialFlow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://socialflow.app",
    title: "SocialFlow - AI-Powered Social Media Management",
    description: "Completely free AI-powered social media management platform for marketing agencies and businesses.",
    siteName: "SocialFlow",
  },
  twitter: {
    card: "summary_large_image",
    title: "SocialFlow - AI-Powered Social Media Management",
    description: "Completely free AI-powered social media management platform for marketing agencies and businesses.",
    creator: "@socialflow",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#3b82f6" />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
