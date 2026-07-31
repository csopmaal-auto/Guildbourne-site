/**
 * Development-only inbox: appends form submissions to git-ignored JSON files
 * under .data/ so contact + newsletter flows are testable without external
 * services. Never used in production.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

export async function appendJsonRecord(
  filename: string,
  record: unknown,
): Promise<void> {
  const dir = join(process.cwd(), ".data");
  await mkdir(dir, { recursive: true });
  const path = join(dir, filename);
  let list: unknown[] = [];
  try {
    list = JSON.parse(await readFile(path, "utf8")) as unknown[];
  } catch {
    // First record — file doesn't exist yet.
  }
  list.push(record);
  await writeFile(path, `${JSON.stringify(list, null, 2)}\n`, "utf8");
}
