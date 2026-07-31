import { NextResponse } from "next/server";
import { labelForFile } from "@/lib/cms/registry";
import { CmsError, cmsMode, publishDraft } from "@/lib/github";

export async function POST() {
  if (cmsMode() === "local") {
    return NextResponse.json({
      published: false,
      message:
        "Local mode — saves apply directly to the files, so there's nothing to publish.",
    });
  }
  try {
    const result = await publishDraft();
    if (!result.published) {
      return NextResponse.json({
        published: false,
        message: "Nothing to publish.",
      });
    }
    return NextResponse.json({
      published: true,
      count: result.files.length,
      items: result.files.map((file) => ({ file, label: labelForFile(file) })),
    });
  } catch (err) {
    if (err instanceof CmsError && err.status === 409) {
      return NextResponse.json(
        {
          error:
            "Publish hit a merge conflict — production changed outside the CMS. Discard drafts or resolve the conflict in Git, then try again.",
        },
        { status: 409 },
      );
    }
    const message = err instanceof CmsError ? err.message : "Publish failed.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
