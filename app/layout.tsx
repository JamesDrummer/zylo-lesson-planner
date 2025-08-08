import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import GlobalLoadingOverlay from "@/components/GlobalLoadingOverlay";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Zylo Lesson Planner",
  description: "Plan engaging music lessons with songs, activities, and downloadable materials.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}>
        <div style={{ minHeight: "100vh", backgroundImage: "linear-gradient(135deg, rgba(33,150,243,0.08), rgba(255,193,7,0.08), rgba(233,30,99,0.08))" }}>
          <div className="mx-auto max-w-4xl p-4 sm:p-6 md:p-10">{children}</div>
        </div>
        <GlobalLoadingOverlay />
      </body>
    </html>
  );
}
