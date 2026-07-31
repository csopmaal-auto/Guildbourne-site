import { NextResponse } from "next/server";
import { CmsError, putRawFile } from "@/lib/github";
import { slugify } from "@/utils/slugify";

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const MAX_BYTES = 8 * 1024 * 1024;

/**
 * Image upload: optimise server-side (sharp, lazily imported with a raw
 * fallback so a native-module failure never blocks the save), then commit
 * under public/uploads/ and return the site-relative path for the editor
 * to store in content JSON.
 */
export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "no file provided" }, { status: 400 });
  }
  const ext = ALLOWED_TYPES[file.type];
  if (!ext) {
    return NextResponse.json(
      { error: "Only JPEG, PNG or WebP images are allowed." },
      { status: 415 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Image is too large (8 MB max)." },
      { status: 413 },
    );
  }

  let buffer = Buffer.from(await file.arrayBuffer());

  // Optimise: cap width, re-encode. Failure falls back to the original bytes.
  try {
    const sharp = (await import("sharp")).default;
    const pipeline = sharp(buffer).rotate().resize(2000, undefined, {
      withoutEnlargement: true,
    });
    buffer =
      ext === "png"
        ? await pipeline.png({ compressionLevel: 9 }).toBuffer()
        : ext === "webp"
          ? await pipeline.webp({ quality: 82 }).toBuffer()
          : await pipeline.jpeg({ quality: 82, mozjpeg: true }).toBuffer();
  } catch {
    // sharp unavailable — keep the raw upload.
  }

  const stamp = new Date().toISOString().slice(0, 7); // yyyy-mm
  const base = slugify(file.name.replace(/\.[^.]+$/, "")) || "image";
  const unique = Math.random().toString(36).slice(2, 8);
  const relPath = `public/uploads/${stamp}/${base}-${unique}.${ext}`;

  try {
    await putRawFile(
      relPath,
      buffer.toString("base64"),
      `CMS: upload ${base}.${ext}`,
    );
  } catch (err) {
    const message = err instanceof CmsError ? err.message : "Upload failed.";
    const status = err instanceof CmsError ? err.status : 500;
    return NextResponse.json({ error: message }, { status });
  }

  return NextResponse.json({ path: relPath.replace(/^public/, "") });
}
