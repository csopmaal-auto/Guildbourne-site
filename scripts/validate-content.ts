/**
 * Validates every content JSON file against its registry validator.
 * Run with: npm run validate:content
 * Exits non-zero if any collection fails — safe to wire into CI.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { collections } from "../src/lib/cms/registry";

let failed = false;

for (const col of collections) {
  const raw = readFileSync(join(process.cwd(), col.file), "utf8");
  const data = JSON.parse(raw);
  const result = col.validate(data);
  if (result.ok) {
    const count = Array.isArray(data) ? ` (${data.length} entries)` : "";
    console.log(`  ✓ ${col.id}${count}`);
  } else {
    failed = true;
    console.error(`  ✗ ${col.id}`);
    for (const error of result.errors) console.error(`      - ${error}`);
  }
}

if (failed) {
  console.error("\nContent validation failed.");
  process.exit(1);
}
console.log("\nAll content collections valid.");
