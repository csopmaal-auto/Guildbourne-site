import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { buildMetadata } from "@/lib/seo";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = buildMetadata("/");

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-GB" className={manrope.variable}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
