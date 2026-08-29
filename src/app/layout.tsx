import type { Metadata } from "next";
import { Newsreader, Source_Sans_3 } from "next/font/google";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap",
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Home Learning",
    template: "%s · Home Learning",
  },
  description:
    "Short parent briefings and kitchen-table packs for Key Stage 1, starting with Year 1 maths in England.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB">
      <body className={`${newsreader.variable} ${sourceSans.variable} min-h-screen antialiased`}>
        <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-5 pb-16 pt-6 sm:px-8">
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
