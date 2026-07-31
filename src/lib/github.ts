/**
 * Git-backed content store.
 *
 * All CMS reads/writes go through here. Two drivers:
 *
 *  - **github** — the production path from the CMS blueprint. Reads/writes the
 *    content JSON on the DRAFT branch via the GitHub Contents API; publishing
 *    merges draft → production (the only action that triggers a build).
 *    Draft commits carry "[skip ci]" as a backstop.
 *
 *  - **local** — development fallback when GitHub env vars are absent. Reads
 *    and writes the files directly on disk so the admin area is fully usable
 *    locally; there is no draft/publish cycle (saves apply immediately).
 *
 * The public site never calls this module — it imports the JSON at build time.
 */

const GITHUB_API = "https://api.github.com";

const env = () => ({
  token: process.env.GITHUB_TOKEN ?? "",
  repo: process.env.GITHUB_REPO ?? "",
  branch: process.env.GITHUB_BRANCH || "main",
  draft: process.env.GITHUB_DRAFT_BRANCH || "cms-draft",
});

export type CmsMode = "github" | "local" | "unconfigured";

export function cmsMode(): CmsMode {
  const { token, repo } = env();
  if (token && repo) return "github";
  if (process.env.NODE_ENV !== "production") return "local";
  return "unconfigured";
}

export class CmsError extends Error {
  status: number;
  constructor(message: string, status = 500) {
    super(message);
    this.status = status;
  }
}

/* ————— GitHub REST helpers ————— */

async function api<T = unknown>(
  path: string,
  init?: RequestInit & { allow404?: boolean },
): Promise<T> {
  const { token } = env();
  const res = await fetch(`${GITHUB_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
    cache: "no-store",
  });
  if (res.status === 404 && init?.allow404) return null as T;
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new CmsError(
      `GitHub ${init?.method ?? "GET"} ${path} → ${res.status}: ${body.slice(0, 300)}`,
      res.status,
    );
  }
  return (await res.json()) as T;
}

const repoPath = (p: string) => {
  const { repo } = env();
  return `/repos/${repo}/${p}`;
};

export async function getBranchSha(branch: string): Promise<string> {
  const data = await api<{ object: { sha: string } }>(
    repoPath(`git/ref/${encodeURIComponent(`heads/${branch}`)}`),
  );
  return data.object.sha;
}

async function resetBranchTo(branch: string, sha: string): Promise<void> {
  await api(repoPath(`git/refs/${encodeURIComponent(`heads/${branch}`)}`), {
    method: "PATCH",
    body: JSON.stringify({ sha, force: true }),
  });
}

/** Create the draft branch from production if it doesn't exist (idempotent). */
export async function ensureDraftBranch(): Promise<void> {
  const { branch, draft } = env();
  const existing = await api<{ object: { sha: string } } | null>(
    repoPath(`git/ref/${encodeURIComponent(`heads/${draft}`)}`),
    { allow404: true },
  );
  if (existing) return;
  const mainSha = await getBranchSha(branch);
  await api(repoPath(`git/refs`), {
    method: "POST",
    body: JSON.stringify({ ref: `refs/heads/${draft}`, sha: mainSha }),
  });
}

/* ————— Local driver ————— */

async function localRead(path: string): Promise<{ data: unknown; sha: string }> {
  const { readFile } = await import("node:fs/promises");
  const { join } = await import("node:path");
  const raw = await readFile(join(process.cwd(), path), "utf8");
  return { data: JSON.parse(raw), sha: "local" };
}

async function localWriteText(path: string, text: string): Promise<void> {
  const { writeFile, mkdir } = await import("node:fs/promises");
  const { join, dirname } = await import("node:path");
  const abs = join(process.cwd(), path);
  await mkdir(dirname(abs), { recursive: true });
  await writeFile(abs, text, "utf8");
}

async function localWriteBinary(path: string, base64: string): Promise<void> {
  const { writeFile, mkdir } = await import("node:fs/promises");
  const { join, dirname } = await import("node:path");
  const abs = join(process.cwd(), path);
  await mkdir(dirname(abs), { recursive: true });
  await writeFile(abs, Buffer.from(base64, "base64"));
}

/* ————— Public content-store API (blueprint surface) ————— */

function assertConfigured(): CmsMode {
  const mode = cmsMode();
  if (mode === "unconfigured") {
    throw new CmsError(
      "CMS is not configured — set GITHUB_TOKEN and GITHUB_REPO.",
      503,
    );
  }
  return mode;
}

/** Read + parse a JSON file from the draft branch (or disk in local mode). */
export async function getJsonFile(
  path: string,
): Promise<{ data: unknown; sha: string }> {
  const mode = assertConfigured();
  if (mode === "local") return localRead(path);

  await ensureDraftBranch();
  const { draft } = env();
  const file = await api<{ content: string; sha: string }>(
    repoPath(`contents/${encodePath(path)}?ref=${encodeURIComponent(draft)}`),
  );
  const text = Buffer.from(file.content, "base64").toString("utf8");
  return { data: JSON.parse(text), sha: file.sha };
}

export async function getFileSha(path: string): Promise<string | undefined> {
  const mode = assertConfigured();
  if (mode === "local") return "local";
  const { draft } = env();
  const file = await api<{ sha: string } | null>(
    repoPath(`contents/${encodePath(path)}?ref=${encodeURIComponent(draft)}`),
    { allow404: true },
  );
  return file?.sha;
}

const encodePath = (p: string) => p.split("/").map(encodeURIComponent).join("/");

/** Commit pretty-printed JSON to the draft branch (or disk in local mode). */
export async function putJsonFile(
  path: string,
  data: unknown,
  sha: string | undefined,
  message: string,
): Promise<void> {
  const mode = assertConfigured();
  const text = `${JSON.stringify(data, null, 2)}\n`;
  if (mode === "local") return localWriteText(path, text);

  await ensureDraftBranch();
  const { draft } = env();
  await api(repoPath(`contents/${encodePath(path)}`), {
    method: "PUT",
    body: JSON.stringify({
      message: `${message} [skip ci]`,
      content: Buffer.from(text, "utf8").toString("base64"),
      branch: draft,
      ...(sha && sha !== "local" ? { sha } : {}),
    }),
  });
}

/** Commit a binary file (image upload) to the draft branch / disk. */
export async function putRawFile(
  path: string,
  base64: string,
  message: string,
): Promise<void> {
  const mode = assertConfigured();
  if (mode === "local") return localWriteBinary(path, base64);

  await ensureDraftBranch();
  const { draft } = env();
  const existingSha = await getFileSha(path);
  await api(repoPath(`contents/${encodePath(path)}`), {
    method: "PUT",
    body: JSON.stringify({
      message: `${message} [skip ci]`,
      content: base64,
      branch: draft,
      ...(existingSha && existingSha !== "local" ? { sha: existingSha } : {}),
    }),
  });
}

export type DraftStatus = {
  mode: CmsMode;
  aheadBy: number;
  files: string[];
};

/** What's saved to draft but not yet published. */
export async function draftStatus(): Promise<DraftStatus> {
  const mode = assertConfigured();
  if (mode === "local") return { mode, aheadBy: 0, files: [] };

  await ensureDraftBranch();
  const { branch, draft } = env();
  const compare = await api<{ ahead_by: number; files?: { filename: string }[] }>(
    repoPath(
      `compare/${encodeURIComponent(branch)}...${encodeURIComponent(draft)}`,
    ),
  );
  return {
    mode,
    aheadBy: compare.ahead_by,
    files: (compare.files ?? []).map((f) => f.filename),
  };
}

/**
 * Publish = merge draft → production (a merge commit, which builds), then
 * resync the draft branch to the new production tip so pending returns to 0.
 * Never fast-forward production to the draft tip — that tip says [skip ci].
 */
export async function publishDraft(): Promise<{
  published: boolean;
  files: string[];
}> {
  const mode = assertConfigured();
  if (mode === "local") return { published: false, files: [] };

  const { branch, draft } = env();
  const status = await draftStatus();
  if (status.aheadBy === 0) return { published: false, files: [] };

  await api(repoPath(`merges`), {
    method: "POST",
    body: JSON.stringify({
      base: branch,
      head: draft,
      commit_message: `Publish ${status.files.length} content change(s) via CMS`,
    }),
  });
  const tip = await getBranchSha(branch);
  await resetBranchTo(draft, tip);
  return { published: true, files: status.files };
}

/** Discard all drafts — force-reset the draft branch to production. */
export async function discardDraft(): Promise<{ discarded: boolean }> {
  const mode = assertConfigured();
  if (mode === "local") return { discarded: false };

  const { branch, draft } = env();
  const tip = await getBranchSha(branch);
  await resetBranchTo(draft, tip);
  return { discarded: true };
}
