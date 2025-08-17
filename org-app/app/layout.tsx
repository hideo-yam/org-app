import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "好みの日本酒探し - あなたにぴったりの日本酒診断",
  description: "簡単な質問に答えて、あなたの好みに合う日本酒を見つけましょう。初心者でも安心の診断機能で、最適な日本酒をご提案します。",
  keywords: ["日本酒", "診断", "おすすめ", "初心者", "好み", "選び方"],
  openGraph: {
    title: "好みの日本酒探し",
    description: "簡単診断であなたにぴったりの日本酒を発見",
    type: "website",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
    title: "好みの日本酒探し",
    description: "簡単診断であなたにぴったりの日本酒を発見",
  },
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
