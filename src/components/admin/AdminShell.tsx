"use client";

/**
 * The admin chrome: charcoal sidebar (collections grouped from the registry),
 * top bar with pending-changes badge, view-site link and a logout guard that
 * warns when unpublished drafts exist.
 */
import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ExternalLink, GitBranch, LayoutDashboard, LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { collections } from "@/lib/cms/registry";
import { cn } from "@/lib/utils";
import { useCmsStatus } from "./StatusProvider";

const GROUPS = ["Site", "Pages", "Directory & stories"] as const;

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { status } = useCmsStatus();
  const [navOpen, setNavOpen] = useState(false);
  const [logoutPrompt, setLogoutPrompt] = useState(false);

  const pending = status?.pending ?? 0;

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  const onLogoutClick = () => {
    if (pending > 0) setLogoutPrompt(true);
    else void logout();
  };

  const navItems = GROUPS.map((group) => ({
    group,
    items: collections.filter((c) => c.group === group),
  }));

  const linkFor = (id: string, editPath?: string) => editPath ?? `/admin/${id}`;

  return (
    <div className="flex min-h-dvh bg-stone">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-charcoal text-ivory transition-transform lg:static lg:translate-x-0",
          navOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-14 items-center justify-between border-b border-white/10 px-5">
          <Link href="/admin" className="focus-gold rounded-sm" onClick={() => setNavOpen(false)}>
            <span className="text-sm font-extrabold tracking-[0.18em]">GUILDBOURNE</span>
            <span className="ml-2 text-[10px] font-semibold tracking-[0.3em] text-gold">CMS</span>
          </Link>
          <button
            type="button"
            className="rounded p-1 text-ivory/70 hover:text-ivory lg:hidden focus-gold"
            onClick={() => setNavOpen(false)}
            aria-label="Close menu"
          >
            <X className="size-4" />
          </button>
        </div>
        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
          <SidebarLink
            href="/admin"
            active={pathname === "/admin"}
            onNavigate={() => setNavOpen(false)}
          >
            <LayoutDashboard className="size-4" /> Dashboard
          </SidebarLink>
          {navItems.map(({ group, items }) => (
            <div key={group}>
              <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-ivory/40">
                {group}
              </p>
              <div className="space-y-0.5">
                {items.map((c) => {
                  const href = linkFor(c.id, c.editPath);
                  const active =
                    pathname === href || pathname.startsWith(`${href}/`) ||
                    pathname.startsWith(`/admin/edit/${c.id}/`);
                  return (
                    <SidebarLink
                      key={c.id}
                      href={href}
                      active={active}
                      onNavigate={() => setNavOpen(false)}
                    >
                      {c.label}
                    </SidebarLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
        <div className="border-t border-white/10 p-3 text-[11px] text-ivory/50">
          {status?.mode === "local" ? (
            <p className="flex items-center gap-1.5">
              <GitBranch className="size-3.5 text-gold" /> Local mode — saves apply directly
            </p>
          ) : status?.mode === "github" ? (
            <p className="flex items-center gap-1.5">
              <GitBranch className="size-3.5 text-gold" /> Draft branch → publish to go live
            </p>
          ) : null}
        </div>
      </aside>
      {navOpen ? (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-30 bg-charcoal/50 lg:hidden"
          onClick={() => setNavOpen(false)}
        />
      ) : null}

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b bg-ivory/90 px-4 backdrop-blur-sm sm:px-6">
          <button
            type="button"
            className="rounded p-1.5 text-muted-foreground hover:text-foreground lg:hidden focus-gold"
            onClick={() => setNavOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </button>
          {pending > 0 ? (
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold text-bronze transition-colors hover:bg-gold/25 focus-gold"
            >
              <span className="size-1.5 rounded-full bg-bronze" />
              {pending} unpublished change{pending === 1 ? "" : "s"}
            </Link>
          ) : null}
          <div className="ml-auto flex items-center gap-1">
            <Button asChild variant="ghost" size="sm">
              <Link href="/" target="_blank">
                View site <ExternalLink className="size-3.5" />
              </Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={onLogoutClick}>
              <LogOut className="size-3.5" /> Log out
            </Button>
          </div>
        </header>
        <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6">
          {children}
        </main>
      </div>

      {/* Logout guard */}
      <Dialog open={logoutPrompt} onOpenChange={setLogoutPrompt}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unpublished changes</DialogTitle>
            <DialogDescription>
              You have {pending} saved change{pending === 1 ? "" : "s"} that{" "}
              {pending === 1 ? "hasn’t" : "haven’t"} been published
              yet. They&rsquo;ll keep waiting on the draft — publish from the
              dashboard when you&rsquo;re ready.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLogoutPrompt(false)}>
              Stay logged in
            </Button>
            <Button
              onClick={() => {
                setLogoutPrompt(false);
                void logout();
              }}
            >
              Log out anyway
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SidebarLink({
  href,
  active,
  onNavigate,
  children,
}: {
  href: string;
  active: boolean;
  onNavigate: () => void;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-2 rounded-md px-3 py-1.5 text-[13px] transition-colors focus-gold",
        active
          ? "bg-white/10 font-semibold text-ivory"
          : "text-ivory/65 hover:bg-white/5 hover:text-ivory",
      )}
    >
      {children}
    </Link>
  );
}
