import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import ReduxProvider from "@/components/ReduxProvider";
import { QueryProvider } from "@/providers/QueryProvider";
import ErrorBoundary from "@/components/ErrorBoundary";
<meta name="apple-mobile-web-app-title" content="Trivia Spirit" />
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "trivia spirit - Trivia Game",
  description: "A modern trivia game with categories and team competition",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <QueryProvider>
          <ReduxProvider>
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </ReduxProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
