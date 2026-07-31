import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { StatusProvider } from "@/components/admin/StatusProvider";

export const metadata: Metadata = {
  title: "Guildbourne CMS",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StatusProvider>
      <AdminShell>{children}</AdminShell>
    </StatusProvider>
  );
}
