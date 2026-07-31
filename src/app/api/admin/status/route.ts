import { NextResponse } from "next/server";
import { labelForFile } from "@/lib/cms/registry";
import { CmsError, cmsMode, draftStatus } from "@/lib/github";

/** Drives the pending badge + publish bar in the admin UI. */
export async function GET() {
  const mode = cmsMode();
  if (mode === "unconfigured") {
    return NextResponse.json({ mode, pending: 0, items: [] });
  }
  try {
    const status = await draftStatus();
    return NextResponse.json({
      mode: status.mode,
      pending: status.aheadBy,
      items: status.files.map((file) => ({ file, label: labelForFile(file) })),
    });
  } catch (err) {
    const message =
      err instanceof CmsError ? err.message : "Could not load draft status.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
