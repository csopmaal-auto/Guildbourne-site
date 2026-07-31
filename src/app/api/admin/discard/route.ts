import { NextResponse } from "next/server";
import { CmsError, cmsMode, discardDraft } from "@/lib/github";

export async function POST() {
  if (cmsMode() === "local") {
    return NextResponse.json({
      discarded: false,
      message: "Local mode — saves apply directly, so there are no drafts to discard.",
    });
  }
  try {
    const result = await discardDraft();
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof CmsError ? err.message : "Discard failed.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
