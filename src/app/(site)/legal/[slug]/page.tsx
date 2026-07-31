import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Prose } from "@/components/ui/prose";
import { Reveal } from "@/components/motion/Reveal";
import { getLegalPage, legalPages } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { formatDate } from "@/utils/format";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return legalPages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const page = getLegalPage((await params).slug);
  if (!page) return {};
  return buildMetadata("/", {
    title: page.title,
    description: `${page.title} for the Guildbourne Centre website.`,
    path: `/legal/${page.slug}`,
  });
}

export default async function LegalPage({ params }: Params) {
  const page = getLegalPage((await params).slug);
  if (!page) notFound();

  return (
    <article>
      <header className="bg-charcoal bg-grain pt-32 pb-12 text-ivory sm:pt-40 sm:pb-14">
        <div className="container-narrow">
          <Reveal>
            <nav aria-label="Breadcrumb">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.22em] text-ivory/60 uppercase transition-colors hover:text-gold focus-gold"
              >
                <ArrowLeft className="size-3.5" aria-hidden /> Home
              </Link>
            </nav>
            <h1 className="heading-1 mt-8">{page.title}</h1>
            <p className="mt-4 text-sm text-ivory/60">
              Last updated {formatDate(page.updated)}
            </p>
          </Reveal>
        </div>
      </header>
      <div className="bg-ivory py-14 sm:py-16">
        <div className="container-narrow">
          <Prose paragraphs={page.body} />
        </div>
      </div>
    </article>
  );
}
