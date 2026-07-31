import type { Metadata } from "next";
import { DirectoryExplorer } from "@/components/sections/stores/DirectoryExplorer";
import {
  pages,
  settings,
  storeCategories,
  storesAlphabetical,
} from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata("/stores");
export const dynamic = "force-static";

export default function StoresPage() {
  return (
    <DirectoryExplorer
      header={pages.stores}
      stores={storesAlphabetical}
      categories={storeCategories}
      hours={settings.hours}
    />
  );
}
