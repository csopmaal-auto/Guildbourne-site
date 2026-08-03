import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { NewsExplorer } from "@/components/sections/news/NewsExplorer";
import { newsByDate, pages } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata("/news");
export const dynamic = "force-static";

export default function NewsPage() {
  return (
    <>
      <PageHeader content={pages.news} />
      <div className="bg-white">
        <NewsExplorer articles={newsByDate} />
      </div>
    </>
  );
}
