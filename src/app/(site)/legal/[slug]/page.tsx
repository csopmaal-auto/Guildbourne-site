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
      <header className="bg-white pt-32 sm:pt-36">
        <div className="container-narrow">
          <Reveal>
            <nav aria-label="Breadcrumb">
              <Link
                href="/"
                className="focus-brand inline-flex items-center gap-1.5 rounded-full bg-cream px-4 py-2 text-xs leading-none font-bold text-ink transition-colors hover:bg-sand"
              >
                <ArrowLeft className="size-3.5" aria-hidden /> Home
              </Link>
            </nav>
            <h1 className="heading-xl mt-8 text-ink">{page.title}</h1>
            <p className="mt-3 text-sm font-bold text-ink-soft">
              Last updated {formatDate(page.updated)}
            </p>
          </Reveal>
        </div>
      </header>
      <div className="bg-white py-10 sm:py-12">
        <div className="container-narrow">
          <Prose paragraphs={page.body} />
        </div>
      </div>
    </article>
  );
}
