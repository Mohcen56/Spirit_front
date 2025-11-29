import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next"
import ReduxProvider from "@/components/utils/ReduxProvider";
import { QueryProvider } from "@/providers/QueryProvider";
import ErrorBoundary from "@/components/utils/ErrorBoundary";
import { NotificationProvider } from "@/providers/NotificationProvider";
import { Analytics } from '@vercel/analytics/next';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap", // Add font-display: swap for better performance
  preload: true,
  fallback: ['system-ui', 'arial'],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap", // Add font-display: swap for better performance
  preload: true,
  fallback: ['monospace'],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://triviaspirit.com"),

  title: "Trivia Spirit – The Ultimate Trivia Game | Play, Compete & Learn Fast",
  description:
    "Play Trivia Spirit — the fun, fast, and modern trivia game with thousands of curated questions across history, tech, movies, geography, anime, science, sports, and more!",

  keywords: [
    "trivia game",
    "quiz game",
    "brain quiz",
    "knowledge game",
    "online trivia",
    "fun trivia",
    "quiz categories",
    "brainigo",
    "play trivia online",
    "fast trivia game",
    "smart quiz",
    "trivia challenges",
  ],

  authors: [{ name: "Mohcen" }],

  openGraph: {
    title: "Trivia Spirit – The Ultimate Trivia Game",
    description:
      "Challenge your mind with thousands of curated trivia questions across a wide range of categories. Play instantly — no downloads needed!",
    url: "https://triviaspirit.com",
    siteName: "Trivia Spirit",
    images: [
      {
        url: "https://cdn.triviaspirit.com/og/trivia-spirit-og.png", // <-- put your real path here
        width: 1200,
        height: 630,
        alt: "Trivia Spirit Game Cover",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Trivia Spirit – The Ultimate Trivia Game",
    description:
      "Play Trivia Spirit — a fast and exciting trivia experience across dozens of categories!",
    images: ["https://cdn.triviaspirit.com/og/trivia-spirit-og.png"],
  },

  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr">
      <head>
        {/* Preconnect to Google Fonts for faster font loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <QueryProvider>
          <ReduxProvider>
            <ErrorBoundary>
              <NotificationProvider>
                {children}<SpeedInsights />
                 <Analytics />
              </NotificationProvider>
            </ErrorBoundary>
          </ReduxProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
