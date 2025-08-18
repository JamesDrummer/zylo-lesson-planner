import type { Metadata } from "next";
import { Nunito, Bree_Serif } from "next/font/google";
import "./globals.css";
import GlobalLoadingOverlay from "@/components/GlobalLoadingOverlay";

// Map Zylo-friendly fonts onto CSS variables consumed by globals.css
const zyloSans = Nunito({
  variable: "--font-zylo-sans",
  subsets: ["latin"],
  weight: ["300", "400", "600", "700", "800"],
});

const zyloDisplay = Bree_Serif({
  variable: "--font-zylo-display",
  subsets: ["latin"],
  weight: ["400"],
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
      <body className={`${zyloSans.variable} ${zyloDisplay.variable} antialiased min-h-screen`}>
        <div style={{ minHeight: "100vh", backgroundImage: "linear-gradient(180deg, rgba(166,76,244,0.06), rgba(233,30,99,0.04) 30%, rgba(255,193,7,0.04))" }}>
          <div className="mx-auto max-w-4xl p-4 sm:p-6 md:p-10">{children}</div>
        </div>
        <GlobalLoadingOverlay />
      </body>
    </html>
  );
}
