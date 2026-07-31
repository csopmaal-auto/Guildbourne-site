"use client";

import Link from "next/link";
import { ArrowRight, HardDrive, TriangleAlert } from "lucide-react";
import { PublishBar } from "@/components/admin/PublishBar";
import { useCmsStatus } from "@/components/admin/StatusProvider";
import { collections } from "@/lib/cms/registry";

const GROUPS = ["Site", "Pages", "Directory & stories"] as const;

export default function AdminDashboard() {
  const { status } = useCmsStatus();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Everything on the website is edited from here. Saves go to a draft —
          nothing is live until you publish.
        </p>
      </div>

      {status?.mode === "local" ? (
        <div className="flex items-start gap-3 rounded-lg border bg-card p-4 text-sm">
          <HardDrive className="mt-0.5 size-4 shrink-0 text-bronze" />
          <p className="text-muted-foreground">
            <span className="font-semibold text-foreground">Local mode.</span>{" "}
            GitHub publishing isn&rsquo;t configured, so saves write straight to the
            content files on disk. Set{" "}
            <code className="rounded bg-stone px-1">GITHUB_TOKEN</code> and{" "}
            <code className="rounded bg-stone px-1">GITHUB_REPO</code> to enable
            the draft → publish workflow.
          </p>
        </div>
      ) : null}
      {status?.mode === "unconfigured" ? (
        <div className="flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm">
          <TriangleAlert className="mt-0.5 size-4 shrink-0 text-destructive" />
          <p className="text-muted-foreground">
            <span className="font-semibold text-foreground">
              CMS not configured.
            </span>{" "}
            Set <code className="rounded bg-stone px-1">GITHUB_TOKEN</code> and{" "}
            <code className="rounded bg-stone px-1">GITHUB_REPO</code> in the
            hosting environment to enable editing. The public site is unaffected.
          </p>
        </div>
      ) : null}
      {status?.error ? (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-muted-foreground">
          {status.error}
        </div>
      ) : null}

      <PublishBar />

      {GROUPS.map((group) => (
        <section key={group}>
          <h2 className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
            {group}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {collections
              .filter((c) => c.group === group)
              .map((c) => (
                <Link
                  key={c.id}
                  href={c.editPath ?? `/admin/${c.id}`}
                  className="group rounded-lg border bg-card p-4 transition-all hover:border-gold/60 hover:shadow-sm focus-gold"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold">{c.label}</h3>
                    <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-bronze" />
                  </div>
                  <p className="mt-1 text-[13px] leading-snug text-muted-foreground">
                    {c.description}
                  </p>
                </Link>
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}
