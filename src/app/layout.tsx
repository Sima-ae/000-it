import type { Metadata } from "next";
import { Figtree, Geist_Mono, Syne } from "next/font/google";
import "./globals.css";

const display = Syne({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const body = Figtree({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "TripleZero iT",
    template: "%s · TripleZero iT",
  },
  description: "AI-driven growth platform for modern businesses.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://000-it.com"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl" suppressHydrationWarning>
      <body className={`${display.variable} ${body.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
