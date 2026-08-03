import type { Metadata } from "next";
import { Baloo_2 } from "next/font/google";
import "./globals.css";
import { buildMetadata } from "@/lib/seo";

const baloo = Baloo_2({
  variable: "--font-baloo",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = buildMetadata("/");

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-GB" className={baloo.variable}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
