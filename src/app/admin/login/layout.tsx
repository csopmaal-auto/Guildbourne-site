import type { Metadata } from "next";

/**
 * The login page itself is a client component, so its metadata lives here.
 * Matches the panel layout: named for the tab, never indexed.
 */
export const metadata: Metadata = {
  title: "Sign in · Guildbourne CMS",
  robots: { index: false, follow: false },
};

export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
